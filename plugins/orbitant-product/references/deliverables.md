# Deliverables — the core contract

What a discovery produces, when each product is valid, and what is kept of it. This file never
says how or where anything is stored: that belongs to the store the PM picked. Every check here
speaks of a deliverable's **content**, never of a file; how the content is obtained is the
runtime's business.

## Card fields

Each deliverable has one card with the same fields:

- **Produced by**: the step and the skill or agent that writes it.
- **Required content**: what must be present, by section heading or line.
- **Invalid on sight**: mechanical checks, each with an id. One failing check makes the
  deliverable Invalid, even if nothing else was checked.
- **Valid when**: checks that need judgment.
- **Record**: whether it is kept, and the values of the record fields for it.

## Validation states

- **Valid**: no *Invalid on sight* check fails and every *Valid when* check passes. Only a Valid
  deliverable is handed on to be kept.
- **Invalid**: a check fails. Its id and what is missing go back to whoever wrote the
  deliverable, who rewrites it. Invalid never stops the discovery.
- **Not yet produced**: its step has not run. Nothing to do.

## Brief

- **Produced by**: the `orbitant-problem-interrogator` skill, step 1 of the discover command,
  and every later round that rewrites it.
- **Required content**: a frontmatter block with `generated_at`; the heading
  `# Problem brief — <title>`; the sections of the brief template in
  `orbitant-problem-interrogator` (*Deliverable: Problem brief*). The two sections the template
  marks "only if" are required only when their condition holds.
- **Invalid on sight**: `frontmatter-generated-at`, `brief-title`.
- **Valid when**: every required section of the template is present and says something; an
  unresolved point is written as `[TO CLARIFY: … — owner: …]`, never left empty.
- **Record**: kept. `type` is `brief`.

## Stress test

- **Produced by**: the discover command, steps 2 and 3, as the union of the `brief-stress-test`
  audits of one round.
- **Required content**: a frontmatter block with `generated_at`; the merged gaps; the merged
  *Start now / Don't build yet* partition and *Delivers*; the combined verdict as the very last
  line.
- **Invalid on sight**: `frontmatter-generated-at`, `stress-test-verdict`.
- **Valid when**: every blocking gap carries its *To close it* question.
- **Record**: kept. `type` is `stress_test`.

## Retro

- **Produced by**: the `orbitant-discovery-retro` skill, step 5 of the discover command, or on
  its own at the end of a session.
- **Required content**: a frontmatter block with `generated_at`; the heading
  `# Discovery retro — <feature> — <date>`; the sections of the report schema in
  `orbitant-discovery-retro`.
- **Invalid on sight**: `frontmatter-generated-at`, `retro-title`, `retro-tags`.
- **Valid when**: every finding carries its evidence.
- **Record**: kept. `type` is `retro`.

## Scorecard

- **Produced by**: the `brief-scorecard` agent, through the score command, which writes the
  frontmatter.
- **Required content**: a frontmatter block with `artifact`, `generated_at`, `score`, `verdict`
  and `threshold`; the agent's output below it.
- **Invalid on sight**: `frontmatter-generated-at`, `scorecard-score`.
- **Valid when**: no further check.
- **Record**: not kept. A scorecard is a single measurement.

## The record

What is kept of a Valid deliverable is a **record**. It is the same for every store; a store may
rename its fields or reshape its body, never change what a field means.

| Field | Value |
|---|---|
| `type` | `brief`, `stress_test` or `retro` |
| `feature` | the discovery's slug, verbatim; it joins the records of one discovery |
| `title` | `<Type> — <feature title>`, with `<Type>` one of `Brief`, `Stress test`, `Retro`; a retro's title ends with its date: `Retro — <feature title> — <YYYY-MM-DD>` |
| `status` | `draft`, `current` or `obsolete` (see the status rule) |
| `updated` | the deliverable's `generated_at` |
| `summary` | at most 200 characters, in the PM's language: what it solves and for whom; cut with `…` rather than exceed |
| `keywords` | 4 to 10: domain synonyms, acronyms and the English term |
| `body` | the deliverable's content without its frontmatter |
| `brief` | for a stress test or a retro: the reference of the brief's record, when known |

How to fill the fields that need reading:

- **Feature title**: from the brief's `# Problem brief — <title>` heading. For a stress test or a
  retro, from the brief of the same discovery. With no brief, the slug made readable.
- **`summary`**:
  - Brief: the *Problem to solve* statement plus who it affects.
  - Stress test: `VERDICT: <READY|NOT_READY|BLOCKED> · <n> blocking, <m> non-blocking`, plus
    the main gap if it fits, written in the PM's language.
  - Retro: the count per tag (`[SKILL]`, `[DOMAIN]`, `[UX]`) plus the headline finding.
- **`keywords`**: reuse the store's existing keywords that mean the same before adding one;
  never a near-duplicate such as `invoice` next to `invoices`.

### Status rule

- A brief is `current` when the discovery's verdict is `READY`; otherwise, including when there
  is no verdict yet, `draft`.
- A stress test and a retro are always `current`.
- Keeping a stress test also sets its brief's `status`: `current` for `READY`, `draft` for
  `NOT_READY` or `BLOCKED`, since neither can be built.

## Check index

Every check id, what it requires of the content, and the deliverables it applies to. The
runtime's executable checks implement exactly these ids.

| Id | Applies to | The content must |
|---|---|---|
| `frontmatter-generated-at` | Brief, Stress test, Retro, Scorecard | start with a frontmatter block whose `generated_at` is a `YYYY-MM-DD` date |
| `brief-title` | Brief | have a `# Problem brief — <title>` heading with a non-empty title |
| `stress-test-verdict` | Stress test | end with a last non-empty line that is exactly `VERDICT: READY`, `VERDICT: NOT_READY` or `VERDICT: BLOCKED` |
| `retro-title` | Retro | have a `# Discovery retro — <feature> — <date>` heading |
| `retro-tags` | Retro | start every item under `## Findings (routed)` with `[SKILL]`, `[DOMAIN]` or `[UX]` |
| `scorecard-score` | Scorecard | carry a non-empty `score` in its frontmatter |
