// Parsing and formatting numbers the way the lessons write them. Pure functions
// without the DOM. The Python mirror is out/review/_guides/golden_io.py in the course project:
// it computes the golden strings, so the rules here and there must match.

/** Like Number.prototype.toFixed, but without "-0.00": a negative zero is written without the minus. */
export function fixed(x, digits) {
  const s = x.toFixed(digits);
  return /^-[0.]+$/.test(s) ? s.slice(1) : s;
}

/** Drops trailing zeros of the fractional part: "4.60" becomes "4.6", "3.00" becomes "3". */
export function trimZeros(s) {
  return s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
}

/** A number from a lesson: an integer as is, a fraction to digits places without trailing zeros. */
export function num(x, digits = 2) {
  if (Number.isInteger(x)) return String(x);
  return trimZeros(fixed(x, digits));
}

/** A fraction as a percent by the rules of module 2, lesson 2: "73.1%", "0.0245%", "≈0%". */
export function percent(p) {
  const pct = p * 100;
  if (pct >= 0.1) return fixed(pct, 1) + "%";
  if (pct >= 0.001) return trimZeros(pct.toPrecision(3)) + "%";
  return "≈0%";
}

/** Exponent for softmax tables: "7.39", "162754.79"; huge and tiny values - "7.23e+86". */
export function expo(v) {
  if (v === 0) return "0";
  return v >= 1e6 || v < 0.005 ? v.toExponential(2) : fixed(v, 2);
}

/** Sum of products, as in the lesson: "(1×3) + (2×4) = 3 + 8 = 11". */
export function sumOfProducts(xs, ys) {
  const products = xs.map((x, i) => x * ys[i]);
  let total = 0;
  for (const p of products) total += p;
  if (xs.length === 1) return `${num(xs[0])}×${num(ys[0])} = ${num(total)}`;
  const left = xs.map((x, i) => `(${num(x)}×${num(ys[i])})`).join(" + ");
  const middle = products.map((p, i) => (i > 0 && p < 0 ? `(${num(p)})` : num(p))).join(" + ");
  return `${left} = ${middle} = ${num(total)}`;
}

/** A number or a nested list in Python notation: "[[19, 22], [43, 50]]". */
export function listStr(x) {
  return Array.isArray(x) ? "[" + x.map(listStr).join(", ") + "]" : num(x);
}

/**
 * Probability for the line "L = -ln p ≈ ..." (module 13): the smallest precision, starting at
 * 3 significant digits after the zeros, at which -ln of the shown number rounds to the same L
 * as -ln of the exact one: 0.2347 stays "0.2347", not "0.235".
 */
export function pForLoss(p) {
  const want = fixed(-Math.log(p), 3);
  const start = p >= 0.001 ? 3 : Math.floor(-Math.log10(p)) + 3;
  for (let k = start; k < start + 6; k++) {
    const s = fixed(p, k);
    if (Number(s) > 0 && fixed(-Math.log(Number(s)), 3) === want) return s;
  }
  return fixed(p, start + 5);
}

/** GPT-2 token for display: space is "·", newline is "↵", empty is "∅"; longer than 9 characters - 8 and "…". */
export function tokenLabel(t) {
  const s = t.replaceAll(" ", "·").replaceAll("\n", "↵") || "∅";
  const chars = Array.from(s);
  return chars.length > 9 ? chars.slice(0, 8).join("") + "…" : s;
}

/** Token probability: 3 digits, below 0.01 - 4 digits, below 0.0001 - "<1e-4". */
export function pText(p) {
  if (p >= 0.01) return fixed(p, 3);
  if (p >= 0.0001) return fixed(p, 4);
  return "<1e-4";
}

/** Input field text to a number (a comma is accepted), or null if it is not a number or |x| > limit. */
export function parseNumber(text, limit) {
  const t = String(text).trim().replace(",", ".");
  if (!/^-?(\d+(\.\d*)?|\.\d+)$/.test(t)) return null;
  const v = Number(t);
  return Math.abs(v) <= limit ? v : null;
}
