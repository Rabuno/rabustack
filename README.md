# rabustack

Agent skills installable with the [`skills`](https://github.com/vercel-labs/skills) CLI.

## Skills

- **quality-gates** - CRAP and duplication gates on changed Python, Go and TypeScript code; mutation testing on request.
- **server-handoff** - Move a Claude Code session and its folder to a server container so it keeps running while the laptop is off, and bring it back.

## Install

```
npx skills add Rabuno/rabustack --skill quality-gates -g -a claude-code -y
npx skills add Rabuno/rabustack --skill server-handoff -g -a claude-code -y
```

## License

MIT
