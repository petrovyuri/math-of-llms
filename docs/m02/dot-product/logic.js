// Logic of the "Dot product as similarity" demo (module 2, lesson 1).
// Pure functions without the DOM: tests/parity.test.js compares them with the Russian demo on its golden.json (torch).
import { num, sumOfProducts } from "../../kit/format.js";

const ORDINALS = ["first", "second", "third", "fourth"];

/** Dot product: the sum of the pairwise products of the coordinates. */
export function dot(a, b) {
  if (a.length !== b.length) throw new Error("vectors have different lengths");
  let total = 0;
  for (let i = 0; i < a.length; i += 1) total += a[i] * b[i];
  return total;
}

/** What the sign means: same (> 0), orthogonal (= 0), opposite (< 0), zero (one vector is zero). */
export function verdict(a, b) {
  if (a.every((x) => x === 0) || b.every((x) => x === 0)) return "zero";
  const value = dot(a, b);
  if (Math.abs(value) < 1e-9) return "orthogonal";
  return value > 0 ? "same" : "opposite";
}

/** Step captions for "▶ step by step": one product per coordinate, then the sum. */
export function steps(a, b) {
  const lines = a.map((x, i) => `Multiply the ${ORDINALS[i]} coordinates: ${num(x)} × ${num(b[i])} = ${num(x * b[i])}`);
  const [, ...rest] = display.dot(a, b).split(" = ");
  lines.push(`Add them up: ${rest.join(" = ")}`);
  return lines;
}

export const display = {
  dot: (a, b) => sumOfProducts(a, b),
};
