import type { ParsedPlugin } from './parse-plugin.ts';
import { SCOPE, npmName } from './npm-packages.config.ts';

const MARKETPLACE = 'weorbitant/orbitant-os';

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}

function installSection(pkgName: string): string[] {
  return [
    '## Install',
    '',
    '```bash',
    `npm install ${pkgName}`,
    '```',
    '',
    'Public on npm: no `.npmrc`, no registry mapping and no token.',
  ];
}

function keysSection(plugin: ParsedPlugin): string[] {
  const groups: Array<[string, Array<{ name: string }>]> = [
    ['skills', plugin.skills],
    ['agents', plugin.agents],
    ['commands', plugin.commands],
  ];
  const lines = groups
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => `- **${label}** — ${items.map((i) => `\`${i.name}\``).join(', ')}`);
  return ['## Keys', '', ...lines];
}

export function renderVerticalReadme(plugin: ParsedPlugin): string {
  const pkgName = `${SCOPE}/${npmName(plugin.name)}`;
  const alias = plugin.vertical;
  const sampleSkill = plugin.skills[0]?.name;
  const hasPaths = plugin.agents.length > 0 || plugin.commands.length > 0;

  const counts = [`**v${plugin.version}**`, `vertical \`${alias}\``];
  if (plugin.skills.length > 0) counts.push(plural(plugin.skills.length, 'skill'));
  if (plugin.agents.length > 0) counts.push(plural(plugin.agents.length, 'agent'));
  if (plugin.commands.length > 0) counts.push(plural(plugin.commands.length, 'command'));

  const usage = [`import ${alias} from '${pkgName}';`, ''];
  if (sampleSkill) {
    usage.push(`const skill = ${alias}.skills['${sampleSkill}'];`, 'skill.content; // markdown body, no frontmatter');
  }
  usage.push(`${alias}.meta; // { name, version, vertical }`);

  const fields = [
    '| Field | Notes |',
    '| --- | --- |',
    '| `content` | the markdown body without frontmatter — what you feed a model |',
    '| `dir` | absolute path to the skill folder, resolved at load time, for reading its `references/` |',
  ];
  if (hasPaths) fields.push('| `path` | absolute path to an agent or command source file |');
  fields.push('| `frontmatter` | the raw frontmatter, for anything not surfaced as a typed field |');

  return [
    `# ${pkgName}`,
    '',
    plugin.description.replace(/\.?$/, '.'),
    '',
    counts.join(' · '),
    '',
    ...installSection(pkgName),
    '',
    '## Usage',
    '',
    '```ts',
    ...usage,
    '```',
    '',
    `Named imports work too: \`import { skills, meta } from '${pkgName}'\`.`,
    '',
    '## API',
    '',
    '`skills`, `agents` and `commands` are `Record<string, Entry>`, keyed by name.',
    '',
    ...fields,
    '',
    ...keysSection(plugin),
    '',
    '## Versioning',
    '',
    `Bumped from \`plugins/${plugin.name}/.claude-plugin/plugin.json\`. Pin the exact version: content`,
    'changes without a major bump.',
    '',
    '---',
    '',
    `Same content as a Claude Code plugin: \`/plugin marketplace add ${MARKETPLACE}\`.`,
    '',
  ].join('\n');
}

export function renderMetaReadme(plugins: ParsedPlugin[], meta: { name: string; version: string }): string {
  const pkgName = `${SCOPE}/${npmName(meta.name)}`;
  const sample = plugins.find((p) => p.skills.length > 0);

  const usage = [`import brain from '${pkgName}';`, ''];
  if (sample) {
    usage.push(`brain.${sample.vertical}.skills['${sample.skills[0].name}'].content;`, '');
    usage.push(
      `import { ${sample.vertical} } from '${pkgName}';`,
      `import ${sample.vertical} from '${pkgName}/${sample.vertical}';`,
    );
  }

  const table = [
    '| Vertical | Package | Version | Subpath |',
    '| --- | --- | --- | --- |',
    ...plugins.map(
      (p) => `| \`${p.vertical}\` | \`${SCOPE}/${npmName(p.name)}\` | ${p.version} | \`${pkgName}/${p.vertical}\` |`,
    ),
  ];

  return [
    `# ${pkgName}`,
    '',
    'Every Orbitant vertical brain, aggregated behind one package.',
    '',
    [`**v${meta.version}**`, plural(plugins.length, 'vertical')].join(' · '),
    '',
    ...installSection(pkgName),
    '',
    '## Usage',
    '',
    '```ts',
    ...usage,
    '```',
    '',
    'The default export aggregates every vertical. A subpath import pulls a single one, with the same',
    'shape as installing that vertical package directly.',
    '',
    '## Verticals',
    '',
    ...table,
    '',
    'Versions are pinned exactly: installing this package installs those exact vertical versions.',
    '',
    '## Versioning',
    '',
    'Bumped from `scripts/lib/meta-package.json` and released as the `orbitant-os-v<version>` tag,',
    'after every vertical it pins is already in the registry.',
    '',
    '---',
    '',
    `Same content as a Claude Code plugin marketplace: \`/plugin marketplace add ${MARKETPLACE}\`.`,
    '',
  ].join('\n');
}
