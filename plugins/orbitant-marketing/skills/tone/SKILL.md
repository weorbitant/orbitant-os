---
name: orbitant-tone
description: |
  Voice, tone and house style guide for all Orbitant content: blog, LinkedIn, X,
  newsletter and YouTube. Defines what Orbitant writing sounds like, what it values,
  and what it avoids (banned words and phrases, patterns, punctuation, register,
  English rules), with concrete examples.

  Activate when user asks about Orbitant voice, tone, writing style, brand voice,
  or editorial guidelines. Also trigger when writing, reviewing or translating any
  Orbitant content (blog posts, LinkedIn posts, X posts and threads, newsletters,
  YouTube descriptions), when checking if text "sounds like Orbitant", or when
  creating/editing marketing content, even if they don't explicitly mention tone
  or voice.
version: "1.6.10"
license: MIT
metadata:
  author: orbitant
  tags: marketing, blog, linkedin, x, newsletter, youtube, tone, voice, style, editorial
---

# Orbitant Tone of Voice

This document defines how Orbitant writes. It is the house style guide for anyone creating, reviewing or translating Orbitant content, on any channel (blog, LinkedIn, X, newsletter, YouTube), whether you are a human contributor or the content generation agent.

Orbitant's writing reflects how the team actually thinks and works: with technical rigour, intellectual honesty, and a clear connection to real-world impact. We write to be useful. The voice is conversational-professional: like a knowledgeable colleague sharing what they have learned, confident but humble, technical but accessible.

## How this guide relates to the other files

Everything about how a sentence is written lives here, once. The other files add what belongs to their own piece and point here for the rest.

When two sources disagree, apply this order, highest first:

1. **Notion → Marketing → "Employents communication strategy"**, on one subject only: how Orbitant's people and its AI agents are represented in public. This covers every way of naming them: AI agents, AI employees, Employents (Orbitant's own name for its AI employees, whatever content series is written about them) and any agent with a name of its own, such as Mercuria or Neptuno. Read it when it is available (a Notion tool, or the page given as part of the material), for every piece that touches that subject. If it is not available, apply the standing guardrails (an agent never presents itself as human, agents amplify the team, and a piece discloses that an AI agent took part where the strategy asks for it) and do not mention in the piece that the strategy was not read.
2. **This guide**, on how every sentence is written.
3. **The channel skill**, on what belongs to its piece: who narrates, length, structure, SEO and formats.
4. **The author profile**, when the signer has one, on that person's angle, reader, depth and argument.
5. **The narrative**, as the source of what Orbitant believes (see below).

This guide holds two kinds of rules:

- **Fixed rules.** Every rule here is fixed unless it is marked "by default". A channel skill or an author profile can be stricter than a fixed rule and says so in one line. Neither can relax one.
- **Defaults.** A rule marked "by default" holds until a channel skill states a different rule for its own piece. Only a channel skill can replace a default.

An author profile chooses among the options this guide leaves open (which evidence leads, how deep the mechanism goes, how the piece opens and closes) and can be stricter. Every device a profile allows must also pass this guide.

### The narrative

Orbitant's narrative and its activation framework live in `../blog-post-create/references/` (`orbitant-narrative.md` and `orbitant-activation-framework.md`). By default, read both before writing and keep the piece coherent with them: the three pillars (engineering, innovation and business understanding), AI as a multiplier of what a company already is, and results in production.

The narrative decides what Orbitant stands for. This guide decides how each sentence is written. In practice:

- Take the ideas from the narrative and write them with the rules of this guide. Those documents are written as a manifesto and use sentence shapes this guide bans; the ideas carry over and the shapes stay there.
- The Orbit Language (orbit, gravity, thrust, escape velocity; in Spanish, órbita, gravedad, impulso y velocidad de escape) is a lens for framing a piece, used where it fits the idea. It never replaces a technical term, the primary keyword or the word a reader would search for: "deuda técnica" stays "deuda técnica".
- A channel skill can switch the narrative vocabulary off for its piece.

### Audience

By default, Orbitant writes for mid-to-senior software engineers, tech leads and engineering managers, and for the technical decision-makers they work with (CTO, CIO, CPO). A channel skill can narrow it.

---

## Core principles

### 1. A real voice
When a person signs the piece, write in first person from their own experience: singular for what they thought, decided or learned themselves, plural for what a team did together and when speaking as Orbitant. A migration, a release or a measurement is team work, so the plural is the natural form for it. Never write in the third person about your own work or decisions: it creates distance and makes the content feel generic.

By default, a piece that no person signs is narrated by Orbitant as a company: "we" for Orbitant's own work, no first person singular and no signature. The principle is the same as for a signed piece: write like someone who did the work, with concrete facts and no brochure language.

> ✅ **Así sí**
>
> Cuando empezamos a migrar el sistema de autenticación, lo primero que hicimos fue mapear todos los puntos de entrada, porque habíamos quemado semanas en una migración anterior por saltarnos ese paso.

<!-- -->

> ❌ **Así no**
>
> Las empresas que afrontan migraciones de sistemas de autenticación deben considerar mapear todos los puntos de entrada como primer paso del proceso.

---

### 1b. Other people's voices

Many pieces start from a group conversation (a Slack thread, a session where several engineers gave their take) or rest on what somebody else said. Whoever narrates, the contributions of other people enter the piece as prose attribution.

The prose pattern is: context sentence → attribution (who) → the person's actual point, paraphrased or quoted depending on whether the phrasing itself is what matters.

> ✅ **Así sí (primera mención)**
>
> Kevin Martínez, software architect, llevaba semanas midiendo el consumo de tokens con ambos enfoques y el resultado se repetía: con arquitectura hexagonal, el agente necesitaba entre tres y cinco veces más contexto para completar el mismo cambio.

<!-- -->

> ✅ **Así sí (menciones siguientes)**
>
> Kevin hizo otra medición con un repositorio más pequeño y la proporción fue la misma.

<!-- -->

> ❌ **Así no**
>
> Kevin dijo: «Con arquitectura hexagonal, el agente necesita mucho más contexto».

The prose version gives context, stakes and continuity; the quote version reads like a transcript.

**Attribution format.** The first time a person other than the narrator appears, give their name and functional role. From the second mention on, use the name alone: a role repeated at every mention is noise.

**Roles.** A role is functional (software engineer, software architect, DevOps engineer, engineering manager, QA engineer), never a seniority level (Senior, Junior, Lead). It is always written in English: in lower case inside Spanish text ("Kevin Martínez, software architect") and capitalised inside English text ("Kevin Martínez, Software Architect").

**Literal quotes**: when a sentence in running prose reproduces someone's literal words, wrap it in quotation marks, even if it is not set as a blockquote. Otherwise it reads as the author's own paraphrase rather than an attributed quote. When a literal quote is translated, keep it faithful to what was said: a piece that rests on someone's exact words cannot afford a loose rendering.

**Speaker not named in the material**: when a piece reports on someone the material does not name (an interview, a talk, a session), keep them in the third person with one neutral phrase used the same way throughout: "la persona entrevistada" for an interview, "la persona que da la charla" for a talk or a session ("the person interviewed", "the speaker" in English). Never invent a name, a role, a gender, a company or a handle, and never turn what they lived into Orbitant's own story. A stable phrase lets a name replace it later without rewriting the piece.

---

### 2. Real examples over abstract theory
Every claim should be grounded in something concrete: a project, a decision, a failure, a result. If you cannot think of a real example, that is a signal that the section needs more thought, not more words.

Theory is only useful when it explains a real situation. Lead with the example, then explain the principle behind it.

The concrete case is the evidence and the idea is the subject: a piece is about the pattern, the decision or the lesson, and the project, the client or the stack is what proves it.

> ✅ **Así sí**
>
> Teníamos un *pipeline* que tardaba veintidós minutos en completarse. Después de medir cada paso, descubrimos que el sesenta por ciento del tiempo lo consumía un único test de integración que se conectaba a una base de datos real. Lo reemplazamos por un *mock* y bajamos a ocho minutos.

<!-- -->

> ❌ **Así no**
>
> Optimizar los tiempos de ejecución de los pipelines de CI/CD es fundamental para mejorar la productividad de los equipos de desarrollo y reducir el time-to-market.

---

### 3. Explain the why behind technical decisions
Do not just describe what you did. Explain why you chose that approach over the alternatives, what you ruled out and why, and what trade-offs you accepted. This is what makes technical content genuinely useful and what distinguishes Orbitant's voice from generic documentation.

> ✅ **Así sí**
>
> Elegimos SQLite para el almacenamiento local por tres razones: evitaba un servidor aparte, encajaba con un volumen de datos pequeño que conocíamos de antemano y permitía que cualquier persona del equipo levantara el proyecto sin configuración adicional. Valoramos PostgreSQL, pero añadía complejidad operativa que no queríamos asumir en ese contexto.

<!-- -->

> ❌ **Así no**
>
> Para el almacenamiento local se utilizó SQLite, una solución ligera y eficiente ampliamente utilizada en el sector.

---

### 4. Practical over theoretical
Prioritise content that the reader can apply and that search engine crawlers and LLMs can read. Code snippets and configuration examples are worth more than three paragraphs of explanation. When you can show something, show it as text or code.

Any information the piece depends on (a table, a comparison, a list of steps, a command, a figure) goes in as text, code or a real table. Crawlers and LLMs cannot read the content of an image or a video, and the reader cannot copy it. Screenshots, screen recordings and diagrams can accompany the piece, always next to a text version of the same information.

By default, a section that explains something technical follows this order:
1. State the problem or decision
2. Show the solution, as text or as code where the channel carries code
3. Explain what matters and why

> ✅ **Así sí**
>
> Para evitar que las variables de entorno se filtren en los registros, añadimos un *middleware* de limpieza antes del *logger*:
>
> ```typescript
> app.use(sanitizeEnvMiddleware());
> app.use(logger());
> ```
>
> El orden de las dos líneas importa, porque si las inviertes el *logger* captura los datos antes de que se limpien.

<!-- -->

> ❌ **Así no**
>
> Es importante gestionar correctamente las variables de entorno para garantizar la seguridad de las aplicaciones. Existen diversas estrategias para evitar que información sensible quede expuesta en los registros del sistema.

---

### 5. Honest about trade-offs and mistakes
Good technical writing acknowledges what did not work, what could be better, and what limitations exist. Readers trust content more when it is honest about complexity. Do not oversell solutions. Do not hide the hard parts.

> ✅ **Así sí**
>
> Este enfoque funciona cuando el equipo es pequeño y los dominios están bien delimitados. Si tienes más de cuatro o cinco equipos trabajando en paralelo, empieza a aparecer fricción en los límites, así que probablemente necesites definir con más claridad quién responde de cada dominio.

<!-- -->

> ❌ **Así no**
>
> Esta solución es escalable y puede adaptarse a equipos de cualquier tamaño, garantizando la eficiencia operativa en todo momento.

---

## What Orbitant writing is not

- **Not a brochure**: We write to share what we know. If the content is genuinely useful, it speaks for itself. We write from the reader's perspective: what the reader can apply or decide comes before anything we want to announce. Never praise Orbitant or the author explicitly: the content demonstrates the authority.
- **Not forced**: dry humour is welcome when it comes up naturally, in an aside or a dry observation, the kind of thing a sharp colleague would say. Never forced and never performative.
- **Not neutral**: We have opinions. We explain why we prefer certain approaches, tools, or patterns. We do not hedge every sentence to avoid taking a position.
- **Not formal**: We do not use "usted" or corporate passive voice (see *Register* below). We write like we talk: clearly and directly.
- **Not translated**: When the material is in another language, usually English notes, we write from its ideas, not from its sentences. No sentence should read as a sentence of the material put into Spanish. The calques this guide lists are examples, not the boundary: any phrase a Spanish editor would not write (English word order, "lo que importa más", a passive with nobody acting like "pasaron a descubrirse") is rewritten the way a native writer would say it. Ordinary Spanish editing applies without being listed: no word repeated within a sentence unless it is the term under discussion, and no sentence that says nothing ("la diferencia entre ambas cosas es la diferencia").
- **Not theoretical**: We write about how things work in practice, with real constraints and real consequences.

---

## Style rules

These rules apply to every piece Orbitant writes, revises or translates, on every channel. They cover how a sentence is written. A channel skill can be stricter and says so explicitly; it is never more permissive.

Escape clause. It covers only the words in section 1.2 and the patterns in section 2: one of them may stay when it is the clearest option, carries the author's real voice or is quoted as an example, so do not force an unnatural rewrite to avoid it. It never covers the hard bans in section 1.1, "No es X, es Y" in any form, rhetorical questions, pseudo-profound closers or a phrase taken from the source material. A channel skill or an author profile can remove the escape clause altogether.

---

## 1. Banned words and phrases

### 1.1 Hard bans

Never use these, in any form or tense, regardless of context. Treat them as red flags in any review.

| Word / pattern | Problem | Instead |
|---|---|---|
| "con honestidad" | Hollow filler: implies other parts are dishonest. Not recommended: avoid it, and never use it more than once per article. The noun on its own ("esa honestidad es el mejor punto de partida") is the same filler and is not allowed. | Say the thing directly |
| "honesto / honesta / honestos / honestas / honestamente" | Same hollow-filler problem as "con honestidad": implies the rest isn't honest | Say the thing directly, without labelling it as honest |
| "incómodo / incómoda / incómodos / incómodas" | Vague, overused framing device ("la pregunta incómoda"): tells the reader how to feel instead of showing why something is hard | A precise adjective, not a padded rephrasing: "la pregunta inesperada", "la pregunta determinante", "la pregunta decisiva" |
| "provocador / provocadora / provocadores / provocadoras" | Sounds like business magazine copy, not a technical colleague | Describe what specifically challenges or unsettles, without reaching for "incómodo" either |
| "sostener / sostengo / sostienes / sostiene / sostenemos / sostienen / sostuvo / sostuvieron / sostenía / sostenían / sostendrá / sostenga / sostengan / sosteniendo / sostenido / sostenida / sostenidos / sostenidas" | AI slop ("sostener un sistema", "lo que sostiene…"). Agreed as banned on 2026-09-17. | Say what the thing actually does: "mantiene", "soporta", "permite", "depende de" |
| "en el mundo actual" | Journalist cliché, adds no information | Delete, or replace with the specific context |
| "es crucial / es fundamental / esto es fundamental" | Tells the reader what to think without showing why | Show the consequence instead |
| "sin duda" | Hollow intensifier | Delete |
| "hoy en día más que nunca" | Timeless cliché | Delete |
| "la parte que más me interesa" | AI-sounding filler: no real person writes like this | State the point directly |
| "me parece especialmente relevante destacar" | AI hedging plus filler preamble | Delete the preamble; state the point |
| "no podemos dejar de mencionar" | Filler | State the point directly |
| "como efecto secundario" | Vague causal connector: doesn't say what actually caused what | State the direct cause or consequence |
| "el why" | Avoidable anglicism | "el porqué" |
| "el approach" | Avoidable anglicism | "el enfoque" |
| "el timing" | Avoidable anglicism when it means "moment" | "el momento" |
| "profundizar / profundiza / profundizan / profundizamos / profundizando / profundicemos" | AI filler verb ("vamos a profundizar") | Say what is explained |
| "fomentar / fomenta / fomentan / fomentamos / fomentando" | Corporate filler verb | The concrete verb: "favorece", "permite", "provoca" |
| "apalancar / apalanca / apalancan / apalancamos / apalancando / apalancarse" | Anglicism ("to leverage") | "usar", "aprovechar", "partir de" |
| "empoderar / empodera / empoderan / empoderamos / empoderando / empoderamiento" | Corporate buzzword | Say what the person can now do |
| "agilizar / agiliza / agilizan / agilizamos / agilizando" | Corporate buzzword | Say what gets faster and by how much |
| "adentrarse / adentra / adentran / adentramos / adentrando / adentrarnos" | AI filler verb | "entrar en", or state the topic directly |
| "aprovechar el poder de" | Marketing cliché | Say what is used and for what |
| "desbloquear el potencial / desbloquear su potencial / desbloquea el potencial" | Marketing cliché | Say what becomes possible |
| "supercargar / supercarga / supercargan / supercargamos" | Anglicism ("supercharge") and hype | Say what improves |
| "robusto / robusta / robustos / robustas" | Hollow adjective; a measurement or a fact says more | Replace it with a fact or a measurement |
| "de vanguardia" | Hollow adjective | Replace it with a fact or a measurement |
| "cambio de paradigma" | Importance inflation | State what changes |
| "revolucionario / revolucionaria / revolucionarios / revolucionarias" | Hype | State what is new |
| "disruptivo / disruptiva / disruptivos / disruptivas" | Hype | State what it displaces |
| "transformador / transformadora / transformadores / transformadoras" | Hype | State what it transforms |
| "un antes y un después" | Importance inflation | State the fact and let the reader judge |
| "esto lo cambia todo" | Importance inflation | State the fact and let the reader judge |
| "sinergia / sinergias" | Corporate buzzword | Say who works with whom and what comes out |
| "holístico / holística / holísticos / holísticas" | Corporate buzzword | Say which parts are covered |
| "sin fisuras" | Hollow adjective | Say what works together and how |
| "multifacético / multifacética / multifacéticos / multifacéticas" | AI adjective | Name the facets |
| "meticuloso / meticulosa / meticulosos / meticulosas" | AI adjective | Say what was checked and how |
| "intrincado / intrincada / intrincados / intrincadas" | AI adjective | Say what makes it complex |
| "primordial / primordiales" | AI adjective | "importante" with the reason, or delete |
| "abanico de posibilidades" | Cliché | List the real options |
| "en constante evolución" | Cliché | Say what changed and when |
| "emprender un viaje" | AI metaphor | Say what was done |

A row does not apply when the word is the literal technical term of the subject under discussion (an "estimador robusto" in a text about statistics). Which English terms stay in English, and which of them take italics, is defined in the glossary in section 4.

### 1.2 Words that need a reason

These are fine when they say something no other word would. They are not flagged automatically; the writer or reviewer decides.

- **Overused words:** utilizar (almost always "usar"), ámbito, potenciar, impulsar, ecosistema, escalable, hoja de ruta, solución (as a euphemism for "product"), experiencia (as a euphemism for anything), hub, centralizado, plataforma unificada, punto único, clave, esencial.
- **Figurative uses to avoid:** elevar ("eleva tu negocio"), facilitar (as a filler verb), puntero (as an adjective, never the programming term), tapiz, entramado, faro (as metaphors).
- **Adverbs and filler words that are almost always empty:** realmente, simplemente, literalmente, sinceramente, básicamente, prácticamente, verdaderamente, indudablemente, claramente, obviamente, curiosamente, ciertamente, notablemente, de alguna manera, por así decirlo. Cut them when they don't carry real emphasis, doubt, or contrast.
- **Phrases that are usually empty:** cabe destacar / mencionar, es importante señalar, vale la pena señalar, hay que decir que, al fin y al cabo, en definitiva, cuando se trata de, a la hora de, en lo que respecta a, en su núcleo / esencia, en la era digital, en el vertiginoso mundo de, en el vertiginoso panorama tecnológico, en el contexto actual, es de vital importancia, sin más dilación, la realidad / verdad es que, a nivel de (unless referring to a real technical level, e.g. "a nivel de base de datos"), no en vano. "En base a" is also grammatically incorrect: use "según" or "a partir de".

---

## 2. Patterns

Patterns cannot be checked word by word. Reviewers and writers look for the shape.

**"No es X, es Y" (negate-then-assert), in every form.** "No se trata de X, sino de Y", "X, no Y" ("una etiqueta, no una garantía"), "No X. Y.", "Lo que importa no es X: es Y", "Lo primero no es X: es Y", "La diferencia no está en X, sino en Y", "Menos X, más Y". It is a copywriting cliché that adds nothing semantically. Lead with the affirmative claim directly. When the material phrases an idea this way (English notes often do: "a label, not a guarantee"), keep the idea and state it affirmatively; the shape does not carry over. It is forbidden in headings, hooks, titles and body alike, and the escape clause never covers it.

> ✅ **Así sí**
>
> Lo que separa un vídeo que vende de uno que da pena es la voz del narrador.

<!-- -->

> ❌ **Así no**
>
> Lo que separa un vídeo que vende de uno que da pena no es el guion. Es la voz.

**Rhetorical questions**, anywhere: hook, transition, heading, closing, thread or caption. A standalone "¿Por qué?" or "¿Te suena esto?" is a common AI-generated pattern; it weakens the writing whether or not the referent is clear. A question invites the reader to answer "no" and scroll on. Restate it as a declarative sentence. A genuine question a reader would ask, as in a block of frequently asked questions, is not a rhetorical question. Never close with engagement bait of any kind: a question ("¿Qué opinas?"), a request to react or follow ("Sígueme para más", "Guarda esto", "RT si te ha pasado") or a request to share.

**Throat-clearing openers:** "Vamos a ser sinceros", "Seamos honestos", "Te lo digo claro", "Ojo a esto", "Es importante señalar que…". Cut them and state the point.

**Self-introductions and announcements:** never open a piece by presenting who writes or announcing that something exists ("Estamos encantados de anunciar…", "Orbitant presenta con orgullo…"). Open with the insight. Naming a person for something they did is not a self-introduction and is encouraged.

**False reveal:** "Lo que nadie te cuenta", "El error que comete el 90%". Cut the setup and let the claim stand on its own.

**Growth-hacker voice:** listicle bait and promises of a secret, in either language: "Lo que aprendimos en diez lecciones", "Esto cambió para siempre cómo pienso sobre X", "Roba esto". State the finding itself.

**Dramatic colon:** "La clave: X." Rewrite as a normal sentence.

**Shallow-analysis gerund and posteriority gerund:** "…, demostrando el compromiso con…" and "Lanzaron A, mejorando B un treinta por ciento". The second is a grammatical error, not just a style issue: write "Lanzaron A y B mejoró un treinta por ciento".

**Importance inflation:** "supone un hito", "marca un antes y un después", "juega un papel fundamental", "consolida su posición como". State the fact and let the reader judge whether it matters.

**Foundation metaphors:** "pilar fundamental", "piedra angular", "columna vertebral", "eje central". Say what the thing actually does in the real system.

**Consecration verbs:** "se erige como", "se posiciona como", "ha llegado para quedarse". Prefer "es" or "tiene".

**Vague attribution and invented figures:** "los expertos coinciden", "la mayoría de los equipos", "nueve de cada diez" with no source. Name the source, downgrade the claim to what was observed directly, or flag it as pending. Never invent figures, sources, links or handles: when the material does not give one, flag it as pending.

**Tense of ongoing work:** use the present for workflows, tools and features that are active today. A past tense ("construimos", "fue", "era") for something that still works reads as if it had been retired.

**Roadmap presented as operational:** keep what exists today apart from what is planned or in development. Never describe a planned feature as if it already worked.

**Meta-commentary openers and recap closers:** don't open with "En este artículo veremos…" or any other announcement of the text itself, and don't close with "En resumen…" or a bullet recap of what the piece already said. Start with the problem and end on the next step or on the clearest concrete sentence.

**Unsupported or truncated absolutes:** "es imposible", "no escala", "ahí está nuestro hueco más claro", without saying for what, in which scenario, or with what evidence. Delete them unless backed by a concrete example or data point.

**Vague comparatives:** "cuanto más fina la pregunta, mejor la respuesta". Use precise adjectives: "cuanto más concreta la pregunta, más precisa la respuesta".

**Hollow adjective pairs:** "robusto y de vanguardia", "simple y potente". Replace them with a fact or a measurement.

**AI filler formulas:** "la parte que más me interesa", "me parece especialmente relevante destacar", "no podemos dejar de mencionar" (the exact phrases are hard bans in section 1.1). Any new variant of the same shape is treated the same way.

**Repetition and synonyms:** two opposite failures to avoid.

First, don't rotate between words that name different things as if they were synonyms ("el agente / el asistente / la herramienta"). Each word reads as a distinct concept, so pick the precise term and keep it for that concept across the article.

Second, don't repeat the term mechanically. In a paragraph of 5 to 8 lines the term can appear twice; a third time is too many. From the third mention on, use a pronoun or an omitted subject, or restructure the sentence so the term is not needed. A different noun is acceptable only when it points to the same thing without ambiguity and adds information ("el sistema que orquesta las tareas").

**The primary keyword is the exception.** Wherever the channel skill requires it, repeat the keyword exactly as written: that repetition is intentional. Do not replace it with a synonym there. Everywhere else, this rule applies to the keyword like to any other term.

Within a single sentence, never repeat the same verb or noun ("resuelve… pero no resuelve…"); restructure the sentence instead.

> ❌ El agente recibe la petición. El agente consulta la documentación. Después el agente redacta la respuesta.
>
> ✅ El agente recibe la petición, consulta la documentación y redacta una respuesta con las fuentes.

**"Y" between contrasting ideas:** "y" adds. When the second idea contrasts with the first, use "pero", "aunque" or "sin embargo".

> ✅ **Así sí**
>
> Mover la ingesta nos costó semanas que no habíamos planificado, pero volveríamos a tomar la misma decisión.

<!-- -->

> ❌ **Así no**
>
> Mover la ingesta nos costó semanas que no habíamos planificado y aun así volveríamos a tomar la misma decisión.

**Dramatic fragmentation:** "Y punto.", "Así de simple.", "Sin más." Use complete sentences.

**Staccato rhythm:** a run of short, simple sentences separated only by full stops when the ideas in them are related reads as fragmented, not punchy. When two or more short sentences belong together (cause and effect, contrast, sequence, addition), join them with a grammatical connector ("y", "pero", "aunque", "porque", "así que", "mientras", "cuando") or restructure so the relationship is explicit. A short sentence used deliberately for emphasis, after a longer one, is fine.

> ✅ **Así sí**
>
> Desplegamos el cambio y los tiempos bajaron un cuarenta por ciento, así que el equipo lo celebró.

<!-- -->

> ❌ **Así no**
>
> Desplegamos el cambio. Los tiempos bajaron un cuarenta por ciento. El equipo lo celebró.

**Robotic rhythm:** paragraphs with identical repeated structure, runs of sentences of the same length, and textbook connector chains ("Además… Por otro lado… No obstante…").

**Repeated openings:** don't open two consecutive sentences, or two consecutive paragraphs, with the same word, verb or structure. Repeated openings read as a template, not as a person writing. This also applies to the bullets of a list.

> ✅ **Así sí**
>
> El *hash* garantiza que la descarga es íntegra y cada actualización del conocimiento pasa además por una *pull request* revisada.

<!-- -->

> ❌ **Así no**
>
> Fijar un *hash* resuelve la integridad de la descarga. Actualizar el cerebro del agente pasa por una *pull request* revisada.

**Pseudo-profound closers:** the "deep" final line that turns the point into an aphorism or mic-drop ("Y eso, al final, lo cambia todo."; "Ahí es donde está el trabajo real."). Delete it and end on the clearest concrete sentence already in the draft. This holds in every channel and for every kind of ending, the last slide of a carousel and the last post of a thread included. A concrete instruction the reader can apply is a next step and is a valid ending.

**Precise wording.** Write the plain, exact version of each sentence. Three patterns to catch:

- Don't adjectivise a process; describe it. Telling the reader how a step felt ("la forma menos cómoda", "un proceso apasionante") adds nothing. Say what was done and why.
  - ❌ "Lo comprobamos de la forma menos cómoda posible: migrando al paquete real el conocimiento copiado en el repositorio."
  - ✅ "Para comprobarlo, migramos al paquete real el conocimiento copiado en el repositorio y asumimos el riesgo de que algo cambiara por el camino."
- Pick the verb that says exactly what happens. Check each main verb against what the sentence means.
  - ❌ "Cada formato nuevo significaba escribir código nuevo."
  - ✅ "Cada formato nuevo implicaba escribir más código."
- No convoluted or tautological sentences. If a sentence needs a second read, or says the same thing twice, rewrite it with a clear subject and a direct verb.
  - ❌ "Ningún cambio en lo que el agente sabe llega a producción sin que una persona lo revise y sin que un conjunto de casos de prueba lo valide antes."
  - ✅ "Cualquier cambio en la información que usa el agente debe revisarlo una persona y validarse con pruebas antes de llegar a producción."

**Concrete over abstract.** Name the tool, the technique, the decision or the result. No filler praise ("una sesión muy interesante", "una conversación fascinante", "todo lo que necesitas saber sobre…"): let the content demonstrate its value. A number, a measurement or a named consequence outperforms wordplay.

---

## 3. Punctuation and typography

### Em dash (—)

The em dash is always a last resort. In Spanish its only correct use is a two-sided personal aside, and even then a comma-bounded aside or parentheses almost always do the same job, so prefer them. A single-sided em dash is an anglicism that does not exist in Spanish punctuation: flag it in any review.

> ✅ **Así sí**
>
> Esta decisión, algo que Kevin midió durante semanas, tiene un coste real en tokens y latencia.

<!-- -->

> ✅ **Así sí (parentheses)**
>
> Esta decisión (algo que Kevin midió durante semanas) tiene un coste real en tokens y latencia.

<!-- -->

> ❌ **Así no (calco del inglés)**
>
> El resultado es claro — la arquitectura añade fricción innecesaria.
>
> Hay tres motivos — contexto, latencia, coste.

For continuations, use a colon or a full stop. For enumerations, use a list or "x, y y z" in prose. In English the em dash is correct punctuation, and it is also widely read as a sign of machine-written text. Treat it as a last resort there too: use a comma, a colon, parentheses or a full stop whenever one of them does the job.

This rule is about the em dash as punctuation inside prose. It does not apply to the dash when it is a fixed format element of a piece, such as a list marker, a separator or an attribution line. The channel skill defines which format elements use it, and they are respected as that skill states.

A channel skill may forbid the em dash outright as punctuation. That is stricter than this rule and overrides it for that channel.

### Comma before "y" / "o" / "ni"

In Spanish text, do not use a comma before "y", "o" or "ni" when they join the last two items of a simple enumeration: that is an anglicism (the English serial comma), not correct Spanish. Check every enumeration in the draft for it.

> ✅ **Así sí**
>
> Lo decidimos por tres razones: contexto, latencia y coste.

<!-- -->

> ❌ **Así no (calco del inglés)**
>
> Lo decidimos por tres razones: contexto, latencia, y coste.

Exceptions: a comma before "y" is correct only in these cases.

- The enumeration is complex, because its items already contain commas or semicolons: "Preparamos el entorno de pruebas, con los datos anonimizados; revisamos el código, que llevaba meses sin tocarse; y desplegamos el viernes."
- The comma closes a parenthetical clause: "El equipo, que ya conocía el sistema, y el cliente acordaron el plan."
- The "y" links with the whole predicate that precedes it, not only with the last item of an enumeration: "Probamos el servicio con datos reales, anonimizados o sintéticos, y nos quedamos con los últimos."

In every other case, including a plain list of nouns or short phrases and a list of clauses, there is no comma before "y", "o" or "ni".

### Other typography (Spanish text)

- Opening marks ¿ and ¡ are mandatory.
- Headings in sentence case ("Cómo mejorar tu escritura", not "Cómo Mejorar Tu Escritura").
- Quotation marks: Spanish angle quotes («…») in every Spanish text, with “…” for a quote inside a quote. The straight quotes in this guide only mark examples inside the instructions and never reach a published text. English text uses double quotes (“…”).
- Comma for decimals and period for thousands (3,5 / 1.200).
- Watch "solo" (no accent), "más / mas", "aún / aun" and "porqué / por qué / porque / por que".
- Acronyms: on first mention write the full form followed by the acronym in parentheses, then the acronym alone: interfaz de usuario (UI), integración continua (CI), *pull request* (PR). Product names are not expanded. This rule is for running text: titles and headings use the acronym alone, with no expansion.
- Exclamation marks: avoid them. The one exception is celebrating a concrete milestone.
- Numbers: by default, written out in words in running text (veintidós minutos, sesenta por ciento). Digits stay where words cannot do the job: code, version numbers, dates and tables. The signer's author profile can state a different rule.
- Italics, where the channel renders them, for the English terms the glossary in section 4 marks.
- Emoji: none in running text, by default. A channel skill defines the fixed elements of its piece that carry one.

---

## 4. Register

### Address: tú, never usted

In Spanish, informal "tú" with the reader, always. No "usted", no corporate passive voice.

### Orbitant as context, never as subject

Orbitant can and should appear in content, but as context. The subject is always the technical problem, the decision, or the learning.

Never start a sentence or a paragraph with "En Orbitant + verb" ("En Orbitant llevamos…", "En Orbitant hemos…", "En Orbitant creemos…"). It reads as corporate throat-clearing. The same construction in the middle of a sentence is not recommended either: the preferred form bounds the company mention in a trailing clause ("…, como hacemos en Orbitant", "…, algo habitual en Orbitant"), so "Orbitant" flows at the end of the sentence and is not its grammatical subject. Sometimes the sentence cannot be rebuilt that way without sounding forced; in that case a mid-sentence mention is acceptable, as the exception and never as the habit.

> ✅ **Así sí**
>
> Conviene validar los contratos entre servicios antes de cada despliegue, como hacemos en Orbitant.

<!-- -->

> ❌ **Así no (never as an opener)**
>
> En Orbitant validamos los contratos entre servicios antes de cada despliegue.

<!-- -->

> ❌ **Así no**
>
> En Orbitant, empresa líder en consultoría de software de nueva generación, hemos desarrollado una metodología propia que…

### Clients

By default, a client is never named: write "un cliente" or describe its sector ("un cliente del sector logístico"), also when giving context. A client is named only in a piece whose channel skill exists to tell that client's story with their approval.

### Links

A link points to the version of the content written in the language of the piece, whenever that version exists.

### Anglicisms and glossary

An English term stays in English only when it is the one working engineers use and Spanish has no settled word for it. Never stack several English terms in one sentence and never use English for flavour. The anglicisms listed in section 1.1 are hard bans and are not repeated here.

**Always in Spanish.**

| Avoid | Write |
|---|---|
| deploy, deployment | despliegue, desplegar |
| asset | recurso |
| librería (outside code jargon) | biblioteca |
| customizar | personalizar |
| remover | quitar, eliminar |
| sanitizar | limpiar, sanear |
| vendorizar | copiar en el repositorio |
| produccionar | poner en producción |
| technical debt | deuda técnica |

**In English, without italics** (settled in everyday Spanish): test, token, software, blog, post, newsletter, insights, frontend, backend. Product names and acronyms (MVP, PoC, API) take no italics either.

**In English, in italics where the channel renders them** (terms of art): *framework*, *pipeline*, *dashboard*, *pull request*, *commit*, *sprint*, *endpoint*, *timeout*, *mock*, *middleware*, *logger*, *hash*, *linter*, *trade-off*, *runway*, *clean code*, *contract testing*.

A term missing from these lists follows the first paragraph: Spanish when engineers have a Spanish word for it, English in italics when they do not.

**Calques to rewrite.**

| Calque | Write |
|---|---|
| hacer sentido | tener sentido |
| aplicar para (un puesto) | solicitar |
| en orden de + infinitive | para |
| basado en (at the start of a sentence) | según |
| adicionalmente | además |
| consistentemente | de forma constante |
| accionable | aplicable |
| impactar algo | afectar a algo |
| eventualmente (meaning "finally") | al final |
| un cambio barato / caro, una decisión barata / cara | un cambio sencillo / costoso, una decisión fácil / difícil de revertir |
| turno tras turno | en cada interacción, a lo largo de la conversación |

### Transcripts and spoken material

Do not copy the speaker's spoken phrasing literally from a transcript: oral Spanish reads wrong in writing, and spoken tics ("digamos", "pues eso", "ojo que", "rollo", "entre comillas", "un poco") do not carry over. Rewrite the idea the way a Spanish editor would, and read each sentence aloud: if it sounds translated, rewrite it.

Automatic transcripts mangle the names of people, companies and tools. Correct them with the material you were given and with this list of errors already seen:

- "Keith Martínez" → Kevin Martínez
- "órbita", "órbitan" → Orbitant
- "T, www, E, F", "testing Df" → TWD
- "Twee" → tester-army/e2e
- "Cloud" (when the speaker means the AI) → Claude
- "Mad Pocock" → Matt Pocock

When a name looks wrong and the material cannot confirm it, write the most likely form followed by a question mark in parentheses (`Laia (¿Laya?)`) and flag it in the output.

A methodology (TDD, red-green-refactor) and a tool are different things: never describe one as the other, and never list the same tool twice under different descriptions.

### Periphrasis and noun piles (*sustantivitis*)

Replace "proceder a", "llevar a cabo", "hacer uso de", "tener la capacidad de", "tomar la decisión de" with the direct verb (hacer, empezar, usar, poder, decidir). Replace administrative connectors too: "mediante" → "con", "previo a" → "antes de". Break chains of abstract nouns ("la implementación de la mejora de la gestión de X") into verbs ("mejoramos cómo gestionamos X"). Avoid the passive voice when it hides who is responsible ("fue implementado por el equipo" → "el equipo lo implementó"). Avoid the English-order adjective before the noun ("una potente herramienta" → "una herramienta"). Avoid the bureaucratic "el mismo" and "dicho".

### Pronoun clarity

Avoid ambiguous pronouns ("eso", "esto", "ello") whose referent is not obvious from the immediately preceding sentence. Name the subject explicitly instead of leaning on a demonstrative.

> ✅ **Así sí**
>
> Ese flujo nos ha dado canales de alerta por servicio.

<!-- -->

> ❌ **Así no**
>
> Eso nos ha dado canales de alerta por servicio.

### Inclusive language

Avoid the generic masculine plural ("los compañeros", "los desarrolladores", "los usuarios") when referring to a group that may include people of any gender. Replace it with a collective noun that refers to the group as a whole.

> ✅ **Así sí**
>
> Se lo comenté al equipo de plataforma.
>
> Quienes probaron el nuevo *linter* notaron que analizaba el código más rápido.

<!-- -->

> ❌ **Así no**
>
> Se lo comenté a los compañeros del equipo de plataforma.
>
> Los desarrolladores que probaron el nuevo *linter* notaron que analizaba el código más rápido.

Prefer "el equipo", "la plantilla", "el grupo", "las personas que…", "quienes…", or the functional roles used elsewhere in this guide (software engineer, DevOps engineer, etc.). This is not about rewriting every masculine noun: job titles like "ingeniero" stay as used, including in bylines. It is about not defaulting to the generic masculine when a neutral collective noun reads just as naturally.

### Consistency

Spanish text uses Spain Spanish: vocabulary, spelling and forms of address as used in Spain (always tú, never vosotros), with no Latin American regionalisms. Keep the same form of address across the whole piece without mixing.

---

## 5. English

This section applies to every text written in English, whatever the channel: an English-only piece, a translation, or the English version of a bilingual piece. The channel skill defines which language or languages each piece is written in. In a bilingual piece, the Spanish version follows the Spanish rules in this guide and the English version follows this section. The English text gets the same patterns as the Spanish (section 2: no negate-then-assert, no rhetorical questions, no throat-clearing, no pseudo-profound closers) and the rules below. The Spanish hard-ban table does not catch English words, so run this list over every English text. These words are not in the table on purpose: the automatic check reads the Spanish draft, and a quoted English word would flag correct Spanish text.

**Banned in English** (among others): delve, dive into, unpack, harness, utilize, landscape, realm, robust, game-changer, game-changing, cutting-edge, state-of-the-art, innovative, straightforward, "in order to", furthermore, additionally, moreover, "it's worth noting", "in today's…", supercharge, unlock, future-proof, streamline, empower, foster, meticulous, paramount, elevate, transformative, revolutionary, tapestry, beacon, multifaceted, intricate, embark, ever-evolving, seamless, paradigm shift, synergy, holistic, honest / honestly, uncomfortable, navigate (figurative), journey (figurative).

- **"Leverage" is a noun** ("operating leverage", "leverage in a negotiation"). Using it as a verb is banned.
- **Empty words** (cut unless they carry real meaning): really, basically, simply, literally, truly, key, essential.
- **Negate-then-assert in English:** "This isn't X, it's Y", "Not X. Y.", "Less X, more Y" and every variation. State the positive claim and delete the negation.
- **Filler openers:** "It's no secret that…", "In today's world…", "We're excited to…", "Here is everything you need to know".
- **Growth-hacker voice in English:** "Most developers get this wrong", "10 lessons I learned", "This changed how I think about X forever", "Steal this".
- **Natural English, not translated Spanish.** Adapt sentence structure, rhythm and idioms. The result reads as if it had been written in English originally.
- **Headings in sentence case**, as in Spanish.
- **English typography:** point for decimals and comma for thousands (3.5 / 1,200).
- **Roles capitalised** (Software Architect), as section 1b of the core principles defines.

---

## 6. Final style pass

Before delivering any text, re-read it once, end to end, against sections 1 to 5. Flag and fix anything that matches, applying the escape clause only as described at the top of this part. Channel skills add their own final checks for the shape of their piece.
