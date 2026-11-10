# Motion — the recipes in the demo template

The template moves with recipes from the Afianza transition board (48 recipes; the gallery is
`project/assets/video/transition-samples.html` in the Afianza Video design system). The demo
template uses only the recipes that work on **real captures**. The board's interaction recipes
(`I1`–`I12`: button press, toggle, dropdown, …) animate a rebuilt UI, and this workflow never
rebuilds a UI. The capture already shows those states.

Every recipe uses the house ease `cubic-bezier(0.2, 0, 0.2, 1)` and the board's frame budgets at
30 fps. No recipe overshoots past 1.12, bounces, loops or blurs in.

## Scene changes — `transition` (on the incoming scene)

| Name | Recipe | Use it for | Length |
|---|---|---|---|
| `cut` | — | Two scenes with no relation. Always correct. | 0 |
| `crossfade` | `T1` Cross fade | The default between recording scenes, and into the outro (`C1` Fade to brand). | 0.3 s |
| `push` | `T2` Slide push | A second recording scene of the same feature: "one level deeper". **Always after a click that opens a new page** (SKILL.md step 4, "A click that opens a new page"). | 0.4 s |
| `wipe` | `T4` Mask wipe | Into a title or a chapter card. | 0.5 s |
| `sweep` | `C10` Rule sweep out | A section break in the middle: before the "next sprint" card. | 0.47 s |
| `zoomout` | `C6` Zoom out to logo | From the last recording scene into the outro. | 0.47 s |
| `curtain` | `C5` + `T11` Curtain close and split curtain | A strong break, **once per video**. The pair always goes together. | 0.57 + 0.6 s |

The incoming scene starts at the cut. The outgoing scene stays on screen for the length of the
seam, so a recording must last that much longer than its narration (`build` warns).

## Text entrances — `enter` (on `card`, `figure`, `outro`)

| Name | Recipe | Use it for |
|---|---|---|
| `rise` | `O2` Title stack rise | The title card. The headline first, then the lines around it. |
| `mask` | `O11` Mask-up line | Chapter cards. Each line slides up from behind its own edge. |
| `words` | `O3` Word-by-word reveal | A short headline, **five words or fewer**. |
| `underline` | `O5` Underline draw | The quietest entrance: the text is there, only the accent rule draws. |
| `badge` | `O10` New badge intro | A release: the kicker becomes a chip ("Nuevo") that pops, then the headline. |
| `figure` | `O9` Figure intro | A `figure` scene: the number lands, its label a moment later. |
| `hold` | `C12` End hold | The outro. The mark settles, the lines fade in, then nothing moves. |
| `handle` | `C7` Handle reveal | An outro with an address: the rule draws, the URL wipes in. |

## Inside a recording scene

| Field | Recipe |
|---|---|
| (always) | `O12` Settle in: the card rises from a recessed, darker state, then a slow push-in. |
| `focus` | `T6` Spotlight zoom (the push into one region). |
| `highlight` | `T6` Spotlight zoom (the dimmed surroundings). `motion.highlight.dim` sets the darkness. |
| `record` steps | `T7` Guided click: the capture draws the cursor glide and the click ring. |
| `"lift": true` on a step | The hero arc: spotlight, push in, float, back to its own place (video-shotcraft `spotlight-hero-card`). Once per video. |
| (sound) | A soft click on each recorded click, a short whoosh on each `push`, `wipe`, `sweep`, `zoomout` and `curtain`. A cut or a crossfade makes no sound. `"sfx": false` turns them off. |

A recording that `capture` makes logs each click and hover (`<media>.clicks.json`). A recording scene with no
`focus` and no `highlight` then gets both from the log: T6 at each element, when the cursor
arrives (`autoCamera` in `scripts/demo.mjs`). `"auto": false` on the recording scene turns it off. With
`cues` (one word of the `say` for each click), T6 lands on the word instead of the cursor, the way
the board times a reveal to the spoken payoff.

## Rules

From the product-film rules of video-shotcraft (`references/aesthetic-rules.md` there, Apache-2.0):

- **Hold.** Key information (a number, a result, the logo) stays still for 1 s before it leaves. `build`
  warns when the last click of a recording scene is less than 1 s before the scene ends.
- **Slow, not fast.** A person's speed: 1.5 s or more between steps. Nobody has asked for a faster demo.
- **One hero.** One effect is the hero only once in a video: one lift, one curtain. The same
  information is never shown twice.
- **A sound for an action.** Each sound effect belongs to an action that the viewer sees. No sound on
  a cut or a crossfade, and no music hits as effects.
- **Readable at phone size.** Text that must be read is at least 3 % of the frame height; a title 5 %.

## Defaults

`build` chooses by situation. A brand changes the defaults in `brand.json` → `motion` (from the
design system's `video.json`). A scene changes only itself with `enter` or `transition`.

```json
"motion": {
  "enter": { "title": "rise", "card": "mask", "figure": "figure", "outro": "hold" },
  "transition": { "beat": "crossfade", "card": "sweep", "figure": "crossfade", "outro": "crossfade" },
  "highlight": { "dim": 0.6 }
}
```

`enter.title` is the first scene when it is a card. `transition.<type>` is the change into a scene
of that type. The first scene has no transition.

The code is in `template/seams.js` (scene changes) and `template/compositions/card.html`
(entrances). The house ease is in `template/ease.js`, the one copy: `build` inlines it into each
composition and before the seams. To add a recipe, port it from the board there, add its name to `ENTERS` or `SEAMS`
in `scripts/demo.mjs`, and test it with `npm run check` and snapshots.
