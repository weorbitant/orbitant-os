import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { findVersionMismatches, findPresenceMismatches } = require('../scripts/validate-versions.cjs');

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

test('presence: no issues when both sides list the same plugins', () => {
  const marketplace = { plugins: [{ name: 'orbitant-marketing', version: '1.5.0' }] };
  const pluginVersions = { 'orbitant-marketing': '1.5.0' };
  assert.deepEqual(findPresenceMismatches(marketplace, pluginVersions), []);
});

test('presence: flags a plugin on disk that is missing from marketplace.json', () => {
  const marketplace = { plugins: [] };
  const pluginVersions = { 'orbitant-marketing': '1.5.0' };
  assert.deepEqual(findPresenceMismatches(marketplace, pluginVersions), [
    { name: 'orbitant-marketing', issue: 'missing-from-marketplace' },
  ]);
});

test('presence: flags a marketplace entry that has no plugin.json on disk', () => {
  const marketplace = { plugins: [{ name: 'orbitant-ghost', version: '1.0.0' }] };
  const pluginVersions = {};
  assert.deepEqual(findPresenceMismatches(marketplace, pluginVersions), [
    { name: 'orbitant-ghost', issue: 'missing-on-disk' },
  ]);
});
