// Logic of the "Vocabulary, [UNK], and the way back" demo (module 5, lesson "Code: a simple tokenizer").
// Repeats the lesson functions tokenize_words_with_unk and detokenize_words. Pure functions
// with no DOM; they are checked against golden.json (the lesson code run in Python) in tests/golden.test.js.

import { pySplit, reprList } from "../../kit/py.js";

/** The lesson word_vocab: token (word) -> ID, in the order written. */
export const VOCAB = [["The", 2], ["cat", 3], ["loved", 4], ["sour", 5], ["cream", 6], ["Space", 99], ["[UNK]", 100]];
export const MAX_ADDED = 8;
export const MAX_WORDS = 10;   // more words do not fit in a 600 px iframe

/** The lesson vocabulary plus the added words: each gets the next free ID below 99. */
export function vocabWith(added) {
  const entries = VOCAB.map(([word, id]) => [word, id]);
  for (const word of added) {
    if (entries.some(([w]) => w === word)) continue;
    const next = Math.max(...entries.map(([, id]) => id).filter((id) => id < 99)) + 1;
    entries.push([word, next]);
  }
  return entries;
}

/** tokenize_words_with_unk: word IDs, the ID of "Space" between words, unknown words become [UNK]. */
function tokenize(words, vocab) {
  const ids = [];
  words.forEach((word, i) => {
    ids.push(vocab.has(word) ? vocab.get(word) : vocab.get("[UNK]"));
    if (i < words.length - 1) ids.push(vocab.get("Space"));
  });
  return ids;
}

/** detokenize_words: IDs back to words, "Space" is dropped, words are joined with one space. */
function detokenize(ids, idToWord) {
  return ids.map((id) => idToWord.get(id)).filter((word) => word !== "Space").join(" ");
}

/** Everything the demo shows for a string and the added words. */
export function run(text, added) {
  const entries = vocabWith(added);
  const vocab = new Map(entries);
  const words = pySplit(text);
  const ids = tokenize(words, vocab);
  const restored = detokenize(ids, new Map(entries.map(([word, id]) => [id, word])));
  const unknown = [];
  for (const word of words) if (!vocab.has(word) && !unknown.includes(word)) unknown.push(word);
  const unk = ids.filter((id) => id === vocab.get("[UNK]")).length;
  let status;
  let message;
  if (restored === text) {
    [status, message] = ["same", "The string was restored in full."];
  } else if (restored === words.join(" ")) {
    [status, message] = ["spaces", "The words came back, but the spacing did not: detokenize_words puts a single space between words."];
  } else if (unk) {
    [status, message] = ["lost", `Words lost: ${unk}. Add them to the vocabulary with the + buttons.`];
  } else {
    [status, message] = ["lost", "Part of the text did not come back: detokenize_words drops the word Space as if it were a real space."];
  }
  return {
    words, wordsLine: reprList(words),
    ids, idsLine: `Word IDs: [${ids.join(", ")}]`,
    restored, restoredLine: `Restored text: ${restored}`,
    unknown, unk, status, message,
  };
}
