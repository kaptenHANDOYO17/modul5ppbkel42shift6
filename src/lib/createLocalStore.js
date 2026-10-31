import { useSyncExternalStore } from 'react'

// ---------------------------------------------------------------------------
// createLocalStore — tiny reactive store persisted to localStorage.
// Every component that calls `useStore()` re-renders when the value changes
// (also across browser tabs via the `storage` event).
// ---------------------------------------------------------------------------

export function createLocalStore(key, fallback) {
  const read = () => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  }

  let state = read()
  const listeners = new Set()
  const emit = () => listeners.forEach((l) => l())

  const get = () => state

  const set = (updater) => {
    state = typeof updater === 'function' ? updater(state) : updater
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch {
      /* storage full / private mode — keep in memory */
    }
    emit()
  }

  const subscribe = (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === key) {
        state = read()
        emit()
      }
    })
  }

  const useStore = () => useSyncExternalStore(subscribe, get, get)

  return { get, set, subscribe, useStore }
}
