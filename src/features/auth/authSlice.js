import { createSlice } from '@reduxjs/toolkit'

// Mirrors User schema additions from the brief (Section 5):
// onboardingStage, registrationIntent, role, personalizationProfile, vendorEligibility
const initialState = {
  user: null, // { id, name, email, role, kycDetails, onboardingStage, ... }
  isAuthenticated: false,
  token: localStorage.getItem('prepplushub_token'), // JWT for Authorization headers, set on login/verify-otp
  pendingEmail: null, // email awaiting OTP confirmation
  registrationIntent: null, // "customer" | "vendor" | null — set via referrer/query param
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRegistrationIntent(state, action) {
      state.registrationIntent = action.payload
    },
    registerStart(state, action) {
      // Account created but unverified; OTP has been sent
      state.pendingEmail = action.payload.email
      state.user = {
        ...action.payload,
        onboardingStage: 'kyc_pending',
        role: null,
      }
    },
    verifyOtpSuccess(state, action) {
      if (state.user) {
        state.user.onboardingStage = 'role_selection'
      }
      state.isAuthenticated = true
      state.pendingEmail = null
      setToken(state, action)
    },
    loginSuccess(state, action) {
      state.isAuthenticated = true
      setToken(state, action)
    },
    confirmRole(state, action) {
      if (state.user) {
        state.user.role = action.payload // "customer" | "vendor"
        state.user.onboardingStage =
          action.payload === 'customer' ? 'personalizing' : 'personalizing'
      }
    },
    completePersonalization(state, action) {
      if (state.user) {
        state.user.personalizationProfile = action.payload
        state.user.onboardingStage = 'active'
      }
    },
    submitVendorEligibility(state, action) {
      if (state.user) {
        state.user.vendorEligibility = {
          ...action.payload,
          submittedAt: new Date().toISOString(),
        }
        state.user.vendorVerificationStatus = 'pending'
        state.user.onboardingStage = 'active'
      }
    },
    setVendorVerification(state, action) {
      if (state.user) {
        state.user.vendorVerificationStatus = action.payload.status
        state.user.vendorEligibility = {
          ...state.user.vendorEligibility,
          reviewedAt: new Date().toISOString(),
          reviewedBy: action.payload.reviewedBy,
          rejectionReason: action.payload.rejectionReason || null,
        }
      }
    },
    logout(state) {
      state.user = null
      state.isAuthenticated = false
      state.pendingEmail = null
      state.token = null
      localStorage.removeItem('prepplushub_token')
    },
  },
})

// Shared by verifyOtpSuccess/loginSuccess: persists the JWT so lib/api.js can attach it as a Bearer header.
function setToken(state, action) {
  const token = action.payload?.token
  if (token) {
    state.token = token
    localStorage.setItem('prepplushub_token', token)
  }
}

export const {
  setRegistrationIntent,
  registerStart,
  verifyOtpSuccess,
  loginSuccess,
  confirmRole,
  completePersonalization,
  submitVendorEligibility,
  setVendorVerification,
  logout,
} = authSlice.actions

export default authSlice.reducer
