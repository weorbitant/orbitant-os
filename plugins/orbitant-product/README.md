# orbitant-product

A Claude Code / Cowork plugin that makes a PM/PO define a product problem properly before it
reaches design or engineering. An independent judge audits the definition, and every session's
learnings are fed back into the tooling.

> The skills and docs are written in English, but at runtime they talk to you in your own
> language.

## `/orbitant-product:discover "<raw idea>"` — from an idea to a brief you can start building

1. **Interrogation.** `orbitant-problem-interrogator` first pins down the problem, then proposes
   a cut: a **base**, the smallest version that attacks the problem, and **next increments** for
   later. You decide the cut. Only the base is interrogated in depth; of each increment it asks
   just whether the base has to record something today for it. It writes `PROBLEM_BRIEF.md`.
2. **Audit.** Three judges (`brief-stress-test`) review the brief in parallel, each in a clean
   context that never sees your conversation. A gap only **blocks** if the build would have to
   commit to something irreversible before the answer arrives: what it stores, what it discards,
   or a structure it would have to tear out. Every other gap travels with the brief as an open
   question. The findings go to `STRESS_TEST.md`.
3. **More rounds, only on what blocks.** Each new round targets the blocking gaps and nothing
   else. Once rounds stop reducing them, or after two, a **closing round** asks nothing new: for
   each blocking gap you either record everything any answer could need, or move that part to the
   next increments.
4. **The end.** The discovery ends when another round would no longer change what gets built
   now, with one of two verdicts:
   - **READY** — safe to start. Nothing left open forces an irreversible commitment, and what
     can start already satisfies at least one success criterion that measures the problem. It
     doesn't mean every question is answered, nor that the idea is good.
   - **BLOCKED** — nothing blocks, but what you could start doesn't attack the problem. The loop
     also stops as blocked if a second closing round still leaves blocking gaps.
5. **Retro.** `orbitant-discovery-retro` writes `RETRO-<date>.md`, sorting what the session
   taught into skill fixes, domain rules and PM friction. It runs on its own when the loop ends;
   if you close the session first, it comes back the next time you open Claude.

The run works in `discovery/<slug>/` in your working folder.

## `/orbitant-product:score <path | pasted text | "the X refinement">` — score any definition

Scores an existing brief, Epic or PRD, including one nobody wrote with this plugin, with an
independent judge (`brief-scorecard`) and a weighted rubric: 0–100 against a pass mark. It
writes `discovery/<slug>/SCORECARD.md`. It records; it never blocks.

## Where the result is kept

What a discovery produces, when each deliverable is valid and what is kept of it is one contract,
`references/deliverables.md`. Where it is kept is up to you:

- **Once per folder**, the discover command asks where to keep the discovery, and remembers the
  answer in `discovery/store.json`. Commit that file with the deliverables.
- **Each deliverable is checked** against its card as soon as it is written. A deliverable that
  fails a check is fixed before anything is kept.
- **Each valid deliverable is kept as one record** in that place, by a sub-agent, so the
  interview never carries the store's details.
- **If keeping it fails**, the discovery carries on and it is retried the next time you open
  Claude.

The places available today:

| Store | Where | What you need |
|---|---|---|
| `local-markdown` (default) | one Markdown file per record in a folder of this repo (`docs/discovery` unless you pick another) | nothing |
| `notion` | one record per deliverable in the product's *Descubrimiento de producto* database, written as you | a Notion connector in Claude Code or Cowork, and edit access to the product's Notion map |

With Notion, if the product has no map yet, the plugin offers to create a minimal one: a short
description of the product and the *Descubrimiento de producto* database, under the product's or
the client's existing page. It asks you to confirm the name and the description first. A folder
used with the old `product-discovery` plugin keeps its `discovery/notion.json` and goes on saving
to the same database.

Adding another place (Confluence, a vector store, …) is one new file in
`skills/sync-deliverable/references/stores/`; nothing else changes.

## Install

**Claude Code:**

```text
/plugin marketplace add weorbitant/orbitant-os
/plugin install orbitant-product
```

**Cowork:** your organization provides the plugin; ask an org admin.

It needs **Claude Code or Cowork**, because it uses sub-agents and hooks. The hooks are Node
scripts with no other dependencies. They work on macOS and Windows as long as the hook command
can reach `node`. The ledger lives in your home folder (`~/.discovery/`,
`%USERPROFILE%\.discovery\` on Windows), so there is nothing to add to `.gitignore`.

## claude.ai web

The web app has no plugins, hooks or sub-agents. Run `orbitant-problem-interrogator` and
`orbitant-discovery-retro` by hand in the same conversation, and do the audit in a **fresh
conversation**, giving it the brief and `agents/brief-stress-test.md` as its instructions: the
fresh context is what makes the audit independent. Score the same way with
`agents/brief-scorecard.md`. Nothing guarantees the retro there.

## Status (honest)

**Measured** in the proof of concept, on macOS, with simulated PMs:

- **The loop terminates.** A single closing round took a brief from 1 blocking gap to `READY` in
  3 of 3 audits. A bad-on-purpose control stayed `NOT_READY` 3 of 3, and a PM who defers
  everything never reached `READY`.
- **`orbitant-problem-interrogator`.** The conditional lenses (temporal, aggregate, lifecycle)
  went RED→GREEN 5/5. An interactive run against a simulated PM met 10 of 11 criteria, with all
  three lenses firing unprompted.
- **`brief-stress-test`.** On briefs with planted gaps, mean recall 4.67/5; clean on complete
  controls; exact `VERDICT:` token.
- **`orbitant-discovery-retro`.** Reads the artifacts, writes `RETRO-<date>.md` and flips the
  ledger to `retro:done`. Verified end to end.

**Not measured yet:**

- The deliverable checks, the sync sub-agent and the stores. They are covered by unit and
  contract tests only (`test/orbitant-product/` in this repo).
- No real PM has run the loop. It has been tried in one domain only, and the same model family
  plays interrogator, PM and judge.
- Not validated in a live Cowork runtime: that the hook command can reach `node`, that hooks
  and their feedback fire as in Claude Code, and that sub-agents get your connectors.

**Watch out for:**

- **Severity isn't stable between audits.** The same gap can come back blocking in one audit and
  not in another. The union of three absorbs that, at the cost of making the verdict as strict
  as the strictest audit.
- **On a locked-down Windows machine the hooks are the fragile part.** The orchestrator, which
  is plain prose, is the primary path; the hooks reinforce it.
