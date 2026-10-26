# SLOW branch

The suite needs an external service or runs 5 min or more. CRAP scores only changed lines, so coverage runs on the **related tests**: the namesake test file of each changed file, every test file importing it, and integration tests that reach it, narrowed by name (Go `-run "<regex>"`, pytest `-k`, vitest `-t`). Your stack file has the scoped coverage command.

- Tests needing a DB: export its DSN from your project's secrets or notes; the value stays out of scripts and logs.
- Functions outside the related set may score as uncovered in crapper: only in-scope functions (step 3) count.
