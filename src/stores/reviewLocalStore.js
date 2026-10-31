import { createLocalStore } from '../lib/createLocalStore'

// ---------------------------------------------------------------------------
// Local review layer.
// - added:   reviews created while the server is unreachable / for local items
// - edited:  overrides when the server refuses an update (RLS / offline)
// - deleted: tombstones when the server refuses a delete
// - votes:   thumbs up / down chosen by this device  { [reviewId]: 'up'|'down' }
// ---------------------------------------------------------------------------

const store = createLocalStore('bore_barrel_reviews_local', {
  added: {},
  edited: {},
  deleted: {},
  votes: {},
})

export const useReviewLocal = store.useStore
export const getReviewLocal = store.get

export const addLocalReview = (gunId, review) =>
  store.set((s) => ({
    ...s,
    added: { ...s.added, [gunId]: [review, ...(s.added[gunId] || [])] },
  }))

export const updateLocalReview = (gunId, reviewId, patch) =>
  store.set((s) => ({
    ...s,
    added: {
      ...s.added,
      [gunId]: (s.added[gunId] || []).map((r) => (r.id === reviewId ? { ...r, ...patch } : r)),
    },
  }))

export const removeLocalReview = (gunId, reviewId) =>
  store.set((s) => ({
    ...s,
    added: { ...s.added, [gunId]: (s.added[gunId] || []).filter((r) => r.id !== reviewId) },
  }))

export const overrideReview = (reviewId, patch) =>
  store.set((s) => ({ ...s, edited: { ...s.edited, [reviewId]: { ...s.edited[reviewId], ...patch } } }))

export const tombstoneReview = (reviewId) =>
  store.set((s) => ({ ...s, deleted: { ...s.deleted, [reviewId]: true } }))

export const toggleVote = (reviewId, direction) =>
  store.set((s) => {
    const votes = { ...s.votes }
    if (votes[reviewId] === direction) delete votes[reviewId]
    else votes[reviewId] = direction
    return { ...s, votes }
  })
