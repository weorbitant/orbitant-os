---
name: orbitant-newsletter
description: |
  Drafts the monthly Orbitant newsletter from Slack links, Knowledge Sharing
  recaps, blog posts, and meetup updates. Activate when the user mentions
  "newsletter", "monthly email", "prepare the newsletter", "newsletter de [mes]",
  "borrador de newsletter", or provides materials for the monthly send (KS recap,
  Slack links, blog posts). Also triggers when asked to "draft the email for this
  month" or "prepare the MailerLite send". Curates Slack channel links autonomously,
  writes all copy in English, and outputs a complete Markdown draft ready for
  MailerLite layout.
version: "1.0.0"
license: MIT
metadata:
  author: orbitant
  tags: marketing, newsletter, email, mailerlite, slack, knowledge-sharing, meetup
---

# Orbitant Newsletter — Skill de preparación mensual

## Qué hace esta skill

Genera el borrador completo de la newsletter mensual de Orbitant a partir de los materiales del mes. El output es un documento Markdown estructurado por secciones, listo para maquetar en MailerLite, con el copy de cada bloque ya redactado en inglés.

---

## Audiencia y tono

- **Idioma**: Inglés exclusivamente. Nunca español en el cuerpo de la newsletter.
- **Audiencia**: Desarrolladores senior, CTOs, ingenieros y profesionales tech del ecosistema de Orbitant (clientes, comunidad, asistentes a KS y meetups).
- **Tono**: Directo, técnico pero accesible, sin hype. El mismo que el blog y LinkedIn: práctico, honesto, cercano. Nunca "vendehumos". Orbitant aparece contextualmente, nunca de forma promocional explícita.
- **Estilo**: Frases cortas. Negritas para enfatizar conceptos clave dentro del copy de las secciones. Sin em dashes. Sin bullet points en el copy de las secciones narrativas (sí se usan en listas de recursos y "What you'll get").

---

## Prerequisites

- **Slack MCP server** — Required for autonomous link curation. The skill uses `slack_search_public_and_private` and `slack_read_thread` tools. Without it, the user must provide Slack links manually.
- **Access to orbitant.com/en/insights/** — For fetching latest blog posts (section 6).

---

## Flujo de trabajo al arrancar

Cuando Alma diga algo como "prepara la newsletter de [mes]", la skill sigue este orden:

### Paso 1 — Obtener los enlaces de Slack de forma autónoma

Claude busca directamente en Slack, sin necesidad de que Alma prepare nada en Notion. Los canales a monitorizar son:

- `#knowledge-sharing`
- `#ai-coding`
- `#ai-stuff`
- `#open-source`
- `#cybersecurity-for-hackers`

**Fecha de corte**: Claude busca mensajes publicados desde el día siguiente al envío de la newsletter anterior hasta la fecha actual. Alma indica la fecha de envío de la edición anterior si Claude no la conoce.

**Proceso de búsqueda:**
1. Usar `slack_search_public_and_private` con filtro `after:[fecha]` y `has:link` en cada canal.
2. Para cada mensaje que haya generado un hilo, leer el thread completo con `slack_read_thread` para entender el debate real antes de decidir si incluirlo.
3. Filtrar: quedarse con los mensajes que tienen hilo con debate real, los que tienen comentario editorial del que comparte, y los técnicamente más relevantes.
4. Excluir: duplicados con el mes anterior, links de entretenimiento sin fondo técnico, eventos locales sin interés general, mensajes sin URL externa enlazable. Los debates internos sin URL externa no van como item de lista.
5. Agrupar por temática en 3-5 categorías. No forzar más de 5.
6. Redactar cada item en inglés en una sola línea, incorporando el matiz o la opinión del equipo si la hay, sin atribuir directamente al nombre de la persona.

**Limitación conocida**: La búsqueda por API de Slack no garantiza capturar el 100% de los mensajes en canales de mucho volumen. Alma puede añadir manualmente cualquier enlace que quiera incluir y que Claude no haya recogido.

### Paso 2 — Pedir a Alma los inputs que no se pueden obtener de forma autónoma

Claude solicita de una sola vez, al inicio, solo lo que no puede obtener solo:

1. **KS pasada — URL del vídeo en YouTube**
2. **KS pasada — descripción del vídeo** (copiar y pegar desde YouTube, versión ES o EN). YouTube está bloqueado. El transcript completo también es válido.
3. **KS pasada — recursos mencionados** (slides, repos, artículos), si no están en la descripción del vídeo.
4. **KS próxima — datos completos**: título, ponente (nombre + cargo + URL de LinkedIn), fecha, idioma (español/inglés).
5. **Post destacado del mes**: URL del post featured.
6. **Meetup**: ¿hay fotos disponibles para el carrusel? (sí/no/pendiente) + datos del próximo meetup si están confirmados (fecha, ponente).

### Paso 3 — Generar el borrador completo

Con los inputs de Alma y los enlaces de Slack ya curados, Claude redacta el borrador completo siguiendo la estructura de secciones descrita a continuación.

---

## Estructura fija de la newsletter

### 1. ASUNTO Y PREHEADER

Dos campos distintos en MailerLite. Siempre indicarlos separados y etiquetados.

- **Asunto**: Corto. Puede ser el titular de la KS pasada, una pregunta o una tensión del mes.
- **Preheader**: Complementa el asunto sin repetirlo. Sin verbo inicial. Foco en el contenido o en el hook de otro bloque (puede hacer referencia a la próxima KS). Máximo una frase corta.

Ejemplos reales:
- Asunto: *"Who reviews the AI's code?"* / Preheader: *"Scale or go extinct. Up next in our KS."*
- Asunto: *"AI speed without structure is a liability"* / Preheader: *"Juan Macías on spec-driven development with Claude Code."*

### 2. PAST KS — Recap de la Knowledge Sharing del mes

- **Titular H1**: Evocador, no descriptivo. Captura la tensión o el problema que resuelve la sesión. Puede ser una cita directa del ponente entre comillas con atribución. Ejemplos reales: *"npm publishing isn't what it used to be"*, *"What happens when no one knows if it is working"*, *"AI speed without structure is a liability" —Juan Macías*.
- **Párrafo intro**: 2-3 frases. Ponente con nombre + cargo linkado a LinkedIn. Enfoque concreto de la charla. Termina con: *"If you couldn't attend, we've published the full session on [our YouTube channel](URL). You can watch it here 👇"*
- **Thumbnail**: Placeholder `[VIDEO THUMBNAIL — nombre del ponente, cargo]`
- **"💡 In this session you'll discover:"**: Lista de 4-7 puntos. Concepto en negrita + descripción breve.
- **"⚒️ Resources from the session:"**: Lista de enlaces con anchor text descriptivo.
- **Blockquote**: *"Next launch: our new public Knowledge Sharing will be on **[día, fecha]**"*

### 3. NEXT KS — Anuncio de la próxima Knowledge Sharing

- **Titular H2**: Título oficial de la sesión.
- **Párrafo intro**: 2-3 frases. Ponente con nombre linkado + cargo. Qué abordará la sesión, generando curiosidad sin spoilear.
- **Datos**:
  ```
  📅 [fecha]
  🕔 17:00 CET/CEST (según época del año)
  🇪🇸 Session held in Spanish / 🇬🇧 Session held in English
  💻 Online and free
  ```
- **CTA**: `[Register now]` (el link lo añade Alma en MailerLite)

### 4. FEATURED BLOG POST

- **Titular H2**: Título real del post.
- **Imagen**: Placeholder `[FEATURED IMAGE]`
- **Byline**: *"By [nombre linkado a LinkedIn], cargo"* — solo si es autor individual. Omitir en posts corporativos.
- **Extracto**: Las primeras 2-3 frases del post tal como aparecen en el blog + `[Read more](URL)`. Usar el texto real, no parafrasear.

### 5. WHAT WE'RE TALKING ABOUT IN SLACK

- Máximo 12-15 items en total, agrupados en 3-5 categorías temáticas.
- Cada item: `[Anchor text descriptivo](URL)` — descripción de **una sola línea**. Nunca párrafos.
- Todo item debe tener URL externa pública. Sin enlace, no va.
- No repetir enlaces que aparecieron en la edición anterior.
- Categorías habituales: *AI-Powered Development*, *Security & Open Source*, *Architecture & Engineering*, *Worth the Read*, *Tools & Resources*. Se adaptan al mes.

### 6. LATEST FROM OUR BLOG

Posts del mes distintos al featured. Se obtienen del feed del blog: no hace falta que Alma los liste.

Por post: título en negrita + placeholder `[POST IMAGE]` + extracto de apertura + `[Read more](URL)`.

### 7. COMMUNITY — Node.js Madrid Meetup

Incluir siempre que haya habido un meetup ese mes o haya uno próximo confirmado.

- **Titular H2**: Evocador del contenido de la sesión. Cambia cada mes. Nunca reutilizar el mismo título de ediciones anteriores ni usar fórmulas genéricas. Ejemplo real: *"Node.js Madrid: Growth doesn't stop at Senior"*.
- **Fotos**: Placeholder `[MEETUP PHOTOS CAROUSEL]` si hay fotos disponibles.
- **Párrafo**: Recap del evento pasado (ponente, tema, ambiente). Si hay próximo meetup confirmado: datos y CTA `[Join the meetup]`.

### 8. CIERRE

Formato fijo e invariable:

> That's our **[Mes]** snapshot. See you next month with fresh ideas and sharper insights.

---

## Reglas de escritura

- Sin em dashes (—). Usar coma, punto y coma o punto.
- Negritas para conceptos clave, no para decorar.
- Sin exclamaciones salvo en celebración de hito concreto.
- Sin frases de relleno: "It's no secret that...", "In today's world...", "We're excited to...", etc.
- Orbitant aparece contextualmente. Nunca autopromoción explícita.
- Ponentes: nombre linkado a LinkedIn + cargo. Nunca abrir el segundo párrafo con el nombre del ponente.
- CTA buttons: texto corto y directo. "Register now", "Read more", "Join the meetup".

---

## Output esperado

Documento Markdown con todas las secciones en orden. Incluir:
- Asunto y preheader al inicio, claramente separados y etiquetados.
- Todo el copy redactado.
- Placeholders claramente marcados para imágenes, thumbnails y carruseles.
- URLs de todos los enlaces.
- Notas `[NOTA: ...]` donde Alma deba completar algo.

---

## Referencia de ediciones anteriores

Ediciones publicadas: diciembre 2025, enero 2026, febrero 2026, marzo 2026.

Patrones clave:
- El titular de la KS pasada reformula el problema o es una cita del ponente. Nunca el título literal de la sesión.
- El bloque "Next launch" es un blockquote visual con tipografía en cursiva y negrita.
- La sección Slack tiene entre 10 y 15 items, agrupados en 4-5 categorías. Cada item: una línea.
- El cierre "[Mes] snapshot" es invariable.
- Las fotos del meetup van en carrusel.
- El titular de la sección meetup cambia cada mes y refleja el contenido de la sesión.
- Los datos de la KS próxima incluyen siempre: fecha, hora, idioma y "💻 Online and free".
- La newsletter se envía el miércoles siguiente a la KS, a las 8:45h CET. La programación la hace Alma en MailerLite.
