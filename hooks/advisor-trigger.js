// advisor-trigger — UserPromptSubmit hook. When the prompt contains the
// "oryna" keyword (any case), instructs the model to launch the oryna
// advisor agent instead of answering inline.
// Silent-fails on any error; never blocks the prompt.

let raw = "";
process.stdin.on("data", (chunk) => (raw += chunk));
process.stdin.on("end", () => {
  try {
    const payload = JSON.parse(raw);
    const prompt = Array.isArray(payload.prompt) ? payload.prompt.join(" ") : String(payload.prompt || "");

    if (!/\boryna\b/i.test(prompt)) process.exit(0);

    const ctx =
      "Keyword trigger: the user summoned the oryna advisor. If this prompt is instead about editing/configuring the oryna setup itself (its agent file, this hook, or its settings.json entry) rather than asking it for a decision, this is a false trigger - handle the prompt normally and do not launch the agent. Otherwise: launch the Agent tool with subagent_type 'rabustack:oryna' now (oryna now ships from the planship plugin). Pass it the user's decision/question verbatim, plus the minimum context it needs: relevant file paths, constraints, options already on the table, and what the user is currently leaning toward (labeled as such). Do NOT answer the decision yourself and do NOT pre-judge the options in the prompt you send. Relay the advisor's full verdict back to the user when it returns.";

    console.log(JSON.stringify({
      systemMessage: "\u{1F9D3} Oryna summoned - researching before verdict.",
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: ctx
      }
    }));
    process.exit(0);
  } catch {
    process.exit(0);
  }
});
