import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import ProgressBar from '@/components/ui/ProgressBar'
import { fetchCart, createOrder, verifyPayment } from '@/store/slices/catalogSlice'
import { openPaystackPopup } from '@/lib/paystack'

const steps = ['Delivery', 'Payment']

export default function CheckoutFlow() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cart = useSelector((s) => s.catalog.cart)
  const user = useSelector((s) => s.auth.user)
  const [step, setStep] = useState(1)
  const [placed, setPlaced] = useState(false)
  const [form, setForm] = useState({ fullName: '', address: '', phone: '' })
  const [formError, setFormError] = useState('')
  const [order, setOrder] = useState(null)
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  function continueToPayment() {
    if (!form.fullName.trim() || !form.address.trim() || !form.phone.trim()) {
      setFormError('Please fill in your name, address, and phone number.')
      return
    }
    setFormError('')
    setStep(2)
  }

  async function handlePay() {
    setPayError('')
    setPaying(true)
    try {
      // Reuse the existing order/reference if the popup was closed and retried,
      // so we never create a duplicate order for the same checkout attempt.
      const activeOrder = order || (await dispatch(createOrder(form)).unwrap())
      if (!order) setOrder(activeOrder)

      await openPaystackPopup({
        email: user?.email,
        amountKobo: Math.round(activeOrder.total * 100),
        reference: activeOrder.paymentReference,
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        onSuccess: async (reference) => {
          try {
            await dispatch(verifyPayment(reference)).unwrap()
            setPlaced(true)
          } catch (error) {
            setPayError(error.message || 'Payment could not be verified. Please try again.')
          } finally {
            setPaying(false)
          }
        },
        onClose: () => setPaying(false),
      })
    } catch (error) {
      setPayError(error.message || 'Something went wrong starting payment.')
      setPaying(false)
    }
  }

  if (placed) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-24 text-center flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="size-16 rounded-full bg-emerald/15 flex items-center justify-center mb-6"
          >
            <Check size={28} className="text-emerald" />
          </motion.div>
          <h1 className="font-display text-3xl font-semibold mb-2">Order placed</h1>
          <p className="text-onLight/50 mb-8">We'll email you a confirmation shortly.</p>
          <Button size="lg" onClick={() => navigate('/customer/dashboard')}>
            Back to dashboard
          </Button>
        </div>
      </div>
    )
  }

  if (!cart.items.length) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="container-page py-24 text-center flex flex-col items-center">
          <h1 className="font-display text-2xl font-semibold mb-2">Your cart is empty</h1>
          <p className="text-onLight/50 mb-8">Add something to your cart before checking out.</p>
          <Button size="lg" onClick={() => navigate('/products')}>
            Browse products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="container-page py-14 grid md:grid-cols-[1fr_320px] gap-12">
        <div className="max-w-lg">
          <ProgressBar step={step} total={steps.length} />
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mt-8 space-y-5">
                <h2 className="font-display text-2xl font-semibold mb-4">Delivery address</h2>
                <Field label="Full name">
                  <Input
                    placeholder="Ada Obi"
                    value={form.fullName}
                    onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  />
                </Field>
                <Field label="Address">
                  <Input
                    placeholder="Street, city, state"
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    placeholder="+234 800 000 0000"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                </Field>
                {formError && <p className="text-sm text-coral">{formError}</p>}
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="mt-8 space-y-5">
                <h2 className="font-display text-2xl font-semibold mb-4">Review &amp; pay</h2>
                <div className="flex flex-col gap-2">
                  {cart.items.map((line) => (
                    <div key={line.productId} className="flex justify-between text-sm bg-white border border-onLight/10 rounded-lg p-3">
                      <span>{line.name} × {line.quantity}</span>
                      <span>₦{(line.price * line.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-onLight/45">
                  Card details are collected securely by Paystack — we never see or store them.
                </p>
                {payError && <p className="text-sm text-coral">{payError}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-10">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={paying}>Back</Button>
            ) : <span />}
            <Button onClick={() => (step < 2 ? continueToPayment() : handlePay())} disabled={paying}>
              {step < 2 ? 'Continue' : paying ? 'Processing…' : 'Pay with Paystack'}
            </Button>
          </div>
        </div>

        <aside className="bg-white border border-onLight/10 rounded-2xl p-6 h-fit">
          <h3 className="font-semibold text-sm mb-4">Order summary</h3>
          <div className="flex justify-between text-sm text-onLight/60 mb-2">
            <span>Items</span><span>{cart.items.reduce((a, c) => a + c.quantity, 0)}</span>
          </div>
          <div className="flex justify-between text-sm text-onLight/60 mb-2">
            <span>Subtotal</span><span>₦{cart.subtotal.toLocaleString()}</span>
          </div>
          {cart.discount > 0 && (
            <div className="flex justify-between text-sm text-coral mb-2">
              <span>Discount</span><span>-₦{cart.discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-onLight/60 mb-2">
            <span>Shipping</span><span>{cart.shipping === 0 ? 'Free' : `₦${cart.shipping.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between font-semibold pt-3 border-t border-onLight/10">
            <span>Total</span><span>₦{cart.total.toLocaleString()}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}
