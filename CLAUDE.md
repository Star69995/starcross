# Star Crossword — project rules for Claude

## Stack
- Frontend: React 19 + Vite, a hand-rolled CSS design system in `frontend/src/styles/layout.css` (grid + utilities) and `frontend/src/styles/components.css` (buttons, panels, forms, feedback, nav/menu) + `bootstrap-icons` for icons only — no Bootstrap CSS/JS framework, no Tailwind, no CSS-in-JS.
- Backend: Firebase (Firestore + Auth + Hosting), no custom server, no Cloud Functions/Storage (stays on free Spark plan).
- Structure: `frontend/src/components/{auth,board,cards,forms,layout}`, `frontend/src/pages`, `frontend/src/providers`, `frontend/src/services`, `frontend/src/styles`, `frontend/src/utils`.

## Design consistency
- Match the visual language already established across `pages/` and `components/layout` (Navbar/Footer) — spacing, colors, typography, button styles — before introducing new patterns. Prefer the existing classes in `styles/layout.css`/`styles/components.css` (grid: `grid-row`/`col-*`; layout utilities: `flex`, `gap-*`, `mt-*`/`ml-*`/etc.; components: `button*`, `panel*`, `field-*`, `banner*`, `tag*`, `menu*`) over ad hoc custom CSS.
- If a new UI pattern is genuinely needed, check whether it should live in `components/` as a shared piece rather than being styled inline in a single page. A genuinely new *utility or component-level* class (not a one-off) belongs in `styles/layout.css` or `styles/components.css`, not scattered per-page.
- Keep global resets/overrides in `App.css`/`index.css`; avoid scattering one-off global styles inside individual components.

## Component reuse
- Before building new UI, check `components/cards`, `components/forms`, `components/board`, `components/layout` for something that already does the job or can be generalized (e.g. `ContentCard`/`CrosswordCard`/`WordListCard`, `FormCard`/`GenericFormField`).
- Prefer extending an existing shared component (props/variants) over duplicating markup across pages.
- Don't extract a new abstraction for a single use site — only share code once a second real caller exists.

## Responsiveness
- Every new or changed UI must work on phone widths (~360–430px) and iPad widths (~768–1024px), not just desktop — use the grid/breakpoint classes in `styles/layout.css` (`col-*-md`/`col-*-lg`, `hidden-lg`/`block-lg`, container padding) rather than fixed pixel widths.
- Pay particular attention to `components/board` (Crossword/Grid) and `components/forms` — these are the most layout-sensitive areas and easiest to break on small screens.
- Never rely on build/lint/typecheck passing as evidence a UI change works — they don't catch layout, overflow, or RTL positioning bugs. Before considering any UI/layout change done, actually load it in a real browser and look — Playwright is a devDependency in `frontend/` for exactly this (`npx playwright install chromium` once if browsers aren't present). At minimum: launch it headless, load the affected page/state, set the viewport to a phone width (~375px) and an iPad width (~1024px), and check `document.documentElement.scrollWidth <= document.documentElement.clientWidth` (catches horizontal overflow) plus a screenshot for anything positional (dropdowns, popovers, absolute-positioned elements). This is how the account-dropdown overflow bug (`Navbar.jsx`) was found — an inline width cap that was only correct for the desktop floating dropdown silently broke the mobile static one, and nothing short of looking at it in-browser would have caught that.

## Icons, not emojis
- Never use emoji characters in UI copy, labels, commit messages, or docs generated for this project. Use `bootstrap-icons` (`<i className="bi bi-...">`), already a dependency, for any icon/visual marker needed in the UI.
- Always leave a visible gap between an icon and adjacent text — never render `<i className="bi bi-...">` flush against a text node.
- **Important**: `styles/layout.css` defines `ml-*`/`mr-*` as explicit **physical** left/right margins (not `ms-*`/`me-*` logical start/end like Bootstrap 5 used) — this was a deliberate rename during the Bootstrap removal specifically to remove the ambiguity described below. So an icon that comes *before* its text in JSX (renders on the right, with the text to its left, under `dir="rtl"`) needs its gap from `ml-*`; an icon that comes *after* its text needs `mr-*`. When in doubt, check a working example in the same file/area.
- Prefer flex `gap-*` on the shared container (icon and text as flex children) over per-icon margin when possible — it isn't affected by the left/right pitfall at all (see `FormCard.jsx`'s submit button).

## Hebrew-only site / RTL correctness
- This site is Hebrew-only — every user-facing string (labels, buttons, placeholders, validation/error messages, alt text, aria-labels, toasts, page titles) must be in Hebrew. Don't leave English copy in UI-facing text, even temporarily or as a placeholder.
- The whole app must fit RTL fully, not just "not look broken" — text alignment, flex/grid ordering, icon placement, form layout, and any directional cue must match how Hebrew is actually read (right-to-left), per the `ml-*`/`mr-*` physical-class rule in **Icons, not emojis** above and the arrow rules below.
- Never assume a component is RTL-correct just because it inherited `dir="rtl"` from `<html>` — `styles/layout.css`/`styles/components.css` are plain physical-direction CSS (not logical properties), so spacing/order bugs are still easy to introduce silently if you guess from LTR habit instead of checking.
- Always verify Hebrew/RTL correctness before considering any new or changed UI done — reading the JSX is not sufficient. Use the same in-browser check described in **Responsiveness** (Playwright, phone + iPad viewports): visually confirm Hebrew text reads right-to-left, icons/arrows sit on the correct side of their text, and nothing is mirrored incorrectly or left in English.

## RTL arrow direction
- Any directional arrow (character `→`/`←`, or icons like `bi-arrow-left`/`bi-arrow-right`/`bi-chevron-*`) must point the way Hebrew reading actually flows, not the LTR-default direction.
  - "Back / return to previous" flows toward the right (reading start) — use a right-pointing arrow (`bi-arrow-right`, `→`).
  - "Forward / next / continue" flows toward the left (reading end) — use a left-pointing arrow (`bi-arrow-left`, `←`).
  - For a non-navigational "maps to" annotation (e.g. a technical identifier next to its Hebrew explanation), order it so the arrow still reads right-to-left: Hebrew explanation first (right), arrow, identifier last (left) — e.g. `פרופילי משתמשים ← users`, not `users → פרופילי משתמשים`.

## Keeping docs in sync
- When a change affects how the app is run, deployed, or structured (new top-level folder, new major dependency, changed Firebase setup, changed scripts), update the root `README.md` (and `frontend/README.md` if frontend-specific) in the same change.
- When a change meaningfully alters the project's structure, stack, or conventions described above (e.g. adopting a new styling approach, reorganizing `components/`, moving off Bootstrap, adding a backend), update this `CLAUDE.md` file too so these rules stay accurate. Small bug fixes or one-off page tweaks don't require an update.
