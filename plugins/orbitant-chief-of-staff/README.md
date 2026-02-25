# Chief of Staff

AI-powered chief of staff that manages your priorities, communications, relationships, and goal alignment.

## Overview

This plugin turns Claude into a proactive chief of staff for B2B services companies. It connects to your email, calendar, Slack, and task management to provide daily briefings, inbox triage, meeting prep, relationship tracking, and strategic alignment against your quarterly rocks. Everything is scored and prioritized so you focus on what actually moves the needle.

## Quick Start

```bash
# 1. Install the plugin
/plugin install orbitant-chief-of-staff

# 2. Copy config templates to your project
cp plugins/orbitant-chief-of-staff/references/rocks.example.yaml .claude/rocks.yaml
cp plugins/orbitant-chief-of-staff/references/voice.example.md .claude/voice.md
cp plugins/orbitant-chief-of-staff/references/constraints.example.yaml .claude/constraints.yaml
mkdir -p .claude/contacts

# 3. Connect MCP servers (Gmail, Calendar, Slack, Asana)
# See the setup guide in CONTRIBUTING.md for details

# 4. Verify everything is ready
/orbitant-chief-of-staff:preflight
```

## Available Commands

| Command | Description | Status |
|---------|-------------|--------|
| `/orbitant-chief-of-staff:preflight` | System readiness check | Available |
| `/orbitant-chief-of-staff:status` | Operational health dashboard | Available |
| `/orbitant-chief-of-staff:today` | Morning briefing | Available |
| `/orbitant-chief-of-staff:triage` | Inbox management | Available |
| `/orbitant-chief-of-staff:week` | Weekly planning | Available |
| `/orbitant-chief-of-staff:prep` | Meeting preparation | Available |
| `/orbitant-chief-of-staff:crm` | Contact management | Available |

## Skills

| Skill | Type | Description |
|-------|------|-------------|
| `orbitant-graceful-degradation` | Auto-triggered | Checks MCP and config availability before operations |
| `orbitant-goal-alignment` | Auto-triggered | Scores and prioritizes work against quarterly rocks |
| `orbitant-voice-drafting` | Auto-triggered | Drafts in your voice using style references |

## Configuration

| File | Purpose | Template |
|------|---------|----------|
| `rocks.yaml` | Quarterly goals and weights | `references/rocks.example.yaml` |
| `voice.md` | Writing style and tone references | `references/voice.example.md` |
| `constraints.yaml` | Boundaries, rules, working hours | `references/constraints.example.yaml` |
| `contacts/*.md` | CRM contact profiles | `crm/contact.example.md` |

Copy templates into your project's `.claude/` directory and customize them.

## MCP Dependencies

| Service | Required? | Used by |
|---------|-----------|---------|
| Gmail | Core | `/triage`, `/today` |
| Google Calendar | Core | `/today`, `/week`, `/prep` |
| Slack | Core | `/triage`, `/today` |
| Asana | Core | `/week`, `/status` |

The `/preflight` and `/status` commands work without any MCP connections. They report what is and isn't available.

## Cowork Compatibility

The `/preflight` and `/status` commands work in Cowork sessions. Commands that depend on MCP servers (Gmail, Calendar, Slack, Asana) require those servers to be configured in the Cowork environment, which may not always be available. The auto-triggered skills (graceful-degradation, goal-alignment) work in any context since they only read local config files.

## Links

- [Setup Guide](../../CONTRIBUTING.md)
- [Plugin Marketplace](../../README.md)
- [License](../../LICENSE)
