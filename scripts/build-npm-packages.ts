import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { parseAllPlugins, type ParsedPlugin } from './lib/parse-plugin.ts';
import { renderVerticalReadme, renderMetaReadme } from './lib/render-readme.ts';
import { ROOT, PLUGINS_DIR, DIST_DIR, SCOPE, REGISTRY, META, npmName } from './lib/npm-packages.config.ts';

const TEMPLATES = path.join(ROOT, 'scripts/templates/npm');

// Source of truth for "what may ship" is git itself: tracked files, plus untracked files that
// are NOT git-ignored. Anything git-ignores (.env, *.log, *.tmp, Thumbs.db, local-only output
// dirs, ...) is excluded automatically — no hand-maintained denylist to keep in sync.
function listPluginFiles(pluginFolder: string): string[] {
  const pluginRelDir = path.posix.join('plugins', pluginFolder);
  const out = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', pluginRelDir],
    { cwd: ROOT, encoding: 'utf-8' },
  );
  return out.split('\0').filter(Boolean);
}

// A plugin's root README documents installing it into Claude Code, so it is the wrong page for an
// npm consumer, and it targets the exact path the generated README writes. Excluding it keeps that
// outcome independent of the order of the two writes. A README deeper in the tree (a skill's own)
// still ships: it is part of that skill's content.
export function shipsVerbatim(relWithinPlugin: string): boolean {
  return relWithinPlugin !== 'README.md';
}

function copyPluginFiles(pluginFolder: string, destDir: string): void {
  const pluginRelDir = path.posix.join('plugins', pluginFolder);
  for (const relFile of listPluginFiles(pluginFolder)) {
    const relWithinPlugin = path.posix.relative(pluginRelDir, relFile);
    if (!shipsVerbatim(relWithinPlugin)) continue;
    const from = path.join(ROOT, ...relFile.split('/'));
    const to = path.join(destDir, ...relWithinPlugin.split('/'));
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
}

function readPluginJson(vertical: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(PLUGINS_DIR, `orbitant-${vertical}`, '.claude-plugin', 'plugin.json'), 'utf-8'));
}

// Fail the build (rather than the shared parser's warn-and-skip, which is fine for the website)
// before anything is published, so a broken SKILL.md or a duplicate name can never ship as a
// package that silently misses entries.
function assertPluginIntegrity(plugin: ParsedPlugin): void {
  // 1. No skill silently dropped: a SKILL.md on disk that the parser could not read (e.g. broken
  //    frontmatter) is filtered to null upstream and would just vanish from the package.
  const skillsDir = path.join(PLUGINS_DIR, plugin.name, 'skills');
  if (fs.existsSync(skillsDir)) {
    const onDisk = fs
      .readdirSync(skillsDir)
      .filter((d) => fs.existsSync(path.join(skillsDir, d, 'SKILL.md')));
    const parsed = new Set(plugin.skills.map((s) => s.folder));
    const dropped = onDisk.filter((d) => !parsed.has(d));
    if (dropped.length > 0) {
      throw new Error(`${plugin.name}: SKILL.md present but not parsed (broken frontmatter?): ${dropped.join(', ')}`);
    }
  }

  // 1b. Same silent-drop risk for agents/commands: an *.md whose frontmatter can't be parsed is
  //     filtered to null upstream and would vanish from the package.
  const mdGroups: Array<[string, Array<{ relPath: string }>]> = [
    ['agents', plugin.agents],
    ['commands', plugin.commands],
  ];
  for (const [dir, items] of mdGroups) {
    const abs = path.join(PLUGINS_DIR, plugin.name, dir);
    if (!fs.existsSync(abs)) continue;
    const onDisk = fs.readdirSync(abs).filter((f) => f.endsWith('.md'));
    const parsed = new Set(items.map((i) => path.posix.basename(i.relPath)));
    const dropped = onDisk.filter((f) => !parsed.has(f));
    if (dropped.length > 0) {
      throw new Error(`${plugin.name}: ${dir}/*.md present but not parsed (broken frontmatter?): ${dropped.join(', ')}`);
    }
  }

  // 2. Names must be unique per vertical — the catalog is keyed by name, so a collision would
  //    silently drop an entry (last one wins) in the published package.
  const groups: Array<[string, Array<{ name: string }>]> = [
    ['skill', plugin.skills],
    ['agent', plugin.agents],
    ['command', plugin.commands],
  ];
  for (const [kind, items] of groups) {
    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.name)) {
        throw new Error(`${plugin.name}: duplicate ${kind} name "${item.name}" — names must be unique within a vertical`);
      }
      seen.add(item.name);
    }
  }
}

function buildVertical(plugin: ParsedPlugin): void {
  assertPluginIntegrity(plugin);
  const pkgName = `${SCOPE}/${npmName(plugin.name)}`;
  const pkgDir = path.join(DIST_DIR, SCOPE, npmName(plugin.name));
  fs.rmSync(pkgDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(pkgDir, 'dist'), { recursive: true });

  // 1. Verbatim content copy (git-tracked + untracked-not-ignored files only).
  copyPluginFiles(plugin.name, pkgDir);

  // 2. manifest.json
  const manifest = {
    meta: { name: plugin.name, version: plugin.version, vertical: plugin.vertical },
    skills: plugin.skills,
    agents: plugin.agents,
    commands: plugin.commands,
  };
  fs.writeFileSync(path.join(pkgDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  // 3. index.js + index.d.ts (static templates)
  fs.copyFileSync(path.join(TEMPLATES, 'index.js'), path.join(pkgDir, 'dist', 'index.js'));
  fs.copyFileSync(path.join(TEMPLATES, 'index.d.ts'), path.join(pkgDir, 'dist', 'index.d.ts'));

  // 4. package.json
  const source = readPluginJson(plugin.vertical);
  const pkgJson = {
    name: pkgName,
    version: plugin.version,
    description: plugin.description,
    type: 'module',
    main: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': { types: './dist/index.d.ts', import: './dist/index.js', default: './dist/index.js' },
      './package.json': './package.json',
    },
    author: source.author ?? { name: 'Orbitant' },
    license: source.license ?? 'MIT',
    repository: { type: 'git', url: 'https://github.com/weorbitant/orbitant-os.git' },
    // Without `access`, npm defaults a scoped package to restricted and rejects the publish.
    publishConfig: { registry: REGISTRY, access: 'public' },
  };
  fs.writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

  // 5. README.md — what the registry shows on the package page.
  fs.writeFileSync(path.join(pkgDir, 'README.md'), renderVerticalReadme(plugin));

  console.log(`  - ${pkgName}@${plugin.version} (${plugin.skills.length} skills, ${plugin.agents.length} agents, ${plugin.commands.length} commands)`);
}

export function buildVerticalPackages(): ParsedPlugin[] {
  const plugins = parseAllPlugins(PLUGINS_DIR);
  console.log('Building vertical packages...');
  for (const plugin of plugins) buildVertical(plugin);
  return plugins;
}

function buildMeta(plugins: ParsedPlugin[]): void {
  const pkgName = `${SCOPE}/${npmName(META.name)}`;
  const pkgDir = path.join(DIST_DIR, SCOPE, npmName(META.name));
  fs.rmSync(pkgDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(pkgDir, 'dist'), { recursive: true });

  const dependencies: Record<string, string> = {};
  const exportsMap: Record<string, { types: string; import: string; default: string } | string> = {
    '.': { types: './dist/index.d.ts', import: './dist/index.js', default: './dist/index.js' },
  };

  const namedExports: string[] = [];
  const namedImports: string[] = [];
  const brainProps: string[] = [];
  const dtsBrainProps: string[] = [];

  // Vertical deps are pinned to EXACT versions, so at release time all three vertical packages
  // must be published BEFORE the meta — otherwise `npm install @orbitant/brain` cannot resolve
  // them. Publish order: verticals first, meta last.
  for (const plugin of plugins) {
    const dep = `${SCOPE}/${npmName(plugin.name)}`;
    dependencies[dep] = plugin.version; // exact pin
    const v = plugin.vertical;

    // subpath re-export files
    fs.writeFileSync(
      path.join(pkgDir, 'dist', `${v}.js`),
      `export * from '${dep}';\nexport { default } from '${dep}';\n`,
    );
    fs.writeFileSync(
      path.join(pkgDir, 'dist', `${v}.d.ts`),
      `export * from '${dep}';\nexport { default } from '${dep}';\n`,
    );
    exportsMap[`./${v}`] = { types: `./dist/${v}.d.ts`, import: `./dist/${v}.js`, default: `./dist/${v}.js` };

    namedExports.push(`export { default as ${v} } from '${dep}';`);
    namedImports.push(`import ${v} from '${dep}';`);
    brainProps.push(v);
    dtsBrainProps.push(`  ${v}: typeof ${v};`);
  }

  exportsMap['./package.json'] = './package.json';

  // aggregate index.js
  fs.writeFileSync(
    path.join(pkgDir, 'dist', 'index.js'),
    [
      ...namedExports,
      ...namedImports,
      `const brain = { ${brainProps.join(', ')} };`,
      `export default brain;`,
      '',
    ].join('\n'),
  );

  // aggregate index.d.ts — mirrors index.js exactly: value re-exports + value imports (so a
  // named import like `import { marketing } from '@orbitant/brain'` type-checks as a value, not
  // just a type), plus the `typeof`-derived brain shape for the default export.
  fs.writeFileSync(
    path.join(pkgDir, 'dist', 'index.d.ts'),
    [
      ...namedExports,
      ...namedImports,
      `declare const brain: {`,
      ...dtsBrainProps,
      `};`,
      `export default brain;`,
      '',
    ].join('\n'),
  );

  const pkgJson = {
    name: pkgName,
    version: META.version,
    description: 'Orbitant OS — all vertical brains aggregated',
    type: 'module',
    main: './dist/index.js',
    types: './dist/index.d.ts',
    exports: exportsMap,
    dependencies,
    author: { name: 'Orbitant' },
    license: 'MIT',
    repository: { type: 'git', url: 'https://github.com/weorbitant/orbitant-os.git' },
    publishConfig: { registry: REGISTRY, access: 'public' },
  };
  fs.writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify(pkgJson, null, 2));
  fs.writeFileSync(path.join(pkgDir, 'README.md'), renderMetaReadme(plugins, META));

  console.log(`  - ${pkgName}@${META.version} (meta → ${plugins.map((p) => p.vertical).join(', ')})`);
}

export function buildAll(): void {
  const plugins = buildVerticalPackages();
  console.log('Building meta package...');
  buildMeta(plugins);
}

// Run only when invoked directly, not when a test imports this module.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  buildAll();
}
