const BASE_URL = '/api/books'

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!res.ok) {
    let message = `Error ${res.status}`
    try {
      const body = await res.json()
      if (body && body.message) message = body.message
      else if (body && body.error) message = body.error
    } catch {
      /* ignore */
    }
    const error = new Error(message)
    error.status = res.status
    throw error
  }

  if (res.status === 204) return null
  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return res.json()
  return null
}

export function listBooks(params = {}) {
  const search = new URLSearchParams()
  const { page, size, sort, state, name, author, type } = params
  if (page !== undefined && page !== null) search.set('page', page)
  if (size !== undefined && size !== null) search.set('size', size)
  if (sort) search.set('sort', sort)
  if (state) search.set('state', state)
  if (name) search.set('name', name)
  if (author) search.set('author', author)
  if (type) search.set('type', type)
  const qs = search.toString()
  return request(`${BASE_URL}${qs ? `?${qs}` : ''}`)
}

export function getBook(id) {
  return request(`${BASE_URL}/${id}`)
}

export function createBook(book) {
  return request(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(book),
  })
}

export function updateBook(id, book) {
  return request(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(book),
  })
}

export function deleteBook(id) {
  return request(`${BASE_URL}/${id}`, { method: 'DELETE' })
}

export function searchBooks(name) {
  return request(`${BASE_URL}/search?name=${encodeURIComponent(name)}`)
}
