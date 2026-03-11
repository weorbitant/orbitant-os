---
name: preflight
description: Health check for business data sources. Tests API connectivity, validates config, reports pass/fail with fix instructions.
---

## Overview

Run before using `/query` or `/report` to verify that data sources are configured and reachable. Checks config files, tests live API connections, and lists stub sources.

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
3. Parse the file. Validate YAML structure. Check for `databases` and `sources` sections.

## Execution

### Phase 1 — Config Validation

Check that `business-databases.yaml` has valid structure:

- **databases section**: Exists and contains at least one database entry with `data_source_id`
- **sources section**: Exists (warn if missing — means no external data sources configured)
- **sources.factorial**: If present, has `auth_env_var` field

Report:
- ✅ Valid — `N databases configured, M sources configured`
- ⚠️ Partial — describe what's missing
- ❌ Invalid YAML — show parse error

### Phase 2 — Live Source Tests

For each configured source in `sources:`, run a minimal connectivity test.

#### Factorial

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

### Phase 3 — Notion MCP Check

Test Notion connectivity (used by management commands):

1. Attempt a lightweight Notion MCP call (e.g., `notion-search` with a simple query)
2. Report:
   - ✅ Connected — Notion MCP responding
   - ❌ Not available — provide setup guidance

### Phase 4 — Stub Sources

List all sources that are NOT configured in `business-databases.yaml` but exist in the routing table:

| Pillar | Source | Status |
|--------|--------|--------|
| Commercial | HubSpot | ⏳ Not configured |
| HR — Recruitment | Airtable | ⏳ Not configured |
| Financial | — | ⏳ Not configured |
| Marketing | — | ⏳ Not configured |
| Operations | — | ⏳ Not configured |

If a source IS configured in `business-databases.yaml`, move it to Phase 2 and test it.

## Output Format

```
BUSINESS PREFLIGHT — DD-MM-YYYY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Config:
  business-databases.yaml    ✅ / ⚠️ / ❌  (details)

Live Sources:
  Factorial (HR Team)        ✅ / ⚠️ / ❌  (details)

Integrations:
  Notion MCP                 ✅ / ❌  (details)

Stub Sources:
  HubSpot (Commercial)       ⏳ Not configured
  Airtable (Recruitment)     ⏳ Not configured
  Financial                  ⏳ Not configured
  Marketing                  ⏳ Not configured
  Operations                 ⏳ Not configured

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Summary: N/M checks passed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

If all live sources pass: "Ready to query. Try: `/query \"How many employees do we have?\"`"
If any fail: list what's broken and the fix command for each.

## Recovery Steps

If a source fails, attempt ONE fix:

- **Factorial 401:** Suggest checking API key validity and env var
- **Factorial timeout:** Suggest checking network / VPN
- **Notion MCP:** Suggest verifying MCP server is configured

If the fix doesn't work, report failure and continue with remaining checks.

## Cowork Adaptation

When running inside a Cowork session (no local filesystem access):
- Skip filesystem config checks. Check if config was pasted into conversation context.
- Skip Factorial connectivity test (requires Bash).
- Notion MCP test works identically.
- Print notice: "Running in Cowork mode — Factorial check skipped (requires Bash). Notion checks available."

## Anti-patterns

- Do NOT skip checks if config is partial — always report what's missing
- Do NOT retry failed connections more than once
- Do NOT report stubs as failures — they are expected "not yet configured" items
- Do NOT hardcode API URLs or env var names — read from config
