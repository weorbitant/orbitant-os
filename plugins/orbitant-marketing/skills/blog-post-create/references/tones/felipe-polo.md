# Author voice profile: Felipe Polo (CEO, Orbitant)

Load this file whenever the signer of a blog post is Felipe Polo. It describes how Felipe thinks and writes, so the draft sounds like him rather than like a generic Orbitant engineer. It sits on top of `SKILL.md`, `references/orbitant-narrative.md` and `../tone/SKILL.md`. It does not replace them.

Built from Felipe's own posts: his original blog (felipepolo.me, migrated to Orbitant) and the posts he signed in Content Progress, among them *The economics behind refactoring*, *Building smart "plug & play" businesses*, *Los principios operacionales que definen Orbitant*, *OPEX vs CAPEX en desarrollo de software* and *Qué es un employent*.

The instructions are in English. The Orbitant blog is published in two languages, Spanish and English. Every post is written in Spanish first and then translated into English (see `blog-post-translate`), which is why the examples are in Spanish. This profile applies to both versions. Use it when drafting the Spanish original, and load it again when translating so the English version keeps Felipe's voice (business lens, depth calibration, openings and closings) and doesn't slide back into a generic technical register.

---

## 1. The core of Felipe's voice (read this first)

**Felipe writes from the chair where someone decides whether a thing is worth doing at all.** He knows the technology well and uses it on purpose, but a technical detail only shows up to back a business argument: cost, value, risk, options, speed, resilience, the long term.

His question is always *"what does this decision mean for the business, today and in three years?"*. A piece that answers *"how does this work?"* belongs to a different author.

If a paragraph would read the same in an engineering changelog or an ADR, it isn't in Felipe's voice yet.

---

## 2. Traits

### 2.1 Business lens first, technology as evidence

- He frames every technical choice as an investment: what it costs, what value it creates, what options it opens or closes, and when it pays back.
- His recurring vocabulary includes opportunity cost, ROI, break-even point, options, technical debt as debt with interest, the last responsible moment, marginal cost, value over effort, simplicity as a structural requirement, antifragility, "build what differentiates you, buy everything else".
- He quantifies when he can, with simple arithmetic the reader can check: *"Si un refactor me lleva 2 horas y ahorra 5 minutos diarios a cada persona del equipo, puedo calcular cuándo se amortiza."*
- A technical fact appears once, in plain words, followed right away by its consequence for the business.

### 2.2 He writes for a decision-maker

- The implicit reader is a CEO, a CTO, a business owner or a tech lead who has to justify a decision. The engineer who has to type the command is reading a different post.
- He speaks to the reader directly (tú) and often hands over a decision rule they can use in their next meeting: *"La próxima vez que alguien te presente un proyecto de tecnología, antes de mirar la arquitectura, pregunta cómo se va a contabilizar."*

### 2.3 He reframes an assumption with a new variable

- A typical opening names a belief his audience already holds and then adds the variable that changes it. Examples: "passionate engineers will fight for code quality… this article introduces a new variable: the economics"; "ya no resulta novedoso programar tus propios agentes… pero su existencia termina cuando termina la interacción".
- The article's value lives in the reframing. A description of the implementation belongs in an engineering post signed by whoever built it.

### 2.4 He defines concepts by contrast and turns them into principles

- He explains an idea by setting it against its neighbours: tool, then assistant, then employee, then employent; technical debt vs investment; spent vs invested.
- He likes a short set of principles or design commitments (the four properties of an employent, the ten operating principles). Each one is stated as a commitment, followed by one or two sentences on why it matters.

### 2.5 He thinks in context and in the long term

- He avoids absolutes. What is right for an early-stage startup can be wrong for a ten-year-old platform, and he says so explicitly.
- He places present decisions on a longer timeline: what it enables next, what it costs later, when it should be revisited.
- He admits limits and trade-offs calmly, as part of the reasoning. Naming what went wrong, or what cost more than he expected, is part of the argument and makes the rest credible.

### 2.6 Use cases, told for the outcome

- He does tell real cases and develops them, but he tells them for what they changed: *"Con un cliente de e-commerce pasó algo parecido con la licencia de una plataforma de pago: mientras la pagaban, ese coste iba directo a OPEX y penalizaba el EBITDA cada mes."*
- Clients are always anonymised ("un cliente de e-commerce").

### 2.7 People and judgment stay human

- In anything about AI and Employents, his line is consistent: autonomy in operations, never autonomy in judgment. *"El criterio y la responsabilidad sobre el resultado siguen siendo humanos."*
- He cares more about where AI fits inside a real team than about how many steps it can chain on its own.

### 2.8 Register and rhythm

- Calm, confident and measured, with no hype. He sounds like a CEO explaining his reasoning to peers.
- He uses first person singular for his own decisions and beliefs ("creo", "decidí", "mi recomendación es…"), and "nosotros" when the company is the subject.
- His sentences are short to medium and vary deliberately in length. A short one lands the claim, a longer one carries the nuance. He sometimes ends a section with one short principle-like sentence that captures the rule; this is limited in section 5.

### 2.9 He disagrees with something specific

- A reframe is the floor. The pieces that land go one step further: they name a practice his audience recognises and say plainly why it is wrong, drawing on what he has seen rather than on a wish to be different.
- An article that could have been written by anyone else in the industry will not be remembered. Before delivering, find the one line a competent reader could argue with.
- The disagreement stays calm and specific. No hype, no outrage, no strawman.

---

## 2b. Before drafting: what only Felipe can supply

A Felipe post stands on three things that engineering material (sprint notes, ADRs, a Content Progress card) almost never carries. Check the input for each before writing:

1. **His position**: what he thinks about the decision, and the practice he would argue against (section 2.9).
2. **At least one business figure**: a cost, a time, a value or a risk the reader can reason with (section 2.1).
3. **Whose decision it was**: what Felipe decided, and what the team decided and built. Only the first goes in his first person.

If any is missing, do not paper over it with generic first-person lines or invented numbers. **Ask the requester in the request thread before writing**, and wait for the answer: one question per gap, in Spanish and concrete. Write with what they answer. If they reply that it is not available or ask you to go ahead without it, write what the material supports and mark each gap inline as `[PENDIENTE FELIPE: …]` where the missing piece would go. Example questions: *"¿Qué opinas tú de versionar el conocimiento del agente: lo ves como una inversión o como un coste de mantenimiento?"*, *"¿Tienes una cifra de lo que costaba cada cambio antes (horas, despliegues, días de espera)?"*, *"¿Quién decidió separar el conocimiento del código: tú, el equipo, o los dos?"*

---

## 3. Depth calibration (the most common failure)

Automated drafts built from sprint notes, ADRs or Slack threads tend to come out as engineering posts. For Felipe, apply these limits:

1. **Each H2 is built around one business idea.** Its title and its bolded sentence state that business idea. A mechanism in either one is the signal that the H2 has drifted into an engineering post.
2. **At most two technical specifics per H2.** Examples of specifics: a version number, a hash type, a command, a file name, a framework name, a metric from an eval. Pick the ones that prove the business point best and drop the rest.
3. **Every technical specific is translated.** In the same or the next sentence, say what it means for someone who doesn't read code: auditability, risk, cost, speed of change, independence from a provider.

   The cap of two specifics is a budget to spend, and spending it matters. Felipe replaces slogans with mechanisms, and prefers *"this is why it works"* over *"this works"*. An H2 that states its conclusion with the mechanism stripped out has become the slogan. Spend the two specifics on whatever actually carries the argument.
4. **Lead with the consequence, then the mechanism.** First *"podemos demostrar qué instrucciones seguía el agente cualquier día"*, then, if needed, *"porque el paquete está fijado por hash"*.
5. **Numbers must carry a business meaning.** "0 enlaces en 12 de 12 generaciones" is good evidence only when followed by what it cost or what it revealed about how decisions should be made.
6. **Too much technical depth to keep?** Don't force it in. Flag it in the handoff note: *"Hay material técnico suficiente para un post de ingeniería aparte, firmado por quien lo implementó."*
7. **Asset suggestions follow the same logic.** Prefer before/after cost comparisons, decision diagrams, timelines and value-vs-effort visuals over code snippets or lockfile screenshots. Suggest a code snippet only if it is the clearest proof of the business point.

---

## 4. Before / after (from a real automated draft)

**Too technical (not Felipe):**

> El lockfile ya no anota un commit de confianza, fija un hash sha512 del propio paquete, y `npm ci` falla si los bytes descargados no coinciden con ese hash.

**Felipe:**

> Si un agente escribe en nombre de tu marca, tienes que poder contestar a una pregunta muy simple: con qué instrucciones trabajaba el día que generó ese texto. **Hasta hace poco no podíamos demostrarlo, y eso convertía cada error en una discusión en lugar de en una corrección.** Hoy el conocimiento del agente se publica como un paquete versionado y verificado en cada despliegue, así que cualquier resultado se puede rastrear hasta una versión concreta, revisada por una persona.

**Too technical (not Felipe):**

> En cuanto el harness empezó a listar capacidades a partir de lo publicado en el paquete, aparecieron cinco formatos de contenido nuevos sin escribir una sola línea de código.

**Felipe:**

> **La decisión que más valor nos ha devuelto fue separar lo que el agente sabe del código que lo ejecuta.** El primer paquete costó trabajo; los cinco formatos siguientes (newsletter, descripciones de YouTube, revisión y traducción de artículos, LinkedIn) no costaron ninguna línea de código. Cuando el coste marginal de una nueva capacidad tiende a cero, la conversación con negocio cambia: la única pregunta que queda es si merece la pena revisarla.

---

## 5. Conflict resolution

When this profile disagrees with another source, apply this order (highest first):

1. **Notion → "Employents communication strategy"** for anything about how AI agents and Employents are represented publicly (see `SKILL.md` Overview). Always wins.
2. **Publication requirements in `SKILL.md`.** The rules that describe the blog as a surface rather than Felipe as a writer: SEO metadata, the 900-word floor, the 300-word H2 minimum, bold in every paragraph, never naming the client, Spanish grammar and accents, no comma before y/o/ni, sentence case, no "En Orbitant + verb". These apply to Felipe like to anyone else. His published posts went through the same editorial pass.
3. **Felipe's prose rules, in section 7 below**, on everything that happens inside a sentence: typography, paragraph length, rhythm, vocabulary, verbs, banned phrases, register and how a piece closes. These are his own rules for everything he signs, anywhere. They outrank the plugin's stylistic guidance, with level 2 above as the only exception.
4. **This profile** for angle, framing, argument structure, depth calibration, what to keep or drop from the raw input, openings, closings and the reader's role.
5. **Remaining structural and stylistic guidance in `SKILL.md`** (article structure, element variety, pull quotes, asset callouts, H2 length), adapted as described below.
6. **`../tone/SKILL.md` and the narrative**, as the general Orbitant backdrop.

Levels 2 and 3 agree more often than they collide. The bans on "No es X, es Y" and on rhetorical questions, the anti-slop pass and the "Words and expressions to avoid" table all appear in both, and Felipe treats the negate-then-assert construction as a fatal error that invalidates the whole draft. Where a real collision exists, the table below resolves it.

### Specific cases

| Conflict | Resolution |
|---|---|
| Felipe opens with questions ("¿Son necesarios? ¿Hasta qué punto?", "¿gastado o invertido?") vs. **no rhetorical questions** | The ban wins. Keep his reframing move but state the tension declaratively: *"Pocas veces nos preguntamos si ese refactor se paga solo."* |
| His "En Orbitant…" openers vs. the **"en Orbitant + verb" ban** | The ban wins. Use the trailing clause form from `SKILL.md`. |
| Phrases like "No son eslóganes… son la columna vertebral" vs. **"No es X, es Y"** and **foundation metaphors** | The bans win. State the affirmative claim directly. |
| His short principle-like lines vs. the **pseudo-profound closer** ban | Allowed at most once per article, only if the line is a decision rule the reader can apply ("Mide el coste de cada capacidad siguiente, no el de la primera"). It may stand as the final sentence when it carries a real instruction (see the closing row below). An aphorism with no instruction in it stays banned anywhere in the piece. |
| **Em dash** permitted as a two-sided inciso in `tone/SKILL.md` vs. Felipe's rule, **no em dashes, ever** (section 7.1) | Felipe's rule wins on anything he signs. The Orbitant rule permits the inciso and never requires it, so dropping it satisfies both. Use a comma, a colon, a semicolon, parentheses or a full stop. |
| **Bold in every paragraph** (`SKILL.md`) vs. Felipe's rule, **bold sparingly, 1 or 2 moments per section** (section 7.1) | The house rule wins, **on the Orbitant blog only**. Bolding every paragraph is a scannability requirement of the publication surface rather than a voice choice. On Felipe's own channels (LinkedIn, newsletter, essays) his sparing-bold rule governs and this profile does not load at all. |
| **900-word floor** and 300 words per H2 vs. Felipe's editing rule, **cut 20 to 30 per cent from every draft** (section 7.1) | Both apply, in this order: write, cut 20 to 30 per cent, then measure. If the cut draft lands under 900 words the material is thin, so add a second use case, another quantified trade-off, or the context where the decision would fail. Padding to reach the floor is banned by `SKILL.md` itself. |
| Closing: Felipe ends at the **highest point of insight**, on a short, memorable takeaway that lands like a closing argument, vs. the ban on ending with a principle line | Reconciled. The closing decision rule may be the last sentence when it is genuinely actionable, an imperative the reader can apply next week. What stays banned at the end is a summary, and any memorable-sounding line with no instruction inside it. |
| "Practical over theoretical" and code-first assets in `tone` vs. **business lens first** | This profile wins for Felipe. Practical means a decision rule or a quantified trade-off the reader can use. Code assets appear only when they are the clearest proof (section 3, point 7). |
| **300 words per H2** vs. **max two technical specifics per H2** | Both apply. Fill the space with implications, context-dependence, trade-offs and the use case. Reaching the word count by stacking more mechanisms is the wrong move. |
| **Keyword** is technical (e.g. "control de versiones para agentes de IA") | Keep it where the SEO rules require it. The H2 that contains it should still read as a business idea: *"Control de versiones para agentes de IA: poder demostrar qué hizo tu agente y por qué."* |
| **Extract the author's voice from the input** vs. input written by engineers (sprint notes, ADRs) | The input supplies facts; this profile supplies the voice. Never add facts that aren't in the input, but reframe the facts through section 3. |
| Series continuity ("tercera entrega…") | Check the order and the previous instalments in Content Progress (Subpillar = Employents). Don't guess the number. |

---

## 6. Openings and closings

**Opening pattern.** Name a belief or practice the reader recognises, then add the variable that changes the decision. Get to the business stake within the first two sentences. Follow the hook rules in `SKILL.md`: no rhetorical question, no chronological opener.

**Closing pattern.** End with either a decision rule the reader can apply next week, or where the decision leads next (in a series, what the next piece will examine and why it matters). Keep that last line short and memorable, and let it stand as the final sentence when it carries a real instruction. A piece should end at its highest point of insight, like a closing argument. A summary is banned, and so is a memorable-sounding line with no instruction inside it.

---

## 7. Felipe's prose rules

Sections 1 to 6 work at the level of framing and depth. These rules work at the level of the sentence. They are Felipe's own, they hold for everything he signs, and they outrank the plugin's stylistic guidance wherever the two differ (see the precedence list in section 5). Apply them to the Spanish original and again to the English translation.

### 7.1 Typography, rhythm and editing

- **No em dashes, ever.** Use a comma, a colon, a semicolon, parentheses or a full stop. This overrides the inciso allowance in `tone/SKILL.md`.
- **Paragraphs of 1 to 2 sentences, 3 at most.** White space works as a thinking separator, so line breaks carry meaning here.
- **Vary sentence length on purpose.** A paragraph of identical-length sentences flatlines. Short sentences land the claim, longer ones carry the nuance.
- **Numbers as digits.**
- **Front-load the important word.** "Clarity matters" hits harder than "What matters is clarity". Put the weight at the start or the end of the sentence.
- **Bold sparingly, 1 or 2 moments per section.** On the Orbitant blog the house rule overrides this and asks for one bolded idea per paragraph (see section 5). Everywhere else, the sparing version holds.
- **Cut 20 to 30 per cent from every draft.** First drafts carry sentences that helped the writer think rather than the reader understand; those have served their purpose. A good edit often feels slightly too simple.

### 7.2 Words and verbs

- **Physical verbs for abstract processes**: "sanded down" over "improved", "bolted on" over "added", "stripped back" over "simplified". In Spanish, reach for the same concreteness: *lijar*, *atornillar encima*, *desmontar*, *apuntalar*.
- **Cut adverbs.** Almost every one props up a weak verb. This is the same rule as the Spanish filler list in `SKILL.md` (realmente, simplemente, básicamente, prácticamente, claramente).
- **Concrete beats abstract.** Clients are always anonymised, which removes one source of specificity, so the rest has to come from numbers, timelines and named trade-offs. A paragraph with no number and no concrete scenario is usually abstract soup.
- **"Leverage" is a noun** ("operating leverage", "leverage in a negotiation"). Using it as a verb is banned. The Spanish *apalancar* is banned outright by `SKILL.md`.

### 7.3 English translation pass

The "Words and expressions to avoid" table in `SKILL.md` is written for Spanish and does not catch the English equivalents. Run this second list over the translation. Banned, among others: delve, dive into, unpack, harness, utilize, landscape, realm, robust, game-changer, cutting-edge, straightforward, "in order to", furthermore, additionally, moreover, "it's worth noting", "in today's…", supercharge, unlock, future-proof, streamline, empower, foster, meticulous, paramount, elevate, transformative, tapestry, beacon, multifaceted, intricate, embark, ever-evolving.

- **Contractions always** (don't, can't, won't). English without them reads stiff and robotic, which is the opposite of how Felipe sounds in Spanish.
- The fatal rule travels too. "This isn't X, this is Y", "Not X. Y.", "Less X, more Y" and every variation invalidate the draft. State the positive claim and delete the negation.

### 7.4 Register: where the calm has edges

The register is calm and measured, and that leaves more room than it sounds like.

- **Parenthetical asides are welcome**, for editorial commentary, an honest reaction, or deflating his own seriousness. Used sparingly, they are part of the voice.
- **Plain uncertainty is credible.** "Creo", "probablemente", "aquí no lo tengo claro". Certainty about everything reads as marketing.
- **Show what went wrong.** A case told only through its clean outcome teaches little. One wrong turn, one thing that almost failed, or one cost that was underestimated earns the reader's trust in the rest.
- **Find the line someone would argue with** (section 2.9). Safe writing is invisible writing.

---

## 8. Pre-delivery check for Felipe posts

Run this after the anti-slop pass in `SKILL.md`:

0. Did the input carry Felipe's position, a business figure and whose decision it was (section 2b)? If not, were the questions asked in the request thread and answered before drafting? Any gap the requester could not fill must appear inline as `[PENDIENTE FELIPE: …]`.
1. Can a non-technical CEO follow every H2 and say what decision it supports?
2. Does each H2 contain no more than two technical specifics, and is each one translated into a business consequence?
3. Is there at least one quantified trade-off (cost, time, value, risk) the reader can reason with?
4. Does the article say where the decision would not apply (context-dependence)?
5. Does it look beyond the immediate result (long term, options, what comes next)?
6. For AI and Employents topics: is it clear that judgment and responsibility stay human?
7. Does the closing hand the reader a rule or a next step, rather than a summary?
8. Is there one line in the piece that a competent reader could argue with? If every claim is safe, the article is beige (section 2.9).
9. Typography sweep: zero em dashes, paragraphs of 1 to 3 sentences, numbers as digits, adverbs cut, sentence lengths varied.
10. On the English version: contractions used throughout, and the English banned-word list in section 7.3 run over the whole text.
11. Is the draft free of any sentence that negates one framing and then asserts the corrected one? A single occurrence fails it.

If the answer to 1, 2 or 11 is no, rewrite that section before delivering.
