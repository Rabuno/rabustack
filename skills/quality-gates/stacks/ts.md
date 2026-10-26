# TS/JS

Coverage: the project's own coverage script, emitting LCOV to `coverage/lcov.info`. For vitest: `npx vitest run --coverage --coverage.reporter=lcov --coverage.reportOnFailure` (without the last flag, one failing test means no LCOV).

SLOW: `npx vitest related --run "${FILES[@]}" --coverage --coverage.reporter=lcov --coverage.reportOnFailure` (tests importing the changed files).

No vitest coverage provider: after the user approves, `npm install --no-save @vitest/coverage-v8@<installed vitest version>`, then `npm uninstall --no-save @vitest/coverage-v8` when done, so `package.json` and the lockfile stay unchanged. Other stacks without a coverage script need a new dev dependency: ask the user.

crapper's coverage % can sit below LCOV's (98% on a fully covered function): a quirk, not a gap.

Type check of record is `npx tsc --noEmit` (LSP falsely flags `@/` imports in `tests/`). Format check on committed content (`core.autocrlf=true`): `git show HEAD:<f> | npx prettier --stdin-filepath <f> --check`.
