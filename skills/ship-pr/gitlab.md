# Shipping via GitLab

Steps in `SKILL.md` hold with MR vocabulary ("PR" reads as "MR") and these `glab` equivalents:

| Step | GitHub (`gh`) | GitLab (`glab`) |
|------|---------------|-----------------|
| 4. Check existing | `gh pr list --head <branch> --state all` | `glab mr list --source-branch=<branch> --all` (state field: `opened`/`closed`/`merged`) |
| 4. Open | `gh pr create` / `gh pr view` | `glab mr create` / `glab mr view` |
| 5. Checks | `gh pr checks <num> --watch --required` | `glab ci status --live` |
| 6. Review threads | GraphQL `reviewThreads` query (GitHub-only) | `glab api "projects/:id/merge_requests/<num>/discussions"` |
| 7. Update branch | `gh pr update-branch <num>` | `glab mr update` |
| 7. Merge | `gh pr merge <num> --<method> --delete-branch` | `glab mr merge --remove-source-branch` |

Resolving a discussion (step 6's `resolveReviewThread` equivalent): `glab api --method PUT "projects/:id/merge_requests/<num>/discussions/<discussion-id>?resolved=true"`.

Mergeability (step 7): `glab mr view <num> --output json` — read `detailed_merge_status` (`mergeable`, `need_rebase`, `conflict`, `not_approved` map onto step-7 cases).

**Zero-setup fallback for step 4:** `git push` on new branch prints ready-made "create merge request" URL — no `glab` install/auth needed. When `glab` isn't installed/authenticated (self-hosted instances need manually-generated PAT) and the user is time-constrained, skip CLI setup: hand the user that URL plus pre-written title/description block to paste. Only invest in installing/authing `glab` when the user wants steps 5–8 (checks, review, merge) automated too.
