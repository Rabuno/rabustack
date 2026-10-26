#!/usr/bin/env bash
# Usage: changed-files.sh <base>
# Prints source files added or modified since <base>, committed or not, untracked included; test files excluded.
{ git diff --name-only --diff-filter=AM "$1"; git ls-files --others --exclude-standard; } | sort -u \
  | grep -E '\.(py|go|tsx?|jsx?|mjs|cjs|cs)$' \
  | grep -vE '(^|/)(tests?|__tests__)/|(^|/)test_[^/]*\.py$|_test\.(py|go)$|\.(test|spec)\.[cm]?[jt]sx?$|Tests?\.cs$'
