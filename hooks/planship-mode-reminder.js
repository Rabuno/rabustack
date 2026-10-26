// planship-mode-reminder — UserPromptSubmit hook. Re-injects the current
// planship model mode every turn, since skill/agent instructions are static
// text and can't read state on their own. Silent when mode is "normal"
// (planship's baseline behavior, nothing to override) or the state file is
// missing. Silent-fails on any error; never blocks the prompt.
// mode→model/effort mapping mirrors commands/planship-mode.md — keep both in sync.

const fs = require("fs");
const path = require("path");

try {
  const modeFile = path.join(process.env.HOME || process.env.USERPROFILE, ".claude", "planship", "mode.txt");
  if (!fs.existsSync(modeFile)) process.exit(0);

  const mode = fs.readFileSync(modeFile, "utf8").trim();
  if (mode === "" || mode === "normal") process.exit(0);

  const modelLine =
    mode === "economy" ? "model 'sonnet', default effort" :
    mode === "premium" ? "model 'opus', effort/thinking pushed to max" :
    null;
  if (!modelLine) process.exit(0);

  const ctx = `planship mode is '${mode}'. When spawning adaptive-plan-mode's Phase 6 plan-review agent (agentType 'Plan') or the 'rabustack:oryna' agent, override its model to ${modelLine} instead of the file's default. Nothing else in planship changes for this mode.`;

  console.log(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: ctx
    }
  }));
  process.exit(0);
} catch {
  process.exit(0);
}
