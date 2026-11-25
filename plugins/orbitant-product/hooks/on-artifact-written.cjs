#!/usr/bin/env node
// PostToolUse hook. Cross-platform (Node, no external deps). When a discovery deliverable is
// written or edited at <workdir>/discovery/<slug>/<file>, it reads the content and runs the
// core's checks (lib/deliverable-checks.cjs). A failing check goes back to Claude as feedback
// and nothing is recorded. A passing deliverable is handed to the sync layer
// (lib/sync-state.cjs), which marks it pending, and Claude is asked to dispatch the
// deliverable-sync agent. Store-blind: it never reads store.json and never names a store.
// Never throws — a hook must not break the session.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { checkDeliverable } = require('./lib/deliverable-checks.cjs');
const { markPending } = require('./lib/sync-state.cjs');

const RETRO_FILE = /^RETRO-\d{4}-\d{2}-\d{2}\.md$/;

function deliverableType(fileName) {
  if (fileName === 'PROBLEM_BRIEF.md') return 'brief';
  if (fileName === 'STRESS_TEST.md') return 'stress_test';
  if (RETRO_FILE.test(fileName)) return 'retro';
  return null;
}

function emit(output) {
  process.stdout.write(JSON.stringify(output));
}

try {
  const input = JSON.parse(fs.readFileSync(0, 'utf8'));
  const filePath = input && input.tool_input && input.tool_input.file_path;
  if (!filePath) process.exit(0);

  const norm = path.normalize(filePath);
  const fileName = path.basename(norm);
  const type = deliverableType(fileName);
  if (!type) process.exit(0);

  const slugDir = path.dirname(norm);
  const discoveryDir = path.dirname(slugDir);
  if (path.basename(discoveryDir) !== 'discovery') process.exit(0);
  const slug = path.basename(slugDir);
  const workdir = path.dirname(discoveryDir);

  let content;
  try {
    content = fs.readFileSync(norm, 'utf8');
  } catch (e) {
    process.exit(0);
  }

  const failures = checkDeliverable(type, content);
  if (failures.length) {
    emit({
      decision: 'block',
      reason:
        `${fileName} is not valid yet: ` +
        failures.map((f) => `${f.id}: ${f.reason}`).join('; ') +
        '. Rewrite it to fix this; its card in references/deliverables.md has the full contract.',
    });
    process.exit(0);
  }

  markPending({ home: os.homedir(), slug, workdir, type, filePath: norm });

  const syncSkill = path.join(__dirname, '..', 'skills', 'sync-deliverable', 'SKILL.md');
  emit({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext:
        `Deliverable \`${type}\` of discovery \`${slug}\` is valid and pending. ` +
        `Dispatch the deliverable-sync agent for it now with slug \`${slug}\`, type \`${type}\` ` +
        `and the sync skill at \`${syncSkill}\`; ` +
        `in a runtime without sub-agents, run the orbitant-sync-deliverable skill instead.`,
    },
  });
} catch (e) {
  // Silent by design: never break the session on a hook error.
}
process.exit(0);
