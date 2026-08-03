import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderVerticalReadme, renderMetaReadme } from '../scripts/lib/render-readme.ts';
import type { ParsedPlugin, ParsedSkill, ParsedAgent, ParsedCommand } from '../scripts/lib/parse-plugin.ts';

function skill(name: string): ParsedSkill {
  return { name, folder: name, description: 'd', version: '1.0.0', tags: [], content: 'body', frontmatter: {}, relDir: `skills/${name}` };
}

function agent(name: string): ParsedAgent {
  return { name, description: 'd', content: 'body', frontmatter: {}, relPath: `agents/${name}.md` };
}

function command(name: string): ParsedCommand {
  return { name, description: 'd', content: 'body', frontmatter: {}, relPath: `commands/${name}.md` };
}

function plugin(overrides: Partial<ParsedPlugin> = {}): ParsedPlugin {
  return {
    name: 'orbitant-marketing',
    vertical: 'marketing',
    version: '9.9.9',
    description: 'Marketing team skills',
    skills: [skill('orbitant-tone'), skill('orbitant-newsletter')],
    agents: [],
    commands: [],
    ...overrides,
  };
}

test('header states the version and only the non-empty groups', () => {
  const readme = renderVerticalReadme(plugin());
  assert.match(readme, /^\*\*v9\.9\.9\*\* · vertical `marketing` · 2 skills$/m);
  assert.ok(!readme.includes('0 agents'), 'an empty group must not be counted');
  assert.ok(!readme.includes('0 commands'), 'an empty group must not be counted');
});

test('a single entry is not pluralized', () => {
  const readme = renderVerticalReadme(plugin({ skills: [skill('orbitant-tone')] }));
  assert.match(readme, /· 1 skill$/m);
});

test('Keys lists every entry name, one line per non-empty group', () => {
  const readme = renderVerticalReadme(
    plugin({ agents: [agent('triage-agent')], commands: [command('today'), command('week')] }),
  );
  assert.match(readme, /^- \*\*skills\*\* — `orbitant-tone`, `orbitant-newsletter`$/m);
  assert.match(readme, /^- \*\*agents\*\* — `triage-agent`$/m);
  assert.match(readme, /^- \*\*commands\*\* — `today`, `week`$/m);
});

test('a vertical with no agents and no commands lists neither group', () => {
  const readme = renderVerticalReadme(plugin());
  assert.match(readme, /^- \*\*skills\*\*/m);
  assert.ok(!readme.includes('**agents**'), 'no agents means no agents line');
  assert.ok(!readme.includes('**commands**'), 'no commands means no commands line');
});

// `path` only exists on agent and command entries, so documenting it in a skills-only package would
// describe a field the consumer can never reach.
test('the API table documents `path` only when agents or commands ship', () => {
  assert.ok(!renderVerticalReadme(plugin()).includes('| `path` |'));
  assert.ok(renderVerticalReadme(plugin({ commands: [command('today')] })).includes('| `path` |'));
});

test('usage imports the real package name and indexes a real skill key', () => {
  const readme = renderVerticalReadme(plugin());
  assert.match(readme, /^import marketing from '@orbitant\/brain-marketing';$/m);
  assert.match(readme, /^const skill = marketing\.skills\['orbitant-tone'\];$/m);
});

test('install is a plain public npm install, with no registry or token setup', () => {
  const readme = renderVerticalReadme(plugin());
  assert.match(readme, /^npm install @orbitant\/brain-marketing$/m);
  assert.ok(!readme.includes('_authToken'), 'a public package needs no token');
  assert.ok(!readme.includes('registry='), 'a public package needs no scope-to-registry mapping');
});

test('meta README tabulates every vertical with its pinned version and subpath', () => {
  const plugins = [
    plugin(),
    plugin({ name: 'orbitant-operations', vertical: 'operations', version: '1.2.3', skills: [skill('orbitant-voice-drafting')] }),
  ];
  const readme = renderMetaReadme(plugins, { name: 'orbitant-os', version: '4.5.6' });

  assert.match(readme, /^\*\*v4\.5\.6\*\* · 2 verticals$/m);
  assert.match(readme, /^\| `marketing` \| `@orbitant\/brain-marketing` \| 9\.9\.9 \| `@orbitant\/brain\/marketing` \|$/m);
  assert.match(readme, /^\| `operations` \| `@orbitant\/brain-operations` \| 1\.2\.3 \| `@orbitant\/brain\/operations` \|$/m);
  assert.match(readme, /^import marketing from '@orbitant\/brain\/marketing';$/m);
});
