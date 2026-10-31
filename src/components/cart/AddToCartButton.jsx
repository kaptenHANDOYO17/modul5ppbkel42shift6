import { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import { addToCart, useCart } from '../../stores/cartStore'

/**
 * AddToCartButton — adds one unit of a product to the cart.
 */
export default function AddToCartButton({ gun, block = false, size = 'md' }) {
  const items = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const inCart = items.find((i) => i.id === String(gun.id ?? gun.name))

  const handleClick = (e) => {
    e.stopPropagation()
    addToCart(gun)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <button
      type="button"
      className={`btn btn--primary${size === 'sm' ? ' btn--sm' : ''}${block ? ' btn--block' : ''}`}
      onClick={handleClick}
    >
      {justAdded ? <Check size={15} /> : <ShoppingCart size={15} />}
      {justAdded ? 'Added' : 'Add to Cart'}
      {inCart && !justAdded && <span className="btn-count">{inCart.qty}</span>}
    </button>
  )
}
