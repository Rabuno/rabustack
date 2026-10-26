---
description: Print planship's effectiveness scoreboard from its local run log — plans that correctly skipped ceremony, reviews that caught findings before ship
---

Read `~/.claude/planship/log.jsonl` (Read tool, not a shell pipe — the file is small, count in-context).

- File missing or empty → report "chưa có dữ liệu" and stop.
- Otherwise, parse each JSONL line and tally:
  - `event: "plan"` lines → total plans logged; of those, how many have `trivial: true` (ceremony correctly skipped) vs `trivial: false` (full review ran).
  - `event: "review"` lines → total review passes logged; of those, how many have `findings > 0` (caught something before ship), and the sum of `findings` across all of them.

Report as a short plain-text scoreboard, e.g.:

```
Plans logged:        <total>
  skipped ceremony:   <trivial:true count> (<%>)
  full review:        <trivial:false count> (<%>)

Reviews logged:       <total>
  caught findings:     <count with findings > 0> (<%>) — <sum of findings> total findings caught
```

Note after the table: these are undercounts, not exact figures — logging happens inside the skill run, so an interrupted or non-planship run doesn't log.
