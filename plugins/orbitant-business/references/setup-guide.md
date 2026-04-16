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

### Sherpa (Financial Data)

The `/query` and `/report` commands use Sherpa to pull cash liquidity, bank transactions, P&L, and derived metrics (burn, runway). Sherpa is a remote MCP server — no API keys or env vars.

#### Setup

1. In Claude Code, run `/mcp` and add the Sherpa server URL: `https://app.sherpaplatform.com/api/mcp`
2. Complete the OAuth flow in the browser window that opens — Claude Code stores the token.
3. Add the Sherpa source to your `business-databases.yaml`:
   ```yaml
   sources:
     sherpa:
       type: "mcp"
       enabled: true
       # company_group_id: "uuid"   # optional — only set if you have >1 company group
   ```
4. **Restart your Claude Code session** — MCP tools bind at session start, so tools added mid-session aren't visible until the next start.
5. Run `/preflight` to verify connectivity. A healthy check returns at least one company group.

#### What Sherpa covers

- Current cash liquidity (checking accounts, portfolios, deposits, lines of credit), EUR-normalized
- Bank transactions per checking account (paginated, date-filterable)
- Full P&L tree for a fiscal year, with monthly + YTD values and `% over revenue` on cost rows

#### What Sherpa does NOT cover (v1)

- Accounts receivable / accounts payable
- Collection effectiveness
- Future/projected balances
- Invoicing events

These render as `⬜ Not supported` in KPI tables — distinct from `⬜ Not connected` which means the source isn't configured at all.

#### Requirements

- Sherpa account with permission to read banking and financial data
- Available in both Claude Code and Cowork (MCP-based)

## Cowork Usage

In Claude Cowork (no filesystem access), paste your `business-databases.yaml` content into the conversation. Commands will detect and use it from context.

**Availability by source in Cowork:**

| Source | Cowork | Notes |
|--------|:------:|-------|
| Notion | ✅ | MCP-based |
| Sherpa | ✅ | MCP-based |
| HubSpot | ✅ | MCP-based |
| Airtable | ✅ | MCP-based |
| Factorial | ❌ | curl via Bash — desktop-only |

Management commands (`/challenge`, `/highlight`, `/opportunity`, `/todo`) work normally in Cowork via Notion MCP.
