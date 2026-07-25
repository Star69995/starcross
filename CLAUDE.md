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
- Every new or changed UI must work on phone widths (~360–430px) and iPad widths (~768–1024px), not just desktop — use Bootstrap's grid/breakpoints (`col-*`, `d-*-none`, container padding) rather than fixed pixel widths.
- Pay particular attention to `components/board` (Crossword/Grid) and `components/forms` — these are the most layout-sensitive areas and easiest to break on small screens.
- Manually sanity-check responsive changes (resize/dev-tools device emulation) before considering the work done; don't rely on desktop-only visual review.

## Icons, not emojis
- Never use emoji characters in UI copy, labels, commit messages, or docs generated for this project. Use `bootstrap-icons` (`<i className="bi bi-...">`), already a dependency, for any icon/visual marker needed in the UI.
- Always leave a visible gap between an icon and adjacent text — never render `<i className="bi bi-...">` flush against a text node. Use a spacing utility class on the icon (`me-1`/`me-2` before RTL text, `ms-1`/`ms-2` after it) matching the existing direction convention in that component, not a hardcoded margin/padding value.

## Keeping docs in sync
- When a change affects how the app is run, deployed, or structured (new top-level folder, new major dependency, changed Firebase setup, changed scripts), update the root `README.md` (and `frontend/README.md` if frontend-specific) in the same change.
- When a change meaningfully alters the project's structure, stack, or conventions described above (e.g. adopting a new styling approach, reorganizing `components/`, moving off Bootstrap, adding a backend), update this `CLAUDE.md` file too so these rules stay accurate. Small bug fixes or one-off page tweaks don't require an update.
