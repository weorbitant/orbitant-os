---
name: orbitant-sync-deliverable
description: Use when a hook asks to keep a discovery deliverable (PROBLEM_BRIEF.md, STRESS_TEST.md or RETRO-YYYY-MM-DD.md under the discovery folder of a feature), when SessionStart lists deliverables not yet kept, as the preflight of the discover command, or after writing a deliverable in a runtime without hooks — validates each deliverable against its card and keeps it as one record in the store the PM picked for the folder, even if the PM never mentions saving.
version: "1.0.0"
license: MIT
metadata:
  author: orbitant
  tags: product, discovery, persistence, sync, store
---

# Sync deliverable — keep discovery deliverables in the folder's store

This skill is the boundary between the discovery and wherever its result is kept. It knows that
stores exist and the contract they follow, and nothing about any one store. Each store is one
file in `references/stores/`, in this skill's folder.

The deliverables in `discovery/<slug>/` are the run's working copy. Every sync rebuilds the
record from the working copy, never the other way round.

## Language

Talk to the PM in **their language**, in plain words and **one line per message**. Never show
IDs, tool names, JSON or error dumps.

## What this skill reads and owns

- **The deliverable contract:** `../../references/deliverables.md`, from this skill's folder. It
  holds each deliverable's card, the record and the status rule. This skill applies it and never
  restates it. The cards point at two templates, also relative to this skill's folder: the brief
  template in `../problem-interrogator/SKILL.md` (*Deliverable: Problem brief*) and the report
  schema in `../discovery-retro/SKILL.md` (*Report schema*).
- **The stores:** `references/stores/<store>.md`, in this skill's folder. The options offered to
  the PM are the files in that folder.
- **The destination file**, `<workdir>/discovery/store.json`. Its `store` field is the name of
  a file in `references/stores/`; every other field belongs to that store, and the store's
  *Resolve the destination* writes the file.
- **The sync state**, `<home>/.discovery/<slug>/sync.json` (`~/.discovery/…` on macOS/Linux,
  `%USERPROFILE%\.discovery\…` on Windows), owned by this layer alone. Shape:
  `{ "feature", "workdir", "artifacts": { "brief"|"stress_test"|"retro": { "path", "status", "ref", "synced_at" } } }`,
  with `status` either `pending` or `synced`. Read-modify-write: keep every other field and item.
  Never touch `state.json` from here, except to read `verdict`.

## The store contract

Every store file opens with a **For the PM:** line, the words used to offer it, and defines
these six parts, under these headings. This skill calls them in this order:

1. **Detect.** How to tell whether the store can be used in this session.
2. **Login message.** One plain line for the PM saying what would make the store usable, for
   Claude Code and for Cowork.
3. **Resolve the destination.** The questions to the PM and the fields it writes into
   `store.json`. A store may also recognise an old destination file here.
4. **Accept.** Whether the store can take this record: its own limits only. Accept never judges
   whether the deliverable is good; the card does that.
5. **Find and upsert.** How a record is found again by `feature` and `type` (plus `title` for a
   retro), created or updated, and the reference it returns.
6. **Failure messages.** The no-access line and the generic retry line.

A store receives a **record**, never a path to the working copy.

## Mode: preflight

Run by the discover command before the interview, in the conversation, because it needs the PM.
Goal: this folder knows where its deliverables are kept.

1. **Known destination.** If `<workdir>/discovery/store.json` exists → step 4. If not, read each
   store's *Resolve the destination* for an old destination file it recognises; if one does,
   use it → step 4.
2. **Ask once.** In one line, ask where to keep this discovery. The options are the stores in
   `references/stores/`, each named with its **For the PM:** words, for example
   *"¿Dónde guardo esta discovery: <option one>, o <option two>?"*
3. **Set it up.** Run the chosen store's *Detect*.
   - Not usable → give its *Login message*, wait for the PM's reply, and run *Detect* again.
     While waiting, the PM can pick another store instead.
   - Usable → run its *Resolve the destination*. It writes `store.json`.
   - No access → give its no-access line, and offer the other stores. A store the PM picks then
     becomes this folder's store; the PM can change it later by asking for another one.
4. Report ready in one line, unless the store already told the PM where the deliverables go.

Never ask for IDs. This is the only point where the discovery may wait on the PM for
persistence.

## Mode: sync

Input: `<slug>` and `<type>` (`brief` | `stress_test` | `retro`), as given by the hook, by
SessionStart, or by whoever just wrote the deliverable. One sync at a time per slug: a stress
test also changes its brief's record.

When this mode runs as the `deliverable-sync` agent, it never asks the PM anything: wherever a
step below says to give the PM a line or to run preflight, return that instead and stop.

The file of each type, in `discovery/<slug>/`: `brief` → `PROBLEM_BRIEF.md`, `stress_test` →
`STRESS_TEST.md`, `retro` → `RETRO-<YYYY-MM-DD>.md` (the latest date when there are several).

1. **Load.** Read `sync.json` and take `artifacts.<type>.path`. With no such item — a runtime
   without hooks writes none — find the file in `discovery/<slug>/` of the current folder and add
   the item as `pending` with an empty `ref`. The deliverable's `<workdir>` is the parent of its
   `discovery/` folder. It is **not** necessarily the current folder: a SessionStart retry can
   run while the PM works elsewhere. If the file no longer exists at the recorded path, look for
   `discovery/<slug>/<file>` in the current folder.
   - **Found** → use that path and update `artifacts.<type>.path` to it.
   - **Not found** → say in one line that the deliverable was moved or deleted, so it can't be
     kept until it's back; leave it `pending` and keep its `ref`; stop.
2. **Validate.** Apply the deliverable's card from the contract: first every *Invalid on sight*
   check by its id, then every *Valid when* check. If any fails, do not keep it: leave it
   `pending`, report the check id and what is missing so the deliverable is rewritten, and stop.
   A rewrite is a new write, which brings a new sync.
3. **Destination.** Read `<workdir>/discovery/store.json`, from the deliverable's own folder,
   never the current folder's. If it is missing, check the stores for an old destination file as
   in preflight step 1. With no destination at all, run preflight for that `<workdir>`.
4. **Detect.** Run the store's *Detect*. Not usable → give its *Login message*, leave the item
   `pending`, stop. Never block the discovery.
5. **Build the record** from the deliverable, as the contract's *The record* says: `body` is the
   content without its frontmatter, and `updated` is the frontmatter's `generated_at`. For a
   brief's `status`, read `verdict` from the ledger `<home>/.discovery/<slug>/state.json`. For
   `brief`, use the brief's `ref` from `sync.json` when known.
6. **Accept.** Run the store's *Accept*. Rejected → leave `pending`, say the store's reason in
   one line, stop.
7. **Find and upsert.** Run the store's *Find and upsert*, with `artifacts.<type>.ref` as the
   known reference when set. It returns the record's reference.
8. **Status side effect** (stress test only). Take the verdict from the stress test's own last
   line, not from the ledger, which may not be written yet. Apply the contract's status rule to
   the brief: find the brief's record by its `ref`, or by `feature` and `type`, and update its
   `status` the way the store's *Find and upsert* describes. If the brief has no record yet,
   skip this step: the brief's own sync sets its status.
9. **Record.** In `sync.json`, set this item's `status: "synced"`, `ref` and `synced_at` (today,
   `YYYY-MM-DD`).
10. **Tell the PM** the store's one line from *Find and upsert*.

### When something fails

Any failure leaves the item `pending`. Say one plain line, then carry on with the discovery.
Never retry in a loop within the same turn.

| Failure | What to tell the PM |
|---|---|
| The store is not usable | the store's *Login message* |
| No access to the destination | the store's no-access line |
| The store rejects the record | the store's reason, from *Accept* |
| Anything else | the store's generic retry line |

Running this mode twice for the same deliverable is harmless: the second run finds the same
record and rewrites it.

## Who runs the sync

- **With sub-agents**, the conversation dispatches the `deliverable-sync` agent with the slug, the
  type and this file's absolute path, and waits for it before dispatching another sync for the
  same slug. The agent runs *Mode: sync* and never asks the PM: when a step needs the PM (a
  login, or no destination yet), it returns that, and the conversation gives the store's line or
  runs preflight.
- **Without sub-agents**, the conversation runs *Mode: sync* itself.
