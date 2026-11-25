#!/usr/bin/env node
// PostToolUse hook — sync trigger. Cross-platform (Node, no external deps). When a discovery
// deliverable is written or edited at <workdir>/discovery/<slug>/<file>, mark it pending in
// <home>/.discovery/<slug>/sync.json and tell Claude to run the sync-deliverable skill. The
// sync state is store-agnostic: only that skill knows where deliverables are mirrored.
// Never throws — a hook must not break the session.
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');

const RETRO_FILE = /^RETRO-\d{4}-\d{2}-\d{2}\.md$/;

function artifactType(fileName) {
  if (fileName === 'PROBLEM_BRIEF.md') return 'brief';
  if (fileName === 'STRESS_TEST.md') return 'stress_test';
  if (RETRO_FILE.test(fileName)) return 'retro';
  return null;
}

function readState(syncPath) {
  try {
    const parsed = JSON.parse(fs.readFileSync(syncPath, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {}; // missing or corrupt: rebuild rather than drop the sync
  }
}

try {
  const input = JSON.parse(fs.readFileSync(0, 'utf8'));
  const filePath = input && input.tool_input && input.tool_input.file_path;
  if (!filePath) process.exit(0);

  const norm = path.normalize(filePath);
  const type = artifactType(path.basename(norm));
  if (!type) process.exit(0);

  const slugDir = path.dirname(norm);
  const discoveryDir = path.dirname(slugDir);
  if (path.basename(discoveryDir) !== 'discovery') process.exit(0);
  const slug = path.basename(slugDir);
  const workdir = path.dirname(discoveryDir);

  const stateDir = path.join(os.homedir(), '.discovery', slug);
  const syncPath = path.join(stateDir, 'sync.json');
  const previous = readState(syncPath);
  const artifacts =
    previous.artifacts && typeof previous.artifacts === 'object' && !Array.isArray(previous.artifacts)
      ? previous.artifacts
      : {};
  const prior = artifacts[type] || {};
  // A record is only reused for the same file: a new retro date, or the same slug in another
  // folder, is a different record.
  const sameRecord = prior.path === norm;

  artifacts[type] = {
    path: norm,
    status: 'pending',
    ref: sameRecord ? prior.ref || '' : '',
    synced_at: sameRecord ? prior.synced_at || '' : '',
  };

  fs.mkdirSync(stateDir, { recursive: true });
  fs.writeFileSync(syncPath, JSON.stringify({ ...previous, feature: slug, workdir, artifacts }, null, 2) + '\n');

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext:
        `Deliverable \`${type}\` of discovery \`${slug}\` was written. ` +
        `Run the sync-deliverable skill for it now (slug \`${slug}\`, type \`${type}\`).`
    }
  }));
} catch (e) {
  // Silent by design: never break the session on a hook error.
}
process.exit(0);
