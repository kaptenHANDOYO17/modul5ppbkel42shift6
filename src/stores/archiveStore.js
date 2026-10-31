import { createLocalStore } from '../lib/createLocalStore'

// ---------------------------------------------------------------------------
// Soft delete / Archive.
// "Delete" di katalog tidak menghapus data dari server — item dipindah ke
// arsip (disembunyikan dari katalog & favorit) dan bisa di-restore kapan saja.
// Hapus permanen dilakukan dari halaman Archive.
// Shape: [{ id: string, gun: object, archivedAt: ISO string }]
// ---------------------------------------------------------------------------

const store = createLocalStore('bore_barrel_archive', [])

export const useArchive = store.useStore

export const archiveGun = (gun) => {
  const id = String(gun.id ?? gun.name)
  store.set((list) => [
    { id, gun: { ...gun, id: gun.id ?? id }, archivedAt: new Date().toISOString() },
    ...list.filter((a) => a.id !== id),
  ])
}

export const restoreGun = (id) => {
  store.set((list) => list.filter((a) => a.id !== String(id)))
}

export const removeFromArchive = restoreGun

export const isArchived = (id) => store.get().some((a) => a.id === String(id))
