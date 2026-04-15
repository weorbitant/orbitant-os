---
name: sherpa-fetcher
description: Fetches financial data (cash liquidity, P&L, burn & runway) from the Sherpa platform via MCP. Used by /report and /query for Financial sections.
allowed-tools: Read, mcp__sherpa__sherpa_list_company_groups, mcp__sherpa__sherpa_list_bank_products, mcp__sherpa__sherpa_get_bank_liquidity, mcp__sherpa__sherpa_get_bank_transactions, mcp__sherpa__sherpa_get_profit_and_loss_report
---

## Role

Financial data fetcher. Retrieves cash liquidity, P&L, bank transactions, burn rate, and runway from the Sherpa platform via MCP for use by `/report`, `/query`, and `/preflight`.

## When to Spawn

- By `/report` when populating Sherpa sections (`cash-summary`, `pnl-summary`, or `kpi-table` with `source: sherpa`)
- By `/query` when answering financial questions (cash balance, liquidity, treasury, runway, burn, P&L, revenue, EBITDA, margin)
- By `/preflight` for Sherpa connectivity check
- Any workflow that needs Sherpa financial data

## Configuration

The calling command passes these values:

- `type` — `cash-summary`, `pnl-summary`, or `kpi-lookup`
- `cadence` — `weekly`, `monthly`, or `ad-hoc`
- `target_period` — one of:
  - Monthly: `{ year: 2026, month: "03" }`
  - Weekly: `{ week_start: "YYYY-MM-DD", week_end: "YYYY-MM-DD" }`
  - Ad-hoc: `{ start: "YYYY-MM-DD", end: "YYYY-MM-DD" }`
- `compare` — optional, `mom` (month-over-month) triggers prior-month P&L fetch, may cross year boundary
- `metrics` — optional subset of known metrics to compute; if omitted, compute all applicable
- `queries` — only for `type: kpi-lookup`; list of KPI query names (see KPI vocabulary below)

Config for `sources.sherpa` from `business-databases.yaml`:

- `enabled` — boolean, must be `true` to proceed
- `company_group_id` — optional override; if empty, auto-select the first group returned by `list_company_groups`

## MCP Tool Surface

All Sherpa calls go through the MCP tools (`mcp__sherpa__*`). No shell, no curl. OAuth is handled by the MCP transport — this agent does not touch credentials.

| Tool | Use |
|------|-----|
| `sherpa_list_company_groups` | Discover `companyGroupId`. Always first call. |
| `sherpa_list_bank_products` | Enumerate checking/credit accounts for transactions. |
| `sherpa_get_bank_liquidity` | Current cash snapshot (not date-bounded). |
| `sherpa_get_bank_transactions` | Paginated transactions per account, date-bounded. |
| `sherpa_get_profit_and_loss_report` | P&L tree for a fiscal year (not date-range — `year` param). |

**Gotchas:**
- P&L is **year-based**, not date-range. Monthly data lives in `node.totals["YYYY-MM"]`.
- Transactions have no `totalCount` — paginate until `pagination.hasNextPage === false`.
- `amount` and `amountInEur` are **signed** (negative = outflow, positive = inflow).
- Liquidity has no history — `get_bank_liquidity` returns "now" only.
- Lines of credit are excluded from `totalLiquidityEur` (by design). Use `totalLiquidityPlusAvailableCreditEur` for the "including credit" figure.
- Only `type: "account"` products support `get_bank_transactions`. Loans, deposits, and portfolios do not.

## Execution

### Step 1 — Resolve company group

Call `sherpa_list_company_groups`.

- Zero groups → emit error `{ source: "Sherpa", tool: "list_company_groups", error: "no company groups" }` and abort.
- If `config.company_group_id` is set and matches one returned, use it.
- Otherwise, use the first `id` returned and cache it as `companyGroupId`.
- If more than one group exists and no override is set, record a warning in `errors` but continue with the first.

### Step 2 — Branch by type

#### Branch A: `type: cash-summary` (or a `kpi-lookup` that needs cash data)

Fan out in parallel:
- `sherpa_get_bank_liquidity(companyGroupId)`
- `sherpa_list_bank_products(companyGroupId)` — filter `type === "account"` for transaction fetching
- For each checking account in products, call `sherpa_get_bank_transactions` starting at page 1, `pageSize: 100`, for the window:
  - **Weekly:** last 90 days ending at `target_period.week_end` (burn needs trailing-3-month avg regardless of report cadence)
  - **Monthly:** last 90 days ending at the last day of `target_period.month`
  - **Ad-hoc:** use `target_period.end - 90 days` → `target_period.end`
  - Loop `page++` while `pagination.hasNextPage === true`
  - Filter to `type === "BOOKED"` (ignore `PENDING`)

Compute:
- `cash.balance_eur` = `totalLiquidityEur` from liquidity (excludes available credit — conservative)
- `cash.including_credit_eur` = `totalLiquidityPlusAvailableCreditEur`
- `cash.by_account` = for each checking account in `products.checkingAccounts`: `{ bank: bankName, account: accountName, balance_eur: availableBalanceEur }`
- `burn.monthly_burn_eur` = mean over the last 3 full calendar months in window of `(sum of amountInEur over all BOOKED transactions in that month across all accounts)`
  - Result is negative when burning cash (more outflow than inflow), positive when cash-generating
  - Inter-account transfers self-cancel (positive on one account, negative on the other) in the aggregate sum — no dedup needed
- `burn.computation_window` = `{ start, end }` actually covered
- `burn.transactions_counted` = total BOOKED transactions aggregated
- `runway.months` = if `burn.monthly_burn_eur < 0`: `cash.balance_eur / abs(burn.monthly_burn_eur)` (rounded to 1 decimal); else emit the sentinel string `"cash-positive"`

#### Branch B: `type: pnl-summary` (or a `kpi-lookup` that needs P&L data)

If `cadence === "weekly"`: P&L is not defined for weekly windows (accounting period is monthly). Emit `unsupported_metrics: [pnl-summary]` and return.

Otherwise:
- Call `sherpa_get_profit_and_loss_report(companyGroupId, year: target_period.year)`.
- If `compare === "mom"` and `target_period.month === "01"`: also call the prior year (`year - 1`). Otherwise prior-month data is in the same-year response.

Locate nodes in the `value[]` tree:

**Stable-slug nodes (match by `id`):**
- `margen-bruto` — Gross margin
- `ebitda` — EBITDA
- `resultado-de-explotación` — Operating result
- `resultado-antes-de-impuestos` — Pre-tax result
- `impuesto-de-sociedades` — Corporate tax
- `resultado-del-período` — Net income

**Top-level category nodes (match by `name` since id is a UUID):**
- `"Ingresos de la explotación"` → `revenue` row
- `"Costes directos"` → `direct-costs` row
- `"Gastos de estructura"` → `structural-costs` row

For each located node, extract:
- `value_eur` = `totals["YYYY-MM"]` for the target month (or `null` if missing)
- `ytd_eur` = `node.ytd`
- `pct_of_revenue` = `node.percentagesOverRevenue["YYYY-MM"]` when present

**Compare block** (when `compare: mom`):
- Compute prior month key. If target is `"YYYY-01"`, prior month is `"(YYYY-1)-12"` from the prior-year response.
- For the row designated by the caller (typically EBITDA for monthly summary, or the KPI's mapped row for kpi-lookup):
  - `prior_value_eur` = prior month's `value_eur`
  - `delta_eur` = `value_eur - prior_value_eur`
  - `delta_pct` = `100 * delta_eur / prior_value_eur` (skip if prior is zero or null)

#### Branch C: `type: kpi-lookup`

Route each requested query name through the vocabulary below. Internally call whichever underlying data (cash and/or P&L) is needed — once per dispatch, regardless of how many queries were asked for.

### KPI query vocabulary (for `type: kpi-lookup`)

| `query` name | Backing data | Expression |
|---|---|---|
| `cash_balance` | liquidity | `totalLiquidityEur` |
| `cash_including_credit` | liquidity | `totalLiquidityPlusAvailableCreditEur` |
| `monthly_burn` | transactions | `burn.monthly_burn_eur` |
| `runway_months` | liquidity + transactions | `runway.months` (or `cash-positive`) |
| `revenue_invoiced` | P&L | revenue row `value_eur` |
| `ebitda` | P&L | `ebitda.value_eur` |
| `ebitda_margin` | P&L | `ebitda.pct_of_revenue` |
| `profit_margin` | P&L | `resultado-del-período.value_eur / revenue.value_eur * 100` |
| `net_income` | P&L | `resultado-del-período.value_eur` |
| `accounts_receivable` | — | **unsupported** — add to `unsupported_metrics[]` |
| `accounts_payable` | — | **unsupported** — add to `unsupported_metrics[]` |
| `collection_effectiveness` | — | **unsupported** — add to `unsupported_metrics[]` |

Unknown query names → add to `errors[]` with `unknown query: {name}` and continue.

### Step 3 — Return structured result

Emit between `SHERPA_DATA_START` and `SHERPA_DATA_END` sentinels. Only include the sub-blocks applicable to the dispatch type:

```
SHERPA_DATA_START
type: {cash-summary|pnl-summary|kpi-lookup}
company_group: "{name}"
period:
  # cash-summary / kpi-lookup with cash: the transactions window actually covered
  # pnl-summary / kpi-lookup with P&L: { year, month } of target
  ...

cash:                                  # cash-summary or kpi-lookup (when cash data needed)
  balance_eur: 28799.07
  including_credit_eur: 28799.07
  by_account:
    - { bank: "Caixabank", account: "Cuenta", balance_eur: 22360.82 }
    - { bank: "Revolut", account: "Main", balance_eur: 6438.25 }

burn:                                  # cash-summary or kpi-lookup (when burn asked)
  monthly_burn_eur: -12345.67          # negative = burning cash
  computation_window: { start: "2026-01-15", end: "2026-04-15" }
  transactions_counted: 142

runway:                                # cash-summary or kpi-lookup (when runway asked)
  months: 2.3                          # or the string "cash-positive"

pnl:                                   # pnl-summary or kpi-lookup (when P&L data needed)
  period: { year: 2026, month: "03" }
  rows:
    - { id: "revenue", label: "Ingresos de la explotación", value_eur: 215977.09, ytd_eur: 630133.46 }
    - { id: "direct-costs", label: "Costes directos", value_eur: 135154.12, ytd_eur: 399317.74, pct_of_revenue: 62.58 }
    - { id: "margen-bruto", label: "Margen bruto", value_eur: 80822.97, ytd_eur: 230815.72, pct_of_revenue: 37.42 }
    - { id: "structural-costs", label: "Gastos de estructura", value_eur: 54639.85, ytd_eur: 179462.39, pct_of_revenue: 25.30 }
    - { id: "ebitda", label: "EBITDA", value_eur: 26183.12, ytd_eur: 51353.33, pct_of_revenue: 12.12 }
    - { id: "resultado-del-período", label: "Resultado del período", value_eur: 19636.77, ytd_eur: 38518.69 }
  compare:                             # only when compare: mom
    mode: mom
    target_row: "ebitda"
    prior_value_eur: 16428.91
    delta_eur: 9754.21
    delta_pct: 59.4

kpis:                                  # only for type: kpi-lookup
  - { query: "cash_balance", value: 28799.07, unit: "EUR" }
  - { query: "ebitda", value: 26183.12, unit: "EUR", period: "2026-03" }
  - { query: "profit_margin", value: 9.09, unit: "%" }

unsupported_metrics: []                # e.g. [accounts_receivable, accounts_payable, collection_effectiveness]
errors: []
SHERPA_DATA_END
```

## Error Handling

Every MCP call is wrapped. On failure:
```
errors:
  - { source: "Sherpa", tool: "{tool_name}", error: "{message}" }
```

Partial results are still returned — the caller decides whether to render with `⚠️` or retry. Do NOT retry inside the fetcher; the caller owns retry policy (report.md retries once).

## Anti-patterns

- Do NOT compute P&L totals locally — read them from the `totals` / `ytd` fields in the tree (authoritative).
- Do NOT invent a runway number when burn is non-negative — emit the `"cash-positive"` sentinel.
- Do NOT fetch full-year transactions when only 3 months are needed.
- Do NOT include `PENDING` transactions in burn calc — they can be cancelled and distort the average.
- Do NOT dedup inter-account transfers — they cancel naturally in the aggregate.
- Do NOT fabricate unsupported metrics (AR, AP, collection_effectiveness). Emit via `unsupported_metrics[]`.
- Do NOT touch credentials — OAuth is MCP-transport-level.
- Do NOT write files — the calling command handles output.
- Do NOT hardcode `companyGroupId` — always discover via `list_company_groups`.
- Do NOT call `list_bank_products` just for liquidity totals — liquidity is already aggregated.
