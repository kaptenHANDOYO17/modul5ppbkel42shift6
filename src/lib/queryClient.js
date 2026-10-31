import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

// ---------------------------------------------------------------------------
// Query Caching (TanStack Query)
//
// - staleTime 5 menit  → selama 5 menit data dianggap "fresh", berpindah
//   halaman / membuka detail lagi TIDAK memicu request ulang ke API.
// - gcTime 24 jam      → cache disimpan di memori & localStorage (persist)
//   sehingga saat aplikasi dibuka ulang / offline, data langsung tampil.
// ---------------------------------------------------------------------------

export const STALE_TIME = 1000 * 60 * 5
export const CACHE_TIME = 1000 * 60 * 60 * 24

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME,
      gcTime: CACHE_TIME,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const safeStorage = () => {
  try {
    const s = window.localStorage
    s.setItem('__bb_test', '1')
    s.removeItem('__bb_test')
    return s
  } catch {
    return undefined
  }
}

export const persister = createSyncStoragePersister({
  storage: safeStorage(),
  key: 'bore_barrel_query_cache',
  throttleTime: 1000,
})

// Centralised query keys so every hook / mutation uses the same cache entry.
export const queryKeys = {
  guns: (params = {}) => ['guns', params],
  allGuns: ['guns'],
  gun: (id) => ['gun', String(id)],
  reviews: (gunId) => ['reviews', String(gunId)],
}

/** Find a product that is already in any cached list (no network). */
export const findCachedGun = (id) => {
  const key = String(id)
  const lists = queryClient.getQueriesData({ queryKey: queryKeys.allGuns })
  for (const [, value] of lists) {
    const match = value?.data?.find((g) => String(g.id) === key)
    if (match) return match
  }
  return undefined
}

/** Invalidate product caches after create / update / delete. */
export const invalidateGuns = (id) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.allGuns })
  if (id !== undefined && id !== null) {
    queryClient.invalidateQueries({ queryKey: queryKeys.gun(id) })
  }
}
