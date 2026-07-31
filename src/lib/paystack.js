const SCRIPT_URL = 'https://js.paystack.co/v1/inline.js'

let scriptPromise = null

function loadPaystackScript() {
  if (window.PaystackPop) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      scriptPromise = null
      reject(new Error('Failed to load Paystack checkout script'))
    }
    document.body.appendChild(script)
  })

  return scriptPromise
}

export async function openPaystackPopup({ email, amountKobo, reference, publicKey, onSuccess, onClose }) {
  if (!publicKey) {
    throw new Error('Paystack public key is not configured (VITE_PAYSTACK_PUBLIC_KEY)')
  }

  await loadPaystackScript()

  const handler = window.PaystackPop.setup({
    key: publicKey,
    email,
    amount: amountKobo,
    ref: reference,
    currency: 'NGN',
    callback: (response) => onSuccess(response.reference),
    onClose: () => onClose?.(),
  })

  handler.openIframe()
}
