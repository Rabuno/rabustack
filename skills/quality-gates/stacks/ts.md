# TS/JS

Coverage, emitting LCOV to `coverage/lcov.info`. For vitest: `npx vitest related --run "${FILES[@]}" --coverage --coverage.reporter=lcov --coverage.reportOnFailure` (tests importing the changed files; without the last flag, one failing test means no LCOV). Without vitest, the project's own coverage script scoped to those tests.

Mutation `<cmd>`: `npx vitest related --run <file>`.

No vitest coverage provider: after the user approves, `npm install --no-save @vitest/coverage-v8@<installed vitest version>`, then `npm uninstall --no-save @vitest/coverage-v8` when done, so `package.json` and the lockfile stay unchanged. Other stacks without a coverage script need a new dev dependency: ask the user.

crapper's coverage % can sit below LCOV's (98% on a fully covered function): a quirk, not a gap.

Type check of record is `npx tsc --noEmit` (LSP falsely flags `@/` imports in `tests/`). Format check on committed content (`core.autocrlf=true`): `git show HEAD:<f> | npx prettier --stdin-filepath <f> --check`.
