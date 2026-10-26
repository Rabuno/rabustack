# planship

An opinionated plan → ship → test methodology packaged as skills/agents for AI coding harnesses (Claude Code, and later Codex/opencode/agy).

## Language

**Skill**:
A markdown-defined instruction module a harness loads directly into its running context to perform one stage of the loop (e.g. `adaptive-plan-mode`, `ship-pr`, `user-tester`, `grilling`). Runs inline — no separate model or tool config of its own.
_Avoid_: Agent, subagent (for this kind of module)

**Agent**:
A separate subagent a skill spawns, with its own model, tools, and context, isolated from the caller (e.g. `oryna`). Distinct from a skill because it runs out-of-band and returns a result rather than executing inline.
_Avoid_: Skill (for this kind of module)

**Mode**:
The model tier (`economy`/`normal`/`premium`) applied to planship's model-selectable spots — the adaptive-plan-mode Phase 6 review agent and `oryna`. Bundles both the model choice and its effort/thinking setting; persisted in `~/.claude/planship/mode.txt` and re-injected each turn via a `UserPromptSubmit` hook, since skill/agent instructions are static text and can't read state on their own.
_Avoid_: Tier, level (alone, without "mode")

**The loop**:
The three-stage sequence — Plan, Ship, Test — that planship enforces in order. Each stage hands off evidence (a plan, a diff, a working build) that the next stage checks against; skipping a stage leaves the next with nothing to verify against.
_Avoid_: Pipeline, workflow (for this specific 3-stage sequence)

**Harness binding**:
The thin, harness-specific folder (e.g. `.claude-plugin/` for Claude Code) that wires the harness-agnostic root content (`skills/`, `agents/`) into a particular coding harness's plugin format. New harnesses (Codex, opencode, agy) get their own binding without touching root content.
_Avoid_: Adapter, integration, plugin (plugin refers to the installable unit as a whole, not the binding folder)

**External dependency**:
A skill planship's own skills call into but doesn't bundle or own (e.g. `code-review`, used by adaptive-plan-mode Phase 8 and ship-pr step 3). Must be installed separately.
_Avoid_: Peer dependency, plugin dependency

**PRD**:
The originating spec or issue a feature is built against, fetched from the issue tracker (see `docs/agents/issue-tracker.md`). The Spec axis of a review checks the diff against this, not against the codebase's own conventions.
_Avoid_: Ticket, requirements doc

**Review**:
An independent, no-stake pass gating a stage of the loop before it's considered done — the Phase 6 plan-review agent (gates a plan) and the `code-review` skill invoked at Phase 8 / ship-pr step 3 (gates a diff, on the Spec and Standards axes). Distinct from Phase 7's own test/build run, which is the quality gate, not a review.
_Avoid_: Check, verification (for this specific independent-pass step)
