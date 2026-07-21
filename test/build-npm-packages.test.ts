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

// Symlinks every vertical package into the meta package's own node_modules, so the meta's
// generated dist/index.js and dist/index.d.ts can resolve their bare `@weorbitant/orbitant-*`
// specifiers both at runtime (Node) and at type-check time (tsc). Idempotent — safe to call
// from multiple tests regardless of execution order.
function linkVerticalsIntoMeta(): void {
  const metaDir = pkgDir('orbitant-os');
  const scopeNodeModules = path.join(metaDir, 'node_modules', SCOPE);
  fs.mkdirSync(scopeNodeModules, { recursive: true });

  for (const v of VERTICALS) {
    const linkPath = path.join(scopeNodeModules, `orbitant-${v}`);
    const target = pkgDir(`orbitant-${v}`);
    fs.rmSync(linkPath, { force: true }); // idempotent: drop any stale link from a prior run first
    fs.symlinkSync(target, linkPath, 'dir');
  }
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

test('a freshly created git-ignored file is never shipped, whatever pattern ignores it', () => {
  // Non-vacuous version of the test above: those paths don't exist on disk in a clean checkout,
  // so a hardcoded denylist that merely happens to list them would pass trivially. Here we create
  // git-ignored files that are NOT on any hardcoded list — matched only by the generic *.log and
  // *.tmp patterns in .gitignore — rebuild, and assert they were excluded. This proves exclusion
  // is driven by .gitignore itself, not a partial hand-maintained mirror of it.
  const debugLog = path.join(ROOT, 'plugins/orbitant-marketing/skills/tone/debug.log'); // matched by `*.log`
  const scratchTmp = path.join(ROOT, 'plugins/orbitant-marketing/skills/tone/scratch.tmp'); // matched by `*.tmp`

  try {
    fs.writeFileSync(debugLog, 'debug output, must never ship\n');
    fs.writeFileSync(scratchTmp, 'scratch, must never ship\n');

    // Precondition: confirm git itself considers both files ignored (throws / non-zero exit otherwise).
    const ignored = execFileSync('git', ['check-ignore', debugLog, scratchTmp], { cwd: ROOT, encoding: 'utf-8' });
    assert.equal(ignored.trim().split('\n').filter(Boolean).length, 2);

    fs.rmSync(DIST_DIR, { recursive: true, force: true });
    buildAll();

    assert.ok(
      !fs.existsSync(path.join(pkgDir('orbitant-marketing'), 'skills/tone/debug.log')),
      '*.log files must never be copied into the staged package',
    );
    assert.ok(
      !fs.existsSync(path.join(pkgDir('orbitant-marketing'), 'skills/tone/scratch.tmp')),
      '*.tmp files must never be copied into the staged package',
    );
    assert.ok(
      fs.existsSync(path.join(pkgDir('orbitant-marketing'), 'skills/tone/SKILL.md')),
      'sanity check: the real, tracked SKILL.md must still be copied',
    );
  } finally {
    fs.rmSync(debugLog, { force: true });
    fs.rmSync(scratchTmp, { force: true });
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
    buildAll(); // restore a clean dist for the remaining tests in this file
  }
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

test('meta aggregate index.d.ts mirrors index.js: value re-exports and value imports, never import-only types', () => {
  // A named import like `import { marketing } from '@weorbitant/orbitant-os'` is a VALUE use
  // (documented in the consumer docs). If the generated types re-export it via `import type`,
  // that named import becomes type-only and TS1361s at any real usage site — see the
  // `generated meta index.d.ts type-checks as a value import` test below for the end-to-end guard.
  const dts = fs.readFileSync(path.join(pkgDir('orbitant-os'), 'dist', 'index.d.ts'), 'utf-8');

  for (const v of VERTICALS) {
    const dep = `${SCOPE}/orbitant-${v}`;
    assert.match(dts, new RegExp(`^export \\{ default as ${v} \\} from '${dep}';$`, 'm'), `${v} must be re-exported as a value, not a type`);
    assert.match(dts, new RegExp(`^import ${v} from '${dep}';$`, 'm'), `${v} must be a value import for the \`typeof\` in the brain shape`);
    assert.match(dts, new RegExp(`^\\s*${v}: typeof ${v};$`, 'm'));
  }

  assert.ok(!dts.includes('import type '), 'must contain no `import type` — those make named re-exports unusable as values');

  assert.match(dts, /^declare const brain: \{$/m);
  assert.match(dts, /^export default brain;$/m);
});

test('generated meta index.d.ts type-checks as a value import (guards TS1361)', () => {
  linkVerticalsIntoMeta(); // so the meta's own '@weorbitant/orbitant-*' specifiers resolve

  // Make '@weorbitant/orbitant-os' itself resolvable from the fixture: a symlink under a
  // node_modules next to the fixture, mirroring how a real consumer would have it installed.
  const fixtureNodeModules = path.join(ROOT, 'test/fixtures/node_modules', SCOPE);
  fs.mkdirSync(fixtureNodeModules, { recursive: true });
  const metaLinkPath = path.join(fixtureNodeModules, 'orbitant-os');
  fs.rmSync(metaLinkPath, { force: true });
  fs.symlinkSync(pkgDir('orbitant-os'), metaLinkPath, 'dir');

  try {
    execFileSync(
      'npx',
      // See the comment on the vertical smoke test above re: --skipLibCheck.
      ['tsc', '--noEmit', '--strict', '--skipLibCheck', '--moduleResolution', 'bundler', '--module', 'esnext', 'test/fixtures/smoke-meta.ts'],
      { cwd: ROOT, stdio: 'pipe' },
    );
  } finally {
    fs.rmSync(path.join(ROOT, 'test/fixtures/node_modules'), { recursive: true, force: true });
  }
});

test('meta aggregate module loads at runtime and resolves each vertical brain', async () => {
  const metaDir = pkgDir('orbitant-os');
  linkVerticalsIntoMeta();

  const mod = await import(pathToFileURL(path.join(metaDir, 'dist', 'index.js')).href);
  const brain = mod.default;

  assert.deepEqual(Object.keys(brain).sort(), [...VERTICALS].sort());
  assert.deepEqual(brain.marketing.meta, { name: 'orbitant-marketing', version: '1.5.0', vertical: 'marketing' });
  assert.equal(typeof brain.marketing.skills['orbitant-tone'].content, 'string');
  assert.ok(brain.marketing.skills['orbitant-tone'].content.length > 0);
});
