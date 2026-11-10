---
name: orbitant-demo-video
description: Make a one-to-two-minute product demo video in the project's own brand, narrated with an ElevenLabs voice — from a sprint, a release, merged PRs, one feature, or a short text, plus the product's URL (the agent records the screens; the person only signs in) or their own recordings. Use when someone asks for a demo video, a sprint or release video, a progress video, or "what we shipped" as a video. Works for any project that has (or creates) a brand pack. Not for a cinematic, hand-choreographed film (use /product-launch-video) or captions on existing footage (use /embedded-captions).
---

# Demo video

A fixed template, filled with data. The person gives **what to show** and **the pixels**; you write
`demo.json`; scripts do the rest. The result looks the same every time, in the project's brand, and
passes `hyperframes check` because the template already does.

You do not hand-write compositions in this workflow. Every HTML file in a demo folder is generated
by `demo.mjs build`. To change a video, change `demo.json` (content) or `brand.json` (look) and
rebuild. To change the template itself, change it in this plugin, never in one project.

`<skill>` below is this skill's base directory.

## Layout in the user's project

```
<repo>/demo-video/
├── brand.json                 ← the brand pack (look + voice) → references/brand-pack.md
├── brand/                     ← logo and fonts that brand.json points to
├── .capture/                  ← the signed-in session for `capture` (git-ignored, never commit it)
└── demos/<slug>/              ← one folder per video, e.g. 2026-sprint-21
    ├── demo.json              ← you write this
    ├── media/                 ← the recordings and screenshots (the person's, or `capture` writes them)
    ├── audio/                 ← written by `tts`
    └── index.html, compositions/, brand/, package.json, meta.json   ← written by `build`
```

## The workflow

Run the steps in order. Each step prevents rework in the next one.

### 0 · Check the machine

```bash
node <skill>/scripts/demo.mjs doctor --brand demo-video/brand.json
```

Fix every `✗` before you continue. Each line says what to do. A missing `ELEVENLABS_API_KEY` is a
`!` and is normal: the voice step uses the ElevenLabs connector (step 5). The `(for capture)` lines
are for "the agent records" (step 4), the default. Fix a `!` there too, unless the person gives the
recordings.

### 1 · Theme

The theme is the look and the voice: `demo-video/brand.json` and `brand/`. It comes from a Claude
Design design system that has a video section.

**Default theme:** Afianza Video — `https://claude.ai/artifact/GhA8ocdc3fMxouzMU4YZNB`

If `demo-video/brand.json` exists, use it and name its theme (`theme.title`) in one line. Do the
steps below only when there is no `brand.json`, or when the person asks for another theme.

1. List the design systems: Artifact `list` with `type: "Design System"`.
2. Keep the video themes: Artifact `read` each one with `path: "project/assets/video/video.json"`.
   A design system without that file is not a video theme. Do not offer it.
3. Ask the person once, with AskUserQuestion: one option for each video theme, the default first
   with "(Recommended)". If some design systems are not video themes, say in one line that they
   need a video section first (`references/brand-pack.md`).
4. If the person does not choose (they skip the question, say "any" or "you choose", or this
   session cannot ask), use the default theme. Say which theme you used.
5. Download the chosen theme with Artifact `read`. Do not pass `out_dir`: every read of one
   artifact saves into the same default folder, which the result names. Use that folder below.
   - `paths`: `project/design-system.json`, `project/tokens.json`, `project/assets/video/video.json`,
     and every `project/fonts/…` file (`list` with `scope: "files"` shows them).
   - The logo is an upload. Find its id in `design-system.json` →
     `assetGroups.<group>.files.<name>.blob` (`video.json` → `logo` is `assets/<group>/<name>`),
     and `read` that id as `path`. It saves as `<id>.png` (or `.svg`) in the same folder; `theme`
     finds it by that id.
6. Write the brand pack:
   ```bash
   node <skill>/scripts/demo.mjs theme <the folder the reads saved to> --out demo-video --url <theme url>
   ```
   The command resolves the colour tokens and copies the fonts and the logo. It keeps a voice id
   that the project already set when the theme has only a placeholder.
7. If `theme` prints `! voice.voiceId is a placeholder`, set `voice.voiceId` in `demo-video/brand.json`.
   Ask the person for a voice, or use the default for Spanish (Spain): Sofía, `RrEQHwbMIvoa9O0J5xAW`.
   Say which voice you used. `doctor` and `tts` stop while the placeholder is there.

If no design system can be opened (none is shared with the person, or there is no Artifact tool),
copy `examples/brand.json` and `examples/brand/` into `demo-video/`. That is the Afianza theme,
bundled with this plugin. To make a theme by hand → `references/brand-pack.md`. Never invent a colour.

### 2 · Collect the story

The video needs **a story** and **pixels**. Get the story first. The pixels come in step 4, after the
person approves the script: a recording made before the script is often the wrong one.
If the person gives no story, ask, and offer the options:

| Story — what to show | How to get it |
|---|---|
| A Jira sprint | Atlassian MCP: the sprint's done issues. |
| Merged PRs | `gh pr list --state merged --search "merged:>=<date>"` in **every** repo of the product (web, api, …). Ask the person which repos if you are not sure. |
| Release notes / changelog | Read the file. |
| A short text | The person types three to five lines. |

From any source, keep only what a user can see in the product. Drop releases (release-please),
`chore`, `refactor`, `test`, `ci`, `docs`, dependency updates, internal and back-office tools, and
fixes a user never noticed. Group the rest into features.

**Ask for the product URL** (dev or staging), in the same round as the story if you can:
"What is the URL of the environment I record (dev or staging)?" Do not ask where the recordings or
screenshots are: the agent records them in step 4. Use the person's own files only when they offer them.

**Sign the person in once, now.** Create `demo-video/demos/<slug>/demo.json` with only the `capture`
block (step 4, item 1, has the format; step 3 adds the scenes). Then start the sign-in browser in the
background (Bash `run_in_background`):

```bash
node <skill>/scripts/capture.mjs login demo-video/demos/<slug>
```

Tell the person at once, and ask with one button (AskUserQuestion, option "I have signed in"):

> I wrote a small Playwright capture script. It opened a separate "Google Chrome" window on <the URL>.
> Please sign in there, then click "I have signed in".

(The window title is "Google Chrome for Testing" when Chrome is not installed.) When the person
clicks the button, run `capture.mjs login demo-video/demos/<slug> --done`. It saves the session and
closes the window. Then read the output of the background login: `✓ session saved`, or `✗` with
the reason. **Never ask for a password, and never type one.** Never ask the person to close the
window. The session saves to `demo-video/.capture/` (git-ignored). `look`, `find` and `record` use it.

**Open each feature in the environment that the pixels will come from (dev, staging) before you write
the script.** Look only: do not record yet. **Do not use the browser pane for the product.** On a
remote site the pane asks the person for permission at each action. Use `capture` from Bash, with
the saved session:

```bash
node <skill>/scripts/capture.mjs look demo-video/demos/<slug> /dashboard              # → .capture/look/dashboard.png
node <skill>/scripts/capture.mjs look demo-video/demos/<slug> /dashboard --scroll 900 # the part lower down
node <skill>/scripts/capture.mjs find demo-video/demos/<slug> /dashboard "Cobros pendientes"
```

Read the PNG that `look` writes. `find` prints a selector for each element with that text, and for
the card that holds it (`text="Cobros pendientes" >> xpath=ancestor::*[2]`, the one to use for
`lift`). It prints their boxes in page pixels, whether they are below the fold (with the `scroll` to
add), and the scrolling area that holds them. Use these selectors in the `record` steps.
A feature can be hidden by a feature flag, a plan, or data the test account does not have. Drop a
feature you cannot show, and tell the person why.

### 3 · Write the script, then the approval gate

Read `references/tts-es.md` before you write any `say` text. It is the voice-over contract.

```json
{
  "source": "Sprint 21 · Sherpa (Jira board SHP)",
  "music": "media/music.mp3",
  "scenes": [
    { "type": "card", "kicker": "Sprint 21 · Sherpa", "headline": "Lo nuevo esta quincena", "sub": "Octubre 2026",
      "script": "Esto es lo que hemos entregado en el sprint 21.", "say": "Esto es lo que hemos entregado en el sprint veintiuno." },
    { "type": "beat", "label": "Nuevo", "title": "Filtros guardados", "caption": "Guarda una búsqueda y vuelve a ella en un clic",
      "media": "media/filtros.mp4", "script": "…", "say": "…" },
    { "type": "card", "kicker": "Próximo sprint", "headline": "Exportación a Excel", "script": "…", "say": "…" },
    { "type": "outro", "hold": 3 }
  ]
}
```

| Scene (`type`) | Say to the person | Fields | Use |
|---|---|---|---|
| `card` | title screen | `kicker`, `headline`, `sub` | The title, a chapter, "what comes next". |
| `figure` | number screen | `kicker`, `value`, `label` | One real result as a big number, for example `"value": "184.320,00 €"`. Write the number as the product shows it. |
| `beat` | recording scene | `label`, `title`, `caption`, `media`, optional `focus`, `highlight`, `mask`, `record` | One feature, with its recording or screenshot. |
| `outro` | end screen | `headline`, `sub` (both default to `brand.outro`) | The last scene, with the logo. |
| every scene | | `script`, `say`, `hold` | `script` = the human version (digits, acronyms). `say` = the TTS version. `hold` = minimum seconds. |
| optional | | `transition`, `enter` | The scene change into this scene, and the text entrance of a card. Leave them out: the brand chooses by situation. → `references/motion.md` |

The `type` names are for `demo.json` only. To the person, say the words in the second column: "beat" and "card" mean nothing to them.

Rules:

- **Length:** 60–120 s in total. Three to five recording scenes. One feature for each recording scene. When there is less
  real content, a shorter video is correct: never add filler. `build` warns below 60 s; tell the
  person and continue.
- **Text on screen:** a `title` fits on one line (about 32 characters). A `caption` is one line
  (about 60 characters) and says the user benefit, not the implementation.
- **Order:** title card → recording scenes (most valuable first) → optional "next" card → outro.
- **Two scripts, never mixed** (tts-es.md § 5): `script` is what a person reads. `say` is normalized:
  numbers and symbols as words, accents, `¿ ¡`, short sentences, less than 800 characters.
- The scene length follows its narration. A scene without `say` lasts `hold` seconds (default 4).
- **Motion:** `build` chooses the scene changes and the text entrances by situation, from the
  brand's `motion` defaults. Set `transition` or `enter` on a scene only for a reason that
  `references/motion.md` names, for example `"transition": "push"` for a second recording scene of the same
  feature, or `"enter": "badge"` for a release card. Use `curtain` once in a video at most.
  `build` prints each scene with its transition and entrance.

**Music library:** Demo Video Music — `https://claude.ai/artifact/3wPczAmFDgNfJKn2kYgwAm`

1. Read the list: Artifact `read` of the library with `path: "library.json"`.
2. Ask the person once, with AskUserQuestion (in the same round as the theme if you can): one
   option for each track (title and mood), the `default` first with "(Recommended)", and "No music".
   Give the library link so the person can listen first. The person can also give their own file.
3. If the person does not choose (they skip, say "any", or the session cannot ask), use the
   `default` track. Say which track you used.
4. Download the chosen track: Artifact `read` of the library with `path` = the track's `file`.
   Copy the saved file to `demos/<slug>/media/music.mp3` and set `"music": "media/music.mp3"`.

| The person… | `demo.json` gets |
|---|---|
| chooses a track, or does not choose | `"music": "media/music.mp3"` (the chosen or the default track) |
| gives a file | `"music": "media/<their file>"` |
| chooses "No music", or the library cannot be opened | `"music": null` — say why |

The build mixes the music under the voice by itself (fade in, a duck under each line, fade out).
Do not change its volume.

**The approval gate. Do this before you record, voice or build anything.**

```bash
node <skill>/scripts/demo.mjs tts    demo-video/demos/<slug> --dry-run   # checks every `say`, calls nothing
node <skill>/scripts/demo.mjs script demo-video/demos/<slug>             # the script as a table
```

`script` prints each scene with its text on screen and its `script` line, and the length. Paste the
table in the chat, with the source of each feature (the PR, the issue or the release note line). Ask
the person to approve the script or to change it. Change `demo.json` and show the table again until
they approve. A recording scene's `media` can be a file that does not exist yet: step 4 makes it.

When the person says yes, in their own words, run:

```bash
node <skill>/scripts/demo.mjs script demo-video/demos/<slug> --approve
```

It saves a fingerprint of the approved text in `demo.json` (`approved`). `capture record`, `tts` and
`build` stop while the script is not approved, and again when the text on screen, a `script` or a `say`
changes after the approval. **Never run `--approve` without the person's yes.** A change to `media`,
`record`, `focus`, `highlight` or `mask` needs no new approval.

### 4 · Pixels, then a draft preview

**The default: the agent records**, from the URL of step 2, with `capture` (below), in the session
that the person signed in to in step 2.

| Pixels — what it looks like | Quality |
|---|---|
| **The agent records** the product from the URL (dev, staging) with `capture` | Best, and the default. 1920×1080, with a cursor, a click ring, and the zoom and highlight from the click log. |
| The person's screen recording per feature, 10–30 s, 16:9, `.mp4`/`.mov` | Good, when the person offers them. No click log, so add `focus` and `highlight` by hand. |
| The person's screenshots, `.png` | Fair. Give each one a `focus` (below): a slow push-in alone is a dead screen after 3 s. |

The files go in `demos/<slug>/media/`. When the person gives their own files, tell them to hide personal
and customer data before they record. **Never invent a UI** for a missing capture. Leave that feature
out, or ask for the capture. Do not use browser-pane screenshots as media: they are 800 px wide, too
small for 1080p.

#### The agent records (`capture`)

`capture.mjs` drives Google Chrome with Playwright. npm downloads Playwright on first use. Nothing
is installed by hand.

1. Add the product URL, and the names to hide, to `demo.json`:
   ```json
   "capture": { "base": "https://dev.example.com", "redact": { "names": { "Lucas Jin": "Ana García" } } }
   ```
   `capture` replaces **every email** in the page with `demo@example.com` (set `redact.email` for
   another one). It replaces each listed name before the page shows. Add the signed-in person's
   name, and customer names. When a name is split over two elements, list the parts too.
2. The person signed in in step 2. When `record`, `look` or `find` stops with "the session has
   expired", do the sign-in of step 2 again (`login` in the background, the button, `login --done`).
3. Give each recording scene a `record` block. `media` is the file that `record` writes:
   ```json
   { "type": "beat", "title": "Panel de control", "media": "media/panel.mp4",
     "record": { "url": "/dashboard", "waitFor": "text=Resumen",
                 "steps": [ { "wait": 1500 }, { "click": "text=Ver detalle" }, { "wait": 2500 } ] } }
   ```

   | Step | Does |
   |---|---|
   | `{ "wait": 1500 }` | Waits, in milliseconds. Give each screen time to be read: 1500 ms or more before a click, as a person does it. |
   | `{ "click": "<selector>" }` | Moves the cursor to the element and clicks it. |
   | `{ "hover": "<selector>" }` | Moves the cursor to the element. |
   | `"lift": true` on a `click`, `hover` or `type` step | Also saves a 2× cut-out of the element, for the lift (below). |
   | `{ "type": "<selector>", "text": "…" }` | Clicks the field and types the text, key by key. |
   | `{ "press": "Enter" }` | Presses a key. |
   | `{ "scroll": 600 }` | Scrolls down by that many pixels (a negative number scrolls up). |
   | `{ "goto": "/other" }` · `{ "waitFor": "<selector>" }` | Opens a page · waits until an element shows. |

   A selector is a Playwright selector: CSS (`#save`), text (`text=Guardar`), or role
   (`role=button[name="Guardar"]`). Get it with `capture find` (step 2), not with the browser pane.
   A step that finds nothing stops the run, because a missed click records the wrong clip.
   A `media` that ends in `.png` gives a still: the steps run, then one screenshot at 2×
   (3840×2160), so a zoom into it stays sharp (up to 6×). **The pixels of a 2× still are 2× too:**
   `focus`, `highlight` and `mask` on it use 0–3840 and 0–2160 (the `find` boxes × 2).
   **A still needs a `focus`**, with `word` on the word that names the feature: a still has no motion
   of its own, so the 2× pixels are wasted without a zoom. `build` warns for a still with no `focus`.
4. Record, then look at the result:
   ```bash
   node <skill>/scripts/capture.mjs record demo-video/demos/<slug>              # every recording scene with record
   node <skill>/scripts/capture.mjs record demo-video/demos/<slug> --scene 3    # one scene again
   ```
   The clip starts on the loaded page and ends one second after the last step, so it needs no trim.
   `record` also writes `media/<file>.clicks.json`: where and when the cursor arrives at each
   element. `build` uses it for the zoom and the highlight (below). Keep it next to the clip.
   Extract a frame of each clip (`ffmpeg -ss 2 -i media/<file>.mp4 -frames:v 1 /tmp/f.png`) and read it.
   Look for personal data that is still there. Hide it with a recording scene `mask` (below).
   Add `--headed` to watch the browser while a selector does not work.

Make each clip a little longer than its narration: a recording that ends early shows an empty card.

**A click that opens a new page.** In one clip, the new page replaces the old one with no motion, so the
viewer does not see that the page changed. Split the scene in two recording scenes and join them with a `push`:

1. The first scene records the old page. Its last step is the click. Put the cue word of the click at the
   end of its `say` ("… Pulsa ver.").
2. The second scene records the new page: its `record.url` is the address that the click opens, and
   `"transition": "push"`. Its first hover also moves the cursor away from the place of the click, so no
   tooltip stays open.
3. After `record`, cut the first clip at the click and hold that frame, because `record` adds one second
   of the new page after the last step. Take the click time `t` from `media/<file>.clicks.json`:
   ```bash
   cp media/<file>.mp4 media/<file>.raw.mp4
   ffmpeg -y -t <t + 0.15> -i media/<file>.raw.mp4 -vf "tpad=stop_mode=clone:stop_duration=3" -an -c:v libx264 -pix_fmt yuv420p -crf 18 media/<file>.mp4
   ```
   Do this again after each new `record` of that scene.

The split changes the `say` text, so show the script and get the approval again (step 3).

**Automatic for recordings that `capture` makes.** A recording scene with a `.clicks.json` next to its clip, and
no `focus` or `highlight`, gets both from the log. The camera pushes in (about 2×) to each element
when the cursor arrives, the element is lit for 1.8 s, and the camera goes back to the full screen
between clicks that are far apart. `build` prints `· scene N: zoom and highlight from K recorded
click(s)`. Look at the snapshots. Write `focus` or `highlight` yourself to replace the automatic
ones, or set `"auto": false` on the recording scene for no zoom at all. To light a point without a click, add
a `{ "hover": "<selector>" }` step: a hover is logged too.

**The hero feature — `lift`.** For the one most important feature of the video, add `"lift": true`
to its step. Use it on a whole card, tile or row (`.kpi:nth-child(2)`), not on a text span. The
element then comes out of the dark screen: it grows from its own place, floats for about 2 s, and
settles back into the same place. The lifted element stays up 2.6 s, so give it a `wait` of 3000 ms
or more after the step. **Use one lift in each video**: `build` warns for more. A lift on every
recording scene is no longer a hero.

**On the word — `cues`.** Without cues, the zoom follows the cursor. With cues, it follows the voice:
give one word of the recording scene's `say` for each recorded click or hover, in order. A cue matches a
whole word only, and each cue is found after the previous one, so the same word can be a cue twice
(a cue that comes earlier in the say than the one before it gives a warning):

```json
"say": "Arriba ves los ingresos del mes. Con el botón ver, abres el detalle.",
"cues": ["ingresos", "ver"]
```

The camera then arrives on each element as the voice says its word, and the highlight lights at the
same time. **The clip keeps its own time**: a cue moves the zoom, the highlight and the lift by at most
0.7 s before the cursor arrives and 0.3 s after it. Further away, they stay at the time that the clip
shows the element, so a lift never comes out of a screen that is not there yet. `build` then warns,
with the change to make: `! click 1 is 1.5 s after the word "ingresos". Its zoom and highlight stay at
4.2 s, when the clip shows it. To put them on the word, change the wait before it by -1532 ms and
record again.` Change that `wait` step, record the scene again (`--scene N`), and build.
**The order: record, voice, then tune the waits.** The word times are exact only with the voice
(step 5). Look at a lift only after the waits are tuned. A cue is
the first place where the word occurs in the `say`, so choose a word that occurs once. `focus` and
`highlight` keyframes take a `word` too, in place of `at` and `from`:
`{ "word": "total", "x": 300, "y": 170, "w": 1260, "h": 340 }`.

**The frame — `frame`.** `bleed` (the default) is a product shot: the title and the caption are at
the top-left, and the product runs off the right and bottom edges. The visible part is the top-left
1920×895 px of a 1080p capture, so **record with the story in the top part of the screen**, or zoom to
it. `build` warns for a highlight below the visible part. `"frame": "card"` on a recording scene (or in
`brand.json` for all recording scenes) shows the whole screen in a floating card, for a screen where the bottom
matters and no zoom helps.

**Dense screens — `focus`.** The bleed frame shows a 1920-wide UI at 93 %, the card frame at 69 %. Dashboard
numbers and table text are then too small to read. For a screenshot, or a recording that the
person gives, zoom the card into the part that matters:

```json
"focus": { "x": 0, "y": 60, "w": 1000, "h": 160 }
"focus": [ { "at": 0.8, "x": 0, "y": 60, "w": 1000, "h": 160 }, { "at": 4 }, { "at": 6, "x": 0, "y": 860, "w": 700, "h": 220 } ]
```

`x`, `y`, `w`, `h` are pixels of the media file (0–1920 and 0–1080 for a capture). The camera
moves to the region in 1 s, starting at `at` (seconds into the scene; one object starts at 1 s, so
the viewer sees the full screen first). A keyframe with only `at` goes back to the full screen. The
zoom stops at 3×. Find the region on a frame of the clip. Use `focus` on every recording scene with a full desktop UI
that has no click log.

**The important point — `highlight`.** The rest of the screen goes dark. The region stays lit, with a
ring in the brand accent colour. Use it for the one number, button or row that the narration names:

```json
"highlight": [ { "x": 1600, "y": 80, "w": 300, "h": 105, "from": 1.5, "to": 4 } ]
```

Same pixels as `focus`. `from` and `to` are seconds into the scene (default: the full scene). It
fades in and out in 0.5 s and moves with a `focus` zoom. Use one highlight at a time. Start it when
the narration names the point. Use `focus` and `highlight` together on a dense screen: zoom in first,
then highlight.

**Personal data — `mask`.** A soft blur box over the media, for data that `redact` cannot reach, or
a recording that the person gives:

```json
"mask": [ { "x": 1500, "y": 0, "w": 420, "h": 56 }, { "x": 300, "y": 400, "w": 500, "h": 40, "from": 2, "to": 5.5 } ]
```

Same pixels as `focus`. `from` and `to` are seconds into the scene (default: the full scene). A
mask stays on its pixels through a `focus` zoom.

#### Draft preview

```bash
node <skill>/scripts/demo.mjs build demo-video/demos/<slug>             # timing estimated from word count
cd demo-video/demos/<slug> && npm run check
```

Fix every error and read every warning. `check` can print a notice to upgrade HyperFrames: ignore
it, and tell the person to ignore it. This plugin pins the version that its template is tested with.

**Check the draft yourself before the person sees it.** Do the whole check of step 6 ("The check":
the snapshots, the motion frames, the look checklist and, for customers, the critic) on the draft.
Fix every fault and every `build` warning that does not need the voice, record again where needed,
and build again. Only the cue warnings wait for the voice: their word times are estimated now.
Never show the person a preview with a fault that you can fix.

Then show the person the preview, with a short list of the faults that remain. `npm run dev` starts the preview in the background and returns at once. It prints the Studio URL, for example
`http://localhost:3003/#project/<slug>`; open that URL in the browser pane. To stop it:
`npx --yes hyperframes@0.8.158 preview demo-video/demos/<slug> --stop`.

Ask the person if the pixels are right before the voice step. TTS costs credits, and a new recording
can need a new length of narration.

### 5 · Voice

Use the **ElevenLabs connector** when this session has it (its tools end in `creative_generate_speech`).
The person signs in to ElevenLabs once in claude.ai; nobody handles an API key.

1. List the lines that need audio:
   ```bash
   node <skill>/scripts/demo.mjs tts demo-video/demos/<slug> --list
   ```
   It prints a JSON list of `{ scene, file, say, voiceId, model }`. Lines that already have audio are
   not in the list, so a second run only voices what changed. `--force` lists every line.
2. For each line, call `creative_generate_speech` with `prompt` = `say` exactly, `voice_id` = `voiceId`,
   `model_id` = `model` and `generations_count: 1`. Call it once per line, never again to retry: each
   call is charged.
3. Call `creative_get_flow_run_status` with its `flow_id` and `session_ids` until `all_completed` is true.
4. Download the take at once (the link expires after a few hours), to the exact `file` from step 1:
   ```bash
   curl -sSf -o "<file>" "<generations[0].content_url>"
   ```

If the session has no ElevenLabs connector, run `node <skill>/scripts/demo.mjs doctor`. If it finds the
key (`✓ ElevenLabs API key found`), run `node <skill>/scripts/demo.mjs tts demo-video/demos/<slug>`,
which does steps 1–4 itself. The script reads `ELEVENLABS_API_KEY`, and on macOS the Keychain item
`elevenlabs-api-key`. It also saves the time of each character next to each line (`audio/*.json`), so a
`cue` lands on its word exactly. It sends the neighbour lines with each line for a continuous
intonation, so a changed line is voiced again together with the lines next to it. With the connector, `build` estimates the word times from the
characters (about ±0.4 s). Look at the snapshot of each cue.

If there is no connector and no key, stop and give the person both ways, in their language. Never ask
for the key in the chat, and never put it in a command that you run.

> **Option A — connect the ElevenLabs connector (recommended, no key)**
> 1. In claude.ai, open **Settings → Connectors**.
> 2. Find **ElevenLabs** and click **Connect**. Sign in with your ElevenLabs account (the company one,
>    if your team has one).
> 3. Start a new Claude session in this project and ask for the video again. The work done so far is
>    kept.
>
> **Option B — save an ElevenLabs API key on this computer**
> 1. In ElevenLabs, open **Developers → API Keys** and create a key with the **Text to Speech**
>    permission. Copy it.
> 2. On a Mac, open the Terminal app and run this command. It asks for the key and does not show it:
>    ```bash
>    security add-generic-password -a "$USER" -s elevenlabs-api-key -w
>    ```
>    On Windows or Linux, set an environment variable named `ELEVENLABS_API_KEY` with the key, then
>    restart Claude.
> 3. Come back here and say "continue". Do not paste the key in this chat.

The connector reads each line on its own, with the voice's default settings (stability 0.5,
similarity 0.75, speed 1). A `brand.json` with other voice settings needs the key path.

**Test one line first.** You cannot listen to audio. Voice only the line with the most numbers,
acronyms and product names, send the file to the person, and wait until they say it sounds right.
Then voice the other lines. If a word sounds wrong, change its spelling in `say` (tts-es.md § 5).

If one line sounds wrong, fix its `say` and do this step again. Only that line is voiced again.

### 6 · Check again with the voice

The voice changes the timing of every scene, so check the video again before the person sees it:

1. Build. Tune the waits until `build` shows 0 cue warnings ("On the word" in step 4): change each
   `wait`, record the scene again (`--scene N`), and build again.
2. Do "The check" (below) on the timed video, and fix what you find.
3. Make the poster (`demo.mjs poster`, step 7), and show the person the final preview, with the faults that remain.

#### The check

The same check runs twice: on the draft (step 4, before the person sees it) and on the voiced video
(here).

```bash
node <skill>/scripts/demo.mjs build demo-video/demos/<slug>
cd demo-video/demos/<slug> && npm run check
npx --yes hyperframes@0.8.158 snapshot --at <the "snapshot --at" list that build prints>
npx --yes hyperframes@0.8.158 snapshot --at <the "seams --at" list> --no-end
```

`build` prints each scene's start and end time and a ready `snapshot --at` list. It also brings
every voice line to the same loudness (−16 LUFS), so the voice is clear over the music.

`check` must show 0 errors.

**Look at the video yourself before you show it.** Run `snapshot` twice: with the `snapshot --at`
list (two frames for each scene, at 30 % and 70 %) and with the `seams --at` list (just before, in the middle of and
just after each scene change, plus the first and last seconds).

**Check the motion too.** You cannot play the video, so read it as dense frames: one frame every
0.1 s over each scene change (from the "before" to the "after" time of the `seams --at` list), over
each zoom and highlight arrival (its cue word time, from 0.3 s before to 0.5 s after), and over the
lift. Run them as one more `snapshot --at` list with `--no-end`. A jump, a flash, two titles on top
of each other, or a zoom that lands on the wrong place shows only in these frames.

Read every frame and look for:

- a scene where nothing new happens for more than 3 s: its two frames show the same thing (a still
  with no zoom, a long wait in a clip). Add a `focus`, or cut the wait;
- a flash, a black frame, or a jump at a scene change;
- text that touches an edge, or text over text;
- a highlight or a zoom on the wrong element, or one that arrives after its word;
- a zoom, a highlight or the poster on an empty value ("–", 0, "Sin datos"): move it to an element
  that has a value;
- a tooltip or a menu that the cursor opened and that covers the content;
- personal data that is still visible;
- a frame at the end that is not the outro;
- key information that leaves the screen before it was still for 1 s (a number, a result, the logo);
- text too small to read at phone size: a caption at least 3 % of the frame height (32 px), a title
  at least 5 % (54 px). On a zoom, the UI text that the narration names must be about 3 % too;
- the same effect as the hero twice (two lifts, the same zoom on every recording scene), or the same
  information twice;
- a cursor that moves faster than a person, or a screen that changes before it can be read.

Fix the largest fault first, build, and look again. After three rounds, stop and tell the person the
faults that remain. Do not loop.

**A critic, for a video that goes to customers** (a newsletter, a launch). Start one subagent with the
snapshot paths, `demo.json` and the script. Tell it to find faults, not to praise: a verdict, then the
faults in order with the time of each one, then the five fixes to do first. Fix what it finds that is
real. A fresh reader sees what the author stops seeing: a caption cut short, a number too small to
read at phone size, a zoom that shows nothing new.

Then show the person the preview (step 4: the draft; step 6: the final video), with the faults that
remain.

### 7 · Render

Only after the person approves the preview:

```bash
cd demo-video/demos/<slug> && npm run render
node <skill>/scripts/demo.mjs master demo-video/demos/<slug>/renders/<name>.mp4
node <skill>/scripts/demo.mjs poster demo-video/demos/<slug>
```

`master` brings the whole mix to −14 LUFS with a true peak of −1 dBTP, the level of YouTube, LinkedIn
and most players, and writes `<name>.master.mp4`. The video is copied, not encoded again. It prints the
loudness before and after. You cannot listen to the mix: give the person these numbers, and do not
say that it sounds good.

`poster` writes `poster.png`, the thumbnail for the newsletter or the link preview. `build` chooses
the frame: the first lit highlight, else the middle of the first recording scene. Choose another one with
`"poster": { "scene": 3, "at": 4.5 }` in `demo.json`. A poster shows the result on screen, never a
frame between two scenes. Read it before you give it to the person.

Give the person the path of the `.master.mp4` and of `poster.png`. Commit `demo.json`, `media/` and `audio/`. The rest can be generated again.

## When something is wrong

| Symptom | Cause and fix |
|---|---|
| `build`, `tts` or `record` says the script is not approved | Show the script (`demo.mjs script`), and run `--approve` after the person's yes (step 3). |
| `build` says "no audio for the current say" | The `say` changed after `tts`. Run `tts` again. |
| A recording ends before its scene | `build` warns. Record a longer clip, or shorten that `say`. |
| The voice reads digits in English | The `say` has digits or symbols. `tts --dry-run` warns. Write them as words. |
| A question sounds flat (Spanish) | The `say` has no opening `¿`. |
| Contrast fails in `check` | Fix the brand pack colours (`ink`, `inkMuted`, `accentText`), not the template. |
| The dashboard numbers are too small | Add a `focus` to the recording scene (step 4). Add a `highlight` on the number that the narration names. |
| `build` says the last click is less than 1 s before the scene ends | The result leaves the screen too soon. Make the `say` longer, record a longer clip, or move the step earlier. |
| `build` says there are 2 lifts or more | Keep `"lift": true` only on the step of the most important feature, and record those scenes again. |
| The clicks or the whooshes are too much | Set `"sfx": false` in `demo.json` (this video) or in `brand.json` (all videos). |
| `build` says a click is far from its word | Its zoom, highlight and lift stay on the recorded time. To put them on the word, change the `wait` before that step by the amount `build` gives, and record that scene again. |
| `build` says a still shows nothing new | Add a `focus` to the recording scene, with `word` (step 4). |
| The person says "I have signed in", but `login` still waits | Run `capture.mjs login <demoDir> --done`. Never ask the person to close the window. |
| `login` says the session has no cookie for the host | The person was not signed in when `--done` ran. Run `login` again. |
| `build` says a highlight is below the visible part | The bleed frame crops the bottom. Add a `focus` to it, record it higher on the screen, or set `"frame": "card"`. |
| `master` says the master is off the target | A very loud peak in the mix (often a hit in the music) stops the level before −14 LUFS. Give the person the numbers, or choose a calmer track. |
| `record`, `look` or `find` lands on a sign-in page | The session expired. Do the sign-in of step 2 again. |
| Each action asks the person for permission | Use `capture look` and `find`, not the browser pane. Give the person the allow rules in the plugin README. |
| `record` stops at "no visible element" | The selector is wrong, or the page is slow. Check it with `--headed`; add a `waitFor`. |
| Google sign-in says the browser is not secure | Install Google Chrome; `capture` uses it before its own Chromium. Or sign in with email and password. |
| The person wants a different layout | That is a template change. Make it in the plugin, test it on two brands, and publish a new version. |
