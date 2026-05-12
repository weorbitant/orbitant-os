# Operations

Operations toolkit combining daily chief-of-staff workflows with Notion-backed business management and external data queries. Replaces the previous `orbitant-chief-of-staff` and `orbitant-business` plugins.

## Overview

This plugin gives Claude two related capability surfaces:

- **Chief-of-staff** — proactive support for a B2B services CEO/founder: daily briefings, inbox triage, meeting prep, relationship tracking, and strategic alignment against quarterly rocks. Connects to Gmail, Calendar, Slack, and Asana.
- **Business management** — slash commands to create and query challenges, highlights, opportunities, and todos in Notion, plus natural-language queries against external data (Factorial HR, HubSpot CRM, Airtable recruitment, Sherpa financial). Includes a report generator for weekly/monthly business snapshots.

Configure either surface independently — the plugin adapts to whatever is available.

## Quick Start

```bash
# 1. Install
/plugin install orbitant-operations

# 2. Verify install
/orbitant-operations:preflight

# 3. (Chief-of-staff) Copy config templates
cp plugins/orbitant-operations/references/rocks.example.yaml ./rocks.yaml
cp plugins/orbitant-operations/references/voice.example.md ./voice.md
cp plugins/orbitant-operations/references/constraints.example.yaml ./constraints.yaml
mkdir -p ./contacts

# 4. (Business) Copy databases template, then add your real Notion IDs
cp plugins/orbitant-operations/references/databases.example.yaml ./business-databases.yaml

# 5. (Optional) Add Factorial API key for HR queries
export FACTORIAL_API_KEY="your-key-here"  # in ~/.zshrc

# 6. Start using
/orbitant-operations:today
/orbitant-operations:challenge "We need to reduce onboarding time"
/orbitant-operations:query "Who's on holiday this week?"
```

See [`references/setup-guide.md`](references/setup-guide.md) for the full walkthrough.

## Available Commands

### Chief-of-staff

| Command | Description |
|---------|-------------|
| `/orbitant-operations:preflight` | Operations readiness check (MCPs, configs, data sources) |
| `/orbitant-operations:status` | Operational health dashboard |
| `/orbitant-operations:today` | Morning briefing |
| `/orbitant-operations:triage` | Inbox management |
| `/orbitant-operations:week` | Weekly planning |
| `/orbitant-operations:prep` | Meeting preparation |
| `/orbitant-operations:crm` | Contact management |

### Business management

| Command | Description |
|---------|-------------|
| `/orbitant-operations:challenge` | Create or list challenges (blockers, risks) |
| `/orbitant-operations:highlight` | Create or list highlights (wins, milestones) |
| `/orbitant-operations:opportunity` | Create or list opportunities (ideas, leads) |
| `/orbitant-operations:todo` | Create or list todos (tasks with deadlines) |

Each management command supports two modes:

- **Create**: `/orbitant-operations:challenge "text"` — creates a new entry
- **Query**: `/orbitant-operations:challenge list` — lists active entries

### Data and reporting

| Command | Description |
|---------|-------------|
| `/orbitant-operations:query` | Answer natural-language questions about business data |
| `/orbitant-operations:report` | Generate a business report from a YAML definition |
| `/orbitant-operations:report list` | List available report definitions |

## Skills

| Skill | Type | Description |
|-------|------|-------------|
| `orbitant-graceful-degradation` | Auto-triggered | Checks MCP and config availability before operations |
| `orbitant-goal-alignment` | Auto-triggered | Scores and prioritizes work against quarterly rocks |
| `orbitant-voice-drafting` | Auto-triggered | Drafts in your voice using style references |

## Reports

```bash
/orbitant-operations:report weekly          # weekly KPI snapshot
/orbitant-operations:report monthly         # monthly business report
/orbitant-operations:report list            # list available report definitions
```

### Default Reports

| Report | Sections | Notes |
|--------|----------|-------|
| Weekly KPI Snapshot | Headcount, Holidays this week, Cash & Runway*, Open challenges, Active todos | *Headcount requires Factorial API; Cash & Runway require Sherpa MCP |
| Monthly Business Report | Revenue / EBITDA / Margin*, Pipeline overview†, Headcount trends, Recruitment status‡, P&L summary*, Cash & Runway*, Highlights, Challenges, Opportunities | *Sherpa MCP (financial); †HubSpot MCP; ‡Airtable MCP |

### Output Destinations

- **Terminal** — default; report renders inline in the conversation.
- **File** — use `--output <path>` to write the report to a file (Markdown).
- **Cron** — use `--schedule <cron-expression>` to schedule recurring generation (requires cron support).

### Period Selection

Every report covers a specific time window. By default, reports run against the **previous complete period** — never the one in progress, because closed periods are what accounting, ops, and reviews actually care about.

| Cadence | Default period | Example (running on 2026-04-15) |
|---------|----------------|---------------------------------|
| `monthly` | previous calendar month | March 2026 |
| `weekly` | previous ISO week | 2026-W15 |
| `custom` | defined by the report, or requires `--period` | — |

**Override with `--period`:**

```bash
/orbitant-operations:report monthly --period 2026-03
/orbitant-operations:report weekly --period 2026-W11
/orbitant-operations:report <name> --period 2026-01-01..2026-03-31
```

**What the period controls:**

- **Sherpa (Financial):** P&L reads the target month; burn is a trailing-3-month average ending at the period boundary; cash is always a *current* snapshot (Sherpa has no historical cash API) and the report shows a caveat when the period isn't "now".
- **Notion (Management Overview):** challenges, highlights, opportunities, and todos are filtered by `created_time` within the period. Items created in earlier periods are hidden — even if still open — because the report is a snapshot of "what moved this period", not a running backlog.
- **HubSpot / Airtable / Factorial:** each fetcher scopes its queries to the same window.

The resolved period is echoed in the confirmation banner at the end of every run.

### Custom Reports

1. Create a YAML definition at `~/.claude/reports/` (e.g., `~/.claude/reports/my-report.yaml`).
2. Define the sections you want (data sources, queries, formatting).
3. Run `/orbitant-operations:report my-report` to generate it.
4. See `references/report-definition-reference.md` for the full schema and examples.

### Report Definition Discovery

Report definitions are resolved in this order:

1. **Cowork context** — YAML pasted as an artifact in the conversation
2. **Local** — `~/.claude/reports/<name>.yaml`
3. **Plugin default** — `plugins/orbitant-operations/references/reports/<name>.yaml`

## Configuration

| File | Surface | Purpose | Template |
|------|---------|---------|----------|
| `rocks.yaml` | Chief-of-staff | Quarterly goals and weights | `references/rocks.example.yaml` |
| `voice.md` | Chief-of-staff | Writing style and tone references | `references/voice.example.md` |
| `constraints.yaml` | Chief-of-staff | Boundaries, rules, working hours | `references/constraints.example.yaml` |
| `contacts/*.md` | Chief-of-staff | CRM contact profiles | `crm/contact.example.md` |
| `business-databases.yaml` | Business | Notion database IDs and schemas | `references/databases.example.yaml` |

All files are looked up first in the working directory, then in `~/.claude/`. The first match wins.

## MCP Dependencies

| Service | Required? | Used by |
|---------|-----------|---------|
| Gmail | Core (chief-of-staff) | `/triage`, `/today` |
| Google Calendar | Core (chief-of-staff) | `/today`, `/week`, `/prep` |
| Slack | Core (chief-of-staff) | `/triage`, `/today` |
| Asana | Optional | `/week`, `/status` |
| Notion | Core (business) | Management commands, `/report` |
| Factorial API | Optional | `/query` for HR data (via curl, not MCP) |
| HubSpot MCP | Optional | `/report` for commercial data |
| Airtable MCP | Optional | `/report` for recruitment data |
| Sherpa MCP | Optional | `/report` and `/query` for financial data (cash, P&L, burn, runway) |

## Cowork Compatibility

- **Chief-of-staff commands** work in Cowork as long as the relevant MCP servers are configured. Filesystem-based config files (`rocks.yaml`, `voice.md`, `constraints.yaml`, `contacts/`) must be pasted into the project context or stored in Notion.
- **Business management commands** work in Cowork via Notion MCP. Paste `business-databases.yaml` content into the conversation if not on filesystem.
- **Factorial queries** are NOT available in Cowork (uses curl via Bash).
- **`--output` and `--schedule`** for `/report` are not available in Cowork; reports render inline.

## Migration from `orbitant-chief-of-staff` and `orbitant-business`

This plugin replaces both. If you previously installed either:

```bash
/plugin uninstall orbitant-chief-of-staff
/plugin uninstall orbitant-business
/plugin install orbitant-operations
```

Existing config files (`rocks.yaml`, `voice.md`, `constraints.yaml`, `business-databases.yaml`, `contacts/`) work unchanged — same names, same lookup order. Only the command namespace changes:

- `/orbitant-chief-of-staff:today` → `/orbitant-operations:today`
- `/orbitant-business:challenge` → `/orbitant-operations:challenge`
- `/orbitant-business:report` → `/orbitant-operations:report`

The `preflight` command now covers both surfaces in one run.

## Links

- [Setup Guide](references/setup-guide.md)
- [MCP Business Reference](references/mcp-business-reference.md)
- [Report Definition Reference](references/report-definition-reference.md)
- [Plugin Marketplace](../../README.md)
- [License](../../LICENSE)
