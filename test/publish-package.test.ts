import { test } from 'node:test';
import assert from 'node:assert/strict';
// Importing the release-critical module also proves it loads (and does NOT run main()) on every PR.
import { preparePublish, missingDependencies, type BuiltPackage } from '../scripts/publish-package.ts';

const built = (name: string, version: string): BuiltPackage => ({ name, version });

test('preparePublish: returns the target when the tag version matches the built version', () => {
  const target = preparePublish('orbitant-marketing-v1.5.0', () => built('@orbitant/brain-marketing', '1.5.0'));
  assert.equal(target.pkgName, '@orbitant/brain-marketing');
  assert.equal(target.version, '1.5.0');
  assert.ok(target.dir.endsWith('/@orbitant/brain-marketing'));
});

test('preparePublish: throws on a version mismatch between tag and built package', () => {
  assert.throws(
    () => preparePublish('orbitant-marketing-v1.5.0', () => built('@orbitant/brain-marketing', '1.6.0')),
    /does not match built/,
  );
});

test('preparePublish: rejects a prerelease tag (not a release tag today)', () => {
  assert.throws(
    () => preparePublish('orbitant-marketing-v1.5.0-rc.1', () => built('x', 'x')),
    /not a package release tag/,
  );
});

test('preparePublish: rejects an unrelated tag', () => {
  assert.throws(() => preparePublish('v1.2.3', () => built('x', 'x')), /not a package release tag/);
});

test('missingDependencies: none when every dep is published', () => {
  const deps = { '@orbitant/brain-marketing': '1.5.0', '@orbitant/brain-operations': '1.0.0' };
  assert.deepEqual(missingDependencies(deps, () => true), []);
});

test('missingDependencies: lists deps absent from the registry', () => {
  const deps = { '@orbitant/brain-marketing': '1.5.0', '@orbitant/brain-operations': '1.0.0' };
  const isPublished = (name: string) => name.endsWith('marketing'); // operations not yet published
  assert.deepEqual(missingDependencies(deps, isPublished), ['@orbitant/brain-operations@1.0.0']);
});

test('missingDependencies: version-specific — same name, wrong version counts as missing', () => {
  const deps = { '@orbitant/brain-marketing': '1.6.0' };
  const isPublished = (_name: string, version: string) => version === '1.5.0';
  assert.deepEqual(missingDependencies(deps, isPublished), ['@orbitant/brain-marketing@1.6.0']);
});
