// Logic of the "Loop step by step" demo (module 3, lesson 2).
// Not a Python interpreter but an exact model of the four lesson programs: the trace matches
// sys.settrace in Python 3.11 (an event is a line before it runs, with a snapshot of the variables
// and the output). Pure functions without the DOM: tests/parity.test.js compares them with the Russian demo on its golden.json.

export const PROGRAMS = ["if", "while", "break", "continue"];
export const DEFAULTS = { if: { temp: 3 }, while: { limit: 3 }, break: { items: [1, 3, 7, 9] }, continue: { items: [1, 0, 2] } };
export const MAX_ITEMS = 8;

const listRepr = (items) => `[${items.join(", ")}]`;

/** The program code line by line, as in the lesson, with the learner's parameters. */
export function code(name, p) {
  switch (name) {
    case "if":
      return [`temp = ${p.temp}`, "", "if temp < 0:", '    print("Freezing")', "elif temp < 10:", '    print("Cool")', "else:", '    print("Warm")'];
    case "while":
      return ["x = 0", `while x < ${p.limit}:`, '    print("x =", x)', "    x += 1"];
    case "break":
      return [`for n in ${listRepr(p.items)}:`, "    if n == 7:", '        print("Found 7!")', "        break"];
    case "continue":
      return [`for n in ${listRepr(p.items)}:`, "    if n == 0:", "        continue", "    print(10 / n)"];
    default:
      throw new Error(`no program ${name}`);
  }
}

/** Python repr(float) for the results of 10 / n: a whole number gets ".0", otherwise the shortest form. */
export function reprFloat(v) {
  if (Number.isInteger(v)) return `${Object.is(v, -0) ? "-0" : v}.0`;
  return String(v);
}

/** The trace as sys.settrace gives it: { events: [{ line, vars, out }], output, vars }. */
export function trace(name, p) {
  const events = [];
  const vars = {};
  let out = "";
  const emit = (line) => events.push({ line, vars: { ...vars }, out });
  const print = (text) => { out += `${text}\n`; };

  if (name === "if") {
    emit(1);
    vars.temp = String(p.temp);
    emit(3);
    if (p.temp < 0) {
      emit(4); print("Freezing");
    } else {
      emit(5);
      if (p.temp < 10) { emit(6); print("Cool"); } else { emit(8); print("Warm"); }
    }
  } else if (name === "while") {
    emit(1);
    let x = 0;
    vars.x = "0";
    for (;;) {
      emit(2);
      if (!(x < p.limit)) break;
      emit(3); print(`x = ${x}`);
      emit(4); x += 1; vars.x = String(x);
    }
  } else if (name === "break") {
    let stopped = false;
    for (const n of p.items) {
      emit(1); vars.n = String(n);
      emit(2);
      if (n === 7) { emit(3); print("Found 7!"); emit(4); stopped = true; break; }
    }
    if (!stopped) emit(1);
  } else if (name === "continue") {
    for (const n of p.items) {
      emit(1); vars.n = String(n);
      emit(2);
      if (n === 0) { emit(3); continue; }
      emit(4); print(reprFloat(10 / n));
    }
    emit(1);
  } else {
    throw new Error(`no program ${name}`);
  }
  return { events, output: out, vars: { ...vars } };
}

/** A list from the input field: "1, 3, 7, 9" or "[1, 3, 7, 9]", integers from -9 to 9, at most MAX_ITEMS. */
export function parseItems(text) {
  let body = text.trim();
  if (body.startsWith("[")) body = body.slice(1);
  if (body.endsWith("]")) body = body.slice(0, -1);
  body = body.trim();
  if (body === "") return { ok: true, items: [] };
  const parts = body.split(",").map((part) => part.trim());
  if (parts.length > MAX_ITEMS) return { ok: false, error: `at most ${MAX_ITEMS} numbers` };
  const items = [];
  for (const part of parts) {
    if (!/^-?[0-9]+$/.test(part)) return { ok: false, error: `"${part}" is not an integer` };
    const n = Number(part);
    if (n < -9 || n > 9) return { ok: false, error: "use numbers from -9 to 9" };
    items.push(n === 0 ? 0 : n);
  }
  return { ok: true, items };
}
