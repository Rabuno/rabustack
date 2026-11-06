# rabustack

Agent skills installable with the [`skills`](https://github.com/vercel-labs/skills) CLI.

## Skills

- **quality-gates** - before an MR/PR: CRAP and duplication gates, test review and mutation testing on changed Python, Go and TypeScript code (Stryker for C#).

## Install

```
npx skills add Rabuno/rabustack --skill quality-gates -g -a claude-code -y
```

## License

MIT
