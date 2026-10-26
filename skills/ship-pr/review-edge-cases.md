# Review edge cases

Disclosed reference for [`SKILL.md`](SKILL.md) step 6. Open when review shows findings but neither `reviewThreads` nor top-level `comments` account for them.

## Bot review rejected with HTTP 422

Bot that tried to `REQUEST_CHANGES` but got rejected by GitHub for approving/requesting-changes on its own token's PR (HTTP 422, common for workflow bot posting to PR opened by same identity) falls back to plain `COMMENT`-state review with its findings in that review's `body`. That body carries no resolve/unresolve state and shows up in neither `reviewThreads` nor top-level `comments` — only in `reviews` node from GraphQL query in step 6.

Treat it like thread: fix and push, or reply — then acknowledge with `gh pr comment` (it has no resolve state to clear).
