---
name: preflight
description: System readiness check — tests MCP connections, validates config files, reports pass/fail with fix instructions.
---

## Overview

This is the first command to run after installing the chief-of-staff plugin. It performs a full system readiness check — MCP connections, config file validation, and directory structure — then reports a pass/fail checklist with actionable fix instructions for every failure. Re-run it after any configuration change to confirm everything is wired up correctly.

## What This Command Does

Execute these steps in order:

1. **Invoke the `orbitant-graceful-degradation` skill** to probe all MCP servers and detect config file presence. This gives the baseline availability map.
2. **Go deeper on config files** — parse each file and validate its internal structure, not just its existence:
   - `rocks.yaml` — YAML must parse cleanly; `rocks` array must exist; weights across all rocks must sum to approximately 1.0 (tolerance: 0.99-1.01).
   - `voice.md` — Must contain these required sections as H2 headings: "General Tone", "Formality Levels", "Length Preferences".
   - `constraints.yaml` — YAML must parse cleanly; must contain required top-level fields: `timezone`, `work_hours`, `hard_stops`, `meetings`.
   - `contacts/` — Directory must exist and contain at least one `.md` file.
3. **Compile the preflight checklist** using the output format below.

## MCP Connection Tests

For each server, attempt a lightweight API call. Report one of three states: connected, authentication error, or not configured.

### Gmail

- Call `mcp__gmail__search_emails` with `query: "newer_than:1d"`, `max_results: 1`.
- On success: report "connected (inbox accessible)".
- On failure: report the error category and provide the setup command.
- Fix: `claude mcp add gmail -s user -- npx @anthropic/gmail`

### Google Calendar

- Call `mcp__calendar__list_events` for today's date range.
- On success: report "connected (N events today)".
- On failure: report the error category and provide the setup command.
- Fix: `claude mcp add calendar -s user -- npx @anthropic/google-calendar`

### Slack

- Call `mcp__claude_ai_Slack__slack_search_channels` with query `"general"`.
- On success: report "connected".
- On failure: report the error category and provide the setup command.
- Fix: `claude mcp add slack -s user -- npx @anthropic/slack`

### Asana

- Call `mcp__asana__asana_list_workspaces`.
- On success: report "connected (N workspaces)".
- On failure: mark as optional and provide the setup command.
- Fix: `claude mcp add asana -s user -- npx @anthropic/asana`

## Config File Validation

For each config, check two locations in order (`./path` then `~/.claude/path`). Use the first match.

### rocks.yaml

- Exists? Read and attempt YAML parse.
- Validate: `rocks` array present, each rock has `name`, `weight`, `status`, and `key_results`. Weights sum to ~1.0.
- On failure: `cp plugins/orbitant-chief-of-staff/references/rocks.example.yaml ./rocks.yaml`

### voice.md

- Exists? Read and check for required H2 headings.
- Validate: "General Tone", "Formality Levels", and "Length Preferences" sections present.
- On failure: `cp plugins/orbitant-chief-of-staff/references/voice.example.md ./voice.md`

### constraints.yaml

- Exists? Read and attempt YAML parse.
- Validate: top-level keys `timezone`, `work_hours`, `hard_stops`, `meetings` all present.
- On failure: `cp plugins/orbitant-chief-of-staff/references/constraints.example.yaml ./constraints.yaml`

### contacts/

- Directory exists? Contains at least one `.md` file?
- On failure: `mkdir -p ./contacts && cp plugins/orbitant-chief-of-staff/crm/contact.example.md ./contacts/example.md`

## Output Format

Print the checklist using this structure. Adjust icons and details based on actual results.

```
# Chief of Staff — Preflight Check

## MCP Servers
- Gmail — connected (inbox accessible)
- Google Calendar — connected (3 events today)
- Slack — not configured
   -> Run: claude mcp add slack -s user -- npx @anthropic/slack
- Asana — not configured (optional)
   -> Run: claude mcp add asana -s user -- npx @anthropic/asana

## Config Files
- rocks.yaml — valid (4 rocks, weights sum to 1.0)
- voice.md — not found
   -> Run: cp plugins/orbitant-chief-of-staff/references/voice.example.md ./voice.md
- constraints.yaml — valid (timezone: America/New_York)
- contacts/ — empty (0 contact files)
   -> Run: mkdir -p ./contacts && cp plugins/orbitant-chief-of-staff/crm/contact.example.md ./contacts/example.md

## Summary
Ready: N/8 checks passed
Action needed: N items require attention (see above)

Run /orbitant-chief-of-staff:status to see your operational dashboard.
```

Use status icons in actual output: checkmark for pass, cross for required-but-failing, warning for optional-but-missing. For every failing item, include the fix command indented below it.

## Cowork Adaptation

When running inside a Cowork session (no local filesystem access):

- Skip all filesystem checks for config files. MCP connection tests work identically.
- Instead of checking files on disk, check whether rocks, voice, constraints, or contact data has been pasted into the conversation context.
- Mark filesystem configs as "not checked (Cowork mode)" with a warning icon rather than a cross.
- Print this notice at the top of the checklist: "Running in Cowork mode — config file checks skipped. Ensure your rocks, voice, and constraints are available in your project context."

## After Preflight

Once the checklist is printed, suggest these next steps:

1. Fix any failing items using the provided commands.
2. Re-run `/orbitant-chief-of-staff:preflight` to confirm fixes.
3. Run `/orbitant-chief-of-staff:status` for the operational health dashboard.
4. Start using `/orbitant-chief-of-staff:today` for daily briefings.
