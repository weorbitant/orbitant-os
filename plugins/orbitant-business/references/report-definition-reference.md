# Report Definition Reference

Custom report definitions let you build tailored reports for any team or cadence using the `/report` command.

## Quick Start

1. Create a YAML file with your report definition (see format below)
2. Save it to `~/.claude/reports/` or as a Cowork artifact
3. Run `/report <name>` to generate the report
4. Verify discovery with `/report list` — it shows all available definitions and their sources

## Definition Format

### Minimal Example

```yaml
name: engineering-weekly
cadence: weekly
version: "1.0"
output:
  format: markdown
  destination: terminal
sections:
  - id: challenges
    title: "Open Challenges"
    type: notion-management
    source: notion
    databases:
      challenges: "your-notion-database-id"
```

### Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | yes | Unique identifier for the report (kebab-case) |
| cadence | string | yes | `weekly`, `monthly`, or `custom` |
| version | string | yes | Schema version — use `"1.0"` |
| output | object | yes | Controls format and destination (see below) |
| sections | list | yes | Ordered list of report sections (see below) |

### Output Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| format | string | yes | `markdown` or `notion` |
| destination | string | yes | `terminal`, `file`, or `notion` |
| file_path | string | no | Path for `file` destination. Supports variables: `{DATE}`, `{MONTH_YEAR}`, `{WEEK}`, `{YEAR}` |
| notion_database_id | string | no | Target database ID for `notion` destination |

File path example:

```yaml
output:
  format: markdown
  destination: file
  file_path: "~/reports/{YEAR}/engineering-weekly-{DATE}.md"
```

### Section Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique section identifier within the report |
| title | string | yes | Display heading for the section |
| type | string | yes | Section type (see Section Types below) |
| source | string | yes | Data source: `notion`, `factorial`, `hubspot`, `airtable`, `sherpa`, `manual`, or `none` |
| metrics | list | no | Specific metrics to include (type-dependent) |
| kpis | list | no | KPI definitions for `kpi-table` sections (see KPI Format below) |
| note | string | no | Static note or instructions rendered in the section |
| compare | string | no | Comparison mode. Currently supported: `mom` (month-over-month). Adds a prior-period column to the rendered table and delta lines below. |
| databases | list | no | For `notion-management` sections: list of database names defined in config (e.g. `[challenges, headlines, opportunities, todos]`) |
| filter_active_only | bool | no | For `notion-management` sections: if `true`, also apply the database's `filter_property = false` filter on top of the period filter. Default `false` — include both open and resolved items created during the period. |

### KPI Format

`kpi-table` sections use a `kpis:` list. Each entry:

```yaml
kpis:
  - name: "EBITDA"          # display label in the table
    source: sherpa          # data source — pairs with a fetcher
    query: ebitda           # query name understood by the fetcher
```

Per-source query vocabularies are documented in each fetcher's reference. For `source: sherpa`, supported queries are: `cash_balance`, `cash_including_credit`, `monthly_burn`, `runway_months`, `revenue_invoiced`, `ebitda`, `ebitda_margin`, `profit_margin`, `net_income`. Unsupported queries (`accounts_receivable`, `accounts_payable`, `collection_effectiveness` for Sherpa) render as `⬜ Not supported`.

When the `kpi-table` declares `compare: mom`, each sherpa-backed KPI gets a prior-month value; snapshot KPIs (cash, runway) render `—` in the compare column with a footnote explaining why.

## Section Types

| Type | Source | Description |
|------|--------|-------------|
| kpi-table | mixed (per-KPI source) | Table of KPIs. Each row declares its own source and query. |
| pipeline-detail | hubspot | Commercial pipeline with deal-level detail |
| pipeline-movement | hubspot | Deals that entered, exited, or changed stage in the period |
| weekly-breakdown | hubspot | Week-by-week activity breakdown |
| hr-snapshot | factorial | Headcount, joiners, departures, status |
| time-off-summary | factorial | Holiday/sick/parental leave taken in the period |
| recruitment-pipeline | airtable | Open roles and candidate counts per stage |
| recruitment-detail | airtable | Per-candidate detail: stage, rating, next step |
| notion-management | notion | Items created in the period across one or more Notion databases. Items from earlier periods are hidden. |
| cash-summary | sherpa | Cash balance, trailing-3-month burn, runway, and per-account breakdown |
| pnl-summary | sherpa | P&L for the target month (requires `cadence: monthly`): revenue, direct costs, gross margin, structural costs, EBITDA, net income |
| executive-summary | manual | AI-generated summary based on all other section data |
| notes-and-actions | manual | Blank checklist for manual notes and follow-ups |
| stub | none | Placeholder section for future data sources |

## Definition Discovery Order

The `/report` command searches for definitions in this order:

1. **Cowork artifact** — YAML pasted into the conversation context
2. **`~/.claude/reports/`** — global report definitions directory
3. **Plugin `reports/`** — built-in definitions shipped with the plugin

The first match by name wins. This means you can override a built-in report by placing a file with the same name in `~/.claude/reports/`.

## Examples

### Department-Specific Report

An Engineering Weekly that pulls challenges and todos from Notion and shows the recruitment pipeline:

```yaml
name: engineering-weekly
cadence: weekly
version: "1.0"
output:
  format: markdown
  destination: file
  file_path: "~/reports/engineering/weekly-{DATE}.md"
sections:
  - id: challenges
    title: "Engineering Challenges"
    type: notion-management
    source: notion
    databases:
      challenges: "abc123-notion-db-id"

  - id: todos
    title: "Action Items"
    type: notion-management
    source: notion
    databases:
      todos: "def456-notion-db-id"

  - id: hiring
    title: "Recruitment Pipeline"
    type: recruitment-pipeline
    source: notion
    databases:
      recruitment: "ghi789-notion-db-id"

  - id: notes
    title: "Notes & Follow-ups"
    type: notes-and-actions
    source: manual
```

### Stub-Only Report

A Finance Monthly that reserves sections for data sources not yet connected:

```yaml
name: finance-monthly
cadence: monthly
version: "1.0"
output:
  format: markdown
  destination: terminal
sections:
  - id: revenue
    title: "Revenue Summary"
    type: stub
    source: none
    note: "Pending Stripe integration"

  - id: expenses
    title: "Expense Breakdown"
    type: stub
    source: none
    note: "Pending QuickBooks integration"

  - id: runway
    title: "Cash Runway"
    type: stub
    source: none
    note: "Pending finance data source"

  - id: actions
    title: "Finance Actions"
    type: notes-and-actions
    source: manual
```

## Period Resolution

Every report run resolves to a concrete target period before any data is fetched. All fetchers and Notion queries use this window, so data across sections stays consistent.

**Default** (when `--period` is not provided):
- `cadence: monthly` → the **previous complete calendar month** (e.g. running on 2026-04-15 produces a March 2026 report). Accounting teams expect closed periods, so "current month in progress" is never the default.
- `cadence: weekly` → the **previous complete ISO week**.
- `cadence: custom` → the definition must specify a rule, or `--period` is required.

**Override with `--period`:**

```bash
/report monthly --period 2026-03                       # specific month
/report weekly  --period 2026-W11                      # ISO week
/report <name>  --period 2026-01-01..2026-03-31        # ad-hoc range
```

The resolved period is echoed in the confirmation banner after the run.

## Cron Scheduling

Schedule a report to run automatically:

```bash
/report engineering-weekly --schedule "0 9 * * 1"    # Every Monday at 9 AM
```

Remove a schedule:

```bash
/report engineering-weekly --unschedule
```

**Note:** Cron-scheduled reports require `destination: file` or `destination: notion`. The `terminal` destination is incompatible with cron because there is no active session to display output.

## Cowork Usage

To use custom reports in a Cowork session:

1. Create a Project in Cowork
2. Add your report YAML as an artifact in the project
3. Run `/report <name>` — the command detects definitions from conversation context

**Availability by source:**

| Source | Cowork | Notes |
|--------|:------:|-------|
| Notion | ✅ | MCP-based |
| Sherpa | ✅ | MCP-based (OAuth via connector) |
| HubSpot | ✅ | MCP-based |
| Airtable | ✅ | MCP-based |
| Factorial | ❌ | Uses curl via Bash — not available in Cowork |
