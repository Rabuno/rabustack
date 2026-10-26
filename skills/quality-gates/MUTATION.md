# Mutation

Runs only when the user asks for mutation testing, after steps 1–3 (it reads their coverage). C#: Stryker only (installing it is a new dependency: ask the user), then the survivor rule below.

```bash
bash <skill>/scripts/mutate.sh "$BASE" "$OUT" <workers> "<cmd>" <files sharing this cmd>
bash <skill>/scripts/scope-mutants.sh "$BASE" "$OUT"   # SURVIVED/UNCOVERED/TIMEOUT on changed lines
```

- `<cmd>` runs the file's **related tests**: its namesake test file plus every test file importing it. A file with no related tests skips mutation: its changed lines count as UNCOVERED.
- `<workers>`: 2–4 for fast unit tests; 1 for large files or DB tests, telling the user first (background jobs die when memory runs out).
- **Budget**: time one `<cmd>` run first (it also proves the baseline green). Estimate = changed lines (`lines.sh | tr , '\n' | wc -l`; NEW: the file's line count) × that time ÷ `<workers>`. Over 15 min for the task: tell the user the estimate per file and wait for the go-ahead.
- `$OUT/summary.tsv` has one row per file. rc=2 may be a failing baseline: read the log tail, run `<cmd>` 3 times to tell flaky from broken.
- Windows `os.killpg` crash on timeout may leave the source mutated: re-run mutator to restore, check `git status`, then raise `--timeout-factor` or test that mutant by hand.
- A 100% score with no SURVIVED is suspect: spot-check one mutant by hand. A file done in ~2 s may be cached: delete `.metrics/mutate` and re-run.

## Survivor triage

Put each SURVIVED mutant in exactly one class:

| Class | Meaning | Ends with |
|---|---|---|
| equivalent | the mutated code behaves identically for every input a caller can send (unreachable bound, log text, ordering the contract leaves open) | one line in the reply saying why no input tells the two apart |
| missing assertion | a test runs the mutated line, yet no assertion reads its effect | a behavior-level test asserting that effect |
| untested branch | no test drives the input that reaches the mutated branch | a test with that input, asserting the result |

A non-equivalent survivor ends with its killing test (re-run mutator on the file: the mutant reports KILLED), or with one stated reason it stays alive (trivial, killed outside the related set). Each UNCOVERED line gets a test, or is deleted when no caller reaches it (dead code). The reply adds killed/survived/uncovered counts and the class of each survivor.
