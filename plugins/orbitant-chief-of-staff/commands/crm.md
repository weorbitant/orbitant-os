---
name: crm
description: Contact management — view contact health, trigger enrichment, manage tiers and staleness.
---

## Overview

Central hub for managing contacts. Shows contact health at a glance, dispatches the `enrichment-agent` to update contacts from MCP sources, and lets users promote/demote contact tiers or update fields. By default it renders a read-only dashboard; sub-commands unlock write operations that always require explicit confirmation before modifying any file.

## Execution Flow

1. **Invoke `orbitant-graceful-degradation`** to determine which MCP servers and config files are available. This MUST run first -- do not skip it, even if you believe everything is connected.
2. **Scan `contacts/*.md` files** -- check `./contacts/` then `~/.claude/contacts/`. If neither exists, show fallback and stop.
3. **Parse each contact's YAML frontmatter**: name, company, role, tier, email, last_interaction, staleness_days, status.
4. **Compute staleness** for every contact: `staleness = today - last_interaction`. A contact is stale when `staleness > staleness_days` (default 30 if field is missing).
5. **Route to the appropriate sub-command** based on arguments, or render the dashboard if none.

## Sub-commands

- `/crm` -- render the dashboard (default).
- `/crm enrich` -- dispatch `enrichment-agent` with a 7-day window. Present changes for confirmation before writing.
- `/crm enrich --window 30d` -- dispatch with a custom time window.
- `/crm promote {name} --tier 1` -- update a contact's tier in their markdown file.
- `/crm update {name} --field value` -- update a specific field in a contact's frontmatter.
- `/crm add {name}` -- create a new contact file from `crm/contact.example.md`, set Tier 3 as default.

## Dashboard Output

Render using this structure. Adapt content based on actual data -- the example is illustrative.

```
# CRM Dashboard

## Summary
15 contacts | 12 active | 3 stale

## By Tier
Tier 1 (4 contacts): 3 active, 1 stale
Tier 2 (6 contacts): 5 active, 1 stale
Tier 3 (5 contacts): 4 active, 1 stale

## Stale Contacts
  Jane Smith (Tier 1) -- 21 days since contact (threshold: 7)
  Carlos Vega (Tier 2) -- 18 days since contact (threshold: 14)
  Sarah Chen (Tier 3) -- 35 days since contact (threshold: 30)

## Recent Interactions (last 7 days)
- Maria Lopez (Tier 1) -- 2 days ago (Gmail)
- James Rivera (Tier 2) -- 1 day ago (Slack)
- Alex Kim (Tier 2) -- 4 days ago (Calendar)

---
Generated: {date} {time}
Run /orbitant-chief-of-staff:crm enrich to update contacts from Gmail, Slack, and Calendar
```

## Enrichment Flow

1. Dispatch `enrichment-agent` with available MCP sources (Gmail, Slack, Calendar) and the time window (default 7 days).
2. Agent returns a summary: new contacts discovered, stale contacts updated, enrichment details per contact.
3. Present all proposed changes to the user for confirmation before writing any files.
4. On confirmation: apply file changes (new contact files, updated frontmatter fields).
5. Print: "Enrichment complete. N contacts updated, M new contacts created."

If the user declines, discard changes and print: "Enrichment cancelled. No files modified."

## Promote / Update / Add Operations

- All operations modify contact markdown files directly.
- **Always show the change before applying** and wait for explicit confirmation.
- **Promote**: Update the `tier` field in the contact's frontmatter. Show old tier and new tier.
- **Update**: Update the specified field. Show old value and new value. Reject updates to `name` -- use the filename for identity.
- **Add**: Copy `crm/contact.example.md` to `contacts/{name}.md`, fill in the name, set `tier: 3` as default. Show the new file content before writing.

## Cowork Adaptation

When running inside a Cowork session (no local filesystem access):

- **Dashboard**: Parse contact data from conversation context if available. If no contact data has been provided, skip with a Cowork-specific fallback message.
- **Enrich**: MCP calls work identically. File writes are queued and printed inline for the user to copy and apply manually.
- **Promote / Update / Add**: Not available in Cowork mode. Print: "File modifications require CLI mode -- run this command locally."

## Key Rules

1. **Read-only by default.** The dashboard is purely informational. No files are modified without an explicit sub-command.
2. **File modifications always require explicit confirmation.** Enrich, promote, update, and add all show changes before applying and wait for user approval.
3. **Graceful-degradation first.** Always invoke the skill before scanning. Do not re-probe MCP servers yourself.
4. **Each contact file is independent.** One parse failure does not block others. Note the failure and continue.
5. **Never overwrite user-written fields during enrichment.** Protected fields: tier, communication_style, role, notes. Only update machine-derived fields like last_interaction and status.
6. **Staleness formula**: `today - last_interaction > staleness_days`. Default staleness_days is 30 if the field is not specified in the contact frontmatter.
7. **Timestamp the report.** Always include "Generated: {date} {time}" at the bottom.
8. **End with enrichment suggestion.** If not already enriching, close with: "Run /orbitant-chief-of-staff:crm enrich to update contacts from Gmail, Slack, and Calendar."
