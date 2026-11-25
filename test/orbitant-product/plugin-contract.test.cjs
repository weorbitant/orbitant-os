'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PLUGIN } = require('./fixtures.cjs');

const read = (rel) => fs.readFileSync(path.join(PLUGIN, rel), 'utf8');
const readJson = (rel) => JSON.parse(read(rel));
const unwrapped = (text) => text.replace(/\s+/g, ' ');

const STORES_DIR = 'skills/sync-deliverable/references/stores';
const STORE_CONTRACT = ['Detect', 'Login message', 'Resolve the destination', 'Accept', 'Find and upsert', 'Failure messages'];
const CARD_FIELDS = ['Produced by', 'Required content', 'Invalid on sight', 'Valid when', 'Record'];
const CARDS = ['Brief', 'Stress test', 'Retro', 'Scorecard'];

function filesUnder(rel) {
  const out = [];
  for (const entry of fs.readdirSync(path.join(PLUGIN, rel), { withFileTypes: true })) {
    const child = path.posix.join(rel, entry.name);
    if (entry.isDirectory()) out.push(...filesUnder(child));
    else out.push(child);
  }
  return out;
}

const ALL_FILES = filesUnder('.').map((f) => f.replace(/^\.\//, ''));
const stores = () => fs.readdirSync(path.join(PLUGIN, STORES_DIR)).filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));

function hookCommands() {
  const commands = [];
  for (const entries of Object.values(readJson('hooks/hooks.json').hooks)) {
    for (const entry of entries) {
      for (const hook of entry.hooks) commands.push({ matcher: entry.matcher, command: hook.command });
    }
  }
  return commands;
}

function section(text, heading) {
  const start = text.indexOf(`\n${heading}\n`);
  assert.ok(start > -1, `missing section: ${heading}`);
  const level = heading.match(/^#+/)[0].length;
  const rest = text.slice(start + heading.length + 2);
  const end = rest.search(new RegExp(`\\n#{1,${level}} `));
  return end === -1 ? rest : rest.slice(0, end);
}

test('every hook command points to a .cjs script that exists', () => {
  for (const { command } of hookCommands()) {
    const match = command.match(/\$\{CLAUDE_PLUGIN_ROOT\}\/([^"]+)/);
    assert.ok(match, `unexpected hook command: ${command}`);
    assert.match(match[1], /\.cjs$/);
    assert.ok(fs.existsSync(path.join(PLUGIN, match[1])), `missing script: ${match[1]}`);
  }
});

test('on-artifact-written is registered once, on Write|Edit', () => {
  const registered = hookCommands().filter((h) => h.command.includes('hooks/on-artifact-written.cjs'));
  assert.equal(registered.length, 1);
  assert.equal(registered[0].matcher, 'Write|Edit');
});

test('no store is named outside the store layer', () => {
  const names = stores();
  assert.ok(names.length >= 2, 'expected the v1 stores');
  for (const file of ALL_FILES) {
    if (file.startsWith(`${STORES_DIR}/`) || file === 'README.md') continue;
    const text = read(file);
    for (const name of names) {
      assert.doesNotMatch(text, new RegExp(`\\b${name}\\b`, 'i'), `${file} names the store ${name}`);
    }
  }
});

test('the plugin bundles no MCP server', () => {
  assert.equal(fs.existsSync(path.join(PLUGIN, '.mcp.json')), false);
});

test('the core checks reach nothing outward', () => {
  const checks = read('hooks/lib/deliverable-checks.cjs');
  assert.doesNotMatch(checks, /require\(/);
  for (const outward of ['sync.json', 'store.json', 'sync-state', 'readFile', 'writeFile']) {
    assert.ok(!checks.includes(outward), `deliverable-checks.cjs mentions ${outward}`);
  }
});

test('only the PostToolUse entry point composes the core checks and the sync state', () => {
  for (const file of ALL_FILES.filter((f) => f.startsWith('hooks/') && f.endsWith('.cjs'))) {
    const text = read(file);
    const both = text.includes('deliverable-checks.cjs') && text.includes('sync-state.cjs');
    assert.equal(both, file === 'hooks/on-artifact-written.cjs', file);
  }
  assert.doesNotMatch(read('hooks/lib/sync-state.cjs'), /deliverable-checks/);
});

test('the check ids in the contract and in the code are the same', () => {
  const { CHECKS } = require(path.join(PLUGIN, 'hooks', 'lib', 'deliverable-checks.cjs'));
  const contract = read('references/deliverables.md');
  const index = section(contract, '## Check index');
  const indexIds = [...index.matchAll(/^\| `([a-z-]+)` \|/gm)].map((m) => m[1]).sort();
  assert.deepEqual(indexIds, Object.keys(CHECKS).sort());
  for (const card of CARDS) {
    const line = section(contract, `## ${card}`).match(/\*\*Invalid on sight\*\*: (.+)/)[1];
    for (const [, id] of line.matchAll(/`([a-z-]+)`/g)) assert.ok(id in CHECKS, `${card}: ${id}`);
  }
});

test('every deliverable has a card with the five fields', () => {
  const contract = read('references/deliverables.md');
  for (const card of CARDS) {
    const body = section(contract, `## ${card}`);
    for (const field of CARD_FIELDS) assert.ok(body.includes(`**${field}**`), `${card}: ${field}`);
  }
});

test('the contract never says how or where a deliverable is stored', () => {
  const contract = read('references/deliverables.md');
  assert.doesNotMatch(contract, /\b(page|database|data source|MCP)\b/i);
});

test('every store implements the six parts, and the sync skill names them in order', () => {
  for (const name of stores()) {
    const text = read(`${STORES_DIR}/${name}.md`);
    for (const part of STORE_CONTRACT) assert.ok(text.includes(`\n## ${part}\n`), `${name}: ${part}`);
  }
  const contract = section(read('skills/sync-deliverable/SKILL.md'), '## The store contract');
  const positions = STORE_CONTRACT.map((part) => contract.indexOf(`**${part}.**`));
  assert.ok(positions.every((p) => p > -1), 'the sync skill names every part');
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, 'in order');
});

test('the deliverable-sync agent is generic and inherits the session tools', () => {
  const agent = read('agents/deliverable-sync.md');
  const frontmatter = agent.match(/^---\n([\s\S]*?)\n---/)[1];
  assert.match(frontmatter, /^name: deliverable-sync$/m);
  assert.doesNotMatch(frontmatter, /^(tools|allowed-tools):/m);
  assert.match(agent, /never ask the PM/i);
  for (const result of ['synced', 'invalid', 'needs-pm', 'pending']) assert.ok(agent.includes(`RESULT: ${result}`), result);
});

test('no skill is named without its orbitant- prefix', () => {
  const bare = /(^|[^-/\w'])(problem-interrogator|sync-deliverable|discovery-retro)(?![\w/'-])/m;
  for (const file of ALL_FILES.filter((f) => /\.(md|cjs|json)$/.test(f))) {
    assert.doesNotMatch(read(file), bare, file);
  }
});

test('every skill in plugin.json exists and has the prefixed name', () => {
  const plugin = readJson('.claude-plugin/plugin.json');
  assert.equal(plugin.name, 'orbitant-product');
  for (const rel of plugin.skills) {
    const skill = read(path.posix.join(rel, 'SKILL.md'));
    assert.match(skill, /^---\nname: orbitant-[a-z-]+\n/);
  }
});

test('the rewritten files use no plugin-only paths', () => {
  const rewritten = ['references/deliverables.md', 'skills/sync-deliverable/SKILL.md', 'agents/deliverable-sync.md', ...stores().map((s) => `${STORES_DIR}/${s}.md`)];
  for (const file of rewritten) assert.doesNotMatch(read(file), /@plugins\//, file);
});

test('discover runs the persistence preflight before interrogating, and checks each deliverable', () => {
  const discover = read('commands/discover.md');
  const preflight = discover.indexOf('0. **Preflight (persistence).**');
  const interrogate = discover.indexOf('1. **Interrogate.**');
  assert.ok(preflight > -1 && preflight < interrogate, 'step 0 comes before step 1');
  const persistence = section(discover, '## Persistence');
  assert.match(persistence, /references\/deliverables\.md/);
  assert.match(persistence, /deliverable-sync/);
  assert.match(persistence, /same slug/);
});

test('the retro and the score command follow the contract', () => {
  assert.match(read('skills/discovery-retro/SKILL.md'), /deliverable-sync/);
  assert.match(read('commands/score.md'), /scorecard-score/);
});

test('sync mode validates before anything is kept, and a missing deliverable stays pending', () => {
  const sync = read('skills/sync-deliverable/SKILL.md');
  const mode = section(sync, '## Mode: sync');
  assert.ok(mode.indexOf('**Validate.**') < mode.indexOf('**Find and upsert.**'));
  assert.match(sync, /leave it `pending` and keep its `ref`/);
  assert.match(unwrapped(mode), /from the deliverable's own folder, never the current folder's/);
});

const NOTION = `${STORES_DIR}/notion.md`;

test('notion keeps the database property names verbatim', () => {
  const notion = read(NOTION);
  for (const prop of ['Título', 'Tipo', 'Estado', 'Actualizado', 'Resumen', 'Palabras clave', 'Funcionalidad']) {
    assert.ok(notion.includes(`"${prop}"`), `missing property ${prop}`);
  }
  assert.match(notion, /mention-page/);
  assert.match(notion, /truncated/);
});

test('notion maps every record status and type to its Spanish value', () => {
  const notion = unwrapped(read(NOTION));
  for (const pair of ['`draft` → `Borrador`', '`current` → `Vigente`', '`obsolete` → `Obsoleto`', '`brief` → `Brief`', '`stress_test` → `Stress test`', '`retro` → `Retro`']) {
    assert.ok(notion.includes(pair), pair);
  }
});

test('notion still reads the 0.2.0 destination file and never deletes it', () => {
  const notion = unwrapped(read(NOTION));
  assert.match(notion, /discovery\/notion\.json/);
  assert.match(notion, /Never delete `notion\.json`/);
});

test('a product without a map is a branch of its own, apart from no access', () => {
  const steps = unwrapped(section(read(NOTION), '### Steps'));
  assert.match(steps, /No match → run \*Create a minimal product map\*/);
  assert.match(steps, /\*\*No access\*\* \(the page can't be opened, or a write is refused\)/);
});

test('a minimal product map is created only after the PM confirms, never private, under an existing page', () => {
  const create = section(read(NOTION), '### Create a minimal product map');
  const flat = unwrapped(create);
  assert.match(flat, /Write nothing to Notion before step 6/);
  assert.match(flat, /only after the PM has confirmed steps 2, 3 and 5/);
  const steps = [...create.matchAll(/^(\d)\. \*\*/gm)].map((m) => Number(m[1]));
  assert.deepEqual(steps, [1, 2, 3, 4, 5, 6]);
  assert.match(flat, /Never create the map as a private page or a draft/);
  assert.match(flat, /`<Product> TECH`/);
  assert.match(flat, /`<Client> TECH`/);
  assert.match(flat, /Never create a client page or a product team page/);
});

test('a minimal product map is titled with an em dash and holds the discovery database only', () => {
  const notion = read(NOTION);
  const create = unwrapped(section(notion, '### Create a minimal product map'));
  assert.ok(create.includes('title `<Product> — Mapa de producto`'));
  assert.doesNotMatch(notion, /[-–] Mapa de producto/);
  assert.match(create, /Producto en definición:/);
  assert.match(create, /Mapa por completar:/);
  assert.match(create, /plugin `orbitant-product`/);
  assert.match(create, /Never create any other database/);
});
