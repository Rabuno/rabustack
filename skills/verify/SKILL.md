---
name: verify
description: Build, run and drive the app to confirm a code change does what it should, judged on the running result rather than tests or type checks. Use before each commit of a code change, after a fix, or when asked to verify or smoke-test a change.
---

# Verify

Prove the change on the running app. Tests, type checks and builds are inputs here, never the verdict: the verdict is what you saw the app do.

## 1. Scope

List the changed behaviours from the diff (`git diff` against the base or `HEAD`) and the task's acceptance criteria. Each behaviour gets an expected result written before you run anything. A diff that touches only docs or tests has nothing to run: report `not applicable` and stop.

Done when every changed behaviour has an expected result.

## 2. Recipe

Read `docs/agents/run.md`: in the touched package first, then the repo root. It holds how to boot this app:

```markdown
# Run
- Setup: install and build commands, env file, seed or test DB
- Start: command, and the ready signal (log line or health URL)
- Drive: base URL, CLI entry or API harness; test login if any
- Stop: how to shut down and what to clean up
- Gotchas: what failed before and why
```

No recipe: infer it from the README, `package.json`, `Makefile`, `pyproject.toml`, `go.mod`, compose files. Use test or local environments only. When a dependency is missing (env var, secret, DB, device), stop and name it: the verdict is INCONCLUSIVE.

## 3. Boot

Start the app in the background and wait for the ready signal. Note every process and container you start.

## 4. Drive

Exercise each changed behaviour the way its user does:

- Web page or a route a page calls: `playwright-cli` through the flow, a screenshot of the end state, console errors read.
- HTTP API: `curl` the endpoint, status and body read.
- CLI or script: run it with real arguments, output and exit code read.
- Library: the smallest script calling its public API.

Also hit one neighbouring behaviour the change could break.

## 5. Judge

Compare each observation with its expected result. A mismatch: fix the code, boot again, drive again. After three red rounds on the same behaviour, stop and hand it to the user with what you tried and what you saw.

Done when each behaviour is PASS, FAIL (after three rounds) or INCONCLUSIVE.

## 6. Record and stop

Save what worked so the next run boots without guessing:

- No recipe existed: create `docs/agents/run.md` from the template in step 2, filled with the commands that just worked.
- A recorded step failed or was missing: correct that step and add the reason under Gotchas.
- The recipe worked as written: keep it as is.

Stop every process and container from step 3.

Done when the recipe matches what just worked and nothing you started is still running.

## Report

One line per behaviour: PASS, FAIL or INCONCLUSIVE, the expected result, and the evidence (command and output, screenshot path, console). Name anything you could not check and the check that would settle it.
