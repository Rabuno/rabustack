const ctx = 'If this prompt is a non-trivial coding task (not a typo fix/one-liner/simple question), invoke the Skill tool "adaptive-plan-mode" before editing code.';
console.log(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "UserPromptSubmit",
    additionalContext: ctx
  }
}));
