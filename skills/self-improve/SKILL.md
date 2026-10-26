---
name: self-improve
description: Review a completed run for friction caused by a skill in this collection (adaptive-plan-mode, ship-pr, user-tester, quality-gates, interview, oryna) and propose a generalizable fix. Use when the user asks for self-improvement or at the end of a plan or ship run.
---

# Self-improve

Scope: only the skills in this collection. Never propose edits to other skills, even if one caused the friction.

Friction is any of:
- a step's instructions did not match what you found
- you had to skip, reorder or reinterpret a step
- the user corrected an action or a plan mid-run
- an ambiguity was silently resolved by judgment call instead of a clear instruction; this counts even when told to just decide, because it means the skill left a gap
- a feedback memory was written about this skill's steps during the run

None of these happened: say so in one line, change nothing.

Otherwise, name the exact skill that caused it and propose a specific edit to that skill that would have prevented the friction. The fix must generalize: skip edits that only suit this user, this repo or this one-off preference. Keep skill text short, imperative and free of filler.

Show the diff and why it prevents the friction. Wait for explicit approval before editing anything. Never apply changes automatically.
