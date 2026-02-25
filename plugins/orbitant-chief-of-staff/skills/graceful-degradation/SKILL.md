---
name: orbitant-graceful-degradation
description: |
  Checks MCP servers and config files before any chief-of-staff command. Ensures no command
  hard-fails — always proceeds with available sources. Auto-activates on every command.
version: "1.0.0"
license: MIT
user-invocable: false
metadata:
  author: orbitant
  tags: chief-of-staff, infrastructure, mcp, availability, degradation
---

## Overview

This skill runs a quick availability sweep before any chief-of-staff command executes. It probes each MCP server and config file, builds a summary report, and hands control back to the calling command with a clear picture of what is and is not available. The goal is simple: no command should ever hard-fail because a dependency is missing — it should degrade gracefully and work with whatever is reachable.

## When This Skill Activates

Auto-activate this skill at the start of every chief-of-staff command:

- `/preflight` — morning readiness check
- `/today` — daily agenda briefing
- `/triage` — inbox and notification triage
- `/week` — weekly planning and review
- `/prep` — meeting preparation
- `/crm` — contact and relationship management
- `/status` — project status rollup

Run the checks silently. Only surface the full availability report if something is missing. If everything is green, emit a single collapsed summary line and move on.

## MCP Server Checks

Probe each server with the lightest possible call. If the call returns data, the server is up. If it throws an error or times out, mark it accordingly.

### Gmail

- **Tool**: `mcp__gmail__search_emails` — search for 1 recent email (`query: "newer_than:1d"`, `max_results: 1`)
- **Success**: Returns at least an empty result set without error
- **Failure**: Tool call throws or is not available in the tool list
- **Status when missing**: Required (❌) — most commands depend on email data

### Google Calendar

- **Tool**: `mcp__calendar__list_events` — list today's events
- **Success**: Returns an event list (possibly empty) without error
- **Failure**: Tool call throws or is not available
- **Status when missing**: Required (❌) — scheduling commands need calendar access

### Slack

- **Tool**: `mcp__claude_ai_Slack__slack_search_channels` — search for any channel (query: `"general"`)
- **Success**: Returns results without error
- **Failure**: Tool call throws or is not available
- **Status when missing**: Required (❌) for /triage and /today; optional (⚠️) for others

### Asana

- **Tool**: `mcp__asana__asana_list_workspaces` — list available workspaces
- **Success**: Returns workspace list without error
- **Failure**: Tool call throws or is not available
- **Status when missing**: Optional (⚠️) — commands can run without task data

## Config File Checks

For each config file, check two locations in order. Use the first one found.

### rocks.yaml

1. `./rocks.yaml` (project root)
2. `~/.claude/rocks.yaml` (global)
- **Contains**: Quarterly rocks, goals, and priorities
- **Status when missing**: Optional (⚠️) — commands work but lose priority context

### voice.md

1. `./voice.md` (project root)
2. `~/.claude/voice.md` (global)
- **Contains**: Writing tone and communication style rules
- **Status when missing**: Optional (⚠️) — output will use default tone

### constraints.yaml

1. `./constraints.yaml` (project root)
2. `~/.claude/constraints.yaml` (global)
- **Contains**: Scheduling rules, blocked hours, preferences
- **Status when missing**: Required (❌) for /prep and /week; optional for others

### contacts/

- Look for `./contacts/*.md` files
- **Contains**: Key contact profiles and relationship notes
- **Status when missing**: Optional (⚠️) — CRM features degrade but other commands work

## Output Format

Build the report using this exact structure. Adjust status icons per the rules above.

```
## System Availability

### MCP Servers
- ✅ Gmail — connected
- ❌ Google Calendar — not available (run: claude mcp add calendar -s user -- npx @anthropic/google-calendar)
- ✅ Slack — connected
- ⚠️ Asana — not configured (optional)

### Config Files
- ✅ rocks.yaml — loaded from ./rocks.yaml
- ❌ voice.md — not found (copy from references/voice.example.md)
- ✅ constraints.yaml — loaded from ~/.claude/constraints.yaml
- ⚠️ contacts/ — no contact files found (optional)

### Summary
Available: 4/6 required, 1/2 optional
```

For every ❌ item, include a concrete fix instruction in parentheses — a command to run or a file to create. Never leave a required-missing item without a remediation hint.

## Cowork Adaptation

When running inside a Cowork session (no local filesystem access):

- **Skip filesystem checks** for config files entirely. Instead, check whether rocks, voice, constraints, or contact data has been pasted into the conversation context.
- **MCP checks work identically** — the same tool calls are available in Cowork.
- Mark filesystem configs as "⚠️ not checked (Cowork mode)" rather than ❌ if you cannot verify them.

## Key Rules

1. **NEVER hard-fail.** If every single dependency is down, still proceed and tell the calling command what is available (even if the answer is "nothing"). The calling command decides whether to abort.
2. **Use the correct icon**: ✅ available, ❌ required-but-missing, ⚠️ optional-but-missing.
3. **Include fix instructions** for every ❌ item. Be specific — exact commands, exact file paths.
4. **Be fast.** Run all MCP probes in parallel when possible. Do not wait for one before starting the next.
5. **Report, don't decide.** This skill produces the availability report. The calling command decides how to adapt. Do not alter the behavior of the calling command from inside this skill.
6. **Collapse when green.** If everything is available, do not print the full report. Emit one line: "All systems available (4 MCP servers, 4 config files)" and continue.
7. **Cache within session.** If this skill has already run in the current conversation and no errors were detected, skip re-probing for subsequent commands. Re-probe only if a previous run found missing dependencies.
