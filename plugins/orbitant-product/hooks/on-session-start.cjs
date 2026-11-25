#!/usr/bin/env node
// SessionStart hook — backstop. Cross-platform (Node, no external deps). Scans
// <home>/.discovery for (1) runs whose loop ended READY or BLOCKED but whose retro is still
// pending, and (2) deliverables written but not yet synced to the discovery store (sync.json
// items with status "pending"). Reminds Claude to finish both. A user-level base makes this
// reliable regardless of git, cwd, or OS. Never throws.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

try {
  const base = path.join(os.homedir(), '.discovery');
  if (!fs.existsSync(base)) process.exit(0);

  const pendingRetro = [];
  const pendingSync = [];
  for (const slug of fs.readdirSync(base)) {
    try {
      const ledger = path.join(base, slug, 'state.json');
      if (fs.existsSync(ledger)) {
        const led = readJson(ledger);
        if ((led.phase === 'ready' || led.phase === 'blocked') && led.retro === 'pending') pendingRetro.push(slug);
      }
    } catch (e) { /* skip malformed ledger */ }
    try {
      const syncFile = path.join(base, slug, 'sync.json');
      if (fs.existsSync(syncFile)) {
        const artifacts = readJson(syncFile).artifacts || {};
        const types = Object.keys(artifacts).filter((t) => artifacts[t] && artifacts[t].status === 'pending');
        if (types.length) pendingSync.push(`${slug} (${types.join(', ')})`);
      }
    } catch (e) { /* skip malformed sync state */ }
  }

  const messages = [];
  if (pendingRetro.length) {
    messages.push(
      `Unfinished discovery detected — loop(s) ended READY or BLOCKED with a pending retro: ${pendingRetro.join(', ')}. ` +
      `Before other work, run the discovery-retro skill to produce the hand-off file and set ` +
      `"retro":"done" in the corresponding <home>/.discovery/<slug>/state.json.`
    );
  }
  if (pendingSync.length) {
    messages.push(
      `Discovery deliverables not yet synced to the discovery store: ${pendingSync.join('; ')}. ` +
      `Run the sync-deliverable skill for each listed deliverable (slug and type as shown).`
    );
  }

  if (messages.length) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: messages.join('\n\n')
      }
    }));
  }
} catch (e) {
  // Silent by design.
}
process.exit(0);
