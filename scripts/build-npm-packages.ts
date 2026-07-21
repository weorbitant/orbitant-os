import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseAllPlugins, type ParsedPlugin } from './lib/parse-plugin.ts';
import { ROOT, PLUGINS_DIR, DIST_DIR, SCOPE, REGISTRY, META } from './lib/npm-packages.config.ts';

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

function copyPluginFiles(pluginFolder: string, destDir: string): void {
  const pluginRelDir = path.posix.join('plugins', pluginFolder);
  for (const relFile of listPluginFiles(pluginFolder)) {
    const relWithinPlugin = path.posix.relative(pluginRelDir, relFile);
    const from = path.join(ROOT, ...relFile.split('/'));
    const to = path.join(destDir, ...relWithinPlugin.split('/'));
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
}

function readPluginJson(vertical: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(PLUGINS_DIR, `orbitant-${vertical}`, '.claude-plugin', 'plugin.json'), 'utf-8'));
}

function buildVertical(plugin: ParsedPlugin): void {
  const pkgName = `${SCOPE}/${plugin.name}`;
  const pkgDir = path.join(DIST_DIR, SCOPE, plugin.name);
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
    exports: { '.': { types: './dist/index.d.ts', import: './dist/index.js' } },
    author: source.author ?? { name: 'Orbitant' },
    license: source.license ?? 'MIT',
    repository: { type: 'git', url: 'https://github.com/weorbitant/orbitant-os.git' },
    publishConfig: { registry: REGISTRY },
  };
  fs.writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

  console.log(`  - ${pkgName}@${plugin.version} (${plugin.skills.length} skills, ${plugin.agents.length} agents, ${plugin.commands.length} commands)`);
}

export function buildVerticalPackages(): ParsedPlugin[] {
  const plugins = parseAllPlugins(PLUGINS_DIR);
  console.log('Building vertical packages...');
  for (const plugin of plugins) buildVertical(plugin);
  return plugins;
}

function buildMeta(plugins: ParsedPlugin[]): void {
  const pkgName = `${SCOPE}/${META.name}`;
  const pkgDir = path.join(DIST_DIR, SCOPE, META.name);
  fs.rmSync(pkgDir, { recursive: true, force: true });
  fs.mkdirSync(path.join(pkgDir, 'dist'), { recursive: true });

  const dependencies: Record<string, string> = {};
  const exportsMap: Record<string, { types: string; import: string }> = {
    '.': { types: './dist/index.d.ts', import: './dist/index.js' },
  };

  const namedExports: string[] = [];
  const namedImports: string[] = [];
  const brainProps: string[] = [];
  const dtsBrainProps: string[] = [];

  for (const plugin of plugins) {
    const dep = `${SCOPE}/${plugin.name}`;
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
    exportsMap[`./${v}`] = { types: `./dist/${v}.d.ts`, import: `./dist/${v}.js` };

    namedExports.push(`export { default as ${v} } from '${dep}';`);
    namedImports.push(`import ${v} from '${dep}';`);
    brainProps.push(v);
    dtsBrainProps.push(`  ${v}: typeof ${v};`);
  }

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
  // named import like `import { marketing } from '@weorbitant/orbitant-os'` type-checks as a
  // value, not just a type), plus the `typeof`-derived brain shape for the default export.
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
    exports: exportsMap,
    dependencies,
    author: { name: 'Orbitant' },
    license: 'MIT',
    repository: { type: 'git', url: 'https://github.com/weorbitant/orbitant-os.git' },
    publishConfig: { registry: REGISTRY },
  };
  fs.writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

  console.log(`  - ${pkgName}@${META.version} (meta → ${plugins.map((p) => p.vertical).join(', ')})`);
}

export function buildAll(): void {
  const plugins = buildVerticalPackages();
  console.log('Building meta package...');
  buildMeta(plugins);
}

// Executed directly (not imported by a test).
if (import.meta.url === `file://${process.argv[1]}`) {
  buildAll();
}
