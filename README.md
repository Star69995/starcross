# Star Crossword — Firebase edition

Firebase (Firestore + Authentication + Hosting) reimplementation of the `star-crossword` app.
No custom server: the React app talks to Firestore directly, and Firestore Security Rules
enforce the same authorization rules the old Express backend did (creator-only edit/delete,
any-signed-in-user like/solved toggles, public/private visibility). See `firestore.rules`.

Cloud Functions and Cloud Storage are intentionally **not used** — neither is needed by any
current feature, and both require the paid Blaze plan (linked credit card) even at $0 usage.
This project stays entirely on the free Spark plan.

## Run locally (no real Firebase project needed)

The app can run entirely against the Firebase **emulator suite** — no Firebase project,
no API keys, no credit card. `frontend/.env` already ships with the `demo-*` values this
needs (a `demo-` project ID puts the emulators in fully offline mode).

1. Install the Firebase CLI if you don't have it: `npm install -g firebase-tools`
2. `npm install` (repo root — pulls in `concurrently`)
3. `cd frontend && npm install && cd ..`
4. `npm run dev` (repo root) — starts the Auth + Firestore emulators *and* the Vite dev
   server together, and prints the local URL (usually `http://localhost:5173`).

Sign up a user from the app's Register page like normal — it's writing to the emulator,
not a real backend, so any email/password works and nothing leaves your machine. The
Emulator UI (inspect/edit Firestore docs and Auth users) is at `http://localhost:4000`.

Data **persists between runs**: on shutdown the emulators export their state to
`.emulator-data/` (git-ignored), and the next `npm run dev` imports it back automatically —
so your test users/crosswords are still there next time. Delete that folder to start fresh.
Note: this only happens on a *clean* stop (e.g. Ctrl+C in the terminal); force-killing the
process skips the export.

## One-time setup (for a real Firebase project — deploy / production)

1. `firebase login`
2. Create a Firebase project (Firestore in **Native mode**, Authentication with the
   **Email/Password** sign-in provider enabled): `firebase projects:create`
3. Put the new project's ID into `.firebaserc` (replace `REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID`).
4. In the Firebase Console → Project settings → General → "Your apps" → add a Web app, copy
   its config values into `frontend/.env`, and set `VITE_USE_FIREBASE_EMULATOR=false`
   (see `frontend/.env.example` for the variable names).

## Deploy

```
firebase deploy --only firestore:rules   # push the security rules
cd frontend && npm run build && cd ..
firebase deploy --only hosting           # push the built frontend
```

## What changed vs. the Mongo/Express version

- `src/services/firebase.js` — new: Firebase SDK init.
- `src/services/api.js` — same exported function names/signatures, reimplemented against
  Firestore/Firebase Auth instead of axios/Express. Every crossword/wordList document is
  reshaped on read into the same `{ _id, creator: { _id, userName }, likes, ... }` shape the
  UI already expected from Mongoose's `.populate("creator", "userName")`.
- `src/providers/AuthContext.jsx` — internals swapped to Firebase's `onAuthStateChanged`
  instead of a manual JWT/localStorage flow; the `useAuth()` hook shape is unchanged, so no
  page or component needed to change.
- Firestore document shape stores a flat `creatorId`/`creatorName` (not a nested `creator`
  object) — required because the public feed is read anonymously, and `users/{uid}` also
  holds `email`, which can't be safely exposed via a public per-document read rule.
- No Cloud Functions: user registration is two non-atomic client calls
  (`createUserWithEmailAndPassword` then a Firestore profile write). If the second call ever
  fails, you get an authenticated user with no profile doc — `getCurrentUser()` treats that
  as a normal "no profile yet" state rather than throwing.

## Known gaps (carried over intentionally, not fixed)

- Renaming a user doesn't retroactively update `creatorName` on their past crosswords/word
  lists (no server-side fan-out available on the free plan). Not built — flag if it matters.
- `Profile.jsx`'s profile-details tab (`name`/`bio`/`stats`) was already inconsistent with the
  real user schema before this migration (calls `updateProfile` with the wrong argument count,
  references fields — `bio`, `stats` — that don't exist on the `User` model). Left as-is;
  not something this migration was meant to fix.
