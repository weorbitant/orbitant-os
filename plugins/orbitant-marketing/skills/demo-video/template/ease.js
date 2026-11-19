// House ease cubic-bezier(0.2, 0, 0.2, 1). GSAP has no equivalent:
// power2.out front-loads, and cubic.out is not a GSAP ease at all.
// The one copy: demo.mjs build inlines it at {{EASE}} in each composition and before seams.js.
function cubicBezier(x1, y1, x2, y2) {
  const A = (a, b) => 1 - 3 * b + 3 * a, B = (a, b) => 3 * b - 6 * a, C = (a) => 3 * a
  const calc = (t, a, b) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t
  const slope = (t, a, b) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a)
  return (x) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 8; i++) {
      const err = calc(t, x1, x2) - x
      if (Math.abs(err) < 1e-6) break
      const d = slope(t, x1, x2)
      if (Math.abs(d) < 1e-6) break
      t -= err / d
    }
    return calc(t, y1, y2)
  }
}
const EZ = cubicBezier(0.2, 0, 0.2, 1)
