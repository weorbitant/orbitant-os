---
name: challenge
description: Create or list challenges in your Notion Challenges database. Tracks blockers, risks, and problems to solve.
---

## Overview

Add a new challenge to the execution framework, or list existing unsolved challenges. The user provides the challenge text and optionally a department and lead. Creates the entry in Notion.

## Step 0 — Load Configuration

1. Read `business-databases.yaml` using dual-path lookup:
   - First try `./business-databases.yaml` (relative to plugin root)
   - Then try `~/.claude/business-databases.yaml`
2. If neither exists, display this message and stop:
   ```
   ⚠️ business-databases.yaml not found.
   Copy the template and add your Notion database IDs:
     cp references/databases.example.yaml business-databases.yaml
   See references/setup-guide.md for details.
   ```
3. Extract the `databases.challenges` entry. Read `data_source_id`, `title_property`, `filter_property`, and `properties`.
4. Extract `relations.departments.collection_id` if present (needed for department resolution).

## Invocation

### Create mode (default)

```
/challenge <challenge text>
```

The user may also provide:
- A department name (e.g., "Engineering", "Sales") — resolve it to the correct relation page
- A lead name — resolve it to the correct person
- An outcome description
- Multiple challenges in one go — create them all in a single batch

### Query mode

```
/challenge list
```

Lists all unsolved challenges from the database.

## Execution — Create Mode

### Step 1 — Parse Input

Extract from the user's message:
- **Challenge(s)**: the text of each challenge
- **Department** (if mentioned): the department name to link
- **Lead** (if mentioned): the person to assign
- **Outcome** (if mentioned): the expected outcome

If the input is ambiguous, ask the user to clarify. Otherwise, proceed.

### Step 2 — Resolve Department (if provided)

If the user specified a department and `relations.departments.collection_id` is configured:
1. Search the Department data source (`collection://<collection_id from config>`) for a page matching the department name
2. Use the page URL as the relation value
3. If no match is found: warn the user and create the challenge without the department link
4. If `relations.departments` is not configured: skip department resolution silently

### Step 3 — Create the Challenge(s)

Use `notion-create-pages` with:
- **parent**: `{ "data_source_id": "<data_source_id from config>" }`
- **properties**: `{ "<title_property>": "<challenge text>" }` (add department, lead, outcome properties if resolved — use property names from config)

For multiple challenges, batch them in a single `notion-create-pages` call.

### Step 4 — Confirm

Report back to the user:

```
CHALLENGE — DD-MM-YYYY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Created:   <number> challenge(s)
Database:  Challenges (<year from config>)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• "<challenge 1>"  [Department if set]  [Lead if set]
• "<challenge 2>"  ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Execution — Query Mode

### Step 1 — Query the Database

Query the data source (`collection://<data_source_id from config>`) filtering for `<filter_property> = false`.

### Step 2 — Display Results

```
CHALLENGES — LIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Showing: <count> unsolved challenge(s) — Database: Challenges (<year>)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| # | Challenge | Department | Lead | Created |
|---|-----------|------------|------|---------|
| 1 | <text> | <dept or —> | <lead or —> | DD-MM-YYYY |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If no results: `No unsolved challenges found.`

## Cowork Adaptation

When running inside a Cowork session (no local filesystem access):
- **Config**: If `business-databases.yaml` content was pasted into the conversation context, parse and use it. Otherwise, ask the user for the Challenges data source ID.
- **MCP calls**: Work identically — the same Notion MCP tools are available in Cowork.
- **Department resolution**: If the departments collection ID was provided in context, use it. Otherwise, skip department linking.

## Resilience

- If the Notion MCP fails: report with ⚠️, do NOT retry more than once.
- If department resolution fails: create the challenge without the relation and note the issue.
- Never leave the user without feedback — always confirm what was created or what failed.

## Anti-patterns

- Do NOT create a challenge without the user providing text — always require at least one challenge.
- Do NOT hardcode data source IDs or property names — always read from `business-databases.yaml`.
- Do NOT silently skip the department link — warn the user if resolution failed.
