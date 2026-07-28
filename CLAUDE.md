# Star Crossword — project rules for Claude

## Stack
- Frontend: React 19 + Vite, Bootstrap 5 (`bootstrap`, `bootstrap-icons`) — no Tailwind, no CSS-in-JS.
- Backend: Firebase (Firestore + Auth + Hosting), no custom server, no Cloud Functions/Storage (stays on free Spark plan).
- Structure: `frontend/src/components/{auth,board,cards,forms,layout}`, `frontend/src/pages`, `frontend/src/providers`, `frontend/src/services`, `frontend/src/utils`.

## Design consistency
- Match the visual language already established across `pages/` and `components/layout` (Navbar/Footer) — spacing, colors, typography, button styles — before introducing new patterns. Prefer Bootstrap's existing utility classes/components over custom CSS.
- If a new UI pattern is genuinely needed, check whether it should live in `components/` as a shared piece rather than being styled inline in a single page.
- Keep global resets/overrides in `App.css`/`index.css`; avoid scattering one-off global styles inside individual components.

## Component reuse
- Before building new UI, check `components/cards`, `components/forms`, `components/board`, `components/layout` for something that already does the job or can be generalized (e.g. `ContentCard`/`CrosswordCard`/`WordListCard`, `FormCard`/`GenericFormField`).
- Prefer extending an existing shared component (props/variants) over duplicating markup across pages.
- Don't extract a new abstraction for a single use site — only share code once a second real caller exists.

## Responsiveness
- **This is critical, not a nice-to-have**: every new or changed UI must always be checked against mobile/small screens and touch input — never assume desktop-only usage. Most real users of this site are on a phone.
- Every new or changed UI must work on phone widths (~360–430px) and iPad widths (~768–1024px), not just desktop — use Bootstrap's grid/breakpoints (`col-*`, `d-*-none`, container padding) rather than fixed pixel widths.
- Pay particular attention to `components/board` (Crossword/Grid) and `components/forms` — these are the most layout-sensitive areas and easiest to break on small screens.
- Design for touch screens as a first-class input, not a fallback from mouse/hover: interactive elements (buttons, icon buttons, grid cells, dropdown items) need a comfortably tappable target (~40–44px), never rely on `:hover` alone to reveal something needed for the interaction (no hover-only tooltips/menus/actions — touch has no hover), and avoid interactions that need precise pointer accuracy or right-click/long-press without a visible touch-friendly alternative.
- Never rely on build/lint/typecheck passing as evidence a UI change works — they don't catch layout, overflow, RTL positioning, or touch-target bugs. Before considering any UI/layout change done, actually load it in a real browser and look — Playwright is a devDependency in `frontend/` for exactly this (`npx playwright install chromium` once if browsers aren't present). At minimum: launch it headless, load the affected page/state, set the viewport to a phone width (~375px) and an iPad width (~1024px), and check `document.documentElement.scrollWidth <= document.documentElement.clientWidth` (catches horizontal overflow) plus a screenshot for anything positional (dropdowns, popovers, absolute-positioned elements). This is how the account-dropdown overflow bug (`Navbar.jsx`) was found — an inline width cap that was only correct for the desktop floating dropdown silently broke the mobile static one, and nothing short of looking at it in-browser would have caught that.

## Icons, not emojis
- Never use emoji characters in UI copy, labels, commit messages, or docs generated for this project. Use `bootstrap-icons` (`<i className="bi bi-...">`), already a dependency, for any icon/visual marker needed in the UI.
- Always leave a visible gap between an icon and adjacent text — never render `<i className="bi bi-...">` flush against a text node.
- **Important/counter-intuitive**: this app loads the standard (non-RTL) `bootstrap.min.css` build while `<html>` is `dir="rtl"` (see `index.html`) — so Bootstrap's `ms-*`/`me-*` spacing utilities are **physical** (`ms-*` = `margin-left`, `me-*` = `margin-right`), they do NOT flip for RTL like true logical properties would. Combined with RTL bidi layout, an icon that comes *before* its text in JSX renders on the right with the text to its left — so the gap must come from `ms-*` (not `me-*`, which is the LTR-intuitive but wrong choice here and produces a zero-width gap). An icon that comes *after* its text needs `me-*` instead. When in doubt, check a working example in the same file/area rather than guessing from LTR habit.
- Prefer flex `gap-*` on the shared container (icon and text as flex children) over per-icon margin when possible — it isn't affected by this physical-vs-logical pitfall at all (see `FormCard.jsx`'s submit button).

## Hebrew-only site / RTL correctness
- This site is Hebrew-only — every user-facing string (labels, buttons, placeholders, validation/error messages, alt text, aria-labels, toasts, page titles) must be in Hebrew. Don't leave English copy in UI-facing text, even temporarily or as a placeholder.
- The whole app must fit RTL fully, not just "not look broken" — text alignment, flex/grid ordering, icon placement, form layout, and any directional cue must match how Hebrew is actually read (right-to-left), per the `ms-*`/`me-*` physical-class gotcha in **Icons, not emojis** above and the arrow rules below.
- Never assume a component is RTL-correct because it inherited `dir="rtl"` from `<html>` — Bootstrap's shipped CSS is the LTR build (see **Icons, not emojis**), so spacing/order bugs are easy to introduce silently.
- Always verify Hebrew/RTL correctness before considering any new or changed UI done — reading the JSX is not sufficient. Use the same in-browser check described in **Responsiveness** (Playwright, phone + iPad viewports): visually confirm Hebrew text reads right-to-left, icons/arrows sit on the correct side of their text, and nothing is mirrored incorrectly or left in English.

## RTL arrow direction
- Any directional arrow (character `→`/`←`, or icons like `bi-arrow-left`/`bi-arrow-right`/`bi-chevron-*`) must point the way Hebrew reading actually flows, not the LTR-default direction.
  - "Back / return to previous" flows toward the right (reading start) — use a right-pointing arrow (`bi-arrow-right`, `→`).
  - "Forward / next / continue" flows toward the left (reading end) — use a left-pointing arrow (`bi-arrow-left`, `←`).
  - For a non-navigational "maps to" annotation (e.g. a technical identifier next to its Hebrew explanation), order it so the arrow still reads right-to-left: Hebrew explanation first (right), arrow, identifier last (left) — e.g. `פרופילי משתמשים ← users`, not `users → פרופילי משתמשים`.

## Keeping docs in sync
- When a change affects how the app is run, deployed, or structured (new top-level folder, new major dependency, changed Firebase setup, changed scripts), update the root `README.md` (and `frontend/README.md` if frontend-specific) in the same change.
- When a change meaningfully alters the project's structure, stack, or conventions described above (e.g. adopting a new styling approach, reorganizing `components/`, moving off Bootstrap, adding a backend), update this `CLAUDE.md` file too so these rules stay accurate. Small bug fixes or one-off page tweaks don't require an update.
