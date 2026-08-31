import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchBooks, createBook } from '../api/booksApi'
import Spinner from '../components/Spinner'
import EmptyState from '../components/EmptyState'

function mapResultToBook(result) {
  const isbn = result.isbn ? `ISBN: ${result.isbn}` : ''
  const publisher = result.publisher ? ` · ${result.publisher}` : ''
  return {
    title: result.title || 'Sin título',
    author: (result.authors && result.authors[0]) || 'Autor desconocido',
    descripcion: result.description,
    pages: result.pageCount,
    frontpage: result.coverImage,
    externalId: result.id,
  }
}

export default function BookSearchPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searching, setSearching] = useState(null)

  async function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const data = await searchBooks(q)
      setResults(data || [])
    } catch (err) {
      setError(err.message || 'No se pudo realizar la búsqueda.')
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(result) {
    setSearching(result.id)
    try {
      const created = await createBook(mapResultToBook(result))
      navigate(`/editar/${created.id}`)
    } catch (err) {
      window.alert(err.message || 'No se pudo añadir el libro.')
    } finally {
      setSearching(null)
    }
  }

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="text-headline-lg mb-1">Buscar libros</h1>
        <p className="text-body-md text-on-surface-variant">
          Busca en Google Books y añade resultados directamente a tu colección.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          className="input flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título, autor…"
          aria-label="Búsqueda"
        />
        <button className="btn-primary" type="submit" disabled={loading}>
          Buscar
        </button>
      </form>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {loading && <Spinner label="Buscando…" />}

      {!loading && results !== null && results.length === 0 && (
        <EmptyState title="Sin resultados" message={`No se encontraron resultados para "${query}".`} />
      )}

      {!loading && results && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((result) => (
            <article key={result.id} className="card flex gap-5">
              {result.coverImage ? (
                <img
                  src={result.coverImage}
                  alt={result.title}
                  className="w-20 h-28 object-cover rounded shrink-0 bg-surface-muted"
                />
              ) : (
                <div className="w-20 h-28 rounded shrink-0 bg-surface-muted flex items-center justify-center text-label-sm text-on-surface-variant">
                  Sin portada
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-headline-md leading-snug mb-1">{result.title || 'Sin título'}</h3>
                <p className="text-body-md text-on-surface-variant">
                  {(result.authors && result.authors.join(', ')) || 'Autor desconocido'}
                </p>
                <p className="text-label-sm text-on-surface-variant uppercase tracking-wide mt-1">
                  {(result.isbn ? `ISBN: ${result.isbn}` : '')}
                  {(result.publisher ? ` · ${result.publisher}` : '')}
                </p>
                {result.description && (
                  <p className="text-body-md text-on-surface-variant line-clamp-2 mt-2">
                    {result.description}
                  </p>
                )}
                <button
                  className="btn-primary !h-10 !px-4 mt-4"
                  onClick={() => handleAdd(result)}
                  disabled={searching === result.id}
                >
                  {searching === result.id ? 'Añadiendo…' : 'Añadir a mi colección'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
