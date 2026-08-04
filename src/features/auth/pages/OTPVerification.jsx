import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import AuthLayout from '@/features/auth/AuthLayout'
import { verifyOtpSuccess } from '@/features/auth/authSlice'
import { getPostAuthRedirect } from '@/features/auth/postAuthRedirect'
import { apiPost } from '@/lib/api'

export default function OTPVerification() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const pendingEmail = useSelector((s) => s.auth.pendingEmail)
  const user = useSelector((s) => s.auth.user)
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [devOtp, setDevOtp] = useState(user?.devOtp || null)
  const refs = useRef([])

  function autofillDevOtp() {
    if (!devOtp) return
    setDigits(devOtp.split(''))
  }

  function handleChange(i, val) {
    if (!/^\d?$/.test(val)) return
    const next = [...digits]
    next[i] = val
    setDigits(next)
    if (val && i < 5) refs.current[i + 1]?.focus()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const code = digits.join('')
    if (code.length !== 6) {
      setError('Enter all 6 digits.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const data = await apiPost('/auth/verify-otp', { email: pendingEmail || user?.email, otp: code })
      dispatch(verifyOtpSuccess({ token: data.token }))
      navigate(getPostAuthRedirect(data.user || user))
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResendOTP() {
    setIsResending(true)
    setResendMessage('')

    try {
      const data = await apiPost(`/auth/send-otp?email=${encodeURIComponent(pendingEmail || user?.email)}`)
      setResendMessage('Code resent to your email. Check your inbox.')
      setDigits(['', '', '', '', '', ''])
      setDevOtp(data.devOtp || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout as={motion.form} onSubmit={handleSubmit} maxWidth="max-w-sm" className="text-center">
      <h1 className="font-display text-3xl font-semibold mb-2">Verify your email</h1>
      <p className="text-onLight/50 mb-8 text-sm">
        We sent a 6-digit code to {pendingEmail || 'your email'}.
      </p>
      {devOtp && (
        <button
          type="button"
          onClick={autofillDevOtp}
          className="mb-4 w-full text-xs text-amber bg-amber/10 border border-amber/30 rounded-lg px-3 py-2 hover:bg-amber/15"
        >
          DEV MODE — code is <span className="font-mono font-semibold">{devOtp}</span> (click to autofill)
        </button>
      )}
      <div className="flex justify-center gap-2 mb-4">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            maxLength={1}
            inputMode="numeric"
            className="w-11 h-12 text-center text-lg rounded-xl border border-onLight/15 bg-white focus:border-leaf focus:ring-1 focus:ring-leaf outline-none"
          />
        ))}
      </div>
      {error && <p className="text-xs text-coral mb-4">{error}</p>}
      {resendMessage && <p className="text-xs text-leaf mb-4">{resendMessage}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Verifying...' : 'Verify'}
      </Button>
      <button type="button" onClick={handleResendOTP} disabled={isResending} className="mt-5 text-sm text-leaf hover:underline disabled:opacity-50">
        {isResending ? 'Resending...' : 'Resend code'}
      </button>
    </AuthLayout>
  )
}
