# Business Management

Business management commands and data queries — Notion-backed management plus Factorial HR queries.

## Overview

This plugin provides slash commands to create and query business execution items in Notion, plus natural-language queries against external data sources like Factorial HR. Track challenges (blockers and risks), highlights (wins and milestones), opportunities (ideas to explore), and todos (actionable tasks with deadlines). Query your HR data (headcount, holidays, sick leave) directly from conversation.

## Quick Start

```bash
# 1. Install the plugin
/plugin install orbitant-business

# 2. Copy the config template
cp plugins/orbitant-business/references/databases.example.yaml plugins/orbitant-business/business-databases.yaml

# 3. Add your Notion database IDs to the config
# Open each database in Notion → "..." → "Copy link" → extract the UUID

# 4. (Optional) Add Factorial API key for HR queries
export FACTORIAL_API_KEY="your-key-here"  # in ~/.zshrc

# 5. Start using commands
/business:challenge "We need to reduce onboarding time"
/business:todo "Prepare board deck" due Friday
/business:query "Who's on holiday this week?"
/business:preflight  # check all data sources
```

## Available Commands

### Management Commands

| Command | Description |
|---------|-------------|
| `/business:challenge` | Create or list challenges (blockers, risks) |
| `/business:highlight` | Create or list highlights (wins, milestones) |
| `/business:opportunity` | Create or list opportunities (ideas, leads) |
| `/business:todo` | Create or list todos (tasks with deadlines) |
| `/business:preflight` | Health check for all data sources |

Each management command supports two modes:
- **Create**: `/business:challenge "text"` — creates a new entry
- **Query**: `/business:challenge list` — lists active entries

### Data Commands

| Command | Description |
|---------|-------------|
| `/business:query` | Answer natural-language questions about business data |

Usage: `/business:query "How many employees do we have?"` — routes to the correct data source and answers with specific numbers.

### Report Commands

| Command | Description |
|---------|-------------|
| `/business:report` | Generate a business report from a YAML definition |
| `/business:report list` | List available report definitions |

## Reports

### Quick Start

```bash
/business:report weekly          # Generate the weekly KPI snapshot
/business:report monthly         # Generate the monthly business report
/business:report list            # List all available report definitions
```

### Default Reports

| Report | Sections | Notes |
|--------|----------|-------|
| Weekly KPI Snapshot | Headcount, Holidays this week, Open challenges, Active todos | *Headcount and Holidays require Factorial API |
| Monthly Business Report | Revenue summary*, Pipeline overview*, Headcount trends, Recruitment status*, Highlights, Challenges, Opportunities | *Revenue/Pipeline require HubSpot MCP; Recruitment requires Airtable MCP |

### Output Destinations

- **Terminal** — default; report renders inline in the conversation.
- **File** — use `--output <path>` to write the report to a file (Markdown).
- **Cron** — use `--schedule <cron-expression>` to schedule recurring generation (requires cron support).

### Custom Reports

1. Create a YAML definition at `~/.claude/reports/` (e.g., `~/.claude/reports/my-report.yaml`).
2. Define the sections you want (data sources, queries, formatting).
3. Run `/business:report my-report` to generate it.
4. See `references/report-definitions.md` for the full schema and examples.

### Report Definition Discovery

Report definitions are resolved in this order:

1. **Cowork context** — YAML pasted as an artifact in the conversation
2. **Local** — `~/.claude/reports/<name>.yaml`
3. **Plugin default** — `plugins/orbitant-business/references/reports/<name>.yaml`

### Cowork Compatibility

- **Factorial unavailable** — Factorial queries use Bash (curl), which Cowork does not support. Sections that depend on Factorial will be skipped.
- **File output defaults to terminal** — `--output` writes are not available in Cowork; output renders inline instead.
- **No cron** — `--schedule` is not supported in Cowork sessions.
- **Paste YAML as artifact** — if report definitions are not on the filesystem, paste the YAML content into the conversation and the report command will parse it from context.

## Configuration

| File | Purpose | Template |
|------|---------|----------|
| `business-databases.yaml` | Notion database IDs and schema | `references/databases.example.yaml` |

The config file is looked up in this order:
1. `./business-databases.yaml` (plugin root — per-project)
2. `~/.claude/business-databases.yaml` (global fallback)

See `references/setup-guide.md` for detailed setup instructions.

## MCP Dependencies

| Service | Required? | Used by |
|---------|-----------|---------|
| Notion | Core | Management commands |
| Factorial API | Optional | `/query` for HR data (via curl, not MCP) |
| HubSpot MCP | Optional | `/report` for commercial data |
| Airtable MCP | Optional | `/report` for recruitment data |

## Notion Database Schemas

Each database needs at minimum a title column. Optional columns are used when present.

| Database | Required Column | Type | Optional Columns |
|----------|----------------|------|------------------|
| Challenges | Challenge | Title | Departments, Lead, Outcome, Solved |
| Headlines | Headline | Title | Department, Author |
| Opportunities | Opportunity | Title | Department, Author, Embraced |
| TODOs | Name | Title | Owner, Deadline, Completed |

## Cowork Compatibility

Management commands work in Cowork sessions as long as the Notion MCP server is available. If `business-databases.yaml` is not on the filesystem, paste its content into the conversation and commands will parse it from context.

**Note:** Factorial queries (`/query` for HR data) are NOT available in Cowork because the factorial-fetcher uses curl (Bash), which Cowork does not support.

## Links

- [Setup Guide](references/setup-guide.md)
- [MCP Business Reference](references/mcp-business-reference.md)
- [Plugin Marketplace](../../README.md)
- [License](../../LICENSE)
