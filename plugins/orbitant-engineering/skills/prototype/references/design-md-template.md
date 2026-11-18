# Design — <product name>

<!--
  Template for a product repository's `design/DESIGN.md`, kept by its
  designers. Prototypes (the design ping-pong in a thread) and development agents
  read it. Short and concrete beats complete: a copyable snippet is worth more
  than a paragraph describing it. Delete any section that does not apply.
  If the repository already has a Tailwind config or token files, point to
  them instead of repeating their values.
-->

## Product and users

<!-- Who uses it, on which device most of the time, and the one task that matters most. -->

## Principles

<!-- Three to five lines that are this product's own (e.g. "high density: expert users who scan, not read"). -->

## Tokens

| Token | Tailwind | Use |
|---|---|---|
| primary | `bg-[#0f766e]` / `text-[#0f766e]` | main action, links |
| surface | `bg-white` | cards, tables |
| background | `bg-slate-50` | page |
| text | `text-slate-900` | body |
| muted | `text-slate-600` | secondary text |
| danger | `text-red-700` | errors |
| radius | `rounded-md` | everything |
| font | `font-sans` (Inter) | everything |

<!-- Source of truth, if any: `tailwind.config.ts`, `src/styles/tokens.css`, … Replace the example values above with the product's. -->

## Components

### Primary button

```html
<button class="min-h-11 rounded-md bg-[#0f766e] px-4 py-2 font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:ring-offset-2">
  Guardar
</button>
```

### Text input

```html
<label for="name" class="block text-sm font-medium">Nombre</label>
<input id="name" class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0f766e]" />
```

<!-- One heading and one copyable snippet per component the product uses: table, badge, empty state, dialog, … The two above are examples: replace them with the product's own. -->

## Patterns

<!-- How this product does lists, forms, errors, loading and confirmations: one short paragraph or snippet each. -->

## Microcopy

<!-- Tú or usted, tone, words the product uses for its things (and words it avoids). -->
