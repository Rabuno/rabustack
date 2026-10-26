---
name: quality-gates
description: CRAP and duplication gates on changed Python, Go and TypeScript code (Uncle Bob's crapper, dryer); mutation testing (mutator; Stryker for C#) only on request. Use once per task, before reporting done, when the task added or changed tests for logic with branching or calculations, or when asked for CRAP scores, duplicates or mutation testing.
---

# Quality gates

Run from the project root on the task's changed files. Read your stack's file first: [`stacks/python.md`](stacks/python.md), [`stacks/go.md`](stacks/go.md), [`stacks/ts.md`](stacks/ts.md). `<skill>` is this folder; logs go under a scratch directory of your choice (for example `${TMPDIR:-/tmp}/quality-gates/`), read back only the lines each step names.

Tools run via `uvx` at reviewed pins, flags as written below (no `--help` needed). `scripts/mutate.sh` repeats the mutator pin: bump both together. If your agent runtime blocks the first fetch of a pinned tool, get the user's approval, and run each `uvx` call alone in its batch.

```bash
CRAPPER=git+https://github.com/unclebob/crapper@6fd92c4
DRYER=git+https://github.com/unclebob/dryer@66ff6d2
BASE=$(git merge-base HEAD origin/<target>)   # uncommitted-only work: BASE=HEAD
mapfile -t FILES < <(bash <skill>/scripts/changed-files.sh "$BASE")   # always expand as "${FILES[@]}"
```

## 1. Snapshot

Append `.metrics/`, `target/coverage/`, `target/mutation-workers/`, `coverage/` to `.git/info/exclude` if missing. Save `git status --short` and the `tasklist` line from Done.

## 2. Pick a branch, then coverage

The branch is the cost of the project's test suite:

- **FAST**: the suite needs no external service (DB, broker) and runs in under 5 min. Run the whole suite once with your stack's coverage command.
- **SLOW**: the suite needs an external service, runs 5 min or more, or its duration is unknown: [`SLOW.md`](SLOW.md) scopes coverage to the related tests.

Always pass `--use-existing-coverage` to crapper and mutator: without it they install coverage tools into the project and on Windows silently score 0%.

## 3. CRAP

```bash
uvx --from $CRAPPER crapper --use-existing-coverage --threshold 10 "${FILES[@]}"
printf '%s\n' "${FILES[@]}" | go run "$(cygpath -w <skill>/scripts/fn-ranges.go)" | bash <skill>/scripts/in-scope-fns.sh "$BASE"   # TS/JS: node fn-ranges.cjs
```

crapper scores whole files; only functions touching the diff are in scope. Each in-scope function over 10 gets tests or a split (full coverage leaves CRAP = CC, so CC ≥ 10 needs a split; a flat `switch`/`match` that reads clearer whole may stay, named in the reply); one owned by someone else is named in the reply with its owner.

## 4. Duplication

`uvx --from $DRYER dryer "${FILES[@]}"`. A pair is in scope when either range touches a changed line (`scripts/lines.sh "$BASE" <file>`); merge it or name it in the reply with why it stays.

## 5. Review tests and seams

- Every assertion's actual value comes from production code, never from a literal or fixture the test built.
- A test that would still pass with every production function returning empty or zero tests nothing: rewrite it.
- Logic sits in modules tests reach; IO stays at a thin edge that re-asks no domain question.
- `node <skill>/scripts/test-integrity.cjs "$BASE"` prints one row per deleted, skipped, `.only`, assertion-losing or loosened test (Python, Go, TS/JS); no rows is clean. Each row is restored, or named in the reply with its kind and why the test changed.

## Mutation, on request

When the user asks for mutation testing: [`MUTATION.md`](MUTATION.md).

## Done

- `git status --short` matches the snapshot: no new path, no mutated source.
- `tasklist | grep -iE 'mutator|pytest|python|go\.exe|\.test\.exe|node|vitest'` matches the snapshot; kill leftovers with `taskkill //F //T //PID <pid>`.
- Reply lists each command with its result: worst in-scope CRAP, duplicate pairs, test-integrity rows with their reasons.
