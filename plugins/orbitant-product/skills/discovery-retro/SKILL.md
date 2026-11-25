---
name: orbitant-discovery-retro
description: Use at the end of a product discovery session (after orbitant-problem-interrogator and/or brief-stress-test), run by the PM/PO or by the discover command, to harvest feedback and produce a durable hand-off file for the technical team — routing each learning into skill improvement, domain knowledge to capture, or UX friction.
version: "1.0.0"
license: MIT
metadata:
  author: orbitant
  tags: product, discovery, retro, feedback, hand-off
allowed-tools: Read, Write, Edit, Glob
---

# Discovery retro — session feedback harvest (for the technical team)

## Language

Respond in **the user's language** (mirror the session's language). This document is in
English for maintainability; the report must be in the user's reference language.
**Translate everything into the user's language — including the section headers** in the
schema below (`## Session at a glance`, `## What worked (keep)`, etc.). The schema is written
in English only as a template; never copy the English headers verbatim into the report.
The routing tags (`[SKILL]`, `[DOMAIN]`, `[UX]`) stay as-is — they are labels for the team.
**Two lines also stay exactly as written**, because the deliverable checks read them: the
title's words `# Discovery retro —` before the feature and the date and the
`## Findings (routed)` heading.

## Who runs you and when

At the **end of a discovery session**. Either the PM/PO invokes you directly, or the
`/discover` orchestrator calls you as its final step.

You **harvest and route**. You do **not** edit skills, propose diffs, judge whether a
defect is real, or fix anything — the technical team refines later, across many sessions.

## Inputs (read every one that exists)

1. **The conversation transcript** — always available: the interrogation Q&A and the PM's
   asides.
2. **The discovery artifacts for this feature**, if present on disk (in the working
   folder):
   - `discovery/<slug>/PROBLEM_BRIEF.md` — the final brief.
   - `discovery/<slug>/STRESS_TEST.md` — the stress-test findings + verdict.

   **Read these especially for the stress-test**, whose findings will NOT be in your
   transcript when it ran in isolation (a forked sub-agent, or a separate conversation in
   claude.ai). If you don't know the `<slug>`, list `discovery/` or ask the PM once.
   If an artifact doesn't exist, proceed with the transcript alone.

## What you produce

Write the report to the canonical path **`discovery/<slug>/RETRO-<YYYY-MM-DD>.md`** in the
working folder (a durable, shareable artifact for the technical team — not scratch; dated so
sessions accumulate). Use today's date; if you can't determine it, ask the PM once.

Start the file with a **YAML frontmatter block** carrying `generated_at` (today's date,
`YYYY-MM-DD`), then emit **exactly the schema below**, in the user's language. **Route every
finding** with a tag so the team can triage:

- **`[SKILL]`** — a gap in a skill itself (a category missed, weak scaffolding, a question
  repeated). Must be **agnostic** — no product/business/domain specifics here.
- **`[DOMAIN]`** — a business rule or term that surfaced and will recur (a concept the PM
  had to explain, a constraint discovered). Candidate for the **domain pack** — keep it
  **out** of the agnostic skills.
- **`[UX]`** — friction in how it felt to the PM (confusing, got stuck, too long/short).

## Ask the PM for feedback (do this before finalizing)

Before you write (or right after a first draft), **ask the PM directly for their feedback on
the session** — do not rely only on inferring it from the transcript. Keep it to **one**
short message with a couple of concrete prompts, in the user's language, e.g.:

> "Antes de cerrar: ¿cómo te ha ido la sesión? ¿Alguna pregunta te sobró o faltó, algo que
> se hiciera pesado, o algo que quieras añadir con tus palabras?"

Feed the answer into the report: route friction into `[UX]` findings and put anything the PM
wants recorded literally into **PM's own notes**. If the PM has nothing to add, that's fine
— proceed and use the neutral line. Ask **once**; do not re-interrogate.

### Report schema

```
---
generated_at: <YYYY-MM-DD>
---

# Discovery retro — <feature> — <date>

## Session at a glance
- Skills used; brief outcome (verdict READY / NOT_READY / BLOCKED, number of [TO CLARIFY]).

## What worked (keep)
- Bullets. Positive signal so the team doesn't regress it.

## Findings (routed)
- [SKILL] <the gap, one line> — evidence: <what happened in the session>
- [DOMAIN] <the rule/term> — evidence: <where it came up>; recurs? <yes / unsure>
- [UX] <the friction> — evidence: <quote or moment>

## Domain knowledge to capture
- The [DOMAIN] items restated as candidates for the domain pack, each with a one-line
  definition **as the PM stated it**. Flag anything the PM was unsure about as
  "needs a domain expert".

## PM's own notes
- Anything the PM wants to add, verbatim. If the PM adds nothing, write a single neutral
  line in the user's language (e.g. "_No additional notes._") — never leave a
  "pending / to be filled in" placeholder in the artifact.
```

## Close the loop (durable state)

After writing the report, **if a ledger exists** at `<home>/.discovery/<slug>/state.json`
(`~/.discovery/…` on macOS/Linux, `%USERPROFILE%\.discovery\…` on Windows), update it: set
`"retro": "done"` and `"retro_path"` to the report path you just wrote. This is what stops
the `SessionStart` backstop from re-flagging the run — do not skip it when the ledger is
present. If there is **no** ledger (standalone claude.ai use), skip this step and just
produce the file.

**Persist the report.** Writing `RETRO-<date>.md` makes the `PostToolUse` hook check it against
its card and, when it passes, ask for the `deliverable-sync` agent; dispatch it. If the hook
reports a failed check, fix the report first. When you run standalone in a runtime without
hooks, run `orbitant-sync-deliverable` for this retro yourself after writing the file.

## Honest scope

- **One session is not proof.** Report `[SKILL]` items as candidates with evidence; the
  team decides whether a pattern is real across sessions. Don't overstate a single case.
- **Don't invent domain rules** the PM didn't state. If unsure whether an item is
  `[SKILL]` or `[DOMAIN]`: tag `[DOMAIN]` if it's specific to the product/business/domain,
  `[SKILL]` if it's generic.
- The report is a **hand-off artifact**, not an action. What the team does with it later is
  theirs to decide; your job ends at the hand-off.
