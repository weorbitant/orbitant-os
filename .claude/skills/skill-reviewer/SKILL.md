---
name: skill-reviewer
description: |
  Reviews SKILL.md files for quality and compliance with orbitant-os conventions.
  Use when: reviewing a skill, checking skill quality, validating skill format,
  or when asked to "review this skill" or "check if this skill is good".
  Also activates for CI skill validation requests.
version: "1.0.0"
license: MIT
metadata:
  author: orbitant
  tags: internal, review, quality, ci
---

# Skill Reviewer

You are reviewing SKILL.md files for the orbitant-os plugin marketplace. Check each skill against these criteria and provide structured feedback.

## Checklist

### 1. Frontmatter Compliance

- [ ] **name**: Starts with `orbitant-` prefix (REQUIRED)
- [ ] **name**: Lowercase, kebab-case, max 64 characters
- [ ] **description**: Present and meaningful (REQUIRED)
- [ ] **description**: At least 100 characters
- [ ] **version**: Follows semver format (X.Y.Z)
- [ ] **license**: Specified (usually MIT)
- [ ] **metadata.author**: Present
- [ ] **metadata.tags**: Present with relevant tags

### 2. Description Quality

The description is the PRIMARY triggering mechanism. It must be:

- [ ] **Comprehensive**: Explains what the skill does
- [ ] **Trigger-rich**: Includes phrases users would say
- [ ] **Pushy**: Tells Claude WHEN to activate, not just what it does
- [ ] **Edge-case aware**: Mentions "even if user doesn't explicitly..."

**Good example:**
```yaml
description: |
  Reviews blog posts for SEO, readability, and brand voice.
  Activate when user asks to "review a post", "check my article",
  "improve this blog", or shares markdown content that looks like
  a blog post. Also trigger if user mentions SEO, readability scores,
  or content quality — even if they don't explicitly ask for a review.
```

**Bad example:**
```yaml
description: Reviews blog posts.
```

### 3. Content Quality

- [ ] **Under 500 lines**: Large content moved to `references/` folder
- [ ] **Clear instructions**: Written for another Claude instance
- [ ] **Procedural knowledge**: Includes non-obvious steps
- [ ] **Examples**: Complex tasks have examples
- [ ] **No secrets**: No hardcoded API keys, tokens, or credentials

### 4. Structure

- [ ] **Sections organized**: Clear headings and structure
- [ ] **References used**: Long docs split into `references/*.md`
- [ ] **Templates provided**: If skill generates output, templates exist

### 5. Safety

- [ ] **No dangerous commands**: No `rm -rf`, `sudo`, etc. without safeguards
- [ ] **Tool restrictions**: Uses `allowed-tools` if needed
- [ ] **Manual trigger**: Uses `disable-model-invocation: true` for dangerous skills

## Output Format

Provide your review in this format:

```markdown
## Skill Review: `{skill-name}`

### Summary
{One sentence overall assessment}

### Score: {X}/10

### Checks

| Category | Status | Notes |
|----------|--------|-------|
| Frontmatter | ✅/⚠️/❌ | {details} |
| Description | ✅/⚠️/❌ | {details} |
| Content | ✅/⚠️/❌ | {details} |
| Structure | ✅/⚠️/❌ | {details} |
| Safety | ✅/⚠️/❌ | {details} |

### Issues

1. {Issue description and how to fix}
2. ...

### Suggestions

- {Optional improvement ideas}
```

## Scoring Guide

- **9-10**: Production ready, exemplary skill
- **7-8**: Good skill, minor improvements possible
- **5-6**: Functional but needs work
- **3-4**: Significant issues, needs revision
- **1-2**: Missing critical elements, not usable

## Usage

To review a skill:

```
/skill-reviewer plugins/orbitant-marketing/skills/blog-post-review/SKILL.md
```

Or let Claude auto-invoke when you ask to review a skill:

```
Review the blog-post-review skill for quality
```
