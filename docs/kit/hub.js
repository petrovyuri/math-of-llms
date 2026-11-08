// Home page of the site: module cards with a list of demos.
// Pure functions without the DOM - tests/hub.test.js checks them.
import { isFree } from "./access.js";

/**
 * Cards: modules that have demos, by number; demos inside a card by lesson (ties keep registry order).
 * demos are the entries of demos.json, modules are modules.json ({ module, title, about }).
 */
export function buildCatalog(demos, modules) {
  const numbers = [...new Set(demos.map((demo) => demo.module))].sort((a, b) => a - b);
  return numbers.map((module) => {
    const entry = modules.find((m) => m.module === module);
    if (!entry) throw new Error(`modules.json: no description for module ${module}`);
    const list = demos.filter((demo) => demo.module === module)
      .map((demo, order) => ({ demo, order }))
      .sort((a, b) => a.demo.lesson - b.demo.lesson || a.order - b.order)
      .map(({ demo }) => ({ slug: demo.slug, title: demo.title, about: demo.about, lesson: demo.lesson, href: `${demo.slug}/` }));
    return { module, title: entry.title, about: entry.about, free: isFree(module), demos: list };
  });
}

/** Banner before the locked cards: "Another 12 demos in 3 modules open inside the course lessons on Stepik." */
export function lockedText(catalog) {
  const locked = catalog.filter((card) => !card.free);
  if (locked.length === 0) return "";
  const demos = locked.reduce((sum, card) => sum + card.demos.length, 0);
  return `Another ${countText(demos, locked.length)} ${demos === 1 ? "opens" : "open"} inside the course lessons on Stepik.`;
}

/** "29 demos in 8 modules", "1 demo in 1 module". */
export function countText(demoCount, moduleCount) {
  return `${demoCount} ${demoCount === 1 ? "demo" : "demos"} in ${moduleCount} ${moduleCount === 1 ? "module" : "modules"}`;
}
