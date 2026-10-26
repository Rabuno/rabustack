#!/usr/bin/env bash
# Usage: scope-mutants.sh <base> <outdir>
# mutator lists UNCOVERED sites of the whole file even with --lines; this keeps SURVIVED/UNCOVERED/TIMEOUT
# on changed lines only. Prints "file<TAB>status<TAB>line<TAB>mutation".
BASE=$1 OUT=$2
cut -f1 "$OUT/summary.tsv" | sort -u | while IFS= read -r f; do
  log="$OUT/$(tr '/[]' '___' <<<"$f").log"
  [ -f "$log" ] || continue
  L=$(bash "$(dirname "$0")/lines.sh" "$BASE" "$f")
  grep -F "$f:" "$log" | grep -E '^(SURVIVED|UNCOVERED|TIMEOUT) ' | sort -u \
    | awk -v f="$f" -v L="$L" 'BEGIN{n=split(L,a,","); for(i=1;i<=n;i++) keep[a[i]]=1}
      { split($2,p,":"); ln=p[length(p)]; if(L=="NEW" || (ln in keep)) { st=$1; $1=""; $2=""; print f "\t" st "\t" ln "\t" substr($0,3) } }'
done
