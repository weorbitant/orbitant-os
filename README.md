# orbitant-os

> The future will be AI or nothing at all.

Orbitant's plugin marketplace — skills, agents, and commands organized by vertical. Compatible with Claude Code, Claude.ai, and the Claude API.

**Documentation:** <https://weorbitant.github.io/orbitant-os>

## Quick Start

```bash
# Add the marketplace
/plugin marketplace add weorbitant/orbitant-os

# Install what you need
/plugin install orbitant-marketing
/plugin install orbitant-operations

# Update when there are new versions
/plugin update
```

## Available Plugins

| Plugin | Version | Skills | Commands |
|--------|---------|--------|----------|
| **orbitant-marketing** | v1.4.0 | `blog-post-review`, `blog-post-create`, `blog-post-translate`, `tone`, `yt-description`, `linkedin-post`, `image-creation`, `newsletter` | — |
| **orbitant-operations** | v1.0.0 | `graceful-degradation`, `goal-alignment`, `voice-drafting` | `/preflight`, `/status`, `/today`, `/triage`, `/week`, `/prep`, `/crm`, `/challenge`, `/highlight`, `/opportunity`, `/todo`, `/query`, `/report` |
| **orbitant-engineering** | v0.1.1 | `orbitant-ai-readiness`, `orbitant-git-hygiene`, `orbitant-owasp-scan`, `orbitant-12-factor`, `orbitant-debrief` | `/ground-control` |

## Works Everywhere

- **Claude Code** — native plugin support
- **Claude.ai** — upload skills directly
- **Cursor, Cline, Copilot** — via [skills.sh](https://skills.sh)
- **Claude API** — programmatic access

```bash
# Install to other agents via skills.sh
npx skills add weorbitant/orbitant-os --skill orbitant-blog-post-review --agent cursor -y
```

This is useful when:
- You want to use skills outside of Claude Code's plugin system
- You're using a different AI coding agent
- You need to install skills in CI/CD pipelines

### Claude API

Use the `/v1/skills` endpoint. See [Skills API docs](https://docs.claude.com/en/api/skills).

## MCP Setup

Some plugins require MCP servers (e.g., Gmail, Calendar, Slack). Run the setup script to configure them:

```bash
# Community users — interactive plugin selection
./install.sh

# Orbitant team members — sets up everything
./install.sh --team
```

The script checks prerequisites, registers MCP servers via `claude mcp add`, and guides you through OAuth authentication for each service.

## Repo Structure

```
orbitant-os/
├── .claude/
│   └── CLAUDE.md                   <- project instructions for Claude
├── .claude-plugin/
│   └── marketplace.json            <- marketplace manifest
├── plugins/
│   ├── orbitant-marketing/
│   │   ├── .claude-plugin/
│   │   │   └── plugin.json
│   │   └── skills/
│   │       ├── blog-post-review/
│   │       ├── blog-post-create/
│   │       ├── blog-post-translate/
│   │       └── tone/
│   └── orbitant-operations/
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── skills/
│       ├── commands/
│       ├── agents/
│       ├── crm/
│       ├── reports/
│       └── references/
├── .github/
│   ├── assets/                     <- images and screenshots
│   ├── schemas/                    <- JSON schemas for validation
│   └── workflows/
│       └── validate.yml            <- CI pipeline
├── scripts/                        <- validation scripts
├── .gitignore
├── CONTRIBUTING.md
├── FAQ.md
├── LICENSE
├── package.json
└── README.md
```

## How It Works

Each vertical is an independent **plugin** with its own namespace. This means:

- **No collisions**: Skills use prefixed names (e.g., `orbitant-blog-post-review`) so Claude can distinguish them from community skills.
- **Install only what you need**: A marketer doesn't need infra skills, and vice versa.

### Component Types

| Component | What it is | How it triggers |
|-----------|-----------|-----------------|
| **Skills** | Instructions Claude loads automatically when relevant | Claude reads the `description` and decides |
| **Agents** | Specialized sub-agents with restricted tools | Invoked via slash command or by another agent |
| **Commands** | Slash commands invoked manually | User types `/orbitant-marketing:command-name` |

## Adding New Skills

1. Create folder: `plugins/orbitant-{vertical}/skills/{skill-name}/`
2. Add `SKILL.md` with frontmatter:

```yaml
---
name: orbitant-{short-name}     # ALWAYS prefix with orbitant-
description: |
  What the skill does. When to activate it.
  Be specific — this triggers Claude to load the skill.
version: "1.0.0"
license: MIT
metadata:
  author: your-name
  tags: comma, separated, tags
---
```

1. Update `marketplace.json` and bump version in `plugin.json`
2. Open a PR

See [Creating Skills](https://weorbitant.github.io/orbitant-os/guides/creating-skills/) for detailed guidelines.

## Development

```bash
# Install dependencies
npm install

# Run validation (same as CI)
npm run check

# Test plugins locally
claude --plugin-dir ./plugins/orbitant-marketing

# Website development
npm run website:dev      # Dev server
npm run website:build    # Build static site
```

## Consume a brain as an npm package

Each vertical is also published as a private npm package under `@weorbitant` on
GitHub Packages, so a TypeScript app can vendor a version-pinned "brain".

### Setup

Add an `.npmrc` to the consuming repo:

```
@weorbitant:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

`GITHUB_TOKEN` needs the `read:packages` scope.

### Install

```bash
npm install @weorbitant/orbitant-marketing@^1.5.0   # one vertical
npm install @weorbitant/orbitant-os                 # all verticals (meta-package)
```

`node_modules` + `package-lock.json` is the vendored, pinned copy. Update the
brain by bumping the range and running `npm update`.

### Use

```ts
import marketing from '@weorbitant/orbitant-marketing';

// the whole vertical in one import — never skill-by-skill
Object.values(marketing.skills).map((s) => s.content);
marketing.skills['orbitant-tone'].content;   // one skill's instructions
marketing.skills['orbitant-tone'].dir;        // absolute path for references/assets/scripts

// meta-package: all verticals at once
import brain from '@weorbitant/orbitant-os';
brain.marketing; brain.operations; brain.engineering;
```

Each skill entry exposes `{ name, folder, description, version, tags, content, frontmatter, dir }`.
Agents expose `{ name, description, allowedTools?, content, frontmatter, path }` and commands
`{ name, description, content, frontmatter, path }` — agents and commands carry a `path` to the
source file rather than a `dir`. You can also import a single vertical straight from the
meta-package via a subpath, e.g. `import marketing from '@weorbitant/orbitant-os/marketing'`.
Package versions track the vertical's `plugin.json`; publishing happens on the
`orbitant-{vertical}-v{X.Y.Z}` release tag.

## Documentation

Full documentation is available at **<https://weorbitant.github.io/orbitant-os>**

- [Overview](https://weorbitant.github.io/orbitant-os/getting-started/quick-start/)
- [Installation](https://weorbitant.github.io/orbitant-os/getting-started/installation/)
- [Concepts](https://weorbitant.github.io/orbitant-os/getting-started/concepts/)
- [Contributing](https://weorbitant.github.io/orbitant-os/guides/contributing/)
- [FAQ](https://weorbitant.github.io/orbitant-os/faq/)

## License

MIT — see [LICENSE](LICENSE).
