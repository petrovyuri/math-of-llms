// Access to demos outside the course. The first five home-page cards are free; the other demos
// are shown inside Stepik lessons, and a direct link shows a stub with a course button.
// The protection is soft: the site and its code are public, and the rule only filters out casual visitors.
// Pure functions without the DOM - tests/access.test.js checks them.

export const COURSE_URL = "https://stepik.org/a/305484";
// First line of out_en/course/title.txt; tests/site.test.js checks that they match.
export const COURSE_NAME = "The Math of LLMs: Build Your Own ChatGPT from Scratch";
export const FREE_MODULES = [2, 3, 5, 6, 7];   // the first five home-page cards (modules 1 and 4 have no demos)

const STEPIK = /^https:\/\/([a-z0-9-]+\.)*stepik\.org(\/|$)/;
const LOCAL = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function isFree(module) {
  return FREE_MODULES.includes(module);
}

/** Module number from a demo page address: "/.../m08/attention-steps/" gives 8, outside mNN/ gives null. */
export function moduleOf(pathname) {
  const match = /\/m(\d{2})\/[a-z0-9-]+\//.exec(pathname);
  return match ? Number(match[1]) : null;
}

/** Address of the iframe's parent page: ancestorOrigins (Chrome, Safari), else the referrer, else null. */
export function parentOrigin(ancestorOrigins, referrer) {
  const first = ancestorOrigins?.[0];
  if (first && first !== "null") return first;
  if (!referrer) return null;
  try {
    return new URL(referrer).origin;
  } catch {
    return null;
  }
}

/**
 * Whether the demo may be shown. A locked module is open on a local server, via a link from Stepik,
 * and in an iframe on Stepik. It is also open in an iframe with an unknown parent: the Stepik app
 * and Firefox may not report the parent, and a lesson must not break for paying students.
 */
export function canShow({ module, host, framed, parent, referrer }) {
  if (module === null || isFree(module) || LOCAL.has(host)) return true;
  if (STEPIK.test(referrer ?? "")) return true;
  if (framed) return parent === null || STEPIK.test(parent);
  return false;
}
