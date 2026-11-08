// Logic of the "Softmax and temperature" demo (module 2, lesson 2).
// Pure functions without the DOM: tests/parity.test.js compares them with the Russian demo on its golden.json (torch).
import { expo, fixed, num, percent } from "../../kit/format.js";

function sum(values) {
  let total = 0;
  for (const v of values) total += v;
  return total;
}

/** Step 1: divide the logits by the temperature. */
export function scaled(logits, T) {
  return logits.map((x) => x / T);
}

/** Step 2: the exponentials, exactly the ones the lesson writes into its table (no max subtracted). */
export function exps(logits, T) {
  return scaled(logits, T).map(Math.exp);
}

/** Step 3: the sum of the exponentials. */
export function expSum(logits, T) {
  return sum(exps(logits, T));
}

/** Step 4: the probabilities. Computed the stable way, with the max subtracted, as the lesson says. */
export function softmax(logits, T) {
  const s = scaled(logits, T);
  const max = Math.max(...s);
  const e = s.map((x) => Math.exp(x - max));
  const total = sum(e);
  return e.map((v) => v / total);
}

/** Probabilities as percentages by the lesson rules: "73.1%", "0.0245%", "≈0%". */
export function percents(logits, T) {
  return softmax(logits, T).map(percent);
}

/** Captions for "▶ step by step". */
export function steps(logits, T) {
  return [
    `1. Divide each logit by T = ${num(T)}: ${scaled(logits, T).map((x) => num(x, 3)).join(", ")}`,
    `2. Exponentiate each value (e^x is always positive): ${exps(logits, T).map(expo).join(", ")}`,
    `3. Sum the exponentials: ${expo(expSum(logits, T))}`,
    `4. Divide each exponential by the sum: ${softmax(logits, T).map((p) => fixed(p, 3)).join(", ")}`,
    `Check: sum of probabilities = ${fixed(sum(softmax(logits, T)), 3)}`,
  ];
}

export const display = {
  scaled: (logits, T) => scaled(logits, T).map((x) => num(x, 3)).join(" / "),
  exps: (logits, T) => exps(logits, T).map(expo).join(" / "),
  expSum: (logits, T) => expo(expSum(logits, T)),
  softmax: (logits, T) => softmax(logits, T).map((p) => fixed(p, 3)).join(" / "),
  percents: (logits, T) => percents(logits, T).join(" / "),
};
