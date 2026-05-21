---
name: orbitant-release-notes
description: |
  Drafts structured, publication-ready release notes from git history.
  Activates when: creating releases, documenting version changes, drafting changelogs,
  or preparing release announcements. Use even when user just says "generate changelog",
  "what changed since last release", "help me write release notes", "prepare a release",
  or "I bumped the version". Also triggers after version bumps in plugin.json.
version: "1.0.0"
license: MIT
user-invocable: true
allowed-tools: Bash, Read
metadata:
  author: orbitant
  tags: chief-of-staff, releases, changelog, documentation, git
---

## Overview

This skill generates professional, ready-to-publish release notes from git history. It analyzes commits for a specific plugin, categorizes changes by type (features, fixes, docs), and outputs formatted markdown suitable for GitHub releases. The user reviews and polishes the draft before manually creating the release.

## When This Skill Activates

This skill activates when the user needs release documentation:

- **Explicit requests** — "generate release notes for orbitant-marketing", "what changed since v1.0.0"
- **Release prep** — "prepare a release", "help me write the changelog"
- **Version questions** — "what's new in chief-of-staff", "summarize recent changes"

It works standalone (user-invocable) unlike most chief-of-staff skills.

## Input Detection

### Required Information

1. **Plugin name** — Which plugin to generate notes for
   - Accept: `orbitant-marketing`, `marketing`, or just context from conversation
   - Validate: Must be a plugin that exists in `plugins/` directory

2. **Version range** — What commits to include
   - `since v1.0.0` — From a specific tag to HEAD
   - `v1.0.0...v1.1.0` — Between two tags
   - `since last release` — From most recent tag to HEAD
   - `all changes` — From the beginning (first commit affecting plugin)

### If Information Is Missing

Ask the user:
- "Which plugin should I generate release notes for? (orbitant-marketing, orbitant-operations)"
- "What version range? Options: since last release, since v1.x.x, or all changes"

## Git History Analysis

### Step 1: Identify Commit Range

```bash
# Get all tags for the plugin
git tag -l "orbitant-{plugin}-v*"

# Get commits in range
git log --oneline {range} -- plugins/orbitant-{plugin}/
```

### Step 2: Parse Conventional Commits

Categorize each commit by its prefix:

| Prefix | Category | Emoji |
|--------|----------|-------|
| `feat:` or `feat(...)` | New Features | ✨ |
| `fix:` or `fix(...)` | Bug Fixes | 🐛 |
| `docs:` or `docs(...)` | Documentation | 📚 |
| `refactor:` or `refactor(...)` | Refactoring | ♻️ |
| `perf:` or `perf(...)` | Performance | ⚡ |
| `test:` or `test(...)` | Tests | 🧪 |
| `chore:` or `chore(...)` | Maintenance | 🔧 |
| `BREAKING CHANGE` or `!:` | Breaking Changes | 💥 |

Commits without a recognized prefix go to "Other Changes".

### Step 3: Extract PR Numbers

Look for patterns in commit messages:
- `(#123)` — GitHub PR reference
- `Merge pull request #123` — Merge commit

Include PR numbers in the output for traceability.

### Step 4: Read Current Version

```bash
jq -r '.version' plugins/orbitant-{plugin}/.claude-plugin/plugin.json
```

## Output Format

Generate markdown suitable for a GitHub Release body:

```markdown
## What's New in orbitant-{plugin} v{version}

{One paragraph summary of the release — what's the headline?}

### ✨ New Features

- Added {feature description} (#PR)
- {Another feature}

### 🐛 Bug Fixes

- Fixed {bug description} (#PR)

### 📚 Documentation

- Updated {what was documented}

### ♻️ Refactoring

- Refactored {what was changed}

### 🔧 Maintenance

- {Chore description}

---

**Full Changelog**: [{previous_tag}...{new_tag}](https://github.com/weorbitant/orbitant-os/compare/{previous_tag}...{new_tag})
```

### Rules for Output

1. **Omit empty sections** — If there are no features, don't include the Features header
2. **Write human-readable descriptions** — Don't just copy commit messages; rewrite them clearly
3. **Highlight breaking changes** — If any `BREAKING CHANGE` commits exist, put them first with ⚠️ warnings
4. **Include migration notes** — For breaking changes, suggest what users need to update
5. **Keep it scannable** — Bullet points, not paragraphs

## Summary Paragraph

The opening paragraph should answer:
- What's the main theme of this release?
- What's the most important change?
- Who does this affect?

Example:
> This release introduces the blog post translation skill, making it easy to localize content for international audiences. It also includes several bug fixes for tone detection edge cases.

## Cowork Adaptation

If git is not available (Cowork session without filesystem access):
1. Ask the user to paste recent commit messages or a git log
2. Parse the pasted content using the same categorization logic
3. Note in output: "Generated from provided commit log (no git access)"

## Example Invocation

**User**: Generate release notes for orbitant-marketing

**Response**:

```markdown
## What's New in orbitant-marketing v1.2.0

This release adds powerful blog translation capabilities and improves SEO analysis accuracy. Content teams can now localize posts to multiple languages while maintaining brand voice.

### ✨ New Features

- Added `orbitant-blog-post-translate` skill for multi-language content (#18)
- New SEO keyword density analyzer in blog review (#15)

### 🐛 Bug Fixes

- Fixed false positive on passive voice detection in technical writing (#17)
- Corrected readability score calculation for short paragraphs (#16)

### 📚 Documentation

- Added translation workflow guide to skill README

---

**Full Changelog**: [orbitant-marketing-v1.1.0...orbitant-marketing-v1.2.0](https://github.com/weorbitant/orbitant-os/compare/orbitant-marketing-v1.1.0...orbitant-marketing-v1.2.0)
```

## Key Rules

1. **Always show the draft first** — Never create the GitHub release automatically; output is for user review
2. **Use conventional commit format** — Parse prefixes consistently
3. **Rewrite for humans** — Commit messages are for developers; release notes are for users
4. **Include PR links** — Traceability matters
5. **Be concise** — Nobody reads long changelogs; keep each bullet to one line
6. **Celebrate features** — The summary paragraph should make users excited about the release
7. **Warn about breaking changes** — These go first with clear migration guidance

## After the Release is Published

Once the GitHub release is live, remind the user of the manual internal-distribution step:

> ⚠️ **Manual step (org admin only)**: upload the plugin zip to <https://claude.ai/admin-settings/plugins> to propagate the new version internally.

The website blog parser picks up the release on the next build, but internal Claude.ai distribution requires this manual upload by an org admin.
