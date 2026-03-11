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
| source | string | yes | Data source: `notion`, `factorial`, `manual`, or `none` |
| metrics | list | no | Specific metrics to include (type-dependent) |
| kpis | list | no | KPI definitions for `kpi-table` sections |
| note | string | no | Static note or instructions rendered in the section |
| compare | string | no | Comparison period: `previous-week`, `previous-month`, etc. |
| databases | object | no | Map of database roles to Notion database IDs |

## Section Types

| Type | Source | Description |
|------|--------|-------------|
| kpi-table | notion / factorial | Table of KPIs with current value, target, and trend |
| pipeline-detail | notion | Detailed view of items in a pipeline database |
| pipeline-movement | notion | Items that entered, exited, or changed stage in the period |
| weekly-breakdown | factorial | Day-by-day breakdown of hours, leave, or activity |
| hr-snapshot | factorial | Headcount, department distribution, and contract types |
| time-off-summary | factorial | Leave balances, upcoming time off, and usage trends |
| recruitment-pipeline | notion | Open roles by stage with counts and aging |
| recruitment-detail | notion | Per-role detail: candidates, interviews, offers |
| notion-management | notion | Pulls items from a Notion database (challenges, todos, etc.) |
| executive-summary | manual | Free-text summary written by the report author |
| notes-and-actions | manual | Action items and follow-ups from the reporting period |
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

**Note:** Sections with `source: factorial` are NOT available in Cowork because the factorial-fetcher uses curl (Bash), which Cowork does not support. Notion-backed sections work normally via Notion MCP.
