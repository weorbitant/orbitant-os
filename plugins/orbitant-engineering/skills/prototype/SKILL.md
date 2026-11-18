---
name: orbitant-prototype
description: |
  Turns a feature idea into a single-file HTML prototype people review and iterate on in a
  conversation: plain HTML and Tailwind, mobile first, accessible, with the design's acceptance
  scenarios runnable in the TWD sidebar and DEV comments for whoever builds it. Use for any request
  to see, mock up, sketch, prototype or change how a screen or feature would look or behave
  ("¿cómo se vería?", "hazme un prototipo", "y en móvil?", "otra versión con menos columnas"),
  even when nobody says "prototype".
version: "0.1.0"
license: MIT
metadata:
  author: orbitant
  tags: engineering, design, prototype, html, tailwind, accessibility, mobile-first, twd
---

# Prototype

A prototype is a **question asked visually**: "is this what you mean?". It exists to be looked at, clicked and answered in the thread, quickly, many times. It is never production code: a development agent will rebuild it properly, reading what you wrote.

## Principles, in priority order

1. **UX before visuals.** First decide what the person has to do and the shortest path to doing it: what they see first, what they act on, what happens when there is nothing, too much, or an error. Make that obvious. Polish comes last and only if it helps understanding.
2. **Mobile first.** Design for a 375px screen, then let it grow with `sm:`/`md:`/`lg:`. If the desktop and mobile layouts differ in kind (a table becomes cards), show both in the same file with responsive classes rather than two divergent designs.
3. **Accessible by default.** Semantic elements (`button`, `nav`, `main`, `table` with `caption` and `th scope`), a `label` for every input, visible focus (`focus:ring-2`), text contrast of at least 4.5:1, touch targets of at least 44px, `aria-live` where content changes without a page load, `lang` on `<html>`. Never convey meaning by colour alone.
4. **Simple.** The fewest elements, columns, colours and states that answer the question. One screen per file. When in doubt, take something out and ask.
5. **The product's design system, when there is one.** It lives in the product's repository, in `design/DESIGN.md`, maintained by its designers (the shape is `references/design-md-template.md`). Follow its tokens, components, patterns and microcopy with Tailwind utilities (arbitrary values like `bg-[#0f766e]` are fine); where it points to the repository's own Tailwind config or tokens, read those too. Without one, use Tailwind's defaults with a neutral palette and one accent.

## Before drawing

- **Know which product it is for.** The thread, the issue or a standing instruction usually says which repository. If nothing does, ask which product before drawing.
- **Read that repository's `design/DESIGN.md`**. If it does not exist, or you cannot read the repository, say so in one line and draw with the defaults; offer `references/design-md-template.md` as a starting point for its designers.

## The file

Start from `references/template.html`. It is the shape every prototype has:

- **One self-contained `.html`**: Tailwind from its CDN, plain JavaScript in the page, data hardcoded. No build, no framework, no external images (use initials, emoji or simple shapes).
- **A header comment** saying what the prototype is for and that it is not production code.
- **`DEV:` comments** wherever a development agent needs to know something the markup does not say: where the data comes from and its fields, what a control does in the real app, a state that is faked, a breakpoint decision. Short and factual. They are the handoff, so write them for someone who was not in the thread.
- **The TWD scenarios at the bottom**: each `it` is one acceptance criterion of the design, written as the user would do it (type, click, read) and named in the thread's language ("filtra por nombre", "avisa cuando no hay resultados"). Cover the main path, the empty state and any state the thread discussed. Keep the `initTWD` options as the template has them: `serviceWorker: false` (nothing to mock, and a file opened on its own has no origin to register one on) and `pace: true` (the sidebar's speed selector), with the line before `initTWD` that starts it at the slowest pace so people can watch each scenario. How to write them (queries, actions, assertions, resetting state between scenarios) is in `references/twd-scenarios.md`: read it before writing the first scenario.

Code quality, performance and file size do not matter beyond staying readable. Visual quality, accessibility and clarity do.

## The ping-pong

- Share the file and say in one or two sentences what you decided and what you are unsure about. Ask at most one question.
- When the thread asks for a variant ("¿y en móvil?", "otra con menos columnas"), share a new file with a name that says what it is (`mobile.html`, `menos-columnas.html`) and keep what was already agreed.
- When someone gives feedback, change only what they asked about and say what changed.
- If the request is too vague to draw anything useful, ask what the person needs to do on the screen before drawing.
