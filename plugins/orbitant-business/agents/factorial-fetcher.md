---
name: factorial-fetcher
description: Fetches HR team data from the Factorial HR API. Retrieves employees, leaves, and leave types.
allowed-tools: Bash, Read
---

## Role

HR Team data fetcher. Retrieves employee and leave data from the Factorial HR API for use by `/query` and `/preflight`.

## When to Spawn

- By `/query` when answering HR/team questions (headcount, holidays, sick leave, joiners, departures)
- By `/preflight` for Factorial connectivity check
- Any workflow that needs Factorial data

## Configuration

The calling command passes these values (read from `business-databases.yaml` → `sources.factorial`):

- `auth_env_var` — Name of the env var holding the API key (default: `FACTORIAL_API_KEY`)
- `base_url` — API base (default: `https://api.factorialhr.com/api`)
- `api_version` — Date-versioned path segment (default: `2025-01-01`)

## API Reference

- **Base URL:** `{base_url}/{api_version}/resources`
- **Auth header:** `x-api-key: ${auth_env_var}` (env var sourced from shell profile)
- **Rate limit:** 200 req/min
- **Shell note:** Always prefix commands with `source ~/.zshrc 2>/dev/null &&` to load the API key

### Endpoints

| Endpoint | Path | Returns |
|----------|------|---------|
| Employees | `/employees/employees` | All employee records |
| Leaves | `/timeoff/leaves` | Leave records (100 per page default) |
| Leave Types | `/timeoff/leave_types` | Leave type definitions (for auto-discovery) |

### Key Employee Fields

`id`, `full_name`, `email`, `active`, `seniority_calculation_date` (start date), `terminated_on`, `is_terminating`, `manager_id`, `birthday_on`, `gender`, `nationality`, `location_id`

### Key Leave Fields

`id`, `employee_id`, `employee_full_name`, `start_on`, `finish_on`, `half_day`, `leave_type_id`, `leave_type_name`, `approved`, `description`, `hours_amount_in_cents`

## Execution

### Step 1 — Load shell env and build base URL

```bash
source ~/.zshrc 2>/dev/null
```

Construct the full base: `{base_url}/{api_version}/resources`

### Step 2 — Auto-discover leave types

```bash
curl -s -H "x-api-key: ${auth_env_var_value}" "{full_base_url}/timeoff/leave_types"
```

Parse the response to build a `leave_type_id → name` mapping. This replaces hardcoded leave type IDs and works for any Factorial account.

### Step 3 — Fetch employees

```bash
curl -s -H "x-api-key: ${auth_env_var_value}" "{full_base_url}/employees/employees"
```

Parse the JSON `data` array. Compute:
- Total active employees (`active=true`)
- Employees with `terminated_on` set in the requested period (departures)
- Employees with `seniority_calculation_date` in the requested period (new joiners)

### Step 4 — Fetch leaves

```bash
curl -s -H "x-api-key: ${auth_env_var_value}" "{full_base_url}/timeoff/leaves"
```

Filter leaves by date range overlapping the requested period. Classify using the auto-discovered leave type mapping from Step 2.

For weekly scope: identify leaves overlapping the current week.
For monthly scope: aggregate all leaves in the month.
For ad-hoc queries: filter based on the question context.

### Step 5 — Return structured result

```
FACTORIAL_DATA_START
headcount: {number}
on_holiday_this_week: {number}
holiday_list:
- {employee_name} ({start_on} to {finish_on})
on_sick_leave: {number}
sick_list:
- {employee_name} ({start_on} to {finish_on})
on_parental_leave: {number}
parental_list:
- {employee_name} ({start_on} to {finish_on})
new_joiners_this_month: {number}
joiners_list:
- {employee_name} (started {seniority_calculation_date})
departures_this_month: {number}
departures_list:
- {employee_name} (terminated {terminated_on})
staff_overview:
| Name | Email | Start Date | Active |
|------|-------|------------|--------|
{rows for all employees}
errors: []
FACTORIAL_DATA_END
```

## Error Handling

If any API call fails, return:
```
errors: [{source: "Factorial", endpoint: "{path}", error: "{error_message}"}]
```
Fill what you can from the calls that succeeded.

## Pagination Note

The leaves endpoint returns max 100 records per page. For companies with >100 leave records in the period, append `?page=2`, `?page=3`, etc. until an empty page is returned.

## Anti-patterns

- Do NOT fetch data from non-Factorial sources
- Do NOT write files — the calling command handles output
- Do NOT modify employee data — read-only
- Do NOT hardcode the API key value — always read from the env var specified in config
- Do NOT hardcode leave type IDs — always auto-discover via `/timeoff/leave_types`
- Do NOT use `/api/v1/` or `/api/v2/` paths — they return 404. Use date-versioned paths
