import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Input'
import AuthLayout from '@/features/auth/AuthLayout'
import { loginSuccess } from '@/features/auth/authSlice'
import { getPostAuthRedirect } from '@/features/auth/postAuthRedirect'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth.user)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      dispatch(loginSuccess({ token: data.token }))
      navigate(getPostAuthRedirect(data.user || user || { role: 'CUSTOMER' }))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout as={motion.form} onSubmit={handleSubmit} maxWidth="max-w-sm">
      <h1 className="font-display text-3xl font-semibold mb-8 text-center">Log in</h1>
      <div className="space-y-4">
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@email.com" required />
        </Field>
        <Field label="Password">
          <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" required />
        </Field>
      </div>
      {error && <span className="mt-4 block text-sm text-coral">{error}</span>}
      <Button type="submit" size="lg" className="w-full mt-8" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </Button>
    </AuthLayout>
  )
}
