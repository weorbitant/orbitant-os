import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parsePlugin, parseAllPlugins } from '../scripts/lib/parse-plugin.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PLUGINS = path.join(ROOT, 'plugins');

function pluginJsonVersion(folder: string): string {
  const pj = path.join(PLUGINS, folder, '.claude-plugin', 'plugin.json');
  return JSON.parse(fs.readFileSync(pj, 'utf-8')).version as string;
}

test('parsePlugin reads marketing skills with content and metadata', () => {
  const plugin = parsePlugin(path.join(PLUGINS, 'orbitant-marketing'));
  assert.ok(plugin, 'plugin should parse');
  assert.equal(plugin.name, 'orbitant-marketing');
  assert.equal(plugin.vertical, 'marketing');
  assert.equal(plugin.version, pluginJsonVersion('orbitant-marketing'));

  const tone = plugin.skills.find((s) => s.folder === 'tone');
  assert.ok(tone, 'tone skill present');
  assert.equal(tone.name, 'orbitant-tone');
  assert.ok(tone.tags.includes('tone'), 'tags parsed');
  assert.ok(tone.content.includes('Orbitant Tone of Voice'), 'markdown body captured');
  assert.equal(tone.relDir, 'skills/tone');
  assert.equal(tone.frontmatter.name, 'orbitant-tone');
});

test('parsePlugin reads operations agents and commands', () => {
  const plugin = parsePlugin(path.join(PLUGINS, 'orbitant-operations'));
  assert.ok(plugin);
  const agent = plugin.agents.find((a) => a.name === 'airtable-fetcher');
  assert.ok(agent, 'agent present');
  assert.ok(agent.allowedTools && agent.allowedTools.includes('Read'), 'allowedTools captured');
  assert.equal(agent.relPath, 'agents/airtable-fetcher.md');

  const cmd = plugin.commands.find((c) => c.name === 'status');
  assert.ok(cmd, 'command present');
  assert.equal(cmd.relPath, 'commands/status.md');
  assert.ok(cmd.content.length > 0, 'command body captured');
});

test('parseAllPlugins returns all three verticals', () => {
  const all = parseAllPlugins(PLUGINS);
  const names = all.map((p) => p.name).sort();
  assert.deepEqual(names, ['orbitant-engineering', 'orbitant-marketing', 'orbitant-operations']);
});
