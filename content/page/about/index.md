---
title: "About"
description: "关于这里关注的问题，以及文章如何形成。"
slug: "about"
menu:
    main:
        weight: 2
        params:
            icon: user
---

后端系统最有意思的部分，通常不在请求成功时，而在超时、取消、资源耗尽和部分失败发生之后。

这里主要记录三类问题：

- **Go 后端与运行时**：内存、并发、网络和进程生命周期；
- **可靠性工程**：如何从现象建立证据链，再把一次修复变成可重复验证的约束；
- **Agent Infrastructure**：当模型开始调用 CLI、工具和子进程，传统后端边界会发生什么变化。

Java 仍然是理解工程体系的重要坐标；Go 则更适合把调度、I/O 和资源所有权摆到台面上。Agent Runtime 把这些问题重新组合：一次任务既包含业务状态，也包含进程、凭据、工作目录、输出协议与取消策略。

文章不会追求覆盖所有知识点。一个问题如果值得记录，至少应该留下以下内容中的几项：

```text
异常与预期之间的矛盾
→ 可以排除假设的证据
→ 机制层解释
→ 方案之间的取舍
→ 能阻止问题回来的验证
```

近期的开源关注集中在 [Multica](https://github.com/multica-ai/multica) 的 Agent CLI 生命周期与可靠性，包括进程树回收、结果边界和确定性回归测试。相关改动可以从 [GitHub pull requests](https://github.com/multica-ai/multica/pulls?q=is%3Apr+author%3AGODVvVZzz) 直接追溯。

代码与其他记录位于 [GODVvVZzz](https://github.com/GODVvVZzz)。
