---
title: "从 Multica 的 Go 后端演进，看高级工程设计中的不变量、边界与证据"
description: "基于 Multica 的公开代码、PR 与评审记录，分析 Go 后端如何用唯一权威、资源所有权、语义兼容和可证伪测试，把隐含假设固化为长期成立的工程约束。"
slug: multica-go-backend-invariants
date: 2026-08-19T22:00:00+08:00
lastmod: 2026-08-19T22:00:00+08:00
image: cover.webp
categories:
    - 技术笔记
tags:
    - Go
    - 后端设计
    - 系统设计
    - 工程方法
    - Multica
comments: true
---

在 Multica 的 [#6594](https://github.com/multica-ai/multica/pull/6594) 中，一个安装请求最终返回了 `409 Conflict`。从接口结果看，它没有获得资源，也没有改变系统状态。

但在返回 409 之前，服务端已经使用请求携带的凭证连接外部平台。同一个 bot 只能维持一个订阅连接，于是合法连接所有者先被挤掉，数据库随后才发现资源属于别人并拒绝请求。

请求失败了，副作用却已经发生。

这类问题比一个明显的 500 更值得警惕。500 至少明确告诉调用方结果不可确认；而一个看起来合理的 200、409、`completed` 或 `coalesced`，更容易被误当成已经确认的事实。系统最危险的状态，往往不是报错，而是**它对外声称的结果与真实世界不一致**。

阅读 [Multica](https://github.com/multica-ai/multica) 的一组 Go 后端演进后，我把其中反复出现的方法概括为一句话：

> 高级工程设计的核心，是缩小系统能够“说谎”的状态空间：每个状态有唯一权威，每个成功都有事实凭据，每个边界都有明确所有者，每项保证都有可证伪的证据。

这里的“高级”不是代码更复杂，也不是使用更多锁、事务或抽象，而是能持续回答三个问题：

1. 系统必须守住什么**不变量**？
2. 应该由哪个**边界**维护它？
3. 什么**证据**足以证明它真的成立？

```mermaid
flowchart LR
    A["故障反例"] --> B["不变量<br/>什么绝不能发生"]
    B --> C["边界<br/>谁在不可逆点负责"]
    C --> D["证据<br/>怎样让旧实现稳定失败"]
    D --> E["项目规则<br/>把记忆变成约束"]
```

> [!NOTE] 资料范围
> 本文不是人物专访，也不是完整的贡献统计。为了观察相对稳定的工程模式，案例主要选自截至 2026 年 8 月 19 日由 [Bohan-J](https://github.com/Bohan-J) 主导实现，或由他留下实质评审并改变最终实现与测试的 Multica Go 后端变更。文中讨论的是公开 PR、提交和测试所体现的工程决策；“不变量驱动”等表述是本文归纳，不代表个人自述，也无法覆盖未公开的团队讨论。历史测试结果均按 PR 与 CI 记录转述；本文没有独立重跑这些历史测试或目标平台测试。

前两节讨论如何提出不变量，中间三节讨论谁在不可逆点维护它，最后一节讨论什么证据足以支撑这些保证。

## 不变量（一）：用减法保留唯一权威状态

一致性问题出现时，直觉通常是增加机制：多一列状态、多一份映射、多一道锁，再通过双写把它们同步起来。但有时更有效的做法，是先删除一份不必要的“事实”。

Multica 的自定义 Issue 状态经历过一条很有代表性的路线。

截至 2026 年 8 月 19 日仍处于 OPEN、未合并状态的早期提案 [#5505](https://github.com/multica-ai/multica/pull/5505)，计划引入 `status_id`，保留原有 `status` 兼容旧路径，并设计双写、回填、迁移链与两阶段 rollout gate。它试图一次覆盖状态目录、读写路径和 Autopilot 生命周期，最终涉及 132 个文件、超过一万行新增代码。

规模本身不能证明设计好坏，但它暴露了一个更根本的问题：即使提案规定 `status_id` 与 `status` 由同一 catalog row 双写，混合版本、回填前和异常部分写入仍要求系统定义 precedence，并扩大需要证明的发布组合。为了维持两份必须一致的持久表示，所有写路径、回填和降级路径都必须回答如何发现并修复分歧。

后来合并的 [#7065](https://github.com/multica-ai/multica/pull/7065) 选择了更小的模型：现有的 `issue.status TEXT` 继续做唯一权威；自定义状态只是一个新的 key，另用 `category` 表达它继承哪一种平台行为。七个 built-in status 本身就是七个 canonical category。

其中最关键的保证可以压缩成下面这段伪代码：

```go
if IsBuiltIn(status) {
    return status // identity, zero lookup
}
return resolveCustomCategory(status)
```

也就是说，新功能不能改变旧状态的含义，也不能让原来的热路径凭空多一次数据库查询。只有 custom key 才需要解析 category。这里的 category 不是第二份业务状态，而是一个**行为等价类**：两个状态只有在平台所有关键行为上相同，才能属于同一类。

减法没有消灭所有难题，只把难题缩小到了真正需要解决的地方。

- Go 路径通过 `Effective()` 解释行为，不代表 SQL 中直接判断 `status` 的查询自动正确，因此数据库侧还需要同语义的映射。
- #7065 最初的“确认没有 Issue 使用，再执行归档”仍然存在 TOCTOU；状态写入与归档必须共享锁域。
- 尚未完成 catalog seed 的 workspace 仍应接受七个旧状态，否则滚动发布期间旧 pod 创建的 workspace 会突然不可写。

后续 [#7084](https://github.com/multica-ai/multica/pull/7084) 删除了 in-use census，但保留同一把 shared/exclusive lock：它只保证 archive 与新的 custom-status assignment 不交错，不再尝试证明“归档时无人使用”。归档因此被收窄为“停止新的分配”，而不是迁移已经使用该状态的 Issue。旧值继续可读、可解释；新写入则被拒绝。这个定义同时减少了迁移风险，也保留了历史事实。

相关测试关注的并不是“新表能不能 CRUD”，而是 built-in 是否保持零查询、未 seed workspace 是否仍能写入、归档与写入的真实交错是否安全。实现见 [`issuestatus.go`](https://github.com/multica-ai/multica/blob/14c2e4e831e3658fe5df3d06b5f6dfe461ca78df/server/internal/issuestatus/issuestatus.go#L178-L236)。

这条演进带来的普适经验是：

> 面对一致性问题，先问能否删除一个需要同步的状态。最便宜的双写修复，往往是不再双写。

## 不变量（二）：成功必须有凭据，而不是合理推测

如果一份状态可以减少到唯一权威，接下来的问题就是：系统在什么时候有资格宣称成功？

[#5958](https://github.com/multica-ai/multica/pull/5958) 最初看起来只是一个错误映射问题。agent 重命名撞上仍占用名称的 archived agent，或 mention task 并发入队撞上 pending-task unique index 时，底层都会产生约束冲突。前者应映射为 409；后者则应先转换成 typed duplicate signal，再由 dispatch resolver 判定 `coalesced`、`deferred` 或非成功结果。旧路径既可能把 constraint name 暴露给调用方，也会让上层逻辑依赖 driver error 中的 SQLSTATE 和 constraint 文本。

但 HTTP 状态正确，不代表业务结果正确。

假设两条 mention 并发为同一个 agent 入队。数据库唯一约束会决定一个 winner，另一个请求成为 loser。此时看到“已经有 active task”并不能证明 loser 的 comment 已经被处理：

- 失败请求对应的 comment 可能早于 winner task，因此不一定命中 completion reconcile 的 `comment.created_at > task.created_at` 窗口；若也没有登记 planned ID，系统就没有持久化证据保证它会被重放；
- queued task 和已经 claimed 的 task，能够安全接收新输入的方式不同；
- 不同 Git head 的任务不能随意合并，否则旧代码上的任务可能消费新代码请求；
- 多次 `SELECT` 得出的“它未来应该会被覆盖”只是一张快照，在任务完成前出现的新 blocker 可以让预测失效。

PR 的多轮修正最终让 lost-race 路径停止依据任务分类快照承诺 `deferred`；AlreadyPending 路径仍以既有 task 与 comment 的持久化时间关系，证明 completion reconcile 能够看见这条输入。成功条件由此收敛成一个更精确的不变量：

> 只有持久化状态足以证明 comment 已进入明确的当前处理路径，或处在 completion reconcile 的可见范围内时，handler 才能返回 `queued`、`coalesced` 或 `deferred`；lost-race 不能仅凭一次分类查询作出承诺。

不同结果需要不同的“完成凭据”：

| 对外声明 | 至少需要的事实凭据 |
| --- | --- |
| `queued` | 新 task row 已成功插入 |
| `coalesced` | comment 已通过原子更新合并到同一 Git head 的 queued task |
| `deferred` | lost-race 的 planned ID 已写入 claim-receipt task；或既有 active task 与 comment 的时间关系确定命中 reconcile window。后续 handoff 仍有已知的 best-effort 缺口 |

任务入队路径的 service 层只把特定数据库错误翻译成不泄漏驱动细节的 typed sentinel；handler 层拥有业务状态机，决定是原子合并、保存 planned input、创建新任务，还是明确失败。这里的“待履行义务”（obligation）指系统已经承诺后续处理、并且必须持久化交接的输入。初始 resolver 的边界见 [`comment.go`](https://github.com/multica-ai/multica/blob/49fd6cd08aafc57393c8d110c131ee6420ca3574/server/internal/handler/comment.go#L1543-L1687)，完成后的 [obligation propagation](https://github.com/multica-ai/multica/blob/49fd6cd08aafc57393c8d110c131ee6420ca3574/server/internal/handler/comment.go#L1954-L2015) 则负责继续尝试移交。

这套设计没有假装已经解决所有情况。若 different-head queued blocker 在初次入队判定时已经占据 slot，resolver 会收敛为非成功；但一个先前合理返回的 `deferred`，仍可能在 completion replay 时遇到后来出现的 different-head queued blocker。handoff 重试耗尽后只能记录 error，待履行义务仍可能没有被覆盖。这个已知缺口需要独立的 durable obligation record 才能闭环。

这里最值得迁移的不是某段 Go 分支，而是一种判断方式：**控制面的成功状态必须由数据面的证据支撑**。数据库写入、Git commit、操作系统 accounting 可以成为凭据；日志、内存标志和“按理说以后会完成”不能。

## 边界（一）：资源所有权是完整生命周期责任

前两节解决的是“系统承诺什么”；接下来要回答“谁在不可逆点负责兑现”。

“谁拥有资源”常被理解成“谁有权删除它”。但在并发后端里，资源所有权更像一份完整的生命周期协议：谁创建、谁隔离、谁保存产物、谁终止、谁确认终止，以及失败时谁保留现场。

Multica 中两个看似无关的问题——Git 工作目录隔离与 Windows 进程树回收——恰好展示了同一种结构。

### Worktree：不能把“agent 会只读”当成锁协议

`local_directory` 任务原本需要对用户目录加锁，因此多个任务会串行。一个看似简单的优化是换成共享读锁，但“agent 和 runtime 不会写文件”无法由锁本身保证；一旦任何进程写入，多个任务仍会互相污染。

[#6759](https://github.com/multica-ai/multica/pull/6759) 新增了 opt-in 的 worktree mode，默认仍保持 `in_place`。在该模式下，每个任务使用独立 Git worktree。真正困难的并不是执行 `git worktree add`，而是如何重建用户眼前的工作状态，同时保证失败不丢数据。

准备阶段使用 `git stash create` 捕获 tracked WIP。它创建 commit object，却不修改用户的 index、working tree 或 stash list；untracked 文件则在明确的数量和容量预算内复制。随后建立 baseline commit，用来区分用户原有修改与 agent 新产生的修改。

结束阶段的顺序更重要。daemon 通过 defer 顺序先执行 runtime-config 与 sidecar cleanup；cleanup 失败时用 `AbortWithReason` 标记 workspace，使随后执行的 `Finalize` 拒绝提交或移除 worktree。正常情况下则先提交 agent 剩余修改，确认交付 branch 包含产物后，才允许移除 worktree。如果仓库启用了 `commit.gpgSign` 而 daemon 没有签名能力，或者磁盘已满、ref 被锁，commit 会失败。此时实现保留并注册 worktree，在 task error 或 cancel acknowledgement 中返回路径，让用户能在 env-root GC 回收前恢复；它不是永久备份。相关流程见 [`PrepareLocalWorktree`](https://github.com/multica-ai/multica/blob/c9727e6b2bac2ffe0ca1541984144c0f2c63c1fc/server/internal/daemon/execenv/local_worktree.go#L130-L320) 与 [`Finalize`](https://github.com/multica-ai/multica/blob/c9727e6b2bac2ffe0ca1541984144c0f2c63c1fc/server/internal/daemon/execenv/local_worktree.go#L322-L414)。

这套方案的代价很明确：它只适用于 Git，增加了磁盘占用、清理逻辑和人工恢复成本；对 untracked 文件的复制也必须设上限。但这些限制是可以观察和处理的，而共享读锁依赖的是一个系统无法执行的承诺。

### Windows：杀掉 PID 不等于拥有进程树

在 [#6897](https://github.com/multica-ai/multica/pull/6897) 所覆盖的 Windows Codex backend 中，直接子进程可能只是 `.cmd` 对应的 `cmd.exe` wrapper，真正工作的 Node、app-server 和工具进程已经成为后代。只对 `cmd.Process` 发送终止信号，可能杀掉 wrapper，却留下完整的后台进程树。

该 PR 使用 Windows Job Object 建立进程树所有权：child 以 `CREATE_SUSPENDED` 启动，在它有机会创建后代之前先加入带 `JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE` 的 Job Object，然后才 resume。终止操作面向整个 Job，完成判断读取 Job accounting 中的 `ActiveProcesses`；只有它归零，cleanup 才获得正向凭据，而不是看到直接子进程退出就推断一切结束。

所有权以 `*exec.Cmd` 为 key，而不是容易被系统复用的 PID。Job assignment 失败时，若恢复 suspended process 成功，则告警并降级为 unowned；resume 失败则 kill/wait，整个启动失败。无论哪种情况，未取得 Job ownership 都不能把 cleanup 标记为 confirmed，也不能基于未证明的终态自动重试。启动与纳管见 [`proc_windows.go`](https://github.com/multica-ai/multica/blob/e7e01638ad878ac32892bfd3e0fd0835d6c65e77/server/pkg/agent/proc_windows.go#L80-L166)，终止与正向确认见 [同一文件](https://github.com/multica-ai/multica/blob/e7e01638ad878ac32892bfd3e0fd0835d6c65e77/server/pkg/agent/proc_windows.go#L203-L287)。

测试使用真实 grandchild，并要求 cleanup 后记录的 descendant PID 确实死亡。跨平台编译只能证明代码能构建，不能证明 Windows 内核对象的生命周期真的符合预期。所有权辅助函数位于共享层，但这次只接入 Codex；其他 agent backend 不在该 PR 的保证范围内。

两个案例共同说明：

> 一个组件如果无法证明最后一份产物仍然存在、所有子孙已经停止，就还没有真正拥有该资源的生命周期。

## 边界（二）：权限跟随真实资源，而不是角色等级

权限系统最容易写成一张角色等级表：工作区所有者大于管理员，管理员大于普通成员。但真实资源并不总服从组织层级。

[#6905](https://github.com/multica-ai/multica/pull/6905) 暴露了一个前后端不一致：UI 已经禁止工作区所有者或管理员选择另一位成员的 private runtime，服务端却因为工作区角色提前放行，使同一个操作仍可通过 API 或 CLI 完成。

private runtime 不是普通配置项。它代表某个人的机器、文件以及 AI 工具凭证。由此得到的授权不变量是：**工作区管理权不自动包含对成员计算环境的使用权**。

最终规则把不同能力拆开：

- private runtime 只有运行时所有者可以绑定到 agent；
- public runtime 才向工作区成员开放；
- 可见性只能由运行时所有者修改，否则管理员可以先把别人的机器公开，再绕过“仅所有者可操作”的限制；
- rename、delete 等组织管理动作仍可保留给管理员。

所有创建、更新、builder 和 onboarding 路径复用同一个后端 predicate，避免 UI 与 API 各维护一份规则。原样回传、实际没有变化的可见性被视为 no-op，防止 PATCH-as-PUT 客户端因为携带完整对象而突然收到 403。已经存在的旧绑定也没有在这次变更中追溯清理，选择阻止新的越界操作，而不以“修复权限”为名打断正在运行的任务。核心授权函数见 [`runtime.go`](https://github.com/multica-ai/multica/blob/6db6b235bac3539d7ddb8147be7ad1a44ab18400/server/internal/handler/runtime.go#L679-L718)。

“谁有权”仍只回答了一半问题。由 seacen 提交、经 Bohan-J blocking review 后修正的 WeCom 安装案例 [#6594](https://github.com/multica-ai/multica/pull/6594)，还要求回答：**什么时候必须完成授权判断？**

初版流程先对凭证执行外部 probe，再查询当前连接所有者。因为 probe 本身会建立唯一订阅连接，一个最终被拒绝的请求仍可能挤掉合法连接所有者。简单地交换两个函数也不够：如果“查所有者”和“执行 probe”之间没有序列化边界，两个安装事务仍可以同时通过检查。

最终实现以 `(channel_type, app_id)` 为对象获取 transaction advisory lock，在锁内读取连接所有者；冲突请求在外部调用前返回，只有可接管的 slot 才执行 probe，并在同一边界内完成 reclaim 和 upsert。只有平台文档明确的凭证错误映射为 400；限流、平台故障和未知码不能被猜成客户端错误，而是保守返回 503。评审中的具体并发反例见 [review 记录](https://github.com/multica-ai/multica/pull/6594#pullrequestreview-4885438794)，最终顺序见 [`installation.go`](https://github.com/multica-ai/multica/blob/02d06229db4cd880e470e9f7eb490aa4ad053723/server/internal/integrations/wecom/installation.go#L109-L239)。

这也有成本：数据库事务需要跨过一次网络 probe，竞争安装可能等待更久，未知平台错误也可能暂时拒绝一组有效凭证。但面对会排挤现有连接的全局唯一资源，延迟比“无权请求先动手、后道歉”更可控。

权限边界因此包含两个维度：谁拥有决定权，以及这个决定必须发生在什么不可逆副作用之前。

## 边界（三）：兼容性取决于旧消费者如何解释数据

即使单次请求的边界正确，混合版本发布仍可能让旧消费者看到另一种事实。

API 兼容性经常通过 schema diff 判断：只新增字段、不删除字段，就被视为向后兼容。但旧客户端不会阅读 schema，它只会按照旧代码解释收到的值。

[#7227](https://github.com/multica-ai/multica/pull/7227) 的目标，是减少 `task:message` 向 workspace 所有客户端广播所带来的渲染和缓存压力。一个直观优化是：超大的 `input/output` 只在 realtime payload 中裁剪，数据库和 REST 仍保留完整内容，同时增加 `truncated` 字段提醒新客户端补拉。

从 JSON 形状看，这只是新增字段。问题在于已安装的旧桌面客户端会忽略陌生的 `truncated`，却继续把裁剪后的 `input/output` 当成完整值；再叠加无限 stale 的缓存策略，这份残缺内容可能长期不再触发补拉。字段可以解析，原字段的语义却已经变了。

理想方案是按连接能力发送两种 payload，但当时 hub 没有保留可用于路由的 client capability，跨节点 relay 传播的又是已经序列化的 bytes。为了这次优化立刻引入两套 wire variant，会显著扩大协议复杂度。

最终选择先发布能够理解 `truncated` 的 reader，把 server clipping 放在配置开关后并默认关闭。等新客户端覆盖率足够，再由运维显式开启；需要回滚时也不必重新部署。裁剪带来的额外带宽收益不会随 merge 立即兑现；客户端侧的 cache gate 与批处理仍随新客户端发布生效。这是为旧客户端语义安全支付的成本。兼容性修正过程见 [PR 回复](https://github.com/multica-ai/multica/pull/7227#issuecomment-5340982102)，服务端开关旁也明确记录了这一 rollout 约束，见 [`daemon.go`](https://github.com/multica-ai/multica/blob/0c0baf050552da7442a3f05cd8b442770330579e/server/internal/handler/daemon.go#L4558-L4702)。

同一变更还包含另一类时间兼容问题。停止为未打开任务预建 cache 后，用户第一次打开一个仍在运行的任务，历史 fetch 和 realtime frame 会并发到达。如果 fetch 晚到后直接整数组替换，已经收到的 live seq 会消失；无限 stale 又可能让缺口永久保留。

修复没有在初次 fetch、backfill 和 realtime 三个入口分别拼补丁，而是让它们统一经过按 `seq` 合并的规则：相同 seq 以服务端完整 row 为准，响应没有提及的 live row 则继续保留。是否接纳实时帧也不依赖短暂的 observer count，而依赖 cache entry 是否仍存在；这会在最后一个 viewer 离开后多保留最多一个 `gcTime` 的尾部写入，却避免导航瞬间卸载造成不可恢复的丢帧。

因此，兼容性至少要检查四项：

| 维度 | 应检查的问题 |
| --- | --- |
| 语法 | 旧客户端能否解析新 payload？ |
| 语义 | 既有字段是否仍表达原来的含义？ |
| 时间 | fetch、backfill、realtime 乱序后是否仍得到同一事实？ |
| 发布 | 新服务端与旧客户端首先相遇时，哪一方负责保守？ |

“新增字段”只回答了第一项。

## 证据：测试必须能够推翻旧实现

测试全绿并不自动构成证据。更重要的问题是：测试经过了哪一层边界？如果删除生产调用链、恢复旧代码或让真实平台参与，它是否会因为目标问题而稳定失败？

### 从辅助函数性质到真实持久化路径

[#7124](https://github.com/multica-ai/multica/pull/7124) 处理 agent payload 中的 NUL。NUL 是合法 UTF-8，因此 `strings.ToValidUTF8` 不会删除它；但 PostgreSQL TEXT 和 JSONB 都拒绝这种内容，并且会给出不同的 SQLSTATE。在 `/complete` 等终态写入上，事务回滚会让 task 留在 `running`；若 runtime 持续在线，负责回收的两个 sweeper 都不会处理它，它可能长期占用并发槽。`/messages` 的失败后果不同：含 NUL 的消息不会持久化，而该 daemon 路径不会重试；但单次消息写入失败本身不证明 task 会长期卡住。

第一层证据是纯函数：`SanitizeTextForPostgres` 必须显式删除 NUL，同时把其他非法 UTF-8 替换成 U+FFFD；JSON 辅助函数还要递归处理 object key、value 和嵌套数组，并为深度设置上限。

但只测辅助函数不够。早期测试如果先手动调用 sanitizer，再直接执行数据库 query，即使 handler 根本忘了接线也会变绿。更有力的测试需要经过真实 HTTP handler：让 `encoding/json` 在 wire 上转义 NUL，decoder 重建它，生产代码清洗，最后写入 PostgreSQL。同时保留未清洗的反向对照，证明旧路径确实被数据库拒绝，而且 task 仍卡在 `running`。删除 handler 中的调用后，端到端测试应稳定复现原来的 500。

共享边界见 [`text.go`](https://github.com/multica-ai/multica/blob/d6301091e07b5272bd29d4955ab2b7d9f10c7573/server/internal/util/text.go#L53-L125)。代价是统一辅助函数会改变既有调用点对非法 UTF-8 的处理方式，已经卡住的历史 task 也没有在同一 PR 中顺便清理；入口防护与历史修复被有意拆开。

### 从正常路径到崩溃恢复窗口

[#7073](https://github.com/multica-ai/multica/pull/7073) 把证据推进到了迁移恢复。

`CREATE INDEX CONCURRENTLY` 被取消时，PostgreSQL 可能留下一个同名但 `INVALID` 的 index。重试若使用 `IF NOT EXISTS`，会因为名字已经存在而跳过创建，并把 migration 记录为成功；若使用裸 `CREATE`，则会因 `relation already exists` 永久卡住。

还存在第二个窗口：index 已经成功提交，但进程在写入 migration version 之前退出。下一次启动必须能够识别“对象有效，只是版本未记账”，而不是再次创建后失败。

新的策略分别处理两个窗口：migration 前置 hook 删除同名 INVALID index；迁移文件保留 `IF NOT EXISTS`，覆盖“index 已提交、version 未记录”的情况。更重要的是，cleanup 注册不再依赖每位作者记得填写，而是形成覆盖所有 concurrent-index migration 的 registry，并用 meta-test 扫描迁移目录。新增 migration 却漏注册时，测试直接失败。实现见 [`main.go`](https://github.com/multica-ai/multica/blob/1e1321a9c3312eda91e3022234660be054a7130f/server/cmd/migrate/main.go#L62-L105)、[cleanup hook](https://github.com/multica-ai/multica/blob/1e1321a9c3312eda91e3022234660be054a7130f/server/cmd/migrate/main.go#L244-L280) 与 [完整性测试](https://github.com/multica-ai/multica/blob/1e1321a9c3312eda91e3022234660be054a7130f/server/cmd/migrate/migrate_mul5999_index_retry_test.go#L77-L123)。

这份显式 registry 有维护成本，但 completeness test 把“请记住这条规则”升级成了可持续执行的仓库不变量。

### 从参数断言到真实操作系统边界

由 itsXuSt 提交的 [#7111](https://github.com/multica-ai/multica/pull/7111) 中，初版测试只检查拼出的 Windows PowerShell argv，却没有启动 PowerShell、npm shim 或 native child。这样的测试可以证明参数字符串符合预期，却完全无法证明 RPC response 会在 stdin EOF 之前返回，也无法证明 thinking metadata 能够到达调用方。

修正后的测试经过真实 PowerShell host、shim、native child 和 `discoverPiModelsRPC`，保持 stdin 打开，并要求 reasoning model 的 thinking metadata 已经可观察。[Bohan-J 首先指出](https://github.com/multica-ai/multica/pull/7111#pullrequestreview-4957363638)，只检查 argv 的 fake 没有覆盖 stdin EOF 这条真实协议边界；随后 [multica-eve 在另一轮评审中发现](https://github.com/multica-ai/multica/pull/7111#pullrequestreview-4957575837)，新增测试没有被 Windows CI 的 `-run` selector 选中。一份没有出现在目标 job 输出中的平台测试，不能因为它存在于仓库里就被视为证据。修正后，[Bohan-J 依据实际 CI 输出批准合并](https://github.com/multica-ai/multica/pull/7111#pullrequestreview-4958070040)；最终测试见 [`pi_stdin_windows_test.go`](https://github.com/multica-ai/multica/blob/0b9dcc6799cc4f3f3ff54a19b927e2d7c7853bf6/server/pkg/agent/pi_stdin_windows_test.go#L99-L160)。

可以把这些验证方式排列成一条证据阶梯：

| 层级 | 证明对象 | 仍然证明不了什么 |
| --- | --- | --- |
| 纯函数测试 | 局部规则本身 | 生产路径是否调用它 |
| 生产调用链 / handler 测试 | 真实入口已经接线 | 外部依赖的真实失败模式 |
| 数据库与进程集成测试 | 边界系统的实际行为 | 中断后能否恢复、目标平台是否执行 |
| 反向对照 / 变异验证 | 旧实现会因目标原因失败 | CI 是否真的选择该测试 |
| 目标平台 CI | 构建与运行路径都发生 | 生产长期指标是否达到预期 |

越靠下的证据越慢、越昂贵，所以并不是所有逻辑都需要端到端测试。关键是让测试层级与系统承诺匹配：纯函数用单测，数据库崩溃恢复窗口用真实 migration，Windows 进程语义就交给真实 Windows runner。

## 把不变量、边界与证据放进日常设计

这些案例并不构成一份“标准答案集”。有的方案用更长的事务换外部资源安全，有的以推迟性能收益换旧客户端兼容，有的用更多平台测试换真实证据。它们共同展示的不是零成本最佳实践，而是一套可以重复执行的设计过程：

```text
用户症状
→ 写出可观察的失败时间线
→ 找到唯一权威和资源所有者
→ 提炼可被反例击穿的不变量
→ 把约束放在第一次不可逆的边界
→ 用真实失败路径验证
→ 记录 rollout、代价与残余风险
```

在设计或评审一个 Go 后端变更时，可以先填写下面这张表：

| 不变量 | 边界 | 证据 |
| --- | --- | --- |
| 用户、其他租户或旧客户端绝不能观察到什么？ | 哪个不可逆点负责阻止它？ | 怎样让旧实现稳定失败？ |
| 哪一个对象是唯一事实源？ | 哪个事务、锁或协议维护它？ | 测试是否经过真实生产入口？ |
| `success`、`completed`、`deferred` 分别承诺什么事实？ | 谁负责资源的完整生命周期？ | 移除修复后，测试是否会因目标缺陷而失败？ |
| 未知错误应该失败、降级还是重试？ | 失败发生在 commit、header、外部调用还是进程启动前后？ | CI 是否实际选择并运行目标测试？ |
| 旧消费者必须保留什么行为？ | capability 在哪里协商？ | 是否覆盖 old-client/new-server 和目标平台？ |

这套方法不能保证工程师永远不遗漏问题。它的价值是让假设能够被说出来、被放到明确位置、被反例挑战，并在失败后留下可恢复的路径。

回到开头，`409` 本身只证明数据库拒绝了写入。只有授权判断位于外部 probe 之前，并由同一锁域关闭并发窗口，它才同时证明请求没有先触碰无权资源。不变量决定什么不能发生，边界决定谁负责阻止，证据决定我们凭什么相信。
