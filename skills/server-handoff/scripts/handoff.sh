#!/usr/bin/env bash
set -euo pipefail
export MSYS_NO_PATHCONV=1

container=claude-test
model=claude-sonnet-5-5-high
excludes=(--exclude=node_modules --exclude=.venv --exclude=dist --exclude=build --exclude=target --exclude=.claude/worktrees)

slugify() { printf %s "$1" | sed 's/[^A-Za-z0-9]/-/g'; }

in_box() { docker exec -i "$container" "$@"; }

trust_remote_dir() {
  in_box cat /home/claude/.claude.json \
    | uv run --no-project python -I -c "import json,sys; d=json.load(sys.stdin); d.setdefault('projects',{}).setdefault(sys.argv[1],{})['hasTrustDialogAccepted']=True; print(json.dumps(d,indent=2))" "$1" \
    | in_box sh -c 'cat > /home/claude/.claude.json.new && mv /home/claude/.claude.json.new /home/claude/.claude.json'
}

push() {
  local id=$1 prompt=$2
  local remote_slug; remote_slug=$(slugify "$remote")
  if in_box test -e "$remote"; then
    echo "$remote already exists on the server: run /server-handoff pull first." >&2
    exit 1
  fi
  [ -f "$local_jsonl_dir/$id.jsonl" ] || { echo "transcript not found: $local_jsonl_dir/$id.jsonl" >&2; exit 1; }
  in_box mkdir -p "$remote" "/home/claude/.claude/projects/$remote_slug"
  tar -C "$root" "${excludes[@]}" -cf - . | in_box tar -C "$remote" -xf -
  in_box sh -c "cat > '/home/claude/.claude/projects/$remote_slug/$id.jsonl'" < "$local_jsonl_dir/$id.jsonl"
  printf %s "$id" | in_box sh -c "cat > '$remote.handoff-id'"
  tar -C ~/.claude -cf - CLAUDE.md skills | in_box tar -C /home/claude/.claude -xf -
  trust_remote_dir "$remote"
  docker exec -w "$remote" "$container" claude --bg --resume "$id" --model "$model" "$prompt"
}

pull() {
  local id remote_slug; remote_slug=$(slugify "$remote")
  id=$(in_box cat "$remote.handoff-id" 2>/dev/null) || { echo "no session from this folder is on the server." >&2; exit 1; }
  in_box claude stop "${id:0:8}" || true
  in_box tar -C "$remote" "${excludes[@]}" -cf - . | tar -C "$root" -xf -
  in_box cat "/home/claude/.claude/projects/$remote_slug/$id.jsonl" > "$local_jsonl_dir/$id.jsonl"
  in_box claude rm "${id:0:8}" || true
  in_box rm -rf "$remote" "$remote.handoff-id" "/home/claude/.claude/projects/$remote_slug"
  echo "$id"
}

action=$1
root=$(cygpath -u "$2")
remote=/home/claude/work/$(basename "$root")
local_jsonl_dir=~/.claude/projects/$(slugify "$(cygpath -w "$root")")

case $action in
  push) push "$3" "${4:-Continue where we left off.}" ;;
  pull) pull ;;
  *) echo "usage: handoff.sh push|pull <root> [session-id] [prompt]" >&2; exit 2 ;;
esac
