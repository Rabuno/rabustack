---
name: user-tester
description: Test a web project end-to-end by simulating a demanding real user (a mystery shopper) in a browser. Use when the user wants their site or a feature tested before release.
---

# User Tester

You are a **mystery shopper** with a QA lead's eye: a demanding paying customer having a bad day. You use the product for real, try to break it, and everything that annoys you goes in the report.

## 1. Grill the brief

Ask the user (use the `grilling` skill or AskUserQuestion) only what the code can't tell you and what gates a safe start — not the whole brief:

- How to reach the app: URL or dev-server start command.
- Blast radius: is this prod or a shared/graded environment, and how far is it safe to break — mutate data, send emails, trigger payments? What is off-limits? Code can't tell you this; get it before you touch anything.
- Rough scope: whole site or a specific flow? Any known weak spot to aim at?
- Build identity: when the app runs at a deployed URL (not a dev-server you start from the source yourself), which repo/branch is live? Recon must read the build that's actually deployed — a mismatch here is how a phantom bug reaches the dev.

Leave credentials, the role list, and flow details for recon to surface from the source — don't spend a question on what a subagent will read anyway; the sharp, system-specific questions come after recon (step 4). Done when: you know the URL and the blast radius you're allowed. Mid-test grilling stays allowed — when blocked on credentials, OTPs, or a judgment call, stop and ask rather than guess.

## 2. Recon the source

Fan out read-only subagents in parallel — one `feature-dev:code-explorer` per subsystem (auth, routing, forms, payments, admin, API, ...) plus one for cross-cutting concerns; for very large sweeps, orchestrate with the Workflow tool. Each agent returns: features, user flows, roles and permissions, validation rules, error states.

Merge results into a **feature inventory**: every route and user-facing feature listed, with the flows that reach it. Done when: no route or feature in the code is missing from the inventory; anything you couldn't trace gets flagged, not dropped.

## 3. Benchmark (optional)

If the product has well-known peers (e-commerce, SaaS dashboard, booking...), visit or WebSearch 1–2 similar sites to calibrate what a real user expects from the same flow. Skip when the domain is obvious.

## 4. Test matrix

Turn the inventory into a matrix: each flow × happy path × the abuse cases in [TORTURE.md](TORTURE.md) that apply. Write the **expected outcome** for every row now, before you touch the app — the exact balance after the payment, the error the bad input should raise, the redirect the logged-out deep-link should hit. A verdict is then a comparison against what you predicted, not a gut call in the moment; this is what stops you rubber-stamping a flow as `pass` because it finished, while it quietly did the wrong thing. Now that recon has surfaced the system, this is where the sharp questions land: confirm the seed accounts and roles you found (use them, or does the user have their own?), and the environment specifics the code revealed (e.g. "payments run through a sandbox gateway and a fake deposit path — safe to top up and spend freely?"). Show the matrix to the user with those and anything ambiguous flagged, then proceed with confirmed scope.

Steps 1–4 are all planning — read-only recon and questions, zero browser side-effects — so run them in plan mode. This matrix is the plan, and the user's scope sign-off is your ExitPlanMode gate: don't touch the app until it's approved. Done when: every inventory entry maps to at least one matrix row, and scope is approved.

## 5. Set up the run

Plan approved — out of plan mode now, side effects allowed within the blast radius from step 1.

**Pick your driver — call this yourself, don't ask the user:**

- **Playwright** — `mcp__playwright__*`. An isolated, scriptable browser: `browser_snapshot` gives an accessibility-tree view for reliable targeting instead of screenshot-guessing, and `browser_handle_dialog` answers native dialogs without freezing the run (see step 6). Load its tools once: `ToolSearch("select:mcp__playwright__browser_navigate,mcp__playwright__browser_snapshot,mcp__playwright__browser_click,mcp__playwright__browser_type,mcp__playwright__browser_fill_form,mcp__playwright__browser_evaluate,mcp__playwright__browser_console_messages,mcp__playwright__browser_network_requests,mcp__playwright__browser_take_screenshot,mcp__playwright__browser_handle_dialog,mcp__playwright__browser_wait_for")`.
- **Chrome extension** — `mcp__claude-in-chrome__*`. Drives the user's real, already-authenticated browser — the only source for an existing session (SSO, saved passwords, an extension the app depends on) that a fresh Playwright profile won't have.
- **Default to Playwright.** Disposable state, clean dialog handling, snapshot targeting — the right default for the bulk of the matrix. Add the Chrome extension only for rows that genuinely need that live session — don't open the user's real browser when nothing in the matrix needs it. Mixing drivers row-by-row within one run is normal once that need is confirmed, not the default.

Open the app with whichever driver(s) the run needs. One browser session = one user: within a single session, run flows sequentially in the tab. That's the default — running multiple sessions at once is possible but only earns it when both hold: you've stood up N isolated Playwright MCP server instances — each `--isolated` (seed auth via its own `--storage-state`), or each pointed at a distinct `--user-data-dir` — one agent per instance, orchestrated with the Workflow tool once you have 3+, and sessions are independent even in shared backend state (aggregate counters, an admin dashboard's totals, rate-limits, an email/job queue, sequence IDs) — not just in which records each user touches. Any doubt on that second point, run sequential instead. Without the isolated instances, "parallel" is zero speedup: subagents sharing one server share its one browser, and you get race conditions and false bugs, not concurrency — opt-in infrastructure, not default. A bug caught while running in parallel gets re-confirmed on a single sequential session before it's logged — interference between sessions wears a bug's face too (ties into step 7).

A row that deliberately puts two actors on the same resource at the same time — two tabs racing a checkout, five failed logins hammering a lockout, two users after the last unit of stock — is the opposite of an independent session and never gets cut for speed; it's testing concurrency itself, not incidental to how you happened to run the matrix.

Before trusting recon, verify the running app *is* the build you read: eyeball a few routes, button labels, and API response shapes against the inventory. A schema that doesn't match — an endpoint or field in the Network tab that the source never mentions — means recon read a different build than what's deployed; stop and pin down which commit is live before you log any behavior as a bug. A later re-check against the source can't catch this — it reads the same source too.

Order the rows so anything needing pristine state (empty lists, first-item views) runs before the torture cases that flood those lists with junk; when a row can't get a clean slate, spin up a fresh account. Within that ordering, group every row that shares the same precondition and run them back-to-back on that one setup before tearing it down or mutating past it — cuts repeat setup clicks with zero parallel risk — just sequencing. Inside a batch, order matters too: a row that consumes or mutates the shared precondition itself (checkout empties the cart, a torture case corrupts the record) runs last in that batch; if it can't run last, re-verify or re-seed the precondition before the next row trusts it — a row failing on "the setup's gone" instead of its own behavior is the batch, not the app.

Switching user costs a full logout/login, so plan the role order before you start: list the points where a role hand-off is truly forced (client accepts → expert delivers → client approves → admin resolves), and while signed in as one role, do every matrix row reachable from it — cross-role checks, that role's torture cases, its own dashboards — before you hand off. Cross a role boundary only when a business dependency demands it, not once per flow.

Create this run's folder now: `docs/user-tester/<YYYY-MM-DD-HHmm>-<slug>/` (slug = short scope name, e.g. `checkout-flow`), timestamped so a repeat run never overwrites a prior one. Everything steps 6 and 8 write goes there.

Done when: app open, the running build verified against recon, the row and role order fixed, and the run folder created before the first click.

## 6. Run each row

For each matrix row:

1. Happy path first, exactly as a first-time user would (read the page, don't teleport by URL unless testing deep-links).
2. Then the applicable [TORTURE.md](TORTURE.md) cases — script the repetitive ones (bulk form-fill, oversized payloads, hammering an endpoint) via `browser_evaluate`/the JS tool or a direct API call instead of clicking each by hand; keep the happy path and UX read manual, that's where a human eye catches what a script can't. The same shortcut extends to precondition setup (login, filling a cart, creating a prerequisite record) whenever the setup itself isn't what this row tests — seed it via API/JS/`storageState` instead of re-clicking through it. Only when: that setup flow already got clicked by hand in some other row (never seed a flow nobody's tested), and the seeded state matches the shape and side-effects a real UI action would produce (validation, derived fields, triggered events) — a seed that skips those, or seeds nothing at all, makes the row's verdict meaningless. Verify the precondition landed before running the row on top of it.
3. After every flow: read the console and network logs (`browser_console_messages` / `browser_network_requests` on Playwright, `read_console_messages` / `read_network_requests` on the Chrome extension). A red console error or a failed request with no user-facing feedback is a bug even when the UI looks fine.
4. Screenshot every failure the moment it happens.
5. Append the row's verdict and evidence to a working file in this run's folder (from step 5) the instant it's done — a run this long outlives the context window, and a verdict you didn't save is a verdict you lost. Every doc this run produces lives in that folder, never loose in the repo root, `docs/user-tester/` itself, or elsewhere.

A native `window.confirm`/`alert`/`prompt` freezes the whole browser and every automation tool times out — that is the tool blocked on a dialog, not the app hanging. On Playwright, pre-empt it with `browser_handle_dialog` before the triggering click, or dismiss it after the freeze. On the Chrome extension, override the dialog (`window.confirm = () => true` via the JS tool) or ask the user to click it. Either way, continue after clearing it; never log the freeze itself as a bug.

Confirm with the user before any irreversible action against a shared environment (real emails, payments, deletes). Done when: every matrix row carries a verdict — `pass`, `fail`, or `blocked` — and a row without evidence is `blocked`, never `pass`.

## 7. Confirm every bug

Before reporting, re-run each `fail` from scratch: fresh page load (or fresh session when auth is involved), follow your own repro steps exactly, and watch it fail a second time. Reproduces → keep, and tighten the repro steps to the minimum that still triggers it. Doesn't reproduce → mark `flaky` with both observations, never silently drop it. When a second run would burn irreversible state or breach the blast radius — a one-shot escrow move, a spent balance — don't force it: confirm once, then lean on the independent channel below to pin the cause instead of repeating the click.

Reproducing twice confirms the symptom, not the cause — a freeze, hang, or silent failure can be a tool or environment limit wearing a bug's face. Before you rank anything `blocker` or `major`, pin the cause through a channel independent of the clicks that triggered it: hit the API directly, run JS in the page, or read the source. A freeze isn't a bug until you've ruled out a native dialog and the tool itself. That independent-channel check is also the cheaper way to confirm a bug when a second click-through would burn irreversible state — lean on it instead of forcing the repeat. A bug first caught while multiple sessions were running in parallel gets its repro re-run on a single sequential session before it's ranked — otherwise you can't tell the bug from session interference.

Self-confirmation has a blind spot: you can't catch a bug you misunderstood. So get **fresh eyes** — spawn a fresh subagent with the findings list, each with repro steps and evidence, plus the relevant source, and task it to adversarially refute every one: expected behavior, a tool artifact, thin evidence, wrong severity. What it knocks down gets downgraded or dropped; what survives ships. This is the pass that catches a false blocker before it reaches the dev — the check no amount of re-running your own repro can replace. Done when: every reported bug reproduced twice, cause confirmed independently for blocker/major, and run past fresh eyes — or labeled `flaky`.

## 8. Report

Write the full report to a markdown file in this run's folder (e.g. `docs/user-tester/2026-07-18-1430-checkout-flow/user-test-report.md`, next to the working file from step 6) — a file, not just a chat message, since step 9 and the user both need it to persist:

- **Bugs**, ranked: `blocker` (data loss, flow impossible, security) → `major` (flow completable only with workarounds) → `minor` (wrong but survivable) → `polish` (the mystery shopper grumbled). Each with repro steps + evidence.
- **UX complaints** the matrix didn't capture — anything that made the mystery shopper hesitate, re-read, or mistrust the product, benchmarked against the peer sites if step 3 ran.
- **Verdict**: ship / no-ship, with the blockers that decide it.
- **Blocked rows** and what's needed to unblock them.
- **Test data created**: every account, record, or transaction the run created in a shared/graded environment — so it can be cleaned up.
- **Not tested**: every matrix row you never reached — out of scope, out of a role, or genuinely blocked. No timeout: every in-scope row gets run, however long it takes. List untested rows by name. A row that silently vanishes from the report reads as covered when it wasn't.

Share the file path and a short summary in chat. Done when: report file written, path shared.

## 9. File the bugs

If the Bugs section has at least one entry, tell the user the `to-issues` skill can turn the report into tracked issues — don't invoke it yourself, it's user-invoked only. Skip and say so when there are zero bugs. Done when: The user told about `to-issues`, or explicitly skipped when zero bugs.
