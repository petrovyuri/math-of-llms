// Logic of the "Gradient descent" demo (module 2, lesson 3): L(w) = (w - 3)², dL/dw = 2(w - 3).
// Pure functions without the DOM: tests/parity.test.js compares them with the Russian demo on its golden.json (torch.autograd).
import { num } from "../../kit/format.js";

export const TARGET = 3;

export function loss(w) {
  return (w - TARGET) ** 2;
}

export function grad(w) {
  return 2 * (w - TARGET);
}

/** One step: w_new = w - η · dL/dw. */
export function step(w, lr) {
  return w - lr * grad(w);
}

/** n steps from w0: table rows { n, w, loss, grad, next }. */
export function run(w0, lr, n) {
  const rows = [];
  let w = w0;
  for (let k = 1; k <= n; k += 1) {
    const next = step(w, lr);
    rows.push({ n: k, w, loss: loss(w), grad: grad(w), next });
    w = next;
  }
  return rows;
}

/** The descent diverged: the point is more than 100 away from the minimum (20 times farther than the plot edge). */
export const DIVERGED = 100;

export function diverged(w) {
  return Math.abs(w - TARGET) > DIVERGED;
}

/** What the sign of the derivative tells you. */
export function verdict(w) {
  const g = grad(w);
  if (Math.abs(g) < 1e-9) return "dL/dw = 0: w is at the minimum and stays there";
  if (g > 0) return `dL/dw = +${num(g)} > 0: loss grows as w grows → decrease w`;
  return `dL/dw = ${num(g)} < 0: loss falls as w grows → increase w`;
}

/** The step formula, as in the lesson: "w_new = 5 - 0.1·4 = 4.6". */
export function stepFormula(w, lr) {
  const g = grad(w);
  const gText = g < 0 ? `(${num(g)})` : num(g);
  return `w_new = ${num(w)} - ${num(lr)}·${gText} = ${num(step(w, lr))}`;
}

export const display = {
  loss: (w) => num(loss(w)),
};
