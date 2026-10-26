#!/usr/bin/env bash
# Usage: mutate.sh <base> <outdir> <max-workers> "<test-cmd>" <file>...
# Runs the pinned mutator on each file's changed lines (whole file if NEW, skipped if deletions only).
# Writes <outdir>/<file>.log and appends "file<TAB>rc<TAB>seconds<TAB>counts" to <outdir>/summary.tsv;
# stops when a run leaves its source file mutated.
BASE=$1 OUT=$2 W=$3 CMD=$4; shift 4
export PYTHONUTF8=1  # mutator decodes test output as cp1252 on Windows otherwise and crashes on non-ASCII
mkdir -p "$OUT"
for f in "$@"; do
  L=$(bash "$(dirname "$0")/lines.sh" "$BASE" "$f")
  if [ -z "$L" ]; then printf '%s\tSKIP-deletions-only\n' "$f" >> "$OUT/summary.tsv"; continue; fi
  args=(); [ "$L" = NEW ] || args=(--lines "$L")
  log="$OUT/$(tr '/[]' '___' <<<"$f").log"
  before=$(git hash-object -- "$f"); s=$(date +%s)
  uvx --from git+https://github.com/unclebob/mutator@a5a0cb8 --with git+https://github.com/unclebob/crapper@6fd92c4 \
    mutator --use-existing-coverage --max-workers "$W" --test-command "$CMD" "$f" "${args[@]}" > "$log" 2>&1
  rc=$?
  counts=$(grep -oE '^[A-Z]+ ' "$log" | sort | uniq -c | awk '{printf "%s=%s ", $2, $1}')
  printf '%s\trc=%s\t%ss\t%s\n' "$f" "$rc" "$(( $(date +%s)-s ))" "$counts" >> "$OUT/summary.tsv"
  [ "$(git hash-object -- "$f")" = "$before" ] || { printf '%s\tMUTATED-SOURCE-LEFT\n' "$f" >> "$OUT/summary.tsv"; exit 1; }
done
