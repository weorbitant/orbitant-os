# orbitant-business — Setup Guide

## Prerequisites

- Notion MCP server connected (check with `/preflight` if you have orbitant-chief-of-staff)
- Notion databases created for: Challenges, Headlines, Opportunities, TODOs

## Configuration

1. Copy the template:

   ```bash
   cp plugins/orbitant-business/references/databases.example.yaml plugins/orbitant-business/business-databases.yaml
   ```

   Or for global use:

   ```bash
   cp plugins/orbitant-business/references/databases.example.yaml ~/.claude/business-databases.yaml
   ```

2. Open your copy and replace placeholder IDs with your real Notion data source IDs.

3. To find a data source ID:
   - Open the database in Notion
   - Click "..." → "Copy link"
   - The ID is the UUID in the URL

## Lookup Order

Commands look for `business-databases.yaml` in this order:
1. `./business-databases.yaml` (relative to plugin root — best for per-project config)
2. `~/.claude/business-databases.yaml` (global fallback — shared across projects)

The first file found wins.

## Notion Database Schemas

Each database needs specific columns. See `databases.example.yaml` for the full property list per database. At minimum:

| Database | Required Column | Type |
|----------|----------------|------|
| Challenges | Challenge | Title |
| Headlines | Headline | Title |
| Opportunities | Opportunity | Title |
| TODOs | Name | Title |

Optional columns (Department, Lead, Author, Owner, Deadline, etc.) are used when present but commands work without them.

## Cowork Usage

In Claude Cowork (no filesystem access), paste your `business-databases.yaml` content into the conversation. Commands will detect and use it from context.
