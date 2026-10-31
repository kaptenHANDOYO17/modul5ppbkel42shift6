import { useQuery } from '@tanstack/react-query'
import gunService from '../services/gunService'
import GUNS_LOCAL from '../data/guns'
import { queryKeys, findCachedGun } from '../lib/queryClient'

// ---------------------------------------------------------------------------
// useGuns — fetch the product list from the API, with Query Caching.
//
// Returns { guns, loading, error, pagination, refetch, isFetching, updatedAt }.
// Data is served from the TanStack Query cache (memory + localStorage), so
// revisiting the catalog does not hit the API again until the cache is stale.
// ---------------------------------------------------------------------------

const EMPTY = []

export const LOCAL_GUNS = GUNS_LOCAL.map((g, i) => ({ ...g, id: g.id || `local-${i}` }))

const errorText = (err, fallback) => (err ? err.message || fallback : null)

export function useGuns(params = {}) {
  const query = useQuery({
    queryKey: queryKeys.guns(params),
    queryFn: async () => {
      const response = await gunService.getGuns(params)
      if (!response.success) throw new Error(response.message || 'Failed to fetch products.')
      return { data: response.data || [], pagination: response.pagination || null }
    },
  })

  return {
    guns: query.data?.data ?? EMPTY,
    loading: query.isLoading,
    error: errorText(query.error, 'An error occurred while fetching products.'),
    pagination: query.data?.pagination ?? null,
    refetch: query.refetch,
    isFetching: query.isFetching,
    updatedAt: query.dataUpdatedAt,
  }
}

// ---------------------------------------------------------------------------
// useGunById — fetch a single product. Uses any list already in the cache as
// initial data, so opening a product (or a shared link) is instant.
// ---------------------------------------------------------------------------

export const fetchGunById = async (id) => {
  if (String(id).startsWith('local-')) {
    const local = LOCAL_GUNS.find((g) => String(g.id) === String(id))
    if (!local) throw new Error('Product not found.')
    return local
  }
  const response = await gunService.getGunById(id)
  if (!response.success || !response.data) throw new Error(response.message || 'Product not found.')
  return response.data
}

export function useGunById(id) {
  const query = useQuery({
    queryKey: queryKeys.gun(id),
    queryFn: () => fetchGunById(id),
    enabled: id !== undefined && id !== null && id !== '',
    initialData: () => findCachedGun(id),
  })

  return {
    gun: query.data ?? null,
    loading: query.isLoading,
    error: errorText(query.error, 'Failed to load product details.'),
    refetch: query.refetch,
  }
}
