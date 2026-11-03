// ---------------------------------------------------------------------------
// imageTools — kompres gambar di browser sebelum di-upload.
// Foto HP (3–5 MB) diperkecil ke maks 1280px JPEG ±80% kualitas sehingga
// upload lebih cepat dan ukuran data di database jauh lebih kecil.
// ---------------------------------------------------------------------------

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (e) => {
      URL.revokeObjectURL(url)
      reject(e)
    }
    img.src = url
  })

/**
 * Resize + re-encode an image File. Returns a new File (image/jpeg).
 * Falls back to the original file if the browser cannot decode it.
 */
export async function compressImage(file, maxSide = 1280, quality = 0.8) {
  try {
    const img = await loadImage(file)
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
    const w = Math.round(img.width * scale)
    const h = Math.round(img.height * scale)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    const blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality))
    if (!blob || blob.size >= file.size) return file
    const name = file.name.replace(/\.\w+$/, '') + '.jpg'
    return new File([blob], name, { type: 'image/jpeg' })
  } catch {
    return file
  }
}

export const validateImage = (file) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Allowed formats: .jpg, .jpeg, .png, .webp'
  if (file.size > MAX_IMAGE_BYTES * 4) return 'File is too large (max 20 MB before compression).'
  return null
}
