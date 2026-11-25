---
name: discover
description: Run the full product discovery flow — interrogate to a Problem brief, stress-test it in isolation, loop until the build can start (READY) or cannot (BLOCKED), then guarantee the retro. Runtime with sub-agents (Claude Code / Cowork).
argument-hint: <raw product idea>
---

# /discover — product discovery orchestrator

You are the **controller** for a product discovery run. You do not do the discovery
yourself with ad-hoc questions — you drive the three phases in order (two skills and an
isolated sub-agent), persist artifacts to
disk, and keep durable state in a ledger so the run can resume and the retro is never
skipped.

**Language:** conduct the whole run in the user's language.

## Paths (single source of truth — cross-platform, no git assumed)

Pick a short kebab-case `<slug>` for the feature.

- **Ledger (scratch, user-level):** `<home>/.discovery/<slug>/state.json`
  (`~/.discovery/…` on macOS/Linux; `%USERPROFILE%\.discovery\…` on Windows). A **user-level
  base on purpose** — the `SessionStart` backstop finds it regardless of the working
  folder, the OS, or whether that folder is a git repo.
- **Deliverables (shareable):** `discovery/<slug>/` inside the working folder —
  `PROBLEM_BRIEF.md`, `STRESS_TEST.md`, `RETRO-<YYYY-MM-DD>.md`.

Store **absolute paths** in the ledger so they resolve from anywhere:

```json
{
  "feature": "<slug>",
  "phase": "interrogating|stress_testing|ready|blocked",
  "workdir": "<absolute path of the working folder>",
  "brief_path": "<abs>/discovery/<slug>/PROBLEM_BRIEF.md",
  "stress_test_path": "<abs>/discovery/<slug>/STRESS_TEST.md",
  "verdict": "READY|NOT_READY|BLOCKED|",
  "round": "<n>, and whether it was an elaboration or a closing round",
  "blocking_counts": [<size of the union of blocking gaps after each round>],
  "retro": "pending|done",
  "retro_path": ""
}
```

At start, if a ledger already exists for this feature, **read it and resume** from its
`phase` — do not restart completed phases.

## Deliverable frontmatter

Every deliverable you write to `discovery/<slug>/` starts with a YAML frontmatter block
carrying **`generated_at`** — today's date, `YYYY-MM-DD` (the date is in your session
context; date-only for now, no time):

```yaml
---
generated_at: <YYYY-MM-DD>
---
```

For `STRESS_TEST.md`, keep the sub-agent's `VERDICT:` line intact in the body; the
frontmatter goes above it.

## Flow

0. **Preflight (persistence).** Before anything else, run the `orbitant-sync-deliverable` skill in
   **preflight** mode. It makes sure this folder knows where its deliverables are kept, asking
   the PM once per folder if not. **Do not start step 1 until it reports ready.** This is the
   only point where persistence may wait on the PM.

1. **Interrogate.** Use the `orbitant-problem-interrogator` skill with the user's idea
   (`$ARGUMENTS`). Interactive — hand control to the conversation for the
   interrogation dialogue (the cut into a base and next increments first, then
   deep questions one at a time on the base, low-stakes ones in numbered
   batches). Write the *Problem brief* (with the deliverable
   frontmatter — see above) to `discovery/<slug>/PROBLEM_BRIEF.md`. Set ledger
   `phase: "interrogating"`, `workdir`, `brief_path`.

2. **Stress-test (isolated, three times).** Set ledger `phase: "stress_testing"`. Dispatch the
   **`brief-stress-test` sub-agent three times in parallel** (via the Task tool, in one
   message — each runs in its own clean context and never sees the others).
   In each dispatch, hand it exactly two things and the framing: *"A discovery run just used
   the `orbitant-problem-interrogator` skill (at `<abs path to skills/problem-interrogator/SKILL.md>`),
   which produces a Problem brief per its methodology. It generated this brief:
   `<abs path to discovery/<slug>/PROBLEM_BRIEF.md>`. Read the skill to learn what a complete
   brief must contain, and audit the brief for gaps against it."* Pass **only those two paths
   plus that framing — never the discovery conversation.** Each agent returns a review ending
   in a `VERDICT: READY` / `VERDICT: NOT_READY` line.

   **One audit is a sample, not the answer.** Two audits of the same brief agree on only a
   fraction of their `blocking` gaps; each one sees a different part of what is actually
   missing. Dispatching once makes every round close a subset and hands the rest back next
   round, which is what turns a discovery into five. **Take the union**: a gap any of the three
   rated `blocking` is blocking.

   **Write all three reviews (with the deliverable frontmatter — see above) to
   `discovery/<slug>/STRESS_TEST.md`** — one `## Audit 1|2|3` section each, verbatim, so
   `orbitant-discovery-retro` can read them; it can't see inside the sub-agents' contexts. Then close
   the file with a **combined section**: the union of the `blocking` gaps (merge duplicates,
   keep each gap's *To close it* and its `Closed by`), the merged **Start now / Don't build
   yet** partition — a part is *Start now* only if every audit put it there — the merged
   **Delivers** — a success criterion counts only if every audit listed it — and as the **very
   last line of the file** the combined verdict, nothing after it: `VERDICT: NOT_READY` if the
   union has any blocking gap; otherwise `VERDICT: BLOCKED` if the merged *Delivers* is empty;
   otherwise `VERDICT: READY`. Record that combined verdict, and the size of the union in
   `blocking_counts`, in the ledger.

3. **Loop.** Parse the last `VERDICT:` line of the file — the combined one (match the token
   exactly — `NOT_READY` also contains "READY"). `READY` and `BLOCKED` end the loop: go to
   step 4. `NOT_READY` starts another round, of one of two kinds. Overwrite the artifacts each
   round. `non-blocking` findings are recorded but never force a round.

   **The discovery ends when another round would no longer change what gets built now** — not
   when the brief runs out of gaps. Measured: a round closes every gap it is fed and writes new
   rules into the brief, and the new rules carry gaps of their own. Per-audit blocking counts
   went 4, 5 → 4, 5 → 3, 5, 4 → 4, 3, 4 while the brief grew 214 → 375 lines. Rounds that keep
   elaborating converge on the gaps but never on the brief.

   **Elaboration round** — the round as it has always been: feed the **"To close it"
   question(s) of every gap in the union** into step 1, so the round targets exactly those
   gaps. **A round closes a gap by taking one of its three exits, not by producing the
   answer.** The exits are: get the answer, carry the superset (record what every branch could
   need), or put that part outside the build for now. The first is often not available — the
   owner is HR, legal, a third party — and asking the PM again only repeats the question. **The
   other two are always available in the room**, so every round has a move that discharges the
   gap. For a gap marked `another round`, ask its *To close it*; for one marked `an outside
   answer`, decide the superset or the deferral and write it into the brief, **not** the
   question again.

   **When to stop elaborating.** The next round is a closing round when the union of this round
   is not smaller than the previous round's, or when two elaboration rounds have already
   followed the first interrogation. A round that opens as much as it closes is writing
   surface, not removing it.

   **Closing round** — asks nothing new. Put each blocking gap of the union to the PM as a
   choice between two exits, and write the one taken into the brief: **carry the superset**, or
   **put that part outside the build for now** — named in *Next increments*, with what would
   bring it back. A direct answer is allowed only when it selects among options
   the brief already contains. Anything that would add a rule, a state, a term or a mechanism is
   elaboration and is out of this round: defer the part instead. Then audit as usual.
   - `NOT_READY` after a closing round → one more closing round over what remains. If that one
     also returns `NOT_READY`, stop and end as blocked (step 4), carrying the remaining gaps as
     the reason: a loop that cannot discharge gaps through exits that are always available is a
     defect for the retro, not a reason for a third.

   **Every round reruns the skill's closing self-review over what that round changed.**
   Measured: a round that answers five gaps writes new terms, rules and mechanisms into a brief
   whose vocabulary predates them, and the next audit blocks on *those* — a term used with two
   meanings, a mechanism given two effective dates — not on the gaps it was asked to close. The
   review is cheap and it is the round's own text that is at risk; skipping it trades a closed
   gap for a fresh contradiction.

   `READY` means every irreversible gap has taken an exit and what can start still attacks the
   problem — *safe to start*, not *every question answered*. `BLOCKED` means no gap blocks but
   what can start does not attack the problem: the brief ends with the outside answers and
   scope decisions that would unblock it, each with its owner. The `non-blocking` list and the
   *Don't build yet* constraints travel with the brief either way.

4. **Mark the end (the signal).** Only once the loop has ended, write the ledger once:
   - `READY` → `phase: "ready"`, `verdict: "READY"`, `retro: "pending"`.
   - `BLOCKED`, or the second closing round still `NOT_READY` → `phase: "blocked"`, `verdict`
     as the last combined verdict, `retro: "pending"`.

   This single write is the signal the `PostToolUse` hook watches to trigger the retro.

5. **Retro.** Run the `orbitant-discovery-retro` skill on this session. It reads the transcript plus
   the on-disk artifacts, writes `discovery/<slug>/RETRO-<date>.md`, and — because a ledger
   exists — sets `retro: "done"` and `retro_path` itself. You don't flip the ledger
   manually; verify it ended `done`.

## Persistence

What each deliverable must contain, when it is valid and what is kept of it is the contract
in `references/deliverables.md`. The files in `discovery/<slug>/` are the run's working copy;
each Valid deliverable is also kept as one record in the store the folder picked, by the
`orbitant-sync-deliverable` skill. Every sync rebuilds the record from the working copy.

- After every write of a deliverable, the `PostToolUse` hook checks it against its card.
  - **A check fails** → the hook sends you the check id and what is missing. Rewrite the
    deliverable before continuing; the rewrite is checked again.
  - **It passes** → the hook marks it pending and asks you to dispatch the `deliverable-sync`
    agent for it. Dispatch it, and wait for its result before dispatching another sync for the
    same slug. Give the PM its one line. If it returns `needs-pm`, give the PM that line, or
    run preflight when the folder has no destination.
- In a runtime without hooks, check each deliverable against its card yourself after every
  write (steps 1 and 2, each round of step 3, and step 5), then run
  `orbitant-sync-deliverable` for it.
- A sync failure **never** blocks the run: the deliverable stays pending and the
  `SessionStart` hook resurfaces it next session.

## Guarantees

- The retro is **not optional**: the `PostToolUse` hook fires on the step-4 ledger write,
  and the `SessionStart` hook re-surfaces any run left at `phase: "ready"|"blocked", retro:
  "pending"` — so an abandoned run is caught next session. Still run the retro yourself in
  step 5; the hooks are the backstop, not an excuse to skip it.
- Write the ledger `phase: "ready"` or `phase: "blocked"` **exactly once**, and **only** when
  the loop has ended — never on a round that will be followed by another (that would fire the
  retro prematurely).

## Notes

- The ledger lives in the user home (`<home>/.discovery/`), not the working folder — no git
  needed. If the working folder **is** a git repo, add `discovery/` to `.gitignore` only if
  you don't want the deliverables committed (usually you do want them, so leave them).
- Needs sub-agents and hooks → **Claude Code / Cowork**. The stress-test is a **sub-agent**
  (`agents/brief-stress-test.md`), and `orbitant-problem-interrogator` / `orbitant-discovery-retro` are skills.
  In claude.ai web (no sub-agents/hooks), run the two skills manually and do the stress-test
  by hand — open the brief in a fresh conversation and review it against the
  `orbitant-problem-interrogator` methodology (see the plugin README).
