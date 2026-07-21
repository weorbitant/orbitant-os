import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { buildAll } from '../scripts/build-npm-packages.ts';
import { DIST_DIR, SCOPE } from '../scripts/lib/npm-packages.config.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

before(() => {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  buildAll();
});

function pkgDir(name: string): string {
  return path.join(DIST_DIR, SCOPE, name);
}

test('marketing package.json has version from plugin.json', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir('orbitant-marketing'), 'package.json'), 'utf-8'));
  assert.equal(pkg.name, '@weorbitant/orbitant-marketing');
  assert.equal(pkg.version, '1.5.0');
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.publishConfig.registry, 'https://npm.pkg.github.com');
  assert.equal(pkg.exports['.'].import, './dist/index.js');
  assert.equal(pkg.exports['.'].types, './dist/index.d.ts');
});

test('marketing manifest lists every skill on disk', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(pkgDir('orbitant-marketing'), 'manifest.json'), 'utf-8'));
  const folders = manifest.skills.map((s: { folder: string }) => s.folder).sort();
  const onDisk = fs
    .readdirSync(path.join(ROOT, 'plugins/orbitant-marketing/skills'))
    .filter((d) => fs.existsSync(path.join(ROOT, 'plugins/orbitant-marketing/skills', d, 'SKILL.md')))
    .sort();
  assert.deepEqual(folders, onDisk);
  assert.equal(manifest.meta.vertical, 'marketing');
});

test('content is copied verbatim into the staged package', () => {
  const staged = fs.readFileSync(path.join(pkgDir('orbitant-marketing'), 'skills/tone/SKILL.md'), 'utf-8');
  const source = fs.readFileSync(path.join(ROOT, 'plugins/orbitant-marketing/skills/tone/SKILL.md'), 'utf-8');
  assert.equal(staged, source);
});

test('local-only ignored artifacts are not shipped', () => {
  assert.ok(!fs.existsSync(path.join(pkgDir('orbitant-marketing'), 'skills/image-creation/output')));
  assert.ok(!fs.existsSync(path.join(pkgDir('orbitant-marketing'), 'skills/image-creation/scripts/.env')));
});

test('generated index type-checks against a consumer smoke file', () => {
  execFileSync(
    'npx',
    // --skipLibCheck: tsc ignores tsconfig.json when given explicit file args (per TS docs), so it
    // falls back to auto-including every package under node_modules/@types from cwd. That pulls in
    // @types/mdx (a transitive devDependency of @astrojs/starlight for the website's MDX support),
    // whose ambient script references the global JSX namespace unconditionally and fails without
    // @types/react — unrelated to this package's generated types. skipLibCheck only skips
    // re-validating .d.ts internals; it still fully checks how the consumer *uses* our index.d.ts.
    ['tsc', '--noEmit', '--strict', '--skipLibCheck', '--moduleResolution', 'bundler', '--module', 'esnext', 'test/fixtures/smoke-vertical.ts'],
    { cwd: ROOT, stdio: 'pipe' },
  );
});
