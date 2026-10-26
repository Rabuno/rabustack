# rabustack

Agent skills for a plan, ship, test loop. Installable with the [`skills`](https://github.com/vercel-labs/skills) CLI.

## The loop

1. **Plan** - `adaptive-plan-mode` scales planning depth to what is at stake, with `interview` and `oryna` for open decisions and expensive forks.
2. **Ship** - `ship-pr` takes the branch through review, PR/MR creation and merge-and-sync, gated by `quality-gates`.
3. **Test** - `user-tester` drives the result in a real browser like a demanding user.

`self-improve` closes the loop by proposing fixes to the skills that caused friction.

## Skills

- **adaptive-plan-mode** - Plan before implementing; skips ceremony for trivial edits.
- **ship-pr** - Ships the current branch through its PR/MR life cycle on GitHub or GitLab.
- **user-tester** - Tests a web project end-to-end as a mystery-shopper user.
- **quality-gates** - CRAP and duplication gates on changed Python, Go and TypeScript code; mutation testing on request.
- **self-improve** - Reviews a finished run for friction and proposes a generalizable skill fix.
- **oryna** - Senior advisor that researches prior art and gives a committed verdict on hard-to-reverse decisions.
- **interview** - Asks one question at a time about open decisions, each with a recommended answer.

## Install

```
npx skills add Rabuno/rabustack
npx skills add Rabuno/rabustack --skill quality-gates -g -a claude-code -y
npx skills add Rabuno/rabustack --list
```

`adaptive-plan-mode` and `ship-pr` call the `code-review` skill, which is not bundled.

## License

MIT
