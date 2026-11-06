---
name: quality-gates
description: Before creating an MR/PR, once per task, when the diff changes Python, Go or TypeScript functions with branching or calculation logic, run CRAP and duplication checks (Uncle Bob's crapper, dryer), test review and mutation testing (mutator; Stryker for C#). Also on request for CRAP scores, duplicates, mutation testing or a verifier audit.
---

# Quality gates

Run from the project root on the task's changed files. A diff that changes no function with a branch or calculation (docs, config, copy, styles, renames) skips this skill: the reply names the skip and why. Read your stack's file first: [`stacks/python.md`](stacks/python.md), [`stacks/go.md`](stacks/go.md), [`stacks/ts.md`](stacks/ts.md). `<skill>` is this folder; logs go under a scratch directory of your choice (for example `${TMPDIR:-/tmp}/quality-gates/`), read back only the lines each step names.

Tools run via `uvx` at reviewed pins, flags as written below (no `--help` needed). Pins live in two places: `CRAPPER`/`DRYER` below and `scripts/mutate.sh` (`MUT`: mutator plus a second crapper copy); bump a crapper pin in both. If your agent runtime blocks the first fetch of a pinned tool (`mutate.sh` included), get the user's approval, and run each `uvx` call alone in its batch. C#: crapper and dryer read no `.cs`, so a C# diff runs steps 1, 5 and 6 only.

```bash
CRAPPER=git+https://github.com/unclebob/crapper@6fd92c4c9bcc56efb64a2f8743d5a2993bcfd42d
DRYER=git+https://github.com/unclebob/dryer@66ff6d2
BASE=$(git merge-base HEAD origin/<target>)   # uncommitted-only work: BASE=HEAD
mapfile -t FILES < <(bash <skill>/scripts/changed-files.sh "$BASE")   # always expand as "${FILES[@]}"
```

## 1. Snapshot

Append `.metrics/`, `target/coverage/`, `target/mutation-workers/`, `coverage/` to `.git/info/exclude` if missing. Save `git status --short` and the output of the Done `tasklist` command.

## 2. Coverage

Coverage runs on the **related tests** (your stack file has the command): the namesake test file of each changed file, every test file importing it, and integration tests that reach it, narrowed by name (Go `-run "<regex>"`, pytest `-k`, vitest `-t`). Trade-off: tests that reach the code without importing it can inflate CRAP, a false alarm, not a missed bug.

- Tests needing a DB: export its DSN from your project's secrets or notes; the value stays out of scripts and logs.

Pass `--use-existing-coverage` to crapper and mutator; their default installs coverage tools into the project and on Windows silently scores 0%.

Steps 3 to 5 are independent once coverage exists: run the CRAP, duplication and test-integrity commands in one batch.

## 3. CRAP

```bash
uvx --from $CRAPPER crapper --use-existing-coverage --threshold 10 "${FILES[@]}"
printf '%s\n' "${FILES[@]}" | go run "$(cygpath -w <skill>/scripts/fn-ranges.go)" | bash <skill>/scripts/in-scope-fns.sh "$BASE"   # TS/JS: node fn-ranges.cjs; Python: uv run --no-project python -I fn-ranges.py
```

crapper scores whole files; only functions touching the diff are in scope (a function outside the related set may score as uncovered). Each in-scope function over 10 gets tests or a split (full coverage leaves CRAP = CC, so CC ≥ 10 needs a split; a flat `switch`/`match` that reads clearer whole may stay, named in the reply); one owned by someone else is named in the reply with its owner.

## 4. Duplication

`uvx --from $DRYER dryer "${FILES[@]}"`. A pair is in scope when either range touches a changed line (`scripts/lines.sh "$BASE" <file>`); merge it or name it in the reply with why it stays.

## 5. Review tests and seams

- Every assertion's actual value comes from production code, never from a literal or fixture the test built.
- A test that would still pass with every production function returning empty or zero tests nothing: rewrite it.
- Logic sits in modules tests reach; IO stays at a thin edge that re-asks no domain question.
- `node <skill>/scripts/test-integrity.cjs "$BASE"` prints one row per deleted, skipped, `.only`, assertion-losing or loosened test (Python, Go, TS/JS); no rows is clean. Each row is restored, or named in the reply with its kind and why the test changed.
- Type and format checks run as your stack file gives them, on committed content.

## 6. Mutation

Mandatory for every diff this skill runs on, finished before the MR; it reads step 2's coverage, so start it once step 2 is done. Steps and survivor rule: [`MUTATION.md`](MUTATION.md).

## Verifier audit, on request

[`VERIFIER-AUDIT.md`](VERIFIER-AUDIT.md).

## Done

- `git status --short` matches the snapshot: no new path, no mutated source.
- `tasklist | grep -iE 'mutator|pytest|python|go\.exe|\.test\.exe|node|vitest'` matches the snapshot; kill leftovers with `taskkill //F //T //PID <pid>`.
- Reply lists each command with its result: worst in-scope CRAP, duplicate pairs, test-integrity rows with their reasons, mutation killed/survived/uncovered counts with the class of each survivor.
- Every in-scope SURVIVED and UNCOVERED mutant ends as `MUTATION.md` requires.
