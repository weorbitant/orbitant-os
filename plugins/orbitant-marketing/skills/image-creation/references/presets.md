# Named Image Presets

Reusable, pre-defined visual elements for Orbitant images. When a user's request
names a preset (or one of its aliases), inject that preset's **prompt fragment
verbatim** into the image prompt instead of inventing a new description. This keeps
recurring elements — like the Orbitant planet — visually consistent across images.

> **What this gives you:** these are **text presets**. They produce a *consistent,
> on-brand* version of the element — same colors, forms, and lighting — **not a
> pixel-identical copy**. Each generation reinterprets the description, so the element
> stays recognizable but is not literally the same object down to the detail. That is
> intentional and sufficient for blog thumbnails. For a truly identical recurring
> subject you would need reference-image conditioning (a different model, e.g. Gemini
> "nano banana"), which is out of scope for this text-only version.

## How to use a preset

1. **Before Step 2 (Find the Metaphor)**, scan the request for any preset name or alias below.
2. If matched, that element is **already defined** — skip metaphor-hunting for it and
   drop the preset's fragment straight into the Step 4 prompt template.
3. You may add scene, lighting, or composition context around it, but do **not** rewrite
   the fragment's core attributes (colors, forms, counts). Those exact attributes are
   what keep the element consistent between runs.

## How to add a preset

Copy the block format below, give it a unique `name`, list natural-language `aliases`,
and write a **specific, deterministic** fragment: exact colors (with hex), exact counts,
exact lighting direction, exact style words. Vague fragments drift between runs; precise
ones stay consistent.

---

## orbitant-planet

**Aliases:** "el planeta Orbitant", "planeta Orbitant", "the Orbitant planet",
"Orbitant planet", "nuestro planeta"

**Background:** Dark (space) — always.

**Prompt fragment (inject verbatim):**

```
a large deep navy-blue planet, smooth matte desaturated surface, wrapped by a faint
teal (#00BFA5) atmospheric glow along its right rim, a single thin edge-lit ring
tilted slightly off-horizontal, one small pale moon in the upper-right distance, lit
by dramatic directional rim light from the upper-left against deep black space, shallow
depth of field with a few soft-bokeh background stars
```

**Notes:** Teal (#00BFA5) is the only accent — keep everything else monochrome/navy.
No text, no logos. Leave clean empty space at bottom-center for the watermark.

---

## orbitant-astronaut

**Aliases:** "el astronauta Orbitant", "astronauta Orbitant", "the Orbitant astronaut",
"Orbitant astronaut", "nuestro astronauta", "astronauta"

**Background:** Light or dark, per the article topic (default dark for a space feel).

**Prompt fragment (inject verbatim):**

```
a lone astronaut in a clean matte white spacesuit, helmet with a fully opaque dark
visor that shows no face and no facial features, the visor reflecting only a faint
teal (#00BFA5) glow, subtle greyscale equipment detailing on the suit, single centered
figure, soft directional studio lighting from the upper-left, desaturated premium
finish, shallow depth of field with gentle background bokeh
```

**Notes:** The dark visor must be **fully opaque** — never render a visible face, eyes,
or facial features inside the helmet (no identifiable person). Teal (#00BFA5) is the
only accent; keep the suit and scene monochrome. No text, no logos. Leave clean empty
space at bottom-center for the watermark.
