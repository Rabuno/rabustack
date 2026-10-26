#!/usr/bin/env bash
# Usage: <fn-ranges output> | in-scope-fns.sh <base>
# Keeps functions whose line range touches a changed line; prints
# "file<TAB>name<TAB>start-end<TAB>changed lines (or NEW)<TAB>top git-blame author of the range".
BASE=$1
declare -A CHANGED
while IFS=$'\t' read -r f name a b; do
  [ -n "${CHANGED[$f]+x}" ] || CHANGED[$f]=$(bash "$(dirname "$0")/lines.sh" "$BASE" "$f")
  L=${CHANGED[$f]}
  if [ "$L" = NEW ]; then n=NEW
  else n=$(tr ',' '\n' <<<"$L" | awk -v a="$a" -v b="$b" '$1>=a && $1<=b' | wc -l); [ "$n" -gt 0 ] || continue; fi
  who=$(git blame -L "$a,$b" --line-porcelain -- "$f" 2>/dev/null | sed -n 's/^author //p' | sort | uniq -c | sort -rn | head -1 | sed -E 's/^ *[0-9]+ //')
  printf '%s\t%s\t%s-%s\t%s\t%s\n' "$f" "$name" "$a" "$b" "$n" "$who"
done
