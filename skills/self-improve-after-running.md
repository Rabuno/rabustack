# After running — improve this skill

External reference. Pointed to by [`adaptive-plan-mode`](adaptive-plan-mode/SKILL.md), [`ship-pr`](ship-pr/SKILL.md), and the user-invoked [`/self-improve`](../commands/self-improve.md) command. Scope is this plugin's own skills/agents only (`adaptive-plan-mode`, `ship-pr`, `user-tester`, `grilling`, `oryna`) — never propose edits to a skill outside planship, even if it caused the friction.

Friction = any of:
- a step's instructions didn't match what you found
- you had to skip, reorder, or reinterpret a step
- The user corrected an action or a plan mid-run
- an ambiguity got silently resolved by judgment call instead of a clear instruction — silent resolution still counts, even under Auto Mode's "don't stop, just decide" bias; it means the skill left a gap, not that there was nothing to log
- a feedback memory got written about this specific skill's steps during this run — that memory captures the lesson generally, it doesn't fix the source document; still do this pass

None of the above happened → stay silent, run is done.

planship is a published plugin other people install — a fix must generalize past this one run. Don't propose an edit that only makes sense for this the user, this repo, or this one-off preference; propose it only when the friction would recur for any user running the same skill.

Any hit → read `~/.claude/skills/writing-great-skills/SKILL.md` and its `GLOSSARY.md`, propose a specific edit to *the skill that just ran* that would have prevented that friction. Show the user the diff, apply only on approval.
