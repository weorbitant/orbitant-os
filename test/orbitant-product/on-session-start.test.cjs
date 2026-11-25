'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { PLUGIN } = require('./fixtures.cjs');

const SCRIPT = path.join(PLUGIN, 'hooks', 'on-session-start.cjs');
const RETRO_MESSAGE =
  'Unfinished discovery detected — loop(s) ended READY or BLOCKED with a pending retro: a-feature. ' +
  'Before other work, run the orbitant-discovery-retro skill to produce the hand-off file and set ' +
  '"retro":"done" in the corresponding <home>/.discovery/<slug>/state.json.';

function tmpHome() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'home-'));
}

function runHook(home) {
  const result = spawnSync(process.execPath, [SCRIPT], {
    input: '{}',
    encoding: 'utf8',
    env: { ...process.env, HOME: home, USERPROFILE: home },
  });
  return { code: result.status, stdout: result.stdout };
}

function seed(home, slug, file, content) {
  const dir = path.join(home, '.discovery', slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, file), typeof content === 'string' ? content : JSON.stringify(content));
}

function context(stdout) {
  const out = JSON.parse(stdout);
  assert.equal(out.hookSpecificOutput.hookEventName, 'SessionStart');
  return out.hookSpecificOutput.additionalContext;
}

const item = (status) => ({ path: '/w/discovery/x/F.md', status, ref: '', synced_at: '' });

test('no discovery folder: silent', () => {
  const { code, stdout } = runHook(tmpHome());
  assert.equal(code, 0);
  assert.equal(stdout, '');
});

test('a ready loop with a pending retro gets the retro reminder', () => {
  const home = tmpHome();
  seed(home, 'a-feature', 'state.json', { phase: 'ready', retro: 'pending' });

  assert.equal(context(runHook(home).stdout), RETRO_MESSAGE);
});

test('a blocked loop with a pending retro gets the same reminder', () => {
  const home = tmpHome();
  seed(home, 'a-feature', 'state.json', { phase: 'blocked', retro: 'pending' });

  assert.equal(context(runHook(home).stdout), RETRO_MESSAGE);
});

test('pending deliverables are listed per feature and handed to the deliverable-sync agent', () => {
  const home = tmpHome();
  seed(home, 'exportar-facturas', 'sync.json', {
    feature: 'exportar-facturas', workdir: '/w',
    artifacts: { brief: item('pending'), stress_test: item('pending'), retro: item('synced') },
  });

  const text = context(runHook(home).stdout);

  assert.match(text, /exportar-facturas \(brief, stress_test\)/);
  assert.match(text, /deliverable-sync agent/);
  assert.match(text, /one at a time per slug/);
  assert.ok(text.includes(path.join(PLUGIN, 'skills', 'sync-deliverable', 'SKILL.md')));
  assert.doesNotMatch(text, /retro\)/);
});

test('fully synced features are silent', () => {
  const home = tmpHome();
  seed(home, 'x', 'sync.json', { feature: 'x', workdir: '/w', artifacts: { brief: item('synced') } });

  assert.equal(runHook(home).stdout, '');
});

test('pending retro and pending sync come in one combined message', () => {
  const home = tmpHome();
  seed(home, 'a-feature', 'state.json', { phase: 'ready', retro: 'pending' });
  seed(home, 'b-feature', 'sync.json', { feature: 'b-feature', workdir: '/w', artifacts: { brief: item('pending') } });

  const { stdout } = runHook(home);
  const text = context(stdout);

  assert.ok(text.startsWith(RETRO_MESSAGE));
  assert.match(text, /b-feature \(brief\)/);
  assert.equal(stdout.trim().split('\n').length, 1);
});

test('a malformed sync.json does not hide other features', () => {
  const home = tmpHome();
  seed(home, 'broken', 'sync.json', '{not json');
  seed(home, 'fine', 'sync.json', { feature: 'fine', workdir: '/w', artifacts: { retro: item('pending') } });

  const text = context(runHook(home).stdout);

  assert.match(text, /fine \(retro\)/);
  assert.doesNotMatch(text, /broken/);
});
