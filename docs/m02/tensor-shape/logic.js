// Logic of the "Tensor shape and reshape" demo (module 2, lesson 1).
// Pure functions without the DOM: tests/parity.test.js compares them with the Russian demo on its golden.json (torch).

/** Ranks from the lesson table (step 5). */
export const RANKS = [
  { rank: 0, name: "Scalar", shape: "()", example: "Loss, learning rate" },
  { rank: 1, name: "Vector", shape: "(d)", example: "A single word's embedding" },
  { rank: 2, name: "Matrix", shape: "(seq, d)", example: "Layer weights or a sentence" },
  { rank: 3, name: "Tensor", shape: "(batch, seq, d)", example: "The main data format" },
];

/** Number of elements: the product of the sizes (1 for a scalar). */
export function numel(shape) {
  return shape.reduce((product, n) => product * n, 1);
}

/** The shape as a Python tuple: "()", "(6,)", "(2, 3)". */
export function shapeStr(shape) {
  if (shape.length === 0) return "()";
  if (shape.length === 1) return `(${shape[0]},)`;
  return `(${shape.join(", ")})`;
}

/** The way PyTorch prints it: "torch.Size([2, 2, 2])". */
export function torchSize(shape) {
  return `torch.Size([${shape.join(", ")}])`;
}

/** Lays out the numbers of flat into the given shape row by row (flat already has the right length). */
function fill(flat, shape) {
  let k = 0;
  const build = (dims) => (dims.length === 0
    ? flat[k++]
    : Array.from({ length: dims[0] }, () => build(dims.slice(1))));
  return build(shape);
}

/** A tensor of the given shape filled with 1, 2, 3, ..., like torch.arange(1, n + 1).reshape(shape). */
export function makeTensor(shape) {
  return fill(Array.from({ length: numel(shape) }, (_, i) => i + 1), shape);
}

/** All the numbers in one list, row by row. */
export function flatten(x) {
  return Array.isArray(x) ? x.flatMap(flatten) : [x];
}

/** reshape as in PyTorch: the same numbers in a new layout, or the torch error text. */
export function reshape(flat, shape) {
  if (numel(shape) !== flat.length) {
    return { ok: false, error: `shape '[${shape.join(", ")}]' is invalid for input of size ${flat.length}` };
  }
  return { ok: true, value: fill(flat, shape) };
}
