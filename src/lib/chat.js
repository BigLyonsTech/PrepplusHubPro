const normalizeBaseUrl = (value) => {
  if (!value) return '/api'
  return value.replace(/\/$/, '')
}

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)

export async function streamChat(messages, { onDelta, signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  })

  if (!response.ok || !response.body) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.message || `Chat request failed with status ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    onDelta(decoder.decode(value, { stream: true }))
  }
}
