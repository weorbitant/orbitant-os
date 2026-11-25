'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { PLUGIN, VALID } = require('./fixtures.cjs');

const SCRIPT = path.join(PLUGIN, 'hooks', 'on-artifact-written.cjs');

function tmpDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function runHook(payload, home) {
  const input = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const result = spawnSync(process.execPath, [SCRIPT], {
    input,
    encoding: 'utf8',
    env: { ...process.env, HOME: home, USERPROFILE: home },
  });
  return { code: result.status, stdout: result.stdout };
}

function writeOf(filePath, toolName = 'Write') {
  return { tool_name: toolName, tool_input: { file_path: filePath } };
}

const CONTENT_BY_FILE = {
  'PROBLEM_BRIEF.md': VALID.brief,
  'STRESS_TEST.md': VALID.stress_test,
};

function deliverable(filePath, content) {
  const name = path.basename(filePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content !== undefined ? content : CONTENT_BY_FILE[name] || VALID.retro);
  return filePath;
}

function syncPath(home, slug) {
  return path.join(home, '.discovery', slug, 'sync.json');
}

function readSync(home, slug) {
  return JSON.parse(fs.readFileSync(syncPath(home, slug), 'utf8'));
}

function seedSync(home, slug, state) {
  fs.mkdirSync(path.dirname(syncPath(home, slug)), { recursive: true });
  fs.writeFileSync(syncPath(home, slug), JSON.stringify(state));
}

test('a valid brief is marked pending and the deliverable-sync agent is asked for', () => {
  const home = tmpDir('home-');
  const work = tmpDir('work-');
  const file = deliverable(path.join(work, 'discovery', 'exportar-facturas', 'PROBLEM_BRIEF.md'));

  const { code, stdout } = runHook(writeOf(file), home);

  assert.equal(code, 0);
  const out = JSON.parse(stdout);
  assert.equal(out.hookSpecificOutput.hookEventName, 'PostToolUse');
  const context = out.hookSpecificOutput.additionalContext;
  assert.match(context, /deliverable-sync agent/);
  assert.match(context, /slug `exportar-facturas`, type `brief`/);
  assert.ok(context.includes(path.join(PLUGIN, 'skills', 'sync-deliverable', 'SKILL.md')), 'names the sync skill path');
  assert.match(context, /orbitant-sync-deliverable/);
  const state = readSync(home, 'exportar-facturas');
  assert.equal(state.feature, 'exportar-facturas');
  assert.equal(state.workdir, work);
  assert.deepEqual(state.artifacts.brief, { path: file, status: 'pending', ref: '', synced_at: '' });
});

test('an invalid deliverable is blocked with its check id and leaves sync.json untouched', () => {
  const home = tmpDir('home-');
  const work = tmpDir('work-');
  const file = deliverable(
    path.join(work, 'discovery', 'x', 'STRESS_TEST.md'),
    VALID.stress_test.replace('VERDICT: READY', 'VERDICT: READY.'),
  );

  const { code, stdout } = runHook(writeOf(file), home);

  assert.equal(code, 0);
  const out = JSON.parse(stdout);
  assert.equal(out.decision, 'block');
  assert.match(out.reason, /STRESS_TEST\.md/);
  assert.match(out.reason, /stress-test-verdict/);
  assert.equal(out.hookSpecificOutput, undefined);
  assert.equal(fs.existsSync(syncPath(home, 'x')), false);
});

test('an invalid rewrite of a synced deliverable keeps its synced state', () => {
  const home = tmpDir('home-');
  const work = tmpDir('work-');
  const file = path.join(work, 'discovery', 'x', 'PROBLEM_BRIEF.md');
  const synced = { path: file, status: 'synced', ref: 'ref-1', synced_at: '2026-11-20' };
  seedSync(home, 'x', { feature: 'x', workdir: work, artifacts: { brief: synced } });
  deliverable(file, VALID.brief.replace('# Problem brief — ', '# '));

  const out = JSON.parse(runHook(writeOf(file), home).stdout);

  assert.equal(out.decision, 'block');
  assert.deepEqual(readSync(home, 'x').artifacts.brief, synced);
});

test('stress test and retro files map to their types', () => {
  const home = tmpDir('home-');
  const work = tmpDir('work-');
  const dir = path.join(work, 'discovery', 'alta-empleados');

  runHook(writeOf(deliverable(path.join(dir, 'STRESS_TEST.md'))), home);
  runHook(writeOf(deliverable(path.join(dir, 'RETRO-2026-10-13.md'))), home);

  const state = readSync(home, 'alta-empleados');
  assert.equal(state.artifacts.stress_test.status, 'pending');
  assert.equal(state.artifacts.stress_test.path, path.join(dir, 'STRESS_TEST.md'));
  assert.equal(state.artifacts.retro.status, 'pending');
  assert.equal(state.artifacts.retro.path, path.join(dir, 'RETRO-2026-10-13.md'));
});

test('an Edit of a deliverable is checked on the whole file, as a Write is', () => {
  const home = tmpDir('home-');
  const work = tmpDir('work-');
  const file = deliverable(path.join(work, 'discovery', 'x', 'PROBLEM_BRIEF.md'));

  const { stdout } = runHook(writeOf(file, 'Edit'), home);

  assert.match(stdout, /type `brief`/);
  assert.equal(readSync(home, 'x').artifacts.brief.status, 'pending');
});

test('a deliverable path that cannot be read is ignored', () => {
  const home = tmpDir('home-');
  const work = tmpDir('work-');
  const { code, stdout } = runHook(writeOf(path.join(work, 'discovery', 'x', 'PROBLEM_BRIEF.md')), home);
  assert.equal(code, 0);
  assert.equal(stdout, '');
  assert.equal(fs.existsSync(syncPath(home, 'x')), false);
});

test('paths that are not deliverables are ignored', () => {
  const home = tmpDir('home-');
  const work = tmpDir('work-');
  const ignored = [
    path.join(home, '.discovery', 'x', 'state.json'),
    path.join(home, '.discovery', 'x', 'PROBLEM_BRIEF.md'),
    path.join(work, 'discovery', 'store.json'),
    path.join(work, 'discovery', 'x', 'SCORECARD.md'),
    path.join(work, 'discovery', 'x', 'SOURCE.md'),
    path.join(work, 'discovery', 'x', 'RETRO-latest.md'),
    path.join(work, 'discovery', 'x', 'old', 'PROBLEM_BRIEF.md'),
    path.join(work, 'notes', 'x', 'PROBLEM_BRIEF.md'),
  ];

  for (const file of ignored) {
    deliverable(file, 'anything');
    const { code, stdout } = runHook(writeOf(file), home);
    assert.equal(code, 0, file);
    assert.equal(stdout, '', file);
  }
  assert.equal(fs.existsSync(syncPath(home, 'x')), false);
  assert.equal(fs.existsSync(path.join(home, '.discovery', 'old')), false);
});

test('writing one deliverable keeps the state of the others', () => {
  const home = tmpDir('home-');
  const work = tmpDir('work-');
  const dir = path.join(work, 'discovery', 'x');
  const brief = { path: path.join(dir, 'PROBLEM_BRIEF.md'), status: 'synced', ref: 'ref-brief', synced_at: '2026-10-12' };
  seedSync(home, 'x', { feature: 'x', workdir: work, artifacts: { brief } });

  runHook(writeOf(deliverable(path.join(dir, 'STRESS_TEST.md'))), home);

  const state = readSync(home, 'x');
  assert.deepEqual(state.artifacts.brief, brief);
  assert.equal(state.artifacts.stress_test.status, 'pending');
});

test('rewriting a synced brief flips it to pending and keeps its record ref', () => {
  const home = tmpDir('home-');
  const work = tmpDir('work-');
  const file = deliverable(path.join(work, 'discovery', 'x', 'PROBLEM_BRIEF.md'));
  seedSync(home, 'x', {
    feature: 'x', workdir: work,
    artifacts: { brief: { path: file, status: 'synced', ref: 'ref-brief', synced_at: '2026-10-12' } },
  });

  runHook(writeOf(file), home);

  assert.deepEqual(readSync(home, 'x').artifacts.brief, {
    path: file, status: 'pending', ref: 'ref-brief', synced_at: '2026-10-12',
  });
});

test('a new retro date resets ref; rewriting the same retro keeps it', () => {
  const home = tmpDir('home-');
  const work = tmpDir('work-');
  const dir = path.join(work, 'discovery', 'x');
  const oldRetro = deliverable(path.join(dir, 'RETRO-2026-10-01.md'));
  seedSync(home, 'x', {
    feature: 'x', workdir: work,
    artifacts: { retro: { path: oldRetro, status: 'synced', ref: 'ref-retro-1', synced_at: '2026-10-01' } },
  });

  runHook(writeOf(oldRetro), home);
  assert.equal(readSync(home, 'x').artifacts.retro.ref, 'ref-retro-1');

  const newRetro = deliverable(path.join(dir, 'RETRO-2026-10-13.md'));
  runHook(writeOf(newRetro), home);
  assert.deepEqual(readSync(home, 'x').artifacts.retro, { path: newRetro, status: 'pending', ref: '', synced_at: '' });
});

test('a corrupt sync.json is rebuilt and the deliverable still marked pending', () => {
  const home = tmpDir('home-');
  const work = tmpDir('work-');
  fs.mkdirSync(path.join(home, '.discovery', 'x'), { recursive: true });
  fs.writeFileSync(syncPath(home, 'x'), '{not json');
  const file = deliverable(path.join(work, 'discovery', 'x', 'PROBLEM_BRIEF.md'));

  const { stdout } = runHook(writeOf(file), home);

  assert.match(stdout, /type `brief`/);
  const state = readSync(home, 'x');
  assert.equal(state.feature, 'x');
  assert.equal(state.artifacts.brief.status, 'pending');
});

test('a sync.json without artifacts, or with an artifacts array, is completed', () => {
  for (const seeded of [{ feature: 'x' }, { feature: 'x', artifacts: [] }]) {
    const home = tmpDir('home-');
    const work = tmpDir('work-');
    seedSync(home, 'x', seeded);
    const file = deliverable(path.join(work, 'discovery', 'x', 'PROBLEM_BRIEF.md'));

    runHook(writeOf(file), home);

    assert.deepEqual(readSync(home, 'x').artifacts.brief, { path: file, status: 'pending', ref: '', synced_at: '' });
  }
});

test('non-ASCII slugs and folders with spaces are kept verbatim', () => {
  const home = tmpDir('home-');
  const work = path.join(tmpDir('work-'), 'Mi carpeta de producto');
  const file = deliverable(path.join(work, 'discovery', 'facturación-rápida', 'PROBLEM_BRIEF.md'));

  runHook(writeOf(file), home);

  const state = readSync(home, 'facturación-rápida');
  assert.equal(state.workdir, work);
  assert.equal(state.artifacts.brief.path, file);
});

test('malformed stdin exits 0 with no output', () => {
  const { code, stdout } = runHook('this is not json', tmpDir('home-'));
  assert.equal(code, 0);
  assert.equal(stdout, '');
});

test('an unwritable home exits 0 with no output', () => {
  const homeAsFile = path.join(tmpDir('home-'), 'not-a-dir');
  fs.writeFileSync(homeAsFile, 'x');
  const work = tmpDir('work-');
  const file = deliverable(path.join(work, 'discovery', 'x', 'PROBLEM_BRIEF.md'));

  const { code, stdout } = runHook(writeOf(file), homeAsFile);

  assert.equal(code, 0);
  assert.equal(stdout, '');
});

test('the same slug written from another folder does not reuse the other folder\'s record', () => {
  const home = tmpDir('home-');
  const otherWork = tmpDir('work-');
  const work = tmpDir('work-');
  seedSync(home, 'x', {
    feature: 'x', workdir: otherWork,
    artifacts: { brief: { path: path.join(otherWork, 'discovery', 'x', 'PROBLEM_BRIEF.md'), status: 'synced', ref: 'ref-A', synced_at: '2026-10-12' } },
  });
  const file = deliverable(path.join(work, 'discovery', 'x', 'PROBLEM_BRIEF.md'));

  runHook(writeOf(file), home);

  const state = readSync(home, 'x');
  assert.equal(state.workdir, work);
  assert.deepEqual(state.artifacts.brief, { path: file, status: 'pending', ref: '', synced_at: '' });
});
