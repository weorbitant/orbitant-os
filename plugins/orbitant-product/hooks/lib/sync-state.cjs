'use strict';
const fs = require('fs');
const path = require('path');

function syncFile(home, slug) {
  return path.join(home, '.discovery', slug, 'sync.json');
}

function readState(file) {
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (e) {
    return {};
  }
}

function artifactsOf(state) {
  const artifacts = state.artifacts;
  return artifacts && typeof artifacts === 'object' && !Array.isArray(artifacts) ? artifacts : {};
}

function markPending({ home, slug, workdir, type, filePath }) {
  const file = syncFile(home, slug);
  const previous = readState(file);
  const artifacts = artifactsOf(previous);
  const prior = artifacts[type] || {};
  const sameRecord = prior.path === filePath;

  artifacts[type] = {
    path: filePath,
    status: 'pending',
    ref: sameRecord ? prior.ref || '' : '',
    synced_at: sameRecord ? prior.synced_at || '' : '',
  };

  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ ...previous, feature: slug, workdir, artifacts }, null, 2) + '\n');
}

function pendingDeliverables(home) {
  const base = path.join(home, '.discovery');
  if (!fs.existsSync(base)) return [];
  const pending = [];
  for (const slug of fs.readdirSync(base)) {
    const file = syncFile(home, slug);
    if (!fs.existsSync(file)) continue;
    const artifacts = artifactsOf(readState(file));
    const types = Object.keys(artifacts).filter((t) => artifacts[t] && artifacts[t].status === 'pending');
    if (types.length) pending.push({ slug, types });
  }
  return pending;
}

module.exports = { markPending, pendingDeliverables };
