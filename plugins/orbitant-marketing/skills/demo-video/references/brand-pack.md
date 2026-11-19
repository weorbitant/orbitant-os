# Brand pack

A brand pack is **data only**: one `brand.json` plus the files it points to. To change the look of
a project's videos, change the brand pack. Never change the template for one brand.

## Layout in the user's project

```
<repo>/demo-video/
├── brand.json
└── brand/
    ├── assets/logo-on-dark.png      ← a logo that reads on the dark stage
    └── fonts/                         ← vendored font files, with their licences
```

All paths in `brand.json` are relative to `brand.json`. `demo.mjs build` copies the files into each
demo folder, because the preview server only serves files inside the demo folder.

## Fields

| Field | Required | Meaning |
|---|---|---|
| `name` | yes | Product or company name. Used in messages only. |
| `language` | yes | ISO 639-1 code (`es`, `en`, …). Sets the `lang` of the video and the TTS language. |
| `colors.stage` | yes | The background of every scene. Choose a **dark** colour from the brand hue. Product screenshots are usually white and need a dark stage to stand out. |
| `colors.stageHi` / `stageLo` | no | Light and dark ends of the radial stage gradient. Default: `stage`. |
| `colors.ink` | yes | Text on the stage. Must have high contrast against `stage`. |
| `colors.inkMuted` | yes | Secondary text on the stage (captions, sub-lines). |
| `colors.accent` | yes | The one brand colour: label pills, the accent bar, and the click ring in a capture. |
| `colors.accentText` | no | The accent when it is **text on the stage** (card kickers). Default: `accent`. Set a lighter rung of the brand hue when `accent` fails contrast on the stage. |
| `colors.accentInk` | yes | Text on top of `accent` (the label pill text). |
| `colors.card` | no | Background behind product media. Default `#ffffff`. |
| `fonts.display` / `fonts.body` | yes | `{ family, file, weight }`. `file` is a local `.woff2` (best), `.woff`, `.otf` or `.ttf`. Never a font CDN. |
| `logo` | yes | A logo for a dark background (PNG or SVG). Shown on the outro card. |
| `outro.headline` / `outro.sub` | yes | Text of the outro card, for example the product name and the URL. |
| `voice.voiceId` | yes | ElevenLabs voice id. Choose a **native** voice for the language and its variant. → `tts-es.md` § 1 and § 4 |
| `voice.model` | yes | `eleven_multilingual_v2` (default, most stable) or `eleven_v3` (more expressive, audio tags, no `<break>`). |
| `voice.stability` | no | 0–1. Default 0.5. |
| `voice.similarityBoost` | no | 0–1. Default 0.75. |
| `voice.speed` | no | 0.7–1.2. Default 1.0. Outside this range the quality drops. |
| `voice.seed` | no | Fixed integer for repeatable output. Default 42. |
| `sfx` | no | `false` turns off the click and whoosh sounds for every video. Default: on. A `demo.json` `sfx` overrides it. |
| `frame` | no | The recording scene frame for every recording scene: `bleed` (default, the product runs off the right and bottom edges) or `card` (the whole screen in a floating card). A recording scene `frame` overrides it. |
| `motion` | no | The default entrance and scene change for each situation, and `highlight.dim` (0–1, default 0.6). Default: the table in `motion.md` § Defaults. A video theme keeps it in `video.json`. |

`style` exaggeration is always 0. The TTS document explains why. It is not a field.

`theme` (the title and the URL of the design system it came from) is written by `demo.mjs theme`.
The build does not read it.

## Make a design system a video theme

A Claude Design design system is a video theme when it has these files under `project/`:

- `assets/video/video.json` — the fields above, except `theme`. Colours can be token aliases
  (`"{primary}"`) of colour tokens in `tokens.json`. Paths are relative to `project/`.
- the two font files that `video.json` names, under `fonts/`, with their licence files.
- the logo for the dark stage, uploaded under `assets/video/` and recorded in `design-system.json`.
- optional: a `video.md` brand-book section and a `components/VideoStage/` preview.

The Afianza Video design system is the reference. To add a video section, a writer of that design
system follows the steps below and publishes the files there.

## Make a new brand pack

1. Get the brand colours from the product's design system (CSS tokens, Figma or the style guide).
   Cite the source. Never invent a colour.
2. Choose `stage`: a dark shade of the brand hue, not a neutral black.
3. Check contrast: `ink` on `stage` and `accentInk` on `accent` must pass WCAG AA.
   `npx hyperframes check` reports failures.
4. Copy the font files and their licence files into `brand/fonts/`.
5. Choose the voice in the ElevenLabs Voice Library. Filter by language and accent.
6. Run `node <skill>/scripts/demo.mjs doctor --brand demo-video/brand.json`.

`examples/brand.json` is the Afianza pack. It is a complete working example.
