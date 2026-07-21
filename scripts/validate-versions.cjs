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
  if (mismatches.length > 0) {
    for (const m of mismatches) {
      console.error(`❌ ${m.name}: plugin.json=${m.plugin} but marketplace.json=${m.marketplace}`);
    }
    process.exit(1);
  }
  console.log('✅ plugin.json versions match marketplace.json');
}

module.exports = { findVersionMismatches };

if (require.main === module) {
  main();
}
