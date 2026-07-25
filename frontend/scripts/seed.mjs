// Seeds Firestore (emulator or the live starcross-crossword project) with the
// sample word lists + crossword ported from the old MongoDB project's seed.js.
//
// Usage (run from frontend/):
//   node scripts/seed.mjs --target=emulator     (default)
//   node scripts/seed.mjs --target=production
//   node scripts/seed.mjs --target=production --reset   (delete previously seeded docs first)
//
// Uses the same client SDK the app itself uses (not firebase-admin), signing
// in as a real seed user so the existing Firestore security rules
// (creatorId == request.auth.uid) are satisfied on both emulator and prod.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { initializeApp } from 'firebase/app'
import {
    getAuth,
    connectAuthEmulator,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from 'firebase/auth'
import {
    getFirestore,
    connectFirestoreEmulator,
    collection,
    doc,
    getDoc,
    setDoc,
    addDoc,
    getDocs,
    deleteDoc,
    query,
    where,
} from 'firebase/firestore'
import MakeGrid from '../src/utils/MakeGrid.js'
import { SEED_USER, SEED_WORD_LISTS, SEED_CROSSWORD } from './seedData.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const args = process.argv.slice(2)
const target = (args.find((a) => a.startsWith('--target=')) || '--target=emulator').split('=')[1]
const reset = args.includes('--reset')

if (!['emulator', 'production'].includes(target)) {
    console.error(`Unknown --target "${target}" (expected "emulator" or "production")`)
    process.exit(1)
}

// Minimal .env parser (no dotenv dependency in this project) — reads KEY=VALUE lines.
const parseEnvFile = (path) => {
    const text = readFileSync(path, 'utf-8')
    const env = {}
    for (const line of text.split('\n')) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eq = trimmed.indexOf('=')
        if (eq === -1) continue
        env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
    }
    return env
}

let firebaseConfig
if (target === 'emulator') {
    firebaseConfig = {
        apiKey: 'demo-api-key',
        authDomain: 'demo-star-crossword.firebaseapp.com',
        projectId: 'demo-star-crossword',
        storageBucket: 'demo-star-crossword.firebasestorage.app',
        messagingSenderId: '000000000000',
        appId: '1:000000000000:web:0000000000000000000000',
    }
} else {
    const env = parseEnvFile(join(__dirname, '..', '.env.production'))
    firebaseConfig = {
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.VITE_FIREBASE_APP_ID,
    }
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

if (target === 'emulator') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
}

const usersCol = collection(db, 'users')
const wordListsCol = collection(db, 'wordLists')
const crosswordsCol = collection(db, 'crosswords')

const signInSeedUser = async () => {
    try {
        const cred = await signInWithEmailAndPassword(auth, SEED_USER.email, SEED_USER.password)
        console.log(`Signed in as existing seed user (${SEED_USER.email})`)
        return cred.user.uid
    } catch (error) {
        if (error.code !== 'auth/invalid-credential' && error.code !== 'auth/user-not-found') throw error
    }

    const cred = await createUserWithEmailAndPassword(auth, SEED_USER.email, SEED_USER.password)
    await setDoc(doc(usersCol, cred.user.uid), {
        userName: SEED_USER.userName,
        email: SEED_USER.email,
        photoURL: null,
        createdAt: new Date().toISOString(),
    })
    console.log(`Created seed user (${SEED_USER.email})`)
    return cred.user.uid
}

const deleteExistingByTitle = async (col, uid, title) => {
    const snap = await getDocs(query(col, where('creatorId', '==', uid), where('title', '==', title)))
    for (const d of snap.docs) {
        await deleteDoc(d.ref)
        console.log(`  Deleted existing "${title}" (${d.id})`)
    }
}

const seedWordLists = async (uid, userName) => {
    const created = []
    for (const list of SEED_WORD_LISTS) {
        if (reset) await deleteExistingByTitle(wordListsCol, uid, list.title)

        const existing = await getDocs(
            query(wordListsCol, where('creatorId', '==', uid), where('title', '==', list.title))
        )
        if (!existing.empty) {
            console.log(`Word list "${list.title}" already exists, skipping (use --reset to recreate)`)
            created.push({ id: existing.docs[0].id, ...list })
            continue
        }

        const ref = await addDoc(wordListsCol, {
            title: list.title,
            description: list.description,
            words: list.words,
            isPublic: true,
            creatorId: uid,
            creatorName: userName,
            likes: [],
            createdAt: new Date().toISOString(),
        })
        console.log(`Created word list "${list.title}" (${ref.id})`)
        created.push({ id: ref.id, ...list })
    }
    return created
}

const seedCrossword = async (uid, userName, wordLists) => {
    if (reset) await deleteExistingByTitle(crosswordsCol, uid, SEED_CROSSWORD.title)

    const existing = await getDocs(
        query(crosswordsCol, where('creatorId', '==', uid), where('title', '==', SEED_CROSSWORD.title))
    )
    if (!existing.empty) {
        console.log(`Crossword "${SEED_CROSSWORD.title}" already exists, skipping (use --reset to recreate)`)
        return
    }

    const words = wordLists.flatMap((list) => list.words)
    const gridData = MakeGrid({ size: SEED_CROSSWORD.size, maxWords: SEED_CROSSWORD.maxWords, definitionsList: words })
    // Firestore rejects arrays-of-arrays, so MakeGrid's `grid` (array of row
    // arrays) must be wrapped — mirrors encodeGridData() in ../src/services/api.js.
    const encodedGridData = { ...gridData, grid: gridData.grid.map((row) => ({ cells: row })) }

    const ref = await addDoc(crosswordsCol, {
        title: SEED_CROSSWORD.title,
        description: SEED_CROSSWORD.description,
        isPublic: true,
        crosswordObject: { gridData: encodedGridData },
        creatorId: uid,
        creatorName: userName,
        likes: [],
        solved: [],
        createdAt: new Date().toISOString(),
    })
    console.log(`Created crossword "${SEED_CROSSWORD.title}" (${ref.id})`)
}

const main = async () => {
    console.log(`Seeding target: ${target}${reset ? ' (--reset)' : ''}`)
    const uid = await signInSeedUser()
    const userSnap = await getDoc(doc(usersCol, uid))
    const userName = userSnap.data()?.userName || SEED_USER.userName

    const wordLists = await seedWordLists(uid, userName)
    await seedCrossword(uid, userName, wordLists)

    console.log('Done.')
    process.exit(0)
}

main().catch((err) => {
    console.error('Seeding failed:', err)
    process.exit(1)
})
