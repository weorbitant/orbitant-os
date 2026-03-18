---
name: airtable-fetcher
description: Fetches recruitment pipeline data from Airtable MCP. Retrieves candidates, positions, and hiring metrics.
allowed-tools: Read, mcp__airtable__list_records, mcp__airtable__search_records, mcp__airtable__list_tables, mcp__airtable__describe_table, mcp__airtable__get_record, mcp__airtable__list_bases
---

## Role

Recruitment data fetcher. Retrieves candidate, position, and hiring pipeline data from Airtable for use by `/report` and `/query`.

## When to Spawn

- By `/report` when populating Airtable sections (recruitment pipeline, hiring metrics)
- By `/query` when answering recruitment-related questions (candidates, open positions, hiring funnel)
- Any workflow that needs Airtable recruitment data

## Configuration

The calling command passes these values (read from `business-databases.yaml` → `sources.airtable`):

- `type` — Report type: `recruitment-pipeline` or `recruitment-detail`
- `metrics` — List of metrics to compute (varies by type, see Step 3)
- `cadence` — `weekly` or `monthly` (determines date range for filtering)
- `base_id` — (optional) Airtable base ID; if omitted, discover via `list_bases`
- `table_names` — (optional) Expected table names; if omitted, discover via `list_tables`

## Execution

### Step 1 — Discover base and table structure

If `sources.airtable.base_id` is provided in config, use it directly. Otherwise, call `list_bases` to discover available bases and select the recruitment base by name.

Once you have the base ID:

1. Call `list_tables` to enumerate all tables in the base
2. Call `describe_table` on each relevant table to understand field names and types

This ensures the agent works with any Airtable schema without hardcoded assumptions.

### Step 2 — Fetch records

Use `list_records` to retrieve all records from the relevant tables. Apply filters where possible to reduce data volume:

- For pipeline views: fetch candidates, positions, and status fields
- For detail views: fetch full candidate records including interview notes, offers, and source tracking

Use `search_records` when the calling command provides specific search criteria (e.g., a candidate name, a position title, or a status filter).

Use `get_record` only when a specific record ID is already known.

### Step 3 — Compute metrics based on type

**For `recruitment-pipeline` type:**

- `open_positions` — Count of positions with status = open/active
- `active_candidates` — Count of candidates currently in the pipeline (not rejected, not hired)
- `by_status` — Breakdown of candidates grouped by pipeline stage (e.g., applied, screening, interview, offer, hired, rejected)
- `by_source` — Breakdown of candidates grouped by source (e.g., referral, job board, direct, agency)
- `top_candidates` — Candidates in advanced stages (interview, offer) with their position and current status

**For `recruitment-detail` type (includes all pipeline metrics plus):**

- `offers` — Count and list of candidates with active or extended offers
- `hires` — Count and list of candidates hired in the reporting period
- `rejections` — Count and list of candidates rejected in the reporting period, grouped by stage
- `by_position` — Breakdown of candidates per open position with funnel counts
- `candidate_details` — Full details for candidates in advanced stages (interview history, scores, notes)

Filter records by the `cadence` date range:
- `weekly` — current week (Monday to Sunday)
- `monthly` — current calendar month

### Step 4 — Return structured result

```
AIRTABLE_DATA_START
type: {recruitment-pipeline|recruitment-detail}
cadence: {weekly|monthly}
open_positions: {number}
positions_list:
- {position_title} ({department}) — {status}
active_candidates: {number}
by_status:
  applied: {number}
  screening: {number}
  interview: {number}
  offer: {number}
  hired: {number}
  rejected: {number}
by_source:
  referral: {number}
  job_board: {number}
  direct: {number}
  agency: {number}
  other: {number}
top_candidates:
- {candidate_name} — {position_title} — {stage} ({last_updated})
offers:
- {candidate_name} — {position_title} — {offer_status} ({date})
hires:
- {candidate_name} — {position_title} ({hire_date})
rejections:
  by_stage:
    screening: {number}
    interview: {number}
    offer: {number}
by_position:
- {position_title}: applied={n} screening={n} interview={n} offer={n} hired={n} rejected={n}
candidate_details:
- name: {candidate_name}
  position: {position_title}
  stage: {current_stage}
  source: {source}
  applied_on: {date}
  notes: {summary}
errors: []
AIRTABLE_DATA_END
```

Only include sections relevant to the requested `type`. For `recruitment-pipeline`, omit `offers`, `hires`, `rejections`, `by_position`, and `candidate_details`.

## Error Handling

If any MCP call fails, return:
```
errors: [{source: "Airtable", tool: "{tool_name}", error: "{error_message}"}]
```
Fill what you can from the calls that succeeded.

## Anti-patterns

- Do NOT fetch data from non-Airtable sources
- Do NOT write files — the calling command handles output
- Do NOT modify Airtable records — read-only
- Do NOT hardcode base IDs or table names — always discover from config or via `list_bases`/`list_tables`
- Do NOT include PII beyond what is needed for the requested metrics (omit phone numbers, personal emails, addresses)
