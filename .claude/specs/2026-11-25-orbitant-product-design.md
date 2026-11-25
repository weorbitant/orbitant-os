# orbitant-product — design

## Problem

The product discovery plugin (`product-discovery`, 0.2.0) lives in the private repo
`weorbitant/product-discovery-poc` and ships as a zip. Every change means a new zip sent to
each user, and each user stays on the version they were given.

It is also tied to one store. Every deliverable must be mirrored to a Notion database: the
plugin bundles Notion's MCP server, `/discover` refuses to start until the PM is logged in to
Notion, and its README says there is no "without Notion" mode. A PM who works in Confluence,
Drive or only with files cannot use it.

## Goal

A new vertical in orbitant-os, `orbitant-product`, that ships the discovery plugin from the
marketplace and as the npm package `@orbitant/brain-product`. The skills, agents and commands
are copied from the POC as they are, except the persistence layer, which becomes
store-agnostic: local files work on their own, and Notion is one optional store behind a
documented contract that other stores can implement later.

## Scope

**In scope:**

- Creating `plugins/orbitant-product/` from the POC runtime files.
- The renames and packaging changes orbitant-os requires.
- Making persistence store-agnostic, with two stores in v1: `none` (files only) and `notion`.
- Tests, lint, registration, release and end-to-end verification in orbitant-os.

**Out of scope:**

- Any change to `weorbitant/product-discovery-poc`. What happens to that repo is decided
  separately.
- Moving evals, specs, plans, ONBOARDING or ROADMAP from the POC. orbitant-os is public, and
  the evals hold realistic business scenarios.
- Importing the POC's git history.
- A product employent in `weorbitant/orbitant-employents`. Only the brain package is created
  here; npm builds it automatically, but an employent is a separate, manual effort.
- Stores other than Notion (Confluence, Drive, Jira). The contract makes them possible; none
  is built here.
- Rewriting `problem-interrogator`, `discovery-retro`, `brief-stress-test` or
  `brief-scorecard`. They are tuned by eval rounds in the POC; any clean-up comes later, as
  small PRs checked against those evals.

## Source

The POC `main` branch at the time of the copy. The plan in the POC's PR #16
(`docs/superpowers/plans/2026-10-20-migrate-to-orbitant-os.md`) already worked out the
mechanical side of this move; this design reuses its decisions for orbitant-os and replaces
two of them: "the Notion contract stays as it is" and "the bundled `.mcp.json` stays".

## Relation to other plugins

Two plugins in this repo already deal with tools that may be missing. This design takes one
rule from each.

- **`orbitant-engineering` / `orbitant-12-factor`** (PR #80, "states the evidence it needs,
  not how to get it"): the skill names what it needs, never the tool that gets it, so a
  runtime without a shell (the Neptuno employent) can still run it. Missing evidence is an
  explicit state (*Not observed*), not a failure. Taken here: the store contract names
  capabilities, not MCP tool ids, and the files-only mode is an explicit state (`local`).
  Every reference path is relative to the skill's folder, never `@plugins/…`.
- **`orbitant-operations` / `orbitant-graceful-degradation`**: never hard-fail; probe what is
  available, give a concrete fix line for whatever is missing, and let the caller decide.
  Taken here: a missing or unauthenticated store never stops the discovery, and each store's
  login message is that fix line. Not taken: that skill names its tools by id and keeps one
  Notion-only config (`business-databases.yaml`), so it degrades but is not store-agnostic.
- **`orbitant-engineering`**: the closest structural sibling (skills plus commands, explicit
  `skills` array in `plugin.json`).
- **First plugin with hooks and JavaScript in orbitant-os.** No other vertical ships
  `hooks.json` or scripts, so CI and the AI security review have not seen them before.

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

## Store-agnostic persistence

### Principle

The files in `discovery/<slug>/` are the source of truth and are always written. A store is
an optional mirror. Choosing no store is a full, supported mode, not a fallback. Persistence
never blocks the discovery, except for the single question that picks the store.

### Boundary

Only the `orbitant-sync-deliverable` skill knows that stores exist, and only its store
references know a specific store. The hooks, the commands, `orbitant-problem-interrogator`,
`orbitant-discovery-retro` and the agents never name a store. The contract test enforces it
(see *Tests*).

### Layout

```
skills/sync-deliverable/
├── SKILL.md                 <- store-agnostic: modes, destination file, sync state, failures
└── references/
    └── stores/
        └── notion.md        <- everything Notion-specific from today's SKILL.md
```

`SKILL.md` keeps today's structure (Language, Paths, Mode: preflight, Mode: sync, When
something fails) with the Notion steps replaced by calls into the chosen store reference. The
Notion steps move to `references/stores/notion.md` with their wording unchanged, apart from
the renames and the status note below.

### Store contract

Each `references/stores/<store>.md` defines these five parts, and `SKILL.md` names them in
this order:

1. **Detect.** How to tell whether the store's tools are available and authenticated in this
   session.
2. **Login message.** One plain line for the PM, for Claude Code and for Cowork.
3. **Resolve the destination.** The questions to the PM and the fields it writes into
   `discovery/store.json`. For Notion: today's *Resolve the destination* and *Create a
   minimal product map*.
4. **Upsert.** How a deliverable (type, properties, body) becomes one record, created or
   updated, and the `ref` it returns.
5. **Failure messages.** The no-access line and the generic retry line.

Each part is written as capabilities ("search pages by title", "create a record in a
database"), not as tool ids, because the same store can reach the session through different
connectors. Today's Notion text already does this ("use whichever Notion toolset is
authenticated"); the tool ids it gives in brackets stay only as examples.

Adding a store means adding one reference file and one option in the preflight question.
Nothing else changes.

### Destination file

`<workdir>/discovery/store.json` replaces `discovery/notion.json`:

```json
{ "store": "none" }
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
Never delete `notion.json`. PMs on the 0.2.0 zip have committed it next to their
deliverables.

The PM commits `store.json` with the deliverables, as today.

### Preflight

Run by `/orbitant-product:discover` before the interview.

1. `store.json` (or `notion.json`) exists → go to step 3.
2. Ask once per folder, in the PM's language, one line. Example: *"¿Quieres guardar una copia
   de esta discovery en Notion, o la dejo solo en ficheros?"* The options are the stores that
   have a reference file, plus "solo ficheros".
   - Files only → write `{ "store": "none" }` and report ready.
   - A store → run that store's *Detect*, *Login message* and *Resolve the destination*.
     While waiting for a login, the PM can switch to "solo ficheros".
3. A store whose destination can't be resolved because of access → give its no-access line,
   then offer to continue with files only for this run, without writing `store.json`.

Never ask for IDs. The question in step 2 is the only point where the run may wait on the PM.

### Sync state

`<home>/.discovery/<slug>/sync.json` keeps its shape. Status values:

| Status | Meaning |
|---|---|
| `pending` | written, not yet mirrored; SessionStart resurfaces it |
| `synced` | mirrored; `ref` and `synced_at` set |
| `local` | new: the folder's store is `none`; nothing to mirror, never resurfaced |

### Hook change

`on-artifact-written.cjs` reads `<workdir>/discovery/store.json` before marking a deliverable
pending. If its `store` is `none`, it writes `status: "local"` and adds no context, so Claude
is never asked to sync a files-only folder. In every other case (another store, a missing or
unreadable file) it behaves as today. The hook reads only the `store` field and still never
names a store, so the boundary holds.

`on-session-start.cjs` needs no logic change: it lists only `pending` items.

### Notion store changes

Inside `references/stores/notion.md`, the contract with the Notion database is unchanged:
database `Descubrimiento de producto`, its properties and values in Spanish, the record per
deliverable, the brief's `Estado` rule and the minimal product map. Three changes only:

- The status note on a new map names the plugin `orbitant-product`, not `product-discovery`.
- The login message no longer assumes a bundled server. It tells the PM how to connect Notion
  in Claude Code (`/mcp`, or the claude.ai Notion connector) and in Cowork (its connectors
  menu). The exact menu labels are checked in the end-to-end run.
- It reads and writes `store.json` instead of `notion.json`, with the compatibility rule above.

### `.mcp.json`

Removed. A store-agnostic plugin does not bundle one store's server, and today it makes every
user see a Notion server they may not use. A PM who picks Notion uses the connector they
already have, or adds one following the login message.

## Other content changes

Beyond the renames and persistence, only these edits:

- `commands/discover.md`: step 0 and *Persistence* describe the preflight question and the
  files-only mode; "the PM is logged in to the discovery store" stops being a precondition.
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
- *Notion persistence (POC)* becomes *Where the deliverables go*: files always, an optional
  store chosen once per folder, Notion as the store available today.
- *Status*: keeps the measured results, links to nothing in the private repo, and states that
  the files-only mode and the store contract are not covered by the evals yet.

## Tests

The POC's tests move to `test/orbitant-product/` as `.cjs`, outside `plugins/`, because the
npm build and the release zip ship everything under the plugin folder:

- `on-artifact-written.test.cjs`, `on-session-start.test.cjs`, `plugin-contract.test.cjs`
- Paths point to `plugins/orbitant-product/...`; assertions use the `.cjs` scripts and the new
  skill names.
- The root `test` script becomes
  `node --import tsx --test test/*.test.ts test/orbitant-product/*.test.cjs`.

New or changed assertions:

- `on-artifact-written`: with `store.json` `{ "store": "none" }` it writes `local` and outputs
  no context; with `notion` or no file it writes `pending` as today.
- Contract: the plugin has no `.mcp.json`.
- Contract: no file outside `skills/sync-deliverable/references/stores/` mentions Notion, except
  the plugin README.
- Contract: `skills/sync-deliverable/SKILL.md` names the five parts of the store contract.
- Contract: no file mentions an unprefixed skill name
  (`(^|[^-])(problem-interrogator|sync-deliverable|discovery-retro)` in skill-name position).
- The POC assertion that the plugin bundles Notion's MCP server is removed.

## Registration

- `plugins/orbitant-product/.claude-plugin/plugin.json`: `name: orbitant-product`,
  `version: 0.3.0`, `author: { "name": "Orbitant" }`, `license: MIT`, an explicit `skills`
  array, and a description without Notion, under 500 characters.
- Each SKILL.md frontmatter gets `version`, `license` and `metadata: { author, tags }`, per
  `.github/schemas/skill-frontmatter.schema.json`.
- `.claude-plugin/marketplace.json`: new entry, `source: ./plugins/orbitant-product`, same
  version.
- `scripts/lib/meta-package.json`: MINOR bump.
- Root `README.md`: a row in the plugins table and the install line.
- `.claude/CLAUDE.md`: the repo tree and *Current State*.

Gate before the PR: `npm run check` and `npm run website:parse` green, and the internal
`skill-reviewer` skill run on the three SKILL.md files.

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

- **Claude Code, files only:** install from the marketplace, run
  `/orbitant-product:discover`, answer "solo ficheros". The run completes, `store.json` says
  `none`, `sync.json` items are `local`, and the next session resurfaces nothing.
- **Claude Code, Notion:** a full run that creates or updates the three records in
  *Descubrimiento de producto*, written as the PM.
- **Compatibility:** a folder with only `notion.json` syncs to the same database without
  asking anything.
- **Cowork, Notion not connected:** the login message shows the real connector menu labels.
- **Cowork hooks:** `node` is available, `PostToolUse` fires on writing `PROBLEM_BRIEF.md`, and
  `~/.discovery/` survives across sessions. If it doesn't, record it as a known limit.

## Risks

- **The new persistence is not measured.** The POC evals cover the interrogator and the
  judges, not the sync. The files-only mode and the store contract enter with unit and
  contract tests and the end-to-end run only.
- **Silent rename misses** in the hooks' injected text. Mitigated by the contract test.
- **Cowork hooks are unverified.** The guaranteed retro and the cross-session retry depend on
  them; the discovery itself does not.
- **npm coupling.** Once the vertical exists, every meta release depends on
  `@orbitant/brain-product` being published.
- **Public repo.** Runtime files hold no Notion IDs, emails or internal URLs, but they do name
  the *Descubrimiento de producto* database, its properties and the `<Client> TECH` page
  convention. Accepted; no client data or real cases go into examples.

## Open items

- **Who owns `@orbitant` on npm and uploads the zip.** An org admin, by name. Blocks the
  release only.
- **Brain consumers.** The employents platform excludes skills written for a person working in
  Claude Code until orbitant-os#63 decides how they are marked. This vertical's skills are all
  of that kind; decide whether they carry that mark before any employent reads the package.
- **Exact wording of the preflight question and the login messages**, checked against real
  menu labels in the end-to-end run.
