# Business Management

Business management commands — challenges, highlights, opportunities, and todos via Notion.

## Overview

This plugin provides slash commands to create and query business execution items directly in Notion. Track challenges (blockers and risks), highlights (wins and milestones), opportunities (ideas to explore), and todos (actionable tasks with deadlines). All data lives in your Notion workspace.

## Quick Start

```bash
# 1. Install the plugin
/plugin install orbitant-business

# 2. Copy the config template
cp plugins/orbitant-business/references/databases.example.yaml plugins/orbitant-business/business-databases.yaml

# 3. Add your Notion database IDs to the config
# Open each database in Notion → "..." → "Copy link" → extract the UUID

# 4. Start using commands
/business:challenge "We need to reduce onboarding time"
/business:highlight "Closed Q1 above target"
/business:opportunity "Partnership with Acme Corp"
/business:todo "Prepare board deck" by Felipe due Friday
```

## Available Commands

| Command | Description | Status |
|---------|-------------|--------|
| `/business:challenge` | Create or list challenges (blockers, risks) | Available |
| `/business:highlight` | Create or list highlights (wins, milestones) | Available |
| `/business:opportunity` | Create or list opportunities (ideas, leads) | Available |
| `/business:todo` | Create or list todos (tasks with deadlines) | Available |

Each command supports two modes:
- **Create**: `/business:challenge "text"` — creates a new entry
- **Query**: `/business:challenge list` — lists active entries

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
| Notion | Core | All commands |

## Notion Database Schemas

Each database needs at minimum a title column. Optional columns are used when present.

| Database | Required Column | Type | Optional Columns |
|----------|----------------|------|------------------|
| Challenges | Challenge | Title | Departments, Lead, Outcome, Solved |
| Headlines | Headline | Title | Department, Author |
| Opportunities | Opportunity | Title | Department, Author, Embraced |
| TODOs | Name | Title | Owner, Deadline, Completed |

## Cowork Compatibility

All commands work in Cowork sessions as long as the Notion MCP server is available. If `business-databases.yaml` is not on the filesystem, paste its content into the conversation and commands will parse it from context.

## Links

- [Setup Guide](references/setup-guide.md)
- [Plugin Marketplace](../../README.md)
- [License](../../LICENSE)
