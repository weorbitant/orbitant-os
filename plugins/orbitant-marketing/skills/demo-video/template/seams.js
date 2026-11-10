// SEAMS — the scene changes of the demo template, from the Afianza transition board
// (references/motion.md has the recipe ids and timings). demo.mjs build inlines this file into
// index.html and then calls SEAM[kind](at, outgoing, incoming) once per seam, where `at` is the
// cut: the incoming scene starts there. build extends the outgoing scene by the seam's overlap
// and stacks the scenes with z-index, so these tweens only move the two host elements.

// The house ease EZ comes from ease.js, which build inlines before this file.
const F = 1 / 30
const tl = gsap.timeline({ paused: true })
const into = (sel, from, to, at) => tl.fromTo(sel, from, { ...to, ease: EZ, immediateRender: false }, at)

const SEAM = {
  cut: () => {},
  // T1 — the incoming scene is on top and fades up; nothing moves.
  crossfade: (at, o, i) => into(i, { opacity: 0 }, { opacity: 1, duration: 9 * F }, at),
  // T2 — both scenes travel left together: drilling into a record.
  push: (at, o, i) => {
    tl.to(o, { xPercent: -100, duration: 12 * F, ease: EZ }, at)
    into(i, { xPercent: 100 }, { xPercent: 0, duration: 12 * F }, at)
  },
  // T4 — the mask travels left to right over the incoming scene; the scene itself stays still.
  wipe: (at, o, i) => into(i, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 15 * F }, at),
  // C10 — an accent bar crosses the frame; the outgoing scene (on top) is gone behind it.
  sweep: (at, o) => {
    into('#seam-bar', { x: 0 }, { x: 1960, duration: 14 * F }, at)
    tl.to(o, { opacity: 0, duration: 5 * F, ease: EZ }, at + 3 * F)
  },
  // C6 — the outgoing scene (on top) steps back and fades, the next one is behind it.
  zoomout: (at, o) => tl.to(o, { scale: 0.92, opacity: 0, duration: 14 * F, ease: EZ }, at),
  // C5 then T11 — the panels close over the outgoing scene and part on the incoming one.
  // A pair by the library's rule: never one without the other. Once per video.
  curtain: (at) => {
    into('#seam-curtain-l', { xPercent: 0 }, { xPercent: 100, duration: 17 * F }, at - 17 * F)
    into('#seam-curtain-r', { xPercent: 0 }, { xPercent: -100, duration: 17 * F }, at - 17 * F)
    tl.to('#seam-curtain-l', { xPercent: 0, duration: 18 * F, ease: EZ }, at)
    tl.to('#seam-curtain-r', { xPercent: 0, duration: 18 * F, ease: EZ }, at)
  },
}
