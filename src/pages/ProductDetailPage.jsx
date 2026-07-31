import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Button from '@/components/ui/Button'
import {
  addCartItem,
  fetchProductReviews,
  fetchVendorReviews,
  submitProductReview,
  submitVendorReview,
} from '@/store/slices/catalogSlice'
import ProductThumb from '@/components/ProductThumb'
import PriceTag from '@/components/PriceTag'
import { cn } from '@/lib/utils'

export default function ProductDetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const product = useSelector((s) => s.catalog.products.find((p) => p.id === id))
  const vendorReviews = useSelector((s) => s.catalog.vendorReviews.filter((r) => r.vendorId === product?.vendorId))
  const productReviews = useSelector((s) => s.catalog.productReviews.filter((r) => r.productId === id))
  const [tab, setTab] = useState('product')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    dispatch(fetchProductReviews(id))
  }, [dispatch, id])

  useEffect(() => {
    if (product?.vendorId) {
      dispatch(fetchVendorReviews(product.vendorId))
    }
  }, [dispatch, product?.vendorId])

  if (!product) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-24 text-center text-onLight/50">Product not found.</div>
      </div>
    )
  }

  async function handleSubmitVendorReview(e) {
    e.preventDefault()
    setReviewError('')
    try {
      await dispatch(submitVendorReview({ vendorId: product.vendorId, rating, comment })).unwrap()
      setComment('')
    } catch (err) {
      setReviewError(err || 'Could not post review — please sign in and try again.')
    }
  }

  async function handleSubmitProductReview(e) {
    e.preventDefault()
    setReviewError('')
    try {
      await dispatch(submitProductReview({ productId: product.id, rating, comment })).unwrap()
      setComment('')
    } catch (err) {
      setReviewError(err || 'Could not post review — please sign in and try again.')
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-square rounded-3xl overflow-hidden"
          >
            <ProductThumb product={product} iconSize={72} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-xs font-medium text-leaf">{product.category}</span>
            <h1 className="font-display text-3xl font-semibold mt-2 mb-2">{product.name}</h1>
            <Link to="#" className="text-sm text-onLight/50 hover:text-leaf">
              Sold by {product.vendor}
            </Link>
            <div className="flex items-center gap-1 mt-3 mb-6">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={16} className={n <= Math.round(product.rating) ? 'fill-amber text-amber' : 'text-onLight/20'} />
              ))}
              <span className="text-xs text-onLight/40 ml-1">{product.rating}</span>
            </div>
            <p className="text-onLight/65 mb-8 max-w-md">{product.description}</p>
            <div className="flex items-center gap-6">
              <PriceTag product={product} size="lg" />
              <Button size="lg" onClick={() => dispatch(addCartItem({ productId: product.id }))}>
                Add to cart
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="mt-16 border-b border-onLight/10 flex gap-6">
          {['product', 'vendor'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 -mb-px',
                tab === t ? 'border-leaf text-leaf' : 'border-transparent text-onLight/45',
              )}
            >
              {t === 'product' ? 'Product reviews' : 'Vendor reviews'}
            </button>
          ))}
        </div>

        <div className="pt-8 max-w-xl">
          {tab === 'product' && (
            <div className="flex flex-col gap-6">
              {productReviews.length === 0 && <p className="text-sm text-onLight/45">No product reviews yet — be the first.</p>}
              {productReviews.map((r) => (
                <div key={r.id} className="bg-white border border-onLight/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} size={13} className={n <= r.rating ? 'fill-amber text-amber' : 'text-onLight/20'} />
                      ))}
                    </div>
                    <span className="text-xs text-onLight/35">{r.author}</span>
                  </div>
                  <p className="text-sm text-onLight/70">{r.comment}</p>
                </div>
              ))}
              <form onSubmit={handleSubmitProductReview} className="border-t border-onLight/10 pt-6">
                <span className="block text-sm font-medium mb-2">Rate this product</span>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)}>
                      <Star size={20} className={n <= rating ? 'fill-amber text-amber' : 'text-onLight/25'} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="What stood out about this product?"
                  className="w-full px-4 py-3 rounded-xl border border-onLight/15 bg-white text-sm outline-none focus:border-leaf mb-3"
                />
                {reviewError && <p className="text-xs text-coral mb-3">{reviewError}</p>}
                <Button type="submit">Post review</Button>
              </form>
            </div>
          )}
          {tab === 'vendor' && (
            <div className="flex flex-col gap-6">
              {vendorReviews.length === 0 && <p className="text-sm text-onLight/45">No vendor reviews yet — be the first.</p>}
              {vendorReviews.map((r, i) => (
                <div key={i} className="bg-white border border-onLight/10 rounded-xl p-4">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={13} className={n <= r.rating ? 'fill-amber text-amber' : 'text-onLight/20'} />
                    ))}
                  </div>
                  <p className="text-sm text-onLight/70">{r.comment}</p>
                </div>
              ))}
              <form onSubmit={handleSubmitVendorReview} className="border-t border-onLight/10 pt-6">
                <span className="block text-sm font-medium mb-2">Rate this vendor</span>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating(n)}>
                      <Star size={20} className={n <= rating ? 'fill-amber text-amber' : 'text-onLight/25'} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="How was delivery and communication?"
                  className="w-full px-4 py-3 rounded-xl border border-onLight/15 bg-white text-sm outline-none focus:border-leaf mb-3"
                />
                {reviewError && <p className="text-xs text-coral mb-3">{reviewError}</p>}
                <Button type="submit">Post review</Button>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
