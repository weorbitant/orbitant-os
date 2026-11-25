'use strict';
const path = require('node:path');

const PLUGIN = path.join(__dirname, '..', '..', 'plugins', 'orbitant-product');

const VALID = {
  brief: [
    '---',
    'generated_at: 2026-11-25',
    '---',
    '',
    '# Problem brief — Exportar facturas a Excel',
    '',
    '## Problem to solve',
    'Finance re-types every invoice.',
    '',
  ].join('\n'),
  stress_test: [
    '---',
    'generated_at: 2026-11-25',
    '---',
    '',
    '## Gaps',
    '- none blocking',
    '',
    'VERDICT: READY',
    '',
  ].join('\n'),
  retro: [
    '---',
    'generated_at: 2026-11-25',
    '---',
    '',
    '# Discovery retro — exportar-facturas — 2026-11-25',
    '',
    '## Findings (routed)',
    '- [SKILL] the cut came late — evidence: message 12',
    '- [DOMAIN] an invoice is never edited after issue — evidence: block 3; recurs? yes',
    '',
    '## Domain knowledge to capture',
    '- invoice: a closed document',
    '',
  ].join('\n'),
  scorecard: [
    '---',
    'artifact: discovery/x/PROBLEM_BRIEF.md',
    'generated_at: 2026-11-25',
    'score: 82',
    'verdict: PASS',
    'threshold: 70',
    '---',
    '',
    'Full scorecard.',
    '',
  ].join('\n'),
};

module.exports = { PLUGIN, VALID };
