---
description: Review the recent run for planship friction and propose an improvement.
---

# Self-improve planship

Review the session just completed for friction caused by a planship skill or agent. Run this only when the user explicitly invokes `/self-improve`.

Read [`skills/self-improve-after-running.md`](../skills/self-improve-after-running.md) before evaluating the session.

Check for:

- a step whose instructions did not match reality
- a step that had to be skipped, reordered, or reinterpreted
- the user correcting an action or plan
- an ambiguity resolved by judgment instead of a clear instruction
- a feedback memory written about a planship skill during this run

If there was no real friction, report that briefly and make no changes.

If friction exists:

1. Identify the exact planship skill or agent involved.
2. Read `~/.claude/skills/writing-great-skills/SKILL.md` and its `GLOSSARY.md`.
3. Propose a concrete, generalizable diff that prevents the friction for future users.
4. Show the diff and explain the reason.
5. Wait for the user to approve before editing anything.

Never apply a self-improvement change automatically. Do not edit skills outside this plugin.
