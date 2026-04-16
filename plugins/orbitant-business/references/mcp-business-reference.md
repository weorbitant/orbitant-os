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

## HubSpot (Remote MCP Server)

- **Transport:** Claude AI HubSpot MCP integration (remote server)
- **Auth:** OAuth via Claude AI connector
- **Available tools:** `get_crm_objects`, `search_crm_objects`, `get_properties`, `get_user_details`, `search_owners`, `search_properties`, `manage_crm_objects`
- **Key object types:** deals, contacts, companies
- **Cowork:** Available — MCP works in both Claude Code and Cowork
- **Used by:** `/report` (commercial sections), `/query` (commercial questions)

### Setup

1. Connect HubSpot via Claude AI integrations (OAuth)
2. Add to `business-databases.yaml`:
   ```yaml
   sources:
     hubspot:
       type: "mcp"
       description: "Commercial pipeline data"
   ```
3. Verify with `/preflight`

---

## Airtable (MCP Server)

- **Transport:** Airtable MCP server
- **Auth:** API key or OAuth via MCP config
- **Available tools:** `list_records`, `search_records`, `list_tables`, `describe_table`, `get_record`, `list_bases`, `create_record`, `update_records`, `delete_records`
- **Cowork:** Available — MCP works in both environments
- **Used by:** `/report` (recruitment sections), `/query` (recruitment questions)

### Setup

1. Configure the Airtable MCP server in your Claude config
2. Add to `business-databases.yaml`:
   ```yaml
   sources:
     airtable:
       type: "mcp"
       description: "Recruitment pipeline data"
       # base_id: "your-airtable-base-id"  # Optional — if omitted, agent discovers via list_bases
   ```
3. Verify with `/preflight`

---

## Sherpa (Remote MCP Server)

- **Transport:** HTTP MCP at `https://app.sherpaplatform.com/api/mcp`
- **Auth:** OAuth via Claude MCP connector (user scope — no env vars, no credentials in config)
- **Available tools:** `sherpa_list_company_groups`, `sherpa_list_bank_products`, `sherpa_get_bank_liquidity`, `sherpa_get_bank_transactions`, `sherpa_get_profit_and_loss_report`
- **Cowork:** Available — MCP works in both environments
- **Used by:** `/report` (Financial sections — `cash-summary`, `pnl-summary`, and `kpi-table` KPIs with `source: sherpa`), `/query` (financial questions), `/preflight` (connectivity check)

### What Sherpa covers

- Current cash liquidity (checking accounts, portfolios, deposits, lines of credit) in EUR
- Bank transactions per checking account (paginated, ISO-date filter, `BOOKED`/`PENDING`)
- Full P&L tree for a fiscal year (monthly + YTD, with `% over revenue` for cost rows)

### What Sherpa does NOT cover (v1)

- Accounts receivable / accounts payable
- Collection effectiveness
- Future/projected balances
- Invoicing or billing events

KPIs requesting these will render as `⬜ Not supported` (not `⬜ Not connected` — the data source is up, it just doesn't expose that metric).

### Setup

1. Run `/mcp` in Claude Code and add the server URL: `https://app.sherpaplatform.com/api/mcp`
2. Complete OAuth in the browser window that opens
3. Add to `business-databases.yaml`:
   ```yaml
   sources:
     sherpa:
       type: "mcp"
       description: "Financial data — cash liquidity, P&L, bank transactions, burn & runway"
       enabled: true
       # company_group_id: "uuid"   # optional — only if more than one company group exists
   ```
4. Verify with `/preflight`

### Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Sherpa MCP not connected" | MCP server not registered | `/mcp` → add `https://app.sherpaplatform.com/api/mcp` |
| "OAuth expired" | Token expired | `/mcp` to reauthenticate |
| "No company groups visible" | Account has no group assigned | Check Sherpa web app permissions |
| Tools not visible in session | MCP added mid-session | Restart the Claude Code session — MCP tools bind at session start |

---

## Stub Sources (Not Yet Configured)

These sources are referenced in the `/query` routing table but do not have fetcher agents yet.

| Source | Pillar | Integration Path | Notes |
|--------|--------|-----------------|-------|
| MailerLite | Marketing | MailerLite API | Newsletter metrics |
| Google Analytics | Marketing | GA4 API | Website traffic |
| Spreadsheets | Operations | Google Drive MCP | Resourcing data |

To add a new live source:
1. Create a fetcher agent in `agents/`
2. Add config entry to `business-databases.yaml` → `sources`
3. Update the routing table in `commands/query.md`
4. Add a connectivity test to `commands/preflight.md`
5. Update report definitions in `reports/` to use the new source (replace stub sections)
6. Update this reference file
