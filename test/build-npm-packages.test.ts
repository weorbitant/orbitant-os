import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { buildAll, shipsVerbatim } from '../scripts/build-npm-packages.ts';
import { DIST_DIR, SCOPE, npmName } from '../scripts/lib/npm-packages.config.ts';

const VERTICALS = ['marketing', 'operations', 'engineering'];

// Source name (plugin folder, plugin.json, git tag) -> published npm name. Spelled out as
// literals so a change to the naming rule has to be made here on purpose.
const PACKAGES: Array<[source: string, published: string]> = [
  ['orbitant-marketing', 'brain-marketing'],
  ['orbitant-operations', 'brain-operations'],
  ['orbitant-engineering', 'brain-engineering'],
  ['orbitant-os', 'brain'],
];

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

before(() => {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  buildAll();
});

// Staged dirs are keyed by the PUBLISHED name (brain-marketing); everything else in the repo is
// keyed by the source name (orbitant-marketing), so take the source name and translate.
function pkgDir(sourceName: string): string {
  return path.join(DIST_DIR, SCOPE, npmName(sourceName));
}

// Read a vertical's version from its own plugin.json (the single source of truth) instead of
// hardcoding it, so a routine version bump doesn't break these tests. Still meaningful: it
// verifies the build propagates plugin.json -> the generated package/manifest, not the literal.
function pluginVersion(vertical: string): string {
  const pj = path.join(ROOT, 'plugins', `orbitant-${vertical}`, '.claude-plugin', 'plugin.json');
  return JSON.parse(fs.readFileSync(pj, 'utf-8')).version as string;
}

// Symlinks every vertical package into the meta package's own node_modules, so the meta's
// generated dist/index.js and dist/index.d.ts can resolve their bare `@orbitant/brain-*`
// specifiers both at runtime (Node) and at type-check time (tsc). Idempotent — safe to call
// from multiple tests regardless of execution order.
function linkVerticalsIntoMeta(): void {
  const metaDir = pkgDir('orbitant-os');
  const scopeNodeModules = path.join(metaDir, 'node_modules', SCOPE);
  fs.mkdirSync(scopeNodeModules, { recursive: true });

  for (const v of VERTICALS) {
    const linkPath = path.join(scopeNodeModules, `brain-${v}`);
    const target = pkgDir(`orbitant-${v}`);
    fs.rmSync(linkPath, { force: true }); // idempotent: drop any stale link from a prior run first
    fs.symlinkSync(target, linkPath, 'dir');
  }
}

test('marketing package.json has version from plugin.json', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir('orbitant-marketing'), 'package.json'), 'utf-8'));
  assert.equal(pkg.name, '@orbitant/brain-marketing');
  assert.equal(pkg.version, pluginVersion('marketing'));
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.publishConfig.registry, 'https://registry.npmjs.org');
  // Without this npm defaults a scoped package to restricted and the publish is rejected.
  assert.equal(pkg.publishConfig.access, 'public');
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
  assert.equal(pkg.name, '@orbitant/brain');
  assert.equal(pkg.publishConfig.access, 'public');
  assert.equal(pkg.dependencies['@orbitant/brain-marketing'], pluginVersion('marketing'));
  assert.equal(pkg.dependencies['@orbitant/brain-operations'], pluginVersion('operations'));
  assert.equal(pkg.dependencies['@orbitant/brain-engineering'], pluginVersion('engineering'));
  assert.equal(pkg.exports['./marketing'].import, './dist/marketing.js');
  assert.equal(pkg.exports['.'].import, './dist/index.js');
});

test('meta package emits a re-export module per vertical (exact content)', () => {
  for (const v of VERTICALS) {
    const dep = `${SCOPE}/brain-${v}`;
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
    const dep = `${SCOPE}/brain-${v}`;
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
  // A named import like `import { marketing } from '@orbitant/brain'` is a VALUE use
  // (documented in the consumer docs). If the generated types re-export it via `import type`,
  // that named import becomes type-only and TS1361s at any real usage site — see the
  // `generated meta index.d.ts type-checks as a value import` test below for the end-to-end guard.
  const dts = fs.readFileSync(path.join(pkgDir('orbitant-os'), 'dist', 'index.d.ts'), 'utf-8');

  for (const v of VERTICALS) {
    const dep = `${SCOPE}/brain-${v}`;
    assert.match(dts, new RegExp(`^export \\{ default as ${v} \\} from '${dep}';$`, 'm'), `${v} must be re-exported as a value, not a type`);
    assert.match(dts, new RegExp(`^import ${v} from '${dep}';$`, 'm'), `${v} must be a value import for the \`typeof\` in the brain shape`);
    assert.match(dts, new RegExp(`^\\s*${v}: typeof ${v};$`, 'm'));
  }

  assert.ok(!dts.includes('import type '), 'must contain no `import type` — those make named re-exports unusable as values');

  assert.match(dts, /^declare const brain: \{$/m);
  assert.match(dts, /^export default brain;$/m);
});

test('generated meta index.d.ts type-checks as a value import (guards TS1361)', () => {
  linkVerticalsIntoMeta(); // so the meta's own '@orbitant/brain-*' specifiers resolve

  // Make '@orbitant/brain' itself resolvable from the fixture: a symlink under a
  // node_modules next to the fixture, mirroring how a real consumer would have it installed.
  const fixtureNodeModules = path.join(ROOT, 'test/fixtures/node_modules', SCOPE);
  fs.mkdirSync(fixtureNodeModules, { recursive: true });
  const metaLinkPath = path.join(fixtureNodeModules, 'brain');
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
  assert.deepEqual(brain.marketing.meta, { name: 'orbitant-marketing', version: pluginVersion('marketing'), vertical: 'marketing' });
  assert.equal(typeof brain.marketing.skills['orbitant-tone'].content, 'string');
  assert.ok(brain.marketing.skills['orbitant-tone'].content.length > 0);
});

test('npm pack --dry-run ships dist/manifest/skills/package.json and excludes junk', () => {
  const out = execFileSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: pkgDir('orbitant-marketing'),
    encoding: 'utf-8',
  });
  const files: string[] = JSON.parse(out)[0].files.map((f: { path: string }) => f.path);
  assert.ok(files.includes('dist/index.js'), 'ships the entry point');
  assert.ok(files.includes('manifest.json'), 'ships the manifest');
  assert.ok(files.includes('package.json'), 'ships package.json');
  assert.ok(files.includes('README.md'), 'ships the README the registry renders on the package page');
  assert.ok(files.some((f) => f.startsWith('skills/')), 'ships skill content');
  assert.ok(!files.some((f) => f.includes('node_modules')), 'never ships node_modules');
  assert.ok(!files.some((f) => f.endsWith('.env')), 'never ships a .env');
});

test('every staged package leads with a README titled after itself', () => {
  for (const [source, published] of PACKAGES) {
    const readme = fs.readFileSync(path.join(pkgDir(source), 'README.md'), 'utf-8');
    assert.equal(readme.split('\n')[0], `# ${SCOPE}/${published}`);
  }
});

test('the marketing README states the version from plugin.json', () => {
  const readme = fs.readFileSync(path.join(pkgDir('orbitant-marketing'), 'README.md'), 'utf-8');
  assert.ok(readme.includes(`**v${pluginVersion('marketing')}**`), 'a bump must reach the page, not just package.json');
});

// The manifest is verified against the skills on disk by the test above, so matching the Keys
// section to the manifest transitively pins it to disk.
test('the README Keys section lists exactly the shipped skills', () => {
  const dir = pkgDir('orbitant-marketing');
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf-8'));
  const readme = fs.readFileSync(path.join(dir, 'README.md'), 'utf-8');

  const line = readme.split('\n').find((l) => l.startsWith('- **skills** —'));
  assert.ok(line, 'a skills line must be present');
  const listed = [...line!.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
  assert.deepEqual(listed, manifest.skills.map((s: { name: string }) => s.name));
});

// The generated README is written after the verbatim copy, so it wins on order alone. shipsVerbatim
// is what makes that independent of order — assert it directly, or the guard is untestable.
test('a plugin root README is excluded from the verbatim copy, a skill README is not', () => {
  assert.equal(shipsVerbatim('README.md'), false);
  assert.equal(shipsVerbatim('skills/image-creation/README.md'), true);
});

test("the staged operations README is the generated one, not the plugin's own doc", () => {
  const handWritten = path.join(ROOT, 'plugins/orbitant-operations/README.md');
  assert.ok(fs.existsSync(handWritten), 'precondition: operations still documents itself in-repo');

  const staged = fs.readFileSync(path.join(pkgDir('orbitant-operations'), 'README.md'), 'utf-8');
  assert.notEqual(staged.split('\n')[0], fs.readFileSync(handWritten, 'utf-8').split('\n')[0]);
  assert.ok(!staged.includes('/plugin install'), 'the package README documents importing, not installing a plugin');
});

test('the meta README tabulates every vertical it pins', () => {
  const readme = fs.readFileSync(path.join(pkgDir('orbitant-os'), 'README.md'), 'utf-8');
  for (const v of VERTICALS) {
    assert.ok(readme.includes(`| \`${v}\` | \`${SCOPE}/brain-${v}\` | ${pluginVersion(v)} |`), `${v} must be listed with its pinned version`);
  }
});

test('build throws (never silently drops a skill) when a SKILL.md has broken frontmatter', () => {
  // A skill whose frontmatter cannot be parsed is dropped to null upstream; without the integrity
  // guard it would just vanish from the published package. Create one with malformed YAML, confirm
  // the build fails loudly, then restore a clean dist for any later run.
  const brokenDir = path.join(ROOT, 'plugins/orbitant-marketing/skills/__broken_frontmatter__');
  fs.mkdirSync(brokenDir, { recursive: true });
  fs.writeFileSync(path.join(brokenDir, 'SKILL.md'), '---\nname: [unterminated flow sequence\n---\nbody\n');
  try {
    assert.throws(() => buildAll(), /present but not parsed/);
  } finally {
    fs.rmSync(brokenDir, { recursive: true, force: true });
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
    buildAll();
  }
});

test('build throws when an agent .md has broken frontmatter (completeness covers agents too)', () => {
  const brokenAgent = path.join(ROOT, 'plugins/orbitant-operations/agents/__broken_frontmatter__.md');
  fs.writeFileSync(brokenAgent, '---\nname: [unterminated flow sequence\n---\nrole\n');
  try {
    assert.throws(() => buildAll(), /agents\/\*\.md present but not parsed/);
  } finally {
    fs.rmSync(brokenAgent, { force: true });
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
    buildAll();
  }
});
