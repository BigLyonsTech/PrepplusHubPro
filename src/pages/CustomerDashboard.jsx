import { useEffect, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Search, Bell, Heart, ShoppingBag, X, Menu, Plus, Minus, Trash2,
  Home, LayoutGrid, Flame, Sparkles, TrendingUp, Tag, Layers,
  Package, Ticket, MapPin, Settings, Zap, Shirt, Dumbbell, Star,
} from 'lucide-react'
import TrustBar from '@/components/TrustBar'
import ProductThumb from '@/components/ProductThumb'
import PriceTag from '@/components/PriceTag'
import ThemeToggle from '@/components/ThemeToggle'
import wordmarkForLight from '@/assets/brand/oscillate-wordmark-dark-text.png'
import wordmarkForDark from '@/assets/brand/oscillate-wordmark.png'
import {
  fetchCart, addCartItem, updateCartItemQuantity, removeCartItem, fetchOrders, toggleWishlist,
} from '@/store/slices/catalogSlice'

/**
 * Customer Dashboard — 3-column layout (sidebar / main / docked cart panel)
 * matching the NovaShop reference, recolored to Oscillate's green/off-white
 * palette. Each category shows exactly 3 products (not a long flat list),
 * and the top search bar actually filters what's shown, live.
 */

const CATEGORY_ICONS = { Electronics: Zap, Fashion: Shirt, Home: Home, Beauty: Sparkles, Sports: Dumbbell }
const CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports']
const PER_CATEGORY = 3

const NAV_ITEMS = [
  { label: 'Home', icon: Home, href: '#top', active: true },
  { label: 'Categories', icon: LayoutGrid, href: '/products' },
  { label: 'Deals', icon: Flame, href: '#deals', badge: 'Hot' },
  { label: 'New Arrivals', icon: Sparkles, href: '#Electronics' },
  { label: 'Best Sellers', icon: TrendingUp, href: '#Fashion' },
  { label: 'Brands', icon: Tag, soon: true },
  { label: 'Collections', icon: Layers, soon: true },
  { label: 'My Orders', icon: Package, href: '#orders' },
  { label: 'Coupons', icon: Ticket, soon: true },
  { label: 'Addresses', icon: MapPin, soon: true },
  { label: 'Account Settings', icon: Settings, href: '/profile' },
]

export default function CustomerDashboard() {
  const user = useSelector((s) => s.auth.user)
  const products = useSelector((s) => s.catalog.products)
  const orders = useSelector((s) => s.catalog.orders)
  const cart = useSelector((s) => s.catalog.cart)
  const wishlist = useSelector((s) => s.catalog.wishlist)
  const dispatch = useDispatch()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    dispatch(fetchCart())
    dispatch(fetchOrders())
  }, [dispatch])

  const interests = user?.personalizationProfile?.interests || []

  // Exactly PER_CATEGORY (3) products per category, highest-rated first
  // within each, matching whatever the search box currently filters.
  const byCategory = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = q
      ? products.filter(
          (p) => p.name.toLowerCase().includes(q) || p.vendor.toLowerCase().includes(q),
        )
      : products

    // Categories the user picked in the quiz show first, so the sections
    // themselves are ordered by relevance, not just alphabetically.
    const orderedCategories = [...CATEGORIES].sort(
      (a, b) => Number(interests.includes(b)) - Number(interests.includes(a)),
    )

    return orderedCategories
      .map((cat) => ({
        category: cat,
        products: filtered
          .filter((p) => p.category === cat)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, PER_CATEGORY),
      }))
      .filter((group) => group.products.length > 0)
  }, [products, search, interests])

  const cartLines = cart.items
  const cartCount = cartLines.reduce((sum, line) => sum + line.quantity, 0)
  const { subtotal, discount, shipping, total } = cart

  const suggestions = useMemo(
    () => [...products].sort((a, b) => b.rating - a.rating).slice(0, 2),
    [products],
  )

  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div id="top" className="min-h-screen bg-paper flex">
      {/* ---------- LEFT SIDEBAR (desktop) ---------- */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-onLight/8 bg-white sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 h-full w-64 bg-white z-50 flex flex-col lg:hidden"
            >
              <SidebarContent onNavigate={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ---------- MAIN COLUMN ---------- */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-onLight/8">
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
            <button className="lg:hidden text-onLight shrink-0" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="relative flex-1 min-w-0 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-onLight/40" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-8 py-2.5 rounded-full border border-onLight/10 bg-white text-sm outline-none focus:border-leaf"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-onLight/30 hover:text-onLight/60"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <div className="flex-1 hidden sm:block" />
            <button className="relative p-1.5 sm:p-2 text-onLight/70 hover:text-leaf-dim shrink-0">
              <Heart size={18} />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-coral text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button className="relative p-1.5 sm:p-2 text-onLight/70 hover:text-leaf-dim hidden sm:block shrink-0">
              <Bell size={18} />
              <span className="absolute top-1 right-1.5 size-1.5 rounded-full bg-coral" />
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-1.5 sm:p-2 text-onLight/70 hover:text-leaf-dim xl:hidden shrink-0"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-leaf text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <div className="shrink-0"><ThemeToggle /></div>
            <div className="hidden sm:flex items-center gap-2 pl-1 shrink-0">
              <div className="size-8 rounded-full bg-leaf/15 text-leaf-dim font-display font-semibold text-sm flex items-center justify-center">
                {firstName[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-medium hidden md:block">{firstName}</span>
            </div>
          </div>
        </header>

        <main className="px-3 sm:px-4 lg:px-8 py-5 sm:py-6">
          {/* Hero */}
          <section className="rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-canopy to-leaf-dim relative mb-6 min-h-[200px] sm:min-h-[240px] flex items-center">
            <div className="p-6 sm:p-8 md:p-12 max-w-md relative z-10">
              <span className="inline-block bg-white/15 text-white text-xs font-medium px-3 py-1 rounded-full mb-3 sm:mb-4">
                New Collection
              </span>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
                Find Your Style,<br />Love What You Buy
              </h1>
              <p className="text-white/75 text-sm mb-5 sm:mb-6 max-w-xs">
                {interests.length
                  ? `Curated around ${interests.slice(0, 2).join(' & ')} — picked for you.`
                  : 'Discover the latest trends across every category.'}
              </p>
              <a
                href={`#${byCategory[0]?.category || 'Electronics'}`}
                className="inline-block bg-white text-canopy font-semibold text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-full hover:bg-white/90 transition-colors"
              >
                Shop Now →
              </a>
            </div>
            <div className="hidden md:block absolute right-10 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
            <div className="hidden md:block absolute right-16 top-1/2 -translate-y-1/2 size-40 rounded-full bg-white/10" />
          </section>

          {/* Category icon row */}
          <section className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat]
              const isInterest = interests.includes(cat)
              return (
                <a key={cat} href={`#${cat}`} className="flex flex-col items-center gap-1.5 sm:gap-2 shrink-0">
                  <div className={`size-12 sm:size-14 rounded-full flex items-center justify-center ${isInterest ? 'bg-leaf' : 'bg-canopy/8'}`}>
                    <Icon size={20} className={isInterest ? 'text-white' : 'text-canopy'} />
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium text-onLight/70">{cat}</span>
                </a>
              )
            })}
          </section>

          {/* Promo cards */}
          <section id="deals" className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-10">
            <PromoCard tint="bg-coral/8" title="Flash Sale" sub="Limited time deals" cta="Shop deals" href={`#${CATEGORIES[0]}`} />
            <PromoCard tint="bg-leaf/10" title="Free Shipping" sub="On orders over ₦50,000" cta="Learn more" href="#top" />
            <PromoCard tint="bg-amber/10" title="New Arrivals" sub="Check out the latest" cta="Shop now" href={`#${CATEGORIES[1]}`} />
          </section>

          {/* One section per category, 3 products each */}
          {byCategory.length === 0 ? (
            <p className="text-onLight/40 text-sm py-10 text-center">No products match "{search}".</p>
          ) : (
            byCategory.map((group) => (
              <ProductRow
                key={group.category}
                id={group.category}
                title={group.category}
                products={group.products}
                wishlist={wishlist}
                onAdd={(id) => dispatch(addCartItem({ productId: id }))}
                onWishlist={(id) => dispatch(toggleWishlist(id))}
              />
            ))
          )}

          {/* Orders */}
          {orders.length > 0 && (
            <section id="orders" className="mb-10">
              <h2 className="font-display text-xl font-semibold mb-4">Your recent orders</h2>
              <div className="flex flex-col gap-3">
                {orders.slice(0, 3).map((o) => {
                  const firstItem = o.items?.[0]
                  if (!firstItem) return null
                  const extraCount = o.items.length - 1
                  return (
                    <div key={o.id} className="flex justify-between items-center bg-white border border-onLight/10 rounded-xl p-4">
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">
                          {firstItem.name}{extraCount > 0 ? ` + ${extraCount} more` : ''}
                        </div>
                        <div className="text-xs text-onLight/45">
                          ₦{o.total.toLocaleString()} · {new Date(o.placedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="text-xs font-medium rounded-full px-3 py-1.5 bg-leaf/15 text-leaf-dim shrink-0 ml-3">{o.status}</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          <TrustBar />
        </main>
      </div>

      {/* ---------- RIGHT CART PANEL (docked on xl, drawer below) ---------- */}
      <aside className="hidden xl:flex flex-col w-80 shrink-0 border-l border-onLight/8 bg-white sticky top-0 h-screen">
        <CartPanelContent
          cartLines={cartLines} cartCount={cartCount} subtotal={subtotal}
          discount={discount} shipping={shipping} total={total}
          suggestions={suggestions} dispatch={dispatch}
        />
      </aside>

      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/30 z-40 xl:hidden"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed right-0 top-0 h-full w-full sm:w-80 bg-white z-50 flex flex-col xl:hidden"
            >
              <div className="flex justify-end p-3">
                <button onClick={() => setCartOpen(false)} className="text-onLight/50"><X size={20} /></button>
              </div>
              <CartPanelContent
                cartLines={cartLines} cartCount={cartCount} subtotal={subtotal}
                discount={discount} shipping={shipping} total={total}
                suggestions={suggestions} dispatch={dispatch}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function SidebarContent({ onNavigate }) {
  return (
    <>
      <div className="p-5 border-b border-onLight/8">
        <img src={wordmarkForLight} alt="Oscillate" className="h-6 w-auto dark:hidden" />
        <img src={wordmarkForDark} alt="Oscillate" className="h-6 w-auto hidden dark:block" />
      </div>
      <nav className="flex-1 overflow-y-auto py-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const content = (
            <>
              <Icon size={17} className={item.active ? 'text-leaf-dim' : 'text-onLight/45'} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className="text-[10px] font-bold bg-coral text-white px-1.5 py-0.5 rounded-full">{item.badge}</span>
              )}
              {item.soon && <span className="text-[10px] font-medium text-onLight/30">Soon</span>}
            </>
          )
          const className = `flex items-center gap-3 px-5 py-2.5 text-sm font-medium ${
            item.active ? 'bg-leaf/8 text-leaf-dim border-r-2 border-leaf' : 'text-onLight/70 hover:bg-onLight/4'
          } ${item.soon ? 'opacity-50 cursor-default' : ''}`

          if (item.soon) return <div key={item.label} className={className}>{content}</div>
          if (item.href?.startsWith('#')) {
            return <a key={item.label} href={item.href} onClick={onNavigate} className={className}>{content}</a>
          }
          return <Link key={item.label} to={item.href} onClick={onNavigate} className={className}>{content}</Link>
        })}
      </nav>
      <div className="p-4 border-t border-onLight/8">
        <div className="rounded-2xl bg-gradient-to-br from-canopy to-leaf-dim p-4 text-white">
          <div className="text-xs font-medium opacity-80 mb-1">Special Offer</div>
          <div className="font-display font-bold text-lg mb-3">Summer Sale<br />Up to 50% Off</div>
          <a href="#top" className="inline-block bg-white text-canopy text-xs font-semibold px-4 py-2 rounded-full">
            Shop Now
          </a>
        </div>
      </div>
    </>
  )
}

function PromoCard({ tint, title, sub, cta, href }) {
  return (
    <a href={href} className={`block rounded-2xl p-4 sm:p-5 ${tint} hover:opacity-90 transition-opacity`}>
      <div className="font-display font-semibold text-sm mb-1">{title}</div>
      <div className="text-xs text-onLight/50 mb-3">{sub}</div>
      <span className="text-xs font-semibold text-leaf-dim">{cta} →</span>
    </a>
  )
}

function ProductRow({ id, title, products, wishlist, onAdd, onWishlist }) {
  return (
    <section id={id} className="mb-10">
      <div className="flex items-end justify-between mb-4">
        <h2 className="font-display text-lg sm:text-xl font-semibold">{title}</h2>
        <Link to={`/products?category=${title}`} className="text-sm text-leaf-dim hover:underline">View All</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-onLight/10 rounded-2xl overflow-hidden group"
          >
            <div className="relative aspect-square">
              <Link to={`/products/${p.id}`} className="block w-full h-full">
                <ProductThumb product={p} />
              </Link>
              <button
                onClick={() => onWishlist(p.id)}
                className="absolute top-2 right-2 size-7 rounded-full bg-white/90 flex items-center justify-center"
              >
                <Heart
                  size={13}
                  className={wishlist.includes(p.id) ? 'text-coral' : 'text-onLight/40'}
                  fill={wishlist.includes(p.id) ? 'currentColor' : 'none'}
                />
              </button>
            </div>
            <div className="p-2.5 sm:p-3">
              <Link to={`/products/${p.id}`} className="font-medium text-xs sm:text-sm hover:text-leaf-dim block truncate">
                {p.name}
              </Link>
              <div className="flex items-center gap-1 mt-1 mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} size={10} color="#E0A030" fill={n <= Math.round(p.rating) ? '#E0A030' : 'none'} />
                ))}
                <span className="text-[10px] text-onLight/40 ml-0.5">({p.reviewCount || 0})</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <PriceTag product={p} />
                <button
                  onClick={() => onAdd(p.id)}
                  className="shrink-0 size-7 rounded-full bg-leaf text-white flex items-center justify-center hover:bg-leaf-dim"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function CartPanelContent({ cartLines, cartCount, subtotal, discount, shipping, total, suggestions, dispatch }) {
  return (
    <>
      <div className="flex items-center justify-between p-5 border-b border-onLight/8">
        <h2 className="font-display font-semibold">My Cart ({cartCount})</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {cartLines.length === 0 ? (
          <p className="text-onLight/40 text-sm text-center mt-10">Your cart is empty.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {cartLines.map((line) => (
              <div key={line.productId} className="flex gap-3 border border-onLight/8 rounded-xl p-3">
                <div className="size-14 rounded-lg overflow-hidden shrink-0">
                  <ProductThumb product={line} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{line.name}</div>
                  <div className="text-xs text-leaf-dim font-semibold mt-0.5">
                    ₦{line.price.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => dispatch(updateCartItemQuantity({ productId: line.productId, quantity: line.quantity - 1 }))}
                      className="size-5 rounded-full border border-onLight/15 flex items-center justify-center"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="text-xs w-3 text-center">{line.quantity}</span>
                    <button
                      onClick={() => dispatch(updateCartItemQuantity({ productId: line.productId, quantity: line.quantity + 1 }))}
                      className="size-5 rounded-full border border-onLight/15 flex items-center justify-center"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => dispatch(removeCartItem(line.productId))}
                  className="text-onLight/30 hover:text-coral self-start"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="mt-8">
            <div className="text-xs font-semibold text-onLight/50 mb-3">You might also like</div>
            <div className="flex flex-col gap-2">
              {suggestions.map((p) => (
                <div key={p.id} className="flex items-center gap-2.5">
                  <div className="size-10 rounded-lg overflow-hidden shrink-0">
                    <ProductThumb product={p} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs truncate">{p.name}</div>
                    <div className="text-xs text-leaf-dim font-semibold">₦{p.price.toLocaleString()}</div>
                  </div>
                  <button
                    onClick={() => dispatch(addCartItem({ productId: p.id }))}
                    className="size-6 rounded-full bg-ink text-white flex items-center justify-center shrink-0"
                  >
                    <Plus size={11} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {cartLines.length > 0 && (
        <div className="p-5 border-t border-onLight/8">
          <div className="space-y-1.5 mb-4 text-sm">
            <div className="flex justify-between text-onLight/60">
              <span>Subtotal</span><span>₦{subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-coral">
                <span>Discount</span><span>-₦{discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-onLight/60">
              <span>Shipping</span><span>{shipping === 0 ? 'Free' : `₦${shipping.toLocaleString()}`}</span>
            </div>
            <div className="flex justify-between font-display font-semibold text-base pt-1.5 border-t border-onLight/8">
              <span>Total</span><span>₦{total.toLocaleString()}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="block text-center bg-leaf text-white font-semibold py-3 rounded-full hover:bg-leaf-dim transition-colors"
          >
            Checkout ({cartCount})
          </Link>
        </div>
      )}

      <div className="p-4">
        <div className="rounded-2xl bg-canopy p-4 text-white text-center">
          <div className="font-display font-semibold text-sm mb-1">Join Oscillate Club</div>
          <p className="text-xs opacity-70 mb-3">Get exclusive offers, early access and more</p>
          <button className="bg-white text-canopy text-xs font-semibold px-4 py-1.5 rounded-full">Join Now</button>
        </div>
      </div>
    </>
  )
}
