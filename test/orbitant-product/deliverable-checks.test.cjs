'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { PLUGIN, VALID } = require('./fixtures.cjs');

const { CHECKS, checkDeliverable } = require(path.join(PLUGIN, 'hooks', 'lib', 'deliverable-checks.cjs'));

const ids = (type, content) => checkDeliverable(type, content).map((f) => f.id);

test('every valid fixture passes every check', () => {
  for (const [type, content] of Object.entries(VALID)) {
    assert.deepEqual(checkDeliverable(type, content), [], type);
  }
});

test('frontmatter-generated-at: no frontmatter block', () => {
  const content = VALID.brief.replace(/^---\ngenerated_at: 2026-11-25\n---\n/, '');
  assert.deepEqual(ids('brief', content), ['frontmatter-generated-at']);
});

test('frontmatter-generated-at: a generated_at that is not a date', () => {
  for (const value of ['today', '2026-13-01', '25/11/2026', '']) {
    const content = VALID.stress_test.replace('generated_at: 2026-11-25', `generated_at: ${value}`);
    assert.deepEqual(ids('stress_test', content), ['frontmatter-generated-at'], value);
  }
});

test('frontmatter-generated-at: a quoted date passes, Windows line endings too', () => {
  assert.deepEqual(ids('retro', VALID.retro.replace('2026-11-25\n---', '"2026-11-25"\n---')), []);
  assert.deepEqual(ids('brief', VALID.brief.replace(/\n/g, '\r\n')), []);
});

test('brief-title: missing heading or empty title', () => {
  assert.deepEqual(ids('brief', VALID.brief.replace('# Problem brief — Exportar facturas a Excel', '# Exportar facturas')), ['brief-title']);
  assert.deepEqual(ids('brief', VALID.brief.replace('# Problem brief — Exportar facturas a Excel', '# Problem brief — ')), ['brief-title']);
});

test('stress-test-verdict: the verdict must be the exact last line', () => {
  const failing = [
    VALID.stress_test.replace('VERDICT: READY', 'VERDICT: READY.'),
    VALID.stress_test.replace('VERDICT: READY', 'verdict: ready'),
    VALID.stress_test.replace('VERDICT: READY\n', 'VERDICT: READY\n\nOne more thought.\n'),
    VALID.stress_test.replace('VERDICT: READY\n', ''),
  ];
  for (const content of failing) assert.deepEqual(ids('stress_test', content), ['stress-test-verdict']);
  for (const verdict of ['NOT_READY', 'BLOCKED']) {
    assert.deepEqual(ids('stress_test', VALID.stress_test.replace('READY', verdict)), []);
  }
});

test('retro-title: missing heading', () => {
  assert.deepEqual(ids('retro', VALID.retro.replace('# Discovery retro — exportar-facturas — 2026-11-25', '# Retro')), ['retro-title']);
});

test('retro-tags: an untagged finding, or no findings section', () => {
  const untagged = VALID.retro.replace('- [SKILL] the cut came late', '- [BUG] the cut came late');
  assert.deepEqual(ids('retro', untagged), ['retro-tags']);
  assert.match(checkDeliverable('retro', untagged)[0].reason, /\[BUG\]/);
  assert.deepEqual(ids('retro', VALID.retro.replace('## Findings (routed)', '## Findings')), ['retro-tags']);
});

test('retro-tags: items in other sections are not findings', () => {
  assert.deepEqual(ids('retro', VALID.retro.replace('- invoice: a closed document', '- untagged on purpose')), []);
});

test('scorecard-score: the frontmatter must carry a score', () => {
  assert.deepEqual(ids('scorecard', VALID.scorecard.replace('score: 82\n', '')), ['scorecard-score']);
});

test('checks only run for the deliverables they apply to', () => {
  assert.deepEqual(ids('brief', VALID.brief + '\nVERDICT: nonsense\n'), []);
  assert.deepEqual(ids('unknown', ''), []);
});

test('every check declares the deliverables it applies to', () => {
  const types = new Set(['brief', 'stress_test', 'retro', 'scorecard']);
  for (const [id, check] of Object.entries(CHECKS)) {
    assert.ok(check.appliesTo.length > 0, id);
    for (const type of check.appliesTo) assert.ok(types.has(type), `${id}: ${type}`);
  }
});
