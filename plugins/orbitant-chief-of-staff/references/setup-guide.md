# Setup Guide -- orbitant-chief-of-staff

Complete walkthrough for installing and configuring the chief-of-staff plugin. Assumes you are starting from scratch.

## Prerequisites

Before you begin, ensure you have:

- **Claude Code CLI** installed and authenticated (`claude --version` to verify)
- **Node.js 18+** (`node --version` to verify)
- Active accounts for the services you want to connect:
  - Google account (Gmail + Calendar)
  - Slack workspace membership
  - Asana account (optional -- the plugin degrades gracefully without it)

## Installation

### Step 1: Add the marketplace

```bash
claude plugin marketplace add weorbitant/orbitant-os
```

### Step 2: Install the plugin

```bash
claude plugin install orbitant-chief-of-staff
```

### Step 3: Verify

Run the preflight command to confirm the plugin is recognized:

```bash
/orbitant-chief-of-staff:preflight
```

If the command is not found, restart your Claude Code session and try again. Plugin registration sometimes requires a fresh session.

## MCP Server Setup

Each MCP server connects the plugin to an external service. Add only the ones you use -- the plugin adapts to whatever is available.

### Gmail

```bash
claude mcp add gmail -s user -- npx @anthropic/gmail
```

- **Scopes needed:** read-only inbox access (OAuth consent screen will prompt)
- **Verify:** After adding, restart your session and run `/orbitant-chief-of-staff:preflight`. The Gmail check should report "connected (inbox accessible)".

#### Multi-account setup

If you have separate work and personal Gmail accounts, register them under distinct names:

```bash
claude mcp add gmail-work -s user -- npx @anthropic/gmail
claude mcp add gmail-personal -s user -- npx @anthropic/gmail
```

Each `add` command triggers its own OAuth flow. Authenticate with the appropriate Google account in each browser prompt. The plugin will probe all registered Gmail servers during preflight.

### Google Calendar

```bash
claude mcp add calendar -s user -- npx @anthropic/google-calendar
```

- **Scopes needed:** read-only calendar access
- **Verify:** Preflight should report "connected (N events today)".

### Slack

```bash
claude mcp add slack -s user -- npx @anthropic/slack
```

- **Scopes needed:** `channels:history`, `channels:read`, `groups:history` (for private channels), `search:read`
- **Verify:** Preflight should report "connected". If you get permission errors on private channels, confirm the bot has been added to those channels and that `groups:history` is granted.

### Asana

```bash
claude mcp add asana -s user -- npx @anthropic/asana
```

- **Scopes needed:** read-only task and workspace access
- **Verify:** Preflight should report "connected (N workspaces)".
- Asana is optional. If not configured, task-related features are skipped without errors.

## Configuration

The plugin uses four config files. Each has a template in the `references/` or `crm/` directory. Copy each template to your project root (or `~/.claude/` for global use), then edit with your real data.

The plugin checks both locations in order: `./filename` first, then `~/.claude/filename`.

### rocks.yaml -- Quarterly Objectives

```bash
cp plugins/orbitant-chief-of-staff/references/rocks.example.yaml ./rocks.yaml
```

Open `rocks.yaml` and replace the demo data:

1. Set `quarter`, `company`, `owner`, and `last_updated` to your values.
2. Replace the example rocks with your actual quarterly objectives.
3. Ensure all rock weights sum to exactly 1.0.
4. Each rock needs a `name`, `description`, `weight`, `status`, and exactly 3 `key_results`.
5. Key result `progress` is a float from 0.0 to 1.0.

### voice.md -- Writing Style

```bash
cp plugins/orbitant-chief-of-staff/references/voice.example.md ./voice.md
```

Edit `voice.md` to reflect your communication style. The file must contain these required H2 sections:

- `## General Tone`
- `## Formality Levels`
- `## Length Preferences`

Additional sections (phrases, signature) are optional but recommended.

### constraints.yaml -- Scheduling Boundaries

```bash
cp plugins/orbitant-chief-of-staff/references/constraints.example.yaml ./constraints.yaml
```

Edit `constraints.yaml` with your actual schedule:

1. Set your `timezone` (IANA format, e.g., `America/Chicago`).
2. Adjust `work_hours` start and end times.
3. Define your `hard_stops` -- non-negotiable blocks that must never be scheduled over.
4. Set `meetings` preferences: max per day, buffer between meetings, preferred days.

### contacts/ -- CRM Contact Files

```bash
mkdir -p ./contacts
cp plugins/orbitant-chief-of-staff/crm/contact.example.md ./contacts/example.md
```

Create one `.md` file per contact using kebab-case filenames (e.g., `jane-smith.md`). Each file has YAML frontmatter with fields like `name`, `tier`, `email`, `last_interaction`, and `staleness_days`, followed by freeform relationship context and notes.

Remove or rename the example file once you have added real contacts.

## Verification

After completing all configuration steps, run the full preflight check:

```
/orbitant-chief-of-staff:preflight
```

A healthy setup produces output like:

```
# Chief of Staff -- Preflight Check

## MCP Servers
- Gmail -- connected (inbox accessible)
- Google Calendar -- connected (3 events today)
- Slack -- connected
- Asana -- connected (1 workspace)

## Config Files
- rocks.yaml -- valid (4 rocks, weights sum to 1.0)
- voice.md -- valid (3 required sections found)
- constraints.yaml -- valid (timezone: America/New_York)
- contacts/ -- valid (5 contact files)

## Summary
Ready: 8/8 checks passed
```

If any items fail, preflight prints the exact fix command below each failure. Run the fix, then re-run preflight until everything passes.

### Common preflight failures

| Failure | Cause | Fix |
|---------|-------|-----|
| MCP "not configured" | Server not added | Run the `claude mcp add` command shown |
| MCP "authentication error" | OAuth expired or wrong account | Remove and re-add the MCP server, re-authenticate |
| rocks.yaml "weights do not sum to 1.0" | Arithmetic error in config | Adjust weights so they total exactly 1.0 |
| voice.md "missing required section" | Renamed or removed an H2 heading | Ensure `## General Tone`, `## Formality Levels`, `## Length Preferences` exist |
| contacts/ "empty" | No `.md` files in directory | Add at least one contact file |

## Cowork Setup

If you use Cowork (browser-based Claude) instead of the CLI, the plugin still works with adaptations.

### What works identically

- All MCP server connections (Gmail, Calendar, Slack, Asana) use the same setup commands.
- Commands like `/preflight` and `/status` function normally for MCP-dependent sections.

### What differs

Cowork does not have filesystem access, so config files cannot be read from disk.

**Option A -- Paste into project context:**
Copy the contents of your `rocks.yaml`, `voice.md`, and `constraints.yaml` directly into your Cowork project context. The plugin will read them from there.

**Option B -- Store in Notion:**
Save each config as a Notion page and reference them in your project instructions. If the Notion MCP is connected, the plugin can fetch them on demand.

### Limitations in Cowork

- Preflight skips filesystem checks and reports config files as "not checked (Cowork mode)".
- Contact files must be pasted into context or maintained in an external system (Notion, Google Sheets).
- File-based commands that write to disk will not work.

## Troubleshooting

### MCP server won't connect

1. Verify the server is registered: check `~/.claude/.mcp.json` for the server entry.
2. Restart your Claude Code session -- MCP changes often require a fresh session.
3. Re-run the `claude mcp add` command to trigger a new OAuth flow.
4. Check that you authenticated with the correct account during OAuth.

### Config file not found

1. Confirm the file exists at `./filename` or `~/.claude/filename`.
2. Check for typos in the filename (e.g., `rocks.yaml` not `rocks.yml`).
3. If you moved your project directory, re-copy the templates from the plugin's `references/` folder.

### Permission errors

1. Gmail/Calendar: Re-authorize and ensure you grant the requested scopes.
2. Slack: Verify the bot is a member of the channels you want to read. Private channels require `groups:history`.
3. Asana: Confirm your account has access to the workspace you expect.

### Session issues

Many problems resolve by restarting the Claude Code session. After any MCP config change, a restart is recommended before re-running preflight.

## Next Steps

Once preflight passes:

1. Run `/orbitant-chief-of-staff:status` to see your operational dashboard.
2. Upcoming commands (`/today`, `/triage`, `/week`, `/prep`, `/crm`) will be available in future releases.
3. Update your `rocks.yaml` weekly to keep goal progress current.
4. Add new contacts to `contacts/` as relationships develop.
