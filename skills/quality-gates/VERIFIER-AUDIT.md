# Verifier audit

When the user asks whether the verifier catches bugs:

1. Plant one realistic bug in a changed line (off-by-one, missing save, wrong exit code).
2. Spawn a fresh agent (`model: sonnet`, `effort: medium`) told only to verify the change against the TASKS.md Acceptance with the normal tools; it is not told what was planted.
3. Record caught or missed.
4. Restore the file and confirm it is byte-equal to the original (`cmp`).
5. Turn a miss into a new check, per the escaped-bug rule in `CLAUDE.md` Tests.
