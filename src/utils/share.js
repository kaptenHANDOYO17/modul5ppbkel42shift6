// ---------------------------------------------------------------------------
// Share link — every product gets a unique, permanent URL: /?gun=<id>
// Opening that link loads the app straight into that product's detail page.
// ---------------------------------------------------------------------------

export const GUN_PARAM = 'gun'

export const buildShareUrl = (gun) => {
  const url = new URL(window.location.origin + window.location.pathname)
  url.searchParams.set(GUN_PARAM, String(gun.id ?? gun.name))
  return url.toString()
}

export const getGunIdFromUrl = () => {
  try {
    return new URLSearchParams(window.location.search).get(GUN_PARAM)
  } catch {
    return null
  }
}

export const copyText = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for http / older browsers
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  }
}
