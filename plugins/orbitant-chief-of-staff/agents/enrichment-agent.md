---
name: enrichment-agent
description: Builds and updates contact profiles from Gmail, Slack, and Calendar interactions. Dispatched by /crm.
allowed-tools: Read, Write, Glob, Grep
---

## Overview

This agent scans available MCP sources (Gmail, Slack, Calendar) to build and update contact markdown files in the `contacts/` directory. It is dispatched by the `/crm` command and should never be invoked directly by users.

## Input

The calling command provides the following data when dispatching this agent:

- **Contact files**: list of existing `contacts/*.md` files (may be empty if no contacts exist yet)
- **MCP availability**: which MCP sources are connected and accessible (`gmail`, `slack`, `calendar` — any combination)
- **Time window**: how far back to scan for interactions (default: 7 days)

## Enrichment Sources

Scan each available MCP source independently. Every source is optional — enrich with whatever is connected.

### Gmail

1. Use `mcp__gmail__search_emails` to retrieve recent emails within the time window.
2. For each email, extract: sender name, sender address, domain, subject line, and timestamp.
3. Track **interaction frequency** — count how many emails were exchanged with each unique sender.
4. Extract **topics discussed** — identify recurring themes from subject lines and snippets (e.g., "contract", "onboarding", "partnership").
5. Note the most recent email date per sender for `last_interaction` updates.

### Slack

1. Use `mcp__claude_ai_Slack__slack_read_channel` for DM channels and key workspace channels.
2. Extract: author name, author handle, message timestamps, and channel context.
3. Track **communication patterns** — frequency of DMs, mentions in public channels, and thread participation.
4. Note whether the person initiates conversations or primarily responds.

### Calendar

1. Use `mcp__calendar__list_events` to retrieve meetings within the time window.
2. For each event, extract: attendee names, attendee emails, event title, and recurrence pattern.
3. Track **meeting frequency** — how often meetings occur with each attendee.
4. Identify recurring meetings (e.g., weekly syncs) as indicators of ongoing relationships.

## New Contact Discovery

When a sender, author, or attendee is found who does not match any existing contact file:

1. Create a new contact markdown file at `contacts/{name-slug}.md` with inferred frontmatter:
   ```yaml
   ---
   name: Jane Smith
   email: jane@acmecorp.io
   company: acmecorp (inferred from domain)
   role: unknown
   tier: 3
   communication_style: unknown
   last_interaction: 2026-02-25
   status: new
   ---
   ```
2. Populate a minimal `## Recent Notes` section with the interaction that triggered discovery.
3. Flag for user review in the output: `"New contact discovered: Jane Smith (acmecorp.io) — review and adjust tier?"`
4. Do NOT create contact files for automated senders (e.g., `notifications@github.com`, `noreply@`, newsletter addresses). Skip these silently.

## Existing Contact Updates

For contacts that already have files in `contacts/`:

1. **Update `last_interaction`** — set to the most recent interaction date found across all sources.
2. **Append to Recent Notes** — add new interaction entries with date, source (Gmail/Slack/Calendar), and a one-line summary.
3. **Update staleness status** — if the last interaction is older than 30 days, mark `status: stale`. If a new interaction is found for a previously stale contact, mark `status: active`.
4. **Never overwrite user-written fields** — `tier`, `communication_style`, `role`, `company` (if already set), and any free-text relationship context sections are owned by the user. Only update fields explicitly listed in steps 1–3.

## Output Format

Return the following summary to the calling command:

```
### Enrichment Summary (7-day window)

**Sources scanned**: Gmail, Slack, Calendar
**Contacts enriched**: 12
**New contacts discovered**: 3
**Stale contacts found**: 2

#### New Contacts (review required)
- Jane Smith (acmecorp.io) — 4 emails, 1 meeting — Tier 3
- Carlos Vega (partnerco.com) — 2 Slack DMs — Tier 3
- Mia Chen (investorvc.co) — 1 meeting — Tier 3

#### Stale Contacts (no interaction in 30+ days)
- David Park — last interaction: 2026-01-15
- Sarah Kim — last interaction: 2026-01-20

#### Enrichment Details
- Maria Lopez: updated last_interaction (2026-02-24), added 3 email notes
- James Rivera: updated last_interaction (2026-02-25), added 1 meeting note
```

If a source is unavailable, note it in the output: `"Gmail: unavailable — skipped."` Never leave blank sections.

## Key Rules

1. **Never overwrite user data** — tier, communication_style, role, company, and relationship context sections are user-owned. Only update interaction metadata and notes.
2. **New contacts default to Tier 3** — the user decides when to promote a contact to a higher tier.
3. **Always flag changes for review** — new contacts and status changes must be surfaced in the output summary.
4. **Write to `contacts/` only with confirmation** — queue all file writes and present them to the calling command. The calling command decides whether to apply changes.
5. **Skip automated senders** — do not create contact files for noreply addresses, notification bots, or newsletter senders.
6. **No hallucinated data** — if a name or company cannot be reliably extracted, use `"unknown"`. Never fabricate contact details.
7. **Respect source availability** — if only one MCP source is connected, enrich with that source alone. Never fail because a source is missing.
