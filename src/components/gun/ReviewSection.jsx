import { useState } from 'react'
import { Star, Send, Loader, ThumbsUp, ThumbsDown, Pencil, Trash2, X, Save } from 'lucide-react'
import { useReviews, useReviewActions } from '../../hooks/useReviews'
import ConfirmModal from '../modals/ConfirmModal'

function StarPicker({ value, onChange, size = 22 }) {
  return (
    <div className="review-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="star-btn"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
        >
          <Star
            size={size}
            fill={n <= value ? 'var(--brass)' : 'none'}
            stroke={n <= value ? 'var(--brass)' : 'var(--steel)'}
          />
        </button>
      ))}
    </div>
  )
}

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return ''
  }
}

/**
 * ReviewSection — full CRUD for reviews + thumbs up / thumbs down.
 * Create: form at top. Read: list. Update/Delete: on your own reviews.
 */
export default function ReviewSection({ gunId }) {
  const { reviews, loading } = useReviews(gunId)
  const { createReview, updateReview, deleteReview, vote, busy } = useReviewActions(gunId)

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [notice, setNotice] = useState(null)

  const [editingId, setEditingId] = useState(null)
  const [editRating, setEditRating] = useState(5)
  const [editComment, setEditComment] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const flash = (type, text) => {
    setNotice({ type, text })
    setTimeout(() => setNotice(null), 3000)
  }

  const localNote = (res) => (res.local ? ' (saved on this device)' : '')

  const handleCreate = async (e) => {
    e.preventDefault()
    const res = await createReview({ rating, comment: comment.trim() })
    setComment('')
    setRating(5)
    flash('success', `Review submitted${localNote(res)}.`)
  }

  const startEdit = (rev) => {
    setEditingId(rev.id)
    setEditRating(rev.rating)
    setEditComment(rev.comment || '')
  }

  const handleUpdate = async (rev) => {
    const res = await updateReview(rev, { rating: editRating, comment: editComment.trim() })
    setEditingId(null)
    flash('success', `Review updated${localNote(res)}.`)
  }

  const handleDelete = async () => {
    const res = await deleteReview(deleteTarget)
    setDeleteTarget(null)
    flash('success', `Review deleted${localNote(res)}.`)
  }

  return (
    <section className="detail-section">
      <h2>Reviews</h2>

      <form className="review-form" onSubmit={handleCreate}>
        <StarPicker value={rating} onChange={setRating} />
        <textarea
          className="review-input"
          rows="3"
          placeholder="Write a short review (optional)…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
        />
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {busy ? <><Loader size={16} className="spin" /> Saving…</> : <><Send size={16} /> Submit Review</>}
        </button>
      </form>

      {notice && <p className={notice.type === 'error' ? 'form-error' : 'form-success'}>{notice.text}</p>}

      {loading ? (
        <p className="detail-loading">Loading reviews…</p>
      ) : reviews.length > 0 ? (
        <ul className="review-list">
          {reviews.map((rev) => (
            <li key={rev.id} className={`review-item${rev.is_mine ? ' review-item--mine' : ''}`}>
              <div className="review-head">
                <span className="review-user">{rev.user_identifier}</span>
                {editingId !== rev.id && (
                  <span className="review-stars-display">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < rev.rating ? 'var(--brass)' : 'none'}
                        stroke={i < rev.rating ? 'var(--brass)' : 'var(--line)'}
                      />
                    ))}
                  </span>
                )}
              </div>

              {editingId === rev.id ? (
                <div className="review-edit">
                  <StarPicker value={editRating} onChange={setEditRating} size={18} />
                  <textarea
                    className="review-input"
                    rows="2"
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    maxLength={500}
                  />
                  <div className="review-edit-actions">
                    <button type="button" className="btn btn--primary btn--sm" onClick={() => handleUpdate(rev)} disabled={busy}>
                      <Save size={14} /> Save
                    </button>
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => setEditingId(null)}>
                      <X size={14} /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                rev.comment && <p className="review-comment">{rev.comment}</p>
              )}

              <div className="review-foot">
                <span className="review-date">
                  {formatDate(rev.created_at)}
                  {rev.updated_at ? ' · edited' : ''}
                </span>
                <div className="review-votes">
                  <button
                    type="button"
                    className={`vote-btn${rev.my_vote === 'up' ? ' vote-btn--active' : ''}`}
                    onClick={() => vote(rev, 'up')}
                    aria-pressed={rev.my_vote === 'up'}
                    aria-label="Thumbs up"
                  >
                    <ThumbsUp size={14} /> {rev.likes}
                  </button>
                  <button
                    type="button"
                    className={`vote-btn${rev.my_vote === 'down' ? ' vote-btn--active vote-btn--down' : ''}`}
                    onClick={() => vote(rev, 'down')}
                    aria-pressed={rev.my_vote === 'down'}
                    aria-label="Thumbs down"
                  >
                    <ThumbsDown size={14} /> {rev.dislikes}
                  </button>
                  {rev.is_mine && editingId !== rev.id && (
                    <>
                      <button type="button" className="vote-btn" onClick={() => startEdit(rev)} aria-label="Edit review">
                        <Pencil size={14} /> Edit
                      </button>
                      <button type="button" className="vote-btn vote-btn--danger" onClick={() => setDeleteTarget(rev)} aria-label="Delete review">
                        <Trash2 size={14} /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="detail-empty">No reviews yet. Be the first!</p>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Review"
        message="Delete your review? This cannot be undone."
        confirmLabel="Delete"
        danger
        loading={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </section>
  )
}
