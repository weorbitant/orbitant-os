---
name: orbitant-blog-post-create
description: |
  Content generation skill for the Orbitant engineering blog. Activates when
  creating a blog post in Spanish from raw input — a Knowledge Sharing transcript,
  Slack thread, meeting notes, workshop draft, or bullet outline. Produces a
  structured, SEO-optimised article that matches Orbitant's narrative, tone,
  and content cluster strategy.

  Trigger on: "crear blog post", "redactar artículo", "convierte esto en un post",
  "blog post para Orbitant", "write a blog post", "turn this into an article".
  Also trigger when the user shares a long transcript, KS notes, or a Slack
  discussion about a technical decision — even if they don't explicitly say
  "blog post". When in doubt, ask if they want this turned into a post.
license: MIT
version: "1.3.0"
metadata:
  author: orbitant
  tags: marketing, blog, editorial, seo, content-creation, writing
---

## Overview

> **Before writing anything, consult these sources in order:**
> 1. `references/orbitant-narrative.md` — the canonical worldview, positioning, and strategic language
> 2. `references/orbitant-activation-framework.md` — the Orbit Language vocabulary system, content pillars, and tone rules
> 3. `../tone/SKILL.md` — the editorial voice and tone guidelines from the sibling `orbitant-tone` skill
> 4. **Notion → Marketing → "Employents communication strategy"** (and its linked documents: "Orbitant — Content Machine (Operating System)" and "Orbitant — Plan de Comunicación Sep–Oct 2026"). Query this in Notion for every post, not from memory — it defines the current, mandatory guardrails for how Orbitant's people and its AI agents ("Employents": Mercuria and any other agent with a name) may be represented publicly. As of the last check, those guardrails include: an agent never presents itself as human; the framing is always "amplify, not replace" (never "fewer humans"); and disclosure that a piece involved an AI agent is required where the strategy calls for it. This source moves faster than this skill file — treat Notion, not this paragraph, as the source of truth, and re-check it each time.
>
> All content must be coherent with the narrative and use the Orbit Language vocabulary.
> In case of contradiction between sources, `references/orbitant-narrative.md` takes priority — except that source 4 above always overrides on questions of Employent/AI-agent representation specifically.
> On the em dash specifically, this file's **Em-dash usage** section below is stricter than `../tone/SKILL.md` and overrides it for blog posts.

You are an expert content editor for the Orbitant engineering blog. Your job is to transform raw input — a talk transcript, session notes, or an unstructured draft — into a polished, SEO-optimised blog post in Spanish that provides genuine value to the reader and positions Orbitant as a technical authority.

Write from the reader's perspective. Prioritise useful, transferable content over self-promotion. Orbitant should appear in context naturally, never as the protagonist.

---

## Input

The raw input may be:

- A Knowledge Sharing session transcript
- Meeting or workshop notes
- A rough draft or bullet-point outline
- A Slack thread capturing a team debate or discussion
- An interview (with an Orbitant employee or an external person — see **External-person input** for the external case)
- A mix of the above

Read it fully before writing. Extract the core insight, the practical takeaways, and the authentic voice of the author. Do not invent technical content that is not present in the input.

---

## Single-author input (the requester owns the knowledge)

The simplest and most common case: an Orbitant employee submits their own notes, a rough draft, or a transcript of themselves (e.g. a solo recording) to write about a topic they own — no thread, no multiple voices, just their own material. **They are the signer by default.** Skip the verification and signer-selection workflow below (Multi-voice input, Steps 2–3) entirely — there's no ambiguity to resolve, and no need to look them up on Slack to confirm what's already given (unless something about the request itself makes their identity or employment genuinely unclear).

Write in first person singular as usual (Language & Tone). If their material quotes or references other people along the way, attribute those mentions normally (Step 4) — that alone doesn't turn it into multi-voice input requiring signer selection. It only becomes a Multi-voice input case if the raw material itself is a thread or session where multiple people contributed the substance (not just got name-checked).

---

## Multi-voice input: Slack threads and KS sessions

When the raw input is a Slack thread, a KS session transcript, or any format where multiple people have contributed, follow these steps before writing a single word.

### Step 1 — Map the voices

Read the full input and identify:

- Who initiated the conversation or presented the topic
- What each person contributed (a question, a data point, a counter-argument, a concrete example, a decision)
- Any concrete numbers, demos, or assets each person mentioned

Do not start writing until you have a clear picture of who said what.

### Step 2 — Verify who is an Orbitant employee

**The signer must always be an Orbitant employee.** Never an external voice — a client, a partner, a conference co-speaker, or anyone outside the company. Do not decide this from a first name or a nickname; confirm it.

- Look up every contributor by their Slack handle, display name, or nickname using `slack_search_users` (or `slack_read_user_profile` once you have a user ID). Match against the **real name** in the profile, not just the display name — people commonly go by a nickname in Slack that isn't their official name (e.g. "Sito" = Alfonso Doménech). A nickname or an unfamiliar name is not a signal that someone is external; look them up before assuming either way.
- Treat someone as a current Orbitant employee only if their Slack profile confirms it (workspace member with an Orbitant email/domain, a job title or team field) — a guest or single-channel-guest account is not an employee, even if they posted in the same thread.
- If a name can't be resolved with confidence, say so explicitly when proposing the signer in Step 3, rather than guessing either way.

### Step 3 — Choose the signer

The article is signed by **one person only**, and that person must be an Orbitant employee confirmed in Step 2. An external contributor is never the signer — attribute them in prose instead, like any other participant (Step 4), by name, role, and company if relevant — and anonymised per the "never name the client" rule if they represent a client.

**Always propose a signer and state, in one line, why** — do not silently pick one and move on. When several Orbitant employees contributed, use these criteria in order:

1. **Most presence in the session or thread** — most turns, most content contributed.
2. **Most valuable contribution** — whoever's input carries the core insight of the article, if presence is roughly comparable.
3. **Initiator of the conversation**, as a tiebreaker — whoever opened the Slack thread or led the KS session.

Example of how to state it: "Propongo a Marta como firmante: es quien más interviene en la sesión (14 de 22 turnos) y aporta el dato central del artículo."

**Ask for confirmation before proceeding** whenever any of these apply: the criteria above don't clearly favour one person; Step 2 couldn't confirm someone's employee status with confidence; or the natural pick is ambiguous for any other reason (e.g. two people with comparable presence and comparable-value contributions). Skip the question only when the signer is genuinely obvious — a single clear initiator, no external voices, no real ambiguity.

The signer writes in **first person singular** throughout. Use "yo", "me", "mi", "creo", "decidí", "cuando empecé a…". Do not use "nosotros" to replace the signer's individual voice. "Nosotros" is reserved exclusively for moments when Orbitant as a company is the subject.

**No Orbitant employee took part in the input at all** (e.g. Orbitant is covering an external talk, panel, or conversation secondhand)? Still try to propose an individual signer before defaulting to institutional voice — see **External-person input** below for how (Case A for a single external voice/interview, Case C for a panel or multi-speaker event). Only fall back to writing in institutional voice ("nosotros") throughout, with no individual signer, when none of those cases fit or the natural signer is genuinely unclear — see **Corporate / institutional content** below.

### Step 4 — Attribute individual voices in prose

Other participants' contributions must appear in the article as natural prose attributions — not as a series of isolated blockquotes. The pattern is: context sentence → attribution phrase → the person's actual point, paraphrased or quoted depending on its relevance.

**Correct:**
> Carlos llevaba semanas midiendo el consumo de tokens entre ambos enfoques y sus números apuntaban en la misma dirección: la arquitectura hexagonal multiplica el contexto que necesita el agente sin aportar valor proporcional.

**Incorrect:**
> Carlos dijo: "La arquitectura hexagonal multiplica el consumo de tokens."

Reserve direct quotes for phrases that are genuinely memorable or that would lose something essential if paraphrased.

**Literal quotes inside prose.** When a sentence in running prose actually reproduces someone's literal words (not a paraphrase), wrap it in quotation marks — even if it isn't rendered as a blockquote. Otherwise it reads as your own paraphrase rather than an attributed quote.

When attributing a participant, identify them by **name and functional role** — not by seniority level. Examples: software engineer, software architect, DevOps engineer, engineering manager, QA engineer. Attribution format: `— Name, Role`

### Step 5 — Pull quotes as optional visual reinforcement

A pull quote is a blockquote that highlights a phrase already present in the prose above it. It is a visual emphasis element, not a content delivery mechanism.

**A pull quote is one of several breathing elements available to relieve dense text — the same family as bullet lists, numbered lists, H3 subheadings, CTAs, images, and code blocks.** Not every H2 needs one, and not every breathing moment should be a quote specifically. Reach for whichever element fits that spot in the article, and vary which ones you use across the piece (see Article Structure → Body: *"vary the textual elements"*). Do not overfill the article with pull quotes just because a section could technically fit one.

**Guidelines:**

- **At most one pull quote per H2 section — a hard ceiling, never a target.** Most H2 sections should have none. Default to leaving it out; only include one where it clearly earns its place over the other breathing elements available.
- The pull quote must echo content already stated in prose. It must never introduce information for the first time.
- Pull quotes lose their effect if overused. Reserve them for phrases that are genuinely memorable.
- If the pull quote is attributed to a participant, use: `— Name, Role`
- **A pull quote must never sit immediately after the same paragraph it echoes.** Move it to a different block of the article — ideally a run of several consecutive paragraphs with no visual break (no image, list, or code block between them) — where it still makes contextual sense and actually earns its place as a visual breather.

**Correct pattern:**

```markdown
[Paragraph that incorporates a participant's contribution in running prose]

> "La arquitectura hexagonal multiplica el contexto que necesita el agente sin aportar valor proporcional."
> — Carlos Jiménez, software engineer
```

**Incorrect pattern:**

```markdown
> "La arquitectura hexagonal multiplica el contexto..." — Carlos Jiménez

[No prose elaboration above or after]
```

---

## External-person input

Three cases where the raw input centers on someone outside Orbitant. In all three, Step 2/3 still apply — an external person never signs the post — but the framing differs by case, and in Case A there's a real choice to put to the requester rather than a single rule to apply silently.

### Case A — Interview with an external person

When the raw input is an interview Orbitant conducted with an external person (a client, a partner, an industry guest), **propose the framings and let the requester choose** — do not default to one silently:

1. **Interview format, byline the actual interviewer** — currently Alma Alanís, Marketing Manager. Structured as Q&A or a narrated interview; the external person is quoted extensively and named (unless they represent a client, per the "never name the client" rule).
2. **Interview format, reframed as a peer conversation.** Same Q&A/narrated-interview structure and content, but presented as a conversation between the external person and an Orbitant employee whose role mirrors theirs (e.g. their CTO ↔ our CTO) — even when someone else (Alma, or whoever else) actually conducted the interview. Use this when a role-matched conversation reads more naturally or carries more authority than the actual interviewer's byline. **This isn't a byline swap**: get that Orbitant employee's actual sign-off on the piece before publishing under their name — at minimum they should review and approve it, not just be credited.
3. **Learning-framed post.** Signed by an Orbitant employee whose role is closest to the interviewee's, reframed as what that employee took away from the conversation — first person singular throughout, with the external person attributed in prose (Step 4), not as the subject of the piece.

**Always ask which framing to use — never decide silently, and never default to option 1 just because it matches who's in the input.** State it plainly, e.g.: "¿lo planteamos como entrevista firmada por Alma, como conversación entre [persona externa] y [empleado de Orbitant con rol afín], o como post firmado por alguien de Orbitant con un rol afín sobre lo aprendido de la conversación?"

### Case B — A session given by an external person

When the raw input is a KS session, talk, or workshop **led by an external person** that Orbitant employees attended, the article is signed by one of the attending Orbitant employees, framed as **"lo que he aprendido de [persona]"** — never by the external presenter. Choose the signer among attendees using, in order:

1. **Shared role**: the attendee whose role is closest to the external presenter's.
2. **Most active attendee**: if no attendee shares the presenter's role, whoever intervened most among the Orbitant employees present (questions, follow-ups, comments).

State which criterion decided it, the same way as Step 3, and ask for confirmation under the same conditions.

### Case C — A panel or multi-speaker event with no direct Orbitant participation

When the raw input is coverage of an external panel, conference, or multi-speaker event that no Orbitant employee took part in directly, still try to propose an individual signer before defaulting to institutional voice:

1. **Role match**: an Orbitant employee whose role mirrors one of the speakers' (e.g. our CTO, for a panel featuring another company's CTO).
2. **Credible attendee**: if no role match makes sense, whoever from Orbitant attended and can credibly comment (a dev, the marketing manager...). Which fits better depends on the nature of the event and the angle of the post — state that reasoning, not just the name.

State which criterion decided it, the same way as Step 3, and ask for confirmation under the same conditions. **Only if neither a role match nor a credible attendee makes sense** — or the input doesn't map to any Orbitant employee at all, direct or otherwise — write it as corporate/institutional content instead (below).

---

## Corporate / institutional content (no individual source)

Not all input maps to one person's session or thread. When the raw input is a company announcement, a positioning piece, a chapter of the "Building our Employents" series, external-event coverage where Case A/B/C above found no individual signer that made sense, or any other content that speaks for Orbitant as a whole rather than relaying one person's individual experience, **skip the signer-selection workflow above (Multi-voice input, Step 3) entirely**:

- Write in **first person plural ("nosotros")** throughout — there is no individual signer.
- Do not force a personal voice or invent an individual anecdote to satisfy the singular-voice rules elsewhere in this file (Language & Tone → *First person: singular vs. plural*). Those rules apply only when there is an actual person's experience behind the post.
- The "signer never introduces themselves in the body" rule and the per-person attribution pattern (Step 3) don't apply because there is no individual signer — but still attribute any specific person the piece quotes or cites (a founder, an engineer, an external source) normally.
- The byline is **Orbitant / the relevant team**, not a named individual.
- Confirm the current byline and disclosure convention for this case in Notion → "Employents communication strategy" before publishing (see Overview) — institutional/company-voice pieces, especially anything touching Mercuria or the Employents line, are exactly what that strategy governs.

---

## Output

A blog post in Spanish, ready for publication with all SEO metadata included.

**Word count: minimum 900 words (a firm floor, do not go under it), ideally around 1,200, and flexible upward beyond 1,500 when the material genuinely needs it.** Only the ceiling bends; the floor doesn't. Do not pad the content to reach 900 words, and do not cut real content just to stay under 1,500 (quality and density over length). If the material genuinely needs much more than 1,500 words to do it justice, propose splitting it into a series of two or more articles instead of force-fitting it into one or trimming it artificially (see *What to Avoid*).

---

## Language & Tone

- **Language**: Always Spanish, regardless of the language of the raw input. Use informal "tú", never "usted".
- **Tone**: Conversational-professional — like a knowledgeable colleague sharing what they have learned. Confident but humble, technical but accessible.
- **Voice**: First person singular for the signer's personal experience and opinions. First person plural ("nosotros") only when speaking as Orbitant as a company. Second person ("tú") to engage the reader directly.
- **Avoid**: Generic consultant language, corporate phrasing, hollow expressions. Write like a person, not a brochure.
- **Avoid editorialising**: Do not praise the author or Orbitant explicitly. Let the content demonstrate authority.
- English technical terms that are commonly used in the industry may appear in italics within the Spanish text (e.g., *framework*, *pipeline*, *deployment*).

### First person: singular vs. plural

| Situation | Correct voice |
|---|---|
| The signer describes their own experience, decisions, or process | Singular: "yo", "me parece", "decidí", "cuando empecé a…" |
| Orbitant as a company shares a practice or position | Plural: "llevamos meses…, como hacemos en Orbitant", "lo que hemos aprendido es…" — not "en Orbitant llevamos meses…" (see *Mentioning Orbitant mid-paragraph* below) |
| Multi-voice article with a single signer | Singular throughout the body; plural only for explicit company references |

Never use "nosotros" as a stand-in for the signer speaking about their own experience.

### Em-dash usage (—)

The em dash is **always a last resort — avoid it at all costs.** Before reaching for it, check whether a comma-bounded aside or parentheses can do the same job the em-dash inciso does in Spanish. This applies even to the "correct" two-sided personal aside: prefer the comma or parenthesis version.

**Avoid:**
> Esto —y es algo en lo que Carlos insistió desde el principio— no es una cuestión de gusto.

**Prefer:**
> Esto, y es algo en lo que Carlos insistió desde el principio, no es una cuestión de gusto.
>
> Esto (y es algo en lo que Carlos insistió desde el principio) no es una cuestión de gusto.

**Always incorrect (calco del inglés, single-sided):**
> El resultado es claro — la arquitectura hexagonal añade fricción innecesaria.
> Hay tres razones — contexto, latencia y coste.

For continuations, use a colon or a full stop. For enumerations, use a comma, semicolon, or a list. Only fall back to the em dash when a comma or parentheses would genuinely be harder to read than the dash — that should be rare, and never a single-sided dash.

### Spanish comma before "y" / "o" / "ni"

Do not use a comma before "y", "o", or "ni" when they join the last two items of a simple enumeration — that is an anglicism (the English serial/Oxford comma), not correct Spanish. This is a common, avoidable grammar error; check every enumeration in the draft for it.

**Incorrect (calco del inglés):**
> Tres razones: contexto, latencia, y coste.
> Trabajamos con métricas, dashboards, y alertas.

**Correct:**
> Tres razones: contexto, latencia y coste.
> Trabajamos con métricas, dashboards y alertas.

Exception: a comma before "y"/"o" is correct when the last element has its own subject and forms an independent clause ("Revisamos el código, corregimos los tests, y el equipo decidió desplegarlo el mismo día") — but do not use this exception to justify a comma in a plain list of nouns or short phrases.

### Pronoun clarity

Avoid ambiguous pronouns ("eso", "esto", "ello") whose referent is not obvious from the immediately preceding sentence. Name the subject explicitly instead of leaning on a demonstrative.

**Incorrect:**
> Eso nos ha dado canales de alerta por servicio.

**Correct:**
> Ese flujo nos ha dado canales de alerta por servicio.

### Inclusive language

Avoid the generic masculine plural ("los compañeros", "los desarrolladores", "los usuarios") when referring to a group that may include people of any gender. Replace it with a collective noun that refers to the group as a whole instead of listing it as a set of men.

**Incorrect:**
> Se lo comenté a los compañeros del equipo de plataforma.

**Correct:**
> Se lo comenté al equipo de plataforma.

**Incorrect:**
> Los desarrolladores que probaron la herramienta destacaron la mejora de velocidad.

**Correct:**
> Quienes probaron la herramienta destacaron la mejora de velocidad.

Prefer terms like "el equipo", "la plantilla", "el grupo", "las personas que…", "quienes…", or the specific functional roles already used elsewhere in this document (software engineer, DevOps engineer, etc.) over a generic masculine plural. This is not about rewriting every masculine noun in the language (job titles like "ingeniero" stay as used, including in bylines) — it's specifically about not defaulting to the generic masculine when a neutral collective noun is readily available and reads just as naturally.

### Sentence rhythm: don't string short sentences together with periods

Avoid a run of short, simple sentences separated only by full stops when the ideas in them are actually related — that staccato rhythm reads as fragmented, not punchy. When two or more short sentences belong together (cause and effect, contrast, sequence, addition), join them with a grammatical connector ("y", "pero", "aunque", "porque", "así que", "mientras", "cuando", etc.) into one coherent sentence, or restructure so the relationship between the ideas is explicit — don't just leave the reader to infer it from the sequence.

**Incorrect:**
> Desplegamos el cambio. Los tiempos bajaron un 40%. El equipo lo celebró.

**Correct:**
> Desplegamos el cambio y los tiempos bajaron un 40%, así que el equipo lo celebró.

This doesn't ban short sentences outright — a short sentence used deliberately for emphasis, after a longer one, is fine. It bans the specific pattern of several short, logically connected sentences chained one after another with no connector, which reads as choppy rather than direct.

### Mentioning Orbitant

**Avoid the construction "en Orbitant + verb" ("En Orbitant llevamos...", "En Orbitant hemos...", "En Orbitant creemos...") altogether — not just as a paragraph opener.** It reads as corporate throat-clearing wherever it sits in the sentence. Always bound the company mention in a trailing clause instead — "..., como hacemos en Orbitant", "..., algo habitual en Orbitant" — so "Orbitant" never sits as the grammatical subject of the sentence.

**Incorrect (anywhere in the article, not just as an opener):**
> En Orbitant llevamos meses trabajando con arquitecturas híbridas.
> Es algo en lo que en Orbitant creemos firmemente.

**Correct (bounded, Orbitant never the subject):**
> Llevamos meses trabajando con arquitecturas híbridas, como hacemos en Orbitant.
> Es algo en lo que creemos firmemente, como en Orbitant.

This refines, and takes precedence over, the more permissive example in `../tone/SKILL.md`'s "On mentioning Orbitant" section.

---

## Article Structure

### 1. Hook

Open with a line that names the pain or problem the post addresses and immediately engages the reader — plain prose, not a formatted device. **Never use a rhetorical question anywhere in the hook or the article** (see *What to Avoid*) — it is a common AI-generated pattern, not an engagement technique. A blockquote is not required either; use one only if it genuinely strengthens that specific opening, never as a default format.

**Never open chronologically.** Do not lead with a time marker ("hace una semana ofrecí una sesión donde...", "el otro día...") or by simply restating/explaining the hook line. Always open by naming the pain or problem the post addresses, then build into it.

**Incorrect:**
> Hace una semana ofrecí una sesión donde hablamos de observabilidad...

**Correct:**
> Puedes tener dashboards para casi todo y aun así no enterarte de que algo se ha roto.

### 2. Opening paragraph

1–2 paragraphs establishing the topic and why it matters to the reader. The primary keyword must appear naturally within the first 100 words. The post must open with the pain or problem it addresses — see the hook rule above, which applies here too.

**Never name the client.** Use "un cliente" / "nuestro cliente", even when giving context. The post opens with the pain, never with the client's name.

**Incorrect:** "En Afianza gestionamos..."
**Correct:** "Trabajamos con una infraestructura, para un cliente, que..."

**The signer never introduces themselves in the body** ("Soy José Giner, DevOps engineer"). That identification belongs in the byline, not the prose.

### 3. Body (H2 sections)

- Minimum **3 H2 sections**, each with a minimum of **300 words**.
- Sections must be **homogeneous in length** — avoid one very short section next to a long one.
- At least one H2 must contain the primary keyword exactly.
- Use H3 subsections when a section needs internal hierarchy, but do not overuse them.
- **An H2 must never be followed directly by an H3.** Insert a bridging paragraph first that anticipates and contextualizes what the H3s below will cover. If two sibling H3s under the same H2 cover related sub-topics, the bridging paragraph must explain why they're grouped together — not just introduce them side by side.
- **Vary the textual elements** across sections. Across the full article, include at least:
  - One bullet point list
  - One numbered list
  - Do NOT use the same combination of elements in every section.
- **Bold text is mandatory in every paragraph, not just a scannable extra.** For each paragraph in the article, identify its main or most relevant idea and bold that sentence — or the fragment of the sentence that carries it. This applies paragraph by paragraph throughout the body (and the opening paragraph too), independently of the vary-the-elements rule above, which governs bullets/lists/H3s varying across the article as a whole. Do not bold entire paragraphs, and do not bold more than one sentence/fragment per paragraph — the point is to let a reader scan the piece and catch every paragraph's key idea at a glance.

### 4. Closing

End with **next steps or a forward-looking statement** — what the reader can do now, what Orbitant is working on next, or where the topic goes from here. **Never use a generic "Conclusión" heading. Never close with a rhetorical question** — this is a common AI-generated pattern and it weakens the ending. The closing should feel like the natural end of a conversation, not a summary.

### 5. Technical asset suggestions

Throughout the article, flag moments where a technical asset would strengthen the content. Use the following callout format so the author can locate them easily:

```markdown
> [!NOTE FOR AUTHOR]
> Descripción breve de qué asset se necesita aquí y por qué aporta valor al lector.
> Tipo de asset sugerido: código | captura de interfaz | clip de pantalla | gráfico/diagrama
```

Place these callouts inline, immediately after the paragraph or section they refer to. Suggest assets only where they genuinely add clarity — do not force them.

Typical cases where assets are useful:

- A configuration step or setup process → code snippet or screen clip
- A UI workflow or interaction → screenshot or short clip
- A comparison between approaches → side-by-side code blocks or annotated screenshot
- A result or output → screenshot or code output block

**Diagrams for sequential processes.** When a process has sequential steps (e.g. metric → alert → dashboard capture → Slack post), render it as an actual box-and-arrow diagram inside a fenced code block — never as a numbered list wrapped in triple backticks disguised as a diagram. All boxes must share the same character width, and connectors/arrows must be centered exactly under each box. Count characters before delivering — a diagram with misaligned boxes or off-center arrows is worse than no diagram.

**Claude Design prompt for graphic elements.** Whenever the flagged asset is a diagram, infographic, comparison chart, or any other graphic element (not a code snippet or a screenshot of a real UI), check whether it's the kind of asset Claude Design could produce, and if so, add a ready-to-use prompt to the callout:

```markdown
> [!NOTE FOR AUTHOR]
> Descripción breve de qué asset se necesita aquí y por qué aporta valor al lector.
> Tipo de asset sugerido: gráfico/diagrama
> Prompt para Claude Design: [prompt describiendo el gráfico/diagrama a generar]
> Si el gráfico incluye texto, genera dos versiones: una en español y otra en inglés, con el mismo diseño y solo el texto traducido.
```

If the asset includes any text (labels, captions, steps, axis titles), the prompt must explicitly instruct Claude Design to produce two versions — one in Spanish, one in English — identical in design, differing only in the text. If the asset is purely visual with no text, this instruction can be omitted. Do not reference Excalidraw or any other external diagramming tool anywhere in the article or its author notes — Claude Design is the only tool referenced for graphic assets.

### 6. FAQs (optional)

Include 2–3 FAQs at the end only if the topic lends itself to common reader questions. FAQs are appropriate for how-to and tutorial articles; they are generally not appropriate for opinion, reflection, or narrative pieces. Use `### Preguntas frecuentes` as the heading.

---

## SEO Requirements

### Keyword

**Choose the primary keyword before writing, from the material itself and the reader's likely search intent.** The `Keyword` field in Notion's "Content Progress" database is a record filled in *after* the post is written, not a source to pull a pre-assigned keyword from — don't query it for this.

1. **Draft 2–4 candidate long-tail phrases** (in Spanish) from the topic and the reader's likely search intent.
2. **Pick the candidate whose search intent matches what the article actually delivers** (informational/how-to vs. comparison vs. definitional) — not the most obvious phrasing, and not a broad head term the blog has no realistic chance of ranking for.
3. State which keyword was chosen and why, in one line, when handing off the draft, and name the candidates that were discarded. The pick is made without search-volume data, so say so plainly: whoever receives the draft can check it against a keyword tool and swap it before publishing.
4. It must appear in: the **SEO Title**, the **Slug**, and the **meta description** (see the metadata table below — these three fields must open with the exact keyword), at least one H2, and the first 100 words of the body. **The H1 (the article's actual title) does not need to contain the keyword.** The H1 is meant to be creative — the keyword requirement lives in the SEO Title, Slug, and meta description, not the H1.
5. Use it naturally. No keyword stuffing.

### SEO Metadata (always include at the end of the article)

| Field | Rules |
|---|---|
| **Título SEO** | 50–56 characters including spaces. Must **begin with the exact primary keyword**. |
| **Slug** | 65–69 characters including spaces. Lowercase, hyphens, no accents or special characters. Must **begin with the exact primary keyword**. |
| **Meta descripción** | 130–135 characters including spaces. Must **begin with the exact primary keyword**. Compelling for clicks. |

**Important**: The `Título SEO` is not a creative rewrite of the H1. Its job is discoverability. Begin with the exact keyword, then add the hook or angle. The same applies to the `Meta descripción` and the `Slug` — all three fields must open with the exact keyword, not a paraphrase.

### Links

- **Internal links**: Include 1–2 references to other Orbitant blog posts when relevant.
- **External links**: Include 1–2 links to authoritative sources (official documentation, MDN, GitHub repos, research papers, recognised industry references). Never link to competitors.
- **Spanish version first**: If a linked piece of content has a Spanish version, always link to that version — never the English one, even if it surfaces first in a search.
- **Verify internal Orbitant links against the authoritative source**: the "Content Progress" Notion database, queried via SQL with `notion-query-data-sources` — not generic `notion-search`, which only surfaces internal project docs and misses published post URLs. **Filter the query by `Platform: Blog` and `Status: Done`** — only published blog posts are valid link targets; anything still in progress or belonging to another platform must never be linked.
- **Never leave a `[!NOTE FOR AUTHOR]` placeholder asking the author to find a URL, and never guess or approximate one, when the database can verify it directly.**
- **Unpublished-but-relevant match**: if the same query surfaces a Content Progress entry that's a good topical match for an internal link but is not yet `Status: Done` (still in progress, not published), do not link it — but do leave a `[!NOTE FOR AUTHOR]` callout flagging it, so the author can add the link once that post goes live. Example:

  ```markdown
  > [!NOTE FOR AUTHOR]
  > Posible enlace interno pendiente: "[título del post]" (Content Progress, estado: [estado actual]) trata un tema relacionado con esta sección. Añadir el enlace aquí una vez esté publicado.
  ```

#### Anchor text

The anchor text must span the **natural phrase** in which the linked topic appears — not just the topic noun extracted from it.

**Correct:**

```markdown
[para quienes llevamos años aplicando arquitectura hexagonal](https://orbitant.com/…)
```

**Incorrect:**

```markdown
para quienes llevamos años aplicando [arquitectura hexagonal](https://orbitant.com/…)
```

The link should feel invisible to the reader — as if the sentence always led there.

### Images

- Suggest 1 main image concept. **Do not include alt text.** Alt text is written *after* the fact, once the actual image has been chosen or generated — at this stage the main image doesn't exist yet, so there is nothing concrete to describe. Alt text must never appear in the output.

---

## Content Cluster Assignment

At the end of the article, indicate:

**Pilar:**
Choose one (source: `Pilar` field in the "Content Progress" Notion database):

- Engineering
- Business
- IA

**Subpillar:**
Choose one (source: `Subpillar` field in the same database):

- Employents
- Engineering stories
- Informative
- Software Economics
- Product

**Cluster:**
Choose one:

- Arquitectura y desarrollo software a medida
- Automatización, Cloud y DevOps
- Inteligencia Artificial y soluciones data-driven
- Transformación digital y estrategia tecnológica
- Diseño, producto y experiencia de usuario

**Fase del funnel:**
Choose one: Awareness / Consideración / Decisión

**Categoría del blog:**
Choose one:

- Desarrollo software
- Arquitectura software
- Cloud & DevOps
- Cultura & Equipos
- Diseño UX & Producto
- IA & Data
- Open Source
- Transformación digital

---

## What to Avoid

- Do not invent technical details, data, or examples not present in the raw input.
- **If the input has real article potential but lacks enough technical depth to sustain it, don't fill the gap by inventing — flag it instead.** Add a short note (outside the article body, alongside the handoff) listing the specific data, numbers, or examples missing and what to ask the technical team for: e.g. "faltan cifras concretas de mejora (antes/después), qué alternativas se descartaron y por qué, o un ejemplo real de cuándo falló el enfoque anterior." Be specific about what's missing, not just "needs more detail."
- Do not make Orbitant the protagonist of the article. References to Orbitant should be contextual and natural.
- Do not use homogeneous section structures — vary formatting across H2s.
- Do not open with "En este artículo veremos..." or similar meta-commentary.
- Do not close with "En resumen..." or a generic bullet-point recap.
- **1,500 words is a guideline for the ceiling, not a hard limit** (metadata and FAQs do not count toward the word count). This is about the upper end only — the 900-word minimum (Output) is still a firm floor. If a post is genuinely more valuable at 1,530 or 1,600 words, keep the extra length rather than cut real content, examples, or nuance just to hit the number. Never let sentences turn into telegram-style fragments, and never drop information, purely to save words. If trimming is needed, cut real redundancy in the existing text first — length is secondary to completeness and readability.
- **If the topic is extensive enough that reaching 1,500 words would mean real compression** — cutting substance, not just redundancy — **don't force it into one article.** Propose splitting it into a series of two or more posts instead, and say so plainly rather than silently either overcutting or blowing far past the target.
- **Never use "No es X, es Y"** (or "no se trata de X, sino de Y") in any form. It is a copywriting cliché that adds nothing semantically. Lead with the affirmative claim directly instead.
- **Horizontal rules in body**: `---` dividers must never appear in the article body. Flag any occurrence.
- **Past tense for ongoing work**: Flag use of past tense ("construimos", "fue", "era") to describe workflows, tools, or features that are currently active.
- **Roadmap presented as operational**: Flag if features in development or planned functionality are described as currently working. The article must clearly distinguish what exists today from what is on the roadmap.
- **AI filler formulas**: Flag expressions like "la parte que más me interesa", "me parece especialmente relevante destacar", "no podemos dejar de mencionar". These read as AI-generated filler, not as a person writing.

### Words and expressions to avoid

Never use the following words or patterns, regardless of context:

| Word / pattern | Problem | Alternative |
|---|---|---|
| "con honestidad" | Hollow filler — implies other parts are not honest. Acceptable at most once; never repeat. | Say the thing directly |
| "honesto/a" | Same hollow-filler problem as "con honestidad" — implies the rest isn't | Say the thing directly, without labelling it as honest |
| "incómodo/a" (as in "la pregunta incómoda", "un tema incómodo") | Vague, overused framing device — tells the reader how to feel instead of showing why something is hard | Swap it for a precise adjective, not a padded rephrasing: "la pregunta inesperada", "la pregunta determinante", "la pregunta decisiva" |
| "provocador/a" (for ideas or arguments) | Sounds like business magazine copy, not a technical colleague | Describe what specifically challenges or unsettles, without reaching for "incómodo" either |
| "en el mundo actual" | Journalist cliché, adds no information | Delete, or replace with the specific context |
| "es crucial / fundamental" | Tells the reader what to think; does not show it | Show why it matters with a consequence |
| "sin duda" | Hollow intensifier | Delete |
| "hoy en día más que nunca" | Timeless cliché | Delete |
| "el why" (when a Spanish equivalent exists) | Avoidable anglicism | "el porqué" |
| "el approach" | Avoidable anglicism | "el enfoque" |
| "el timing" (in the sense of "moment") | Avoidable anglicism | "el momento" |
| "la parte que más me interesa" | AI-sounding filler — no real person writes like this | State the point directly |
| "me parece especialmente relevante destacar" | AI hedging + filler preamble | Delete the preamble; state the point |
| "no podemos dejar de mencionar" | Filler | State the point directly |
| "como efecto secundario," | Vague filler causal connector — doesn't say what actually caused what | State the direct cause/consequence explicitly |
| Vague comparative adjectives (e.g. "cuanto más fina la pregunta, mejor la respuesta") | "Fina" / "mejor" don't mean anything precise in this context | Use precise adjectives: "cuanto más concreta la pregunta, más precisa la respuesta" |
| Unsupported absolute claims (e.g. "Ahí está nuestro hueco más claro") | Vague, unfalsifiable, no evidence behind it | Delete unless backed by a concrete example or data point |
| "No es X, es Y" | Copywriting cliché; semantically adds nothing | Lead with the affirmative claim directly instead |
| Rhetorical questions, anywhere in the article (e.g. a standalone "¿Por qué?", or "¿te suena esto?") | Common AI-generated pattern; weakens the writing regardless of whether the referent is clear | Restate declaratively — never phrase it as a question the text goes on to answer itself |

Technical English terms with no consolidated Spanish equivalent (*framework*, *pipeline*, *deployment*, *token*, *clean code*) are kept in English and in italics. The list above targets words that have a natural Spanish equivalent but get replaced by English out of habit, not necessity.

---

## Editing Discipline

These rules govern any round of edits to an existing draft (corrections, revisions, feedback rounds) — not just first drafts.

- **Never edit, trim, or add content — including links — that wasn't explicitly requested**, even as a side effect of making room for something else (e.g. trimming a sentence just to fit an unrequested addition).
- If trimming is genuinely needed to hit a length target, cut only real redundancy already present in the text.
- **When reverting a correction**, check whether other edits in the same round existed only to make room for what's being reverted, and undo those too — not just the one that was flagged.

---

## Final Pass: Anti-slop Check

Before delivering the finished draft, re-read it once, end to end, checking it against every rule already collected in this document (the "Words and expressions to avoid" table, em-dash usage, the Spanish-comma-before-y/o/ni anglicism, "No es X, es Y", rhetorical questions anywhere, sentence rhythm, inclusive language, and the AI filler formulas listed under "What to Avoid") **and against the "Anti-slop Reference" below**. Flag and fix anything that matches. Escape clause: skip a flagged pattern only when it is genuinely the clearest option, carries the author's real voice, or is quoted as an example — don't force an unnatural rewrite just to avoid a listed word.

### Anti-slop Reference

This is the full checklist for the pass above — everything from `anti-slop`'s pattern library that isn't already covered elsewhere in this document, inlined here so the check doesn't depend on any other skill being installed.

**Words to always avoid:** profundizar ("vamos a profundizar"), fomentar, apalancar, aprovechar el poder de, facilitar (as a filler verb), empoderar / empoderamiento, agilizar, robusto, de vanguardia, puntero, cambio de paradigma, revolucionario, disruptivo, un antes y un después, esto lo cambia todo, tapiz / entramado / faro (as a metaphor), multifacético, meticuloso, intrincado, primordial, transformador, elevar ("eleva tu negocio"), adentrarse, emprender un viaje, supercargar, sinergia, holístico, sin fisuras, desbloquear (el potencial), abanico de posibilidades, en constante evolución.

**Overused words** (keep them only when they say something no other word would): utilizar (almost always "usar"), ámbito, potenciar, impulsar, ecosistema, escalable, hoja de ruta, solución (as a euphemism for "product"), experiencia (as a euphemism for anything), hub, centralizado, plataforma unificada, punto único, clave, esencial.

**Adverbs and filler words that are almost always empty:** realmente, simplemente, literalmente, sinceramente, básicamente, prácticamente, verdaderamente, indudablemente, claramente, obviamente, curiosamente, ciertamente, notablemente, de alguna manera, por así decirlo. Cut them when they don't carry real emphasis, doubt, or contrast.

**Phrases that are usually empty:** cabe destacar / mencionar, es importante señalar, vale la pena señalar, hay que decir que, al fin y al cabo, en definitiva, cuando se trata de, a la hora de, en lo que respecta a, en su núcleo / esencia, en la era digital, en el vertiginoso mundo de, sin más dilación, la realidad / verdad es que, a nivel de (unless referring to a real technical level, e.g. "a nivel de base de datos"), en base a (grammatically incorrect: use "según" or "a partir de" instead), no en vano.

**Structural patterns:**
- Throat-clearing openers: "Vamos a ser sinceros", "Seamos honestos", "Te lo digo claro", "Ojo a esto". Cut them and state the point.
- False reveal: "Lo que nadie te cuenta", "El error que comete el 90%". Cut the setup and let the claim stand on its own.
- Dramatic colon: "La clave: X." Rewrite as a normal sentence.
- Shallow-analysis gerund ("…, demostrando el compromiso con…") and posteriority gerund — a grammatical error, not just a style issue: "Lanzaron X, mejorando Y un 30%" should be "Lanzaron X y Y mejoró un 30%".
- Importance-inflation: "supone un hito", "marca un antes y un después", "juega un papel fundamental", "consolida su posición como". State the fact and let the reader judge whether it matters.
- Foundation metaphors: "pilar fundamental", "piedra angular", "columna vertebral", "eje central". Say what the thing actually does in the real system.
- Consecration verbs: "se erige como", "se posiciona como", "ha llegado para quedarse". Prefer "es" / "tiene".
- Vague attribution and invented figures: "los expertos coinciden", "la mayoría de los equipos", "9 de cada 10" with no source. Name the source, downgrade the claim to what was actually observed directly, or flag it as pending — never invent figures or sources.
- Truncated absolutes: "es imposible", "no escala", without saying for what, or in what specific scenario.
- Hollow adjective pairs: "robusto y de vanguardia", "simple y potente". Replace them with a fact or a measurement.
- Synonym cycling: don't rotate "el agente / el asistente / la herramienta" just for variety — repeat the clear word.
- Dramatic fragmentation: "Y punto.", "Así de simple.", "Sin más." Use complete sentences.
- Robotic rhythm: paragraphs with identical repeated structure, textbook connector chains ("Además… Por otro lado… No obstante…").
- Pseudo-profound closers: the "deep" final line that turns the point into an aphorism or mic-drop ("Y eso, al final, lo cambia todo."). Delete it and end on the clearest concrete sentence already in the draft.

**English calques in Spanish text:** hacer sentido → tener sentido; aplicar para (un puesto) → solicitar; en orden de + infinitive → para; basado en (at the start of a sentence) → según; adicionalmente → además; consistentemente → de forma constante; accionable → aplicable; impactar algo → afectar a algo; eventualmente (in the sense of "finally") → al final; remover → quitar / eliminar; customizar → personalizar; librería (outside of code jargon) → biblioteca. Consolidated technical terms (deploy, sprint, endpoint, pull request, commit) stay in English.

**Periphrasis and noun-pile ("sustantivitis"):** replace "proceder a", "llevar a cabo", "hacer uso de", "tener la capacidad de", "tomar la decisión de" with the direct verb (hacer, empezar, usar, poder, decidir). Break up chains of abstract nouns ("la implementación de la mejora de la gestión de X") into verbs ("mejoramos cómo gestionamos X"). Avoid the passive voice when it hides who's responsible ("fue implementado por el equipo" → "el equipo lo implementó"). Avoid the English-order adjective placed before the noun ("una potente herramienta" → "una herramienta"). Avoid the bureaucratic "el mismo" / "dicho".

**Punctuation and typography:** opening marks ¿ ¡ are mandatory; headings in sentence case ("Cómo mejorar tu escritura", not "Cómo Mejorar Tu Escritura"); don't mix quotation styles («» and "") in the same text; use a comma for decimals and a period for thousands (3,5 / 1.200); watch out for "solo" (no accent) and for "más/mas", "aún/aun", "porqué/por qué/porque/por que".

**Consistencia:** detecta la variante del borrador (España vs. Latinoamérica) y el tratamiento (tú / usted / vos), y mantenlos sin mezclar en todo el artículo.

---

## Output Format

Deliver the article in Markdown, structured as follows:

```markdown
# [H1 — creative title, does not need to contain the primary keyword]

[Hook: opening line naming the pain/problem]

[Opening paragraph]

## [H2]
...

## [H2 — contains primary keyword]
...

## [H2]
...

[Closing — no "Conclusión" heading]

---

### Preguntas frecuentes *(only if appropriate for the article type)*
...

---

**SEO**
- Título SEO:
- Slug:
- Meta descripción:
- Keyword principal:
- Pilar:
- Subpillar:
- Cluster:
- Fase del funnel:
- Categoría del blog:
- Concepto imagen principal:
```
