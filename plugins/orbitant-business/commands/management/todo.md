---
name: todo
description: Create or list todos in your Notion TODOs database. Tracks tasks, deadlines, and ownership.
---

## Overview

Add a new todo to the execution framework, or list existing incomplete todos. The user provides the task text and optionally an owner and deadline. Creates the entry in Notion.

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
3. Extract the `databases.todos` entry. Read `data_source_id`, `title_property`, `filter_property`, and `properties`.

## Invocation

### Create mode (default)

```
/todo <task text>
```

The user may also provide:
- An owner name — resolve it to the correct person
- A deadline (e.g., "by Friday", "2026-03-15") — parse it to a date; defaults to **current date + 7 days** if not specified
- Multiple todos in one go — create them all in a single batch

### Query mode

```
/todo list
```

Lists all incomplete todos from the database.

## Execution — Create Mode

### Step 1 — Parse Input

Extract from the user's message:
- **Task(s)**: the text of each todo
- **Owner** (if mentioned): the person to assign
- **Deadline** (if mentioned): the due date

If no deadline is provided, default to **current date + 7 days**.

If the input is ambiguous, ask the user to clarify. Otherwise, proceed.

### Step 2 — Create the Todo(s)

Use `notion-create-pages` with:
- **parent**: `{ "data_source_id": "<data_source_id from config>" }`
- **properties**: `{ "<title_property>": "<task text>", "Deadline": "<deadline>" }` (add owner property if resolved — use property names from config)

For multiple todos, batch them in a single `notion-create-pages` call.

### Step 3 — Confirm

Report back to the user:

```
TODO — DD-MM-YYYY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Created:   <number> todo(s)
Database:  TODOs (<year from config>)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• "<task 1>" — Due: DD-MM-YYYY  [Owner if set]
• "<task 2>"  ...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Execution — Query Mode

### Step 1 — Query the Database

Query the data source (`collection://<data_source_id from config>`) filtering for `<filter_property> = false`.

### Step 2 — Display Results

```
TODO — LIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Showing: <count> incomplete todo(s) — Database: TODOs (<year>)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| # | Task | Owner | Deadline |
|---|------|-------|----------|
| 1 | <task text> | <owner or —> | DD-MM-YYYY |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If no results: `No incomplete todos found.`

## Cowork Adaptation

When running inside a Cowork session (no local filesystem access):
- **Config**: If `business-databases.yaml` content was pasted into the conversation context, parse and use it. Otherwise, ask the user for the TODOs data source ID.
- **MCP calls**: Work identically — the same Notion MCP tools are available in Cowork.

## Resilience

- If the Notion MCP fails: report with ⚠️, do NOT retry more than once.
- If owner resolution fails: create the todo without the person and note the issue.
- Never leave the user without feedback — always confirm what was created or what failed.

## Anti-patterns

- Do NOT create a todo without the user providing text — always require at least one task.
- Do NOT hardcode data source IDs or property names — always read from `business-databases.yaml`.
- Do NOT skip the default deadline — always set current date + 7 days when no deadline is given.
- Do NOT hardcode person IDs — always resolve them dynamically.
