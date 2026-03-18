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

## External Data Sources

### Factorial (HR Team Data)

The `/query` command can answer questions about your HR data (headcount, holidays, sick leave, etc.) by connecting to the Factorial HR API.

#### Setup

1. Get an API key from your Factorial admin panel (Settings → API Keys)
2. Add the key to your shell profile (`~/.zshrc` or `~/.bashrc`):
   ```bash
   export FACTORIAL_API_KEY="your-api-key-here"
   ```
3. Add the Factorial source to your `business-databases.yaml`:
   ```yaml
   sources:
     factorial:
       auth_env_var: "FACTORIAL_API_KEY"
   ```
4. Restart your Claude Code session (so the env var is loaded)
5. Run `/preflight` to verify connectivity

#### Optional Overrides

```yaml
sources:
  factorial:
    auth_env_var: "FACTORIAL_API_KEY"
    base_url: "https://api.factorialhr.com/api"    # default
    api_version: "2025-01-01"                       # default
```

#### Requirements

- Factorial account with API access (admin or HR role)
- Claude Code (desktop) — not available in Cowork sessions

## Cowork Usage

In Claude Cowork (no filesystem access), paste your `business-databases.yaml` content into the conversation. Commands will detect and use it from context.

**Note:** Factorial queries (`/query` for HR data) are NOT available in Cowork because the factorial-fetcher uses curl (Bash), which Cowork does not support. Management commands (`/challenge`, `/highlight`, `/opportunity`, `/todo`) work normally in Cowork via Notion MCP.
