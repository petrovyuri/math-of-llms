// Logic of the "Autograd: y = w · x" demo (module 3, lesson 7).
// The strings are exactly what Python and PyTorch print. Pure functions without the DOM:
// tests/parity.test.js compares them with the Russian demo on its golden.json (torch).

import { num } from "../../kit/format.js";

/** Python repr(float) for numbers with a step of 0.25: "2.0", "2.5", "-0.0". */
export function lit(v) {
  if (Number.isInteger(v)) return `${Object.is(v, -0) ? "-0" : v}.0`;
  return String(v);
}

/** How torch prints a float32 scalar with a step of 0.25: "3.", "2.5000", "-0.". */
export function torchScalar(v) {
  if (Object.is(v, -0)) return "-0.";
  return Number.isInteger(v) ? `${v}.` : v.toFixed(4);
}

export function tensorStr(v, gradFn = null) {
  return `tensor(${torchScalar(v)}${gradFn ? `, grad_fn=<${gradFn}>` : ""})`;
}

/** What y and w.grad print before backward and after it. */
export function outputs(w, x) {
  return { y: tensorStr(w * x, "MulBackward0"), gradBefore: "None", gradAfter: tensorStr(x) };
}

/** Captions for "▶ step by step". */
export function steps(w, x) {
  const out = outputs(w, x);
  return [
    `Forward pass: y = w · x = ${lit(w)} · ${lit(x)} = ${lit(w * x)} → ${out.y}`,
    `Backward pass: dy/dw = x = ${lit(x)}`,
    `print(w.grad) → ${out.gradAfter}`,
  ];
}

/** What the gradient means: how y changes if w grows by 0.5. The numbers match the lesson text. */
export function nudge(x) {
  const head = "If w increases by 0.5, y ";
  if (x > 0) return `${head}increases by 0.5 · ${num(x)} = ${num(0.5 * x)}`;
  if (x < 0) return `${head}decreases by 0.5 · ${num(-x)} = ${num(-0.5 * x)}`;
  return `${head}does not change: 0.5 · 0 = 0`;
}
