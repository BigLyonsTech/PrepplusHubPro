const normalizeBaseUrl = (value) => {
  if (!value) return '/api'
  return value.replace(/\/$/, '')
}

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)

async function apiFetch(path, options = {}) {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
  const token = localStorage.getItem('prepplushub_token')

  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(data.message || `Request failed with status ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  return response.text()
}

export async function apiGet(path, options = {}) {
  return apiFetch(path, { ...options, method: 'GET' })
}

export async function apiPost(path, body, options = {}) {
  return apiFetch(path, {
    ...options,
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

export async function apiPut(path, body, options = {}) {
  return apiFetch(path, {
    ...options,
    method: 'PUT',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

export async function apiDelete(path, options = {}) {
  return apiFetch(path, { ...options, method: 'DELETE' })
}

export async function getHealthStatus() {
  return apiGet('/health')
}
