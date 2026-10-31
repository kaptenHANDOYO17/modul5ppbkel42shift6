import { useState } from 'react'
import { ShoppingCart, Minus, Plus, Trash2, MessageCircle, ArrowRight } from 'lucide-react'
import {
  useCart,
  setQty,
  removeFromCart,
  clearCart,
  cartCount,
  cartTotal,
  buildOrderMessage,
  checkoutUrl,
} from '../stores/cartStore'
import { getUserProfile } from '../services/userService'
import { formatPrice } from '../utils/helpers'
import { WHATSAPP_DISPLAY } from '../config/store'
import ConfirmModal from '../components/modals/ConfirmModal'

/**
 * CartPage — keranjang belanja + checkout via WhatsApp.
 * Checkout membuka wa.me dengan pesan "Hi aku mau pesan ...." yang sudah terisi.
 */
export default function CartPage({ onNavigateCatalog }) {
  const items = useCart()
  const [name, setName] = useState(() => {
    const u = getUserProfile().username
    return u && u !== 'Shooter' ? u : ''
  })
  const [note, setNote] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [checkedOut, setCheckedOut] = useState(false)

  const count = cartCount(items)
  const total = cartTotal(items)
  const preview = buildOrderMessage(items, { name, note })

  if (items.length === 0) {
    return (
      <div className="page">
        <h1 className="display">Your cart</h1>
        <div className="state-box">
          <ShoppingCart size={28} />
          <p>{checkedOut ? 'Order sent to WhatsApp. Thank you!' : 'Your cart is empty.'}</p>
          <button type="button" className="btn btn--primary" onClick={onNavigateCatalog}>
            Browse catalog <ArrowRight size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page cart-page">
      <h1 className="display">Your cart</h1>
      <p className="lede">
        {count} item{count !== 1 ? 's' : ''} · checkout goes straight to WhatsApp ({WHATSAPP_DISPLAY}).
      </p>

      <ul className="cart-list">
        {items.map((item) => (
          <li key={item.id} className="cart-item">
            <img className="cart-img" src={item.image} alt={item.name} loading="lazy" decoding="async" />
            <div className="cart-info">
              <span className="name display">{item.name}</span>
              <span className="type">
                {[item.type, item.caliber].filter(Boolean).join(' · ')} · {formatPrice(item.price)}
              </span>
              <div className="qty">
                <button type="button" className="icon-btn" onClick={() => setQty(item.id, item.qty - 1)} aria-label="Decrease">
                  <Minus size={14} />
                </button>
                <span className="qty-val" aria-live="polite">{item.qty}</span>
                <button type="button" className="icon-btn" onClick={() => setQty(item.id, item.qty + 1)} aria-label="Increase">
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="cart-right">
              <span className="price">{formatPrice(item.price * item.qty)}</span>
              <button type="button" className="btn btn--danger-ghost" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`}>
                <Trash2 size={15} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="cart-summary">
        <div className="cart-total">
          <span>Total</span>
          <strong className="price">{formatPrice(total)}</strong>
        </div>

        <div className="form-group">
          <label htmlFor="cart-name" className="form-label">Your name (optional)</label>
          <input id="cart-name" className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Handoyo" />
        </div>
        <div className="form-group">
          <label htmlFor="cart-note" className="form-label">Note (optional)</label>
          <textarea id="cart-note" className="form-textarea" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Delivery, pickup time, etc." />
        </div>

        <details className="wa-preview">
          <summary>Preview WhatsApp message</summary>
          <pre>{preview}</pre>
        </details>

        <div className="cart-actions">
          <button type="button" className="btn btn--outline" onClick={() => setConfirmClear(true)}>
            Clear cart
          </button>
          <a
            className="btn btn--wa"
            href={checkoutUrl(items, { name, note })}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setCheckedOut(true)}
          >
            <MessageCircle size={17} /> Checkout via WhatsApp
          </a>
        </div>
        {checkedOut && (
          <p className="form-hint">
            WhatsApp opened in a new tab. Done ordering?{' '}
            <button type="button" className="link-btn" onClick={() => clearCart()}>
              Empty the cart
            </button>
          </p>
        )}
      </div>

      <ConfirmModal
        open={confirmClear}
        title="Clear cart"
        message="Remove every item from your cart?"
        confirmLabel="Clear"
        danger
        onConfirm={() => { clearCart(); setConfirmClear(false) }}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  )
}
