---
name: preflight
description: Operations readiness check — tests MCP connections, validates config files, tests business data sources, reports pass/fail with fix instructions.
---

## Overview

This is the first command to run after installing the operations plugin. It performs a full readiness check across two surfaces:

1. **Chief-of-staff surface** — MCP connections (Gmail, Calendar, Slack, Asana), config files (`rocks.yaml`, `voice.md`, `constraints.yaml`, `contacts/`).
2. **Business surface** — `business-databases.yaml` config and live data sources (Notion, Factorial HR, Sherpa, HubSpot, Airtable).

It reports a pass/fail checklist with actionable fix instructions for every failure. Re-run after any configuration change.

## Step 0 — Load Business Configuration

1. Read `business-databases.yaml` using dual-path lookup:
   - First try `./business-databases.yaml` (relative to plugin root)
   - Then try `~/.claude/business-databases.yaml`
2. If neither exists, mark the business surface as "not configured" and continue with chief-of-staff checks (the business config is optional if the user is only using staff-side commands).
3. If found, parse the file. Validate YAML structure. Check for `databases` and `sources` sections.

## Execution Order

Run in this sequence:

1. **Chief-of-staff baseline** — invoke the `orbitant-graceful-degradation` skill to probe all MCP servers and detect config file presence.
2. **Chief-of-staff config validation** — parse and validate each config file's internal structure.
3. **Business config validation** — validate `business-databases.yaml` structure.
4. **MCP connection tests** — Gmail, Calendar, Slack, Asana (chief-of-staff) and Notion (business).
5. **Live business source tests** — Factorial, Sherpa.
6. **Stub source listing** — sources known but not configured.
7. **Compile checklist** using the output format below.

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

### Notion

- Attempt a lightweight Notion MCP call (e.g., `notion-search` with a simple query).
- On success: report "connected".
- On failure: provide setup guidance.

## Config File Validation — Chief-of-staff

For each config, check two locations in order (`./path` then `~/.claude/path`). Use the first match.

### rocks.yaml

- Exists? Read and attempt YAML parse.
- Validate: `rocks` array present, each rock has `name`, `weight`, `status`, and `key_results`. Weights sum to ~1.0 (tolerance: 0.99–1.01).
- On failure: `cp plugins/orbitant-operations/references/rocks.example.yaml ./rocks.yaml`

### voice.md

- Exists? Read and check for required H2 headings.
- Validate: "General Tone", "Formality Levels", and "Length Preferences" sections present.
- On failure: `cp plugins/orbitant-operations/references/voice.example.md ./voice.md`

### constraints.yaml

- Exists? Read and attempt YAML parse.
- Validate: top-level keys `timezone`, `work_hours`, `hard_stops`, `meetings` all present.
- On failure: `cp plugins/orbitant-operations/references/constraints.example.yaml ./constraints.yaml`

### contacts/

- Directory exists? Contains at least one `.md` file?
- On failure: `mkdir -p ./contacts && cp plugins/orbitant-operations/crm/contact.example.md ./contacts/example.md`

## Config File Validation — Business

Check that `business-databases.yaml` has valid structure:

- **databases section**: Exists and contains at least one database entry with `data_source_id`
- **sources section**: Exists (warn if missing — means no external data sources configured)
- **sources.factorial**: If present, has `auth_env_var` field

Report:
- ✅ Valid — `N databases configured, M sources configured`
- ⚠️ Partial — describe what's missing
- ❌ Invalid YAML — show parse error

## Live Business Source Tests

For each configured source in `sources:`, run a minimal connectivity test.

### Factorial

If `sources.factorial` is configured:

1. Load shell env: `source ~/.zshrc 2>/dev/null`
2. Read the env var name from `sources.factorial.auth_env_var` (default: `FACTORIAL_API_KEY`)
3. Check env var is set: `echo ${!auth_env_var:+SET}`
4. If set, test connectivity:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" \
     -H "x-api-key: $FACTORIAL_API_KEY" \
     "{base_url}/{api_version}/resources/employees/employees"
   ```
5. Report:
   - ✅ Connected (HTTP 200)
   - ⚠️ Authentication error (HTTP 401) → "Check your API key. Verify `$FACTORIAL_API_KEY` is set in `~/.zshrc` and the key is still valid in Factorial admin panel."
   - ❌ Unreachable (other HTTP code or timeout) → "API not reachable. Check network and base URL."
   - ❌ Env var not set → "Environment variable `{auth_env_var}` not found. Add it to `~/.zshrc`: `export FACTORIAL_API_KEY=\"your-key-here\"`"

### Sherpa

If `sources.sherpa.enabled` is `true`:

1. Call the Sherpa MCP tool `mcp__sherpa__sherpa_list_company_groups` (no shell, no env vars — OAuth is at the MCP-connector level).
2. Report:
   - ✅ Connected — at least one company group returned
   - ⚠️ Authenticated but empty — "Connected, but no company groups visible for this user. Check Sherpa account permissions."
   - ❌ Tool not available / MCP not reachable → "Sherpa MCP not connected. Run `/mcp` and add `https://app.sherpaplatform.com/api/mcp`, then complete OAuth."
   - ❌ OAuth expired → "Sherpa MCP authentication expired. Run `/mcp` to reauthenticate."

## Stub Sources

List all sources that are NOT configured in `business-databases.yaml` but exist in the routing table:

| Pillar | Source | Status |
|--------|--------|--------|
| Commercial | HubSpot | ⏳ Not configured |
| HR — Recruitment | Airtable | ⏳ Not configured |
| Financial | Sherpa | ⏳ Not configured (if `sources.sherpa.enabled` is not `true`) |
| Marketing | — | ⏳ Not configured |
| Operations | — | ⏳ Not configured |

If a source IS configured in `business-databases.yaml`, move it to "Live Sources" and test it.

## Output Format

```
OPERATIONS PREFLIGHT — DD-MM-YYYY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MCP Servers:
  Gmail                       ✅ / ⚠️ / ❌  (details)
  Google Calendar             ✅ / ⚠️ / ❌  (details)
  Slack                       ✅ / ⚠️ / ❌  (details)
  Asana                       ✅ / ⚠️ / ❌  (details)
  Notion                      ✅ / ❌  (details)

Chief-of-staff Configs:
  rocks.yaml                  ✅ / ❌  (details)
  voice.md                    ✅ / ❌  (details)
  constraints.yaml            ✅ / ❌  (details)
  contacts/                   ✅ / ❌  (details)

Business Config:
  business-databases.yaml     ✅ / ⚠️ / ❌  (details)

Live Business Sources:
  Factorial (HR Team)         ✅ / ⚠️ / ❌  (details)
  Sherpa (Financial)          ✅ / ⚠️ / ❌  (details)

Stub Sources:
  HubSpot (Commercial)        ⏳ Not configured
  Airtable (Recruitment)      ⏳ Not configured
  Marketing                   ⏳ Not configured
  Operations                  ⏳ Not configured

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary: N/M checks passed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Use status icons in actual output: checkmark for pass, cross for required-but-failing, warning for optional-but-missing. For every failing item, include the fix command indented below it.

If all live sources pass: "Ready to go. Try: `/orbitant-operations:status` for the operational dashboard, or `/orbitant-operations:query \"How many employees do we have?\"`"
If any fail: list what's broken and the fix command for each.

## Recovery Steps

If a source fails, attempt ONE fix:

- **MCP "not configured":** Suggest running the `claude mcp add` command shown
- **MCP "authentication error":** Suggest removing and re-adding the MCP server, re-authenticating
- **Factorial 401:** Suggest checking API key validity and env var
- **Factorial timeout:** Suggest checking network / VPN
- **Sherpa not connected:** Suggest `/mcp` → add `https://app.sherpaplatform.com/api/mcp` → complete OAuth
- **Sherpa OAuth expired:** Suggest `/mcp` to reauthenticate
- **Notion MCP:** Suggest verifying MCP server is configured

If the fix doesn't work, report failure and continue with remaining checks.

## Cowork Adaptation

When running inside a Cowork session (no local filesystem access):

- Skip filesystem config checks. Mark filesystem configs as "not checked (Cowork mode)" with a warning icon rather than a cross.
- Check whether config data has been pasted into the conversation context.
- Skip Factorial connectivity test (requires Bash).
- Sherpa MCP test works identically (it's MCP-based, not Bash).
- Notion, Gmail, Calendar, Slack, Asana MCP tests work identically.
- Print notice at the top: "Running in Cowork mode — filesystem config checks skipped, Factorial check skipped (requires Bash). MCP-based checks available."

## After Preflight

Once the checklist is printed, suggest these next steps:

1. Fix any failing items using the provided commands.
2. Re-run `/orbitant-operations:preflight` to confirm fixes.
3. Run `/orbitant-operations:status` for the operational health dashboard.
4. Start using `/orbitant-operations:today` for daily briefings.

## Anti-patterns

- Do NOT skip checks if config is partial — always report what's missing
- Do NOT retry failed connections more than once
- Do NOT report stubs as failures — they are expected "not yet configured" items
- Do NOT hardcode API URLs or env var names — read from config
