import { useState, useEffect, lazy, Suspense } from 'react'
import { Loader, AlertCircle } from 'lucide-react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import PWABadge from './components/PWABadge.jsx'
import ConfirmModal from './components/modals/ConfirmModal.jsx'
import SplashScreen from './components/common/SplashScreen.jsx'
import { useGunById, LOCAL_GUNS } from './hooks/useGuns.js'
import { queryClient, queryKeys, findCachedGun, invalidateGuns } from './lib/queryClient.js'
import { archiveGun, isArchived } from './stores/archiveStore.js'
import { getGunIdFromUrl, GUN_PARAM } from './utils/share.js'
import './App.css'

// ---------------------------------------------------------------------------
// Lazy load — setiap halaman dipecah menjadi chunk JS sendiri dan baru
// diunduh ketika halaman itu dibuka (React.lazy + Suspense).
// ---------------------------------------------------------------------------
const Catalog = lazy(() => import('./pages/Catalog.jsx'))
const FavoritesPage = lazy(() => import('./pages/FavoritesPage.jsx'))
const CartPage = lazy(() => import('./pages/CartPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))
const EditProfilePage = lazy(() => import('./pages/EditProfilePage.jsx'))
const ArchivePage = lazy(() => import('./pages/ArchivePage.jsx'))
const CreateGunPage = lazy(() => import('./pages/CreateGunPage.jsx'))
const EditGunPage = lazy(() => import('./pages/EditGunPage.jsx'))
const GunDetail = lazy(() => import('./components/gun/GunDetail.jsx'))

function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="state-box">
      <Loader size={28} className="spin" />
      <p>{label}</p>
    </div>
  )
}

/** Detail view resolved by id — used for in-app navigation AND shared links. */
function GunDetailById({ id, onBack, onEdit, onDelete }) {
  const { gun, loading, error } = useGunById(id)

  if (loading) return <PageLoader label="Loading product…" />
  if (error || !gun) {
    return (
      <div className="state-box state-box--error">
        <AlertCircle size={28} />
        <p>{error || 'Product not found.'}</p>
        <button type="button" className="btn btn--outline" onClick={onBack}>Back to Catalog</button>
      </div>
    )
  }
  if (isArchived(gun.id ?? gun.name)) {
    return (
      <div className="state-box">
        <AlertCircle size={28} />
        <p>“{gun.name}” is archived. Restore it from Profile → Archive.</p>
        <button type="button" className="btn btn--outline" onClick={onBack}>Back to Catalog</button>
      </div>
    )
  }
  return <GunDetail gun={gun} onBack={onBack} onEdit={onEdit} onDelete={onDelete} />
}

const setUrlGun = (id, push) => {
  const url = new URL(window.location.href)
  if (id === null) url.searchParams.delete(GUN_PARAM)
  else url.searchParams.set(GUN_PARAM, String(id))
  if (url.href === window.location.href) return
  if (push) window.history.pushState({ gun: String(id) }, '', url)
  else window.history.replaceState(null, '', url)
}

const findGunAnywhere = (id) =>
  findCachedGun(id) || LOCAL_GUNS.find((g) => String(g.id) === String(id)) || null

function App() {
  const initialGunId = getGunIdFromUrl() // shared link: /?gun=<id>

  const [showSplash, setShowSplash] = useState(true)
  const [tab, setTab] = useState('Catalog')
  const [mode, setMode] = useState(initialGunId ? 'detail' : 'list') // list | create | edit | detail | archive | editProfile
  const [detailId, setDetailId] = useState(initialGunId)
  const [editingGun, setEditingGun] = useState(null)
  const [archiveTarget, setArchiveTarget] = useState(null)
  const [profileNotice, setProfileNotice] = useState('')

  // Browser back / forward between catalog and a product link
  useEffect(() => {
    const onPop = () => {
      const id = getGunIdFromUrl()
      if (id) {
        setDetailId(id)
        setMode('detail')
      } else {
        setMode((m) => (m === 'detail' ? 'list' : m))
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const handleNavigate = (target, payload) => {
    if (target === 'Detail') {
      const id = payload.id ?? payload.name
      // Seed the query cache so the detail renders instantly (no refetch)
      if (!queryClient.getQueryData(queryKeys.gun(id))) {
        queryClient.setQueryData(queryKeys.gun(id), payload)
      }
      setDetailId(String(id))
      setMode('detail')
      setUrlGun(id, true)
      scrollTop()
      return
    }

    setUrlGun(null, false)
    if (target === 'Create') {
      setMode('create')
    } else if (target === 'Edit') {
      setEditingGun(payload)
      setMode('edit')
    } else if (target === 'Archive') {
      setMode('archive')
    } else if (target === 'EditProfile') {
      setMode('editProfile')
    } else {
      setTab(target)
      setMode('list')
      setDetailId(null)
      setEditingGun(null)
    }
    scrollTop()
  }

  const handleBackToList = () => {
    if (mode === 'detail' && window.history.state?.gun) {
      window.history.back() // popstate → list
      return
    }
    setUrlGun(null, false)
    setMode('list')
    setDetailId(null)
    setEditingGun(null)
  }

  const goProfile = (notice = '') => {
    setProfileNotice(notice)
    handleNavigate('Profile')
  }

  const handleOpenDraft = (draftId) => {
    if (draftId === 'create') {
      handleNavigate('Create')
    } else {
      handleNavigate('Edit', findGunAnywhere(draftId) || { id: draftId })
    }
  }

  const afterSave = (id) => {
    invalidateGuns(id)
    setUrlGun(null, false)
    setMode('list')
    setTab('Catalog')
    setEditingGun(null)
  }

  return (
    <div className="shell">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <Header
        tab={mode === 'list' ? tab : ''}
        onTab={(newTab) => handleNavigate(newTab)}
        onNavigateCreate={() => handleNavigate('Create')}
      />

      <main className="main">
        <Suspense fallback={<PageLoader />}>
          {mode === 'create' && (
            <CreateGunPage onBack={handleBackToList} onSuccess={(created) => afterSave(created?.id)} />
          )}

          {mode === 'edit' && (
            <EditGunPage
              key={editingGun?.id}
              gun={editingGun?.name ? editingGun : undefined}
              gunId={editingGun?.id}
              onBack={handleBackToList}
              onSuccess={() => afterSave(editingGun?.id)}
            />
          )}

          {mode === 'detail' && detailId && (
            <GunDetailById
              key={detailId}
              id={detailId}
              onBack={handleBackToList}
              onEdit={(g) => handleNavigate('Edit', g)}
              onDelete={(g) => setArchiveTarget(g)}
            />
          )}

          {mode === 'archive' && <ArchivePage onBack={() => goProfile()} />}

          {mode === 'editProfile' && (
            <EditProfilePage onBack={() => goProfile()} onSaved={(msg) => goProfile(msg)} />
          )}

          {mode === 'list' && (
            <>
              {tab === 'Catalog' && <Catalog onNavigate={handleNavigate} />}
              {tab === 'Favorites' && (
                <FavoritesPage
                  onSelectGun={(g) => handleNavigate('Detail', g)}
                  onNavigateCatalog={() => handleNavigate('Catalog')}
                />
              )}
              {tab === 'Cart' && <CartPage onNavigateCatalog={() => handleNavigate('Catalog')} />}
              {tab === 'Profile' && (
                <ProfilePage
                  key={profileNotice}
                  notice={profileNotice}
                  onReplaySplash={() => setShowSplash(true)}
                  onEditProfile={() => handleNavigate('EditProfile')}
                  onOpenDraft={handleOpenDraft}
                  onOpenArchive={() => handleNavigate('Archive')}
                  onOpenCart={() => handleNavigate('Cart')}
                />
              )}
            </>
          )}
        </Suspense>
      </main>

      {/* Soft delete confirmation (from detail view) */}
      <ConfirmModal
        open={Boolean(archiveTarget)}
        title="Move to Archive"
        message={`Archive "${archiveTarget?.name}"? It will be hidden from the catalog (soft delete) and can be restored from Profile → Archive.`}
        confirmLabel="Archive"
        onConfirm={() => {
          archiveGun(archiveTarget)
          setArchiveTarget(null)
          setUrlGun(null, false)
          setMode('list')
          setTab('Catalog')
          setDetailId(null)
        }}
        onCancel={() => setArchiveTarget(null)}
      />

      <PWABadge />
      <Footer />
    </div>
  )
}

export default App
