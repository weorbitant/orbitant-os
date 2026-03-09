---
name: highlight
description: Create or list highlights in your Notion Headlines database. Tracks wins, milestones, and good news worth celebrating.
---

## Overview

Add a new highlight to the execution framework, or list recent headlines. The user provides the headline text and optionally a department. Creates the entry in Notion.

## Step 0 — Load Configuration

1. Read `databases.yaml` using dual-path lookup:
   - First try `./databases.yaml` (relative to plugin root)
   - Then try `~/.claude/databases.yaml`
2. If neither exists, display this message and stop:
   ```
   ⚠️ databases.yaml not found.
   Copy the template and add your Notion database IDs:
     cp references/databases.example.yaml databases.yaml
   See references/setup-guide.md for details.
   ```
3. Extract the `databases.headlines` entry. Read `data_source_id`, `title_property`, and `properties`.
4. Extract `relations.departments.collection_id` if present (needed for department resolution).

## Invocation

### Create mode (default)

```
/highlight <headline text>
```

The user may also provide:
- A department name (e.g., "Engineering", "Sales") — resolve it to the correct relation page
- Multiple highlights in one go — create them all in a single batch

### Query mode

```
/highlight list
```

Lists recent headlines from the database.

## Execution — Create Mode

### Step 1 — Parse Input

Extract from the user's message:
- **Headline(s)**: the text of each highlight
- **Department** (if mentioned): the department name to link

If the input is ambiguous, ask the user to clarify. Otherwise, proceed.

### Step 2 — Resolve Department (if provided)

If the user specified a department and `relations.departments.collection_id` is configured:
1. Search the Department data source (`collection://<collection_id from config>`) for a page matching the department name
2. Use the page URL as the relation value
3. If no match is found: warn the user and create the highlight without the department link
4. If `relations.departments` is not configured: skip department resolution silently

### Step 3 — Create the Highlight(s)

Use `notion-create-pages` with:
- **parent**: `{ "data_source_id": "<data_source_id from config>" }`
- **properties**: `{ "<title_property>": "<headline text>" }` (add department property if resolved — use property names from config)

For multiple highlights, batch them in a single `notion-create-pages` call.

### Step 4 — Confirm

Report back to the user:

```
HIGHLIGHT — DD-MM-YYYY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Created:   <number> highlight(s)
Database:  Headlines (<year from config>)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• "<headline 1>"  [Department if set]
• "<headline 2>"  ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Execution — Query Mode

### Step 1 — Query the Database

Query the data source (`collection://<data_source_id from config>`) sorted by created time descending. No filter is applied — headlines have no active/inactive status.

### Step 2 — Display Results

```
HIGHLIGHTS — LIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Showing: <count> headline(s) — Database: Headlines (<year>)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| # | Headline | Department | Author | Created |
|---|----------|------------|--------|---------|
| 1 | <headline text> | <dept or —> | <author or —> | DD-MM-YYYY |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If no results: `No headlines found.`

## Cowork Adaptation

When running inside a Cowork session (no local filesystem access):
- **Config**: If `databases.yaml` content was pasted into the conversation context, parse and use it. Otherwise, ask the user for the Headlines data source ID.
- **MCP calls**: Work identically — the same Notion MCP tools are available in Cowork.
- **Department resolution**: If the departments collection ID was provided in context, use it. Otherwise, skip department linking.

## Resilience

- If the Notion MCP fails: report with ⚠️, do NOT retry more than once.
- If department resolution fails: create the highlight without the relation and note the issue.
- Never leave the user without feedback — always confirm what was created or what failed.

## Anti-patterns

- Do NOT create a highlight without the user providing text — always require at least one headline.
- Do NOT hardcode data source IDs or property names — always read from `databases.yaml`.
- Do NOT silently skip the department link — warn the user if resolution failed.
