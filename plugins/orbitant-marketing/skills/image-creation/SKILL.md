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

### Dependencies

- **Node.js 18+**
- **`@google/genai`** and **`sharp`** packages:

```bash
npm install @google/genai sharp
```

### Google API Key

You need a `GOOGLE_API_KEY` to call the Imagen API. There are two ways to get one:

| Option | How | Cost |
|--------|-----|------|
| **Google AI Studio** | Go to <https://aistudio.google.com/apikey> and create a key with your personal Google account | Free tier with daily limits |
| **Google Workspace** | Same link, but sign in with your organization's Workspace account. Many Workspace plans include Gemini/Imagen API access with generous quotas (check your admin console under **Apps → Additional Google services → Google AI Studio**) | Included in Workspace plans that have Gemini enabled |

> **Tip:** If your organization uses Google Workspace with Gemini enabled, you likely already have API access at no extra cost — ask your Workspace admin if unsure.

### Setting the API Key

Pick **one** of the following methods:

**Option A — `.env` file (recommended, stays local and git-ignored):**

Create `plugins/orbitant-marketing/skills/image-creation/scripts/.env`:

```env
GOOGLE_API_KEY=your-key-here
```

**Option B — Environment variable (current shell session only):**

```bash
export GOOGLE_API_KEY="your-key-here"
```

**Option C — Shell profile (persistent across sessions):**

Add to your `~/.bashrc`, `~/.zshrc`, or equivalent:

```bash
export GOOGLE_API_KEY="your-key-here"
```

> **Note:** The `.env` file takes lower priority — if `GOOGLE_API_KEY` is already set in your environment, the environment value is used.

### Quick Verification

Run a single test image to confirm everything works:

```bash
node plugins/orbitant-marketing/skills/image-creation/scripts/generate-image.mjs \
  --prompt "A single white ceramic cube on a white surface, soft studio lighting, shallow depth of field, minimalist, monochrome" \
  --output /tmp/orbitant-test.png \
  --count 1
```

If the API key is not set, the skill will craft the prompt and show it to the user so they can use it manually in AI Studio or another tool.

> **Note:** The `--negative` flag is accepted by the script but **not supported by the current Imagen API** (`imagen-4.0-generate-001`). Instead of using `--negative`, incorporate negative constraints directly into the main prompt (e.g., "No red, orange, or yellow fire. No text, no words, no logos.").

### Reference Images Setup

Before crafting prompts, check if `assets/reference/` contains images. These are real blog thumbnails from orbitant.com that show the target visual style by example.

If the folder is **empty or missing**, ask the user to run:

```bash
node scripts/scrape-insights-images.mjs
```

This downloads a curated set of ~26 reference images. It is safe to re-run — existing files are skipped. Use `--force` to re-download everything.

Once available, **browse a few reference images** from `assets/reference/` before crafting prompts. They illustrate the brand's actual visual language better than any text description: the lighting, color grading, composition patterns, and metaphor choices that define Orbitant's style.

---

## Available Scripts

- **`scripts/generate-image.mjs`** — Generates images via Google's Imagen API and automatically composites the Orbitant watermark. Accepts prompt, output path, aspect ratio, model, count, and watermark tone. Returns JSON with file paths on success.
- **`scripts/scrape-insights-images.mjs`** — Downloads curated reference images from orbitant.com into `assets/reference/`. Skips existing files. Use `--force` to re-download.

Run `node scripts/generate-image.mjs --help` or `node scripts/scrape-insights-images.mjs --help` for full usage.

## Available Assets

- **`assets/watermark-white.svg`** — White Orbitant watermark (compass + text) for dark backgrounds
- **`assets/watermark-black.svg`** — Black Orbitant watermark for light backgrounds

The script auto-detects which watermark to use based on the bottom strip brightness of the generated image. Override with `--watermark white|black|none`.

---

## Workflow

### Step 0 — Load Visual References

1. Read `references/visual-identity.md` for the brand rules.
2. Read `references/presets.md`. If the user's request names a preset (e.g. "el planeta Orbitant") or one of its aliases, that element is pre-defined — you will inject its fragment verbatim in Step 4 and skip metaphor-hunting for it (see Step 2).
3. Check if `assets/reference/` contains images. If empty, ask the user to run `node scripts/scrape-insights-images.mjs` and wait before continuing.
4. Browse 3–5 reference images from `assets/reference/` to calibrate your sense of the brand's visual style.

### Step 1 — Choose the Category

Based on the article topic, decide between:
- **Category A — Conceptual Metaphor** (default, ~70% of images): AI-generated scenes using a physical metaphor
- **Category B — Real Photography** (~30%): Team photos for culture/event articles — cannot be generated, tell the user to pick from their photo library

### Step 2 — Find the Metaphor (Category A only)

> **Preset shortcut:** if the request matched a named preset in `references/presets.md`, that preset *is* the subject — skip metaphor-hunting and go straight to Step 4 using its fragment verbatim.

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
2. The **prompt** used (also saved as `.prompt.json` next to the images for reuse)
3. The **generated image(s)** — read the output file(s) so the user can see them
4. Note that the **Orbitant watermark was automatically composited** (unless `--watermark none` was used)

The `.prompt.json` file stores the full prompt, model, aspect ratio, and generation timestamp so the user can reproduce or tweak the image later without the skill.

---

## Orbitant Visual Identity Rules

> Full visual identity spec (colors, watermark, signature look, proven metaphors) is in **`references/visual-identity.md`**. Read it before crafting prompts.

Key points:
- **Color palette**: Monochrome-dominant, teal (#00BFA5) accent only, avoid saturated/warm tones
- **Watermark**: Composited automatically — never include text/logos in the prompt, always leave clean bottom-center space
- **Signature look**: Shallow DoF, minimalist, studio-lit, desaturated premium aesthetic
- **Format**: 16:9 landscape, 1440x810, PNG from API

---

## Named Presets

Recurring visual elements (like the Orbitant planet) are defined as **text presets** in **`references/presets.md`**. When a request names a preset or one of its aliases, inject its prompt fragment **verbatim** instead of inventing a new description — this keeps the element consistent across images.

Text presets give a *consistent, on-brand* element, **not a pixel-identical copy** (sufficient for thumbnails). Read `references/presets.md` for the current list, how to use a preset, and how to add new ones.

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
