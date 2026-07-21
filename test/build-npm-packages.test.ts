import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { buildAll } from '../scripts/build-npm-packages.ts';
import { DIST_DIR, SCOPE } from '../scripts/lib/npm-packages.config.ts';

const VERTICALS = ['marketing', 'operations', 'engineering'];

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

test('meta package pins exact vertical versions and declares subpaths', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir('orbitant-os'), 'package.json'), 'utf-8'));
  assert.equal(pkg.name, '@weorbitant/orbitant-os');
  assert.equal(pkg.dependencies['@weorbitant/orbitant-marketing'], '1.5.0');
  assert.equal(pkg.dependencies['@weorbitant/orbitant-operations'], '1.0.0');
  assert.equal(pkg.dependencies['@weorbitant/orbitant-engineering'], '0.2.0');
  assert.equal(pkg.exports['./marketing'].import, './dist/marketing.js');
  assert.equal(pkg.exports['.'].import, './dist/index.js');
});

test('meta package emits a re-export module per vertical (exact content)', () => {
  for (const v of VERTICALS) {
    const dep = `${SCOPE}/orbitant-${v}`;
    const expected = `export * from '${dep}';\nexport { default } from '${dep}';\n`;
    const js = fs.readFileSync(path.join(pkgDir('orbitant-os'), 'dist', `${v}.js`), 'utf-8');
    const dts = fs.readFileSync(path.join(pkgDir('orbitant-os'), 'dist', `${v}.d.ts`), 'utf-8');
    assert.equal(js, expected, `${v}.js must match the generator's exact re-export shape`);
    assert.equal(dts, expected, `${v}.d.ts must match the generator's exact re-export shape`);
  }
});

test('meta aggregate index.js declares exports, imports, and the brain object for every vertical', () => {
  const js = fs.readFileSync(path.join(pkgDir('orbitant-os'), 'dist', 'index.js'), 'utf-8');

  for (const v of VERTICALS) {
    const dep = `${SCOPE}/orbitant-${v}`;
    assert.match(js, new RegExp(`^export \\{ default as ${v} \\} from '${dep}';$`, 'm'));
    assert.match(js, new RegExp(`^import ${v} from '${dep}';$`, 'm'));
  }

  const brainMatch = js.match(/const brain = \{([^}]*)\};/);
  assert.ok(brainMatch, 'a `const brain = { ... };` object literal must be present');
  const brainProps = brainMatch![1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  assert.deepEqual(brainProps.sort(), [...VERTICALS].sort(), 'brain object must aggregate exactly the three verticals, no more no less');

  assert.match(js, /^export default brain;$/m);
});

test('meta aggregate index.d.ts declares the brain shape for every vertical', () => {
  const dts = fs.readFileSync(path.join(pkgDir('orbitant-os'), 'dist', 'index.d.ts'), 'utf-8');

  for (const v of VERTICALS) {
    const dep = `${SCOPE}/orbitant-${v}`;
    assert.match(dts, new RegExp(`^import type ${v} from '${dep}';$`, 'm'));
    assert.match(dts, new RegExp(`^\\s*${v}: typeof ${v};$`, 'm'));
  }

  const exportLineMatch = dts.match(/^export \{ (.+) \};$/m);
  assert.ok(exportLineMatch, 'a top-level `export { ... };` line re-exporting the vertical types must be present');
  const exportedNames = exportLineMatch![1].split(',').map((s) => s.trim());
  assert.deepEqual(exportedNames.sort(), [...VERTICALS].sort(), 'must re-export exactly the three verticals, no more no less');

  assert.match(dts, /^declare const brain: \{$/m);
  assert.match(dts, /^export default brain;$/m);
});

test('meta aggregate module loads at runtime and resolves each vertical brain', async () => {
  const metaDir = pkgDir('orbitant-os');
  const scopeNodeModules = path.join(metaDir, 'node_modules', SCOPE);
  fs.mkdirSync(scopeNodeModules, { recursive: true });

  for (const v of VERTICALS) {
    const linkPath = path.join(scopeNodeModules, `orbitant-${v}`);
    const target = pkgDir(`orbitant-${v}`);
    fs.rmSync(linkPath, { force: true }); // idempotent: drop any stale link from a prior run first
    fs.symlinkSync(target, linkPath, 'dir');
  }

  const mod = await import(pathToFileURL(path.join(metaDir, 'dist', 'index.js')).href);
  const brain = mod.default;

  assert.deepEqual(Object.keys(brain).sort(), [...VERTICALS].sort());
  assert.deepEqual(brain.marketing.meta, { name: 'orbitant-marketing', version: '1.5.0', vertical: 'marketing' });
  assert.equal(typeof brain.marketing.skills['orbitant-tone'].content, 'string');
  assert.ok(brain.marketing.skills['orbitant-tone'].content.length > 0);
});
