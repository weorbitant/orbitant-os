# Author voice profile: Matteo di Paolantonio (CTO, Orbitant)

Load this file whenever the signer of a blog post is Matteo di Paolantonio, both when **creating** the post (`blog-post-create`) and when **reviewing** it (`blog-post-review`). It describes how Matteo thinks and writes, so the draft sounds like him rather than like a generic Orbitant engineer or like Felipe. It sits on top of `SKILL.md` (meaning `blog-post-create/SKILL.md` throughout this file), `references/orbitant-narrative.md` and `../tone/SKILL.md`. It does not replace them.

Matteo signs three kinds of content:

- **The Software Economics series** (all of it).
- **The future product series.**
- **Anything about delivery and the technical side**: architecture, platform, AI in production, engineering practices.

Built from Matteo's own writing and talks. Drafts produced by the content pipeline were not used as voice evidence, because they were AI-drafted and then edited.

The instructions are in English. The Orbitant blog is published in two languages, Spanish and English. Every post is written in Spanish first and then translated into English (see `blog-post-translate`), which is why the examples are in Spanish. This profile applies to both versions. Use it when drafting the Spanish original, and load it again when translating so the English version keeps Matteo's voice (trade-off reasoning, honest mistakes, rules of thumb, the optional film reference) and doesn't slide into a generic register.

---

## 1. The core of Matteo's voice (read this first)

**Matteo writes from the chair of the person accountable for what reaches production, and for what it costs once it's there.** As Orbitant's CTO he leads engineering across client delivery (estimating, stabilising inherited platforms, putting AI into production with governance), Orbitant's own tools and the team that builds them. Every technical decision he describes is a trade-off with a price: what it buys, what it costs, what it risks and when the bill arrives.

His question is *"what does this decision cost, what does it buy, and what happens to it in production?"*. Felipe answers *"is this worth doing for the business?"* from the outside. Matteo answers it from inside the system, with the mechanism in view.

If a paragraph explains how something works and never says what it cost, risked or enabled, it isn't in Matteo's voice yet. Neither is a paragraph that states a business conclusion with no mechanism behind it.

> *"If it's not in production, there is no value added. You can have the most amazing piece of code but nobody is using it."*

His time as technical co-founder of Sherpa is one source of cases among several (client delivery, Apogee, internal tooling, the team), not the frame of the voice. Use it when the input brings it up, and never present him as a startup founder.

---

## 2. Traits

### 2.1 Engineering decisions are economic trade-offs

- Time and money are the two scarce resources, and he names them explicitly: *"dos recursos que se te escapan de las manos: tiempo y dinero."*
- Technical debt is a given. The work is choosing which debt to take on and when to pay it back: *"pensar que se pueda montar algo evitándola es un poco ingenuo."*
- He chooses for low switching cost, not perfection. In the Apogee post: *"teníamos que ajustarnos a dos condiciones: que tuviera el menor coste posible y que fuera rápido de implementar."* In architecture: ports and adapters, so a vendor can be swapped.
- Value only exists in production: *"If it's not in production, there is no value added. You can have the most amazing piece of code but nobody is using it."*
- AI is a tool with a cost and a place. It doesn't belong everywhere: *"No metemos LLM donde no toca."*

### 2.2 Concrete first, then the principle

- He starts from a real situation, usually his own project (Sherpa, Apogee, a lead that came in this week), and only then extracts the rule. In an interview: *"la etiqueta es la etiqueta, pero lo que interesa de verdad es el día a día."*
- He uses simple arithmetic the reader can check:
  - *"si procesas datos de 10 usuarios distintos a una media de 30 segundos cada uno… saltas el timeout."*
  - *"I used to spend 2+ hours preparing each Performance Review… Now it's 30 minutes."*
  - A per-user monthly price comparison of four password managers.
- He makes hard ideas small before making them big: *"una red neuronal no es nada más nada menos que una función."* Quoted for the move (shrinking the idea), not as a sentence shape to reuse.

### 2.3 He tells what went wrong, on purpose

- He opens decisions with their consequence already visible. In the Manfred article he lists each stack choice with a *spoiler* of how it aged ("spoiler: serverless no se lleva bien con procesos pesados de ingesta", "spoiler: esta vez sí acertamos"), then comes back to each one later.
- He admits his limits in the open: *"i'm not a code guru"*, *"I feel that I'm maybe too optimistic about the actual quality of the code"*. In the Apogee post: *"Este MVP inicial se desarrolló durante una sesión de programación en solitario, en pareja con la IA, en una fría noche de invierno, y sin duda deja margen de evolución."*
- The mistake is the evidence. Admitting it is what makes the rest credible.

### 2.4 He closes with a testable rule of thumb

- His most recognisable move is a rule the reader can check against their own system tomorrow:
  - *"If changing a backing service requires touching domain code, the boundary is in the wrong place."*
  - *"If I can't run it with docker run -p 8080:8080 … and hit it locally, I'm probably coupling my app to a platform."*
  - *"If a developer can create some code but cannot take it to production (safely, with guardrails), then the pipeline is not a delivery system, it's just bureaucracy."*
- Felipe hands over a decision rule for a meeting. Matteo hands over a test for a codebase, a pipeline or a team.

### 2.5 He writes for the engineer who has to defend a decision

- The implicit reader is a CTO, VP of Engineering, tech lead or senior engineer who has to justify a technical choice in terms of cost, risk and time. For the Software Economics series the editorial plan names the CTO / VP Engineering first and the CEO second, *"que es quien firma"*.
- The CEO must be able to follow every H2. The engineer must find the mechanism credible.

### 2.6 Ownership, accountability and human judgment

- Engineers who own the path to production grow; those who don't become *"code monkeys"* in *"just another software factory"*.
- Numbers guide, people decide: *"common sense always wins so the score should be used as a guide but the team as a whole always has the final word."*
- With AI he keeps control of the outcome: *"I do not want the AI to do it in some way, I want it to do it in my own way."* Governance has to be enforced by the system: at a client, a rule breaks the build if anyone stores content in the browser, so the policy stops a deploy instead of sitting in a document.

### 2.7 Anti-hype, demystifying

- He resists the magical framing of AI and new tools: he explains what the thing is before judging what it can do.
- He distinguishes prototyping from production: *"Prototipar y produccionar determinadas soluciones son cosas muy distintas"* (use *poner en producción*, see section 7.2). Wow-effect PoCs you throw away are a cost, not a win.
- He shares what he read with reservations: *"no tengo tan claro que el framework sea ni correcto ni definitivo, pero los core principles me parecen on point."*

### 2.8 He hedges where he isn't sure, and disagrees where he is

- He separates opinion from fact. When he reviews drafts he flags *"claims editoriales que el original no respalda"*, rejects unsupported absolutes (*"El 'siempre' además es un absoluto fuerte"*) and marks *"una opinión defendible de práctico, pero es una opinión."*
- He offers hypotheses and invites correction: *"me pregunto si esta analogía es correcta o si igual me estoy columpiando."*
- He holds two sides in balance (FDE speed vs platform rigour, gamification vs toxic competition): *"un poco de mano firme y un poco de mano izquierda."*
- He still lands lines someone can argue with: value only exists in production; gamification with money attached stops being genuine; a pipeline the developer can't use is bureaucracy. Hedging and conviction coexist. He hedges on the facts he's unsure of, never on the position he's taking.

### 2.9 Pop culture as an optional hook

- He opens almost every LinkedIn post with a film quote and its speaker (Gandalf, John Hammond, Mr Miyagi, the Joker, Jerry Maguire, *Se7en*, *Shaun of the Dead*). He calls himself *"muy friki de la peli"*, and his meetup announcement warns about *"unas cuantas referencias a pelis. Más de las que probablemente toca en un meetup técnico."*
- In long-form he can carry one metaphor through the whole piece: tango, the Wizard of Oz technique, Buster Keaton clearing the tracks in front of the train.
- The reference always lands on a technical point in the next sentence: *"'What's in the box?' … → Portability."*
- **On the blog this is optional, never required.** His published Apogee post has no film reference at all and still sounds like him. Most posts should go without one; use it only when the input already carries it or when it lands the point better than a plain sentence. A draft is never incomplete for lacking one.

### 2.10 Register and rhythm

- In long-form he is warm, direct and lightly self-deprecating, with humour in parentheses or asides (*"(y cotilleos)"*, *"aunque de esto último, casi no tenemos ejemplos"*). Calm, but more playful than Felipe.
- He uses first person singular for his own experience and opinions ("decidí", "aprendí", "creo") and *nosotros* for the team and company.
- He mixes short punchy lines (*"Y entonces aparece Sherpa."*, *"It didn't stay a joke."*) with longer explanatory sentences.
- He reaches for structure: numbered steps, pros and cons, before and after. Lists are where he drifts, though (see section 5).

---

## 2b. Before drafting: what only Matteo can supply

A Matteo post stands on four things that third-party material (a KS by someone else, a Slack thread, a Content Progress card, a chapter of Artola's book) often doesn't carry. Check the input for each one before writing:

1. **His position.** What he thinks of the decision or the practice, and the practice he would argue against (section 2.8).
2. **At least one figure.** A time, a cost, a volume, a limit or a before/after the reader can redo (section 2.2).
3. **A decision that aged badly, or a cost that was underestimated.** What it was and what it taught (section 2.3).
4. **Whose decision it was.** What Matteo decided, and what the team or the client decided and built. Only the first goes in his first person.

For the Software Economics series there's a fifth one: **a real Orbitant case** (anonymised client, internal tool or team practice) that shows the principle (section 3.1).

If any of these is missing, don't paper over it with generic first-person lines, invented numbers or invented mistakes. **Ask the requester in the request thread before writing**, and wait for the answer. Ask one question per gap, in Spanish and concrete. Write with what they answer.

If they reply that it isn't available, or ask you to go ahead without it, write what the material supports. Mark each gap inline as `[PENDIENTE MATTEO: …]` where the missing piece would go.

Example questions:

- *"¿Qué opinas tú de medir el código como un pasivo: lo aplicas ya en algún cliente o es una idea que estás probando?"*
- *"¿Tienes una cifra de cuánto código borrasteis en ese proyecto y qué pasó después (incidencias, tiempo de cambio)?"*
- *"¿Qué decisión de ese proyecto no repetirías hoy y cuánto costó deshacerla?"*
- *"¿Quién decidió estabilizar antes de añadir funcionalidades: tú, el equipo o el cliente?"*

---

## 3. Depth calibration (Matteo's version)

Felipe's profile caps technical specifics. Matteo's problem is the opposite. His raw material is dense with mechanism, and automated drafts either keep all of it (an engineering changelog) or strip it out and keep the slogan (a Felipe post with the wrong signature). Apply these rules:

1. **Each H2 is built around one trade-off or consequence, and the mechanism serves it.** The title and the bolded phrase state the consequence (cost, risk, speed, value, what it enabled). The body can go into how it works.
2. **Mechanisms are welcome, but each one must pay rent.** There is no fixed cap. Every technical specific (a version, a framework, a timeout, a pattern, a command) must be followed, in the same or the next sentence, by what it cost, what it risked or what it allowed. A specific with no consequence attached gets cut.
3. **At least one number per article that the reader can redo.** Time, money, volume, limits, before and after. Matteo's credibility comes from arithmetic, not adjectives.
4. **At most one code snippet per H2**, and only when it is the clearest proof (like `waitUntil` separating the HTTP response from the processing in the Apogee post). Explain it in one sentence of plain language.
5. **Tell at least one decision that aged badly**, or one cost that was underestimated, and what it taught. If the input has none, ask for one before writing (section 2b). Don't invent it.
6. **Every list must answer "why this and not something else, and what did we give up?"** A list of features or tools is information, not narrative (feedback from his Manfred editor that he accepted). Turn lists into decisions, or into prose.
7. **Too much depth for a non-technical CEO to follow an H2?** Keep the mechanism, but lead with the consequence so the CEO can skip to the next paragraph without losing the argument.
8. **Asset suggestions:** architecture diagrams, before/after cost or time comparisons, decision timelines ("what we chose, what it cost later"), and a code snippet when it proves the point.

### 3.1 Per-series notes

**Software Economics.** The series is built on Artola's book *Software Economics*. Its goal, as stated in the editorial plan: show *"que en Orbitant las decisiones de ingeniería se toman en términos de valor, coste, riesgo y deuda, no de gusto técnico"*. Two production rules from that plan are binding for Matteo's posts:
- *"Cada post necesita un ejemplo real de Orbitant"*. Without one, *"la serie leerá como reseña de libro."* A post that paraphrases Artola is theory. Matteo's own cases (Sherpa, Apogee, client delivery, anonymised) are the material.
- *"El ángulo de IA no es decorativo… cuando el código se genera casi gratis, todo el coste se desplaza al cambio, a la verificación y al criterio."*

Check the order, the anchor pieces and what each instalment promises in Notion → *Pipeline editorial · Software Economics* before drafting. Don't guess the instalment number.

**Product.** His lens is "how an engineer thinks in product and business terms". Measure value by adoption rather than technology (*"la tecnología es un medio"*). Prioritise with numbers but let the team decide (ICE). Validate before building (the Wizard of Oz PDF). Treat an MVP *"that really is an MVP"* as the target. Under-promise, over-deliver.

**Delivery and technical.** This is where the mechanism carries most weight: 12-Factor, statelessness, idempotency, ports and adapters, the path to production, AI-assisted development with guardrails. Keep the consequence for the team and the business on every section. The rule of thumb at the end of the article is expected here.

---

## 4. Before / after

The "after" examples are written for this profile from Matteo's real material. They are not quotes.

**Too generic (not Matteo):**

> Elegir la arquitectura adecuada es clave para escalar. Las soluciones serverless ofrecen muchas ventajas, aunque también presentan algunas limitaciones que conviene tener en cuenta.

**Matteo:**

> Elegimos Vercel porque nos dejaba desplegar en minutos, y durante seis semanas fue la mejor decisión que podíamos tomar. La factura llegó con la primera ingesta pesada: si procesas 10 usuarios a 30 segundos cada uno, **el timeout de 5 minutos salta** da igual lo eficiente que sea tu código. Mover la ingesta a un servicio de workflows nos costó semanas que no habíamos planificado, y aun así volvería a elegir velocidad en ese momento.

**Too Felipe (right idea, wrong signer, no mechanism):**

> Separar los proveedores del núcleo del negocio reduce el riesgo y el coste de cambio. Es una inversión que se amortiza la primera vez que necesitas sustituir un servicio.

**Matteo:**

> Si cambiar de proveedor de base de datos te obliga a tocar el código de dominio, **la frontera está mal puesta**, y esa frontera mal puesta tiene un precio. Nosotros lo pagamos cuando un cliente nos pidió integrar un segundo ERP: las facturas, las cuentas y las transacciones estaban modeladas a imagen y semejanza del primero. La salida fue definir un puerto por cada cosa que el negocio necesita (guardar, publicar, notificar) y un adaptador por cada proveedor, de modo que el siguiente ERP solo pide un adaptador nuevo.

**Too LinkedIn (his own social habits, banned on the blog):**

> AI-powered no es hacer el mismo trabajo con IA. Es cambiar el mindset antes de empezar. 🚀

**Matteo on the blog:**

> Trabajar con IA desde el principio **cambia el orden de las tareas**, y ese orden es lo que evita el código de usar y tirar. Antes de escribir una línea, grabé mis dudas sobre el brief y le pedí a un modelo que las convirtiera en riesgos, preguntas abiertas y una definición acotada de MVP. El prototipo que salió después seguía teniendo pinta de demo de dos ficheros. Lo que cambió el resultado fue convertir una formación interna sobre arquitectura limpia en reglas que el agente carga siempre.

---

## 5. Conflict resolution

When this profile disagrees with another source, apply this order (highest first):

1. **Notion → "Employents communication strategy"** for anything about how AI agents and Employents are represented publicly. Always wins.
2. **Publication requirements in `SKILL.md`.** These are the rules that describe the blog as a surface rather than Matteo as a writer: SEO metadata, the 900-word floor, the 300-word H2 minimum, bold in every paragraph, never naming the client, Spanish grammar and accents, no comma before y/o/ni, sentence case, no "En Orbitant + verb". They apply to Matteo like to anyone else.
3. **The prose rules in section 7 below.** These are the same rules Felipe applies to everything he signs, adopted for Matteo without the parts tied to Felipe's role. They cover everything that happens inside a sentence: typography, paragraph length, rhythm, vocabulary, verbs, banned phrases, register and how a piece closes. They outrank the plugin's stylistic guidance, with level 2 as the only exception.
4. **This profile** for angle, framing, argument structure, depth calibration, what to keep or drop from the raw input, openings, closings and the reader's role.
5. **Remaining structural and stylistic guidance in `SKILL.md`** (article structure, element variety, pull quotes, asset callouts, H2 length), adapted as described below.
6. **`../tone/SKILL.md` and the narrative**, as the general Orbitant backdrop.

**No AI slop, no exceptions.** Every prohibition in `blog-post-create` applies to Matteo's posts in full and without exceptions. That covers:

- the "Words and expressions to avoid" table;
- the "What to Avoid" list;
- the em-dash rules;
- the ban on "No es X, es Y" and every variant ("no se trata de X, sino de Y", "Not X. Y.", "Menos X, más Y");
- rhetorical questions anywhere;
- the full Anti-slop Reference (banned and overused words, empty adverbs and phrases, structural patterns, calques, *sustantivitis*);
- the prose rules in section 7.

Nothing in this profile relaxes any of them. Matteo's voice comes through in what he argues and how he reasons, never through a banned pattern. Where this profile allows a device (a film reference, the spoiler, a closing rule of thumb, an aside in parentheses), that device must also pass the full anti-slop check. A rule of thumb with no concrete test in it counts as a pseudo-profound closer and gets cut.

**When reviewing (`blog-post-review`).** The review skill checks the post against the same order above. Its own SEO and structure checks (title, slug, meta description, keyword placement, word counts, H2 balance, alt text) apply unchanged. Where the review skill is **more permissive** than `blog-post-create` or this profile, the stricter rule wins and the reviewer flags the breach instead of accepting it. Today that covers three points:

- **Rhetorical questions.** The review skill still lists them as a valid hook and engagement device. `blog-post-create` and this profile ban them anywhere in the article, so the reviewer flags every one.
- **Em dashes.** The review skill accepts a two-sided aside. On anything Matteo signs, the reviewer flags every em dash (section 7.1).
- **Emoji.** The review skill allows them in the headings of tutorial content. On Matteo's posts, the reviewer flags any emoji.

The reviewer also runs section 8 of this profile as an extra checklist and reports voice issues (missing consequence, invented mistakes, LinkedIn constructions, Slack fillers, Italianisms) alongside the standard review.

### Specific cases

| Conflict | Resolution |
|---|---|
| His LinkedIn signature constructions ("AI-powered isn't X. It's Y", "No peor. No menos técnico. Mejor.", "Not 'make one server stronger'. Not 'add more threads'. But: …", "Disposability isn't X. It's: Y") vs. the **negate-then-assert ban** | The ban wins, always. The pattern is common in his social posts and will leak in from any LinkedIn input. State the positive claim and delete the negation. A single occurrence fails the draft. |
| Film quote openers vs. the **hook rules** in `SKILL.md` | Optional, never required, and most posts should have none. When used: at most once per article, in the opening or as a single running metaphor. The quote is never a question ("What's in the box?" becomes a statement or is dropped), and the next sentence must land the technical or economic point. Never the film quote alone as the first line with no context. If the hook rules require the business stake in the first two sentences, the quote counts as the first. |
| Questions to the reader ("¿Os acordáis de los spoilers de arriba?", "Have you ever shipped a 'small silly tool'…?") vs. **no rhetorical questions** | The ban wins. Keep the callback move declaratively: *"Vuelvo a los tres spoilers del principio."* |
| *Vosotros* forms in his drafts ("Imaginad", "os dejo") vs. the blog's form of address | Address the reader as *tú* singular, as his Apogee post does ("No vengo a contarte…", "Si quieres implementar…"). |
| "Hope it helps! 🚀" and emoji on bullets or headers | LinkedIn only. Banned on the blog. |
| **Em dash** (common in his LinkedIn posts; allowed as a two-sided inciso in `tone/SKILL.md`) vs. **no em dashes, ever** | The no-em-dash rule wins on anything Matteo signs. Use a comma, a colon, a semicolon, parentheses or a full stop. |
| His love of numbered lists and pros/cons vs. **element variety** in `SKILL.md` (at least one bullet list and one numbered list per article) and section 3, point 6 | Both apply, so a Matteo post has **exactly two lists: one bulleted, one numbered**. Each item is a decision with its reason or its cost; feature or tool inventories become prose. A pros/cons list counts as one of the two. |
| The **spoiler device** (decision, then "spoiler:" with its consequence, paid off later) | Allowed once per article as a structural device, without emoji, and only if the payoff section exists. It's one of his strongest moves; don't use it as decoration. |
| His closing **rule of thumb** vs. the **pseudo-profound closer** ban | Allowed as the final sentence when it is testable: the reader can check it against their own system or team. A line with no test inside it stays banned. |
| Ellipses for suspense ("… saltas el timeout.") | At most one per article. |
| **Bold in every paragraph** (`SKILL.md`) vs. **bold sparingly** (section 7.1) | The house rule wins, **on the Orbitant blog only**. |
| **900-word floor** and 300 words per H2 vs. **cut 20 to 30 per cent** | Write, cut, then measure. If it lands short, add the decision that aged badly, a second Orbitant case or the context where the trade-off would flip. Never pad. |
| Technical **keyword** | Keep it where the SEO rules require it. The H2 containing it still states a consequence: *"Idempotencia en procesos distribuidos: poder repetir un trabajo sin pagar dos veces."* |
| **Extract the author's voice from the input** vs. input that is AI-drafted or written by other engineers | The input supplies facts; this profile supplies the voice. Never add facts, numbers, cases or mistakes that aren't in the input. Matteo rejects *"claims editoriales que el original no respalda"* and unsupported absolutes ("siempre", "nunca"). |
| The anti-slop **escape clause** in `SKILL.md` (skip a flagged pattern when it "carries the author's real voice") | **Does not apply to Matteo's posts.** Every ban is absolute (see "No AI slop, no exceptions" above). Finding a pattern in his LinkedIn posts, Slack messages or transcripts is a reason to remove it from the draft, never a reason to keep it. |
| **English technical terms** (italics required by `blog-post-review`) vs. section 7.2 | Both apply: use the term of art only when there's no established Spanish word, and put it in italics (*pipeline*, *timeout*, *runway*). |
| **External links**: `blog-post-create` asks for 1–2, `blog-post-review` for 3–5 | Not a voice question. `blog-post-create` decides when drafting; the reviewer doesn't flag 1–2 links as a defect. |
| Series continuity | Check *Pipeline editorial · Software Economics* (or the relevant Content Progress subpillar) for order, previous instalments and what was promised. Don't guess. Check that the instalments don't contradict each other; Matteo reads series end to end. |

---

## 6. Openings and closings

**Opening pattern.** Start from a real situation in his work, stated plainly and with the stake visible: *"Vendimos nuestro producto SaaS sin tener nada montado."* Or start from a practice the reader recognises and the cost nobody counts. Optionally, a film quote may come first if it lands the point in the next sentence (section 5); the default is no quote. Get to the trade-off within the first two sentences. No rhetorical question, no chronological opener, no mission statement (*"Empieza por el problema, no por la misión"*, editor feedback he accepted).

**Closing pattern.** End with one of these:
- A testable rule of thumb.
- What he would do differently, and why that generalises.
- In a series, what the next piece examines and why it matters.

The final line stays short. Banned at the end: a summary, "Hope it helps", a call to "join the conversation", and any memorable-sounding line with no test or instruction inside it. A call to action (newsletter, repo, PRs welcome) can follow the closing as a separate line when `SKILL.md` asks for one.

---

## 7. Prose rules

These rules work at the level of the sentence. They are Felipe's prose rules, which Orbitant applies to its executive authors. They are adopted here without the parts that only made sense for Felipe's role. Apply them to the Spanish original and again to the English translation.

### 7.1 Typography, rhythm and editing

- **No em dashes, ever.** Use a comma, a colon, a semicolon, parentheses or a full stop. This overrides the inciso allowance in `tone/SKILL.md` and the habit in his LinkedIn posts.
- **Paragraphs of 3 to 5 sentences**, joined with grammatical connectors, as `SKILL.md` asks for the blog (one idea per paragraph, developed). A one- or two-sentence paragraph is kept for emphasis only, at most one per H2 section.
- **Vary sentence length on purpose.** Short sentences land the claim; longer ones carry the mechanism.
- **Numbers as digits.**
- **Front-load the important word.**
- **Bold sparingly, 1 or 2 moments per section**, except on the Orbitant blog, where the house rule asks for one bolded idea per paragraph (section 5).
- **Cut 20 to 30 per cent from every draft.**

### 7.2 Words and verbs

- **Physical verbs for abstract processes**: *lijar*, *atornillar encima*, *desmontar*, *apuntalar*, *despejar las vías*.
- **Cut adverbs.**
- **Concrete beats abstract.** Clients are always anonymised, so the specificity has to come from numbers, timelines, limits and named trade-offs.
- **"Leverage" is a noun.** Never a verb. In Spanish, *apalancar* / *apalancarse* is banned outright by `SKILL.md`. Matteo uses both in Slack and internal docs, so expect them in the input and replace them.
- **Anglicisms: use the term working engineers use, once it is the term of art** (deploy, pipeline, MVP, runway, timeout, PoC, trade-off). Prefer the Spanish word where Spanish engineers use one naturally (*despliegue*, *coste*, *deuda técnica*, *poner en producción*). Never stack several anglicisms in one sentence, and never use English for flavour.
- **Italianisms in the input get corrected, not imitated.** Matteo is a native Italian speaker writing in Spanish. His drafts include forms such as *coesas*, *proprio*, *in parte*, *produccionar*, *Fue entonces que*, *moviendo los primeros pasos*, and missing accents. Fix them to standard Spanish. Keep his sentence logic and his humour.
- **No casual Slack fillers in the prose**: *entre comillas*, *digamos*, *pues eso*, *un poco*, *ojo que*, *rollo*. They are his spoken tics, not his written voice.

### 7.3 English translation pass

Run the English banned-word list over the translation: delve, dive into, unpack, harness, utilize, landscape, realm, robust, game-changer, cutting-edge, straightforward, "in order to", furthermore, additionally, moreover, "it's worth noting", "in today's…", supercharge, unlock, future-proof, streamline, empower, foster, meticulous, paramount, elevate, transformative, tapestry, beacon, multifaceted, intricate, embark, ever-evolving.

- **Contractions always.**
- **The fatal rule travels too.** "This isn't X, it's Y", "Not X. Y.", "Less X, more Y" and every variation invalidate the draft. Watch for it: it is Matteo's most frequent pattern in English.
- "Empower" appears in his LinkedIn headline and posts. It stays banned in the blog translation.

### 7.4 Register: where the calm has edges

- **Parenthetical asides are welcome**, for humour, an honest reaction or deflating his own seriousness: *"(y cotilleos)"*, *"(…Spanish saying)"*.
- **Plain uncertainty is credible**: *"creo"*, *"probablemente"*, *"igual me equivoco"*. Use it for facts he can't confirm, not for his position.
- **Show what went wrong** (section 2.3).
- **Find the line someone would argue with** (section 2.8).

---

## 8. Pre-delivery check for Matteo posts

Run this after the anti-slop pass in `SKILL.md` when drafting, and as an extra checklist when running `blog-post-review` on a Matteo post:

0. Did the input carry Matteo's position, a figure, a decision that aged badly and whose decision it was (plus a real Orbitant case for Software Economics, see section 2b)? If not, were the questions asked in the request thread and answered before drafting? Any gap the requester could not fill must appear inline as `[PENDIENTE MATTEO: …]`.
1. Does every H2 state a consequence (cost, risk, time, value, what it enabled), with the mechanism serving it?
2. Is every technical specific followed by what it cost, risked or allowed? Cut any that aren't.
3. Is there at least one number the reader can redo?
4. Is there a real Orbitant case (anonymised client, Sherpa, Apogee, internal tooling)? For Software Economics, is it more than a paraphrase of Artola?
5. Is there at least one decision that aged badly, or a cost that was underestimated, and is it in the input rather than invented?
6. Does every list answer "why this and not something else, and what did we give up"? Exactly two lists, one bulleted and one numbered?
7. For AI topics: is it clear where AI doesn't belong, and that judgment and responsibility stay human?
8. Does the closing hand the reader a testable rule of thumb or a next step, rather than a summary or "hope it helps"?
9. Is there one line a competent engineer could argue with?
10. If there is a film reference or running metaphor (optional), is there only one, and does it land on a point in the next sentence?
11. Typography sweep: zero em dashes, zero emoji, paragraphs of 3 to 5 sentences (at most one shorter paragraph per H2), numbers as digits, adverbs cut, no *apalancar*, Italianisms and Slack fillers removed, *tú* throughout.
12. On the English version: contractions throughout, and the banned-word list in section 7.3 run over the whole text.
13. Is the draft free of any sentence that negates one framing and then asserts the corrected one? A single occurrence fails it.

If the answer to 1, 2 or 13 is no, rewrite that section before delivering.
