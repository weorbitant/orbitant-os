# product-discovery

A Claude Code / Cowork plugin that makes a PM/PO define a product problem properly before it
reaches design or engineering. An independent judge audits the definition, and every session's
learnings are fed back into the tooling.

> The skills and docs are written in English, but at runtime they talk to you in your own
> language.

This file is for using the plugin. How it works inside (roles, contracts, ledger, hooks,
where things live) is in [ONBOARDING.md](ONBOARDING.md).

## `/discover "<raw idea>"` — from an idea to a brief you can start building

1. **Interrogation.** `problem-interrogator` first pins down the problem, then proposes a cut:
   a **base**, the smallest version that attacks the problem, and **next increments** for
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
5. **Retro.** `discovery-retro` writes `RETRO-<date>.md`, sorting what the session taught into
   skill fixes, domain rules and PM friction. It runs on its own when the loop ends; if you
   close the session first, it comes back the next time you open Claude.

Everything lands in `discovery/<slug>/` in your working folder.

## `/score <path | pasted text | "the X refinement">` — score any definition

Scores an existing brief, Epic or PRD, including one nobody wrote with this plugin, with an
independent judge (`brief-scorecard`) and a weighted rubric: 0–100 against a pass mark. It
writes `discovery/<slug>/SCORECARD.md`. It records; it never blocks.

## Notion persistence (POC)

Every deliverable (`PROBLEM_BRIEF.md`, `STRESS_TEST.md`, `RETRO-<date>.md`) is also saved as
one record in the product's *Descubrimiento de producto* database in Notion, written as you.
The files in `discovery/<slug>/` stay the source of truth; the `sync-deliverable` skill keeps
the records in step with them.

- **What you do:** log in to Notion once (`/mcp` → notion → browser), and say once which
  product the folder belongs to, by name or by map link. There is no "without Notion" mode.
- **What the technical team does:** give each PM edit access to the product's Notion map. The
  plugin never changes permissions.
- **If the product has no map yet,** the plugin offers to create a minimal one: a short
  description of the product and the *Descubrimiento de producto* database. It asks you to
  confirm the product's name and the description first, and puts the map under the product's or
  the client's existing page. Completing the map (glossary, modules, business rules…) stays a
  manual job.
- **If a save fails,** the discovery carries on and the save is retried the next time you open
  Claude.
- **Commit `discovery/notion.json`** with the deliverables: it records where they go.

How the saves are guaranteed (`on-artifact-written.js`, `sync.json`) is in ONBOARDING › §5.

## Install

It needs **Claude Code or Cowork**, because it uses sub-agents and hooks. Load it from a clone:

```
claude --plugin-dir /path/to/product-discovery
```

There is no `.claude-plugin/marketplace.json` yet, so `/plugin marketplace add` can't install
this repo.

The hooks are Node scripts with no other dependencies (no bash, `jq` or git). They work on macOS
and Windows as long as the hook command can reach `node`. The ledger lives in your home folder
(`~/.discovery/`, `%USERPROFILE%\.discovery\` on Windows), so there is nothing to add to
`.gitignore`.

## claude.ai web

The web app has no plugins, hooks or sub-agents. Run `problem-interrogator` and
`discovery-retro` by hand in the same conversation, and do the audit in a **fresh
conversation**, giving it the brief and `agents/brief-stress-test.md` as its instructions: the
fresh context is what makes the audit independent. Score the same way with
`agents/brief-scorecard.md`. Nothing guarantees the retro there.

## Status (honest)

**Measured**, on macOS, with simulated PMs:

- **The loop terminates.** On 2026-10-13 a single closing round (2 messages, +13 lines) took the
  guardias brief from 1 blocking gap to `READY` in 3 of 3 audits. The bad-on-purpose control
  stayed `NOT_READY` 3 of 3, and a PM who defers everything never reached `READY`. See
  `evals/triage/RESULTS.md`.
- **`problem-interrogator`.** The conditional lenses (temporal, aggregate, lifecycle) went
  RED→GREEN 5/5 under the earlier one-question-per-message rule. On 2026-10-13 an interactive
  run against a simulated PM met 10 of 11 criteria, with all three lenses firing unprompted and
  30 messages to the brief. See `evals/interactive/`.
- **`brief-stress-test`.** On briefs with planted gaps, mean recall 4.67/5; clean on complete
  controls; exact `VERDICT:` token. See `evals/`.
- **`discovery-retro`.** Reads the artifacts on disk, including `STRESS_TEST.md`, writes
  `RETRO-<date>.md` and flips the ledger to `retro:done`. Verified end to end.
- **Hooks.** `on-session-start.js` and `on-artifact-written.js` have tests in
  `hooks/__tests__/` (`node --test "hooks/__tests__/*.test.js" "tests/*.test.js"`).
  `on-brief-ready.js` was unit-tested on 8 cases before `BLOCKED` existed, with the `blocked`
  case checked by hand on 2026-10-13; those tests aren't in the repo.
- **Notion persistence.** Covered by unit and contract tests only; the end-to-end run against a
  real Notion map is pending (`docs/superpowers/poc/notion-e2e-results.md`).

**Watch out for:**

- **Your session may expose an old judge.** The `brief-stress-test` a session dispatches can be a
  synced copy of the plugin rather than this folder. On 2026-10-13 it was the 2026-07-05
  version, which rates severity by importance and has no exits. The same bad brief gave 13, 12
  and 11 blocking gaps with it, and 2, 3 and 3 with the repo's, so the earlier termination
  experiments likely measured the old judge. Before measuring a contract change, ask the
  dispatched agent which verdict tokens it can emit.
- **Severity isn't stable between audits.** The same gap can come back blocking in one audit and
  not in another. The union of three absorbs that, at the cost of making the verdict as strict
  as the strictest audit.
- **No real PM has run the loop.** It has been tried in one domain only, and the same model
  family plays interrogator, PM and judge.
- **Not yet validated in a live runtime:** that the hook command can reach `node` in your
  build, the exact hook output contract (`additionalContext`), whether Cowork exposes plugin hooks and commands the same way Claude
  Code does, and whether it dispatches the bundled agents as truly isolated sub-agents. Hook
  APIs evolve; confirm before relying on them.
- **On a locked-down Windows machine the hooks are the fragile part.** The orchestrator, which
  is plain prose, is the primary path; the hooks reinforce it.
