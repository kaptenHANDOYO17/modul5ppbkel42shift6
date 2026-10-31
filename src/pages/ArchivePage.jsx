import { useState } from 'react'
import { ArrowLeft, ArchiveRestore, Trash2, Archive } from 'lucide-react'
import { useArchive, restoreGun, removeFromArchive } from '../stores/archiveStore'
import gunService from '../services/gunService'
import { invalidateGuns } from '../lib/queryClient'
import { formatPrice } from '../utils/helpers'
import { formatDraftTime } from '../utils/draftStorage'
import ConfirmModal from '../components/modals/ConfirmModal'

/**
 * ArchivePage — items that were soft-deleted from the catalog.
 * Restore → visible again. Delete permanently → removed from the server.
 */
export default function ArchivePage({ onBack }) {
  const archive = useArchive()
  const [purgeTarget, setPurgeTarget] = useState(null)
  const [purging, setPurging] = useState(false)
  const [message, setMessage] = useState(null)

  const flash = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3500)
  }

  const handleRestore = (entry) => {
    restoreGun(entry.id)
    flash('success', `"${entry.gun.name}" restored to the catalog.`)
  }

  const handlePurge = async () => {
    const entry = purgeTarget
    if (!entry) return
    try {
      setPurging(true)
      if (!entry.id.startsWith('local-')) {
        await gunService.deleteGun(entry.gun.id)
        invalidateGuns(entry.gun.id)
      }
      removeFromArchive(entry.id)
      flash('success', `"${entry.gun.name}" permanently deleted.`)
    } catch (err) {
      flash('error', err.message || 'Failed to delete permanently.')
    } finally {
      setPurging(false)
      setPurgeTarget(null)
    }
  }

  return (
    <div className="page archive-page">
      {onBack && (
        <button type="button" className="detail-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Profile
        </button>
      )}
      <h1 className="display">Archive</h1>
      <p className="lede">
        Soft-deleted hardware. Archived items are hidden from the catalog and favorites,
        but nothing is lost until you delete permanently.
      </p>

      {message && (
        <div className={`toast toast--${message.type}`}>{message.text}</div>
      )}

      {archive.length === 0 ? (
        <div className="state-box">
          <Archive size={28} />
          <p>The archive is empty.</p>
        </div>
      ) : (
        <ul className="row-list">
          {archive.map((entry) => (
            <li key={entry.id} className="row-item">
              <img
                className="row-img"
                src={entry.gun.image_url || entry.gun.image || '/guns/pistol.svg'}
                alt={entry.gun.name}
                loading="lazy"
                decoding="async"
              />
              <div className="row-info">
                <span className="name display">{entry.gun.name}</span>
                <span className="type">
                  {entry.gun.type || entry.gun.category} · {formatPrice(entry.gun.price)} · archived {formatDraftTime(entry.archivedAt)}
                </span>
              </div>
              <div className="row-actions">
                <button type="button" className="btn btn--outline btn--sm" onClick={() => handleRestore(entry)}>
                  <ArchiveRestore size={14} /> Restore
                </button>
                <button type="button" className="btn btn--danger-ghost btn--sm" onClick={() => setPurgeTarget(entry)}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={Boolean(purgeTarget)}
        title="Delete permanently"
        message={`Permanently delete "${purgeTarget?.gun.name}" from the server? This cannot be undone.`}
        confirmLabel="Delete forever"
        danger
        loading={purging}
        onConfirm={handlePurge}
        onCancel={() => setPurgeTarget(null)}
      />
    </div>
  )
}
