import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    EmailAuthProvider,
    GoogleAuthProvider,
    signInWithPopup,
    reauthenticateWithCredential,
    updatePassword as firebaseUpdatePassword,
} from 'firebase/auth'
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    arrayUnion,
    arrayRemove,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import MakeGrid from '../utils/MakeGrid'

const usersCol = collection(db, 'users')
const crosswordsCol = collection(db, 'crosswords')
const wordListsCol = collection(db, 'wordLists')

// Firebase Auth throws error.code (e.g. "auth/invalid-credential"); translate the
// ones the UI already string-matches against (see Login.jsx / Register.jsx) so
// those pages keep working unchanged.
const AUTH_ERROR_MESSAGES = {
    'auth/user-not-found': 'User not found',
    'auth/wrong-password': 'Invalid email or password',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/invalid-email': '"email" must be a valid email',
    'auth/email-already-in-use': 'User already registered',
    'auth/weak-password': 'Password is too weak',
}

const authError = (error) => new Error(AUTH_ERROR_MESSAGES[error.code] || error.message)

const requireUid = () => {
    if (!auth.currentUser) throw new Error('Please login first')
    return auth.currentUser.uid
}

const toClientUser = (uid, data) => ({
    _id: uid,
    userName: data.userName,
    email: data.email,
    photoURL: data.photoURL || null,
    createdAt: data.createdAt,
})

// Firestore rejects arrays-of-arrays, so MakeGrid's `grid` (an array of row
// arrays) can't be stored as-is — wrap each row in a map so the outer array
// only ever contains objects.
const encodeGridData = (gridData) => ({
    ...gridData,
    grid: gridData.grid.map((row) => ({ cells: row })),
})

const decodeGridData = (gridData) => ({
    ...gridData,
    grid: gridData.grid.map((row) => row.cells),
})

// Firestore stores a flat creatorId/creatorName; reshape to the nested
// `creator: {_id, userName}` object the UI expects (matches the old
// Mongoose `.populate("creator", "userName")` shape).
const toClientDoc = (docSnap) => {
    const { creatorId, creatorName, ...rest } = docSnap.data()
    if (rest.crosswordObject?.gridData) {
        rest.crosswordObject = { ...rest.crosswordObject, gridData: decodeGridData(rest.crosswordObject.gridData) }
    }
    return {
        _id: docSnap.id,
        ...rest,
        creator: { _id: creatorId, userName: creatorName },
    }
}

// Auth endpoints
export const register = async (userData) => {
    let credential
    try {
        credential = await createUserWithEmailAndPassword(auth, userData.email, userData.password)
    } catch (error) {
        throw authError(error)
    }

    const profile = {
        userName: userData.userName,
        email: userData.email,
        photoURL: null,
        createdAt: new Date().toISOString(),
    }
    await setDoc(doc(usersCol, credential.user.uid), profile)

    return { message: 'User registered', user: toClientUser(credential.user.uid, profile) }
}

export const login = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
        throw authError(error)
    }
    return { message: 'Login successful' }
}

// Signs in with a Google popup; on a user's first Google sign-in, also creates
// their Firestore profile doc (mirrors what register() does for email/password).
export const loginWithGoogle = async () => {
    let credential
    try {
        credential = await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (error) {
        throw authError(error)
    }

    const userRef = doc(usersCol, credential.user.uid)
    const existing = await getDoc(userRef)
    if (!existing.exists()) {
        const profile = {
            userName: credential.user.displayName || credential.user.email.split('@')[0],
            email: credential.user.email,
            photoURL: credential.user.photoURL || null,
            createdAt: new Date().toISOString(),
        }
        await setDoc(userRef, profile)
    }

    return { message: 'Login successful' }
}

export const logout = () => firebaseSignOut(auth)

export const getCurrentUser = async () => {
    if (!auth.currentUser) return null
    const snap = await getDoc(doc(usersCol, auth.currentUser.uid))
    if (!snap.exists()) return null
    return toClientUser(auth.currentUser.uid, snap.data())
}

export const updateProfile = async (userId, profileData) => {
    const allowedFields = ['userName']
    const updateFields = Object.fromEntries(
        Object.entries(profileData).filter(([key]) => allowedFields.includes(key))
    )
    await updateDoc(doc(usersCol, userId), updateFields)
    const snap = await getDoc(doc(usersCol, userId))
    return toClientUser(userId, snap.data())
}

export const changePassword = async (currentPassword, newPassword) => {
    const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword)
    await reauthenticateWithCredential(auth.currentUser, credential)
    await firebaseUpdatePassword(auth.currentUser, newPassword)
    return { message: 'Password changed' }
}

// Crossword endpoints
export const getCrosswords = async () => {
    const snap = await getDocs(query(crosswordsCol, where('isPublic', '==', true)))
    return snap.docs.map(toClientDoc)
}

export const getCrosswordById = async (id) => {
    const snap = await getDoc(doc(crosswordsCol, id))
    if (!snap.exists()) throw new Error('Crossword not found or you are not the creator')
    return toClientDoc(snap)
}

export const getMyCrosswords = async () => {
    const uid = requireUid()
    const snap = await getDocs(query(crosswordsCol, where('creatorId', '==', uid)))
    return snap.docs.map(toClientDoc)
}

export const createCrossword = async (crosswordData) => {
    const uid = requireUid()
    const userSnap = await getDoc(doc(usersCol, uid))

    // for each list retrieve the words with a Firestore read and connect them to one list
    const words = []
    for (const wordListId of crosswordData.wordListIds) {
        const wordList = await getWordListById(wordListId)
        words.push(...wordList.words)
    }

    const gridData = MakeGrid({
        size: crosswordData.size,
        maxWords: crosswordData.maxWords,
        definitionsList: words,
    })

    const crossword = {
        title: crosswordData.title,
        description: crosswordData.description,
        isPublic: Boolean(crosswordData.isPublic),
        crosswordObject: { gridData: encodeGridData(gridData) },
        creatorId: uid,
        creatorName: userSnap.data()?.userName,
        likes: [],
        solved: [],
        createdAt: new Date().toISOString(),
    }

    const ref = await addDoc(crosswordsCol, crossword)
    const snap = await getDoc(ref)
    return { message: 'Crossword created', crossword: toClientDoc(snap) }
}

export const updateCrossword = async (id, crosswordData) => {
    const allowedFields = ['title', 'description', 'crosswordObject', 'isPublic']
    const updateFields = Object.fromEntries(
        Object.entries(crosswordData).filter(([key]) => allowedFields.includes(key))
    )
    if (updateFields.crosswordObject?.gridData) {
        updateFields.crosswordObject = { ...updateFields.crosswordObject, gridData: encodeGridData(updateFields.crosswordObject.gridData) }
    }
    await updateDoc(doc(crosswordsCol, id), updateFields)
    const snap = await getDoc(doc(crosswordsCol, id))
    return { message: 'Crossword updated', crossword: toClientDoc(snap) }
}

export const deleteCrossword = async (id) => {
    await deleteDoc(doc(crosswordsCol, id))
    return { message: 'Crossword deleted' }
}

export const toggleLikeCrossword = async (id) => {
    const uid = requireUid()
    const ref = doc(crosswordsCol, id)
    const snap = await getDoc(ref)
    const liked = (snap.data()?.likes || []).includes(uid)
    await updateDoc(ref, { likes: liked ? arrayRemove(uid) : arrayUnion(uid) })
    const updated = await getDoc(ref)
    return { message: 'Crossword updated', crossword: toClientDoc(updated) }
}

export const markCrosswordSolved = async (id) => {
    const uid = requireUid()
    const ref = doc(crosswordsCol, id)
    await updateDoc(ref, { solved: arrayUnion(uid) })
    const snap = await getDoc(ref)
    return { message: 'Crossword updated', crossword: toClientDoc(snap) }
}

export const unmarkCrosswordSolved = async (id) => {
    const uid = requireUid()
    const ref = doc(crosswordsCol, id)
    await updateDoc(ref, { solved: arrayRemove(uid) })
    const snap = await getDoc(ref)
    return { message: 'Crossword updated', crossword: toClientDoc(snap) }
}

export const updateCrosswordVisibility = async (id, isPublic) => {
    const ref = doc(crosswordsCol, id)
    await updateDoc(ref, { isPublic: Boolean(isPublic) })
    const snap = await getDoc(ref)
    return { message: 'Crossword updated', crossword: toClientDoc(snap) }
}

// Word list endpoints
export const createWordList = async (wordListData) => {
    const uid = requireUid()
    const userSnap = await getDoc(doc(usersCol, uid))

    const wordlist = {
        title: wordListData.title,
        description: wordListData.description,
        words: wordListData.words,
        isPublic: Boolean(wordListData.isPublic),
        creatorId: uid,
        creatorName: userSnap.data()?.userName,
        likes: [],
        createdAt: new Date().toISOString(),
    }

    const ref = await addDoc(wordListsCol, wordlist)
    const snap = await getDoc(ref)
    return { message: 'Word list created', wordlist: toClientDoc(snap) }
}

export const getWordLists = async () => {
    const snap = await getDocs(query(wordListsCol, where('isPublic', '==', true)))
    return snap.docs.map(toClientDoc)
}

export const getWordListById = async (id) => {
    const snap = await getDoc(doc(wordListsCol, id))
    if (!snap.exists()) throw new Error('Word list not found or you are not the creator')
    return toClientDoc(snap)
}

export const getMyWordLists = async () => {
    const uid = requireUid()
    const snap = await getDocs(query(wordListsCol, where('creatorId', '==', uid)))
    return snap.docs.map(toClientDoc)
}

export const updateWordList = async (id, wordListData) => {
    const allowedFields = ['title', 'description', 'words', 'isPublic']
    const updateFields = Object.fromEntries(
        Object.entries(wordListData).filter(([key]) => allowedFields.includes(key))
    )
    await updateDoc(doc(wordListsCol, id), updateFields)
    const snap = await getDoc(doc(wordListsCol, id))
    return { message: 'Word list updated', wordlist: toClientDoc(snap) }
}

export const deleteWordList = async (id) => {
    await deleteDoc(doc(wordListsCol, id))
    return { message: 'Word list deleted' }
}

export const toggleLikeWordList = async (id) => {
    const uid = requireUid()
    const ref = doc(wordListsCol, id)
    const snap = await getDoc(ref)
    const liked = (snap.data()?.likes || []).includes(uid)
    await updateDoc(ref, { likes: liked ? arrayRemove(uid) : arrayUnion(uid) })
    const updated = await getDoc(ref)
    return { message: 'Word list updated', wordlist: toClientDoc(updated) }
}
