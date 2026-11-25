#!/usr/bin/env node
// SessionStart hook — backstop. Cross-platform (Node, no external deps). Scans
// <home>/.discovery for (1) runs whose loop ended READY or BLOCKED but whose retro is still
// pending, and (2) deliverables recorded as pending by the sync layer (lib/sync-state.cjs).
// Reminds Claude to finish both. Store-blind. Never throws.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pendingDeliverables } = require('./lib/sync-state.cjs');

function pendingRetros(home) {
  const base = path.join(home, '.discovery');
  if (!fs.existsSync(base)) return [];
  const slugs = [];
  for (const slug of fs.readdirSync(base)) {
    try {
      const ledger = path.join(base, slug, 'state.json');
      if (!fs.existsSync(ledger)) continue;
      const led = JSON.parse(fs.readFileSync(ledger, 'utf8'));
      if ((led.phase === 'ready' || led.phase === 'blocked') && led.retro === 'pending') slugs.push(slug);
    } catch (e) { /* skip malformed ledger */ }
  }
  return slugs;
}

try {
  const home = os.homedir();
  const retros = pendingRetros(home);
  const pending = pendingDeliverables(home);

  const messages = [];
  if (retros.length) {
    messages.push(
      `Unfinished discovery detected — loop(s) ended READY or BLOCKED with a pending retro: ${retros.join(', ')}. ` +
      `Before other work, run the orbitant-discovery-retro skill to produce the hand-off file and set ` +
      `"retro":"done" in the corresponding <home>/.discovery/<slug>/state.json.`
    );
  }
  if (pending.length) {
    messages.push(
      `Discovery deliverables not yet kept in their store: ${pending.map((p) => `${p.slug} (${p.types.join(', ')})`).join('; ')}. ` +
      `Dispatch the deliverable-sync agent for each listed deliverable (slug and type as shown), one at a time per slug, ` +
      `with the sync skill at \`${path.join(__dirname, '..', 'skills', 'sync-deliverable', 'SKILL.md')}\`; ` +
      `in a runtime without sub-agents, run the orbitant-sync-deliverable skill instead.`
    );
  }

  if (messages.length) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: messages.join('\n\n'),
      },
    }));
  }
} catch (e) {
  // Silent by design.
}
process.exit(0);
