import { createLocalStore } from '../lib/createLocalStore'
import { formatPrice } from '../utils/helpers'
import { waLink } from '../config/store'

// ---------------------------------------------------------------------------
// Shopping cart — persisted in localStorage.
// Shape: [{ id, name, price, image, type, caliber, qty }]
// ---------------------------------------------------------------------------

const store = createLocalStore('bore_barrel_cart', [])

export const useCart = store.useStore

export const addToCart = (gun, qty = 1) => {
  const id = String(gun.id ?? gun.name)
  store.set((items) => {
    const existing = items.find((i) => i.id === id)
    if (existing) {
      return items.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i))
    }
    return [
      ...items,
      {
        id,
        name: gun.name,
        price: Number(gun.price ?? gun.cook_time ?? 0),
        image: gun.image_url || gun.image || '/guns/pistol.svg',
        type: gun.type || gun.category || '',
        caliber: gun.caliber || '',
        qty,
      },
    ]
  })
}

export const setQty = (id, qty) => {
  store.set((items) =>
    qty <= 0 ? items.filter((i) => i.id !== id) : items.map((i) => (i.id === id ? { ...i, qty } : i)),
  )
}

export const removeFromCart = (id) => store.set((items) => items.filter((i) => i.id !== id))

export const clearCart = () => store.set([])

export const cartCount = (items) => items.reduce((n, i) => n + i.qty, 0)

export const cartTotal = (items) => items.reduce((sum, i) => sum + i.price * i.qty, 0)

/** Build the WhatsApp checkout message: "Hi aku mau pesan ...". */
export const buildOrderMessage = (items, { name = '', note = '' } = {}) => {
  const lines = items.map((i, idx) => {
    const spec = [i.type, i.caliber].filter(Boolean).join(' · ')
    return `${idx + 1}. ${i.name}${spec ? ` (${spec})` : ''} x${i.qty} = ${formatPrice(i.price * i.qty)}`
  })
  return [
    'Hi aku mau pesan ....',
    '',
    ...lines,
    '',
    `Total: ${formatPrice(cartTotal(items))}`,
    name.trim() ? `Nama: ${name.trim()}` : null,
    note.trim() ? `Catatan: ${note.trim()}` : null,
  ]
    .filter((l) => l !== null)
    .join('\n')
}

export const checkoutUrl = (items, info) => waLink(buildOrderMessage(items, info))
