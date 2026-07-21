import { test } from 'node:test';
import assert from 'node:assert/strict';
// Importing the release-critical module also proves it loads (and does NOT run main()) on every PR.
import { missingDependencies } from '../scripts/publish-package.ts';

test('missingDependencies: none when every dep is published', () => {
  const deps = { '@weorbitant/orbitant-marketing': '1.5.0', '@weorbitant/orbitant-operations': '1.0.0' };
  assert.deepEqual(missingDependencies(deps, () => true), []);
});

test('missingDependencies: lists deps absent from the registry (fail-closed input)', () => {
  const deps = { '@weorbitant/orbitant-marketing': '1.5.0', '@weorbitant/orbitant-operations': '1.0.0' };
  const isPublished = (name: string) => name.endsWith('marketing'); // operations not yet published
  assert.deepEqual(missingDependencies(deps, isPublished), ['@weorbitant/orbitant-operations@1.0.0']);
});

test('missingDependencies: version-specific — same name, wrong version counts as missing', () => {
  const deps = { '@weorbitant/orbitant-marketing': '1.6.0' };
  const isPublished = (_name: string, version: string) => version === '1.5.0';
  assert.deepEqual(missingDependencies(deps, isPublished), ['@weorbitant/orbitant-marketing@1.6.0']);
});
