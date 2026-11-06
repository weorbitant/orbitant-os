#!/usr/bin/env node
// demo.mjs — the three mechanical steps of the demo-video skill. No dependencies.
//
//   node demo.mjs doctor [--brand <brand.json>]          check the machine and the brand pack
//   node demo.mjs tts    <demoDir> [--brand …] [--dry-run] [--force] [--list]
//                                                        check every `say`, then voice each scene with ElevenLabs
//                                                        (--list: print the lines that need audio as JSON, for the connector)
//   node demo.mjs script <demoDir> [--approve | --check] print the script for the person; --approve after their yes
//   node demo.mjs build  <demoDir> [--brand …]           write index.html + one composition per scene
//   node demo.mjs poster <demoDir>                       write poster.png, the thumbnail frame that build chose
//   node demo.mjs master <video.mp4>                     after render: the mix to -14 LUFS / -1 dBTP → <video>.master.mp4
//   node demo.mjs theme  <dsDir> [--out demo-video] [--url <design system url>]
//                                                        write brand.json + brand/ from a downloaded design system
//
// Recording the product is capture.mjs (it needs Playwright, so it is a separate file).
//
// <demoDir> holds demo.json and media/. The brand defaults to <demoDir>/../../brand.json,
// which matches the layout demo-video/{brand.json, demos/<slug>/}.

import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HYPERFRAMES = "hyperframes@0.8.158";
const GSAP = "https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js";
const MAX_SAY = 800; // ElevenLabs quality drops above this per generation → tts-es.md § 5
const PAD = 0.6; // seconds of air after each narration line
// The words the person sees for each scene type (demo.json keeps the short type names).
const KIND = { card: "title screen", beat: "recording", figure: "number screen", outro: "end screen" };
const TEMPLATE = join(dirname(fileURLToPath(import.meta.url)), "..", "template");
const BED = 0.3, DUCK = 0.12; // music volume between and under narration lines
const VOICE_LUFS = -16; // every narration line is normalised to this loudness by build
// Sound effects, made by ffmpeg (deterministic, no files to download, no licence to track). Each one
// belongs to a visible action: a click to a recorded click, a whoosh to a scene change that moves.
// `"sfx": false` in demo.json or brand.json turns them off.
// Levels: each about 17 dB (RMS) under a voice line at −16 LUFS; the click peak stays under −12 dBFS.
const SFX = {
  click: { src: "aevalsrc='(random(0)*2-1)*0.5*exp(-t*220)+0.5*sin(2*PI*1900*t)*exp(-t*300)':s=44100:d=0.06,highpass=f=900,lowpass=f=8000", vol: 0.3 },
  whoosh: { src: "anoisesrc=r=44100:c=pink:d=0.55:s=7:a=0.6,highpass=f=250,lowpass=f=2800,afade=t=in:d=0.3:curve=qsin,afade=t=out:st=0.3:d=0.25:curve=qsin", vol: 0.5 },
};
const MOVING = ["push", "wipe", "sweep", "zoomout", "curtain"]; // a cut or a crossfade makes no sound

// Motion: recipes of the Afianza transition board, by name (references/motion.md has the ids).
// A brand chooses its defaults in brand.json `motion`; a scene can name its own `enter` and `transition`.
const ENTERS = ["rise", "words", "mask", "underline", "badge", "hold", "handle", "figure"];
const SEAMS = { cut: 0, crossfade: 0.3, push: 0.4, wipe: 0.5, sweep: 0.47, zoomout: 0.47, curtain: 0 }; // value = overlap, s
const ON_TOP_OUT = ["sweep", "zoomout"]; // seams where the outgoing scene is the top layer
const MOTION = {
  enter: { title: "rise", card: "mask", figure: "figure", outro: "hold" },
  transition: { beat: "crossfade", card: "sweep", figure: "crossfade", outro: "crossfade" },
  highlight: { dim: 0.6 },
};

const [cmd, ...rest] = process.argv.slice(2);
const flags = new Set(rest.filter((a) => a.startsWith("--")));
const opt = (name) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : undefined;
};
const demoDir = rest[0] && !rest[0].startsWith("--") ? resolve(rest[0]) : null;
const brandPath = resolve(opt("brand") ?? (demoDir ? join(demoDir, "..", "..", "brand.json") : "demo-video/brand.json"));

const die = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};
const readJson = (p) => {
  if (!existsSync(p)) die(`not found: ${p}`);
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch (e) {
    die(`invalid JSON in ${p}: ${e.message}`);
  }
};
const has = (bin) => {
  try {
    execFileSync(bin, ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};
const probe = (file) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim());
// The ElevenLabs key: the environment first, then the macOS Keychain item `elevenlabs-api-key` (SKILL.md step 5).
// Never printed and never written to a file.
const apiKey = () => {
  if (process.env.ELEVENLABS_API_KEY) return process.env.ELEVENLABS_API_KEY;
  if (process.platform !== "darwin") return "";
  try {
    return execFileSync("security", ["find-generic-password", "-a", process.env.USER ?? "", "-s", "elevenlabs-api-key", "-w"], { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
};
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// ── brand ──────────────────────────────────────────────────────────────────────
const REQUIRED = ["name", "language", "colors.stage", "colors.ink", "colors.inkMuted", "colors.accent", "colors.accentInk",
  "fonts.display.family", "fonts.display.file", "fonts.body.family", "fonts.body.file", "logo", "outro.headline", "voice.voiceId", "voice.model"];
const get = (o, path) => path.split(".").reduce((v, k) => v?.[k], o);

function loadBrand() {
  const brand = readJson(brandPath);
  const problems = REQUIRED.filter((k) => get(brand, k) == null || get(brand, k) === "").map((k) => `brand.json: missing ${k}`);
  for (const f of brandFiles(brand)) if (!existsSync(join(dirname(brandPath), f))) problems.push(`brand.json: file not found: ${f}`);
  if (/^REPLACE/i.test(brand.voice?.voiceId ?? "")) problems.push("brand.json: voice.voiceId is a placeholder. Set a real ElevenLabs voice id (SKILL.md step 1).");
  const speed = brand.voice?.speed ?? 1;
  if (speed < 0.7 || speed > 1.2) problems.push(`brand.json: voice.speed ${speed} is outside 0.7–1.2`);
  return { brand, problems };
}
const brandFiles = (b) => [b.fonts?.display?.file, b.fonts?.body?.file, b.logo].filter(Boolean);

// ── script checks (tts-es.md) ─────────────────────────────────────────────────
function checkSay(scenes, brand) {
  const errors = [], warnings = [];
  scenes.forEach((s, i) => {
    if (!s.say) return;
    const at = `scene ${i + 1}`;
    if (s.say.length > MAX_SAY) errors.push(`${at}: say has ${s.say.length} characters, the limit is ${MAX_SAY}. Split the scene.`);
    if (brand.voice.model === "eleven_v3" && /<break/i.test(s.say)) errors.push(`${at}: eleven_v3 ignores <break>. Use "…" or a new paragraph.`);
    if (/[0-9%€$@/]/.test(s.say)) warnings.push(`${at}: digits or symbols in say. Write them as words, as they are spoken.`);
    if (brand.language === "es" && /\?/.test(s.say) && !/¿/.test(s.say)) warnings.push(`${at}: a question without "¿". Spanish intonation needs the opening mark.`);
    if (brand.language === "es" && /!/.test(s.say) && !/¡/.test(s.say)) warnings.push(`${at}: an exclamation without "¡".`);
  });
  return { errors, warnings };
}

const voiceKey = (say, v) =>
  createHash("sha1").update(JSON.stringify([say, v.voiceId, v.model, v.stability, v.similarityBoost, v.speed, v.seed])).digest("hex").slice(0, 10);
const audioFile = (i, say, v) => `audio/s${String(i + 1).padStart(2, "0")}.${voiceKey(say, v)}.mp3`;

// The second, in a scene, at which a word of its narration starts. Exact from the ElevenLabs
// alignment that `tts` saves next to the audio (.json); else in proportion to the characters.
// ponytail: the proportional estimate can be off by about 0.4 s on a 10 s line (the connector path
// has no alignment); a forced aligner (whisper) is the upgrade if that is too loose.
const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
function wordClock(say, alignFile, len) {
  const al = alignFile && existsSync(alignFile) ? readJson(alignFile) : null;
  const text = fold(al?.characters?.join("") ?? say);
  return (word, at) => {
    const n = text.indexOf(fold(word));
    if (n < 0) die(`${at}: the word "${word}" is not in the say of this scene`);
    return al ? al.character_start_times_seconds[n] : (n / text.length) * len;
  };
}

// ── script gate (SKILL.md step 3) ────────────────────────────────────────────
// The person approves the script before anything is recorded, voiced or built. `--approve` saves a
// fingerprint of the text they saw; tts, build and capture record stop when that text changed.
const TEXT = ["type", "kicker", "headline", "sub", "label", "title", "caption", "value", "script", "say"];
const fingerprint = (scenes) => createHash("sha1").update(JSON.stringify(scenes.map((s) => TEXT.map((k) => s[k] ?? null)))).digest("hex").slice(0, 12);
function requireApproval(demo) {
  if (demo.approved === fingerprint(demo.scenes ?? [])) return;
  die(demo.approved
    ? "the script changed after the person approved it. Show it again (demo.mjs script <demoDir>), and run --approve only after their yes (SKILL.md step 3)."
    : "the person has not approved the script yet. Show it first: demo.mjs script <demoDir> (SKILL.md step 3).");
}
function script() {
  if (!demoDir) die("usage: demo.mjs script <demoDir> [--approve | --check]");
  const file = join(demoDir, "demo.json");
  const demo = readJson(file);
  if (!Array.isArray(demo.scenes) || !demo.scenes.length) die("demo.json: scenes is empty");
  if (flags.has("--check")) return requireApproval(demo), console.log("✓ script approved");
  if (flags.has("--approve")) {
    demo.approved = fingerprint(demo.scenes);
    writeFileSync(file, JSON.stringify(demo, null, 2) + "\n");
    return console.log(`✓ script approved (${demo.approved}). A later change to the text needs a new approval.`);
  }
  const cell = (x) => String(x ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
  const screen = (s) => ({
    card: [s.kicker, s.headline, s.sub], beat: [s.label, s.title, s.caption], figure: [s.kicker, s.value, s.label],
    outro: [s.headline ?? "(brand outro)", s.sub],
  }[s.type] ?? []).filter(Boolean).join(" · ");
  let total = 0;
  console.log("| # | Scene | On screen | Narration |\n|---|---|---|---|");
  demo.scenes.forEach((s, i) => {
    total += Math.max(s.hold ?? 4, s.say ? s.say.split(/\s+/).length / 2.6 + PAD : 0);
    console.log(`| ${i + 1} | ${KIND[s.type] ?? s.type} | ${cell(screen(s))} | ${cell(s.script ?? (s.say ? "(say only)" : "—"))} |`);
  });
  console.log(`\nAbout ${Math.round(total)} s. ${demo.approved === fingerprint(demo.scenes) ? "Approved." : "Not approved yet."}`);
}

// ── doctor ────────────────────────────────────────────────────────────────────
function doctor() {
  const lines = [];
  const ok = (good, msg, fix) => lines.push(good ? `✓ ${msg}` : `✗ ${msg}\n    → ${fix}`);
  const major = Number(process.versions.node.split(".")[0]);
  ok(major >= 18, `Node ${process.versions.node}`, "Install Node 18 or later from https://nodejs.org");
  ok(has("ffmpeg"), "ffmpeg", "Install ffmpeg (macOS: brew install ffmpeg)");
  ok(has("ffprobe"), "ffprobe", "ffprobe ships with ffmpeg");
  // Not a failure: everything except the tts step works without it.
  lines.push(apiKey()
    ? "✓ ElevenLabs API key found"
    : "! No ElevenLabs API key\n    → Normal when the ElevenLabs connector is connected in Claude. Without it, see SKILL.md step 5.");
  // Only the "agent records" path (capture.mjs) needs these, so a gap is a "!", not a failure.
  const PW = join(homedir(), ".cache", "orbitant-demo-video", "playwright@1.64.1", "node_modules", "playwright"); // = capture.mjs CACHE
  const capture = (good, msg, fix) => lines.push(good ? `✓ ${msg}` : `! ${msg}\n    → ${fix}`);
  let npm = true;
  try {
    execFileSync("npm", ["--version"], { stdio: "ignore", shell: process.platform === "win32" });
  } catch {
    npm = false;
  }
  capture(npm, "npm (for capture)", "npm ships with Node. Reinstall Node from https://nodejs.org");
  capture(existsSync(PW), "Playwright (for capture)", `Run: node ${join(dirname(fileURLToPath(import.meta.url)), "capture.mjs")} setup (needs internet, once)`);
  const chrome = process.platform === "darwin" ? existsSync("/Applications/Google Chrome.app") : has("google-chrome") || has("chrome");
  capture(chrome, "Google Chrome (for capture)", "capture downloads Chromium on first use instead (about 150 MB). Google sign-in can refuse that browser.");
  if (existsSync(brandPath)) {
    const { problems } = loadBrand();
    ok(problems.length === 0, `brand pack ${brandPath}`, problems.join("\n    → "));
  } else lines.push(`! no brand pack yet (${brandPath})\n    → Normal on a new project: step 1 (Theme) creates it.`);
  console.log(lines.join("\n"));
  if (lines.some((l) => l.startsWith("✗"))) process.exit(1);
}

// ── tts ───────────────────────────────────────────────────────────────────────
async function tts() {
  if (!demoDir) die("usage: demo.mjs tts <demoDir>");
  const { brand, problems } = loadBrand();
  if (problems.length) die(problems.join("\n  "));
  const { scenes } = readJson(join(demoDir, "demo.json"));
  const { errors, warnings } = checkSay(scenes, brand);
  warnings.forEach((w) => console.error(`! ${w}`)); // stderr: --list prints JSON on stdout
  if (errors.length) die(errors.join("\n  "));
  if (flags.has("--dry-run")) return console.log(`✓ script checks passed (${warnings.length} warning(s))`);
  requireApproval(readJson(join(demoDir, "demo.json")));

  const v = { stability: 0.5, similarityBoost: 0.75, speed: 1, seed: 42, ...brand.voice };
  mkdirSync(join(demoDir, "audio"), { recursive: true });
  // The connector path: Claude voices these lines with the ElevenLabs connector and saves each one as `file`.
  if (flags.has("--list")) {
    const todo = scenes.flatMap((s, i) => {
      const file = s.say && join(demoDir, audioFile(i, s.say, v));
      return file && (flags.has("--force") || !existsSync(file)) ? [{ scene: i + 1, file, say: s.say, voiceId: v.voiceId, model: v.model }] : [];
    });
    return console.log(JSON.stringify(todo, null, 2));
  }
  const key = apiKey();
  if (!key) die("No ElevenLabs API key. Connect the ElevenLabs connector in Claude, or save the key (SKILL.md step 5).");
  for (const [i, s] of scenes.entries()) {
    if (!s.say) continue;
    const out = join(demoDir, audioFile(i, s.say, v));
    if (existsSync(out) && !flags.has("--force")) {
      console.log(`· scene ${i + 1}: unchanged, kept ${out}`);
      continue;
    }
    const body = {
      text: s.say,
      model_id: v.model,
      seed: v.seed,
      voice_settings: { stability: v.stability, similarity_boost: v.similarityBoost, style: 0, use_speaker_boost: true, speed: v.speed },
    };
    // Neighbour text keeps the prosody continuous across scenes. eleven_v3 does not accept it.
    if (v.model !== "eleven_v3") {
      const prev = scenes.slice(0, i).reverse().find((x) => x.say);
      const next = scenes.slice(i + 1).find((x) => x.say);
      if (prev) body.previous_text = prev.say;
      if (next) body.next_text = next.say;
    }
    // with-timestamps: the same audio, plus the start time of each character. build uses it to land a
    // zoom or a highlight on a word (`cues`, `word`). It is saved next to the line as .json.
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${v.voiceId}/with-timestamps?output_format=mp3_44100_128`, {
      method: "POST",
      headers: { "xi-api-key": key, "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) die(`scene ${i + 1}: ElevenLabs ${res.status} ${await res.text()}`);
    const { audio_base64, alignment } = await res.json();
    writeFileSync(out, Buffer.from(audio_base64, "base64"));
    if (alignment) writeFileSync(out.replace(/\.mp3$/, ".json"), JSON.stringify(alignment) + "\n");
    console.log(`✓ scene ${i + 1}: ${out} (${probe(out).toFixed(1)}s)`);
  }
}

// ── build ─────────────────────────────────────────────────────────────────────
function mediaTag(id, src, dur) {
  if (/\.(mp4|mov|webm|m4v)$/i.test(src))
    return `<video id="${id}-video" class="clip ${id}-media" src="${esc(src)}" data-start="0" data-duration="${dur}" data-track-index="1" muted playsinline></video>`;
  return `<img id="${id}-img" class="${id}-media" src="${esc(src)}" alt="" />`;
}

// The beat frame. `bleed` (the default): the product runs off the right and bottom edges, cropped
// to its top-left, the way a product shot sits on a launch page. `card`: the whole screen fitted
// inside a floating card. `focus` and `mask` are in the media's own pixels (a 1920×1080 capture:
// 0–1920, 0–1080), so build needs the media size. Must match .frame-* in template/compositions/beat.html.
const FRAMES = { bleed: { left: 140, top: 250, w: 1780, h: 830 }, card: { left: 302, top: 180, w: 1316, h: 740 } };
// The card's entrance and push-in, as literal values: the lint reads the template, not a branch.
const CARD_MOVE = {
  bleed: { CARD_FROM: "{ y: 40, filter: 'brightness(0.6)' }", CARD_TO: "{ y: 0, filter: 'brightness(1)' }", PUSH: 1.02 },
  card: { CARD_FROM: "{ scale: 0.955, filter: 'brightness(0.6)' }", CARD_TO: "{ scale: 1, filter: 'brightness(1)' }", PUSH: 1.025 },
};
const MAX_ZOOM = 3; // for 1920-wide media: more than 3× shows soft pixels. A 2× still (3840) allows 6×.
function camera(id, s, src, dur, at, frame, clock, warn) {
  const CARD = FRAMES[frame];
  const [mw, mh] = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", src])
    .toString().trim().split(",").map(Number);
  // bleed covers the frame from the top-left corner; card fits the whole media, centred.
  const k = frame === "bleed" ? Math.max(CARD.w / mw, CARD.h / mh) : Math.min(CARD.w / mw, CARD.h / mh);
  const box = frame === "bleed" ? { w: mw * k, h: mh * k, x: 0, y: 0 } : { w: mw * k, h: mh * k, x: (CARD.w - mw * k) / 2, y: (CARD.h - mh * k) / 2 };
  // A keyframe or a highlight with `word` lands on that word of the narration.
  const onWord = (f, kind) => (f.word == null ? f : { ...f, [kind === "focus" ? "at" : "from"]: Math.max(0, Number((clock(f.word, at) - (kind === "focus" ? 1 : 0.3)).toFixed(2))) });
  const rect = (r, what) => {
    if (![r.x, r.y, r.w, r.h].every(Number.isFinite) || r.w <= 0 || r.h <= 0 || r.x < 0 || r.y < 0 || r.x + r.w > mw || r.y + r.h > mh)
      die(`${at}: ${what} ${JSON.stringify(r)} is not inside the ${mw}×${mh} media`);
  };
  // One axis of a camera move: centre the region, then keep the media edges outside the card.
  const axis = (pos, size, z, boxPos, boxSize, cardSize) => {
    const span = z * boxSize;
    if (span <= cardSize) return (cardSize - span) / 2 - boxPos;
    const t = cardSize / 2 - boxPos - z * (pos + size / 2) * k;
    return Math.min(-boxPos, Math.max(cardSize - span - boxPos, t));
  };
  const keys = [s.focus ?? []].flat().map((f) => onWord(Array.isArray(s.focus) ? f : { at: 1, ...f }, "focus")); // one object: push in at 1 s
  let last = -1;
  const CAM = keys.map((f) => {
    if (!(f.at >= 0 && f.at < dur)) die(`${at}: focus.at ${f.at} is outside the scene (0–${dur}s)`);
    if (f.at <= last) die(`${at}: focus keyframes must be in time order, each at least 1 s apart`);
    last = f.at + 0.99;
    if (f.x == null) return { at: f.at, x: 0, y: 0, scale: 1 }; // a keyframe with no region: back to the full frame
    rect(f, "focus");
    const z = Math.min(MAX_ZOOM * Math.max(1, mw / 1920), CARD.w / (f.w * k), CARD.h / (f.h * k));
    const r = (n) => Number(n.toFixed(1));
    return { at: f.at, x: r(axis(f.x, f.w, z, box.x, box.w, CARD.w)), y: r(axis(f.y, f.h, z, box.y, box.h, CARD.h)), scale: Number(z.toFixed(3)) };
  });
  const px = (n) => `${Number(n.toFixed(2))}px`;
  // Masks and highlights: boxes on the camera, each shown from `from` to `to` seconds in the scene.
  const boxes = (kind, list = []) => list.map((raw, n) => {
    const m = onWord(raw, kind);
    rect(m, kind);
    // bleed crops the bottom (and the right of a wide media): a highlight there shows only after a zoom.
    if (kind === "highlight" && !keys.length && (m.y + m.h > CARD.h / k + 1 || m.x + m.w > CARD.w / k + 1))
      warn(`${at}: highlight ${n + 1} is below or right of the visible part (${Math.round(CARD.w / k)}×${Math.round(CARD.h / k)} px of the media). Add a focus, or "frame": "card".`);
    const from = m.from ?? 0, to = m.to ?? dur;
    if (!(from >= 0 && to > from)) die(`${at}: ${kind} ${n + 1} needs 0 ≤ from < to (seconds in the scene)`);
    return { id: `${id}-${kind}-${n}`, from, to, style: `left:${px(m.x * k)};top:${px(m.y * k)};width:${px(m.w * k)};height:${px(m.h * k)}` };
  });
  const MASKS = boxes("mask", s.mask);
  const SPOTS = boxes("highlight", s.highlight);
  const LIFTS = boxes("lift", s.lift).map((m, n) => ({ ...m, src: s.lift[n].src }));
  const divs = (list, cls) => list.map((m) => `<div id="${m.id}" class="${id}-${cls}" style="${m.style}"></div>`).join("");
  const imgs = LIFTS.map((m) => `<img id="${m.id}" class="${id}-lift" src="${esc(m.src)}" alt="" style="${m.style}" />`).join("");
  const times = (list) => JSON.stringify(list.map(({ id, from, to }) => ({ id, from, to })));
  return {
    cam: {
      style: `left:${px(box.x)};top:${px(box.y)};width:${px(box.w)};height:${px(box.h)}`,
      masks: divs(SPOTS, "spot") + imgs + divs(MASKS, "mask"), // masks on top: a highlight or a lift never uncovers a mask
    },
    CAM: JSON.stringify(CAM),
    MASKS: times(MASKS),
    SPOTS: times(SPOTS),
    LIFTS: times(LIFTS),
    lifts: LIFTS.length,
  };
}

// A recording made by capture.mjs has <media>.clicks.json: where and when the cursor arrived at
// each element. A beat with no `focus` and no `highlight` then gets them from that log: the camera
// pushes to each element as the cursor arrives, the element is lit, and the camera goes back to the
// full screen between clicks that are far apart. `"auto": false` on the beat turns this off.
const AUTO = { minW: 900, lead: 1.1, lit: 1.8, lift: 2.6, drift: 0.7, late: 0.3 }; // region width ≥ 900 px of 1920 (about 2× zoom); seconds
// `cues` on the beat: one word of its `say` for each recorded click or hover, in order. The zoom and
// the highlight then land on the word, not on the cursor, and build reports how far each click is
// from its word, so the recording can be timed to the voice (SKILL.md step 6).
// The clip keeps its own time. So a cue may move the effects only a little: at most `drift` s before
// the cursor arrives (the screen is ready, the cursor is on its way) and `late` s after it (a click can
// change the page). Further away, the effects stay on the recorded time: never a zoom or a lift on a
// screen that is not there yet.
function autoCamera(s, src, dur, clock, at) {
  const log = src.replace(/\.[^.]+$/, ".clicks.json");
  if (s.auto === false || s.focus || s.highlight || !existsSync(log)) return {};
  const { size: [mw, mh], events } = readJson(log);
  const drift = [];
  const ev = events.map((e, n) => {
    const cue = s.cues?.[n];
    if (cue == null) return e;
    const t = clock(cue, at);
    if (e.t - t <= AUTO.drift && t - e.t <= AUTO.late) return { ...e, t };
    drift.push(`${at}: ${e.kind} ${n + 1} (${e.sel}) is ${Math.abs(e.t - t).toFixed(1)} s ${e.t > t ? "after" : "before"} the word "${cue}". Its zoom${e.lift ? ", highlight and lift" : " and highlight"} stay at ${e.t.toFixed(1)} s, when the clip shows it. To put them on the word, change the wait before it by ${Math.round((t - e.t) * 1000)} ms and record again.`);
    return e;
  }).filter((e) => e.t > 0.3 && e.t < dur - 0.5);
  // Hold: the last element needs a second of calm after it lands, before the scene leaves.
  const end = ev.at(-1);
  if (end && end.t + (end.lift ? AUTO.lift : 1) > dur) drift.push(`${at}: the last ${end.kind} (${end.sel}) is ${(dur - end.t).toFixed(1)} s before the scene ends. Give it at least ${end.lift ? AUTO.lift : 1} s: a longer say, a longer clip, or an earlier step.`);
  if (s.cues && s.cues.length !== events.length) drift.push(`${at}: ${s.cues.length} cue(s) for ${ev.length} recorded click(s). Give one word for each click.`);
  const focus = [], highlight = [], lift = [];
  const lit = (e) => (e.lift ? AUTO.lift : AUTO.lit); // a lifted element stays up longer: rise, hold, return
  let last = -Infinity;
  ev.forEach((e, n) => {
    const at = Math.max(0, e.t - AUTO.lead); // the camera arrives with the cursor (or the cue word)
    if (at < last + 1) return; // keyframes at least 1 s apart: this click shares the previous view
    const w = Math.min(mw, Math.max(AUTO.minW, e.w * 3)), h = Math.min(mh, w * 9 / 16);
    const x = Math.min(mw - w, Math.max(0, e.x + e.w / 2 - w / 2)), y = Math.min(mh - h, Math.max(0, e.y + e.h / 2 - h / 2));
    focus.push({ at: Number(at.toFixed(2)), x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });
    last = at;
    const next = ev[n + 1]?.t ?? dur;
    // A long gap: back to the full screen, still 1 s before the camera leaves for the next click.
    if (next - AUTO.lead >= e.t + lit(e) + 1 && e.t + lit(e) + 1 < dur) {
      focus.push({ at: Number((e.t + lit(e)).toFixed(2)) });
      last = e.t + lit(e);
    }
  });
  ev.forEach((e, n) => {
    const p = 10; // the lit box is a little larger than the element
    const x = Math.max(0, e.x - p), y = Math.max(0, e.y - p);
    const box = { x, y, w: Math.min(mw - x, e.w + 2 * p), h: Math.min(mh - y, e.h + 2 * p),
      // One lit box at a time: a box ends before the next one starts.
      from: Number(Math.max(0, e.t - 0.3).toFixed(2)), to: Number(Math.min(dur, e.t + lit(e), (ev[n + 1]?.t ?? dur) - 0.35).toFixed(2)) };
    highlight.push(box);
    // The lift: the element's own 2× cut-out, at its exact place, under the same timing.
    if (e.lift) lift.push({ src: join(dirname(s.media), e.lift), x: e.x, y: e.y, w: e.w, h: e.h, from: box.from, to: box.to });
  });
  return focus.length ? { focus, highlight, lift, count: ev.length, drift } : { drift };
}

// Volume points for the music bed: fade in 1 s, duck under each narration line (0.3 s attack,
// 0.5 s release), fade out over the last 2 s. Breakpoints of a min() of linear ramps, so linear between.
// ponytail: a volume duck, not a spectral carve (hyperframes-audio carve.mjs) — add the carve if the voice fights the bed.
function bedEnvelope(lines, total) {
  // Lines less than 1 s apart count as one: a swell in a short gap sounds like pumping.
  const spoken = [];
  for (const [s, e] of lines) {
    const last = spoken.at(-1);
    if (last && s - last[1] < 1) last[1] = e;
    else spoken.push([s, e]);
  }
  const ramp = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  const level = (t) => {
    let v = BED * Math.min(ramp(t, 0, 1), 1 - ramp(t, total - 2, total));
    for (const [s, e] of spoken) {
      const duck = t < s ? ramp(t, s - 0.3, s) : 1 - ramp(t, e, e + 0.5);
      v = Math.min(v, BED - (BED - DUCK) * duck);
    }
    return v;
  };
  const times = [0, 1, total - 2, total, ...spoken.flatMap(([s, e]) => [s - 0.3, s, e, e + 0.5])];
  return [...new Set(times.map((t) => Number(Math.min(total, Math.max(0, t)).toFixed(2))))]
    .sort((a, b) => a - b)
    .map((t) => ({ t, v: Number(level(t).toFixed(3)) }));
}

function build() {
  if (!demoDir) die("usage: demo.mjs build <demoDir>");
  const { brand, problems } = loadBrand();
  if (problems.length) die(problems.join("\n  "));
  const demo = readJson(join(demoDir, "demo.json"));
  const { scenes } = demo;
  if (!Array.isArray(scenes) || scenes.length === 0) die("demo.json: scenes is empty");
  requireApproval(demo);
  const v = { stability: 0.5, similarityBoost: 0.75, speed: 1, seed: 42, ...brand.voice };
  const c = { stageHi: brand.colors.stage, stageLo: brand.colors.stage, accentText: brand.colors.accent, card: "#ffffff", ...brand.colors };

  // Fresh generated output on every build; demo.json, media/ and audio/ are never touched.
  for (const d of ["compositions", "voice", "sfx"]) {
    rmSync(join(demoDir, d), { recursive: true, force: true });
    mkdirSync(join(demoDir, d), { recursive: true });
  }
  for (const f of brandFiles(brand)) cpSync(join(dirname(brandPath), f), join(demoDir, f));
  const tpl = (name) => readFileSync(join(TEMPLATE, "compositions", name), "utf8");
  const fill = (html, tokens) => html.replace(/\{\{(\w+)\}\}/g, (_, k) => (k in tokens ? tokens[k] : die(`template token {{${k}}} has no value`)));

  const m = Object.fromEntries(Object.entries(MOTION).map(([k, d]) => [k, { ...d, ...brand.motion?.[k] }]));
  const situation = (s, i) => (s.type === "card" && i === 0 ? "title" : s.type);
  const enters = scenes.map((s, i) => s.enter ?? m.enter[situation(s, i)] ?? "rise");
  const seams = scenes.map((s, i) => (i === 0 ? "cut" : s.transition ?? m.transition[s.type] ?? "cut"));
  enters.forEach((e, i) => ENTERS.includes(e) || die(`scene ${i + 1}: enter "${e}" is not one of ${ENTERS.join(", ")}`));
  seams.forEach((e, i) => e in SEAMS || die(`scene ${i + 1}: transition "${e}" is not one of ${Object.keys(SEAMS).join(", ")}`));

  const sfxOn = (demo.sfx ?? brand.sfx) !== false;
  const clickAt = []; // seconds in the video of each recorded click
  let t = 0, firstLit, firstBeat, lifted = 0; // firstLit, firstBeat: candidates for the poster frame
  const hosts = [], audio = [], warnings = [], spoken = [], cuts = [], notes = [];
  if (seams.filter((x) => x === "curtain").length > 1) warnings.push("more than one curtain transition. The library allows one in each video.");
  let z = 100;
  for (const [i, s] of scenes.entries()) {
    const id = `s${String(i + 1).padStart(2, "0")}`;
    const at = `scene ${i + 1}`;
    let dur = s.hold ?? 4;
    let clock = (word) => die(`${at}: "${word}" needs a say on this scene, to find the word in`);
    if (s.say) {
      const raw = audioFile(i, s.say, v);
      if (existsSync(join(demoDir, raw))) {
        // TTS output is about -24 LUFS and varies by line; one loudness for every line.
        const a = `voice/${id}.mp3`;
        execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", join(demoDir, raw), "-af", `loudnorm=I=${VOICE_LUFS}:TP=-1.5:LRA=11`, "-ar", "44100", "-b:a", "128k", join(demoDir, a)]);
        const len = probe(join(demoDir, a));
        clock = wordClock(s.say, join(demoDir, raw.replace(/\.mp3$/, ".json")), len);
        dur = Math.max(dur, len + PAD);
        spoken.push([t, t + len]);
        audio.push(`<audio id="${id}-vo" src="${a}" data-start="${t.toFixed(2)}" data-duration="${len.toFixed(2)}" data-track-index="10" data-volume="1" data-audio-group="voiceover"></audio>`);
      } else {
        // No voice yet: estimate from the word count so the draft preview has real pacing.
        dur = Math.max(dur, s.say.split(/\s+/).length / 2.6 + PAD);
        clock = wordClock(s.say, null, dur - PAD);
        warnings.push(`${at}: no audio for the current say, timing is estimated. Run tts.`);
      }
    }
    dur = Number(dur.toFixed(2));
    // The scene stays alive under (or over) the next one for the length of the next seam.
    const live = Number((dur + (SEAMS[seams[i + 1]] ?? 0)).toFixed(2));
    if (i > 0) z += ON_TOP_OUT.includes(seams[i]) ? -1 : 1;

    let html;
    if (s.type === "beat") {
      if (!s.media) die(`${at}: a recording scene needs media`);
      const src = join(demoDir, s.media);
      if (!existsSync(src)) die(`${at}: media not found: ${s.media}`);
      if (/\.(mp4|mov|webm|m4v)$/i.test(s.media) && probe(src) < live - 0.1)
        warnings.push(`${at}: the recording is ${probe(src).toFixed(1)}s, the scene is ${live}s. The last part shows the card with no video.`);
      const frame = s.frame ?? brand.frame ?? "bleed";
      if (!(frame in FRAMES)) die(`${at}: frame "${frame}" is not one of ${Object.keys(FRAMES).join(", ")}`);
      // A still has no motion of its own: with no zoom it is a dead screen under the voice.
      if (/\.(png|jpe?g)$/i.test(s.media) && !s.focus && live > 4)
        warnings.push(`${at}: a still with no "focus" shows nothing new for ${live}s (only a slow push-in). Add a "focus" on the feature, with "word" on the word that names it, or record a clip.`);
      const { drift = [], ...auto } = autoCamera(s, src, live, clock, at);
      warnings.push(...drift);
      if (auto.count) notes.push(`${at}: zoom and highlight from ${auto.count} recorded click(s)${s.cues ? ", on the cue words" : ""}. Set "auto": false to turn it off.`);
      const { cam, CAM, MASKS, SPOTS, LIFTS, lifts } = camera(id, { ...s, ...auto }, src, live, at, frame, clock, (w) => warnings.push(w));
      lifted += lifts;
      // The click sound follows the recording, not the camera: capture presses 0.15 s after the cursor arrives.
      const log = src.replace(/\.[^.]+$/, ".clicks.json");
      if (existsSync(log)) for (const e of readJson(log).events) if (/click|type/.test(e.kind) && e.t + 0.15 < live) clickAt.push(t + e.t + 0.15);
      firstLit ??= (() => { const h = JSON.parse(SPOTS)[0]; return h && t + h.from + 0.8; })();
      firstBeat ??= t + Math.min(live / 2, 3);
      html = fill(tpl("beat.html"), {
        ID: id, DUR: live, FRAME: frame, ...CARD_MOVE[frame], LABEL: esc(s.label ?? ""), TITLE: esc(s.title), CAPTION: esc(s.caption ?? ""),
        MEDIA: `<div id="${id}-cam" class="${id}-cam" style="${cam.style}" data-layout-allow-overflow>${mediaTag(id, s.media, live)}${cam.masks}</div>`, CAM, MASKS, SPOTS, LIFTS,
      });
    } else if (s.type === "card" || s.type === "outro" || s.type === "figure") {
      const outro = s.type === "outro", figure = s.type === "figure";
      if (figure && !s.value) die(`${at}: a figure needs value, the number as it shows (e.g. "184.320,00 €")`);
      const headline = figure ? s.value : s.headline ?? (outro ? brand.outro.headline : "");
      if (enters[i] === "words" && headline.split(/\s+/).length > 5) warnings.push(`${at}: enter "words" is for five words or fewer.`);
      html = fill(tpl("card.html"), {
        ID: id,
        DUR: live,
        ENTER: enters[i],
        CLASSES: `enter-${enters[i]}${figure ? " is-figure" : ""}`,
        LOGO: outro ? `<img id="${id}-logo" class="${id}-logo" src="${esc(brand.logo)}" alt="${esc(brand.name)}" />` : "",
        KICKER: esc(s.kicker ?? ""),
        // "words" animates each word; a word is an inline block so it can move.
        HEADLINE: enters[i] === "words" ? headline.split(/\s+/).map((w) => `<span class="${id}-word">${esc(w)}</span>`).join(" ") : esc(headline),
        SUB: esc(figure ? s.label ?? "" : s.sub ?? (outro ? brand.outro.sub ?? "" : "")),
      });
    } else die(`${at}: unknown type "${s.type}" (card | beat | figure | outro)`);

    writeFileSync(join(demoDir, "compositions", `${id}.html`), html);
    // Overlapping scenes alternate tracks; z-index (not the track) sets which one is on top.
    hosts.push(`<div id="${id}" style="position:absolute;inset:0;z-index:${z}" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${t.toFixed(2)}" data-duration="${live}" data-track-index="${1 + (i % 2)}" data-width="1920" data-height="1080"></div>`);
    if (i > 0) cuts.push(`SEAM[${JSON.stringify(seams[i])}](${t.toFixed(2)}, "#s${String(i).padStart(2, "0")}", "#${id}")`);
    t += dur;
  }
  const total = Number(t.toFixed(2));
  const starts = hosts.map((h) => Number(h.match(/data-start="([\d.]+)"/)[1]));
  const durs = hosts.map((h) => Number(h.match(/data-duration="([\d.]+)"/)[1]));

  // The poster: the one frame most people see (a newsletter thumbnail, a link preview). It shows the
  // result, never a frame between two scenes: `poster` in demo.json, else the first lit highlight,
  // else the middle of the first beat.
  const p = demo.poster;
  if (p && !(scenes[p.scene - 1] && p.at >= 0 && p.at < durs[p.scene - 1])) die(`poster: { "scene": N, "at": seconds } must name a scene and a second inside it`);
  const poster = Number((p ? starts[p.scene - 1] + p.at : firstLit ?? firstBeat ?? Math.min(2, total / 2)).toFixed(2));

  if (sfxOn) {
    const whooshAt = seams.flatMap((x, i) => (MOVING.includes(x) ? [starts[i] - (x === "curtain" ? 17 / 30 : 0) - 0.12] : []));
    for (const [name, list, track] of [["click", clickAt, 12], ["whoosh", whooshAt, 13]]) {
      if (!list.length) continue;
      const file = `sfx/${name}.wav`;
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", SFX[name].src, "-c:a", "pcm_s16le", join(demoDir, file)]);
      const len = probe(join(demoDir, file)).toFixed(2);
      list.forEach((at, n) => audio.push(`<audio id="sfx-${name}-${n}" src="${file}" data-start="${Math.max(0, at).toFixed(2)}" data-duration="${len}" data-track-index="${track}" data-volume="${SFX[name].vol}" data-audio-group="sfx"></audio>`));
    }
    if (clickAt.length || whooshAt.length) notes.push(`sound: ${clickAt.length} click(s), ${whooshAt.length} whoosh(es). Set "sfx": false to turn them off.`);
  }

  // Music: a file in the demo folder (the skill downloads it from the music library), or none.
  const src = demo.music;
  if (src) {
    if (!existsSync(join(demoDir, src))) die(`music not found: ${src}. Download it again, or set "music": null.`);
    if (probe(join(demoDir, src)) < total) warnings.push(`music ${src} is ${probe(join(demoDir, src)).toFixed(1)}s, the video is ${total}s. The end has no music.`);
    const lane = { version: 1, lanes: [{ target: "volume", points: bedEnvelope(spoken, total) }] };
    audio.push(`<audio id="bgm" src="${esc(src)}" data-start="0" data-duration="${total}" data-track-index="11" data-volume="1" data-audio-group="music" data-automation="${esc(JSON.stringify(lane))}"></audio>`);
  }

  const FORMAT = { woff2: "woff2", woff: "woff", otf: "opentype", ttf: "truetype" };
  const font = (f) => `@font-face { font-family: "${f.family}"; src: url("${f.file}") format("${FORMAT[f.file.split(".").pop().toLowerCase()] ?? "woff2"}"); font-weight: 100 900; font-display: block; }`;
  writeFileSync(join(demoDir, "index.html"), `<!doctype html>
<html lang="${esc(brand.language)}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <!-- GENERATED by demo.mjs build from brand.json + demo.json. Edit those and rebuild. -->
    <!-- poster: ${poster} -->
    <script src="${GSAP}"></script>
    <style>
      ${font(brand.fonts.display)}
      ${font(brand.fonts.body)}
      :root {
        --stage: ${c.stage}; --stage-hi: ${c.stageHi}; --stage-lo: ${c.stageLo};
        --ink: ${c.ink}; --ink-muted: ${c.inkMuted};
        --accent: ${c.accent}; --accent-ink: ${c.accentInk}; --accent-text: ${c.accentText}; --card: ${c.card};
        --font-display: "${brand.fonts.display.family}"; --font-display-weight: ${brand.fonts.display.weight ?? 600};
        --font-body: "${brand.fonts.body.family}"; --font-body-weight: ${brand.fonts.body.weight ?? 500};
        --spot-dim: ${Number(m.highlight.dim)};
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 100%; height: 100%; overflow: hidden; background: ${c.stageLo}; }
      #root { position: relative; width: 100%; height: 100%; background: ${c.stageLo}; overflow: hidden; }
      /* Seam overlays (template/seams.js), parked outside the frame until a seam moves them. */
      #seam-bar { position: absolute; top: 0; left: -40px; width: 38px; height: 100%; background: var(--accent); z-index: 1000; }
      #seam-curtain-l, #seam-curtain-r { position: absolute; top: 0; width: 50.2%; height: 100%; background: var(--stage-lo); z-index: 1000; }
      #seam-curtain-l { left: -50.2%; }
      #seam-curtain-r { right: -50.2%; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="1920" data-height="1080">
      ${hosts.join("\n      ")}
      ${seams.includes("sweep") ? '<div id="seam-bar" data-layout-allow-overflow></div>' : ""}
      ${seams.includes("curtain") ? '<div id="seam-curtain-l" data-layout-allow-overflow></div><div id="seam-curtain-r" data-layout-allow-overflow></div>' : ""}
      ${audio.join("\n      ")}
    </div>
    <script>
${readFileSync(join(TEMPLATE, "seams.js"), "utf8").replace(/^/gm, "      ")}
      ${cuts.join("\n      ")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);

  const slug = demoDir.split("/").pop();
  writeFileSync(join(demoDir, "meta.json"), JSON.stringify({ id: slug, name: slug }, null, 2) + "\n");
  writeFileSync(join(demoDir, "package.json"), JSON.stringify({
    name: slug, private: true, type: "module",
    scripts: { dev: `npx --yes ${HYPERFRAMES} preview`, check: `npx --yes ${HYPERFRAMES} check`, render: `npx --yes ${HYPERFRAMES} render` },
  }, null, 2) + "\n");

  // 17: only demo.json, media/ and audio/ belong in git.
  writeFileSync(join(demoDir, ".gitignore"), ["compositions/", "voice/", "sfx/", "brand/", "index.html", "meta.json", "package.json",
    ".hyperframes/", "snapshots/", ".thumbnails/", ".waveform-cache/", "renders/", "*.mp4", "!media/*.mp4", ""].join("\n"));

  if (lifted > 1) warnings.push(`${lifted} lifts in this video. A lift is the hero effect: use it once, on the most important feature (remove "lift" from the other steps).`);
  warnings.forEach((w) => console.log(`! ${w}`));
  notes.forEach((n) => console.log(`· ${n}`));
  console.log(`✓ built ${scenes.length} scenes, ${total}s → ${join(demoDir, "index.html")}`);
  scenes.forEach((s, i) => console.log(`  scene ${i + 1}  ${starts[i].toFixed(2)}–${(starts[i + 1] ?? total).toFixed(2)}s  ${KIND[s.type] ?? s.type}  ${s.title ?? s.headline ?? s.value ?? ""}  (${i ? `${seams[i]} → ` : ""}${s.type === "beat" ? "settle" : enters[i]})`));
  // The self-check frames (SKILL.md step 6): two in each scene (at 30 % and 70 %: the same frame twice
  // is a dead scene), then each seam a little before, in the middle and a little after, then the first and last seconds.
  const own = starts.map((x, i) => (starts[i + 1] ?? total) - x);
  console.log(`  snapshot --at ${starts.flatMap((x, i) => [x + own[i] * 0.3, x + own[i] * 0.7]).map((x) => x.toFixed(1)).join(",")}`);
  const seamAt = starts.slice(1).flatMap((x, n) => [x - 0.3, x + (SEAMS[seams[n + 1]] ?? 0) / 2, x + (SEAMS[seams[n + 1]] ?? 0) + 0.3]);
  console.log(`  seams    --at ${[0.5, 1.5, ...seamAt, total - 2, total - 0.5].map((x) => Math.min(total - 0.05, Math.max(0, x))).sort((a, b) => a - b).map((x) => x.toFixed(2)).filter((x, n, a) => x !== a[n - 1]).join(",")}`);
  console.log(`  poster   ${poster}s (demo.mjs poster)`);
  if (total > 120) console.log(`! the video is ${total}s. The target is 60–120s. Cut a recording scene or shorten the script.`);
  if (total < 60) console.log(`! the video is ${total}s, under the 60–120s target. Acceptable when there is no more real content to show (SKILL.md step 3).`);
}

// ── theme ─────────────────────────────────────────────────────────────────────
// <dsDir> holds a Claude Design system as downloaded by Artifact `read`: project/design-system.json,
// project/tokens.json, project/assets/video/video.json, project/fonts/*, and the logo upload,
// either at project/<logo> or as <blob id>.<ext> anywhere under <dsDir>.
function theme() {
  if (!demoDir) die("usage: demo.mjs theme <dsDir> [--out demo-video] [--url <design system url>]");
  const p = (f) => join(demoDir, "project", f);
  const index = readJson(p("design-system.json"));
  const tokens = readJson(p("tokens.json"));
  if (!existsSync(p("assets/video/video.json"))) die(`${index.title} has no assets/video/video.json, so it is not a video theme`);
  const video = readJson(p("assets/video/video.json"));

  const first = tokens.color?.themes?.[0]?.id;
  const values = Object.fromEntries((tokens.color?.tokens ?? []).map((t) => [t.name, typeof t.value === "string" ? t.value : t.value[first]]));
  const color = (v, seen = []) => {
    const m = /^\{(.+)\}$/.exec(v);
    if (!m) return v;
    if (seen.includes(m[1]) || !(m[1] in values)) die(`video.json: color ${v} is not a token in tokens.json`);
    return color(values[m[1]], [...seen, m[1]]);
  };

  const out = resolve(opt("out") ?? "demo-video");
  const brandOut = join(out, "brand.json");
  rmSync(join(out, "brand"), { recursive: true, force: true });
  mkdirSync(join(out, "brand", "assets"), { recursive: true });
  if (existsSync(p("fonts"))) cpSync(p("fonts"), join(out, "brand", "fonts"), { recursive: true });

  const [group, ...rest] = video.logo.replace(/^assets\//, "").split("/");
  const blob = index.assetGroups?.[group]?.files?.[rest.join("/")]?.blob;
  const find = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? find(join(dir, e.name)) : e.name.startsWith(`${blob}.`) ? [join(dir, e.name)] : []);
  const logo = existsSync(p(video.logo)) ? p(video.logo) : blob && find(demoDir)[0];
  if (!logo) die(`logo not downloaded: ${video.logo}${blob ? ` (upload ${blob})` : ""}`);
  cpSync(logo, join(out, "brand", "assets", basename(video.logo)));

  // A placeholder voice in the design system must not erase a voice the project already chose.
  const old = existsSync(brandOut) ? readJson(brandOut) : {};
  const voice = { ...video.voice };
  if (/^REPLACE/.test(voice.voiceId ?? "") && old.voice?.voiceId && !/^REPLACE/.test(old.voice.voiceId)) voice.voiceId = old.voice.voiceId;

  const font = (f) => ({ ...f, file: `brand/${f.file}` });
  const brand = {
    ...video,
    colors: Object.fromEntries(Object.entries(video.colors).map(([k, v]) => [k, color(v)])),
    fonts: { display: font(video.fonts.display), body: font(video.fonts.body) },
    logo: `brand/assets/${basename(video.logo)}`,
    voice,
    theme: { title: index.title, url: opt("url") ?? null },
  };
  for (const f of brandFiles(brand)) if (!existsSync(join(out, f))) die(`file not found after copy: ${f}`);
  const missing = REQUIRED.filter((k) => get(brand, k) == null || get(brand, k) === "");
  if (missing.length) die(`video.json: missing ${missing.join(", ")}`);
  writeFileSync(brandOut, JSON.stringify(brand, null, 2) + "\n");
  console.log(`✓ theme "${index.title}" → ${brandOut}`);
  if (/^REPLACE/.test(voice.voiceId)) console.log("! voice.voiceId is a placeholder. Set it in brand.json before the tts step.");
}

// ── poster ────────────────────────────────────────────────────────────────────
// The thumbnail: one frame of the built video, at the time build chose (index.html "poster").
function poster() {
  if (!demoDir) die("usage: demo.mjs poster <demoDir>");
  const html = join(demoDir, "index.html");
  const at = existsSync(html) && readFileSync(html, "utf8").match(/<!-- poster: ([\d.]+) -->/)?.[1];
  if (!at) die("no poster time in index.html. Run build first.");
  const dir = join(demoDir, ".hyperframes", "poster");
  rmSync(dir, { recursive: true, force: true });
  execFileSync("npx", ["--yes", HYPERFRAMES, "snapshot", demoDir, "--at", at, "--no-end", "--describe", "false", "-o", dir], { stdio: ["ignore", "ignore", "inherit"] });
  const png = readdirSync(dir, { recursive: true }).find((f) => String(f).endsWith(".png"));
  if (!png) die(`snapshot wrote no PNG in ${dir}`);
  cpSync(join(dir, png), join(demoDir, "poster.png"));
  console.log(`✓ poster at ${at}s → ${join(demoDir, "poster.png")}`);
}

// ── master ────────────────────────────────────────────────────────────────────
// The last step after render: the whole mix to −14 LUFS, true peak ≤ −1 dBTP (the level of
// YouTube, LinkedIn and most players), in two loudnorm passes. The video stream is copied.
// The agent cannot listen to the result, so it reports the measured numbers.
const MASTER = { I: -14, TP: -1, LRA: 11 };
function loudness(file) {
  const r = spawnSync("ffmpeg", ["-nostats", "-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"], { encoding: "utf8" });
  const sum = r.stderr.slice(r.stderr.lastIndexOf("Summary:")); // the per-frame lines above it have the same labels
  const num = (re) => Number(sum.match(re)?.[1]);
  return { I: num(/I:\s+(-?[\d.]+) LUFS\s*\n\s*Threshold/), LRA: num(/LRA:\s+(-?[\d.]+) LU/), TP: num(/Peak:\s+(-?[\d.]+|-inf) dBFS/) };
}
function master() {
  const file = demoDir;
  if (!file || !existsSync(file)) die("usage: demo.mjs master <rendered video.mp4>");
  const before = loudness(file);
  if (!Number.isFinite(before.I)) die(`${file}: no audio to measure`);
  const target = `I=${MASTER.I}:TP=${MASTER.TP}:LRA=${MASTER.LRA}`;
  const pass1 = spawnSync("ffmpeg", ["-nostats", "-i", file, "-af", `loudnorm=${target}:print_format=json`, "-f", "null", "-"], { encoding: "utf8" }).stderr;
  const m = JSON.parse(pass1.slice(pass1.lastIndexOf("{"), pass1.lastIndexOf("}") + 1));
  const out = file.replace(/(\.[^.]+)?$/, ".master.mp4");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", file, "-c:v", "copy",
    "-af", `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
    "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", out]);
  const after = loudness(out);
  const row = (x) => `${x.I.toFixed(1)} LUFS, true peak ${x.TP.toFixed(1)} dBTP, range ${x.LRA.toFixed(1)} LU`;
  console.log(`  before  ${row(before)}\n  after   ${row(after)}`);
  if (Math.abs(after.I - MASTER.I) > 1 || after.TP > MASTER.TP + 0.3) console.log(`! the master is off the target (${MASTER.I} LUFS, ≤ ${MASTER.TP} dBTP). Check the mix.`);
  console.log(`✓ mastered → ${out}`);
}

if (cmd === "doctor") doctor();
else if (cmd === "poster") poster();
else if (cmd === "master") master();
else if (cmd === "tts") await tts();
else if (cmd === "script") script();
else if (cmd === "build") build();
else if (cmd === "theme") theme();
else die("usage: demo.mjs doctor | script <demoDir> | tts <demoDir> | build <demoDir> | poster <demoDir> | master <video.mp4> | theme <dsDir>   (see the header of this file)");
