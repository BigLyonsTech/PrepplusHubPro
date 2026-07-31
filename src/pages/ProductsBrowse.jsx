import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { addCartItem } from '@/store/slices/catalogSlice'
import ProductThumb from '@/components/ProductThumb'
import PriceTag from '@/components/PriceTag'

const PAGE_SIZE = 24

export default function ProductsBrowse() {
  const products = useSelector((s) => s.catalog.products)
  const dispatch = useDispatch()
  const [params, setParams] = useSearchParams()
  const category = params.get('category')
  const filtered = useMemo(
    () => (category ? products.filter((p) => p.category === category) : products),
    [products, category],
  )

  // Temu-style infinite scroll: render PAGE_SIZE at a time, load more when
  // a sentinel element near the bottom enters the viewport. Resets whenever
  // the category filter changes so switching categories doesn't show a
  // half-loaded stale page.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const sentinelRef = useRef(null)

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [category])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length))
        }
      },
      { rootMargin: '600px' }, // start loading well before the user hits bottom
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [filtered.length])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-12">
        <h1 className="font-display text-3xl font-semibold mb-1">Browse products</h1>
        <p className="text-onLight/50 text-sm mb-6">
          {filtered.length.toLocaleString()} products — no account needed, sign up when you're ready to buy.
        </p>
        {category && (
          <button
            onClick={() => setParams({})}
            className="inline-flex items-center gap-1.5 text-xs font-medium bg-leaf/10 text-leaf-dim rounded-full px-3 py-1.5 mb-6 hover:bg-leaf/15"
          >
            {category} <X size={12} />
          </button>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: Math.min((i % PAGE_SIZE) * 0.03, 0.3), ease: [0.16, 1, 0.3, 1] }}
              className="bg-white border border-onLight/10 rounded-2xl overflow-hidden"
            >
              <Link to={`/products/${p.id}`} className="block aspect-[4/3]">
                <ProductThumb product={p} />
              </Link>
              <div className="p-4">
                <Link to={`/products/${p.id}`} className="font-medium text-sm hover:text-leaf">
                  {p.name}
                </Link>
                <div className="text-xs text-onLight/45 mt-0.5">{p.vendor}</div>
                <div className="flex items-center justify-between mt-3 gap-2">
                  <PriceTag product={p} />
                  <button
                    onClick={() => dispatch(addCartItem({ productId: p.id }))}
                    className="shrink-0 text-xs font-medium bg-ink text-onDark rounded-full px-3 py-1.5 hover:bg-canopy transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-12">
            <div className="flex items-center gap-2 text-onLight/40 text-sm">
              <span className="size-2 rounded-full bg-leaf animate-pulse-soft" />
              Loading more products...
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
