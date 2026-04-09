# Image Creation Skill

Generates blog post thumbnails for the Orbitant engineering blog using Google's Imagen API, following the brand's visual identity system.

## Quick Start

```bash
# 1. Install dependencies (from repo root)
npm install @google/genai sharp

# 2. Set your API key
export GOOGLE_API_KEY="your-key-here"
# Or create plugins/orbitant-marketing/skills/image-creation/scripts/.env:
# GOOGLE_API_KEY=your-key-here

# 3. Generate an image
node plugins/orbitant-marketing/skills/image-creation/scripts/generate-image.mjs \
  --prompt "Your prompt here" \
  --output ./output/my-image.png \
  --aspect 16:9 \
  --count 3
```

Or just ask Claude: _"Generate a blog image about microservices"_ — the skill activates automatically.

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `--prompt` | Image generation prompt | _(required)_ |
| `--output` | Output path (must end in `.png`) | _(required)_ |
| `--aspect` | Aspect ratio: `1:1`, `3:4`, `4:3`, `9:16`, `16:9` | `16:9` |
| `--count` | Number of variants (1–4) | `3` |
| `--watermark` | `white`, `black`, `none`, or `auto` | `auto` |
| `--model` | Imagen model ID | `imagen-4.0-generate-001` |

> **Note:** `--negative` is accepted but not supported by the current API. Bake negative constraints directly into the prompt instead.

## Reference Images

The `assets/reference/` folder holds real blog thumbnails from orbitant.com for visual style calibration. If the folder is empty, download them:

```bash
node plugins/orbitant-marketing/skills/image-creation/scripts/scrape-insights-images.mjs
```

Safe to re-run (skips existing files). Use `--force` to re-download everything.

## Output

For each generated image the script saves:
- `{name}.png` — original without watermark
- `{name}_branded.png` — with Orbitant watermark composited (auto-detects white/black based on image brightness)
- `{name}.prompt.json` — prompt, model, aspect ratio, and timestamp for reproducibility

## Visual Identity

See [`references/visual-identity.md`](references/visual-identity.md) for the full spec: color palette, watermark rules, signature look, and proven metaphors table.

When a new image establishes a visual pattern worth reusing, add it to the **Proven Metaphors** table in that file.

## File Structure

```
image-creation/
├── SKILL.md                  # Claude skill definition
├── README.md                 # This file
├── references/
│   └── visual-identity.md    # Brand visual identity rules
├── scripts/
│   ├── generate-image.mjs          # Image generation + watermark script
│   └── scrape-insights-images.mjs  # Downloads curated reference images from orbitant.com
├── assets/
│   ├── watermark-white.svg   # White watermark for dark backgrounds
│   ├── watermark-black.svg   # Black watermark for light backgrounds
│   └── reference/            # Blog thumbnails for style reference (gitignored)
└── output/                   # Generated images + prompt files (gitignored)
```
