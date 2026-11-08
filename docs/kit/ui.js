// Shared demo components: elements, SVG, the step-by-step button, presets,
// sliders, and the number grid. No dependencies. A component lands here
// only when at least two demos need it.
import { COURSE_NAME, COURSE_URL, canShow, moduleOf, parentOrigin } from "./access.js";

export const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/** HTML element: el("button", { class: "chip", onclick }, "text"). */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false) continue;
    if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
    else if (key === "class") node.className = value;
    else node.setAttribute(key, value === true ? "" : String(value));
  }
  node.append(...children.flat().filter((c) => c !== undefined && c !== null && c !== false));
  return node;
}

const SVG_NS = "http://www.w3.org/2000/svg";

/** SVG element: svg("line", { x1: 0, y1: 0, x2: 10, y2: 10 }). */
export function svg(tag, attrs = {}) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  return node;
}

/**
 * The demo script ran to the end - tests/layout.html checks this.
 * A locked module outside Stepik (the rule is in kit/access.js) is replaced by a stub that links to the course.
 * If the demo is open in its own tab rather than in a step iframe, a link to the home page appears on top.
 */
export function ready() {
  const framed = window.self !== window.top;
  const module = moduleOf(location.pathname);
  const referrer = document.referrer;
  const parent = framed ? parentOrigin(location.ancestorOrigins, referrer) : null;
  if (!canShow({ module, host: location.hostname, framed, parent, referrer })) showLocked(module);
  else if (!framed && !document.querySelector(".home-link")) {
    document.body.prepend(el("a", { class: "home-link", href: "../../" }, "← all course demos"));
  }
  document.documentElement.dataset.ready = "1";
}

/** Stub in place of a locked module's demo: the demo title, where to open it, and the course button. */
export function showLocked(module) {
  const title = document.querySelector("h1")?.textContent ?? document.title;
  document.body.replaceChildren(
    el("a", { class: "home-link", href: "../../" }, "← all course demos"),
    el("p", { class: "eyebrow" }, `Module ${module} · ${COURSE_NAME}`),
    el("h1", {}, title),
    el("div", { class: "panel locked" },
      el("p", {}, `This demo is part of the "${COURSE_NAME}" course on Stepik. It opens inside a lesson, right after the theory, with the same numbers the lesson uses.`),
      el("p", {}, "If you already have the course, open this lesson on Stepik. Demos from the first five modules are free on the home page."),
      el("a", { class: "cta", href: COURSE_URL, target: "_top", rel: "noopener" }, "Get the course on Stepik")));
}

/**
 * The "step-by-step" button. steps() returns the step captions (read at the moment of starting),
 * onStep(i, caption) draws step i, onStep(-1, null) restores the normal view.
 * Pressing it again during playback stops it. With reduced motion,
 * each press shows the next step.
 */
export function stepPlayer(button, { steps, onStep, interval = 1100 }) {
  const label = button.textContent;
  let list = [];
  let index = -1;
  let timer = null;

  function idle() {
    clearTimeout(timer);
    timer = null;
    index = -1;
    button.textContent = label;
    button.setAttribute("aria-pressed", "false");
  }

  function finish() {
    idle();
    onStep(-1, null);
  }

  function go(i) {
    index = i;
    onStep(i, list[i]);
  }

  function tick() {
    if (index + 1 < list.length) {
      go(index + 1);
      timer = setTimeout(tick, interval);
    } else {
      finish();
    }
  }

  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => {
    if (reducedMotion) {
      if (index === -1) list = steps();
      if (index + 1 < list.length) {
        go(index + 1);
        button.textContent = `step ${index + 1} of ${list.length} ▶`;
        button.setAttribute("aria-pressed", "true");
      } else {
        finish();
      }
      return;
    }
    if (timer !== null) {
      finish();
      return;
    }
    list = steps();
    if (list.length === 0) return;
    button.textContent = "■ stop";
    button.setAttribute("aria-pressed", "true");
    go(0);
    timer = setTimeout(tick, interval);
  });

  return {
    /** Stop playback (for example, the student started changing the data). */
    stop() {
      if (index !== -1) finish();
    },
    active: () => index !== -1,
  };
}

/** A row of preset buttons. items: [{ label, value }]; onPick(value, index). */
export function presets(container, items, onPick) {
  const buttons = items.map((item, i) => el("button", {
    type: "button",
    class: "chip",
    "aria-pressed": "false",
    onclick: () => {
      setActive(i);
      onPick(item.value, i);
    },
  }, item.label));
  container.replaceChildren(...buttons);

  function setActive(index) {
    buttons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
  }

  return { setActive };
}

let sliderCount = 0;

/** A slider with a value label. format(v) is the value text, onInput(v) fires while moving. */
export function slider(container, { label, min, max, step, value, format = String, onInput }) {
  sliderCount += 1;
  const id = `slider-${sliderCount}`;
  const output = el("output", { for: id, class: "slider__value" }, format(value));
  const input = el("input", { type: "range", id, min, max, step, value });
  input.addEventListener("input", () => {
    const v = Number(input.value);
    output.textContent = format(v);
    onInput(v);
  });
  container.append(el("label", { class: "slider", for: id },
    el("span", { class: "slider__top" }, el("span", {}, label), output),
    input));
  return {
    get: () => Number(input.value),
    set(v) {
      input.value = String(v);
      output.textContent = format(Number(input.value));
    },
  };
}

/**
 * A grid of numbers. values is an array of rows (numbers or strings; null is drawn as "?").
 * editable makes the cells input fields, onEdit(i, j, text) fires when a cell is typed into.
 */
export function matrixView(container, values, { editable = false, onEdit = () => {}, format = String, label = "" } = {}) {
  const grid = el("div", { class: "matrix", role: "group", "aria-label": label });
  container.replaceChildren(grid);
  let cells = [];
  const show = (v) => (v === null ? "?" : format(v));

  function build(m) {
    const cols = m.length ? m[0].length : 0;
    grid.style.gridTemplateColumns = `repeat(${cols}, var(--cell))`;
    cells = m.map((row, i) => row.map((v, j) => (editable
      ? el("input", {
        class: "matrix__cell",
        type: "text",          // no inputmode="decimal": that keyboard has no minus on iPhone
        autocomplete: "off",
        value: show(v),
        "aria-label": `${label} [${i + 1}, ${j + 1}]`,
        oninput: (e) => onEdit(i, j, e.target.value),
      })
      : el("span", { class: "matrix__cell" }, show(v)))));
    grid.replaceChildren(...cells.flat());
  }

  /** New values; if the shape is the same, the cells are not rebuilt (input focus is kept). */
  function set(m) {
    const same = m.length === cells.length && m.every((row, i) => row.length === cells[i].length);
    if (!same) {
      build(m);
      return;
    }
    m.forEach((row, i) => row.forEach((v, j) => {
      const cell = cells[i][j];
      if (editable) {
        // Write only what changed: while typing the value matches and the caret stays put,
        // and a preset still updates the focused cell (in Safari a button does not take focus from the field).
        if (cell.value !== show(v)) cell.value = show(v);
      } else {
        cell.textContent = show(v);
      }
    }));
  }

  /** Toggles a class on cells: mark("is-row", (i, j) => i === 0). */
  function mark(className, predicate) {
    cells.forEach((row, i) => row.forEach((cell, j) => cell.classList.toggle(className, Boolean(predicate(i, j)))));
  }

  build(values);
  return { set, mark };
}
