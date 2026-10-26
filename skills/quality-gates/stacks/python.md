# Python

Coverage (`--no-sync` keeps uv from writing `uv.lock`):

```bash
export COVERAGE_FILE=target/coverage/python/.coverage
uv run --no-sync --with coverage coverage run --source=<src> -m pytest
uv run --no-sync --with coverage coverage lcov -o target/coverage/python/lcov.info
```

SLOW: append the related test files to `-m pytest`.

Mutation `<cmd>` uses the **absolute** interpreter path: `$(cygpath -w "$PWD/.venv/Scripts/python.exe") -m pytest -q <tests>`. Mutants run in a worker overlay where a relative `.venv\...` fails, every failure counts as KILLED, and the score is a false 100%.
