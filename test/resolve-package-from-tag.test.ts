import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePackageFromTag } from '../scripts/lib/resolve-package-from-tag.ts';

test('resolves a vertical tag', () => {
  const r = resolvePackageFromTag('orbitant-marketing-v1.5.0');
  assert.equal(r?.pkgName, '@weorbitant/orbitant-marketing');
  assert.equal(r?.version, '1.5.0');
  assert.ok(r?.dir.endsWith('/@weorbitant/orbitant-marketing'));
});

test('resolves the meta tag', () => {
  const r = resolvePackageFromTag('orbitant-os-v1.0.0');
  assert.equal(r?.pkgName, '@weorbitant/orbitant-os');
  assert.equal(r?.version, '1.0.0');
});

test('returns null for an unrelated tag', () => {
  assert.equal(resolvePackageFromTag('v1.2.3'), null);
  assert.equal(resolvePackageFromTag('orbitant-marketing'), null);
});
