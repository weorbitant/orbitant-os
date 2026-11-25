'use strict';

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const VERDICT_LINE = /^VERDICT: (READY|NOT_READY|BLOCKED)$/;
const RETRO_TAG = /^[-*]\s+\[(SKILL|DOMAIN|UX)\]/;

function lines(content) {
  return content.replace(/\r\n?/g, '\n').split('\n');
}

function frontmatter(content) {
  const all = lines(content);
  if (all[0] !== '---') return null;
  const end = all.indexOf('---', 1);
  if (end === -1) return null;
  const fields = {};
  for (const line of all.slice(1, end)) {
    const match = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (match) fields[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  }
  return fields;
}

function isDate(value) {
  const match = DATE.exec(value || '');
  if (!match) return false;
  const month = Number(match[2]);
  const day = Number(match[3]);
  return month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

function section(content, heading) {
  const all = lines(content);
  const start = all.findIndex((line) => line.trim() === heading);
  if (start === -1) return null;
  const rest = all.slice(start + 1);
  const next = rest.findIndex((line) => /^#{1,2} /.test(line));
  return next === -1 ? rest : rest.slice(0, next);
}

const CHECKS = {
  'frontmatter-generated-at': {
    appliesTo: ['brief', 'stress_test', 'retro', 'scorecard'],
    run(content) {
      const fields = frontmatter(content);
      if (!fields) return 'the content does not start with a frontmatter block';
      if (!isDate(fields.generated_at)) return 'the frontmatter has no generated_at date (YYYY-MM-DD)';
      return null;
    },
  },
  'brief-title': {
    appliesTo: ['brief'],
    run(content) {
      const found = lines(content).some((line) => /^# Problem brief — \S/.test(line));
      return found ? null : 'there is no "# Problem brief — <title>" heading with a title';
    },
  },
  'stress-test-verdict': {
    appliesTo: ['stress_test'],
    run(content) {
      const nonEmpty = lines(content).filter((line) => line.trim() !== '');
      const last = nonEmpty.length ? nonEmpty[nonEmpty.length - 1] : '';
      return VERDICT_LINE.test(last)
        ? null
        : 'the last non-empty line is not exactly VERDICT: READY, VERDICT: NOT_READY or VERDICT: BLOCKED';
    },
  },
  'retro-title': {
    appliesTo: ['retro'],
    run(content) {
      const found = lines(content).some((line) => /^# Discovery retro — \S.* — \S/.test(line));
      return found ? null : 'there is no "# Discovery retro — <feature> — <date>" heading';
    },
  },
  'retro-tags': {
    appliesTo: ['retro'],
    run(content) {
      const body = section(content, '## Findings (routed)');
      if (body === null) return 'there is no "## Findings (routed)" section';
      const untagged = body.filter((line) => /^[-*]\s/.test(line) && !RETRO_TAG.test(line));
      return untagged.length
        ? `a finding does not start with [SKILL], [DOMAIN] or [UX]: "${untagged[0].trim()}"`
        : null;
    },
  },
  'scorecard-score': {
    appliesTo: ['scorecard'],
    run(content) {
      const fields = frontmatter(content);
      return fields && fields.score ? null : 'the frontmatter has no score';
    },
  },
};

function checkDeliverable(type, content) {
  const failures = [];
  for (const [id, check] of Object.entries(CHECKS)) {
    if (!check.appliesTo.includes(type)) continue;
    const reason = check.run(typeof content === 'string' ? content : '');
    if (reason) failures.push({ id, reason });
  }
  return failures;
}

module.exports = { CHECKS, checkDeliverable };
