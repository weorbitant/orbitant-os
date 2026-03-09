# MCP Business Reference

Data source integration details for the orbitant-business plugin. Used by fetcher agents and commands.

---

## Factorial (Direct API — No MCP)

- **Transport:** Direct HTTP calls via curl (no MCP server exists for Factorial)
- **Base URL:** `https://api.factorialhr.com/api/{api_version}/resources`
- **Default API version:** `2025-01-01`
- **Auth:** API Key sent as header `x-api-key` (stored in env var, name configured in `business-databases.yaml` → `sources.factorial.auth_env_var`)
- **Rate limits:** 200 req/min
- **API version note:** Uses date-versioned paths (`/api/2025-01-01/`). Old `/api/v1/` and `/api/v2/` paths return 404.
- **Key endpoints:**
  - `GET /employees/employees` — employee list and headcount
  - `GET /timeoff/leaves` — leave records (100 per page)
  - `GET /timeoff/leave_types` — leave type definitions (auto-discovery)
- **Shell note:** Must `source ~/.zshrc` (or equivalent) before curl commands to load the env var
- **Cowork:** NOT available — requires Bash for curl. Use Claude Code (desktop).

### Setup

1. Get an API key from your Factorial admin panel (Settings → API Keys)
2. Add to your shell profile: `export FACTORIAL_API_KEY="your-key-here"`
3. Add to `business-databases.yaml`:
   ```yaml
   sources:
     factorial:
       auth_env_var: "FACTORIAL_API_KEY"
   ```
4. Restart your Claude Code session
5. Verify with `/preflight`

### Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| HTTP 401 | Invalid or expired API key | Regenerate key in Factorial admin, update env var |
| HTTP 404 | Wrong API version path | Ensure `api_version` is a date like `2025-01-01`, not `v1`/`v2` |
| Connection timeout | Network/VPN issue | Check internet connectivity, try `curl -v` for details |
| Empty employee list | API key has insufficient permissions | Ensure the key has read access to employees and time off |

---

## Stub Sources (Not Yet Configured)

These sources are referenced in the `/query` routing table but do not have fetcher agents yet.

| Source | Pillar | Integration Path | Notes |
|--------|--------|-----------------|-------|
| HubSpot | Commercial | HubSpot Remote MCP Server | Sales pipeline, deals, proposals |
| Airtable | HR — Recruitment | Airtable MCP (`airtable-mcp-server`) | Candidate tracking |
| Holded | Financial | Holded REST API | P&L, balance sheet, cash flow |
| MailerLite | Marketing | MailerLite API | Newsletter metrics |
| Google Analytics | Marketing | GA4 API | Website traffic |
| Spreadsheets | Operations | Google Drive MCP | Resourcing data |

To add a new live source:
1. Create a fetcher agent in `agents/`
2. Add config entry to `business-databases.yaml` → `sources`
3. Update the routing table in `commands/query.md`
4. Add a connectivity test to `commands/preflight.md`
5. Update this reference file
