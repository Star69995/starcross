# Star Crossword — frontend

React (Vite) frontend for Star Crossword, a Hebrew (RTL) crossword creation/solving/sharing app.
It talks directly to Firebase (Firestore + Authentication) — there is no custom backend server.
See the [repo root README](../README.md) for local setup (emulator suite), one-time Firebase
project setup, and deploy instructions.

## Stack

- React 19 + Vite
- A hand-rolled CSS design system (`src/styles/layout.css` + `src/styles/components.css`) + Bootstrap Icons for icons only (no Bootstrap CSS/JS framework, no Tailwind, no CSS-in-JS — see [../CLAUDE.md](../CLAUDE.md))
- Firebase SDK (Firestore, Authentication)
- React Router, Joi (form validation), react-toastify

## Structure

- `src/pages/` — one component per route
- `src/components/{auth,board,cards,forms,layout}/` — shared/reusable UI pieces
- `src/providers/` — `AuthContext` (Firebase auth state), `CrosswordContext` (solver board state)
- `src/services/` — `firebase.js` (SDK init), `api.js` (all Firestore/Auth calls)
- `src/styles/` — `layout.css` (grid + utility classes), `components.css` (buttons, panels, forms, feedback, nav/menu)
- `src/utils/` — grid generation, validators, sound helpers

## Scripts

```bash
npm run dev       # start Vite dev server (usually run via `npm run dev` at the repo root instead,
                  # which also starts the Firebase emulators)
npm run build     # production build to dist/
npm run lint      # ESLint
npm run preview   # preview a production build locally
```
