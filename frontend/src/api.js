const BASE = import.meta.env.VITE_API_URL || '/api'

function headers() {
  const token = localStorage.getItem('inv_token')
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, { method, headers: headers(), body: body ? JSON.stringify(body) : undefined })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  register:       (b) => req('POST', '/register', b),
  login:          (b) => req('POST', '/login', b),
  getProducts:    ()  => req('GET', '/products'),
  getProduct:     (id)=> req('GET', `/product/${id}`),
  createProduct:  (b) => req('POST', '/products', b),
  updateProduct:  (id, b) => req('PUT', `/product/${id}`, b),
  deleteProduct:  (id)=> req('DELETE', `/product/${id}`),
  getSuppliers:   ()  => req('GET', '/suppliers'),
  createSupplier: (b) => req('POST', '/suppliers', b),
  deleteSupplier: (id)=> req('DELETE', `/supplier/${id}`),
  getTransactions:(pid)=> req('GET', `/transactions${pid ? `?productId=${pid}` : ''}`),
  addTransaction: (b) => req('POST', '/transactions', b),
}
