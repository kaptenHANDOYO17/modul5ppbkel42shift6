import { useState } from 'react'
import { Share2, Copy, Check, X, MessageCircle } from 'lucide-react'
import { buildShareUrl, copyText } from '../../utils/share'

/**
 * ShareButton — opens a small panel with the product's unique link.
 * Copy link, share to WhatsApp, or use the device's native share sheet.
 */
export default function ShareButton({ gun, compact = false }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const url = buildShareUrl(gun)
  const text = `Cek ${gun.name} di Bore & Barrel`
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const handleCopy = async () => {
    if (await copyText(url)) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleNative = async () => {
    try {
      await navigator.share({ title: gun.name, text, url })
    } catch {
      /* user cancelled */
    }
  }

  return (
    <div className="share" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className={compact ? 'card-act-btn' : 'btn btn--outline'}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Share ${gun.name}`}
        title="Share link"
      >
        <Share2 size={compact ? 15 : 16} />
        {!compact && 'Share'}
      </button>

      {/* Panel tampil di tengah layar (fixed) agar tidak terpotong oleh kartu / kotak detail */}
      {open && <div className="share-backdrop" onClick={() => setOpen(false)} />}
      {open && (
        <div className="share-panel share-panel--floating" role="dialog" aria-label="Share link">
          <div className="share-panel-head">
            <strong>Share this piece</strong>
            <button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close">
              <X size={14} />
            </button>
          </div>
          <div className="share-url-row">
            <input className="form-input share-url" value={url} readOnly onFocus={(e) => e.target.select()} />
            <button type="button" className="btn btn--primary btn--sm" onClick={handleCopy}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="share-actions">
            <a
              className="btn btn--outline btn--sm"
              href={`https://wa.me/?text=${encodeURIComponent(`${text}: ${url}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
            {canNativeShare && (
              <button type="button" className="btn btn--outline btn--sm" onClick={handleNative}>
                <Share2 size={14} /> More…
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
