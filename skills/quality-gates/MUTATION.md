# Mutation

Mandatory before every MR; it needs no go-ahead. Runs after steps 1–3 (it reads their coverage) and once the tests for the changed behavior pass (suite green, behavior observed by a real run or manual check), so survivors show gaps rather than broken tests. C#: Stryker only (installing it is a new dependency: ask the user), then the survivor rule below.

```bash
bash <skill>/scripts/mutate.sh "$BASE" "$OUT" <workers> "<cmd>" <files sharing this cmd>
bash <skill>/scripts/scope-mutants.sh "$BASE" "$OUT"   # SURVIVED/UNCOVERED/TIMEOUT on changed lines
```

- `<cmd>` is the narrowest command that runs the file's related tests (step 2 of `SKILL.md`), without lint or typecheck; your stack file gives its form. On Windows cmd.exe runs `<cmd>`, so `|`, `&`, `<`, `>`, `^` in it break (quotes do not help): put the command in a bash script and pass `bash <script>` (`cygpath -m` path). A file with no related tests skips mutation; its changed lines are UNCOVERED (rule below).
- `<workers>`: 2–4 for fast unit tests (each worker runs a full test process, and background jobs die when memory runs out); 1 for large files or DB tests, stated in the reply.
- **Budget**: time one `<cmd>` run first (it also proves the baseline green). Estimate = changed lines (`lines.sh | tr , '\n' | wc -l`; NEW: the file's line count) × that time ÷ `<workers>`. State the estimate, then start `mutate.sh` from the main session with Bash `run_in_background` and keep working on review or MR text while it runs.
- `$OUT/summary.tsv` has one row per file; `SKIP-deletions-only` means the file only lost lines and has nothing to mutate. rc=3 means survivors remain: the run worked, so the triage below runs. rc=2 may be a failing baseline (failing in ~1s with "is not recognized as an internal or external command" is the cmd.exe case above): read the log tail, run `<cmd>` 3 times to tell flaky from broken.
- A `MUTATED-SOURCE-LEFT` row means a Windows `os.killpg` crash on timeout left the source mutated and the script stopped: re-run `mutate.sh` on that file to restore it, confirm with `git diff -- <file>` that only your own edits remain, then test that mutant by hand.
- A 100% score with no SURVIVED is suspect: spot-check one mutant by hand. A file done in ~2 s may be cached: delete `.metrics/mutate` and re-run.

## Survivor triage

Put each SURVIVED mutant in exactly one class:

| Class | Meaning | Ends with |
|---|---|---|
| equivalent | the mutated code behaves identically for every input a caller can send (unreachable bound, log text, ordering the contract leaves open) | one line in the reply saying why no input tells the two apart |
| missing assertion | a test runs the mutated line, yet no assertion reads its effect | a behavior-level test asserting that effect |
| untested branch | no test drives the input that reaches the mutated branch | a test with that input, asserting the result |

A non-equivalent survivor ends with its killing test (re-run mutator on the file: the mutant reports KILLED; when that re-run exceeds the budget, apply that one mutant alone by hand, run its killing test red, revert, and confirm `git diff -- <file>` is empty: mutants applied together do not show which test kills which), or with one stated reason it stays alive (trivial, killed outside the related set). Each UNCOVERED line gets a test, or is deleted when no caller reaches it (dead code). The reply adds killed/survived/uncovered counts and the class of each survivor.
