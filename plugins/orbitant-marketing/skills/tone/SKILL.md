---
name: orbitant-tone
description: |
  Voice and tone reference for Orbitant blog content. Used by both the content generation
  agent and human editors and contributors. Defines what Orbitant writing sounds like,
  what it values, and what it avoids — with concrete examples.
license: MIT
version: "1.0.0"
metadata:
  author: orbitant
  tags: marketing, blog, tone, voice, editorial
---

# Orbitant Tone of Voice

This document defines how Orbitant writes. It is a reference for anyone creating or reviewing blog content — whether you are a human contributor or the content generation agent.

Orbitant's writing reflects how the team actually thinks and works: with technical rigour, intellectual honesty, and a clear connection to real-world impact. We do not write to impress. We write to be useful.

---

## Core principles

### 1. First person, always
Write from your own experience. Use "I" when sharing something you lived, decided, or learned. Use "we" when speaking as Orbitant. Never write in the third person about your own work or decisions — it creates distance and makes the content feel generic.

> ✅ **Así sí**
> Cuando empezamos a migrar el sistema de autenticación, lo primero que hicimos fue mapear todos los puntos de entrada. No porque lo diga ninguna guía, sino porque habíamos quemado semanas en una migración anterior por saltarnos ese paso.

> ❌ **Así no**
> Las empresas que afrontan migraciones de sistemas de autenticación deben considerar mapear todos los puntos de entrada como primer paso del proceso.

---

### 2. Real examples over abstract theory
Every claim should be grounded in something concrete: a project, a decision, a failure, a result. If you cannot think of a real example, that is a signal that the section needs more thought — not more words.

Theory is only useful when it explains a real situation. Lead with the example, then explain the principle behind it.

> ✅ **Así sí**
> Teníamos un pipeline que tardaba 22 minutos en completarse. Después de perfilar cada paso, encontramos que el 60% del tiempo lo consumía un único test de integración que se conectaba a una base de datos real. Lo reemplazamos por un mock y bajamos a 8 minutos.

> ❌ **Así no**
> Optimizar los tiempos de ejecución de los pipelines de CI/CD es fundamental para mejorar la productividad de los equipos de desarrollo y reducir el time-to-market.

---

### 3. Explain the why behind technical decisions
Do not just describe what you did. Explain why you chose that approach over the alternatives, what you ruled out and why, and what trade-offs you accepted. This is what makes technical content genuinely useful — and what distinguishes Orbitant's voice from generic documentation.

> ✅ **Así sí**
> Elegimos SQLite para el almacenamiento local por tres razones: no necesitábamos un servidor separado, el volumen de datos era predecible y pequeño, y queríamos que cualquier desarrollador pudiera levantar el proyecto sin configuración adicional. Valoramos PostgreSQL, pero añadía complejidad operativa que no estábamos dispuestos a asumir en ese contexto.

> ❌ **Así no**
> Para el almacenamiento local se utilizó SQLite, una solución ligera y eficiente ampliamente utilizada en el sector.

---

### 4. Practical over theoretical
Prioritise content that the reader can apply. Code snippets, configuration examples, screen recordings, annotated screenshots — these are worth more than three paragraphs of explanation. When you can show something, show it.

The ideal structure for a technical section is:
1. State the problem or decision
2. Show the solution (code, screenshot, clip)
3. Explain what matters and why

> ✅ **Así sí**
> Para evitar que las variables de entorno se filtren en los logs, añadimos un middleware de sanitización antes del logger:
>
> ```typescript
> app.use(sanitizeEnvMiddleware());
> app.use(logger());
> ```
>
> El orden importa: si inviertes las dos líneas, el logger captura los datos antes de que se saniticen.

> ❌ **Así no**
> Es importante gestionar correctamente las variables de entorno para garantizar la seguridad de las aplicaciones. Existen diversas estrategias para evitar que información sensible quede expuesta en los registros del sistema.

---

### 5. Honest about trade-offs and mistakes
Good technical writing acknowledges what did not work, what could be better, and what limitations exist. Readers trust content more when it is honest about complexity. Do not oversell solutions. Do not hide the hard parts.

> ✅ **Así sí**
> Este enfoque funciona bien cuando el equipo es pequeño y los dominios están bien delimitados. Si tienes más de cuatro o cinco equipos trabajando en paralelo, empieza a aparecer fricción en los límites — y probablemente necesites una estrategia de ownership más explícita.

> ❌ **Así no**
> Esta solución es escalable y puede adaptarse a equipos de cualquier tamaño, garantizando la eficiencia operativa en todo momento.

---

## What Orbitant writing is not

- **Not a brochure**: We do not write to sell Orbitant. We write to share what we know. If the content is genuinely useful, it speaks for itself.
- **Not neutral**: We have opinions. We explain why we prefer certain approaches, tools, or patterns. We do not hedge every sentence to avoid taking a position.
- **Not formal**: We do not use "usted", corporate passive voice, or expressions like "cabe destacar que", "en el contexto actual", "es de vital importancia". We write like we talk — clearly and directly.
- **Not theoretical**: We do not write about how things should work in an ideal world. We write about how they work in practice, with real constraints and real consequences.

---

## On mentioning Orbitant

Orbitant can and should appear in blog content — but as context, not as the subject. The subject is always the technical problem, the decision, or the learning.

> ✅ **Así sí**
> En Orbitant llevamos varios proyectos usando esta arquitectura en producción, y el patrón que mejor nos ha funcionado es...

> ❌ **Así no**
> En Orbitant, empresa líder en consultoría de software de nueva generación, hemos desarrollado una metodología propia que...

---

## Asset guidelines

Technical assets are a priority, not an optional extra. When writing about a process, a configuration, or a result, always consider whether a visual or code example would communicate it better than prose.

| Situation | Preferred asset |
|---|---|
| Setup or configuration steps | Code snippet |
| UI workflow or interaction | Annotated screenshot or short screen clip |
| Before/after comparison | Side-by-side code blocks |
| System output or result | Screenshot or code output block |
| Process with multiple steps | Numbered list + clip if the steps involve UI |
| Architecture, flows, or system relationships | Excalidraw diagram |
| Decision trees or comparisons between approaches | Excalidraw diagram |

Orbitant accounts have Excalidraw connected to Claude, which makes it straightforward to generate and iterate on diagrams directly. Prefer Excalidraw over static images for anything that represents a system, a flow, or a relationship between components — diagrams created this way are editable and can be updated as the content evolves.

If you cannot include the asset at the time of writing, leave a note in the draft using the following format so it can be added later:

```markdown
> [!NOTE FOR AUTHOR]
> Descripción del asset que falta aquí y por qué aporta valor.
> Tipo de asset sugerido: código | captura | clip | diagrama Excalidraw
```
