import { useState } from 'react'
import { ImagePlus, X, Loader, Star } from 'lucide-react'
import uploadService from '../../services/uploadService'
import { compressImage, validateImage } from '../../utils/imageTools'

export const MAX_GALLERY = 6

/**
 * GalleryInput — unggah LEBIH DARI SATU gambar untuk satu katalog.
 * Pilih beberapa file sekaligus (multiple), setiap file dikompres lalu
 * di-upload, hasilnya (URL) disimpan di array `images`.
 *
 * @param {string[]} images   — daftar URL gambar tambahan
 * @param {Function} onChange — dipanggil dengan array URL terbaru
 * @param {string}   [cover]  — gambar utama (ditampilkan sebagai #1)
 * @param {Function} [onMakeCover] — jadikan salah satu gambar sebagai cover
 */
export default function GalleryInput({ images, onChange, cover, onMakeCover }) {
  const [busy, setBusy] = useState(0)
  const [error, setError] = useState('')
  const remaining = MAX_GALLERY - images.length

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, remaining)
    e.target.value = ''
    if (!files.length) return
    setError('')
    setBusy(files.length)

    const urls = []
    for (const file of files) {
      const invalid = validateImage(file)
      if (invalid) {
        setError(`${file.name}: ${invalid}`)
        setBusy((n) => n - 1)
        continue
      }
      try {
        const small = await compressImage(file)
        const res = await uploadService.uploadImage(small)
        if (res?.data?.url) urls.push(res.data.url)
      } catch (err) {
        setError(`${file.name}: ${err.message || 'upload failed'}`)
      } finally {
        setBusy((n) => n - 1)
      }
    }
    if (urls.length) onChange([...images, ...urls])
  }

  const remove = (idx) => onChange(images.filter((_, i) => i !== idx))

  return (
    <div className="card-box gallery-input">
      <div className="fieldset-header">
        <div>
          <h2 className="card-box-title">Gallery Images</h2>
          <p className="card-box-desc">
            Upload more than one photo for this item (max {MAX_GALLERY}). Select several files at once.
          </p>
        </div>
        <span className="count">{images.length + (cover ? 1 : 0)} photo{images.length + (cover ? 1 : 0) !== 1 ? 's' : ''}</span>
      </div>

      <div className="gallery-grid">
        {cover && (
          <div className="gallery-thumb gallery-thumb--cover">
            <img src={cover} alt="Cover" />
            <span className="gallery-tag">Cover</span>
          </div>
        )}
        {images.map((url, i) => (
          <div key={`${i}-${url.slice(-24)}`} className="gallery-thumb">
            <img src={url} alt={`Gallery ${i + 1}`} />
            <button type="button" className="gallery-remove" onClick={() => remove(i)} aria-label={`Remove image ${i + 1}`}>
              <X size={13} />
            </button>
            {onMakeCover && (
              <button type="button" className="gallery-cover-btn" onClick={() => onMakeCover(i)} title="Set as cover">
                <Star size={12} /> Cover
              </button>
            )}
          </div>
        ))}
        {Array.from({ length: busy }, (_, i) => (
          <div key={`busy-${i}`} className="gallery-thumb gallery-thumb--busy">
            <Loader size={18} className="spin" />
          </div>
        ))}
        {remaining > 0 && (
          <label className="gallery-add">
            <ImagePlus size={20} />
            <span>Add photos</span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleFiles}
              className="hidden-file-input"
              disabled={busy > 0}
            />
          </label>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}
