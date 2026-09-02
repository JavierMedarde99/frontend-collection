import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchBooks, createBook } from '../api/booksApi'
import { BOOK_TYPES, BOOK_STATES } from '../constants/books'
import Spinner from './Spinner'
import StarRating from './StarRating'
import EmptyState from './EmptyState'

function mapResultToBook(result) {
  return {
    title: result.title || 'Sin título',
    author: (result.authors && result.authors[0]) || 'Autor desconocido',
    descripcion: result.description,
    pages: result.pageCount,
    frontpage: result.coverImage,
    externalId: result.id,
  }
}

export default function BookSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searching, setSearching] = useState(null)

  const [selected, setSelected] = useState(null)
  const [modalType, setModalType] = useState('NOVEL')
  const [modalState, setModalState] = useState('TO_READ')
  const [modalStartDate, setModalStartDate] = useState('')
  const [modalEndDate, setModalEndDate] = useState('')
  const [modalStart, setModalStart] = useState(0)
  const [modalComment, setModalComment] = useState('')

  const showStartDate = modalState !== 'TO_READ'
  const showEndDate = modalState === 'COMPLETED'
  const showRating = modalState === 'COMPLETED'
  const showComment = modalState === 'COMPLETED'

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

  function handleAddClick(result) {
    setSelected(result)
    setModalType('NOVEL')
    setModalState('TO_READ')
  }

  async function handleConfirm() {
    if (!selected) return
    setSearching(selected.id)
    try {
      const created = await createBook({
        ...mapResultToBook(selected),
        type: modalType,
        state: modalState,
        ...(showStartDate ? { startDate: modalStartDate || undefined } : {}),
        ...(showEndDate ? { endDate: modalEndDate || undefined } : {}),
        ...(showRating ? { start: modalStart || undefined } : {}),
        ...(showComment ? { comment: modalComment || undefined } : {}),
      })
      setSelected(null)
      navigate(`/editar/${created.id}`)
    } catch (err) {
      window.alert(err.message || 'No se pudo añadir el libro.')
    } finally {
      setSearching(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
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
                  onClick={() => handleAddClick(result)}
                  disabled={searching === result.id}
                >
                  {searching === result.id ? 'Añadiendo…' : 'Añadir a mi colección'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/30 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" className="card w-full max-w-md">
            <h3 className="text-headline-md mb-1">{selected.title}</h3>
            <p className="text-body-md text-on-surface-variant mb-5">
              {(selected.authors && selected.authors.join(', ')) || 'Autor desconocido'}
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="label">
                  Tipo <span className="text-digital-blue">*</span>
                </label>
                <select className="input" value={modalType} onChange={(e) => setModalType(e.target.value)}>
                  {Object.entries(BOOK_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  Estado <span className="text-digital-blue">*</span>
                </label>
                <select className="input" value={modalState} onChange={(e) => setModalState(e.target.value)}>
                  {Object.entries(BOOK_STATES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {showStartDate && (
                <div>
                  <label className="label">Fecha de inicio</label>
                  <input className="input" type="date" value={modalStartDate} onChange={(e) => setModalStartDate(e.target.value)} />
                </div>
              )}
              {showEndDate && (
                <div>
                  <label className="label">Fecha de fin</label>
                  <input className="input" type="date" value={modalEndDate} onChange={(e) => setModalEndDate(e.target.value)} />
                </div>
              )}
              {showRating && (
                <div>
                  <label className="label">Valoración</label>
                  <div className="pt-2">
                    <StarRating value={modalStart} onChange={setModalStart} />
                  </div>
                </div>
              )}
              {showComment && (
                <div>
                  <label className="label">Comentario</label>
                  <textarea
                    className="input !h-auto !min-h-[80px] !py-3"
                    value={modalComment}
                    onChange={(e) => setModalComment(e.target.value)}
                    placeholder="Notas personales…"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                className="btn-ghost"
                onClick={() => setSelected(null)}
                disabled={searching === selected.id}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleConfirm}
                disabled={searching === selected.id}
              >
                {searching === selected.id ? 'Añadiendo…' : 'Añadir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
