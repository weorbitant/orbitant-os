# orbitant-product — design

## Problem

The product discovery plugin (`product-discovery`, 0.2.0) lives in the private repo
`weorbitant/product-discovery-poc` and ships as a zip. Every change means a new zip sent to
each user, and each user stays on the version they were given.

It is also tied to one store. Every deliverable must be mirrored to a Notion database: the
plugin bundles Notion's MCP server, `/discover` refuses to start until the PM is logged in to
Notion, and the Notion property names live inside the same skill that decides what a record
contains. Keeping the result anywhere else (Confluence, a vector store such as Qdrant, plain
Markdown files) means editing the plugin's core.

## Goal

A new vertical in orbitant-os, `orbitant-product`, that ships the discovery plugin from the
marketplace and as the npm package `@orbitant/brain-product`.

Its **core says what a discovery produces and how each product is validated, never how or
where the result is stored.** A **store** is anything that keeps the result. v1 ships two
stores, Markdown files in the working folder and Notion. Adding another one later is a new
store file; the core does not change.

The skills, agents and commands are copied from the POC as they are, except the persistence
layer, which is split into the core's deliverable contract and one file per store.

## Scope

**In scope:**

- Creating `plugins/orbitant-product/` from the POC runtime files.
- The renames and packaging changes orbitant-os requires.
- Splitting persistence into a store-agnostic core and stores, with two stores in v1:
  `local-markdown` (the default) and `notion`.
- Tests, lint, registration, release and end-to-end verification in orbitant-os.

**Out of scope:**

- Any change to `weorbitant/product-discovery-poc`. What happens to that repo is decided
  separately.
- Moving evals, specs, plans, ONBOARDING or ROADMAP from the POC. orbitant-os is public, and
  the evals hold realistic business scenarios.
- Importing the POC's git history.
- A product employent in `weorbitant/orbitant-employents`. Only the brain package is created
  here; npm builds it automatically, but an employent is a separate, manual effort.
- Building any store beyond the two above (Confluence, Qdrant, Jira, Drive). The store
  contract makes them possible; none is built here.
- Making the core independent of the runtime (see *Open items*).
- Rewriting `problem-interrogator`, `discovery-retro`, `brief-stress-test` or
  `brief-scorecard`. They are tuned by eval rounds in the POC; any clean-up comes later, as
  small PRs checked against those evals.

## Source

The POC `main` branch at the time of the copy. The plan in the POC's PR #16
(`docs/superpowers/plans/2026-10-20-migrate-to-orbitant-os.md`) already worked out the
mechanical side of this move; this design reuses its decisions for orbitant-os and replaces
two of them: "the Notion contract stays as it is" and "the bundled `.mcp.json` stays".

## Precedent: `orbitant-12-factor`

`orbitant-engineering`'s 12-factor skill was made agnostic in PR #80 ("states the evidence
it needs, not how to get it"): it says what to observe and how to judge it, never how to
execute it, so the Neptuno employent can run it without a shell. This design applies the
same pattern to the other end of the run: the core says what it produces and how to
validate it, never how or where it is stored.

| 12-factor (PR #80) | orbitant-product |
|---|---|
| A fixed card per factor: Evidence · Compliant · Fail signal · Exclude | A fixed card per deliverable: Produced by · Required content · Valid when · Invalid on sight · Record |
| File names are examples; the principle is judged | Store names and tool ids are examples; the record is what is stored |
| Three states: Passing · Failing · Not observed | Three validation states: Valid · Invalid · Not yet produced |
| Missing evidence is not a failure; the report names it | A missing or unreachable store never stops the run; the PM is told what would fix it |
| Paths relative to the skill folder; no shell commands, no `@plugins/` | The same, in every file this design rewrites |
| A full checkout gives the same result as before | The Notion store with full access gives the same records as the 0.2.0 zip |
| MINOR bump when what the skill returns changes | MINOR bump when a card, a record field, a state or a store changes |

`orbitant-operations` / `orbitant-graceful-degradation` adds one rule: never hard-fail, and
give a concrete fix line for whatever is missing. It is not taken as the model for the rest:
it names its tools by id and keeps a Notion-only config, so it degrades but is not
store-agnostic.

## Identity

| Item | Value |
|---|---|
| Plugin folder and `plugin.json` name | `orbitant-product` |
| npm package | `@orbitant/brain-product` (built by `scripts/build-npm-packages.ts`, no code change) |
| Version | `0.3.0`: the renames break anyone on the 0.2.0 zip |
| Release tag | `orbitant-product-v0.3.0` |
| Meta package | `scripts/lib/meta-package.json` `1.8.0` → `1.9.0` (check the current value first) |

### Renames

| Before | After |
|---|---|
| plugin `product-discovery` | `orbitant-product` |
| skill `problem-interrogator` | `orbitant-problem-interrogator` |
| skill `sync-deliverable` | `orbitant-sync-deliverable` |
| skill `discovery-retro` | `orbitant-discovery-retro` |
| `/discover`, `/score` | `/orbitant-product:discover`, `/orbitant-product:score` |
| `hooks/*.js` | `hooks/*.cjs` |
| `discovery/notion.json` | `discovery/store.json` (old file still read, see below) |
| agents `brief-stress-test`, `brief-scorecard` | unchanged: the prefix rule covers skills only |

Folders keep their names without the prefix (`skills/problem-interrogator/`). The hooks inject
skill names into Claude's context, so a missed rename there stops the sync and the retro
without any error.

## What is copied

From the POC into `plugins/orbitant-product/`:

- `.claude-plugin/plugin.json` (rewritten, see *Registration*)
- `agents/`, `commands/`, `skills/`, `references/`
- `hooks/hooks.json` and the three hook scripts
- `README.md` (rewritten, see *Plugin README*)

Not copied: `.mcp.json`, `hooks/__tests__/`, `tests/`, `evals/`, `docs/`, `ONBOARDING.md`,
`ROADMAP.md`, `CLAUDE.md`.

## Core and stores

### Principle

The core decides what a discovery produces, when each product is valid, and what a stored
record contains. A store decides how and where that record is kept. Nothing in the core
names a store, a store's tools or a store's field names.

### What belongs where

| Part | Files | Knows about stores? |
|---|---|---|
| Core | `commands/`, `agents/`, `hooks/`, `skills/problem-interrogator/`, `skills/discovery-retro/`, `references/` (methodology) and the new `references/deliverables.md` | No |
| Sync | `skills/sync-deliverable/SKILL.md` | Only that stores exist and the contract they follow |
| Stores | `skills/sync-deliverable/references/stores/<store>.md`, one per store | Each knows only itself |

`orbitant-sync-deliverable` is the boundary. It reads a deliverable, validates it against
its card, builds the record, and hands the record to the store chosen for the folder.

### Working copy and store

A run needs a **working copy**: the deliverables written to `discovery/<slug>/` and the
ledger in `<home>/.discovery/<slug>/`. The isolated judges read the brief from it, the retro
reads the whole run from it, and the hooks watch it. The working copy is how the run works,
not where the result is kept, so it is not a store. The plugin never deletes it.

Keeping those Markdown files as the record is a store like any other: `local-markdown`. In
Claude Code its record is the working copy itself, so the store does almost nothing, and
that is expected.

When the working copy and a stored record differ, the working copy wins: every sync rebuilds
the record from it, never the other way round.

### Deliverable contract (`references/deliverables.md`)

New core file. It holds one card per deliverable, with the same fields for each:

- **Produced by**: the step and the skill or agent that writes it.
- **Required content**: what must be present, by section heading or line, never by store.
- **Valid when**: the check that passes it.
- **Invalid on sight**: a signal that fails it even if the rest was not checked.
- **Record**: the record fields, with their values for this deliverable.

The cards, from what the POC writes today:

| Deliverable | Produced by | Valid when | Invalid on sight |
|---|---|---|---|
| Brief (`PROBLEM_BRIEF.md`) | `orbitant-problem-interrogator`, `/discover` step 1 | frontmatter with `generated_at`; a `# Problem brief — <title>` heading; the sections the brief template in the skill requires | no `generated_at`, or no title heading |
| Stress test (`STRESS_TEST.md`) | the union of the `brief-stress-test` audits, `/discover` steps 2–3 | frontmatter with `generated_at`; the last line is exactly one of `VERDICT: READY`, `VERDICT: NOT_READY`, `VERDICT: BLOCKED` | no verdict line, or text after it |
| Retro (`RETRO-<YYYY-MM-DD>.md`) | `orbitant-discovery-retro`, `/discover` step 5 | frontmatter with `generated_at`; a `# Discovery retro — <feature> — <date>` heading; findings tagged only `[SKILL]`, `[DOMAIN]` or `[UX]` | no title heading, or an untagged finding |

`SCORECARD.md` from `/orbitant-product:score` gets a card with **Record: none**. It is
produced and validated but not stored, as in the POC.

The **record** is store-neutral. Its fields come from today's Notion step 4, without the
Notion names:

| Field | Value |
|---|---|
| `type` | `brief`, `stress_test` or `retro` |
| `feature` | the slug, verbatim; it joins the three records of one discovery |
| `title` | `<Type> — <feature title>`; a retro's title ends with its date: `Retro — <feature title> — <YYYY-MM-DD>` |
| `status` | `draft`, `current` or `obsolete` |
| `updated` | the deliverable's `generated_at` |
| `summary` | at most 200 characters, in the PM's language: what it solves and for whom |
| `keywords` | 4 to 10: domain synonyms, acronyms and the English term |
| `body` | the deliverable's Markdown, without its frontmatter |
| `brief` | for a stress test or a retro: the brief record's reference, when known |

The **status rule** is core too: a brief is `current` when the ledger's verdict is `READY`,
otherwise `draft`; a stress test and a retro are always `current`; a stress test also sets
the brief's status (`READY` → `current`, `NOT_READY` or `BLOCKED` → `draft`).

### Validation states

Each deliverable ends a sync in one of three states, as 12-factor's factors do:

- **Valid**: it passes its card; its record goes to the store.
- **Invalid**: an *Invalid on sight* signal, or a *Valid when* check fails. It is not stored.
  The sync names what is missing, and Claude rewrites the deliverable, which triggers a new
  sync. It never stops the run.
- **Not yet produced**: its step has not run. Nothing to do.

### Store contract

Each `references/stores/<store>.md` defines these parts, and the sync `SKILL.md` calls them
in this order:

1. **Detect.** How to tell whether the store can be used in this session.
2. **Login message.** One plain line for the PM, for Claude Code and for Cowork, saying what
   would make the store usable.
3. **Resolve the destination.** The questions to the PM and the fields it writes into
   `discovery/store.json`.
4. **Find and upsert.** How a record is found again by `feature` and `type` (plus `title`
   for a retro), created or updated, and the reference it returns.
5. **Failure messages.** The no-access line and the generic retry line.

Rules every store follows:

- A store **receives a record, never a file path**. How it keeps the body (a page, a file, a
  vector with its text in the payload) is its own business.
- A store may rename fields and reshape the body (Notion: Spanish property names, no tables).
  It never changes what a field means and never adds a status.
- Each part is written as capabilities ("search pages by title", "create an item in a
  collection"), not as tool ids. Tool ids may appear in brackets, as examples only, because
  the same store can reach the session through different connectors.

Adding a store means one new file in `references/stores/` and one more option in the
preflight question. As an illustration of the contract's reach, not as work in scope: a
Qdrant store would keep one point per record, with the fields as payload, the body embedded
as its vector, and *Find* as a payload filter on `feature` and `type`.

### v1 stores

**`local-markdown`** (the default):

- *Detect*: always usable when the session can write to the working folder.
- *Login message*: none.
- *Resolve the destination*: nothing to ask; writes `{ "store": "local-markdown" }`.
- *Find and upsert*: the record is the deliverable file itself; the reference is its path.
- *Failure messages*: the file cannot be written.

**`notion`**: today's Notion text, moved from the sync `SKILL.md`, with these changes only:

- Its *Find and upsert* maps the record to the existing database. `title` → `Título`,
  `type` → `Tipo` (`Brief`, `Stress test`, `Retro`), `status` → `Estado` (`draft` →
  `Borrador`, `current` → `Vigente`, `obsolete` → `Obsoleto`), `updated` → `Actualizado`,
  `summary` → `Resumen`, `keywords` → `Palabras clave`, `feature` → `Funcionalidad`, `brief` →
  the `<mention-page>` line. The database, its properties and values in Spanish, the body
  rules and the minimal product map stay as they are.
- The status note on a new map names the plugin `orbitant-product`, not `product-discovery`.
- The login message no longer assumes a bundled server. It tells the PM how to connect Notion
  in Claude Code (`/mcp`, or the claude.ai Notion connector) and in Cowork (its connectors
  menu). The exact labels are checked in the end-to-end run.

**Equivalence guarantee:** with full access, a run on the `notion` store creates and updates
the same records, with the same property values and the same body, as the 0.2.0 zip.

### `.mcp.json`

Removed. The core does not ship one store's server, and today it makes every user see a
Notion server they may not use. A PM who picks Notion uses the connector they already have,
or adds one following the login message.

### Destination file

`<workdir>/discovery/store.json` replaces `discovery/notion.json`. Its only core field is
`store`; every other field belongs to that store:

```json
{ "store": "local-markdown" }
```

```json
{
  "store": "notion",
  "product": "<product name>",
  "map_url": "<url>",
  "database_url": "<url>",
  "data_source": "collection://<id>"
}
```

**Compatibility:** if `store.json` is missing and `notion.json` exists, read it as
`"store": "notion"` with the same fields, and write `store.json` on the next successful sync.
Never delete `notion.json`: PMs on the 0.2.0 zip have committed it next to their
deliverables. This is the one place where the sync skill names a store, and it lives in
`references/stores/notion.md`, which the sync asks first whether it recognises an old file.

The PM commits `store.json` with the deliverables, as today.

### Preflight

Run by `/orbitant-product:discover` before the interview.

1. `store.json` exists, or a store recognises an old destination file → go to step 3.
2. Ask once per folder, in the PM's language, one line. The options are the stores in
   `references/stores/`. Example with the v1 stores: *"¿Dónde guardo esta discovery: solo en
   ficheros de esta carpeta, o también en Notion?"*
   - Run the chosen store's *Detect*, *Login message* and *Resolve the destination*.
   - While waiting for a login, the PM can switch to `local-markdown`.
3. If a store can't resolve its destination because of access, give its no-access line and
   offer `local-markdown` for this run, without writing `store.json`.

Never ask for IDs. The question in step 2 is the only point where the run may wait on the PM.

### Sync state

`<home>/.discovery/<slug>/sync.json` keeps its shape. Status values:

| Status | Meaning |
|---|---|
| `pending` | written, not yet stored; SessionStart resurfaces it |
| `synced` | stored; `ref` and `synced_at` set |
| `invalid` | new: failed its card; `reason` names what is missing; resurfaced like `pending` |

The hooks keep their logic and stay store-blind: `on-artifact-written` marks every written
deliverable `pending` and asks for the sync, whatever the store. With `local-markdown` that
sync is a validation plus a path, so the cost is one short step per write.
`on-session-start` lists `pending` and `invalid` items.

## Writing rules for the rewritten files

`references/deliverables.md`, `skills/sync-deliverable/SKILL.md` and every
`references/stores/<store>.md` follow 12-factor's rules:

- They describe what and when, never a shell command.
- Paths are relative to the skill's folder, never `@plugins/…`. The one exception is
  `references/deliverables.md`, at the plugin level because the core and the sync both read it,
  as `problem-interrogator` already reads `../../references/README.md`.
- Other skills, agents and commands are named by name, not by slash syntax.

The copied files keep their text, apart from the renames and the edits below.

## Other content changes

- `commands/discover.md`: step 0 and *Persistence* describe the preflight question, the
  working copy and the store, and point at `references/deliverables.md`. "The PM is logged in
  to the discovery store" stops being a precondition.
- `skills/discovery-retro/SKILL.md`: the skill name in *Persist the report*.
- The 25 markdownlint errors the orbitant-os config reports in the plugin Markdown (MD034,
  MD036, MD056, MD038, MD025), fixed in the files without changing wording Claude relies on.
  No ignores.

### Plugin README

Rewritten for orbitant-os:

- *Install*: the orbitant-os marketplace for Claude Code
  (`/plugin marketplace add weorbitant/orbitant-os`, `/plugin install orbitant-product`) and
  the org-provisioned plugin for Cowork. The `--plugin-dir` and "no marketplace.json yet"
  text goes.
- *Notion persistence (POC)* becomes *Where the result is kept*: what the discovery produces,
  the store chosen once per folder, and the stores available today. The README is the one
  core-side file that may name stores.
- *Status*: keeps the measured results, links to nothing in the private repo, and states that
  the deliverable contract and the stores are not covered by the evals yet.

## Tests

The POC's tests move to `test/orbitant-product/` as `.cjs`, outside `plugins/`, because the
npm build and the release zip ship everything under the plugin folder:

- `on-artifact-written.test.cjs`, `on-session-start.test.cjs`, `plugin-contract.test.cjs`
- Paths point to `plugins/orbitant-product/...`; assertions use the `.cjs` scripts and the new
  skill names.
- The root `test` script becomes
  `node --import tsx --test test/*.test.ts test/orbitant-product/*.test.cjs`.

New or changed assertions:

- **Core never names a store.** For each file in `skills/sync-deliverable/references/stores/`,
  its store name appears in no file outside that folder, except the plugin README. Adding a
  store extends the check by itself.
- **The contracts are complete.** `references/deliverables.md` has a card for each of the four
  deliverables with the five fields; each store file has the five contract parts.
- **No bundled server.** The plugin has no `.mcp.json`.
- **No unprefixed skill names** in any file.
- `on-session-start`: an `invalid` item is listed as `pending` is.
- The POC assertion that the plugin bundles Notion's MCP server is removed; the one that hook
  scripts never mention Notion becomes "never mention any store".

## Registration

- `plugins/orbitant-product/.claude-plugin/plugin.json`: `name: orbitant-product`,
  `version: 0.3.0`, `author: { "name": "Orbitant" }`, `license: MIT`, an explicit `skills`
  array, and a description that names no store, under 500 characters.
- Each SKILL.md frontmatter gets `version`, `license` and `metadata: { author, tags }`, per
  `.github/schemas/skill-frontmatter.schema.json`.
- `.claude-plugin/marketplace.json`: new entry, `source: ./plugins/orbitant-product`, same
  version.
- `scripts/lib/meta-package.json`: MINOR bump.
- Root `README.md`: a row in the plugins table and the install line.
- `.claude/CLAUDE.md`: the repo tree and *Current State*.

Gate before the PR: `npm run check` and `npm run website:parse` green, and the internal
`skill-reviewer` skill run on the three SKILL.md files.

## Versioning

From 0.3.0 on, as 12-factor's PR #80 did for pinned brain consumers:

- **MINOR**: a deliverable card, a record field, a validation or sync state, or the store
  contract changes; a store is added.
- **PATCH**: wording inside one store, or inside a skill, that changes no card, field or state.

## Release

1. PR on orbitant-os with the `review-quality` and `review-security` labels. The security
   review will look at hooks writing to `~/.discovery/`; answer it in the PR.
2. Before the tag, an `@orbitant` npm owner bootstraps the package once:
   `npm login`, then `node --import tsx scripts/publish-package.ts orbitant-product-v0.3.0`,
   then registers `weorbitant/orbitant-os` and `publish-packages.yml` as its trusted
   publisher on npmjs. Without it, the tag's npm job fails, and every later meta release
   refuses to publish because it pins `@orbitant/brain-product`.
3. Tag `orbitant-product-v0.3.0`, push it, and create the GitHub release with notes from the
   `release-notes` skill. `release-zip-assets.yml` attaches the zip.
4. An org admin uploads the zip at `claude.ai/admin-settings/plugins` and, in the same
   session, removes the old `product-discovery` plugin. With both installed, a PM sees
   duplicate skills.
5. Tag and release the meta (`orbitant-os-v1.9.0`) after the vertical exists on npm.

## End-to-end verification

On the released version:

- **Claude Code, `local-markdown`:** install from the marketplace, run
  `/orbitant-product:discover`, pick files only. The run completes, `store.json` says
  `local-markdown`, every `sync.json` item ends `synced` with its path as `ref`, and the next
  session resurfaces nothing.
- **Claude Code, `notion`:** a full run that creates or updates the three records in
  *Descubrimiento de producto*, written as the PM, matching the equivalence guarantee.
- **Compatibility:** a folder with only `notion.json` syncs to the same database without
  asking anything.
- **Invalid deliverable:** a brief without its title heading ends `invalid`, names the missing
  heading, and syncs once rewritten.
- **Cowork, Notion not connected:** the login message shows the real connector menu labels.
- **Cowork hooks:** `node` is available, `PostToolUse` fires on writing `PROBLEM_BRIEF.md`, and
  `~/.discovery/` survives across sessions. If it doesn't, record it as a known limit.

## Risks

- **The split is not measured.** The POC evals cover the interrogator and the judges, not the
  sync. The deliverable cards, the record and the stores enter with unit and contract tests
  and the end-to-end run only.
- **The cards can drift from the producers.** A section renamed in the brief template but not
  in its card makes valid briefs fail. The card points at the template rather than copying
  it where it can.
- **One more step per write.** With `local-markdown`, every deliverable write still runs a
  short sync. Accepted to keep the hooks store-blind.
- **Silent rename misses** in the hooks' injected text. Mitigated by the contract test.
- **Cowork hooks are unverified.** The guaranteed retro and the cross-session retry depend on
  them; the discovery itself does not.
- **npm coupling.** Once the vertical exists, every meta release depends on
  `@orbitant/brain-product` being published.
- **Public repo.** Runtime files hold no Notion IDs, emails or internal URLs, but the Notion
  store names the *Descubrimiento de producto* database, its properties and the
  `<Client> TECH` page convention. Accepted; no client data or real cases go into examples.

## Open items

- **Who owns `@orbitant` on npm and uploads the zip.** An org admin, by name. Blocks the
  release only.
- **Runtime independence.** The store split frees the core from where the result is kept,
  not from how it runs: the working copy, the hooks and the sub-agents assume Claude Code or
  Cowork. An employent reading `@orbitant/brain-product` could not run the core as it is.
  Related: orbitant-os#63 ("Skills for people are indistinguishable from skills an agent can
  run") is open, and this vertical's skills are all for a person in Claude Code.
- **Exact wording of the preflight question and the login messages**, checked against real
  menu labels in the end-to-end run.
