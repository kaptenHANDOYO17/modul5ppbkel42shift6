import { useState } from 'react'
import {
  Shield,
  Copy,
  Check,
  Heart,
  FileText,
  Camera,
  Play,
  Pencil,
  Archive,
  ShoppingCart,
  Trash2,
  ArrowRight,
} from 'lucide-react'
import userService from '../services/userService'
import { useFavorites } from '../hooks/useFavorites'
import { useArchive } from '../stores/archiveStore'
import { useCart, cartCount } from '../stores/cartStore'
import { getAllDraftIds, loadDraft, deleteDraft, getDraftTimestamp, formatDraftTime } from '../utils/draftStorage'
import { formatPrice } from '../utils/helpers'
import About from './About'
import Contact from './Contact'

/** Read every saved draft (create + edit) from localStorage. */
const readDrafts = () =>
  getAllDraftIds()
    .map((id) => {
      const draft = loadDraft(id) || {}
      const form = draft.formData || {}
      return {
        id,
        kind: id === 'create' ? 'New item' : `Edit #${id}`,
        name: form.name?.trim() || '(untitled)',
        type: form.type || '',
        price: form.price,
        savedAt: getDraftTimestamp(id) || draft.savedAt,
      }
    })
    .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))

/**
 * ProfilePage — identity, stats, drafts, archive, about & contact.
 */
export default function ProfilePage({ onReplaySplash, onEditProfile, onOpenDraft, onOpenArchive, onOpenCart, notice }) {
  const [profile] = useState(() => userService.getUserProfile())
  const [avatar, setAvatar] = useState(profile.avatar || null)
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState(notice || '')
  const [drafts, setDrafts] = useState(readDrafts)

  const { favorites } = useFavorites()
  const archive = useArchive()
  const cart = useCart()

  const flash = (text) => {
    setFeedback(text)
    setTimeout(() => setFeedback(''), 3000)
  }

  const handleCopyId = () => {
    if (profile.userId) {
      navigator.clipboard.writeText(profile.userId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      flash('Avatar image must be under 2MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      setAvatar(base64)
      userService.updateAvatar(base64)
      flash('Avatar updated.')
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteDraft = (id) => {
    deleteDraft(id)
    setDrafts(readDrafts())
    flash('Draft deleted.')
  }

  return (
    <div className="profile-page">
      <section className="masthead profile-masthead">
        <div>
          <h1 className="display">Operator Profile</h1>
          <p className="lede">Your identity, saved drafts, archive, and shop info.</p>
        </div>
        {onReplaySplash && (
          <button type="button" className="btn btn--outline btn--sm" onClick={onReplaySplash} title="Replay introductory splash animation">
            <Play size={14} /> Replay Intro
          </button>
        )}
      </section>

      {feedback && (
        <div className="toast toast--success">
          <Check size={18} /> {feedback}
        </div>
      )}

      {/* Operator Card */}
      <div className="profile-card">
        <div className="profile-card-top">
          <div className="avatar-wrap">
            {avatar ? (
              <img src={avatar} alt={profile.username} className="avatar-img" />
            ) : (
              <div className="avatar-placeholder">
                <Shield size={36} stroke="var(--brass)" />
              </div>
            )}
            <label htmlFor="avatar-file-input" className="avatar-upload-btn" title="Upload avatar">
              <Camera size={14} />
              <input id="avatar-file-input" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden-file-input" />
            </label>
          </div>

          <div className="profile-identity">
            <h2 className="display">{profile.username || 'Shooter'}</h2>
            <p className="profile-bio">{profile.bio || 'No bio yet.'}</p>
            <div className="profile-id-row">
              <span className="mono-badge">{profile.userId}</span>
              <button type="button" className="icon-btn" onClick={handleCopyId} title="Copy User ID to clipboard">
                {copied ? <Check size={14} color="var(--brass)" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {onEditProfile && (
            <button type="button" className="btn btn--outline btn--sm profile-edit-btn" onClick={onEditProfile}>
              <Pencil size={14} /> Edit Profile
            </button>
          )}
        </div>

        <div className="profile-stats profile-stats--4">
          <div className="stat-item">
            <Heart size={20} className="stat-icon" stroke="var(--brass)" />
            <div className="stat-val">{favorites.length}</div>
            <div className="stat-label">Favorites</div>
          </div>
          <div className="stat-item">
            <FileText size={20} className="stat-icon" stroke="var(--steel)" />
            <div className="stat-val">{drafts.length}</div>
            <div className="stat-label">Drafts</div>
          </div>
          <div className="stat-item">
            <Archive size={20} className="stat-icon" stroke="var(--steel)" />
            <div className="stat-val">{archive.length}</div>
            <div className="stat-label">Archived</div>
          </div>
          <button type="button" className="stat-item stat-item--btn" onClick={onOpenCart}>
            <ShoppingCart size={20} className="stat-icon" stroke="var(--brass)" />
            <div className="stat-val">{cartCount(cart)}</div>
            <div className="stat-label">In cart</div>
          </button>
        </div>
      </div>

      {/* Drafts */}
      <section className="profile-section" id="drafts">
        <h3 className="section-title"><FileText size={18} /> Saved drafts</h3>
        {drafts.length === 0 ? (
          <p className="detail-empty">No drafts. Drafts are saved automatically while you add or edit hardware.</p>
        ) : (
          <ul className="row-list">
            {drafts.map((d) => (
              <li key={d.id} className="row-item">
                <div className="row-info">
                  <span className="name display">{d.name}</span>
                  <span className="type">
                    {d.kind}
                    {d.type ? ` · ${d.type}` : ''}
                    {d.price ? ` · ${formatPrice(d.price)}` : ''}
                    {d.savedAt ? ` · saved ${formatDraftTime(d.savedAt)}` : ''}
                  </span>
                </div>
                <div className="row-actions">
                  {onOpenDraft && (
                    <button type="button" className="btn btn--outline btn--sm" onClick={() => onOpenDraft(d.id)}>
                      Continue <ArrowRight size={14} />
                    </button>
                  )}
                  <button type="button" className="btn btn--danger-ghost btn--sm" onClick={() => handleDeleteDraft(d.id)} aria-label={`Delete draft ${d.name}`}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Archive (soft delete) */}
      <section className="profile-section" id="archive">
        <h3 className="section-title"><Archive size={18} /> Archive</h3>
        {archive.length === 0 ? (
          <p className="detail-empty">Nothing archived. Archived (soft-deleted) items show up here.</p>
        ) : (
          <ul className="row-list">
            {archive.slice(0, 3).map((a) => (
              <li key={a.id} className="row-item">
                <div className="row-info">
                  <span className="name display">{a.gun.name}</span>
                  <span className="type">archived {formatDraftTime(a.archivedAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {onOpenArchive && (
          <button type="button" className="btn btn--outline btn--sm section-cta" onClick={onOpenArchive}>
            Open Archive ({archive.length}) <ArrowRight size={14} />
          </button>
        )}
      </section>

      <About />
      <Contact />
    </div>
  )
}
