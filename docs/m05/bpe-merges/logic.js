// Logic of the "BPE step by step" demo (module 5, lesson "Byte pair encoding (BPE)").
// Repeats the code of lesson 7: word_freqs = Counter(corpus), get_stats, merge_vocab (merges
// only the exact pair), max(stats, key=stats.get): the first pair with the highest count.
// Pure functions with no DOM; they are checked against golden.json (the lesson code run in Python).

import { isSpace, pyStrip, reprList, reprStr } from "../../kit/py.js";

export const MAX_WORDS = 8;
export const MAX_LEN = 10;   // 12 letters do not fit in a line at 700 px
export const DEFAULT_MERGES = 10;
export const MAX_MERGES = 20;

/** The corpus from the input field: words separated by commas. */
export function parseCorpus(text) {
  const words = text.split(",").map(pyStrip).filter((word) => word);
  if (!words.length) return { ok: false, error: "Enter at least one word." };
  if (words.length > MAX_WORDS) return { ok: false, error: `At most ${MAX_WORDS} words.` };
  for (const word of words) {
    if ([...word].some(isSpace)) return { ok: false, error: `"${word}" contains a space; separate words with commas.` };
    if ([...word].length > MAX_LEN) return { ok: false, error: `"${word}" is longer than ${MAX_LEN} characters.` };
  }
  return { ok: true, words };
}

/** get_stats: counts of pairs of neighboring symbols weighted by word frequency, in order of first appearance (like Counter). */
function getStats(vocab, freqs) {
  const pairs = new Map();
  for (const [word, symbols] of vocab) {
    for (let i = 0; i < symbols.length - 1; i += 1) {
      const key = JSON.stringify([symbols[i], symbols[i + 1]]);
      const item = pairs.get(key) ?? [symbols[i], symbols[i + 1], 0];
      item[2] += freqs.get(word);
      pairs.set(key, item);
    }
  }
  return [...pairs.values()];
}

/** merge_vocab: merge only two neighboring symbols that match the pair. */
function mergeVocab([a, b], vocab) {
  return vocab.map(([word, symbols]) => {
    const merged = [];
    let i = 0;
    while (i < symbols.length) {
      if (i < symbols.length - 1 && symbols[i] === a && symbols[i + 1] === b) {
        merged.push(a + b);
        i += 2;
      } else {
        merged.push(symbols[i]);
        i += 1;
      }
    }
    return [word, merged];
  });
}

/** The eight most frequent pairs; ties keep the order of appearance (the sort is stable). */
const top = (stats) => [...stats].sort((x, y) => y[2] - x[2]).slice(0, 8).map((item) => [...item]);

/** Training step by step: the initial split, every merge, and the pairs that remain. */
export function train(words, merges) {
  const freqs = new Map();
  for (const word of words) freqs.set(word, (freqs.get(word) ?? 0) + 1);
  let vocab = [...freqs.keys()].map((word) => [word, [...word, "</w>"]]);
  const initial = vocab.map(([word, symbols]) => [word, [...symbols]]);
  const steps = [];
  for (let k = 0; k < merges; k += 1) {
    const stats = getStats(vocab, freqs);
    if (!stats.length) break;
    const best = stats.reduce((acc, item) => (item[2] > acc[2] ? item : acc));
    const pair = [best[0], best[1]];
    vocab = mergeVocab(pair, vocab);
    steps.push({ pair, count: best[2], top: top(stats), vocab: vocab.map(([word, symbols]) => [word, [...symbols]]) });
  }
  return { initial, steps, after: top(getStats(vocab, freqs)) };
}

/** The line the lesson prints at step k. */
export function stepLine(k, [a, b]) {
  return `Step ${k}: merging pair (${reprStr(a)}, ${reprStr(b)})`;
}

const wordLine = ([word, symbols]) => `${word}: ${reprList(symbols)}`;

/** The whole output of the lesson program for a corpus and a number of merges. */
export function lines(words, merges) {
  const { initial, steps } = train(words, merges);
  const final = steps.length ? steps[steps.length - 1].vocab : initial;
  return [
    "Initial subword vocabulary (each word as a list of characters):",
    ...initial.map(wordLine),
    ...steps.map((step, i) => stepLine(i + 1, step.pair)),
    "",
    "Final split:",
    ...final.map(wordLine),
  ];
}
