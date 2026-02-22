# FAQ

Frequently asked questions about orbitant-os.

## General

### What is orbitant-os?

A plugin marketplace for Claude Code containing skills, agents, and commands organized by business vertical (marketing, engineering, HR, infra).

### What's the difference between skills, agents, and commands?

| Component | What it is | When to use |
|-----------|-----------|-------------|
| **Skills** | Instructions Claude loads automatically when relevant | When you want Claude to activate behavior based on context |
| **Agents** | Specialized sub-agents with restricted tool access | When you need isolated execution with specific permissions |
| **Commands** | Slash commands invoked manually | When you want explicit user-triggered actions |

### Why prefix everything with `orbitant-`?

To avoid naming collisions with community skills. If someone publishes a `blog-post-review` skill, ours won't conflict because it's named `orbitant-blog-post-review`.

## Installation

### How do I install a plugin in Claude Code?

```bash
/plugin marketplace add weorbitant/orbitant-os
/plugin install orbitant-marketing
```

### How do I use a skill after installing?

Skills are invoked with `/plugin-name:skill-name` where the skill name is the **folder name** (not the `name` in frontmatter):

```bash
# Use the blog-post-review skill from orbitant-marketing
/orbitant-marketing:blog-post-review
```

### How do I uninstall a plugin?

```bash
# Remove a plugin
/plugin uninstall orbitant-marketing

# Remove the marketplace entirely
/plugin marketplace remove weorbitant/orbitant-os
```

### How do I install a skill in Claude.ai?

1. Download the skill folder as a `.zip`
2. Go to **Settings > Capabilities > Skills**
3. Click **Upload a skill** and select the zip

### Can I use skills with the Claude API?

Yes, use the `/v1/skills` endpoint. See the [Skills API docs](https://docs.claude.com/en/api/skills).

### Can I use skills with other AI agents (Cursor, Cline, Copilot, etc.)?

Yes! Use [skills.sh](https://skills.sh), the open agent skills ecosystem:

```bash
# Install to any supported agent
npx skills add weorbitant/orbitant-os --skill orbitant-blog-post-review --agent cursor -y
npx skills add weorbitant/orbitant-os --skill orbitant-blog-post-review --agent cline -y

# List available skills
npx skills add weorbitant/orbitant-os --list
```

skills.sh supports 40+ agents including Claude Code, Cursor, Cline, Windsurf, Codex, GitHub Copilot, and more.

### Why use skills.sh instead of Claude Code plugins?

| Use case | Recommended method |
|----------|-------------------|
| Using Claude Code as your main agent | `/plugin install` (native integration) |
| Using multiple AI agents | `npx skills add` (cross-agent compatibility) |
| Installing skills in CI/CD | `npx skills add` (works without Claude Code) |
| Sharing skills with non-Claude users | `npx skills add` (agent-agnostic) |

skills.sh follows the [Agent Skills](https://agentskills.io) open standard, which works across multiple AI tools.

## Contributing

### How do I add a new skill?

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full process. Quick summary:

1. Create folder in `plugins/orbitant-{vertical}/skills/{skill-name}/`
2. Write `SKILL.md` with proper frontmatter
3. Update `marketplace.json`
4. Open a PR

### Why is my skill not triggering?

The `description` field in SKILL.md frontmatter is the primary triggering mechanism. Make it:
- Specific about what the skill does
- Include trigger phrases and edge cases
- Be "pushy" — Claude tends to under-trigger otherwise

### How long can a SKILL.md be?

Keep it under 500 lines. If longer, move reference material to a `references/` subfolder.

## Forking Skills

### How do I fork a skill from another repo?

1. **Copy the skill files** (SKILL.md, LICENSE, any assets) into your plugin
2. **Rename to follow conventions** — add `orbitant-` prefix to the `name` field
3. **Create `.fork-metadata.json`** to track the source (see below)
4. **Update plugin.json** — add skill path and bump version (MINOR for new skill)
5. **Update marketplace.json** — match the new version

### How do I track forked skills?

Create a `.fork-metadata.json` in the skill folder:

```json
{
  "$schema": "../../../../.github/schemas/fork-metadata.schema.json",
  "upstream": {
    "repo": "https://github.com/owner/repo",
    "commit": "a0c2269927faddfa3ce94d5aed6451f215487ea9",
    "branch": "main",
    "files": [
      {
        "source": "path/in/upstream/repo/SKILL.md",
        "target": "SKILL.md"
      },
      {
        "source": "path/in/upstream/repo/LICENSE.txt",
        "target": "LICENSE.txt"
      }
    ]
  },
  "forked_at": "2026-02-22",
  "customizations": [
    "Added orbitant- prefix",
    "Replaced brand colors",
    "Updated metadata"
  ]
}
```

| Field | Description |
|-------|-------------|
| `upstream.repo` | GitHub URL of the source repository |
| `upstream.commit` | Full SHA of the commit when we forked (40 chars) |
| `upstream.branch` | Branch to track for updates (usually `main`) |
| `upstream.files` | List of files we copied, with source and target paths |
| `forked_at` | Date of the fork (YYYY-MM-DD) |
| `customizations` | List of changes we made after forking |

### How do I check for upstream changes?

Run the check-upstream script:

```bash
npm run check:upstream           # Normal run
npm run check:upstream --verbose # Show detailed API calls
```

**What it does:**

1. Finds all `.fork-metadata.json` files in `plugins/`
2. For each forked skill, queries GitHub API to check if tracked files changed
3. Compares: "has this file been modified after our `upstream.commit`?"
4. Reports which skills are up-to-date vs outdated

**Example output (up-to-date):**

```
Checking upstream changes for forked skills...

Found 1 forked skill(s)

============================================================
SUMMARY
============================================================

Up to date (1):
  - brand-guidelines
```

**Example output (outdated):**

```
Outdated (1):
  - brand-guidelines
    Changed files: cli-tool/.../SKILL.md
    Compare: https://github.com/owner/repo/compare/a0c2269...main
```

The compare URL takes you directly to GitHub's diff view so you can review what changed.

### How do I sync upstream changes?

1. Run `npm run check:upstream` to see what changed
2. Click the compare URL to review the upstream diff
3. Manually apply relevant changes to your forked skill
4. Update `.fork-metadata.json`:
   - Set `upstream.commit` to the new commit SHA
   - Add a note to `customizations` describing what you synced
5. Bump version in `plugin.json` (PATCH for updates)

> **Why manual sync?** We use manual copy instead of git subtree because most skills live in nested paths within larger repos, making subtree impractical. Manual review also ensures we don't accidentally overwrite our customizations.

## Troubleshooting

### CI is failing on my PR

Check the workflow logs for:
- **Markdown lint errors** — fix formatting issues
- **Schema validation errors** — ensure `plugin.json` and SKILL.md frontmatter are valid
- **Security scan failures** — Snyk mcp-scan checks for prompt injection, secrets, malicious patterns

### My skill works locally but not after install

Verify:
1. The skill path is listed in `marketplace.json`
2. The `name` field in SKILL.md matches the `orbitant-{short-name}` convention
3. The `description` field is comprehensive enough for Claude to trigger it

---

*Have a question not listed here? Open an issue.*
