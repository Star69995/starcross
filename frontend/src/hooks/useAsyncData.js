import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

// Plain external store (not React state) so refetch/update logic can run from
// inside an effect without tripping react-hooks/set-state-in-effect - state
// changes are pushed to subscribers via useSyncExternalStore instead of a
// useState setter. See https://react.dev/reference/react/useSyncExternalStore
function createAsyncStore() {
    let state = { data: null, loading: true, error: null }
    const listeners = new Set()
    const notify = () => listeners.forEach((listener) => listener())

    return {
        subscribe: (listener) => {
            listeners.add(listener)
            return () => listeners.delete(listener)
        },
        getSnapshot: () => state,
        setData: (updater) => {
            state = { ...state, data: typeof updater === 'function' ? updater(state.data) : updater }
            notify()
        },
        run: async (fetcher) => {
            state = { ...state, loading: true, error: null }
            notify()
            try {
                const data = await fetcher()
                state = { data, loading: false, error: null }
            } catch (error) {
                state = { data: null, loading: false, error }
            }
            notify()
        },
    }
}

// Runs `fetcher` whenever its identity changes (wrap it in useCallback with the
// relevant dependencies) and exposes the result plus helpers for optimistic
// local updates and manual refetching. Pass `enabled: false` to skip running
// it (e.g. while waiting on an upstream condition like auth to settle) - state
// is left untouched, so `loading` stays at whatever it currently is.
export function useAsyncData(fetcher, { enabled = true } = {}) {
    const [store] = useState(createAsyncStore)
    const state = useSyncExternalStore(store.subscribe, store.getSnapshot)
    const refetch = useCallback(() => store.run(fetcher), [store, fetcher])

    useEffect(() => {
        if (enabled) {
            refetch()
        }
    }, [enabled, refetch])

    return { ...state, setData: store.setData, refetch }
}
