// Logic of the "From string to tokens" demo (module 3, lesson 3).
// String methods behave as in Python: strip() and split() without arguments cut at Python
// whitespace characters (str.isspace), and the result is shown as Python writes it (repr).
// Pure functions without the DOM: tests/golden.test.js compares them with golden.json (real Python).

import { pyStrip, pySplit, reprList, reprStr } from "../../kit/py.js";

export { pyStrip, pySplit, reprStr };   // the m03/text-to-tokens golden checks them directly

export const STEPS = ["strip", "lower", "replace", "split"];

const APPLY = {
  strip: (s) => pyStrip(s),
  lower: (s) => s.toLowerCase(),
  replace: (s) => s.split("!").join(""),
  split: (s) => pySplit(s),
};

/** The enabled steps in order: { stages: [{ step, value }], result }. */
export function pipeline(text, flags) {
  let value = text;
  const stages = [];
  for (const step of STEPS) {
    if (!flags[step]) continue;
    value = APPLY[step](value);
    stages.push({ step, value });
  }
  return { stages, result: value };
}

/** How a value looks in Python: a string is its repr, a list of strings is what print shows. */
export function view(value) {
  return Array.isArray(value) ? reprList(value) : reprStr(value);
}

export function stageViews(text, flags) {
  return pipeline(text, flags).stages.map((stage) => view(stage.value));
}

/** What print(s) prints: a string as is, a list as Python writes it. */
export function printed(text, flags) {
  const { result } = pipeline(text, flags);
  return Array.isArray(result) ? view(result) : result;
}

const TITLES = {
  strip: "strip() removes whitespace from both ends",
  lower: "lower() makes all letters lowercase",
  replace: 'replace("!", "") removes exclamation marks',
  split: "split() breaks the string at whitespace into a list of words",
};

/** Captions for "▶ step by step". */
export function captions(text, flags) {
  return pipeline(text, flags).stages.map((stage) => `${TITLES[stage.step]}: ${view(stage.value)}`);
}
