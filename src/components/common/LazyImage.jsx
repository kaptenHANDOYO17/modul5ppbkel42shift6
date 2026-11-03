import { useEffect, useRef, useState } from 'react'

/**
 * LazyImage — gambar baru dimuat ketika (hampir) terlihat di layar.
 *
 * Memakai IntersectionObserver: selama gambar belum masuk viewport, atribut
 * `src` belum diisi sehingga browser BELUM mengunduh gambar itu. Saat user
 * scroll dan gambar mendekati layar (rootMargin 100px), `src` diisi dan
 * gambar diunduh → di DevTools › Network (filter Img) request muncul bertahap.
 * Selama menunggu, tampil placeholder abu-abu (skeleton).
 */
export default function LazyImage({ src, alt, className = '', rootMargin = '100px', ...rest }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (visible) return undefined
    const el = ref.current
    if (!el) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [visible, rootMargin])

  return (
    <img
      ref={ref}
      src={visible ? src : undefined}
      data-src={src}
      alt={alt}
      className={`${className} lazy-img${loaded ? ' lazy-img--loaded' : ''}`}
      loading="lazy"
      decoding="async"
      onLoad={() => setLoaded(true)}
      {...rest}
    />
  )
}
