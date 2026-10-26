#!/usr/bin/env bash
# Usage: lines.sh <base> <file>
# Prints the file's changed line numbers since <base>, comma-separated; NEW if the file is absent
# from <base>; nothing if the diff only deletes lines.
BASE=$1 f=$2
git cat-file -e "$BASE:$f" 2>/dev/null || { echo NEW; exit; }
git diff -U0 "$BASE" -- "$f" | sed -nE 's/^@@ -[0-9,]+ \+([0-9]+)(,([0-9]+))? @@.*/\1 \3/p' \
  | awk '{n=($2=="")?1:$2; for(i=0;i<n;i++) printf "%s%d", (c++?",":""), $1+i}'
