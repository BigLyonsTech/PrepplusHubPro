import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Button from '@/components/ui/Button'
import AuthLayout from '@/features/auth/AuthLayout'
import { setRegistrationIntent } from '@/features/auth/authSlice'

export default function AuthEntry() {
  const [params] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    // e.g. /auth?intent=customer when the link came from a product page
    const intent = params.get('intent')
    if (intent) dispatch(setRegistrationIntent(intent))
  }, [params, dispatch])

  return (
    <AuthLayout className="text-center">
      <h1 className="font-display text-4xl font-semibold mb-3">Welcome to PrepplusHub</h1>
      <p className="text-onLight/60 mb-10">
        One account, whichever way you want to use it — as a shopper or as a vendor.
      </p>
      <div className="flex flex-col gap-3">
        <Button size="lg" onClick={() => navigate('/register')} className="w-full">
          Create an account
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="w-full">
          Log in
        </Button>
      </div>
    </AuthLayout>
  )
}
