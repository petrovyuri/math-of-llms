// Logic of the "Matrix multiplication step by step" demo (module 2, lesson 1).
// Pure functions without the DOM: tests/parity.test.js compares them with the Russian demo on its golden.json (torch).
import { listStr, sumOfProducts } from "../../kit/format.js";

/** Matrix shape: [rows, columns]. */
export function shape(m) {
  return [m.length, m[0].length];
}

/** You can multiply when A has as many columns as B has rows. */
export function canMultiply(a, b) {
  return a[0].length === b.length;
}

export function mismatchText(a, b) {
  return `Columns in A (${a[0].length}) ≠ rows in B (${b.length}): you can't multiply them`;
}

export function shapesText(a, b) {
  const [ar, ac] = shape(a);
  const [br, bc] = shape(b);
  return `(${ar}×${ac}) × (${br}×${bc})`;
}

/** C[i][j] = row i of A · column j of B. */
export function matmul(a, b) {
  if (!canMultiply(a, b)) throw new Error(mismatchText(a, b));
  return a.map((row) => b[0].map((_, j) => {
    let total = 0;
    for (let k = 0; k < row.length; k += 1) total += row[k] * b[k][j];
    return total;
  }));
}

/** Rows become columns. Works with numbers and with cell text alike. */
export function transpose(m) {
  return m[0].map((_, j) => m.map((row) => row[j]));
}

export function column(m, j) {
  return m.map((row) => row[j]);
}

/** How one cell is computed: "(1×6) + (2×8) = 6 + 16 = 22". */
export function cellFormula(a, b, i, j) {
  return sumOfProducts(a[i], column(b, j));
}

/** Captions for "▶ step by step": the cells of C row by row, numbered from 1 as in the lesson. */
export function steps(a, b) {
  const lines = [];
  a.forEach((_, i) => b[0].forEach((__, j) => {
    lines.push(`Row ${i + 1} · column ${j + 1} = ${cellFormula(a, b, i, j)}`);
  }));
  return lines;
}

export const display = {
  matmul: (a, b) => listStr(matmul(a, b)),
  transpose: (m) => listStr(transpose(m)),
};
