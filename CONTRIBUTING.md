# Contributing to orbitant-os

Thanks for contributing! Here's how to add or improve skills, agents, and commands.

## Adding a New Skill

### 1. Choose the right vertical

Currently available:
- `orbitant-marketing` — content, SEO, social, email, brand

If your skill doesn't fit an existing vertical, see "Adding a New Vertical" below.

### 2. Create the skill folder

```bash
mkdir -p plugins/orbitant-{vertical}/skills/{skill-name}
```

### 3. Write the SKILL.md

Every skill needs a `SKILL.md` with YAML frontmatter:

```yaml
---
name: orbitant-{short-name}        # ALWAYS prefix with orbitant-
description: |
  Clear description of what this skill does and when to activate it.
  Be specific — this is what Claude reads to decide whether to load the skill.
  Include trigger phrases and edge cases. Be a little "pushy" to avoid undertriggering.
version: "1.0.0"
license: MIT
metadata:
  author: your-name
  tags: comma, separated, tags
---
```

Then write the instructions in Markdown below the frontmatter.

### 4. Keep it under 500 lines

If your skill is getting long, move reference material to a `references/` subfolder and link to it from the SKILL.md.

### 5. Update marketplace.json

Add the skill path to the parent plugin's `skills` array in `.claude-plugin/marketplace.json`.

### 6. Bump the version

Update `version` in the plugin's `.claude-plugin/plugin.json` following semver.

### 7. Open a PR

Include:
- What the skill does
- Example prompts that should trigger it
- Example prompts that should NOT trigger it

## Adding an Agent

Create a Markdown file in `plugins/orbitant-{vertical}/agents/`:

```markdown
---
name: agent-name
description: What this agent specializes in
allowed-tools: Bash, Read, Write
---

# Agent Name

Instructions for the agent...
```

## Adding a Command

Create a Markdown file in `plugins/orbitant-{vertical}/commands/`:

```markdown
---
name: command-name
description: What this command does
---

# /orbitant-{vertical}:command-name

Instructions for what happens when the user runs this command...
```

## Adding a New Vertical

When a skill doesn't fit any existing vertical:

1. Open an issue to discuss the new vertical
2. Create the plugin structure:
   ```bash
   mkdir -p plugins/orbitant-{vertical}/.claude-plugin
   mkdir -p plugins/orbitant-{vertical}/skills
   ```
3. Add `plugin.json` with version `1.0.0`
4. Add at least one skill
5. Register in `.claude-plugin/marketplace.json`
6. Create a GitHub release when publishing

## Naming Conventions

- **Skill names**: `orbitant-{short-description}` (e.g., `orbitant-blog-post-review`)
- **Skill folders**: kebab-case (e.g., `blog-post-review/`)
- **Agent files**: kebab-case `.md` (e.g., `content-strategist.md`)
- **Command files**: kebab-case `.md` (e.g., `generate-copy.md`)

## Testing Your Skill

Before opening a PR, test locally:

```bash
# In Claude Code, load the plugin from your local directory
claude --plugin-dir ./plugins/orbitant-{vertical}
```

Then try your skill with realistic prompts to make sure it triggers correctly.

## Running Validation Locally

```bash
# Install dependencies (first time only)
npm install

# Run all checks (same as CI)
npm run check

# Or run individually:
npm run lint              # Markdown linting
npm run validate          # All schema validations

# Fix markdown issues automatically
npm run lint:fix
```

## CI/CD Pipelines

### Automatic Checks (run on every PR)

| Pipeline | What it checks |
|----------|----------------|
| **Validate** | Markdown linting, JSON schema validation (plugin.json, marketplace.json, SKILL.md frontmatter) |
| **Semver** | Version bumps when plugins change (runs only if `plugins/` or `marketplace.json` modified) |
| **Security** | Snyk mcp-scan + Claude AI security review (runs only if `plugins/` modified) |
| **Skill Review** | AI quality review using `/skill-reviewer` (runs only if SKILL.md files modified) |

### PR Review Labels

Use these labels to trigger specific reviews on demand:

| Label | Triggers |
|-------|----------|
| `review-requested` | ALL reviews (security + quality + semver) |
| `review-security` | Security scan only (mcp-scan + Claude security review) |
| `review-quality` | AI skill quality review only |
| `review-semver` | Semver validation only |

**How it works:**

1. Add the label to your PR
2. The corresponding workflow runs
3. The label is automatically removed when the workflow completes

**Example:** To request a full review before merging, add the `review-requested` label. This will trigger security, quality, and semver checks in parallel.

### Running Locally

```bash
# Install dependencies (first time only)
npm install

# Run all checks (same as CI)
npm run check

# Or run individually:
npm run lint              # Markdown linting
npm run validate          # All schema validations

# Fix markdown issues automatically
npm run lint:fix
```

### Security Scanning

The security pipeline uses:

1. **[Snyk mcp-scan](https://labs.snyk.io/experiments/skill-scan/)** — Scans skills for prompt injection, malicious code, credential handling issues
2. **[Claude Security Review](https://github.com/anthropics/claude-code-security-review)** — AI-powered semantic security analysis

### Skill Quality Review

The quality review uses the internal `/skill-reviewer` skill (`.claude/skills/skill-reviewer/`) to check:

- Frontmatter compliance (orbitant- prefix, description quality, version)
- Description trigger-effectiveness
- Content quality (under 500 lines, clear instructions)
- Safety (no dangerous commands, tool restrictions)
