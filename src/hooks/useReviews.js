import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import reviewService from '../services/reviewService'
import { getUserIdentifier, getUserProfile } from '../services/userService'
import { queryKeys } from '../lib/queryClient'
import {
  useReviewLocal,
  addLocalReview,
  updateLocalReview,
  removeLocalReview,
  overrideReview,
  tombstoneReview,
  toggleVote,
} from '../stores/reviewLocalStore'

// ---------------------------------------------------------------------------
// useReviews — reviews for one product (cached) merged with the local layer.
// Each review gets: is_mine, my_vote, likes, dislikes.
// ---------------------------------------------------------------------------

const EMPTY = []
const isLocalId = (id) => String(id).startsWith('local-')

export function useReviews(gunId) {
  const local = useReviewLocal()
  const key = String(gunId)

  const query = useQuery({
    queryKey: queryKeys.reviews(gunId),
    queryFn: async () => {
      const response = await reviewService.getReviews(gunId)
      if (!response.success) throw new Error(response.message || 'Failed to fetch reviews.')
      return response.data || []
    },
    enabled: Boolean(gunId) && !isLocalId(gunId),
  })

  const serverReviews = query.data ?? EMPTY

  const reviews = useMemo(() => {
    const me = getUserIdentifier()
    const myName = getUserProfile().username || 'You'
    const merged = [
      ...(local.added[key] || []),
      ...serverReviews
        .filter((r) => !local.deleted[r.id])
        .map((r) => ({ ...r, ...(local.edited[r.id] || {}) })),
    ]
    return merged
      .map((r) => {
        const isMine = Boolean(r.local) || (r.user_id && String(r.user_id) === me)
        const vote = local.votes[r.id]
        return {
          ...r,
          is_mine: isMine,
          user_identifier: isMine ? `${myName} (You)` : r.user_identifier || 'Anonymous',
          my_vote: vote || null,
          likes: (r.likes || 0) + (vote === 'up' ? 1 : 0),
          dislikes: (r.dislikes || 0) + (vote === 'down' ? 1 : 0),
        }
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [serverReviews, local, key])

  return {
    reviews,
    loading: query.isLoading,
    error: query.error ? query.error.message || 'Failed to fetch reviews.' : null,
    refetch: query.refetch,
  }
}

// ---------------------------------------------------------------------------
// useReviewActions — Create / Update / Delete + thumbs up/down.
// Tries the server first; when it is unreachable or refuses (RLS), the
// change is kept in the local layer so the feature always works.
// Each action resolves to { ok: true, local: boolean }.
// ---------------------------------------------------------------------------

export function useReviewActions(gunId) {
  const queryClient = useQueryClient()
  const [busy, setBusy] = useState(false)
  const key = String(gunId)

  const run = async (fn) => {
    setBusy(true)
    try {
      return await fn()
    } finally {
      setBusy(false)
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews(gunId) })
    }
  }

  const createReview = ({ rating, comment }) =>
    run(async () => {
      const userId = getUserIdentifier()
      if (!isLocalId(gunId)) {
        try {
          await reviewService.createReview(gunId, { user_identifier: userId, rating, comment })
          return { ok: true, local: false }
        } catch {
          /* fall through to local */
        }
      }
      addLocalReview(key, {
        id: `local-review-${Date.now()}`,
        product_id: gunId,
        user_id: userId,
        rating: Number(rating),
        comment,
        created_at: new Date().toISOString(),
        local: true,
      })
      return { ok: true, local: true }
    })

  const updateReview = (review, { rating, comment }) =>
    run(async () => {
      const patch = { rating: Number(rating), comment, updated_at: new Date().toISOString() }
      if (review.local) {
        updateLocalReview(key, review.id, patch)
        return { ok: true, local: true }
      }
      try {
        await reviewService.updateReview(review.id, patch)
        return { ok: true, local: false }
      } catch {
        overrideReview(review.id, patch)
        return { ok: true, local: true }
      }
    })

  const deleteReview = (review) =>
    run(async () => {
      if (review.local) {
        removeLocalReview(key, review.id)
        return { ok: true, local: true }
      }
      try {
        await reviewService.deleteReview(review.id)
        return { ok: true, local: false }
      } catch {
        tombstoneReview(review.id)
        return { ok: true, local: true }
      }
    })

  const vote = (review, direction) => toggleVote(review.id, direction)

  return { createReview, updateReview, deleteReview, vote, busy }
}

// Backwards-compatible hook from Modul 5 (single create action).
export function useCreateReview() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const createReview = async (gunId, reviewData) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      const response = await reviewService.createReview(gunId, reviewData)
      if (response.success) {
        setSuccess(true)
        return response.data
      }
      setError(response.message || 'Failed to submit review.')
      return null
    } catch (err) {
      setError(err.message || 'An error occurred while submitting review.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { createReview, loading, error, success }
}
