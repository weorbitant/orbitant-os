---
name: orbitant-yt-description
description: |
  YouTube video description generator for Orbitant Knowledge Sharing (KS) sessions.
  Takes a session transcript (.vtt or plain text) and produces a bilingual, SEO-optimised
  YouTube description — Spanish first, then English — built around a positionable keyword.
  The description is structured to rank in YouTube and Google search: keyword in the first
  line, natural repetition in the overview and takeaways, and hashtags chosen for search
  intent, not just labels. Use this skill whenever someone needs to write or generate a
  YouTube description for a KS session or any Orbitant video — even if they just say
  "escribe la descripción del vídeo", "I need the YouTube copy", or "help me upload this
  session". Also trigger when given a transcript and asked to prepare anything for a
  video upload.
license: MIT
version: "1.0.0"
metadata:
  author: orbitant
  tags: marketing, youtube, seo, video, content, ks-sessions, description, bilingual, keywords
---

## Overview

You are writing the YouTube description for an Orbitant Knowledge Sharing session. The description does two things at once: it convinces a viewer who lands on the page to watch, and it tells YouTube and Google what the video is about so it surfaces in relevant searches.

**Positioning is the primary goal.** A technically accurate description that nobody finds is worthless. Every structural decision — the first sentence, the takeaways, the hashtags — must serve the keyword strategy.

Read the transcript in full before writing anything. Do not invent content not present in the input.

---

## Step 1 — Keyword research (do this first)

Before writing a single line of description, identify the keyword strategy for the video.

### Primary keyword (one per language version)

The primary keyword is the search phrase a potential viewer would type into YouTube or Google to find this content. It must:
- Reflect what the session **actually teaches**, not just what it's about
- Be specific enough to have real search intent (someone looking to solve a problem or learn a skill)
- Be phrased as a user would type it — not how a speaker would title their talk

**Spanish primary keyword examples for KS sessions:**
- `cómo usar Claude para automatizar contenido`
- `crear CLI con IA desde cero`
- `automatizar changelogs con GitHub Actions`
- `qué es el patrón decorator en programación`

**English primary keyword examples:**
- `how to build Claude skills for your team`
- `automate content creation with AI`
- `CLI tools with AI step by step`

If the user provides a keyword, use it. If not, derive it from the transcript topic — ask yourself: *what would the ideal viewer search for before finding this video?*

### Secondary keywords (2–4 per language version)

Supporting terms that complement the primary keyword. These appear naturally in the takeaways and overview — do not force them. Examples: tool names (Claude, n8n, Astro), technique names (RAG, streaming, decorator pattern), broader category terms (IA generativa, automatización, DevTools).

---

## Step 2 — Language order

- If the session was conducted **primarily in Spanish**: Spanish version first, English version second.
- If the session was conducted **primarily in English**: English version first, Spanish version second.
- Both versions are always present. The English is an adaptation, not a literal translation — keyword choice and phrasing must feel natural for an English-speaking audience searching on YouTube.

**Timestamps are not part of this output.** They are added separately after publication.

---

## Step 3 — Write the description

Apply this structure to each language version.

### 1. Opening line (critical for SEO)

The **first 150 characters** of the description are what YouTube shows in search results before "Show more". This is prime real estate.

The opening line must:
- Contain the **primary keyword** — ideally in the first 10 words
- State clearly what the viewer will learn or be able to do
- Stand alone as a compelling reason to click

> Correct: `Aprende a crear Skills de Claude para automatizar la generación de contenido desde transcripts de sesiones.`
> Incorrect: `Felipe Polo nos habla sobre su experiencia con la IA en el equipo de Orbitant.`

### 2. Speaker intro

After the opening line, introduce the speaker(s) with 🎙️.

**Single speaker:**
> `🎙️ [Full Name], [Title] en [Company], comparte [one-sentence description of what they teach].`

**Multiple speakers (up to 3):** One line per speaker, each with their name, title, and company. If all speakers share the same company, mention it only once on the last line.

If there are more than 3 speakers, group them: list the two or three most prominent by name and add "junto a [N] expertos más" or "and [N] more experts".

Keep it factual. Avoid superlatives.

### 3. Overview (1–2 short paragraphs)

Describe what the viewer will learn. Write for the person who found this through search — they have a specific problem or curiosity and need to know in 3 sentences whether this video answers it.

The **primary keyword** must appear at least once more here, naturally. Secondary keywords should appear where relevant — not forced, not repeated mechanically.

Avoid: "una sesión muy interesante", "a fascinating discussion", "todo lo que necesitas saber sobre".

### 4. Key takeaways list

Open with:
- Spanish: `ℹ️ En esta sesión descubrirás:`
- English: `ℹ️ In this session you'll discover:`

Follow with 4–7 bullet points, each starting with `—` (em dash, no space before the text). Each point should:
- Describe something concrete and actionable
- Reference real tools, techniques, or decisions from the session
- Include secondary keywords naturally where they fit

> Correct: `—Cómo estructurar un pipeline de Claude para generar borradores de blog posts desde transcripts`
> Incorrect: `—Técnicas de productividad con IA`

### 5. Resources section

Only include if there are actual resources to list. Open with:
- Spanish: `🔗 Recursos mencionados en la sesión:`
- English: `🔗 Resources mentioned in the session:`

List each resource on its own line using the format `Nombre: descripción` (colon, not dash). If a URL isn't available yet, use a placeholder: `Blog post: [link próximamente]`.

> Correct: `Langfuse: trazabilidad de agentes`
> Incorrect: `Langfuse — trazabilidad de agentes`

---

## Step 4 — Hashtags

Add 8–12 hashtags after the English version. Always include `#Orbitant`.

Hashtags in YouTube function as category signals, not just labels. Choose them for **search intent**:
- Always include `#Orbitant` — no exceptions
- Use tags people actually search for on YouTube, not internal jargon
- Include the core topic tags (e.g., `#Claude`, `#InteligenciaArtificial`, `#AI`, `#Automatización`)
- Include tool names if they are searchable (`#n8n`, `#Astro`, `#GitHub`)
- Include broader category tags to reach adjacent audiences (`#DevTools`, `#ContentMarketing`, `#SoftwareEngineering`)
- Avoid tags so broad they're meaningless (`#Technology`, `#Video`, `#Learn`)
- Do NOT replace `#Orbitant` with a compound variant like `#OrbitantKS` or `#OrbitantSessions` — those are additional tags, not substitutes

---

## Separator

Between the Spanish and English sections, and after the hashtags, use this exact separator line:

```
________________________________________________
```

---

## Output format

Deliver as **plain text**, ready to paste directly into YouTube. YouTube does not render markdown — no `**bold**`, no `##` headers, no bullet `-` syntax.

```
[Primary keyword — first sentence of Spanish version]

🎙️ [Speaker intro — Spanish]

[Overview — Spanish, primary + secondary keywords woven in naturally]

ℹ️ En esta sesión descubrirás:
—[specific takeaway with secondary keyword]
—[specific takeaway]
—[specific takeaway]
—[specific takeaway]

🔗 Recursos mencionados en la sesión:
[Nombre recurso 1]: [descripción]
[Nombre recurso 2]: [descripción]

________________________________________________

[Primary keyword — first sentence of English version]

🎙️ [Speaker intro — English]

[Overview — English, adapted for English search intent]

ℹ️ In this session you'll discover:
—[specific takeaway]
—[specific takeaway]
—[specific takeaway]
—[specific takeaway]

🔗 Resources mentioned in the session:
[Resource name 1]: [description]
[Resource name 2]: [description]

#tag1 #tag2 #Orbitant

________________________________________________
```

---

## What to avoid

- **No keyword in the opening line**: if the first sentence doesn't contain the primary keyword, the description will not rank.
- **Vague takeaways**: "aprenderás sobre IA" tells nobody anything. Be specific about tools, techniques, and outcomes.
- **Literal translation**: the English keyword is a new keyword research exercise, not a translation of the Spanish one.
- **Descriptive hashtags**: `#KnowledgeSharing` or `#OrbitantSession` have zero search volume. Use tags people actually search.
- **Invented content**: do not add resources, tools, or claims not present in the transcript.
- **Timestamps**: not part of this output.
