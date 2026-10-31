import { Plus } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import { useCart, cartCount } from '../stores/cartStore'

const NAV_ITEMS = [
  { id: 'Catalog', label: 'Catalog' },
  { id: 'Favorites', label: 'Favorites', badge: 'fav' },
  { id: 'Cart', label: 'Cart', badge: 'cart' },
  { id: 'Profile', label: 'Profile' },
]

function Header({ tab, onTab, onNavigateCreate }) {
  const { favorites } = useFavorites()
  const cart = useCart()
  const counts = { fav: favorites ? favorites.length : 0, cart: cartCount(cart) }

  return (
    <header className="header">
      <div className="header-brand-wrap" onClick={() => onTab('Catalog')} style={{ cursor: 'pointer' }}>
        <div className="header-logo-badge">
          <img src="/logo.png" alt="Bore & Barrel" />
        </div>
        <span className="brand display">Bore &amp; Barrel</span>
      </div>

      <nav className="nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={tab === item.id ? 'nav-link active' : 'nav-link'}
            onClick={() => onTab(item.id)}
          >
            {item.label}
            {item.badge && counts[item.badge] > 0 && (
              <span className="nav-badge">{counts[item.badge]}</span>
            )}
          </button>
        ))}
      </nav>

      {onNavigateCreate && (
        <button type="button" className="btn btn--primary btn--sm header-cta" onClick={onNavigateCreate} title="Register new hardware">
          <Plus size={15} /> Add Hardware
        </button>
      )}
    </header>
  )
}

export default Header
