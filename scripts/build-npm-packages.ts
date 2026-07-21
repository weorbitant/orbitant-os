import fs from 'node:fs';
import path from 'node:path';
import { parseAllPlugins, type ParsedPlugin } from './lib/parse-plugin.ts';
import { ROOT, PLUGINS_DIR, DIST_DIR, SCOPE, REGISTRY, META, IGNORED_REL_PATHS } from './lib/npm-packages.config.ts';

const TEMPLATES = path.join(ROOT, 'scripts/templates/npm');

function isIgnored(absPath: string): boolean {
  const rel = path.relative(PLUGINS_DIR, absPath).split(path.sep).join('/');
  if (path.basename(absPath) === '.DS_Store') return true;
  return IGNORED_REL_PATHS.some((ignored) => rel === ignored || rel.startsWith(`${ignored}/`));
}

function copyDir(src: string, dest: string): void {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (isIgnored(from)) continue;
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      copyDir(from, to);
    } else if (entry.isFile()) {
      fs.copyFileSync(from, to);
    }
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

  // 1. Verbatim content copy.
  copyDir(path.join(PLUGINS_DIR, plugin.name), pkgDir);

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
  const dtsImports: string[] = [];
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
    dtsImports.push(`import type ${v} from '${dep}';`);
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

  // aggregate index.d.ts
  fs.writeFileSync(
    path.join(pkgDir, 'dist', 'index.d.ts'),
    [
      ...dtsImports,
      `export { ${brainProps.join(', ')} };`,
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
