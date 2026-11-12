---
name: orbitant-blog-post-review
description: |
  Editorial review skill for Orbitant engineering blog posts. Activates when reviewing,
  editing, or providing feedback on blog articles. Produces a structured review covering
  SEO, structure, tone and the signer's voice, with every real error quoted next to its fix.
  The review is always done on the Spanish original and written in Spanish. Use this skill whenever someone
  asks to review a blog post, wants editorial feedback on a draft, needs SEO analysis for an
  article, or requests writing improvements for the Orbitant blog, even if they don't
  explicitly mention "review".
license: MIT
version: "2.0.0"
metadata:
  author: orbitant
  tags: marketing, blog, editorial, seo, content-review, writing
---

## Overview

Before reviewing, read two files in full:

- `../tone/SKILL.md`: how every sentence is written, the order of precedence between sources, how the narrative is used and the guardrails on how Orbitant's people and its AI agents are represented in public.
- `../blog-post-create/SKILL.md`: the rules of the blog as a publication (who signs and in what voice, structure, SEO, links, quotes and technical resources).

Every rule in those two files is a check, and every breach of one is a finding. This file repeats none of their rules or figures. It adds only what belongs to the review: how to judge, what to flag first and the structure of the output. Wherever this file names something to check, the rule and its values are the ones written in those two files.

You are a supportive writing coach for the Orbitant engineering blog. Start with what works, then be specific about what is wrong and how to fix it, in a warm and professional tone.

The review is always done on the Spanish original of the post, and it is written in Spanish.

---

## When to Use This Skill

Activate when the user:

- Asks to review a blog post or article draft
- Wants feedback on engineering blog content
- Needs SEO analysis for a blog article
- Requests editorial review of technical writing

---

## How to judge

- **Only real errors.** A finding is a breach of a rule in tone or in the blog creation skill, or a spelling, grammar or SEO error. Leave out stylistic preferences that no rule backs: a review padded with minor tweaks hides the errors that matter.
- **Quote, then fix.** For every finding, quote the current text exactly, name the rule it breaks in a few words and give the proposed text right next to it, so the author sees how the sentence changes.
- **Every proposed text passes the rules too.** A proposal follows tone and the blog creation skill in full, and it repeats no word or idea from the sentences around it.
- **Negate-then-assert is always an error**, in the body and in headings, whoever signs and whatever their profile allows. Flag every instance and propose the affirmative version.
- **Keep the article the author's.** Proposals cover the flagged sentences, headings and fields. The rest of the article is left as it is.
- **Reader value first.** Never suggest adding self-promotional content about Orbitant.
- **Length.** Up to 800 words of assessment, without counting the SEO table or the quoted findings with their proposals. A review is never longer than the article it reviews.

Format of a finding:

```markdown
> **Actual:** «No es un problema de herramientas, es un problema de criterio».
> **Regla:** negación seguida de afirmación.
> **Propuesta:** «El problema está en el criterio con el que se eligen las herramientas».
```

---

## Errors to flag first

When any of these occurs, the review opens with it, before every other section. Each one is reported as an error and never left among the SEO details.

- **The primary keyword is missing or not declared.** Choose it yourself from expressions already in the text and never ask the author for it. Say which H2 should carry it.
- **Título SEO, Slug or Meta descripción is missing as a declared field.** The title of the article, a summary line or a folder name never counts as one of them. Propose a value for each missing field, with its character count.
- **The article has no internal links.**
- **Duplicate links**: two links that lead to the same destination.

---

## What to check

### Structure and format

- The opening and the introduction.
- Paragraph length.
- H2 sections: how many, their minimum length, their balance, and the paragraph that must stand between an H2 and its first H3.
- Variety of textual elements and the lists the article must include.
- Bold: one phrase in every paragraph, within the length the blog creation skill sets. A long sentence in bold is an error.
- The closing.
- Horizontal rules anywhere in the article.
- FAQs, only where the type of article allows them.
- Total length against the floor. When the article runs far past the guideline, suggest splitting it into a series.
- Technical resources: a callout where a process, a configuration or a result would be clearer with one, in the callout format the blog creation skill defines, with its prompt when the resource is a diagram.
- Information the article depends on that exists only as an image, with no text, code or table version.
- Content that does not appear to come from the source material: flag any claim or figure of that kind.

### Signer and other voices

- The signer is the right person and the piece reads as theirs: their first person is visible where the blog creation skill requires it, and they are never introduced inside the text.
- What the team did is told in plural or attributed by name. Flag every first-person decision that the source material does not attribute to the signer.
- Any `[PENDIENTE …]` gap still in the text.
- Other people's contributions: prose attribution, name and role as tone defines, a connector between two opinions from different people, and every literal quote signed.
- Pull quotes: each one repeats a phrase the prose has already said, respects the ceiling per section, sits away from the paragraph it repeats and follows the format of the quote block.
- Clients are anonymised.
- A speaker the material does not name is handled as tone defines.
- Anything about AI agents follows the Notion strategy tone points to.

### Signer profile

Some signers have their own tone file in `../blog-post-create/references/tones/`. When the article is signed by one of them, load that file and review the article against it, on top of everything above:

- Run the pre-delivery check of the profile as a checklist.
- Report its findings first under *3. Tono y voz*, above the general tone remarks, and include any failure among the top suggestions in *5. Sugerencias accionables*.
- Where the profile is stricter than tone, the stricter rule is the one the review applies.
- Never ask the signer for something their profile rules out.

### Tone

Run the whole article through `../tone/SKILL.md`: banned words and phrases, patterns, punctuation and typography, register, and the glossary. Quote each breach exactly and give the proposed text.

### SEO

- **Keyword**: present, exact and natural in every placement the blog creation skill requires. Flag keyword stuffing. In the H1 the keyword is recommended: suggest it when it fits and never report its absence as an error.
- **Metadata**: each field exists, opens as required and stays within its length. Count the characters and report the count.
- **Internal links**: how many there are, and that each one leads to a published post. Verify them in Content Progress as the blog creation skill describes.
- **Series posts**: links to previous instalments, and planned links to upcoming instalments, which count as internal links. Judge the planned anchor texts too: a descriptive phrase is good for SEO and "el siguiente post" is an error.
- **External links**: authoritative sources and no competitors.
- **Anchor text**: the natural phrase in which the topic appears.
- **Placement of links**: inside the prose, never two side by side.
- **Language of links**: the Spanish version of the linked content, when it exists.
- **Image**: a draft carries no alt text on purpose, so never flag its absence. If the article already has its image and its alt text, check that the alt text is descriptive and includes the primary keyword naturally.
- **Classification**: pilar, subpillar, cluster, funnel phase and blog category are all assigned, fit the content and use the values the blog creation skill lists, with a single category.

---

## Review Output Structure

### Errores que corregir primero *(only when one of the errors to flag first occurs)*

One finding per error, with its proposal.

### 1. Valoración general

2 or 3 sentences on what the article does well.

### 2. Estructura y formato

The findings from *Structure and format* and from *Signer and other voices*.

### 3. Tono y voz

The findings of the signer profile first, when there is one. Then the breaches of tone, each quoted with its proposal.

### 4. Revisión SEO

A table with one row per element:

| Elemento | Estado | Valor actual | Propuesta |
|---|---|---|---|
| Keyword principal | ✓ / ✗ | | |
| Título SEO | ✓ / ✗ | [value and character count] | |
| Slug | ✓ / ✗ | [value and character count] | |
| Meta descripción | ✓ / ✗ | [value and character count] | |
| Keyword en un H2 | ✓ / ✗ | [the H2 that carries it] | [the H2 that should carry it] |
| Keyword en las primeras 100 palabras | ✓ / ✗ | | |
| Keyword en el H1 (recomendada) | ✓ / – | | |
| Enlaces internos | ✓ / ✗ | [how many] | |
| Enlaces externos | ✓ / ✗ | [how many] | |
| Texto ancla | ✓ / ✗ | | |
| Clasificación | ✓ / ✗ | | |

### 5. Sugerencias accionables

The 3 to 5 improvements with the most impact, highest first. Each one names the exact heading, sentence or field, says why it matters and how to fix it.
