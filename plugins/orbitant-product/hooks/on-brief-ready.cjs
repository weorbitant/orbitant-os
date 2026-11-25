#!/usr/bin/env node
// PostToolUse hook — precise trigger. Cross-platform (Node, no external deps: no bash,
// jq, find or git). When the orchestrator writes a discovery ledger marking the loop ended
// (READY or BLOCKED) with the retro still pending, tell Claude to run discovery-retro now. Idempotent
// (silent once retro flips to "done"). Never throws — a hook must not break the session.
'use strict';
const fs = require('fs');
const path = require('path');

try {
  const input = JSON.parse(fs.readFileSync(0, 'utf8'));
  const filePath = input && input.tool_input && input.tool_input.file_path;
  if (!filePath) process.exit(0);

  // Match a discovery ledger: <...>/.discovery/<slug>/state.json  (any OS separators).
  const norm = path.normalize(filePath);
  if (path.basename(norm) !== 'state.json') process.exit(0);
  const slugDir = path.dirname(norm);
  if (path.basename(path.dirname(slugDir)) !== '.discovery') process.exit(0);
  if (!fs.existsSync(norm)) process.exit(0);

  const led = JSON.parse(fs.readFileSync(norm, 'utf8'));
  if ((led.phase === 'ready' || led.phase === 'blocked') && led.retro === 'pending') {
    const slug = path.basename(slugDir);
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext:
          `The discovery loop for '${slug}' just ended (${led.phase}) and its retro is pending. ` +
          `Run the discovery-retro skill now on this session to produce the hand-off file, ` +
          `then set "retro":"done" in ${norm}.`
      }
    }));
  }
} catch (e) {
  // Silent by design: never break the session on a hook error.
}
process.exit(0);
