#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function findVersionMismatches(marketplace, pluginVersions) {
  const mismatches = [];
  for (const entry of marketplace.plugins) {
    const actual = pluginVersions[entry.name];
    if (actual !== undefined && actual !== entry.version) {
      mismatches.push({ name: entry.name, plugin: actual, marketplace: entry.version });
    }
  }
  return mismatches;
}

// Catch the "Do NOT forget to update marketplace.json" case (and its inverse): a plugin that
// exists on disk but isn't listed in the marketplace, or a marketplace entry with no plugin dir.
function findPresenceMismatches(marketplace, pluginVersions) {
  const issues = [];
  const inMarketplace = new Set(marketplace.plugins.map((p) => p.name));
  for (const name of Object.keys(pluginVersions)) {
    if (!inMarketplace.has(name)) {
      issues.push({ name, issue: 'missing-from-marketplace' });
    }
  }
  for (const name of inMarketplace) {
    if (pluginVersions[name] === undefined) {
      issues.push({ name, issue: 'missing-on-disk' });
    }
  }
  return issues;
}

function main() {
  const root = path.join(__dirname, '..');
  const marketplace = JSON.parse(fs.readFileSync(path.join(root, '.claude-plugin', 'marketplace.json'), 'utf8'));
  const pluginsDir = path.join(root, 'plugins');

  const pluginVersions = {};
  for (const dir of fs.readdirSync(pluginsDir)) {
    const pj = path.join(pluginsDir, dir, '.claude-plugin', 'plugin.json');
    if (fs.existsSync(pj)) {
      const data = JSON.parse(fs.readFileSync(pj, 'utf8'));
      pluginVersions[data.name] = data.version;
    }
  }

  const mismatches = findVersionMismatches(marketplace, pluginVersions);
  const presence = findPresenceMismatches(marketplace, pluginVersions);

  for (const m of mismatches) {
    console.error(`❌ ${m.name}: plugin.json=${m.plugin} but marketplace.json=${m.marketplace}`);
  }
  for (const p of presence) {
    if (p.issue === 'missing-from-marketplace') {
      console.error(`❌ ${p.name}: has plugin.json but is not listed in marketplace.json`);
    } else {
      console.error(`❌ ${p.name}: listed in marketplace.json but has no plugin.json on disk`);
    }
  }

  if (mismatches.length > 0 || presence.length > 0) {
    process.exit(1);
  }
  console.log('✅ plugin.json versions and marketplace.json entries are consistent');
}

module.exports = { findVersionMismatches, findPresenceMismatches };

if (require.main === module) {
  main();
}
