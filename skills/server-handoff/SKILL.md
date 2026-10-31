---
name: server-handoff
description: Move this Claude Code session and its folder to a server container so it keeps running while the laptop is off (push), or bring it back (pull).
disable-model-invocation: true
---

# Server handoff

Arguments: `$ARGUMENTS`. The first word is the action, `push` or `pull`; for `push`, the rest is the prompt the server session starts on (empty: the script's default).

Run one Bash call from any directory, `<skill>` being this folder:

- `push`: `bash "<skill>/scripts/handoff.sh" push "${CLAUDE_PROJECT_DIR}" "${CLAUDE_SESSION_ID}" "<prompt>"`, leaving off the last argument when the prompt is empty.
- `pull`: `bash "<skill>/scripts/handoff.sh" pull "${CLAUDE_PROJECT_DIR}"`

Allow it ten minutes (`timeout: 600000`). Report the outcome in one line, then end the turn:

- push, exit 0: the session runs on the server; tell the user to `/exit` now and that `docker exec -it claude-test claude attach <first 8 characters of the session id>` reattaches.
- pull, exit 0: the folder and transcript are back; tell the user to run `claude --resume <the id the script printed>`.
- non-zero exit: quote its stderr; change nothing else.

## Server

The script drives container `claude-test` through the local `docker` CLI (a context pointing at the server). The container runs Claude Code as a non-root user, and its `~/.claude/settings.json` holds the proxy `env`, `worktree.bgIsolation: "none"` (background sessions edit the copied folder, not a worktree) and the permissions. The model is pinned in the script, as a resumed session keeps its transcript's model over the settings.
