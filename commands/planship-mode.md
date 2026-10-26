---
description: Switch planship's model tier (economy/normal/premium) — only affects which model the adaptive-plan-mode review agent and the oryna agent use
argument-hint: "[economy|normal|premium]"
---

Set planship's model mode to `$ARGUMENTS` (default `normal` if empty; must be one of `economy`, `normal`, `premium` — if it's anything else, tell the user and stop).

1. Create the directory if needed and write the mode as a single line (no trailing newline needed, just the word) to `~/.claude/planship/mode.txt`.
2. Report back the mode set and what it changes:
   - `economy` — adaptive-plan-mode's Phase 6 plan-review agent and `oryna` both run on `sonnet`.
   - `normal` (default) — review agent and `oryna` both run on `opus`. Unchanged from planship's baseline behavior.
   - `premium` — review agent and `oryna` run on `opus` with effort/thinking pushed to max.

Note: `ship-pr`, `user-tester`, and `grilling` don't spawn a model-selectable agent, so this mode has no effect on them.
