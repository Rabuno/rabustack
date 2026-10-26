# Merge Edge Cases

Disclosed reference for [`ship-pr`](SKILL.md) step 7. Branch for whichever `mergeable`/`mergeStateStatus` came back non-clean.

## `mergeable: CONFLICTING` or `mergeStateStatus: DIRTY`

Real content conflict. Tell the user, ask: resolve it yourself, or the user rebases manually. If the user wants it resolved: `git fetch`, confirm it's genuine with `git merge-tree $(git merge-base origin/<base> <branch>) origin/<base> <branch>` (no `<<<<<<<` markers → clean auto-merge, merge and push), then `git merge origin/<base>` and hand-resolve any real markers. Rebuild/retest, then loop back to step 3 before pushing — hand-resolved conflict is unreviewed code same as any other diff.

## `mergeStateStatus: BEHIND`

Branch out of date with base, no conflict. Run `gh pr update-branch <num>`, then go back to step 5.

## `mergeStateStatus: BLOCKED`

Checks and content fine; branch protection rule isn't satisfied — almost always missing required approval (GitHub won't count your own approval on your own PR). Confirm with `gh api repos/{owner}/{repo}/branches/<base>/protection` (`required_pull_request_reviews.required_approving_review_count`); 404 "Branch not protected" there does NOT mean no rules — repo may use rulesets instead, check `gh api repos/{owner}/{repo}/rules/branches/<base>` (look for `pull_request` rule's `required_approving_review_count`). If repo has other collaborators, request one: `gh pr edit <num> --add-reviewer <user>`, then stop — wait for review rather than pushing further. If solo-maintainer repo and the user is repo admin, `enforce_admins: false` means requirement can be bypassed with `--admin` on the merge command — surface this explicitly as part of merge confirmation, don't apply it silently.
