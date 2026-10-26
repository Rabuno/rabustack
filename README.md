# rabustack

Agent skills: plan, ship, test, and quality gates. A small collection of opinionated skills for AI coding agents, installable with the [`skills`](https://github.com/vercel-labs/skills) CLI.

## Skills

- **adaptive-plan-mode** - Plan before implementing. Skips ceremony for typo fixes and one-liners, forces a real plan before anything non-trivial.
- **ship-pr** - Ships the current branch through its full PR/MR life cycle: pre-PR review, PR creation, tracking, and merge-and-sync.
- **user-tester** - Tests a web project end-to-end by simulating a demanding real user (a "mystery shopper") in a browser before release.
- **grilling** - Interviews you one question at a time about a plan's open decisions. Vendored from [mattpocock/skills](https://github.com/mattpocock/skills) (`skills/productivity/grill-me`), (c) Matt Pocock.
- **self-improve** - Reviews a finished run for friction and proposes a generalizable fix to the skill that caused it.
- **quality-gates** - CRAP and duplication gates on changed Python, Go and TypeScript code (Uncle Bob's crapper and dryer); mutation testing only on request. Tool versions are pinned.

Agent: **oryna** - senior advisor for hard-to-reverse decisions; researches how major OSS projects settled the same question and delivers an evidence-backed verdict.

## Install

All skills:

```
npx skills add Rabuno/rabustack
```

One skill, globally, for Claude Code:

```
npx skills add Rabuno/rabustack --skill quality-gates -g -a claude-code -y
```

List what the repo offers without installing:

```
npx skills add Rabuno/rabustack --list
```

Claude Code plugin (adds the agent, slash commands and hooks as well):

```
/plugin marketplace add Rabuno/rabustack
/plugin install rabustack@rabustack
```

Codex loads the shared `skills/` through `.codex-plugin/plugin.json`.

## The planship loop

A methodology for shipping code with an AI coding agent: **plan it, ship it, test it**, in that order, every time.

**Without it:** "add retries to the payment call" turns into a 40-line change straight to `main` with no plan, no review, and no one clicking through the flow. The bug (retry on a non-idempotent charge) surfaces in production.

**With it:** `adaptive-plan-mode` investigates the call site first, flags the idempotency risk, and gets the plan reviewed before a line is written; `ship-pr` runs an independent Standards/Spec review on the diff before opening the PR; `user-tester` clicks through the retry path in a real browser before anyone else does.

1. **Plan** - `adaptive-plan-mode` scales planning depth to what is at stake. A typo fix skips ceremony; an irreversible schema change is investigated, grilled for open decisions, and reviewed first.
2. **Ship** - `ship-pr` takes the change through self-review, PR creation, and merge-and-sync on GitHub or GitLab.
3. **Test** - `user-tester` drives the shipped feature in a real browser like a skeptical user.

When the loop hits a decision it cannot resolve alone, `grilling` interviews you, and `oryna` researches precedent for expensive forks.

Each stage hands evidence to the next: a plan the review checks against, a diff the tests verify, a working build the user-tester interrogates.

### Modes

`/planship-mode [economy|normal|premium]` switches the model used by adaptive-plan-mode's plan-review agent and by `oryna`.

| Mode | Review agent | oryna |
|---|---|---|
| `economy` | `sonnet` | `sonnet` |
| `normal` (default) | `opus` | `opus` |
| `premium` | `opus`, effort/thinking max | `opus`, effort/thinking max |

State lives in `~/.claude/planship/mode.txt`; a `UserPromptSubmit` hook re-injects the mode each turn.

### Stats

`/planship-stats` prints a scoreboard from `~/.claude/planship/log.jsonl`: plans that correctly skipped ceremony, and independent reviews that caught findings before ship. Interrupted runs log nothing, so numbers undercount.

### External dependency

`adaptive-plan-mode` (Phase 8) and `ship-pr` (step 3) call the `code-review` skill. It is not bundled; install it separately.

## Structure

```
.claude-plugin/    Claude Code marketplace + plugin manifests (hooks wired here)
.codex-plugin/     Codex plugin manifest
agents/            oryna
commands/          /planship-mode, /planship-stats, /self-improve
hooks/             UserPromptSubmit hooks (Claude Code)
skills/            one folder per skill, each with SKILL.md
docs/agents/       issue-tracker, triage-label and domain notes
```

## License

MIT for original content. The `grilling` skill is vendored from a third party (see its credit above) and keeps its original terms.
