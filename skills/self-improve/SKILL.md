---
name: self-improve
description: Review a completed run for planship friction and propose a generalizable improvement.
---

Run only when the user explicitly asks for self-improvement.

Read [`../self-improve-after-running.md`](../self-improve-after-running.md). Review the completed session for friction caused by a planship skill or agent. If there is no real friction, report that briefly and make no changes.

If friction exists, identify the exact planship skill or agent, read `~/.claude/skills/writing-great-skills/SKILL.md` and its `GLOSSARY.md`, then show a concrete generalizable diff and explain why it prevents the friction. Wait for explicit user approval before editing anything.

Never apply changes automatically. Never edit skills outside the planship plugin.
