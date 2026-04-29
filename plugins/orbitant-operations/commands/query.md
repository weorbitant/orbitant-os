---
name: query
description: "Answer natural-language questions about business data by routing to the appropriate data source. Usage: /query \"{question}\""
---

## Overview

Parse a natural-language question, identify which business data pillar(s) it maps to, dispatch the matching fetcher agent(s), and answer with specific numbers, names, and dates.

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
3. Extract the `sources` section. Identify which sources are configured (have entries) vs. unconfigured.

## Invocation

```
/query "{question}"
```

The question can be anything about the business: headcount, holidays, pipeline, candidates, etc.

## Execution

### Step 1 — Parse the Question

Identify which pillar(s) the question maps to using this routing table:

| Keywords | Pillar | Source | Agent | Status |
|----------|--------|--------|-------|--------|
| headcount, employees, holidays, sick, team, joiners, departures, factorial, leaves, parental | HR — Team | Factorial | factorial-fetcher | LIVE (if `sources.factorial` configured) |
| pipeline, deals, proposals, won, lost, sales, commercial, hubspot, calls | Commercial | HubSpot | — | STUB |
| candidates, recruitment, hiring, positions, airtable, applications | HR — Recruitment | Airtable | — | STUB |
| cash, balance, liquidez, tesorería, treasury, runway, burn, cash flow | Financial — Cash | Sherpa | sherpa-fetcher | LIVE (if `sources.sherpa` enabled) |
| P&L, PyG, EBITDA, revenue, ingresos, profit, beneficio, margin, margen, net income | Financial — P&L | Sherpa | sherpa-fetcher | LIVE (if `sources.sherpa` enabled) |
| AR, accounts receivable, AP, accounts payable, collection effectiveness | Financial — Receivables | — | — | NOT SUPPORTED (Sherpa MCP does not expose this) |
| budget, forecast, invoices | Financial — Planning | — | — | STUB |
| newsletter, traffic, linkedin, youtube, website, marketing | Marketing | — | — | STUB |
| utilization, allocation, resourcing, operations | Operations | — | — | STUB |

If the question spans multiple pillars, handle each independently.

### Step 2 — Route to Sources

**For Factorial (LIVE):**

1. Verify `sources.factorial` exists in config. If not: treat as STUB.
2. Read the `factorial-fetcher` agent from `agents/factorial-fetcher.md`.
3. Spawn the agent via the Agent tool with a focused prompt:
   - Pass the config values: `auth_env_var`, `base_url` (if set), `api_version` (if set)
   - Customize the prompt to fetch only what's needed to answer the question (not a full data dump)
   - Example: "Fetch only leave data for this week" for "Who's on holiday?"
4. Parse the agent's structured response (between `FACTORIAL_DATA_START/END` markers).

**For Sherpa (LIVE):**

1. Verify `sources.sherpa.enabled` is `true` in config. If not: treat as STUB.
2. Read the `sherpa-fetcher` agent from `agents/sherpa-fetcher.md`.
3. Infer the date window from the question:
   - "this month" / "current month" → `type: pnl-summary` or `cash-summary`, target = current calendar month
   - "last month" → prior calendar month
   - "now" / "today" / "current" (for cash) → `cash-summary` with latest snapshot
   - "Q1", "this quarter", "YTD" → `pnl-summary` for the relevant months (aggregate if multiple)
   - If no window is stated, default to the latest complete month
4. Choose `type`:
   - Cash/runway/burn/treasury keywords → `type: cash-summary`
   - P&L/revenue/EBITDA/margin/profit keywords → `type: pnl-summary`
   - Mixed question → dispatch twice, or use `type: kpi-lookup` with relevant `queries[]`
5. Spawn the agent via the Agent tool passing `type`, `cadence: ad-hoc`, `target_period`, and `metrics` (or `queries`) when helpful.
6. Parse the agent's structured response (between `SHERPA_DATA_START/END` markers).
7. For AR, AP, or collection-effectiveness questions: respond without dispatching —
   > The Sherpa MCP doesn't currently expose invoicing data. Accounts receivable/payable and collection effectiveness are out of scope for v1. _(Source: Sherpa MCP coverage)_

**For STUB sources:**

Return immediately:
> **{Pillar}** data is not yet connected. This will be available when the {source_name} integration is configured in `business-databases.yaml`.

### Step 3 — Answer the Question

- Use the fetched data to answer directly and concisely
- Include specific numbers, names, and dates
- Format with markdown tables where appropriate
- Cite the source: `(Source: Factorial)` or `(Source: HubSpot)` etc.

### Step 4 — Suggest Related Queries

After answering, suggest 1-2 related questions:
> **Related:** "How many new joiners this month?" · "Who's on sick leave?"

## Output Format

```
QUERY — DD-MM-YYYY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q: "{original question}"
Source: {pillar} ({source name})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{Answer with specific data, tables if appropriate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Related: "{suggestion 1}" · "{suggestion 2}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Cowork Adaptation

When running inside a Cowork session (no local filesystem access):
- **Config**: If `business-databases.yaml` content was pasted into conversation context, parse and use it.
- **Factorial queries**: NOT available in Cowork — the factorial-fetcher requires Bash (curl) which is not available in Cowork sessions. Display:
  ```
  ⚠️ Factorial queries require Claude Code (desktop).
  The factorial-fetcher uses curl to call the Factorial API, which is not available in Cowork.
  ```
- **Sherpa queries**: Work in Cowork IF the Sherpa MCP connector is enabled at the user level (the fetcher uses MCP tools, not Bash). Authentication is OAuth via the connector — no env vars required.
- **Notion-backed data**: Management commands (`/challenge list`, `/todo list`, etc.) still work in Cowork for querying Notion databases.

## Resilience

- If the relevant source is unavailable, say so clearly with the error
- Do NOT fall back to a different source — each pillar has exactly one source
- Do NOT fabricate data — if the answer can't be determined from the data, say so
- If the question is ambiguous, ask for clarification before fetching
- If the fetcher agent fails: report with ⚠️, do NOT retry more than once

## Anti-patterns

- Do NOT generate a full report for a simple question — fetch only what's needed
- Do NOT cache data between queries — always fetch fresh
- Do NOT answer questions about data you haven't fetched
- Do NOT hardcode source names or IDs — read from config
- Do NOT make up trends without actual historical data
