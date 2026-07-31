import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Input'
import AuthLayout from '@/features/auth/AuthLayout'
import { registerStart } from '@/features/auth/authSlice'
import { ShieldCheck } from 'lucide-react'
import { apiGet } from '@/lib/api'

const idTypes = ['National ID (NIN)', 'International Passport', "Driver's License", 'Voter\'s Card']

export default function RegistrationForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [captchaChecked, setCaptchaChecked] = useState(false)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    idType: idTypes[0],
    idNumber: '',
    dob: '',
    address: '',
  })

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = {}
    if (!form.name) nextErrors.name = 'Enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email.'
    if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters.'
    if (!form.phone) nextErrors.phone = 'Enter a phone number.'
    if (!form.idNumber) nextErrors.idNumber = 'ID number is required.'
    if (!form.dob) nextErrors.dob = 'Date of birth is required.'
    if (!form.address) nextErrors.address = 'Enter your address.'
    if (!captchaChecked) nextErrors.captcha = 'Confirm you\'re not a robot.'

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setIsSubmitting(true)
    setSubmitMessage('')

    try {
      const payload = {
        email: form.email,
        password: form.password,
        role: 'CUSTOMER',
        firstName: form.name.split(' ')[0] || form.name,
        lastName: form.name.split(' ').slice(1).join(' ') || '',
        phoneNumber: form.phone,
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      dispatch(registerStart({ id: `u-${Date.now()}`, ...form, email: payload.email, devOtp: data.devOtp || null }))
      setSubmitMessage(data.message || 'Account created. Please verify your email.')
      navigate('/verify-otp')
    } catch (error) {
      setErrors((prev) => ({ ...prev, submit: error.message }))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      as={motion.form}
      onSubmit={handleSubmit}
      maxWidth="max-w-xl"
      className="bg-white border border-onLight/10 rounded-3xl p-8 md:p-10"
    >
      <h1 className="font-display text-3xl font-semibold mb-1">Create your account</h1>
          <p className="text-onLight/50 mb-8 text-sm">
            We collect a few identity details now so verification never blocks you later.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Full name" error={errors.name}>
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Ada Obi" />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="ada@email.com"
              />
            </Field>
            <Field label="Password" error={errors.password} hint="At least 8 characters">
              <Input
                type="password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="••••••••"
              />
            </Field>
            <Field label="Phone number" error={errors.phone}>
              <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+234 800 000 0000" />
            </Field>
            <Field label="ID type">
              <Select value={form.idType} onChange={(e) => update('idType', e.target.value)}>
                {idTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </Field>
            <Field label="ID number" error={errors.idNumber}>
              <Input value={form.idNumber} onChange={(e) => update('idNumber', e.target.value)} placeholder="00000000000" />
            </Field>
            <Field label="Date of birth" error={errors.dob}>
              <Input type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)} />
            </Field>
            <Field label="Address" error={errors.address}>
              <Input value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Street, city, state" />
            </Field>
          </div>

          <label className="mt-7 flex items-center gap-3 p-4 rounded-xl border border-onLight/10 bg-paper cursor-pointer">
            <input
              type="checkbox"
              checked={captchaChecked}
              onChange={(e) => setCaptchaChecked(e.target.checked)}
              className="size-4 accent-leaf"
            />
            <ShieldCheck size={18} className="text-onLight/40" />
            <span className="text-sm text-onLight/70">I'm not a robot</span>
          </label>
          {errors.captcha && <span className="block text-xs text-coral mt-1.5">{errors.captcha}</span>}

          {errors.submit && <span className="block text-xs text-coral mt-3">{errors.submit}</span>}
          {submitMessage && <span className="block text-xs text-leaf mt-3">{submitMessage}</span>}

          <Button type="submit" size="lg" className="w-full mt-8" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Continue'}
          </Button>
    </AuthLayout>
  )
}
