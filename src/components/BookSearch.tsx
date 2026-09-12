import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchBooks, createBook } from '../api/booksApi'
import { BOOK_TYPES, BOOK_STATES } from '../constants/books'
import { BookType, BookState, type BookFormData, type SearchBookResult } from '../types'
import Spinner from './Spinner'
import StarRating from './StarRating'
import EmptyState from './EmptyState'
import ErrorBanner from './ErrorBanner'
import SearchField from './SearchField'

function mapResultToBook(result: SearchBookResult): Omit<BookFormData, 'type' | 'state'> {
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
  const [results, setResults] = useState<SearchBookResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searching, setSearching] = useState<string | null>(null)

  const [selected, setSelected] = useState<SearchBookResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [modalType, setModalType] = useState<BookType>(BookType.NOVEL)
  const [modalState, setModalState] = useState<BookState>(BookState.TO_READ)
  const [modalStartDate, setModalStartDate] = useState('')
  const [modalEndDate, setModalEndDate] = useState('')
  const [modalStart, setModalStart] = useState(0)
  const [modalComment, setModalComment] = useState('')

  const showStartDate = modalState !== BookState.TO_READ
  const showEndDate = modalState === BookState.COMPLETED
  const showRating = modalState === BookState.COMPLETED
  const showComment = modalState === BookState.COMPLETED

  async function handleSearch(e: FormEvent<HTMLFormElement>) {
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
      setError(err instanceof Error ? err.message : 'No se pudo realizar la búsqueda.')
    } finally {
      setLoading(false)
    }
  }

  function handleAddClick(result: SearchBookResult) {
    setSelected(result)
    setSubmitError(null)
    setModalType(BookType.NOVEL)
    setModalState(BookState.TO_READ)
  }

  async function handleConfirm() {
    if (!selected) return
    setSubmitError(null)
    setSearching(selected.id)
    try {
      await createBook({
        ...mapResultToBook(selected),
        type: modalType,
        state: modalState,
        ...(showStartDate ? { startDate: modalStartDate || undefined } : {}),
        ...(showEndDate ? { endDate: modalEndDate || undefined } : {}),
        ...(showRating ? { start: modalStart || undefined } : {}),
        ...(showComment ? { comment: modalComment || undefined } : {}),
      })
      setSelected(null)
      navigate('/coleccion')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo añadir el libro.')
    } finally {
      setSearching(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SearchField
        value={query}
        onChange={setQuery}
        onSubmit={handleSearch}
        placeholder="Buscar por título, autor…"
        label="Búsqueda"
        loading={loading}
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      {loading && <Spinner label="Buscando…" />}

      {!loading && results !== null && results.length === 0 && (
        <EmptyState title="Sin resultados" message={`No se encontraron resultados para "${query}".`} />
      )}

      {!loading && results && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((result) => (
            <article key={result.id} className="card card-hover flex gap-5">
              {result.coverImage ? (
                <img
                  src={result.coverImage}
                  alt={result.title}
                  className="w-20 h-28 object-cover rounded shadow-sm shrink-0 bg-paper"
                />
              ) : (
                <div className="w-20 h-28 rounded shrink-0 bg-paper border border-silver/60 flex items-center justify-center text-caption text-slate">
                  <span>Sin portada</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-heading leading-snug mb-1">{result.title || 'Sin título'}</h3>
                <p className="text-body text-graphite">
                  {(result.authors && result.authors.join(', ')) || 'Autor desconocido'}
                </p>
                <p className="text-caption text-slate mt-1">
                  {(result.isbn ? `ISBN: ${result.isbn}` : '')}
                  {(result.publisher ? ` · ${result.publisher}` : '')}
                </p>
                {result.description && (
                  <p className="text-body text-slate line-clamp-2 mt-2">
                    {result.description}
                  </p>
                )}
                <button
                  className="btn-primary !px-4 !py-2 mt-4"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md modal-sheet">
          <div role="dialog" aria-modal="true" className="modal w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="font-display text-heading-sm mb-1 leading-snug">{selected.title}</h3>
            <p className="text-body text-graphite mb-5">
              {(selected.authors && selected.authors.join(', ')) || 'Autor desconocido'}
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="label">
                  Tipo <span className="text-brand">*</span>
                </label>
                <select className="input" value={modalType} onChange={(e) => setModalType(e.target.value as BookType)}>
                  {Object.entries(BOOK_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  Estado <span className="text-brand">*</span>
                </label>
                <select className="input" value={modalState} onChange={(e) => setModalState(e.target.value as BookState)}>
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

            {submitError && <ErrorBanner message={submitError} />}

            <div className="flex justify-end gap-3 mt-6 border-t border-silver/60 pt-5">
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