# VvV / Systems & Agents

Personal engineering notes on Go backend systems, production reliability, and Agent infrastructure.

The published site is available at [godvvvzzz.github.io](https://godvvvzzz.github.io/).

## Editorial scope

- Go runtime, memory, networking, and process lifecycle
- Incident analysis built around evidence and reproducible failure modes
- Agent runtime boundaries: tools, CLI processes, cancellation, and result protocols
- Architecture decisions where security, operability, and simplicity compete

Drafts and temporary notes remain in the repository with `draft: true`; only curated articles are included in the public build.

## Local development

The site uses Hugo and [Hugo Theme Stack](https://github.com/CaiJimmy/hugo-theme-stack) through Go modules.

```bash
hugo server -D
```

Production builds intentionally exclude drafts:

```bash
hugo --gc --minify
```

Pushes to `master` are built and deployed to GitHub Pages by GitHub Actions.
