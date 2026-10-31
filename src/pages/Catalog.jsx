import { useState, useMemo } from 'react'
import { RefreshCw, Plus, Loader, AlertCircle, PackageOpen, Database, Trash2 } from 'lucide-react'
import { useGuns, LOCAL_GUNS } from '../hooks/useGuns'
import GunCard from '../components/gun/GunCard'
import AdvancedFilter from '../components/common/AdvancedFilter'
import ConfirmModal from '../components/modals/ConfirmModal'
import { useArchive, archiveGun } from '../stores/archiveStore'
import {
  matchesSearch,
  matchesCategory,
  sortItems,
  extractCategories,
} from '../utils/helpers'

const timeAgo = (ts) => {
  if (!ts) return ''
  const s = Math.round((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m} min ago`
  return `${Math.round(m / 60)} hr ago`
}

/**
 * Catalog page — the main product listing.
 *
 * Data source priority:
 *   1. Query cache / live API via useGuns()
 *   2. Local static array when the API is unreachable
 *
 * Archived (soft-deleted) items are hidden here and listed in Profile → Archive.
 */
export default function Catalog({ onNavigate }) {
  const { guns: apiGuns, loading, error, refetch, isFetching, isStale, updatedAt } = useGuns({ limit: 50 })
  const [useLocal, setUseLocal] = useState(false)
  const archive = useArchive()

  const archivedIds = useMemo(() => new Set(archive.map((a) => a.id)), [archive])

  const rawGuns = useMemo(() => {
    const source = useLocal || (error && apiGuns.length === 0) ? LOCAL_GUNS : apiGuns
    return source.filter((g) => !archivedIds.has(String(g.id ?? g.name)))
  }, [apiGuns, error, useLocal, archivedIds])

  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortKey, setSortKey] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  const categories = useMemo(() => extractCategories(rawGuns), [rawGuns])

  const filteredGuns = useMemo(() => {
    const result = rawGuns.filter(
      (g) => matchesSearch(g, search) && matchesCategory(g, activeCategory),
    )
    return sortItems(result, sortKey, sortOrder)
  }, [rawGuns, search, activeCategory, sortKey, sortOrder])

  // ---- soft delete ----
  const [archiveTarget, setArchiveTarget] = useState(null)
  const [toast, setToast] = useState('')

  const handleArchive = () => {
    if (!archiveTarget) return
    archiveGun(archiveTarget)
    setToast(`"${archiveTarget.name}" moved to Archive. Restore it from Profile → Archive.`)
    setArchiveTarget(null)
    setTimeout(() => setToast(''), 3500)
  }

  const showError = !loading && error && !useLocal && apiGuns.length === 0

  return (
    <>
      <section className="masthead">
        <h1 className="display">Hardware, by the spec sheet.</h1>
        <p className="lede">
          A small armory of pistols, rifles, and shotguns. Every piece listed
          with its type, caliber, and price — nothing else.
        </p>
      </section>

      <section>
        <div className="list-head">
          <h2>Current stock</h2>
          <div className="list-head-right">
            <span className="count">
              {filteredGuns.length} piece{filteredGuns.length !== 1 ? 's' : ''}
            </span>
            {onNavigate && (
              <button type="button" className="btn btn--primary btn--sm" onClick={() => onNavigate('Create')}>
                <Plus size={16} /> Add
              </button>
            )}
          </div>
        </div>

        {/* Query cache status — cek juga DevTools → Console */}
        {!useLocal && (
          <div className="cache-bar">
            <Database size={14} />
            <span>
              {isFetching
                ? 'Fetching from API…'
                : updatedAt > 0
                  ? `Query cache · data from ${timeAgo(updatedAt)} · ${isStale ? 'stale' : 'fresh (no API call)'}`
                  : 'Query cache empty'}
              {error && ' · offline, showing cached data'}
            </span>
            <button type="button" className="link-btn" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw size={13} className={isFetching ? 'spin' : ''} /> Refresh
            </button>
            <button type="button" className="link-btn" onClick={() => window.clearCache?.().then(() => refetch())}>
              <Trash2 size={13} /> Clear cache
            </button>
          </div>
        )}

        <AdvancedFilter
          search={search}
          onSearch={setSearch}
          categories={categories}
          activeCategory={activeCategory}
          onCategory={setActiveCategory}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={({ key, order }) => { setSortKey(key); setSortOrder(order) }}
        />

        {loading && (
          <div className="state-box">
            <Loader size={28} className="spin" />
            <p>Loading products…</p>
          </div>
        )}

        {showError && (
          <div className="state-box state-box--error">
            <AlertCircle size={28} />
            <p>{error}</p>
            <div className="state-box__actions">
              <button type="button" className="btn btn--outline" onClick={() => refetch()}>
                <RefreshCw size={16} /> Retry
              </button>
              <button type="button" className="btn btn--outline" onClick={() => setUseLocal(true)}>
                View Local Catalog
              </button>
            </div>
          </div>
        )}

        {!loading && filteredGuns.length === 0 && !showError && (
          <div className="state-box">
            <PackageOpen size={28} />
            <p>No products match your search.</p>
          </div>
        )}

        {filteredGuns.length > 0 && (
          <ul className="stock">
            {filteredGuns.map((gun) => (
              <GunCard
                key={gun.id || gun.name}
                gun={gun}
                onSelect={(g) => onNavigate && onNavigate('Detail', g)}
                onEdit={onNavigate ? (g) => onNavigate('Edit', g) : undefined}
                onDelete={setArchiveTarget}
              />
            ))}
          </ul>
        )}

        {useLocal && (
          <p className="local-notice">
            Showing local catalog (server unavailable).{' '}
            <button type="button" className="link-btn" onClick={() => { setUseLocal(false); refetch() }}>
              Retry server
            </button>
          </p>
        )}
      </section>

      <ConfirmModal
        open={!!archiveTarget}
        title="Move to Archive"
        message={`Archive "${archiveTarget?.name}"? It will be hidden from the catalog (soft delete) and can be restored any time from Profile → Archive.`}
        confirmLabel="Archive"
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />
      {toast && <div className="toast toast--success toast--floating">{toast}</div>}
    </>
  )
}
