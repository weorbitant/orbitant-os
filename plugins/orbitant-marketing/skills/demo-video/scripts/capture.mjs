#!/usr/bin/env node
// capture.mjs — the agent records the product itself (SKILL.md step 4, "the agent records").
// Playwright is fetched by npm into a cache on first use; nothing to install by hand.
//
//   node capture.mjs setup                         install Playwright (once, needs internet)
//   node capture.mjs login  <demoDir>              open a real browser at capture.base; the person signs in.
//                                                  Run it in the background; the session is saved every 2 s
//   node capture.mjs login  <demoDir> --done       the person said "I have signed in": save and close the window
//   node capture.mjs look   <demoDir> <url> [--scroll N]
//                                                  a 1920×1080 PNG of the page with the saved session, for the agent
//                                                  to read (no browser pane: one Bash allow rule covers it)
//   node capture.mjs find   <demoDir> <url> "<text>"
//                                                  a selector for the element with that text, and for the card
//                                                  that holds it, with their boxes in page pixels
//   node capture.mjs record <demoDir> [--scene N] [--headed]
//                                                  record every beat with a `record` block into its `media`,
//                                                  and log each click to <media>.clicks.json (build zooms to it)
//
// demo.json:
//   "capture": { "base": "https://dev.example.com", "redact": { "names": { "Real Name": "Ana García" }, "email": "demo@example.com" } }
//   beat:      "record": { "url": "/dashboard", "waitFor": "text=Resumen", "steps": [ { "click": "text=Ver" }, { "wait": 1500 } ] }
//
// Steps: { "wait": ms } · { "click": sel } · { "hover": sel } · { "type": sel, "text": "…" } · { "press": "Enter" }
//        { "scroll": px } · { "goto": url } · { "waitFor": sel }. A selector is a Playwright selector:
//        CSS, `text=Guardar`, `role=button[name="Guardar"]`. `"lift": true` on a click, hover or type
//        step also saves a 2× cut-out of the element (<media>.lift-N.png) for the lift effect.
// A .png media is a still at 2× (3840×2160).
// The session lives in demo-video/.capture/ (git-ignored). Credentials never pass through this script.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const PLAYWRIGHT = "playwright@1.64.1";
const CACHE = join(homedir(), ".cache", "orbitant-demo-video", PLAYWRIGHT);
const VIEW = { width: 1920, height: 1080 };

const [cmd, ...rest] = process.argv.slice(2);
const flags = new Set(rest.filter((a) => a.startsWith("--")));
const opt = (name) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : undefined;
};
const demoDir = rest[0] && !rest[0].startsWith("--") ? resolve(rest[0]) : null;
const capDir = demoDir && join(demoDir, "..", "..", ".capture");
const SESSION = capDir && join(capDir, "session.json");

const die = (msg) => {
  console.error(`✗ ${msg}`);
  process.exit(1);
};
const readJson = (p) => {
  if (!existsSync(p)) die(`not found: ${p}`);
  return JSON.parse(readFileSync(p, "utf8"));
};

const DONE = capDir && join(capDir, "done");
const signedOut = (u) => /\/(log-?in|sign-?in)\b/i.test(new URL(u).pathname);

// ── playwright ────────────────────────────────────────────────────────────────
function setup() {
  const pkg = join(CACHE, "node_modules", "playwright");
  if (!existsSync(pkg)) {
    console.log(`… installing ${PLAYWRIGHT} into ${CACHE} (once)`);
    mkdirSync(CACHE, { recursive: true });
    execFileSync("npm", ["install", "--prefix", CACHE, "--no-audit", "--no-fund", "--loglevel", "error", PLAYWRIGHT],
      { stdio: "inherit", shell: process.platform === "win32" });
  }
  return pkg;
}

// The person's Google Chrome first: no download, and sign-in pages trust it more than a test browser.
async function launch(headless) {
  const pkg = setup();
  const { chromium } = await import(pathToFileURL(join(pkg, "index.mjs")).href);
  const o = { headless, ignoreDefaultArgs: ["--enable-automation"] };
  try {
    return await chromium.launch({ ...o, channel: "chrome" });
  } catch {
    try {
      return await chromium.launch(o);
    } catch {
      console.log("… no Google Chrome found, downloading Chromium (once)");
      execFileSync(process.execPath, [join(pkg, "cli.js"), "install", "chromium"], { stdio: "inherit" });
      return chromium.launch(o);
    }
  }
}

// ── page scripts (run inside the product page, never in its source) ──────────
// Personal data out of the DOM before the first paint: every email, and every listed name.
// ponytail: text nodes, inputs and common attributes only; text in canvas, images or a closed shadow root stays — use a beat `mask`.
function redact({ email, names }) {
  const EMAIL = /[\w.+-]+@[\w-]+(\.[\w-]+)+/g;
  const pairs = Object.entries(names);
  const fix = (s) => pairs.reduce((t, [a, b]) => t.split(a).join(b), s.replace(EMAIL, email));
  const ATTRS = ["title", "placeholder", "alt", "aria-label", "value"];
  const scrub = (root) => {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    for (let n = root; n; n = w.nextNode()) {
      if (n.nodeType === 3) {
        const v = fix(n.nodeValue);
        if (v !== n.nodeValue) n.nodeValue = v;
      } else if (n.nodeType === 1) {
        for (const a of ATTRS) {
          const v = n.getAttribute(a);
          if (v && fix(v) !== v) n.setAttribute(a, fix(v));
        }
        if (typeof n.value === "string" && n.value && fix(n.value) !== n.value) n.value = fix(n.value);
      }
    }
  };
  new MutationObserver((ms) => ms.forEach((m) => (m.type === "childList" ? m.addedNodes.forEach(scrub) : scrub(m.target))))
    .observe(document, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  // An input's value is a property, not a mutation: check the fields before every paint.
  const tick = () => {
    document.querySelectorAll("input, textarea").forEach(scrub);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// A recording has no system cursor: draw one that follows the mouse, and a ring on each click.
function cursor(accent) {
  if (window.top !== window) return;
  const add = () => {
    const css = document.createElement("style");
    css.textContent = `*{cursor:none!important} ::-webkit-scrollbar{display:none!important}
      #__demo-cursor{position:fixed;left:-5px;top:-3px;z-index:2147483647;pointer-events:none;transform:translate(-200px,-200px)}
      #__demo-cursor svg{display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))}
      .__demo-click{position:fixed;width:48px;height:48px;margin:-24px 0 0 -24px;border-radius:50%;border:3px solid ${accent};z-index:2147483646;pointer-events:none;animation:__demo-click .55s ease-out forwards}
      @keyframes __demo-click{from{transform:scale(.3);opacity:1}to{transform:scale(1.3);opacity:0}}`;
    const c = document.createElement("div");
    c.id = "__demo-cursor";
    c.innerHTML = '<svg width="32" height="32" viewBox="0 0 28 28"><path d="M5 3v19l5-4.5 3.5 7.5 3.5-1.5-3.4-7.5H20z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    document.documentElement.append(css, c);
    addEventListener("mousemove", (e) => (c.style.transform = `translate(${e.clientX}px,${e.clientY}px)`), true);
    addEventListener("mousedown", (e) => {
      const r = document.createElement("div");
      r.className = "__demo-click";
      r.style.left = `${e.clientX}px`;
      r.style.top = `${e.clientY}px`;
      document.documentElement.append(r);
      setTimeout(() => r.remove(), 600);
    }, true);
  };
  document.documentElement ? add() : document.addEventListener("DOMContentLoaded", add);
}

// ── login ─────────────────────────────────────────────────────────────────────
async function login() {
  const { capture } = readJson(join(demoDir, "demo.json"));
  if (!capture?.base) die('demo.json: set "capture": { "base": "<the product URL>" } first');
  mkdirSync(capDir, { recursive: true });
  writeFileSync(join(capDir, ".gitignore"), "*\n"); // the session is a signed-in cookie jar: never commit it
  const browser = await launch(false);
  const ctx = await browser.newContext({ viewport: null });
  const page = await ctx.newPage();
  rmSync(DONE, { force: true });
  await page.goto(capture.base).catch(() => {});
  console.log('▸ Sign in in the browser window. Then say "I have signed in": the agent runs login --done.');
  const save = () => ctx.storageState({ path: SESSION, indexedDB: true }).catch(() => {});
  // Saved every 2 s as well, so quitting the whole browser still keeps the last state.
  const timer = setInterval(save, 2000);
  // Ends on `login --done`, or when the person closes the window, or after 15 min.
  for (let s = 0; s < 900 && !existsSync(DONE) && ctx.pages().length && browser.isConnected(); s++) await new Promise((r) => setTimeout(r, 1000));
  clearInterval(timer);
  if (browser.isConnected()) {
    await save();
    await browser.close();
  }
  rmSync(DONE, { force: true });
  if (!existsSync(SESSION)) die("no session saved. Run login again and sign in.");
  // A signed-in session has a cookie or stored data for the product's host.
  const host = new URL(capture.base).hostname;
  const st = readJson(SESSION);
  const mine = st.cookies.filter((c) => host.endsWith(c.domain.replace(/^\./, ""))).length + (st.origins ?? []).filter((o) => new URL(o.origin).hostname === host).length;
  if (!mine) die(`the session has no cookie and no stored data for ${host}. The person is not signed in yet: run login again.`);
  console.log(`✓ session saved → ${SESSION}`);
}

// login --done: the running login sees the file, saves the session and closes the window.
async function loginDone() {
  if (!existsSync(capDir)) die("no login is running. Start it first: capture.mjs login <demoDir>");
  writeFileSync(DONE, "");
  for (let s = 0; s < 20 && existsSync(DONE); s++) await new Promise((r) => setTimeout(r, 500));
  if (existsSync(DONE)) {
    rmSync(DONE, { force: true });
    die("no login is running. Start it first: capture.mjs login <demoDir>");
  }
  console.log("✓ the login window is closed. Read the login output for the result.");
}

// ── look and find: the agent's eyes, with the same session as record ─────────
async function openPage(url) {
  if (!url) die("give a URL, or a path under capture.base");
  const cfg = readJson(join(demoDir, "demo.json")).capture ?? {};
  const browser = await launch(true);
  const ctx = await browser.newContext({ storageState: existsSync(SESSION) ? SESSION : undefined, viewport: VIEW, colorScheme: cfg.colorScheme ?? "light", locale: cfg.locale });
  await ctx.addInitScript(redact, { email: cfg.redact?.email ?? "demo@example.com", names: cfg.redact?.names ?? {} });
  const page = await ctx.newPage();
  const u = new URL(url, cfg.base).href;
  await page.goto(u, { waitUntil: "domcontentloaded", timeout: 90_000 }).catch((e) => die(`cannot open ${u}: ${e.message.split("\n")[0]}`));
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
  if (signedOut(page.url())) die(`landed on ${page.url()}. The session has expired or is missing. Run: capture.mjs login ${rest[0]}`);
  await page.waitForTimeout(800);
  return { browser, page };
}

async function look() {
  const { browser, page } = await openPage(rest[1]);
  const by = Number(opt("scroll") ?? 0);
  if (by) {
    await page.mouse.move(VIEW.width / 2, VIEW.height / 2); // a wheel scrolls the area under the cursor, as in record
    await page.mouse.wheel(0, by);
    await page.waitForTimeout(600);
  }
  mkdirSync(join(capDir, "look"), { recursive: true });
  const slug = new URL(page.url()).pathname.replace(/\W+/g, "-").replace(/^-|-$/g, "") || "home";
  const out = join(capDir, "look", `${slug}${by ? `-${by}` : ""}.png`);
  await page.screenshot({ path: out });
  console.log(`✓ ${page.url()} → ${out}`);
  await browser.close();
}

// The card is the nearest ancestor that looks like one: a box of 240×100 px or more, narrower than the
// page, with a shadow, a border or its own background.
// ponytail: a heuristic; when it picks the wrong box, chain ">> xpath=.." yourself.
function findIn(text) {
  const norm = (s) => s.replace(/\s+/g, " ").trim();
  const box = (el) => { const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const name = (el) => el.tagName.toLowerCase() + (el.id ? `#${el.id}` : [...el.classList].slice(0, 2).map((c) => `.${c}`).join(""));
  const has = (el) => norm(el.textContent).includes(text);
  return [...document.querySelectorAll("body *")]
    .filter((el) => has(el) && ![...el.children].some(has) && el.getClientRects().length)
    .slice(0, 5)
    .map((el) => {
      let card = null;
      for (let a = el.parentElement, d = 1; a && a !== document.body; a = a.parentElement, d++) {
        const b = a.getBoundingClientRect(), cs = getComputedStyle(a);
        const own = cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.backgroundColor !== getComputedStyle(a.parentElement).backgroundColor;
        if (b.width >= 240 && b.height >= 100 && b.width < innerWidth * 0.9 && (cs.boxShadow !== "none" || parseFloat(cs.borderTopWidth) > 0 || own)) {
          card = { depth: d, box: box(a), name: name(a) };
          break;
        }
      }
      let scroller = null;
      for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement)
        if (/auto|scroll/.test(getComputedStyle(a).overflowY) && a.scrollHeight > a.clientHeight + 10) { scroller = name(a); break; }
      return { exact: norm(el.textContent) === text, box: box(el), name: name(el), card, scroller };
    });
}

async function find() {
  const text = rest[2];
  if (!text) die('usage: capture.mjs find <demoDir> <url> "<text>"');
  const { browser, page } = await openPage(rest[1]);
  const hits = await page.evaluate(findIn, text);
  if (!hits.length) die(`no visible element has the text "${text}" on ${page.url()}`);
  const fmt = (b) => `x ${b.x} y ${b.y} w ${b.w} h ${b.h}`;
  const count = async (sel) => { const n = await page.locator(sel).count(); return n === 1 ? "unique" : `${n} matches, record uses the first`; };
  const fold = (b) => (b.y + b.h > VIEW.height ? `, below the fold: add { "scroll": ${Math.ceil((b.y + b.h - VIEW.height + 120) / 100) * 100} } before it` : "");
  for (const [n, h] of hits.entries()) {
    const sel = h.exact ? `text=${JSON.stringify(text)}` : `text=${text}`;
    const nth = hits.length > 1 ? `${sel} >> nth=${n}` : sel;
    console.log(`${n + 1}. ${h.name}  ${fmt(h.box)}${fold(h.box)}`);
    console.log(`   element: ${nth}   (${await count(nth)})`);
    if (h.card) {
      const c = `${nth} >> xpath=ancestor::*[${h.card.depth}]`;
      console.log(`   card:    ${c}   (${h.card.name}, ${fmt(h.card.box)}; use it for "lift")`);
    }
    if (h.scroller) console.log(`   scrolls inside ${h.scroller}: a scroll step scrolls the area under the cursor.`);
  }
  console.log("Boxes are page pixels at 1920×1080. On a 2× still, multiply them by 2.");
  await browser.close();
}

// ── record ────────────────────────────────────────────────────────────────────
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

async function record() {
  // Nothing is recorded before the person approves the script (SKILL.md step 3).
  try {
    execFileSync(process.execPath, [join(dirname(fileURLToPath(import.meta.url)), "demo.mjs"), "script", demoDir, "--check"], { stdio: ["ignore", "ignore", "inherit"] });
  } catch {
    process.exit(1);
  }
  const demo = readJson(join(demoDir, "demo.json"));
  const cfg = demo.capture ?? {};
  const brandPath = join(demoDir, "..", "..", "brand.json");
  const accent = (existsSync(brandPath) && readJson(brandPath).colors?.accent) || "#2563eb";
  const only = opt("scene");
  const jobs = demo.scenes.map((s, i) => ({ s, i })).filter(({ s, i }) => s.record && (!only || Number(only) === i + 1));
  if (!jobs.length) die(only ? `scene ${only} has no record block` : "no scene has a record block");
  if (!existsSync(SESSION)) console.log(`! no session (${SESSION}): recording signed out. For a product behind a sign-in, run login first.`);

  const href = (u) => new URL(u, cfg.base).href;
  const browser = await launch(!flags.has("--headed"));
  for (const { s, i } of jobs) {
    const at = `scene ${i + 1}`;
    const r = s.record;
    if (!s.media) die(`${at}: set "media" to the file to write, e.g. "media/s${String(i + 1).padStart(2, "0")}.mp4"`);
    const out = join(demoDir, s.media);
    mkdirSync(dirname(out), { recursive: true });
    // A still is taken at 2× (3840×2160 for the 1920×1080 page): a zoom into it stays sharp.
    // A recording stays at 1×: a 4K screencast is too heavy to encode and to play.
    const still = /\.(png|jpe?g)$/i.test(s.media);
    const ctx = await browser.newContext({
      storageState: existsSync(SESSION) ? SESSION : undefined,
      viewport: VIEW,
      deviceScaleFactor: still ? 2 : 1,
      colorScheme: cfg.colorScheme ?? "light",
      locale: cfg.locale,
    });
    await ctx.addInitScript(redact, { email: cfg.redact?.email ?? "demo@example.com", names: cfg.redact?.names ?? {} });
    await ctx.addInitScript(cursor, accent);
    const page = await ctx.newPage();
    let pos = { x: VIEW.width / 2, y: VIEW.height / 2 };
    const events = []; // each element the cursor arrives at: build zooms to it and highlights it

    const open = async (u) => {
      await page.goto(href(u), { waitUntil: "domcontentloaded", timeout: 90_000 })
        .catch((e) => die(`${at}: cannot open ${href(u)}: ${e.message.split("\n")[0]}. Is the URL right, and is the environment up?`));
      await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => {});
      if (signedOut(page.url()))
        die(`${at}: landed on ${page.url()}. The session has expired or is missing. Run: capture.mjs login ${rest[0]}`);
      if (r.waitFor) await page.locator(r.waitFor).first().waitFor({ timeout: 60_000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(800);
      await page.mouse.move(pos.x, pos.y); // the cursor shows again on the new page
    };
    // The cursor glides to the target, as a person moves it. A step that matches nothing stops the run:
    // a silent no-op click records a wrong clip.
    let lifts = 0;
    const target = async (sel, kind, lift) => {
      const el = page.locator(sel).first();
      await el.waitFor({ state: "visible", timeout: 15_000 }).catch(() => die(`${at}: no visible element for ${sel}`));
      await el.scrollIntoViewIfNeeded();
      const b = await el.boundingBox();
      // `"lift": true` on the step: a 2× cut-out of the element at rest, before the cursor arrives
      // (so the cursor is not in it). build lifts it out of the screen (SKILL.md step 4, "lift").
      let cut;
      if (lift) {
        const cdp = await page.context().newCDPSession(page);
        const { x: sx, y: sy } = await page.evaluate(() => ({ x: scrollX, y: scrollY }));
        const { data } = await cdp.send("Page.captureScreenshot", { format: "png", clip: { x: b.x + sx, y: b.y + sy, width: b.width, height: b.height, scale: 2 } });
        await cdp.detach();
        cut = `${basename(out).replace(/\.[^.]+$/, "")}.lift-${++lifts}.png`;
        writeFileSync(join(dirname(out), cut), Buffer.from(data, "base64"));
      }
      const to = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
      const n = Math.max(12, Math.round(Math.hypot(to.x - pos.x, to.y - pos.y) / 22));
      for (let k = 1; k <= n; k++) {
        const e = ease(k / n);
        await page.mouse.move(pos.x + (to.x - pos.x) * e, pos.y + (to.y - pos.y) * e);
        await page.waitForTimeout(16);
      }
      pos = to;
      const round = Math.round;
      events.push({ wall: Date.now() / 1000, kind, sel, x: round(b.x), y: round(b.y), w: round(b.width), h: round(b.height), ...(cut && { lift: cut }) });
    };
    const click = async () => {
      await page.waitForTimeout(150);
      await page.mouse.down();
      await page.mouse.up();
      await page.waitForTimeout(450);
    };
    const steps = async () => {
      for (const st of r.steps ?? []) {
        if ("wait" in st) await page.waitForTimeout(st.wait);
        else if (st.click) await target(st.click, "click", st.lift).then(click);
        else if (st.hover) await target(st.hover, "hover", st.lift);
        else if (st.type) await target(st.type, "type", st.lift).then(click).then(() => page.keyboard.type(st.text ?? "", { delay: 70 }));
        else if (st.press) await page.keyboard.press(st.press);
        else if (st.scroll) for (let k = 0; k < 24; k++) await page.mouse.wheel(0, st.scroll / 24).then(() => page.waitForTimeout(16));
        else if (st.goto) await open(st.goto);
        else if (st.waitFor) await page.locator(st.waitFor).first().waitFor({ timeout: 60_000 });
        else die(`${at}: unknown step ${JSON.stringify(st)}`);
      }
    };

    await open(r.url ?? "/");
    if (still) {
      await steps();
      await page.evaluate(() => document.getElementById("__demo-cursor")?.remove());
      await page.screenshot({ path: out });
      console.log(`✓ ${at}: ${s.media} (still, ${VIEW.width * 2}×${VIEW.height * 2})`);
    } else {
      const { secs, t0 } = await screencast(page, out, async () => {
        await page.waitForTimeout(600); // a held first frame: the scene cuts in on a still page
        await steps();
        await page.waitForTimeout(1000); // and a held last frame
      });
      // Seconds in the clip = seconds in the beat (the clip starts with its scene).
      const log = events.map(({ wall, ...e }) => ({ t: Number((wall - t0).toFixed(2)), ...e }));
      writeFileSync(out.replace(/\.[^.]+$/, ".clicks.json"), JSON.stringify({ size: [VIEW.width, VIEW.height], events: log }, null, 2) + "\n");
      console.log(`✓ ${at}: ${s.media} (${secs.toFixed(1)}s, ${VIEW.width}×${VIEW.height}, ${log.length} click(s) logged)`);
    }
    await ctx.close();
  }
  await browser.close();
}

// Chrome's screencast (each painted frame, as JPEG q95) encoded by the system ffmpeg to H.264.
// Sharper text than Playwright's recordVideo (VP8, low bitrate) and no extra ffmpeg download.
// The recording starts on the loaded page, so it needs no trim.
async function screencast(page, out, during) {
  const dir = mkdtempSync(join(tmpdir(), "demo-capture-"));
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
    const file = join(dir, `f${String(frames.length).padStart(5, "0")}.jpg`);
    writeFileSync(file, Buffer.from(data, "base64"));
    frames.push({ file, t: metadata.timestamp ?? Date.now() / 1000 });
    cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 95, maxWidth: VIEW.width, maxHeight: VIEW.height });
  await during();
  const end = Date.now() / 1000;
  await cdp.send("Page.stopScreencast");
  if (!frames.length) die("the screencast sent no frames");
  // A frame lasts until the next one; the page paints only when something changes.
  const list = frames.map((f, k) => `file '${f.file}'\nduration ${Math.max((frames[k + 1]?.t ?? end) - f.t, 0.001).toFixed(4)}`);
  writeFileSync(join(dir, "list.txt"), `${list.join("\n")}\nfile '${frames.at(-1).file}'\n`);
  const fit = `scale=${VIEW.width}:${VIEW.height}:force_original_aspect_ratio=decrease,pad=${VIEW.width}:${VIEW.height}:(ow-iw)/2:(oh-ih)/2`;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", join(dir, "list.txt"),
    "-vf", `fps=30,${fit},format=yuv420p`, "-c:v", "libx264", "-crf", "18", "-movflags", "+faststart", "-an", out]);
  rmSync(dir, { recursive: true, force: true });
  return { secs: end - frames[0].t, t0: frames[0].t };
}

if (cmd === "setup") console.log(`✓ Playwright ready → ${setup()}`);
else if (cmd === "login" && demoDir) await (flags.has("--done") ? loginDone() : login());
else if (cmd === "look" && demoDir) await look();
else if (cmd === "find" && demoDir) await find();
else if (cmd === "record" && demoDir) await record();
else die("usage: capture.mjs setup | login <demoDir> [--done] | look <demoDir> <url> [--scroll N] | find <demoDir> <url> \"<text>\" | record <demoDir> [--scene N] [--headed]   (see the header of this file)");
