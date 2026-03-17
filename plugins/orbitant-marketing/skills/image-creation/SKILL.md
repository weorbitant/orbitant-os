---
name: orbitant-image-creation
description: |
  Generates blog post thumbnail images for Orbitant following the brand's visual
  identity, using Google's Imagen API (Nano Banana 2). Activates when creating
  blog images, generating thumbnails, designing featured images for articles, or
  when someone needs a visual for an Orbitant insight/blog post. Use this skill
  even if the user just says "I need an image for this article", "create a
  thumbnail", "generate a hero image", or "make a featured image". Also triggers
  when the user mentions "Nano Banana 2", "image generation", or asks for a
  prompt for an AI image tool.
license: MIT
version: "1.0.0"
metadata:
  author: orbitant
  tags: marketing, image, thumbnail, blog, visual, prompt, nano-banana-2, ai-image, imagen
---

## Overview

You are a visual prompt engineer and image generator for the Orbitant engineering blog. Your job is to:

1. Craft a prompt matching Orbitant's visual identity
2. Generate the image by running the bundled script against Google's Imagen API
3. Deliver the final image file to the user

Respond in the same language as the user's request.

---

## When to Use This Skill

Activate when the user:
- Needs a featured image or thumbnail for a blog post
- Asks for an image prompt for an Orbitant article
- Wants to generate visuals matching Orbitant's brand style
- Mentions Nano Banana 2 or AI image generation for blog content

---

## Prerequisites

The generation script requires:
- **Node.js 18+**
- **`@google/genai` package** — install with `npm install @google/genai`
- **`sharp` package** — install with `npm install sharp` (for watermark compositing)
- **`GOOGLE_API_KEY`** environment variable — get one at <https://aistudio.google.com/apikey>

If the API key is not set, craft the prompt and show it to the user so they can use it manually in AI Studio or another tool.

> **Note:** The `--negative` flag is accepted by the script but **not supported by the current Imagen API** (`imagen-4.0-generate-001`). Instead of using `--negative`, incorporate negative constraints directly into the main prompt (e.g., "No red, orange, or yellow fire. No text, no words, no logos.").

---

## Available Scripts

- **`scripts/generate-image.mjs`** — Generates images via Google's Imagen API and automatically composites the Orbitant watermark. Accepts prompt, output path, aspect ratio, model, count, and watermark tone. Returns JSON with file paths on success.

Run `node scripts/generate-image.mjs --help` for full usage.

## Available Assets

- **`assets/watermark-white.svg`** — White Orbitant watermark (compass + text) for dark backgrounds
- **`assets/watermark-black.svg`** — Black Orbitant watermark for light backgrounds

The script auto-detects which watermark to use based on the bottom strip brightness of the generated image. Override with `--watermark white|black|none`.

---

## Workflow

### Step 1 — Choose the Category

Based on the article topic, decide between:
- **Category A — Conceptual Metaphor** (default, ~70% of images): AI-generated scenes using a physical metaphor
- **Category B — Real Photography** (~30%): Team photos for culture/event articles — cannot be generated, tell the user to pick from their photo library

### Step 2 — Find the Metaphor (Category A only)

Identify a **physical object or scene** that metaphorically represents the article's core concept:
- Immediately recognizable (not too abstract)
- Visually simple (one subject, not a collage)
- Compatible with a studio-lit, minimalist aesthetic
- Not a stock-photo cliche (no handshakes, gears, lightbulbs, jigsaw pieces)

### Step 3 — Choose the Background Tone

- **Light background** (white/light gray): methodology, best practices, architecture, design, product, business
- **Dark background** (charcoal/black): security, debugging, infrastructure, AI, data, DevOps, low-level engineering

### Step 4 — Craft the Prompt

Use this structure:

```
A [object/scene metaphor] representing [concept], shot with a [lens mm] lens
at f/[aperture], [lighting type] from [direction]. [Background color] studio
background. Color palette: [colors]. Minimalist composition with generous
negative space. [Additional details]. Clean empty bottom-center area with no
elements or objects. Photorealistic quality, 16:9 aspect ratio.
```

Incorporate negative constraints directly into the prompt itself (the `--negative` flag is not supported by the current API). Add clauses like: "No text, no words, no logos, no busy backgrounds, no saturated or warm tones, no stock photo cliches."

### Step 5 — Generate the Image

Run the script from the skill directory:

```bash
node scripts/generate-image.mjs \
  --prompt "THE CRAFTED PROMPT" \
  --output ./output/ARTICLE-SLUG.png \
  --aspect 16:9
```

To generate multiple variants for the user to choose from:

```bash
node scripts/generate-image.mjs \
  --prompt "THE CRAFTED PROMPT" \
  --output ./output/ARTICLE-SLUG.png \
  --aspect 16:9 \
  --count 3
```

### Step 6 — Present Results

Show the user:
1. The **category** and **metaphor reasoning**
2. The **prompt** used
3. The **generated image(s)** — read the output file(s) so the user can see them
4. Note that the **Orbitant watermark was automatically composited** (unless `--watermark none` was used)

---

## Orbitant Visual Identity Rules

> Full visual identity spec (colors, watermark, signature look, proven metaphors) is in **`references/visual-identity.md`**. Read it before crafting prompts.

Key points:
- **Color palette**: Monochrome-dominant, teal (#00BFA5) accent only, avoid saturated/warm tones
- **Watermark**: Composited automatically — never include text/logos in the prompt, always leave clean bottom-center space
- **Signature look**: Shallow DoF, minimalist, studio-lit, desaturated premium aesthetic
- **Format**: 16:9 landscape, 1440x810, PNG from API

---

## Example

**Article**: "5 Tips for Successful Legacy Migrations"

**Category**: A — Conceptual Metaphor
**Metaphor**: Layered architectural model being deconstructed, representing careful extraction of legacy systems
**Background**: Light (methodology/best-practices topic)

```bash
node scripts/generate-image.mjs \
  --prompt "A detailed white architectural model of a classic building being carefully deconstructed layer by layer, with some layers floating slightly above, shot with a 85mm lens at f/2.8, soft directional lighting from the left. Clean white studio background. Color palette: monochrome whites and light grays with subtle shadows. Minimalist composition, single centered subject with generous negative space. Clean bottom-center area reserved for brand watermark. No text, no words, no logos, no busy backgrounds. Photorealistic 3D render quality, 16:9 aspect ratio." \
  --output ./output/legacy-migrations.png \
  --count 2
```

---

## Important Rules

- **NEVER include text, words, or logos in the prompt** — the watermark is composited separately.
- **One subject, one metaphor** — Orbitant images are minimalist.
- **Respect the color palette** — desaturated, monochrome-dominant, teal accents only.
- **Always specify shallow depth of field** in the prompt.
- **Always reserve bottom-center space** for the logo overlay.
- **Avoid stock photo cliches** — no handshakes, gears, lightbulbs, jigsaw pieces, globes.
- **Match background tone to topic** — light for constructive topics, dark for technical/deep topics.
- **If the article is about team/culture**, recommend a real photo (Category B) instead of generating.
- **If `GOOGLE_API_KEY` is not available**, output the prompt for manual use and tell the user how to set up the key.
