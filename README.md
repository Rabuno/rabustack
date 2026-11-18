# rabustack

Agent skills installable with the [`skills`](https://github.com/vercel-labs/skills) CLI.

## Skills

- **quality-gates** - before an MR/PR: CRAP and duplication gates, test review and mutation testing on changed Python, Go and TypeScript code (Stryker for C#).
- **verify** - Build, run and drive the app to confirm a change works on the running result, before each commit. Keeps a per-repo boot recipe in `docs/agents/run.md`.

## Install

```
npx skills add Rabuno/rabustack --skill quality-gates -g -a claude-code -y
npx skills add Rabuno/rabustack --skill verify -g -a claude-code -y
```

## License

MIT
