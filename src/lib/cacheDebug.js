import { STALE_TIME } from './queryClient'

// ---------------------------------------------------------------------------
// Cache debugger — membuat Query Caching TERLIHAT di DevTools Console.
//
//   [Query Cache] HIT    → data diambil dari cache, TIDAK ada request ke API
//   [Query Cache] STALE  → data cache ditampilkan, lalu diperbarui di background
//   [Query Cache] FETCH  → cache kosong / kedaluwarsa → request ke API
//   [Query Cache] STORED → hasil API disimpan ke cache (memori + localStorage)
//
// Ketik di Console:  cacheStatus()  → tabel isi cache
//                    clearCache()   → kosongkan semua cache (untuk demo MISS)
// ---------------------------------------------------------------------------

export const API_CACHE_NAME = 'supabase-api-cache'
const PERSIST_KEY = 'bore_barrel_query_cache'

const BADGE = {
  HIT: 'background:#1e8449;color:#fff;padding:2px 6px;border-radius:3px;font-weight:700',
  STALE: 'background:#a67c2e;color:#fff;padding:2px 6px;border-radius:3px;font-weight:700',
  FETCH: 'background:#c0392b;color:#fff;padding:2px 6px;border-radius:3px;font-weight:700',
  STORED: 'background:#1e2a35;color:#fff;padding:2px 6px;border-radius:3px;font-weight:700',
  RESTORED: 'background:#5a6673;color:#fff;padding:2px 6px;border-radius:3px;font-weight:700',
}

const label = (key) => key.map((k) => (typeof k === 'object' ? JSON.stringify(k) : k)).join(' ')
const ageOf = (ts) => (ts ? `${Math.round((Date.now() - ts) / 1000)}s` : '-')
const sizeOf = (data) => {
  const list = Array.isArray(data) ? data : data?.data ?? data?.list
  return Array.isArray(list) ? `${list.length} item` : data ? '1 item' : '0 item'
}

export const cacheLog = (type, key, msg) =>
  console.log(`%c${type}%c [Query Cache] ${key} — ${msg}`, BADGE[type], 'color:inherit')

export function attachCacheDebugger(queryClient) {
  const cache = queryClient.getQueryCache()
  const lastHit = new Map()

  cache.subscribe((event) => {
    const q = event.query
    if (!q) return
    const key = label(q.queryKey)

    if (event.type === 'observerAdded' && q.state.data !== undefined) {
      // StrictMode mounts twice in dev — log once per 500 ms per key
      const now = Date.now()
      if (now - (lastHit.get(key) || 0) < 500) return
      lastHit.set(key, now)
      if (!q.isStaleByTime(STALE_TIME)) {
        cacheLog('HIT', key, `dari cache (umur ${ageOf(q.state.dataUpdatedAt)}, ${sizeOf(q.state.data)}) · TIDAK ada request ke API`)
      } else {
        cacheLog('STALE', key, `dari cache (umur ${ageOf(q.state.dataUpdatedAt)}) · diperbarui di background`)
      }
    }

    if (event.type === 'updated' && event.action?.type === 'fetch') {
      cacheLog('FETCH', key, q.state.data === undefined ? 'cache kosong → request ke API' : 'cache kedaluwarsa → request ke API')
    }

    if (event.type === 'updated' && event.action?.type === 'success' && !event.action.manual) {
      cacheLog('STORED', key, `${sizeOf(q.state.data)} disimpan ke cache selama ${STALE_TIME / 60000} menit`)
    }
  })

  // ---- Console helpers ----
  window.cacheStatus = async () => {
    const rows = cache.getAll().map((q) => ({
      query: label(q.queryKey),
      status: q.state.status,
      isi: sizeOf(q.state.data),
      umur: ageOf(q.state.dataUpdatedAt),
      fresh: q.state.data !== undefined && !q.isStaleByTime(STALE_TIME),
    }))
    console.log('%c[Query Cache] TanStack Query (memori + localStorage)', 'font-weight:700')
    console.table(rows)
    if ('caches' in window) {
      const c = await caches.open(API_CACHE_NAME)
      const keys = await c.keys()
      console.log(`%c[Service Worker Cache] ${API_CACHE_NAME}: ${keys.length} response`, 'font-weight:700')
      console.table(keys.map((r) => ({ url: decodeURIComponent(r.url.replace(/^https?:\/\/[^/]+/, '')) })))
    }
    return `${rows.length} query di cache`
  }

  window.clearCache = async () => {
    queryClient.clear()
    try { localStorage.removeItem(PERSIST_KEY) } catch { /* ignore */ }
    if ('caches' in window) await caches.delete(API_CACHE_NAME)
    console.log('%c[Query Cache] semua cache dikosongkan — reload halaman untuk melihat FETCH lalu HIT', 'font-weight:700')
    return 'cache cleared'
  }

  console.log(
    '%cBore & Barrel%c Query Caching aktif (TanStack Query + Service Worker).\n' +
      'Ketik cacheStatus() untuk melihat isi cache, clearCache() untuk mengosongkan.',
    'background:#18222c;color:#fff;padding:3px 8px;border-radius:3px;font-weight:700',
    'color:inherit',
  )
}
