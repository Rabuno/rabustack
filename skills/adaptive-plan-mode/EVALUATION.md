# Evaluation Dimensions

Disclosed reference for [`adaptive-plan-mode`](SKILL.md) Phase 3. Mark each of the seven dimensions relevant or not — most tasks end up with two or three marked relevant, but all seven get a line.

## Correctness
Check: invalid input, empty states, malformed data, duplicate operations, ordering issues, stale state, race conditions, partial updates.

## Failure Modes
Consider: retries, idempotency, timeout handling, partial failure, rollback behavior, downstream instability, degraded modes.

## Scale & Performance
Investigate: hot paths, blocking I/O, unnecessary allocations, N+1 patterns, batching opportunities, cacheability. Do not optimize hypothetical bottlenecks without evidence.

## Operational Safety
Consider: rollout sequencing, migration safety, feature flags, monitoring, alertability, rollback strategy.

## Maintainability
Prefer: simple control flow, honest naming, minimal hidden behavior, consistency with existing architecture. Avoid cleverness that increases future debugging cost.

## Security
Review: trust boundaries, auth/authz, injection risks, secret handling, unsafe deserialization, user-controlled input.

## Testing
Identify: minimal confidence-building tests, integration risks, hard-to-test behavior, missing observability. Test strategy should reflect risk level.
