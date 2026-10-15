---
name: orbitant-yt-description
description: |
  YouTube title and description generator for Orbitant videos: Knowledge Sharing (KS)
  sessions and Asteroids. Takes a session transcript (.vtt or plain text) and produces
  one title plus a bilingual, SEO-optimised YouTube description — built around a
  positionable keyword placed in a varied opening hook, concise non-repetitive blocks,
  verified resources with real URLs, a newsletter CTA per language, and bilingual hashtags
  chosen for search intent. Use this skill whenever someone needs to write or generate a
  YouTube title or description for a KS session, an Asteroid or any Orbitant video — even
  if they just say "escribe la descripción del vídeo", "I need the YouTube copy", or "help
  me upload this session". Also trigger when given a transcript and asked to prepare
  anything for a video upload.
license: MIT
version: "1.2.0"
metadata:
  author: orbitant
  tags: marketing, youtube, seo, video, content, ks-sessions, asteroids, title, description, bilingual, keywords
---

## Overview

You are writing the YouTube title and description for an Orbitant video. There are two formats:

- **Knowledge Sharing (KS):** longer sessions (30–60 min), often with Q&A.
- **Asteroid:** short sessions (5–10 min) on one tool, trick or problem.

The output does two things at once: it convinces a viewer who lands on the page to watch, and it tells YouTube and Google what the video is about so it surfaces in relevant searches.

**Positioning is the primary goal, but concision is non-negotiable.** A description that ranks but reads as padded, repetitive or AI-generated damages the brand. Every block must earn its place and add something the other blocks don't say.

Read the transcript in full before writing anything. Do not invent content not present in the input.

---

## Step 0 — What you need to write well

Work with the material you are given. Never stop to ask for something missing: write the best output possible with what you have and flag the gaps in the notes after it.

**Required:**
- The session transcript (.vtt or plain text).

**Optional (use them if you have them; if not, write anyway):**
- The speaker's full name, or names if there are several. Use them exactly as given; they are the reference to correct the transcript. Without a name, see "Speaker not named in the input" in Step 4.
- The speaker's job title and company. If not given, use the name only.
- The last 5–10 published YouTube titles and descriptions: do not repeat their title formula or hook type (see Steps 2 and 4).
- The thumbnail title, the session title or description from the planner, the Slack thread about the session: they usually have names of people, companies and tools spelled correctly.
- Verified URLs for the tools mentioned (see Step 5).

1. **Fix transcription errors.** Zoom transcripts regularly mangle names of people, the company and tools. Correct them with the material you were given and this list of errors already seen:
   - "Keith Martínez" → Kevin Martínez
   - "órbita", "órbitan" → Orbitant
   - "T, www, E, F", "testing Df" → TWD
   - "Twee" → tester-army/e2e
   - "Cloud" (when the speaker means the AI) → Claude
   - "Mad Pocock" → Matt Pocock
   When a name looks wrong and you cannot confirm it with the material, do not guess: write the most likely form followed by a question mark in parentheses (`Laia (¿Laya?)`) and flag it in the notes.

2. **Distinguish methodologies from tools.** A methodology (TDD, red-green-refactor) is not a tool (TWD). Never merge them, never describe one as the other, and never list the same tool twice under different descriptions.

---

## Step 1 — Keyword research

### Primary keyword (one per language version)

The search phrase a potential viewer would type into YouTube or Google to find this content. It must:
- Reflect what the session **actually teaches**, not just what it's about
- Have real search intent (someone trying to solve a problem or learn a skill)
- Use **the words people actually type**, not the vocabulary of a talk or a formal document

The English keyword is its own research exercise, not a translation of the Spanish one.

### Secondary keywords (2–4 per language version)

Tool names, technique names and broader category terms. They appear where they fit naturally — never forced, never repeated mechanically.

---

## Step 2 — Title

Deliver **one title**: the one that best meets every criterion below. Do not offer alternatives; if it doesn't fit, the user will ask for another one.

YouTube titles do **not** follow the blog's SEO title rules (exact keyword first, never "Cómo"). They are less strict: the keyword must be early and the phrasing searchable, and any formula in the bank below is valid, "Cómo…" included, as long as formulas rotate.

### Criteria every title must meet

- **Searchable phrasing.** Would someone type these exact words into YouTube? Noun-only titles are fine when the nouns are the ones people use; the failure is formal or uncommon vocabulary.
  - Avoid formal or administrative register ("previo a", "mediante", "en el ámbito de", "implementación" when "programar" or "desarrollar" is what people say).
  - ❌ `Diseño visual previo a implementación con IA`
  - ✅ `Diseño de UI con Claude Code antes de programar`
- **Primary keyword within the first ~40 characters.**
- **Count the full title, speaker name included.** When you have the speaker name, it is part of the title, so it eats into the length budget: choose a shorter session title when the speaker's name is long. Keep the full title (session title, separator and speaker name) within **~70 characters**, which is roughly what YouTube shows in search results before truncating; the hard limit is 100. Because the end may still be cut on some screens, the keyword must sit in the session title, never after it.
  - `Diseña la UI antes de programarla, sin salir de Claude Code — David Rueda` (73 characters: too long, shorten the session title)
  - `Diseña la UI con Claude Code antes de programar — David Rueda` (61 characters)
- **Reads naturally out loud.** If it sounds like a report heading, rewrite it.
- **No descriptive situation titles** (`Cuando le describes la UI a Claude y nadie sabe cómo va a quedar`): they read empty and run past the character limit. The problem belongs in the description's hook, not in the title.
- **Spanish titles in sentence case** (`Diseña la UI antes de programarla`, not `Diseña La UI Antes De Programarla`).
- **If you have the thumbnail title, treat it as an angle, not the YouTube title.** It can inspire the title but it is designed for the image, not for search (e.g. thumbnail `Design mixed with implementation` is not searchable).

### Format

- **Never use emojis in YouTube titles.** The emojis used in internal planning headlines (☄️, ⏯️) are labels only and never go on the channel.
- **Asteroid and KS:** `[Title] — [Speaker full name]`. The speaker name is always included when you have it, in both formats. With several speakers, list the names separated by " y " (`… — Kevin Martínez y David Rueda`); if they don't fit within the length budget, keep the main speaker only and flag it.

### Formula bank — rotate them

| Formula | Example |
|---|---|
| Thesis / statement | `Diseña la UI antes de programarla, sin salir de Claude Code` |
| Tools + outcome | `Superpowers, prototype y /design: ver la UI antes de programarla` |
| Number | `3 herramientas para diseñar la UI con Claude Code` |
| From A to B | `Del prompt a la pantalla: diseña la UI con Claude Code` |
| How + verb | `Cómo evitar que la IA amplifique la deuda técnica en software` |

**If you have the most recent published titles, do not use the formula of any of the last 2–3.** "Cómo…" in particular must not become the default.

---

## Step 3 — Language order

- Session primarily in Spanish → Spanish version first, English second.
- Session primarily in English → English first, Spanish second.
- Both versions are always present. The English version is an adaptation for English search intent, not a literal translation.
- No separator line between versions — leave a blank line.
- **Timestamps are not part of this output.** They are added separately after publication.

---

## Step 4 — Write the description

Structure for each language version, in this order. Target length: **~120–160 words per language** (excluding resources and hashtags).

### 1. Opening paragraph and hook (critical for SEO)

The opening is a **paragraph**, not a single sentence. It can run 2–3 sentences and give context. The constraint applies only to its **first ~150 characters**, which is what YouTube shows in search results before "Show more": those characters must contain **both the hook and the primary keyword**. Whatever comes after them in the paragraph adds context and must not repeat the speaker intro or the takeaways.

**The hook states something concrete from the session.** It works because it is specific (a real situation, a real consequence, a real result), not because of a rhetorical device.

**Forbidden hook devices (Orbitant style):**
- Rhetorical questions (`¿Cuántas veces te ha pasado…?`, `¿Y si te dijéramos que…?`)
- "No es X, es Y" / "X no desaparece: se multiplica" contrast formulas
- Staccato chains of short sentences separated by full stops (`Creas un worktree. Lanzas la app. Falla.`): join related ideas with a connector instead. Addressing the viewer as "tú" is fine (`Puedes tener dashboards para casi todo y aun así no enterarte de que algo se ha roto.`)
- Generic consultant phrases (`En el mundo actual…`, `Es crucial…`)

**Vary the hook.** Do not open every description with "Aprende a…" / "Learn how to…". Rotate among these hook types, choosing the one that fits the session, and, if you have the recent published descriptions, avoid the type used in the last 2–3:

| Hook type | Example (first ~150 characters) |
|---|---|
| Concrete problem from the session | `Describir la UI en texto a un agente de IA lleva a pantallas que nadie ha visto antes de programarlas. Diseñar la UI con Claude Code antes…` |
| Result or outcome | `Un workflow real de desarrollo frontend con agentes de IA, probado en producción, para evitar que la IA amplifique la deuda técnica…` |
| The speaker's real case | `Al crear un worktree nuevo en Orca, la app fallaba porque el .env no se copiaba. Así se comparte el .env entre git worktrees…` |
| Tool or technique + what it solves | `Superpowers, la skill prototype de Matt Pocock y /design permiten diseñar la UI con Claude Code antes de escribir código…` |
| Learn / discover (use sparingly) | `Aprende cómo evitar que la IA amplifique la deuda técnica en proyectos de software mediante un workflow real…` |

### 2. Speaker intro

One sentence with 🎙️. Say **what the speaker did or built and what it achieves**, not only what they talk about.

> ✅ `🎙️ Kevin Martínez, Software Architect en Orbitant, explica cómo estructuró el trabajo de su equipo para integrar agentes de IA en el desarrollo de software, manteniendo el control del código, de los estándares técnicos y de la calidad del resultado.`
> ❌ `🎙️ Kevin Martínez, Software Architect en Orbitant, comparte su experiencia sobre IA y deuda técnica.`

Multiple speakers (up to 3): one line each; mention the company once if shared. More than 3: name the two or three most prominent and add "junto a [N] ponentes más" / "and [N] more speakers" (never the generic masculine "expertos"). Use the job title and company given in the material; if none is given, use the name only. No superlatives.

**Speaker not named in the input:** do not invent a name, a title or a company. Write the title without `— [Speaker]`, and write the 🎙️ line in the third person with a neutral phrase ("la persona que da la charla", "the speaker"): `🎙️ La persona que da la charla comparte […]`. Use that same phrase wherever the description refers to them, so a name can replace it later. Never write their talk as Orbitant's ("os contamos", "we share"). Flag in the notes that the name is missing.

### 3. Overview (optional)

Include **only if it adds something the hook, speaker intro and takeaways don't already say** (context, the problem behind the session, the running example). Maximum 2–3 sentences. If removing it loses nothing, remove it.

### 4. Key takeaways

Open with:
- Spanish: `ℹ️ En esta sesión descubrirás:`
- English: `ℹ️ In this session you'll discover:`

Then **5–7 bullets** starting with `—` (em dash, no space before the text). Each bullet:
- Is short: **~12 words maximum**. Noun phrases are welcome.
- Names a concrete tool, technique or decision from the session.
- Says something no other bullet or block says. No two bullets may express the same idea.
- **Varies its opening.** Bullets must not start the same way (`—Cómo… —Cómo… —Cómo…`, `—Por qué… —Por qué…`). Mix noun phrases, "Cómo", "Por qué", "Dónde", a tool name… and use each opening word at most once per list (twice at most in a 7-bullet list).
  - ❌ `—Cómo funciona…` / `—Cómo aplicar…` / `—Cómo usar…` / `—Cómo encajar…`
  - ✅ `—Por qué diseñar en prosa…` / `—Visual Companion de Superpowers: …` / `—La skill prototype de Matt Pocock…` / `—Dónde encaja cada herramienta…`

> ✅ `—El desarrollador como team lead de su propio agente de IA`
> ✅ `—Contratos OpenAPI para mantener los mocks de frontend sincronizados con el backend`
> ❌ `—Cómo validar visualmente una pull request con testing frontend con IA en un navegador real, sin cambiar de entorno` (too long, keyword stuffed)

### 5. Newsletter CTA (always)

Last line of each language version:
- Spanish: `📩 Más insights en nuestra newsletter: https://orbitant.com/#newsletter`
- English: `📩 Get more insights in our newsletter: https://orbitant.com/en/#newsletter`

Each language links to its own page — never the Spanish URL in the English version.

---

## Step 5 — Resources

A **single block, in English, after the English CTA** and before the hashtags. Only include it if there are resources that qualify.

Open with: `🔗 Resources mentioned during the session:`

**What qualifies:**
- Specific repos, libraries or tools the viewer probably doesn't know and would want to try — including those mentioned by attendees in the Q&A.
- A URL only if it was given to you or verified. Never write a URL from memory: it may not exist. If you have no verified URL, write the name followed by `(enlace por confirmar)` and flag it in the notes; whoever publishes the video fills it in.

**What does not qualify:**
- Widely known products (Claude Design, Claude Code, Figma, Cypress…).
- Generic standards or concepts (OpenAPI, TDD).
- The newsletter (it is the CTA, not a resource).

Format: `[Name], [short description]: [URL]` — multiple URLs joined with `&`. Without a verified URL: `[Name], [short description] (enlace por confirmar)`.

> `TWD, a front-end testing tool that runs tests directly in the application's browser: https://twd.dev/ & https://github.com/BRIKEV/twd`
> `tester-army/e2e, a library for generating AI-powered test scenarios based on use cases: https://github.com/tester-army/e2e`

---

## Step 6 — Hashtags

8–12 hashtags after the resources block (or after the English CTA if there are no resources).

- **The 3 most relevant hashtags go first.** YouTube shows the first three hashtags above the title, so order the block by relevance: the three that best match the primary keyword and the session's main tool or topic lead, the rest follow.
- **Do not include `#Orbitant`** or any variant (`#OrbitantKS`, `#OrbitantSessions`): nobody searches for them and they take a slot from a tag with search intent.
- **Bilingual when the term differs and is meaningful**: include both versions (`#InteligenciaArtificial #ArtificialIntelligence`, `#DeudaTecnica #TechnicalDebt`, `#AgentesIA #AIAgents`). Terms that are the same in both languages appear once (`#ClaudeCode`, `#DevTools`).
- Prefer specific over generic: `#FrontendTesting` over `#Testing` + `#Frontend`.
- Include the session's own tools even if niche (`#TWD`, `#Superpowers`).
- Avoid meaningless tags (`#Technology`, `#Video`, `#Learn`) and zero-volume labels (`#KnowledgeSharing`).

---

## Writing rules (both languages)

Orbitant's voice is defined in the `tone` skill. Everything else this skill needs to avoid AI-sounding copy is written below, so it does not depend on any other skill.

**What does not carry over from the blog:** brand personality and narrative. YouTube descriptions are short and exist to position the video, so they go straight to the point: concise, concrete, keyword-driven. Do not use Orbitant's Orbit Language (orbit, gravity, thrust, escape velocity…), and always prefer the term people search for ("deuda técnica", not "gravity"). Orbitant appears only in the speaker intro and the newsletter CTA.

- **Write the Spanish natively, never as a mental translation from English.** The most frequent failure is a sentence that is grammatical but that no Spanish speaker would write: English calques and word-for-word structures. Also do not copy the speaker's spoken phrasing literally from the transcript; oral Spanish ("mover la decisión cuando todavía es barata") reads wrong in writing. Rewrite the idea the way a Spanish editor would.
  - ❌ `En lugar de describir el diseño en texto turno tras turno, lo ves y lo decides cuando cambiarlo todavía es barato.` ("turn after turn" and "while it's still cheap" calqued; "lo decides" has no clear referent)
  - ✅ `Con estas herramientas puedes ver varias propuestas de diseño y elegir una antes de escribir código, cuando cambiar de idea aún no cuesta nada.`
  - Typical calques to catch: "barato/caro" for decisions or changes, "turno tras turno", "hacer sentido", "en orden de", "basado en" at the start of a sentence, "aplicar para", "eventualmente" meaning "finally", "impactar algo", "accionable".
  - Test: read each Spanish sentence aloud. If it sounds translated, or you need the English to understand it, rewrite it.
- **Acronyms in Spanish:** first mention = full form + acronym in parentheses, then the acronym only. `Test-Driven Development (TDD)`, `interfaz de usuario (UI)`, `pull request (PR)`. Product names (TWD) are not expanded.
- **No repetition across blocks.** The keyword goes in the hook; it may reappear only where it is natural. Never repeat a phrase to "reinforce" SEO.
- **No rhetorical questions and no "No es X, es Y" / "no se trata de X, sino de Y"** anywhere: hook, overview, takeaways or titles. State the affirmative claim directly.
- **Register:** informal "tú", never "usted". Direct, practical, human. No brochure or consultant language ("en el mundo actual", "es crucial", "cabe destacar", "a la hora de", "a nivel de" outside a real technical level, "en base a").
- **Forbidden AI-slop words (never use, in any form or tense):**
  - Spanish: honesto/a, con honestidad, incómodo/a ("la pregunta incómoda"), sostener ("sostener un sistema", "lo que sostiene…"), provocador/a, profundizar, adentrarse, fomentar, apalancar, empoderar, aprovechar el poder de, desbloquear (el potencial), elevar, supercargar, robusto, de vanguardia, puntero, revolucionario, disruptivo, transformador, cambio de paradigma, un antes y un después, esto lo cambia todo, sinergia, holístico, sin fisuras, multifacético, meticuloso, intrincado, primordial, tapiz, entramado, faro, abanico de posibilidades, en constante evolución, emprender un viaje.
  - English: honest/honestly, uncomfortable, delve, leverage, harness, empower, unlock, elevate, supercharge, robust, seamless, cutting-edge, game-changing, revolutionary, transformative, paradigm shift, synergy, holistic, tapestry, landscape, navigate (figurative), journey (figurative).
- **Empty words (cut unless they carry real meaning):** realmente, básicamente, simplemente, literalmente, sinceramente, prácticamente, claramente, obviamente, de alguna manera, por así decirlo, clave, esencial, potenciar, impulsar, ecosistema, escalable, solución (as a euphemism for "product"), utilizar (use "usar"). English: really, basically, simply, literally, truly, key, essential.
- **AI-sounding structures:** false reveals ("Lo que nadie te cuenta"), dramatic colons ("La clave: X"), importance inflation ("marca un antes y un después", "juega un papel fundamental"), foundation metaphors ("pilar fundamental", "piedra angular"), consecration verbs ("se erige como", "ha llegado para quedarse"), pseudo-profound closing lines, synonym cycling (repeat the clear word instead of rotating "el agente / el asistente / la herramienta"), invented figures or vague attributions ("la mayoría de los equipos").
- **Concrete over abstract.** Name the tool, the technique, the decision or the result from the session. No hollow adjective pairs ("simple y potente").
- **Inclusive language:** avoid the generic masculine plural when a collective noun works ("el equipo", "quienes…", "las personas que…").
- **No comma before "y" / "o" / "ni"** in a simple enumeration (`contexto, latencia y coste`).
- **No shallow-analysis or posteriority gerunds** (`…, demostrando el compromiso con…`, `Lanzaron X, mejorando Y`).
- **Orbitant as context, never as subject.** Never use "En Orbitant + verb" constructions.
- **Em dash (—):** forbidden as punctuation anywhere in the description, in both languages and in any form (single- or two-sided). Use a colon, comma, parentheses or full stop instead. It is allowed only as a fixed format element: the separator between title and speaker in titles (`[Title] — [Speaker]`) and the takeaway bullet marker. This is stricter than the em-dash note in `tone` and overrides it for YouTube copy.
- **English technical terms** with no consolidated Spanish equivalent (pull request, workflow, prompt, framework) stay in English. YouTube has no italics, so write them in plain text.
- **No filler:** "una sesión muy interesante", "a fascinating discussion", "todo lo que necesitas saber sobre", "Here is everything you need to know".
- **Plain text only.** YouTube does not render markdown: no `**bold**`, no `##`, no `-` bullets.

### Final pass before delivering

Re-read the full output once and check:

- [ ] Every Spanish sentence reads as written by a native editor: no calques, no literal transcript phrasing, no pronoun without a clear referent
- [ ] The first ~150 characters of each version contain the hook and the primary keyword
- [ ] If you had the recent published descriptions, the hook type and title formula differ from the last 2–3
- [ ] No rhetorical question, no "No es X, es Y", no staccato chain of short sentences
- [ ] No block repeats an idea from another block; no two takeaways say the same thing
- [ ] Every takeaway is ~12 words or fewer
- [ ] No word from the anti-slop lists, no comma before "y" in enumerations, no em dash used as punctuation in the description
- [ ] Spanish acronyms expanded on first mention
- [ ] Names of people, company and tools corrected; unconfirmed ones marked `(¿…?)` and flagged
- [ ] Each newsletter CTA links to its own language page
- [ ] Resources: only lesser-known tools; URLs only if verified, otherwise `(enlace por confirmar)`
- [ ] Hashtags: the 3 most relevant first, no #Orbitant, bilingual where the term differs
- [ ] Takeaways don't start with the same word

---

## Output format

Deliver as plain text, ready to paste into YouTube:

```
Título:
[Title] — [Speaker]

[Opening paragraph — hook + primary keyword in the first ~150 characters — Spanish]

🎙️ [Speaker intro — Spanish]

[Optional overview — Spanish, only if it adds something new]

ℹ️ En esta sesión descubrirás:
—[takeaway]
—[takeaway]
—[takeaway]
—[takeaway]
—[takeaway]

📩 Más insights en nuestra newsletter: https://orbitant.com/#newsletter

[Opening paragraph — hook + primary keyword in the first ~150 characters — English]

🎙️ [Speaker intro — English]

[Optional overview — English]

ℹ️ In this session you'll discover:
—[takeaway]
—[takeaway]
—[takeaway]
—[takeaway]
—[takeaway]

📩 Get more insights in our newsletter: https://orbitant.com/en/#newsletter

🔗 Resources mentioned during the session:
[Name], [description]: [URL]

#MostRelevant1 #MostRelevant2 #MostRelevant3 #tag #tag ...
```

After the output, add at most a few one-line notes for anything that must be verified: a missing speaker name, uncertain name corrections, URLs marked `(enlace por confirmar)`. Do not explain your internal reasoning or decisions the user didn't ask about.

---

## What to avoid

- Opening every description with "Aprende a…" / "Learn how to…", or every title with "Cómo…".
- Rhetorical questions, "no es X, es Y" contrasts or staccato chains of short sentences in hooks and titles.
- A hook paragraph whose first ~150 characters miss the hook or the primary keyword.
- Formal or uncommon vocabulary in titles and keywords.
- Paragraphs or bullets that restate each other.
- URLs written from memory or never verified.
- Listing widely known products or generic standards as resources.
- Confusing a methodology with a tool, or keeping transcription errors in names.
- Spanish newsletter URL in the English version.
- Invented content, resources or claims not in the transcript.
- Timestamps.
