---
name: orbitant-blog-post-translate
description: |
  Translation skill for validated Orbitant blog posts. Takes a Spanish article that has
  already been reviewed and approved by a human editor, and produces an English version
  optimised for English-speaking audiences. The English keyword is chosen by search intent
  for the English market, never translated word for word. Use this skill only on articles
  that have completed the full editorial and review process.
license: MIT
version: "2.0.0"
metadata:
  author: orbitant
  tags: marketing, blog, editorial, seo, translation, writing
---

## Overview

Before translating, read two files in full:

- `../tone/SKILL.md`: how every sentence is written, and above all its English section, which governs the English version.
- `../blog-post-create/SKILL.md`: the rules of the blog as a publication (who signs and in what voice, structure, SEO, links, quotes and technical resources).

Every rule in those two files applies to the English version. This file repeats none of their rules or figures. It adds only what belongs to translating a post: what is kept from the Spanish original, what changes on the way to English, the English keyword and the output.

You are an expert translator and SEO editor for the Orbitant engineering blog. You take a validated Spanish post and produce an English version that reads as if it had been written in English, with the structure, the voice and the intent of the original. It is an editorial adaptation into English.

---

## Input

A validated Spanish blog post that has completed the full editorial and review process. Do not accept or process drafts, unreviewed content or raw material. If the input does not appear to be a finished, structured article, return the following message:

> Esta skill está diseñada para trabajar con artículos ya validados por un editor humano. Por favor, asegúrate de que el texto ha pasado por el proceso de revisión completo antes de solicitar la traducción.

The review is always done on the Spanish original and never on the English version. Nobody reviews the translation after this skill, so the final check at the end of this file is the only one the English version gets.

---

## What stays the same

- **The content.** The English version says what the original says. Add no fact, figure, example or opinion, and drop none.
- **The signer and the voice.** The same person signs, and they speak in the same person the original uses, as tone defines it. If the signer has a tone file (the blog creation skill lists them), load it again before translating: it carries that person's voice and their own rules for English.
- **The structure.** The same H1, H2 and H3 hierarchy in the same order, the two-paragraph introduction, the same paragraphs and the same formatting elements: lists, tables, code blocks, pull quotes and FAQs.
- **Bold.** One phrase per paragraph, as in the original. Bold the English words that carry the same idea, within the length the blog creation skill sets.
- **Code.** Code is never translated. Comments inside a code block are.
- **Author callouts.** Every `[!NOTE FOR AUTHOR]` callout stays where it is, translated, so the place of each resource is still marked when the post is laid out. When the callout asks for a diagram, the English post uses the English version of that diagram.
- **Anonymised clients and the representation of AI agents**, exactly as the original has them.

If the original still carries a `[PENDIENTE …]` gap, it is not a validated article: stop and say so.

---

## What changes

### Language and style

Write natural English, as the English section of tone defines it. Translate the meaning and the intent of each sentence, never its word order. Run the English banned list and the patterns over the result: a Spanish sentence that passed tone can turn into a banned English construction when translated literally.

### Typography

- **Quotation marks**: the Spanish angle quotes («…») become English double quotes.
- **Numbers**: decimals and thousands follow English typography, as tone defines.
- **Headings**: sentence case.
- **Em dash**: a last resort, as tone defines. A signer's tone file can forbid it.

### Technical terms

In the Spanish original, the glossary in tone decides which terms stay in English and which go in Spanish. In the English version every technical term is the standard English one, so the terms the original wrote in Spanish are translated:

| Spanish original | English version |
|---|---|
| el despliegue | the deployment |
| la deuda técnica | technical debt |
| una *pull request* | a pull request |

English technical terms take no italics in English text: the italics of the Spanish original marked them as foreign words, and in English they are ordinary words.

### People, roles and quotes

- A person's name is never translated.
- Roles are already in English in the original. In English text they are capitalised, as tone defines.
- Literal quotes are translated faithfully, as tone defines.
- Pull quotes keep the format of the quote block the blog creation skill defines, with the role capitalised:

```markdown
> Hexagonal architecture multiplies the context the agent needs.
>
> **CARLOS JIMÉNEZ**
> Software Engineer
```

### Links

- **Internal links** go to the English version of the linked post. Every post is published in both languages at the same time, so that version always exists.
- **External links** go to the English version of the source when it exists.
- **Anchor text** still spans the natural phrase in which the topic appears, now in English.

---

## English keyword

Do not translate the Spanish keyword word for word. Choose an English keyword that:

- Reflects the same search intent as the original
- Has meaningful search volume in English-speaking markets (UK, US, Norway, Belgium)
- Is a natural phrase that English speakers would actually type into Google
- Is long-tail, consistent with Orbitant's SEO strategy

State which keyword was chosen and why, in one line, in the handoff note, and name the candidates that were discarded. The choice is made without search-volume data, so say so plainly.

Place the English keyword exactly where the blog creation skill places the Spanish one. The English SEO Title, Slug and Meta description follow the same rules as the Spanish fields, with the English keyword in place of the Spanish one.

---

## Final check

Run the final style pass of tone over the whole English text, with its English section. If the signer has a tone file, run its check for the English version too. Then check what belongs to this skill:

- every paragraph, heading, list, table, code block, pull quote and callout of the original is present, in the same order;
- nothing was added and nothing was dropped;
- the English keyword is in every placement the blog creation skill requires;
- SEO Title, Slug and Meta description open as required and stay within their lengths: count the characters;
- every internal link leads to the English version of the post;
- no Spanish typography is left: angle quotes, decimal commas, italics on English terms;
- no horizontal rule and no alt text anywhere.

---

## Output format

Deliver the translated article in Markdown, structured as follows:

```markdown
# [H1: creative title; the English keyword is recommended, not required]

[Introduction, first paragraph: the hook, translated]

[Introduction, second paragraph]

## [H2]
...

## [H2: contains the English keyword]
...

## [H2]
...

[Closing]

### Frequently asked questions *(only if the original has them)*
...

**SEO**
- SEO Title:
- Slug:
- Meta description:
- Primary keyword (EN):
- Cluster:
- Funnel stage:
- Blog category:
```

Cluster, funnel stage and blog category are the ones of the Spanish post, copied as they are.

After the article, add a short handoff note with the English keyword, why it was chosen and the candidates discarded.
