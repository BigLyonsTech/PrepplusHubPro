/**
 * Single source of truth for "where does this user go next" after
 * logging in or verifying OTP. Previously, Login.jsx checked the user's
 * role/stage to decide, while OTPVerification.jsx always sent everyone to
 * /role-confirmation regardless of role — meaning an already-verified
 * returning user going through OTP again would get bounced back to role
 * selection instead of their dashboard. This fixes that by giving both
 * pages one shared function to call.
 */
export function getPostAuthRedirect(user) {
  if (!user) return '/register'

  if (!user.role) return '/role-confirmation'

  if (user.role === 'customer') {
    return user.onboardingStage === 'active' ? '/customer/dashboard' : '/onboarding/quiz'
  }

  if (user.role === 'vendor') {
    return user.onboardingStage === 'active' ? '/vendor/dashboard' : '/onboarding/vendor'
  }

  return '/role-confirmation'
}
