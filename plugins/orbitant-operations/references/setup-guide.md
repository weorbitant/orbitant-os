# Setup Guide — orbitant-operations

Complete walkthrough for installing and configuring the operations plugin. Assumes you are starting from scratch.

The plugin combines two surfaces:

- **Chief-of-staff** — daily briefings, inbox triage, meeting prep, relationship tracking, goal alignment.
- **Business** — Notion-backed management commands plus data queries against Factorial HR, HubSpot, Airtable, and Sherpa financial.

You can configure either surface independently — install only what you need.

## Prerequisites

Before you begin, ensure you have:

- **Claude Code CLI** installed and authenticated (`claude --version` to verify)
- **Node.js 18+** (`node --version` to verify)
- Active accounts for the services you want to connect:
  - Google account (Gmail + Calendar) — for chief-of-staff
  - Slack workspace membership — for chief-of-staff
  - Asana account (optional, chief-of-staff degrades gracefully without it)
  - Notion workspace — for business management commands
  - Factorial account (optional, for HR queries)
  - Sherpa account (optional, for financial reports)

## Installation

### Step 1: Add the marketplace

```bash
claude plugin marketplace add weorbitant/orbitant-os
```

### Step 2: Install the plugin

```bash
claude plugin install orbitant-operations
```

### Step 3: Verify

Run the preflight command to confirm the plugin is recognized:

```bash
/orbitant-operations:preflight
```

If the command is not found, restart your Claude Code session and try again. Plugin registration sometimes requires a fresh session.

## MCP Server Setup

Each MCP server connects the plugin to an external service. Add only the ones you use — the plugin adapts to whatever is available.

### Gmail

```bash
claude mcp add gmail -s user -- npx @anthropic/gmail
```

- **Scopes needed:** read-only inbox access (OAuth consent screen will prompt)
- **Verify:** After adding, restart your session and run `/orbitant-operations:preflight`. The Gmail check should report "connected (inbox accessible)".

#### Multi-account setup

If you have separate work and personal Gmail accounts, register them under distinct names:

```bash
claude mcp add gmail-work -s user -- npx @anthropic/gmail
claude mcp add gmail-personal -s user -- npx @anthropic/gmail
```

Each `add` command triggers its own OAuth flow. Authenticate with the appropriate Google account in each browser prompt. The plugin will probe all registered Gmail servers during preflight.

### Google Calendar

```bash
claude mcp add calendar -s user -- npx @anthropic/google-calendar
```

- **Scopes needed:** read-only calendar access
- **Verify:** Preflight should report "connected (N events today)".

### Slack

```bash
claude mcp add slack -s user -- npx @anthropic/slack
```

- **Scopes needed:** `channels:history`, `channels:read`, `groups:history` (for private channels), `search:read`
- **Verify:** Preflight should report "connected". If you get permission errors on private channels, confirm the bot has been added to those channels and that `groups:history` is granted.

### Asana

```bash
claude mcp add asana -s user -- npx @anthropic/asana
```

- **Scopes needed:** read-only task and workspace access
- **Verify:** Preflight should report "connected (N workspaces)".
- Asana is optional. If not configured, task-related features are skipped without errors.

### Notion

The business surface requires the Notion MCP server. Add it the same way as the others (consult the Notion MCP docs for the exact `claude mcp add` command for your environment).

## Configuration — Chief-of-staff

Four config files. Each has a template in `references/` or `crm/`. Copy each template to your project root (or `~/.claude/` for global use), then edit with your real data.

The plugin checks both locations in order: `./filename` first, then `~/.claude/filename`.

### rocks.yaml — Quarterly Objectives

```bash
cp plugins/orbitant-operations/references/rocks.example.yaml ./rocks.yaml
```

Open `rocks.yaml` and replace the demo data:

1. Set `quarter`, `company`, `owner`, and `last_updated` to your values.
2. Replace the example rocks with your actual quarterly objectives.
3. Ensure all rock weights sum to exactly 1.0.
4. Each rock needs a `name`, `description`, `weight`, `status`, and exactly 3 `key_results`.
5. Key result `progress` is a float from 0.0 to 1.0.

### voice.md — Writing Style

```bash
cp plugins/orbitant-operations/references/voice.example.md ./voice.md
```

Edit `voice.md` to reflect your communication style. The file must contain these required H2 sections:

- `## General Tone`
- `## Formality Levels`
- `## Length Preferences`

Additional sections (phrases, signature) are optional but recommended.

### constraints.yaml — Scheduling Boundaries

```bash
cp plugins/orbitant-operations/references/constraints.example.yaml ./constraints.yaml
```

Edit `constraints.yaml` with your actual schedule:

1. Set your `timezone` (IANA format, e.g., `America/Chicago`).
2. Adjust `work_hours` start and end times.
3. Define your `hard_stops` — non-negotiable blocks that must never be scheduled over.
4. Set `meetings` preferences: max per day, buffer between meetings, preferred days.

### contacts/ — CRM Contact Files

```bash
mkdir -p ./contacts
cp plugins/orbitant-operations/crm/contact.example.md ./contacts/example.md
```

Create one `.md` file per contact using kebab-case filenames (e.g., `jane-smith.md`). Each file has YAML frontmatter with fields like `name`, `tier`, `email`, `last_interaction`, and `staleness_days`, followed by freeform relationship context and notes.

Remove or rename the example file once you have added real contacts.

## Configuration — Business

### business-databases.yaml — Notion database IDs and external sources

1. Copy the template:

   ```bash
   cp plugins/orbitant-operations/references/databases.example.yaml plugins/orbitant-operations/business-databases.yaml
   ```

   Or for global use:

   ```bash
   cp plugins/orbitant-operations/references/databases.example.yaml ~/.claude/business-databases.yaml
   ```

2. Open your copy and replace placeholder IDs with your real Notion data source IDs.

3. To find a data source ID:
   - Open the database in Notion
   - Click "..." → "Copy link"
   - The ID is the UUID in the URL

#### Lookup Order

Commands look for `business-databases.yaml` in this order:

1. `./business-databases.yaml` (relative to plugin root — best for per-project config)
2. `~/.claude/business-databases.yaml` (global fallback — shared across projects)

The first file found wins.

#### Notion Database Schemas

Each database needs specific columns. See `databases.example.yaml` for the full property list per database. At minimum:

| Database | Required Column | Type |
|----------|----------------|------|
| Challenges | Challenge | Title |
| Headlines | Headline | Title |
| Opportunities | Opportunity | Title |
| TODOs | Name | Title |

Optional columns (Department, Lead, Author, Owner, Deadline, etc.) are used when present but commands work without them.

### External Data Sources

#### Factorial (HR Team Data)

The `/orbitant-operations:query` command can answer questions about HR data (headcount, holidays, sick leave, etc.) by connecting to the Factorial HR API.

##### Setup

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
5. Run `/orbitant-operations:preflight` to verify connectivity

##### Optional Overrides

```yaml
sources:
  factorial:
    auth_env_var: "FACTORIAL_API_KEY"
    base_url: "https://api.factorialhr.com/api"    # default
    api_version: "2025-01-01"                       # default
```

##### Requirements

- Factorial account with API access (admin or HR role)
- Claude Code (desktop) — not available in Cowork sessions

#### Sherpa (Financial Data)

The `/orbitant-operations:query` and `/orbitant-operations:report` commands use Sherpa to pull cash liquidity, bank transactions, P&L, and derived metrics (burn, runway). Sherpa is a remote MCP server — no API keys or env vars.

##### Setup

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
5. Run `/orbitant-operations:preflight` to verify connectivity. A healthy check returns at least one company group.

##### What Sherpa covers

- Current cash liquidity (checking accounts, portfolios, deposits, lines of credit), EUR-normalized
- Bank transactions per checking account (paginated, date-filterable)
- Full P&L tree for a fiscal year, with monthly + YTD values and `% over revenue` on cost rows

##### What Sherpa does NOT cover (v1)

- Accounts receivable / accounts payable
- Collection effectiveness
- Future/projected balances
- Invoicing events

These render as `⬜ Not supported` in KPI tables — distinct from `⬜ Not connected` which means the source isn't configured at all.

##### Requirements

- Sherpa account with permission to read banking and financial data
- Available in both Claude Code and Cowork (MCP-based)

## Verification

After completing the configuration, run the full preflight check:

```bash
/orbitant-operations:preflight
```

A healthy setup produces output like:

```
OPERATIONS PREFLIGHT — DD-MM-YYYY

MCP Servers:
  Gmail                       ✅ connected (inbox accessible)
  Google Calendar             ✅ connected (3 events today)
  Slack                       ✅ connected
  Asana                       ✅ connected (1 workspace)
  Notion                      ✅ connected

Chief-of-staff Configs:
  rocks.yaml                  ✅ valid (4 rocks, weights sum to 1.0)
  voice.md                    ✅ valid (3 required sections found)
  constraints.yaml            ✅ valid (timezone: America/New_York)
  contacts/                   ✅ valid (5 contact files)

Business Config:
  business-databases.yaml     ✅ valid (4 databases, 2 sources)

Live Business Sources:
  Factorial (HR Team)         ✅ connected
  Sherpa (Financial)          ✅ connected

Summary: N/M checks passed
```

If any items fail, preflight prints the exact fix command below each failure. Run the fix, then re-run preflight until everything passes.

### Common preflight failures

| Failure | Cause | Fix |
|---------|-------|-----|
| MCP "not configured" | Server not added | Run the `claude mcp add` command shown |
| MCP "authentication error" | OAuth expired or wrong account | Remove and re-add the MCP server, re-authenticate |
| rocks.yaml "weights do not sum to 1.0" | Arithmetic error in config | Adjust weights so they total exactly 1.0 |
| voice.md "missing required section" | Renamed or removed an H2 heading | Ensure `## General Tone`, `## Formality Levels`, `## Length Preferences` exist |
| contacts/ "empty" | No `.md` files in directory | Add at least one contact file |
| business-databases.yaml "not found" | Template not copied | `cp plugins/orbitant-operations/references/databases.example.yaml ./business-databases.yaml` |
| Factorial 401 | API key invalid or expired | Regenerate the key in Factorial, update `$FACTORIAL_API_KEY`, restart session |
| Sherpa OAuth expired | Token timed out | Run `/mcp` and reauthenticate |

## Cowork Setup

If you use Cowork (browser-based Claude) instead of the CLI, the plugin still works with adaptations.

### What works identically

- All MCP server connections (Gmail, Calendar, Slack, Asana, Notion, Sherpa) use the same setup commands.
- Commands like `/preflight` and `/status` function normally for MCP-dependent sections.
- Notion-backed management commands (`/challenge`, `/highlight`, `/opportunity`, `/todo`).

### What differs

Cowork does not have filesystem access, so config files cannot be read from disk.

**Option A — Paste into project context:**
Copy the contents of your `rocks.yaml`, `voice.md`, `constraints.yaml`, and `business-databases.yaml` directly into your Cowork project context. The plugin will read them from there.

**Option B — Store in Notion:**
Save each config as a Notion page and reference them in your project instructions. If the Notion MCP is connected, the plugin can fetch them on demand.

### Limitations in Cowork

- Preflight skips filesystem checks and reports config files as "not checked (Cowork mode)".
- Contact files must be pasted into context or maintained in an external system (Notion, Google Sheets).
- File-based commands that write to disk will not work.
- **Factorial unavailable** — uses curl via Bash, not supported in Cowork.

**Availability by source in Cowork:**

| Source | Cowork | Notes |
|--------|:------:|-------|
| Notion | ✅ | MCP-based |
| Sherpa | ✅ | MCP-based |
| HubSpot | ✅ | MCP-based |
| Airtable | ✅ | MCP-based |
| Gmail | ✅ | MCP-based |
| Calendar | ✅ | MCP-based |
| Slack | ✅ | MCP-based |
| Asana | ✅ | MCP-based |
| Factorial | ❌ | curl via Bash — desktop-only |

## Troubleshooting

### MCP server won't connect

1. Verify the server is registered: check `~/.claude/.mcp.json` for the server entry.
2. Restart your Claude Code session — MCP changes often require a fresh session.
3. Re-run the `claude mcp add` command to trigger a new OAuth flow.
4. Check that you authenticated with the correct account during OAuth.

### Config file not found

1. Confirm the file exists at `./filename` or `~/.claude/filename`.
2. Check for typos in the filename (e.g., `rocks.yaml` not `rocks.yml`).
3. If you moved your project directory, re-copy the templates from the plugin's `references/` folder.

### Permission errors

1. Gmail/Calendar: Re-authorize and ensure you grant the requested scopes.
2. Slack: Verify the bot is a member of the channels you want to read. Private channels require `groups:history`.
3. Asana: Confirm your account has access to the workspace you expect.

### Session issues

Many problems resolve by restarting the Claude Code session. After any MCP config change, a restart is recommended before re-running preflight.

## Next Steps

Once preflight passes:

1. Run `/orbitant-operations:status` to see your operational dashboard.
2. Use `/orbitant-operations:today` for daily briefings.
3. Use `/orbitant-operations:triage` for inbox management.
4. Use `/orbitant-operations:challenge`, `/orbitant-operations:highlight`, `/orbitant-operations:opportunity`, `/orbitant-operations:todo` for management entries.
5. Use `/orbitant-operations:query` for natural-language data questions.
6. Use `/orbitant-operations:report` for periodic business reports.
7. Update your `rocks.yaml` weekly to keep goal progress current.
8. Add new contacts to `contacts/` as relationships develop.
