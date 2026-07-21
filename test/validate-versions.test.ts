import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { findVersionMismatches } = require('../scripts/validate-versions.cjs');

test('no mismatch when versions align', () => {
  const marketplace = { plugins: [{ name: 'orbitant-marketing', version: '1.5.0' }] };
  const pluginVersions = { 'orbitant-marketing': '1.5.0' };
  assert.deepEqual(findVersionMismatches(marketplace, pluginVersions), []);
});

test('reports a mismatch when plugin.json drifts from marketplace', () => {
  const marketplace = { plugins: [{ name: 'orbitant-marketing', version: '1.5.0' }] };
  const pluginVersions = { 'orbitant-marketing': '1.6.0' };
  assert.deepEqual(findVersionMismatches(marketplace, pluginVersions), [
    { name: 'orbitant-marketing', plugin: '1.6.0', marketplace: '1.5.0' },
  ]);
});
