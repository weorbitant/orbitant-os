---
name: report
description: |
  Generate business reports from YAML definitions. Aggregates data from multiple sources
  (Notion, Factorial, HubSpot, Airtable) into structured weekly/monthly reports.
  Usage: /report weekly, /report monthly, /report list, /report <custom-name>
  Supports --output, --path, --schedule, --unschedule flags.
---

## Overview

Generate structured business reports by loading a YAML report definition, fetching data from configured sources in parallel, and assembling the result as markdown. Supports weekly, monthly, and custom report cadences with output to terminal, file, or Notion.

## Step 0 — Load Configuration

1. Read `business-databases.yaml` using dual-path lookup:
   - First try `./business-databases.yaml` (relative to plugin root)
   - Then try `~/.claude/business-databases.yaml`
2. If neither exists, display this message and stop:
   ```
   ⚠️ business-databases.yaml not found.
   Copy the template and add your config:
     cp references/databases.example.yaml business-databases.yaml
   See references/setup-guide.md for details.
   ```
3. Extract the `sources` section. A source is "configured" if it has an uncommented entry with the required fields (e.g., `sources.factorial` with `auth_env_var`). Commented-out or absent entries = unconfigured.
4. Extract the `databases` section for Notion database IDs.
5. Extract the `relations` section if present.

## Invocation

```
/report <name> [--output <destination>] [--path <file_path>] [--schedule <cron_expr>] [--unschedule]
/report list
```

- `/report weekly` — generate the weekly business report
- `/report monthly` — generate the monthly business report
- `/report <custom-name>` — generate a report by custom definition name
- `/report list` — list all available report definitions
- `/report weekly --output file --path ./report.md` — override output destination
- `/report weekly --schedule "0 9 * * 1"` — register a cron schedule for the report
- `/report weekly --unschedule` — remove an existing cron schedule

## Execution — List Mode

When the name argument is `list`:

### Step 1 — Scan for Definitions

Search for report definition YAML files in this order:

1. Conversation context (Cowork) — check if any report definitions were pasted
2. `~/.claude/reports/*.yaml` — user-level custom definitions
3. `plugins/orbitant-business/reports/*.yaml` — plugin-bundled definitions

### Step 2 — Display Available Reports

For each YAML file found, read the `name` and `cadence` fields. Display:

```
REPORT — LIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Source | Name | Cadence |
|--------|------|---------|
| plugin | Weekly Business Report | weekly |
| plugin | Monthly Business Report | monthly |
| user   | Custom Pipeline Review  | weekly |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Usage: /report <name>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If no definitions found: `No report definitions found. Add YAML files to ~/.claude/reports/ or plugins/orbitant-business/reports/`

## Execution — Generate Mode

### Step 1 — Resolve Definition

Map the name argument to a filename:
- `weekly` → `weekly-business.yaml`
- `monthly` → `monthly-business.yaml`
- Anything else → `<name>.yaml`

Search for the file in this order:
1. Conversation context (Cowork) — check if the definition was pasted
2. `~/.claude/reports/<filename>` — user-level
3. `plugins/orbitant-business/reports/<filename>` — plugin-bundled

If not found, show error and stop:
```
⚠️ Report definition "<name>" not found.
Searched:
  - ~/.claude/reports/<filename>
  - plugins/orbitant-business/reports/<filename>
Run /report list to see available definitions.
```

### Step 2 — Validate Definition

The definition YAML must contain these required fields:

- `name` (string) — report display name
- `cadence` (string) — `weekly`, `monthly`, or `custom`
- `version` (string) — must be `"1.0"`
- `output` (object):
  - `format` — `markdown` or `notion`
  - `destination` — `terminal`, `file`, or `notion`
  - `file_path` — required if destination is `file`
  - `notion_database_id` — required if destination is `notion`
- `sections` (array) — at least one section, each with:
  - `id` (string, unique across all sections)
  - `title` (string)
  - `type` (string, must be a known type — see Step 4)
  - `source` (string) — must be compatible with the type

Validation rules:
- `version` must be `"1.0"`
- `output.format` must be `markdown` or `notion`
- `output.destination` must be `terminal`, `file`, or `notion`
- If `destination` is `file`, `file_path` must be present
- If `destination` is `notion`, `notion_database_id` must be present
- `type` must be one of the known types (see Step 4)
- `source` + `type` must be a compatible pair (e.g., `hr-snapshot` requires `factorial`)
- All section `id` values must be unique

On validation failure, show ALL errors and stop:
```
⚠️ Report definition "<name>" has validation errors:
  - version must be "1.0" (got "2.0")
  - sections[2].id "overview" is duplicated
  - sections[3].type "unknown-type" is not a known section type
Fix the definition and try again.
```

### Step 3 — Handle Scheduling

**If `--schedule <cron_expr>` is provided:**

1. Validate the cron expression format (5 fields: minute hour day month weekday)
2. Check destination compatibility: if destination is `terminal` and no `file_path` is set (neither in definition nor via `--path`), error:
   ```
   ⚠️ Cannot schedule a report with terminal output and no file path.
   Add --path ./reports/weekly.md or set file_path in the definition.
   ```
3. Register the schedule via CronCreate with the report command as the action
4. Confirm:
   ```
   ✅ Scheduled: "/report <name>" — <cron_expr> (<human-readable description>)
   ```
5. Stop (do not generate the report)

**If `--unschedule` is provided:**

1. List existing crons via CronList
2. Find the cron matching this report name
3. Remove it via CronDelete
4. Confirm:
   ```
   ✅ Unscheduled: "/report <name>"
   ```
5. If no matching cron found:
   ```
   ⚠️ No scheduled cron found for "/report <name>"
   ```
6. Stop (do not generate the report)

### Step 4 — Fetch Data

Apply any CLI overrides:
- `--output <destination>` overrides `output.destination`
- `--path <file_path>` overrides `output.file_path`

Note: if destination is `terminal`, ignore `file_path` — it exists only as a cron fallback.

Process each section based on its `type`. Known section types and their fetch behavior:

#### `stub`

No fetch needed. Render a placeholder section. The section definition should include a `note` field.

#### `executive-summary`

No fetch needed at this stage. This section is generated AFTER all other sections are assembled (Step 5).

#### `notes-and-actions`

No fetch needed. Render an empty placeholder for manual notes.

#### `kpi-table`

The section definition includes a `kpis` array. Each KPI entry has:
- `label` — display name
- `source` — data source name (e.g., `factorial`, `hubspot`, `airtable`)
- `metric` — the metric to fetch
- `compare` — optional comparison mode (`wow` = week-over-week, `mom` = month-over-month)

For each KPI:
1. Check if the KPI's `source` is configured in `business-databases.yaml`
2. If unconfigured: mark as `⬜ Not connected` — do not fetch
3. If configured: the data will be fetched by the appropriate fetcher (grouped with other sections of the same source)

#### `notion-management`

Query Notion directly:
1. Read the database ID from `databases.<section.database>` in config
2. Query using `notion-search` or `notion-fetch` with `collection://<data_source_id>`
3. Filter by `<filter_property> = false` (from the section definition or database config)
4. Return the matching records

#### `pipeline-detail` / `pipeline-movement` / `weekly-breakdown`

Source: HubSpot.

1. Check if `sources.hubspot` is configured. If not: render as unconfigured stub.
2. Dispatch the `hubspot-fetcher` agent (from `agents/hubspot-fetcher.md`) with:
   - The section type and any parameters from the section definition
   - Config values from `sources.hubspot`
3. Parse the structured response between `HUBSPOT_DATA_START` and `HUBSPOT_DATA_END` markers.

#### `hr-snapshot` / `time-off-summary`

Source: Factorial.

1. Check if `sources.factorial` is configured. If not: render as unconfigured stub.
2. Dispatch the `factorial-fetcher` agent (from `agents/factorial-fetcher.md`) with:
   - The section type and any parameters from the section definition
   - Config values: `auth_env_var`, `base_url`, `api_version`
3. Parse the structured response between `FACTORIAL_DATA_START` and `FACTORIAL_DATA_END` markers.

#### `recruitment-pipeline` / `recruitment-detail`

Source: Airtable.

1. Check if `sources.airtable` is configured. If not: render as unconfigured stub.
2. Dispatch the `airtable-fetcher` agent (from `agents/airtable-fetcher.md`) with:
   - The section type and any parameters from the section definition
   - Config values from `sources.airtable`
3. Parse the structured response between `AIRTABLE_DATA_START` and `AIRTABLE_DATA_END` markers.

**Parallel dispatch:** When sections require different sources, dispatch fetcher agents in parallel. Group sections by source so each agent is dispatched at most once with all required data points.

**Error handling:** If a fetcher fails, retry ONCE. If it fails again, mark the section with ⚠️ and continue with remaining sections.

### Step 5 — Assemble Report

Build the full report markdown in this order:

#### Report Header

```markdown
---
title: "{report_name}"
date: "{YYYY-MM-DD}"
generated_by: "Orbitant OS"
---

# {report_name}

> Generated by Orbitant OS — {DD MMMM YYYY}
```

#### Section Rendering

Render each section in the order defined in the YAML. Rendering rules by type:

**`kpi-table`:**

If `compare` is `mom` (month-over-month), use "vs. Last Month" as the trend column header. Otherwise use "Trend".

```markdown
## {section.title}

| KPI | Value | {Trend column} | Status |
|-----|-------|-------|--------|
| {label} | {value} | {trend_indicator} | {status_emoji} |
```

Status indicators:
- 🟢 On track / positive
- 🟡 Needs attention / flat
- 🔴 Off track / negative
- ⬜ Not connected (source unconfigured)

For unconfigured KPIs:
```
| {label} | — | — | ⬜ |
```

**`pipeline-detail`:**

```markdown
## {section.title}

| Deal | Stage | Value | Owner | Next Step |
|------|-------|-------|-------|-----------|
| {deal_name} | {stage} | {value} | {owner} | {next_step} |
```

**`pipeline-movement`:**

```markdown
## {section.title}

| Movement | Count | Value |
|----------|-------|-------|
| New this period | {n} | {value} |
| Advanced | {n} | {value} |
| Won | {n} | {value} |
| Lost | {n} | {value} |
```

**`weekly-breakdown`:**

```markdown
## {section.title}

| Week | Metric | Value |
|------|--------|-------|
| {week_label} | {metric} | {value} |
```

**`hr-snapshot`:**

```markdown
## {section.title}

| Metric | Value |
|--------|-------|
| Active Headcount | {n} |
| New Joiners (this period) | {n} |
| Departures (this period) | {n} |
| On Holiday | {n} |
| On Sick Leave | {n} |
```

**`time-off-summary`:**

```markdown
## {section.title}

| Employee | Type | From | To |
|----------|------|------|----|
| {name} | {leave_type} | {start} | {end} |
```

**`notion-management`:**

```markdown
## {section.title}

| # | Item | Department | Lead | Status |
|---|------|------------|------|--------|
| 1 | {title} | {dept} | {lead} | {status} |
```

**`recruitment-pipeline`:**

```markdown
## {section.title}

| Position | Stage | Candidates | Owner |
|----------|-------|------------|-------|
| {position} | {stage} | {count} | {owner} |
```

**`recruitment-detail`:**

```markdown
## {section.title}

| Candidate | Position | Stage | Rating | Next Step |
|-----------|----------|-------|--------|-----------|
| {name} | {position} | {stage} | {rating} | {next} |
```

**`stub`:**

```markdown
## {section.title}

> _Not connected_ — {section.note}
```

**`executive-summary`:**

Generate an AI summary based on ALL previously assembled section data. Highlight:
- Key metrics and their trends
- Notable items requiring attention
- Cross-source insights (e.g., headcount changes + pipeline implications)

```markdown
## {section.title}

{AI-generated summary paragraph}
```

**`notes-and-actions`:**

```markdown
## {section.title}

_No notes yet — add items during review._

- [ ]
- [ ]
- [ ]
```

#### Report Footer

```markdown
---

_Report generated on {DD-MM-YYYY} at {HH:MM} by Orbitant OS_
```

### Step 6 — Write Output

Based on the resolved `output.destination`:

**`terminal`:**
Render the full markdown report directly in the conversation.

**`file`:**
1. Interpolate path variables in `file_path`:
   - `{DATE}` → `YYYY-MM-DD`
   - `{MONTH_YEAR}` → `MMMM-YYYY` (e.g., `March-2026`)
   - `{WEEK}` → ISO week number (e.g., `11`)
   - `{YEAR}` → `YYYY`
2. Create parent directories if they don't exist
3. Write the report file

**`notion`:**
Create a new page in the Notion database specified by `notion_database_id` using `notion-create-pages`.

### Step 7 — Confirm

```
REPORT — DD-MM-YYYY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated: "{report_name}"
Sections:  {total} ({live} live, {stub} stub, {error} failed)
Output:    {destination}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Where:
- `{total}` = total number of sections
- `{live}` = sections that fetched data successfully
- `{stub}` = sections rendered as stubs (unconfigured source or stub type)
- `{error}` = sections that failed after retry
- `{destination}` = `terminal`, `file: <path>`, or `notion: <page_url>`

## Cowork Adaptation

When running inside a Cowork session (no local filesystem access):

- **Config**: If `business-databases.yaml` content was pasted into conversation context, parse and use it. Otherwise, ask the user for the config.
- **Definition**: If a report definition was pasted into conversation context, use it. Otherwise, only plugin-bundled definitions accessible via Read are available.
- **Factorial sections**: NOT available in Cowork — the factorial-fetcher requires Bash (curl). Render as:
  ```
  ⚠️ Factorial data requires Claude Code (desktop). Section rendered as stub.
  ```
- **File output**: Falls back to `terminal` in Cowork since filesystem writes are not available. Note:
  ```
  ⚠️ File output not available in Cowork. Rendering to terminal instead.
  ```
- **Cron scheduling**: NOT available in Cowork. Display:
  ```
  ⚠️ Cron scheduling requires Claude Code (desktop).
  ```

## Resilience

- Each section is independent — a failure in one section does NOT block other sections.
- Failed sections render with ⚠️ and an error note instead of data.
- The report is ALWAYS generated, even if all data sections fail (stubs + error markers).
- Fetcher agents get ONE retry on failure. After the second failure, move on.
- If the definition file is valid but all sources are unconfigured, generate the report with all stub sections and note: "All data sources are unconfigured. Run /preflight to check connectivity."

## Anti-patterns

- Do NOT hardcode source credentials, database IDs, or API URLs — always read from config.
- Do NOT skip definition validation — always validate before fetching.
- Do NOT skip validation even if the definition "looks fine" — run all checks.
- Do NOT retry a failed fetcher more than once.
- Do NOT cache fetched data between report runs — always fetch fresh.
- Do NOT send reports externally (email, Slack) without explicit user confirmation.
- Do NOT modify source data — report generation is strictly read-only.
