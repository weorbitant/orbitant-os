# orbitant-spec-gaps — design

## Problem

When a feature spec is written (typically via `superpowers:brainstorming`), gaps in it are easy to miss: entities mentioned without their full shape, functionality described without its failure behavior, user flows with no error path, edge cases nobody thought to ask about. These gaps surface later, mid-implementation, as "wait, what happens if X" questions that could have been caught earlier. Free-form review doesn't reliably catch them, because it's the same kind of judgment that produced the gap in the first place.

## Goal

A new skill in `orbitant-engineering` — `orbitant-spec-gaps` — that audits an already-written spec for functional gaps, using a mechanical inventory-then-checklist method instead of free-form review, and proposes concrete text to close each gap it finds.

## Scope

**In scope:** auditing a spec's functional completeness across four categories: entities, functionality, user flows, edge cases.

**Out of scope (this iteration):** technical-design completeness (architecture, data flow between components, error-handling implementation, API contracts, non-functional requirements). This was considered and deliberately deferred — checking technical depth makes more sense once an implementation plan exists (`writing-plans` output), not at the spec stage, where technical detail isn't expected to be fully resolved yet. A natural future extension is a sibling skill auditing the *plan* for technical gaps, analogous to this one auditing the *spec* for functional gaps. Not built here — flagging it is enough.

## Relation to other skills

- **`superpowers:brainstorming`** — produces the spec this skill audits. `orbitant-spec-gaps` is a downstream, independent audit layer, not a step inside brainstorming's own process. We don't control brainstorming's source (it's a third-party plugin), so we can't hook into it directly — see Trigger below.
- **`orbitant-debrief`** — the output/apply pattern (numbered findings, evidence required, user picks which to apply, append-only write) is deliberately copied from `debrief`'s established pattern in this same plugin.
- **`orbitant-ai-readiness` / `orbitant-owasp-scan` / `orbitant-12-factor`** — sibling audit-style skills in `orbitant-engineering`; `orbitant-spec-gaps` follows the same "any repo, any stack" positioning and lightweight SKILL.md + `references/` structure, no scripts.

## Identity

- **Name:** `orbitant-spec-gaps`
- **Folder:** `plugins/orbitant-engineering/skills/spec-gaps/`
- **No dedicated command file** (same as `debrief`) — invoked as `/orbitant-engineering:spec-gaps <path-to-spec>` or via natural language ("revisa esta spec en busca de huecos").

## Trigger

- **Explicit:** user names a spec file, or asks in natural language to check a spec for gaps.
- **Automatic (soft):** the skill's `description` field includes trigger phrases like "right after a design doc/spec is written or approved", "checking whether entities/flows/edge cases are fully defined in a spec" — relying on normal model-driven skill triggering, the same mechanism every other skill in this marketplace uses.
- **Explicitly rejected:** a `PostToolUse` hook matching spec file writes. Considered and dropped for two reasons: (1) anchoring the match pattern to `superpowers`'s specific output path/convention would silently couple `orbitant-engineering` (positioned as "any repo, any stack") to one external, unversioned-by-us plugin; broadening the pattern to something generic like `**/*-design.md` was the fallback, but the user preferred to keep the trigger mechanism uniform with the rest of the marketplace (description-only) rather than introduce the first hook in `orbitant-os`.

## Process

### Step 1 — Inventory

Before looking for gaps, build an explicit list of what the spec mentions, per category:

- **Entities** — every data object/concept named (e.g. "Order", "User").
- **Functionality** — every distinct capability/feature described.
- **User flows** — every named sequence of steps a user follows.
- **Edge cases** — the ones the spec already calls out explicitly.

This inventory is shown as part of the output. It's what makes "I didn't skip anything" mechanical rather than an impression — the same principle `debrief` uses (evidence per candidate, not a vibe check).

### Step 2 — Checklist per item

Every inventory item is checked against fixed criteria:

| Category | Checklist |
|---|---|
| Entity | Does it have attributes/fields listed? Relationships to other entities? States/lifecycle, if applicable? |
| Functionality | Is the input/trigger defined? Is the expected behavior defined? Is failure behavior defined? |
| User flow | Entry point? Complete happy path, step by step? Completion/exit state? Explicit error path? |
| Edge case | Cross-checked against a fixed list of commonly-missed categories: empty/zero state, duplicate/concurrent action, permission/ownership boundaries, invalid input, partial failure, scale/pagination limits. If the spec doesn't address a category or mark it explicitly out of scope, that's a gap. |

### Step 3 — Materiality bar (taken from `debrief`)

For each candidate gap: would its absence leave someone blocked or guessing if they started implementing right now? If not, drop it. No filling cosmetic gaps, no manufacturing findings to look thorough.

## Output

One numbered finding per gap, in this shape:

```
## 1. <short title>
**Category:** entity | functionality | flow | edge case
**Where:** <spec section/reference>
**Why it matters:** <what implementation decision is blocked or ambiguous without this>
**Proposed patch:**

> <exact markdown to paste into the spec>

## 2. ...

---
Tell me which to apply: "all", "1 and 3", "1 with edit: <change>", or "none".
```

If nothing meets the materiality bar: **"Spec looks solid — no gaps found that would block implementation."** This is the celebrated, biased-toward-zero outcome, not a fallback — same philosophy as `debrief`'s "session looks clean".

## Applying approved patches

Approved patches are appended to the spec file under a new `## Gap resolutions (spec-gaps)` section — **append-only**, never editing existing content in place (surgically inserting each patch into its "natural" section was considered and rejected: higher risk of breaking the spec's existing structure/formatting for uncertain benefit). The engineer can fold the appendix into the right sections by hand afterward. No staging, no auto-commit — same as `debrief`, the engineer owns the git flow.

## Example

`references/examples.md` holds one end-to-end worked example (toy spec → inventory → gaps found → proposed patches), not one example per category — keeps the SKILL.md itself lean via progressive disclosure, consistent with `ai-readiness`/`owasp-scan`/`12-factor`. The example's domain is deliberately abstract/generic (not tied to a specific vertical like e-commerce) so the model doesn't anchor its gap-finding to that domain's specific concerns.

## Open items for the implementation plan

- Exact wording of the `description` field's trigger phrases (needs to be specific and pushy per this repo's skill-writing conventions).
- Whether `marketplace.json` and `plugin.json` version bump happen as part of this same PR (per repo conventions, yes — but left for `writing-plans` to sequence).
