import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBook, searchBooksByIsbn } from '../api/booksApi'
import { BOOK_TYPES, BOOK_STATES } from '../constants/books'
import { BookType, BookState } from '../types'
import type { SearchBookResult } from '../types'
import BookBarcodeScanner from './BookBarcodeScanner'
import ErrorBanner from './ErrorBanner'
import Spinner from './Spinner'
import EmptyState from './EmptyState'
import StarRating from './StarRating'
import { useToast } from './Toast'
import { missingRequiredDate, todayIso } from '../utils/dates'

function mapResultToBook(result: SearchBookResult) {
  return {
    title: result.title || 'Sin título',
    author: (result.authors && result.authors[0]) || 'Autor desconocido',
    descripcion: result.description,
    pages: result.pageCount,
    frontpage: result.coverImage,
    externalId: result.id,
    publisher: result.publisher,
    publicationYear: result.publicationYear ?? yearFromPublishedDate(result.publishedDate),
  }
}

/** Google Books devuelve la fecha como "1995" o "1995-03-01": extrae el año. */
function yearFromPublishedDate(publishedDate?: string): number | undefined {
  if (!publishedDate) return undefined
  const year = Number(publishedDate.slice(0, 4))
  return Number.isInteger(year) && year > 0 ? year : undefined
}

/** Pestaña de alta por código de barras: escanea ISBN, busca y añade el libro. */
export default function BookIsbnScan() {
  const navigate = useNavigate()
  const notify = useToast()
  const [scannerOpen, setScannerOpen] = useState(false)
  const [isbnInput, setIsbnInput] = useState('')
  const [isbn, setIsbn] = useState<string | null>(null)
  const [results, setResults] = useState<SearchBookResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const [selected, setSelected] = useState<SearchBookResult | null>(null)
  const [modalType, setModalType] = useState<BookType>(BookType.NOVEL)
  const [modalState, setModalState] = useState<BookState>(BookState.TO_READ)
  const [modalStartDate, setModalStartDate] = useState('')
  const [modalEndDate, setModalEndDate] = useState('')
  const [modalStart, setModalStart] = useState(0)
  const [modalComment, setModalComment] = useState('')
  const [modalPages, setModalPages] = useState('')
  const [modalAcquisitionDate, setModalAcquisitionDate] = useState('')
  const [modalAcquisitionPrice, setModalAcquisitionPrice] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  async function searchByIsbn(code: string) {
    const clean = code.trim()
    if (!clean) return
    setIsbn(clean)
    setResults([])
    setSearchError(null)
    setSearching(true)
    try {
      const page = await searchBooksByIsbn(clean, 0, 5)
      setResults(page.content ?? [])
    } catch {
      setSearchError('No se pudo buscar por ISBN. Inténtalo de nuevo.')
    } finally {
      setSearching(false)
    }
  }

  function handleBarcodeDetected(code: string) {
    setScannerOpen(false)
    setIsbnInput(code)
    void searchByIsbn(code)
  }

  function handleManualSearch(e: FormEvent) {
    e.preventDefault()
    void searchByIsbn(isbnInput)
  }

  const isWishlist = modalState === BookState.WISHLIST
  const showStartDate = modalState !== BookState.TO_READ && !isWishlist
  const showEndDate = modalState === BookState.COMPLETED
  const showRating = modalState === BookState.COMPLETED
  const showComment = modalState === BookState.COMPLETED
  const showAcquisition = !isWishlist
  const needsPages = !isWishlist && !selected?.pageCount

  async function handleConfirm() {
    if (!selected) return
    setAddError(null)
    const pages = modalPages !== '' ? Number(modalPages) : (selected.pageCount || 0)
    // En la lista de deseos el total aún no se conoce: no se exige.
    if (!isWishlist && (!pages || pages <= 0)) {
      setAddError('El nº de páginas es obligatorio.')
      return
    }
    // Fechas de seguimiento obligatorias, solo las que el estado deja ver.
    const dateError =
      (showAcquisition && missingRequiredDate(modalAcquisitionDate, 'La fecha de obtención')) ||
      (showStartDate && missingRequiredDate(modalStartDate, 'La fecha de inicio')) ||
      (showEndDate && missingRequiredDate(modalEndDate, 'La fecha de fin'))
    if (dateError) {
      setAddError(dateError)
      return
    }
    setAdding(true)
    try {
      await createBook({
        ...mapResultToBook(selected),
        ...(pages ? { pages } : {}),
        isbn: isbn || undefined,
        type: modalType,
        state: modalState,
        ...(showStartDate ? { startDate: modalStartDate } : {}),
        ...(showEndDate ? { endDate: modalEndDate } : {}),
        ...(showRating ? { start: modalStart || undefined } : {}),
        ...(showComment ? { comment: modalComment?.trim() || undefined } : {}),
        ...(showAcquisition ? { acquisitionDate: modalAcquisitionDate } : {}),
        ...(showAcquisition && modalAcquisitionPrice !== ''
          ? { acquisitionPrice: Number(modalAcquisitionPrice) }
          : {}),
      })
      notify('Libro guardado.')
      navigate('/coleccion')
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'No se pudo añadir el libro.')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="scan-frame">
        <p className="text-body text-slate">
          Escanea el código de barras del libro con la cámara o escribe su ISBN.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" className="btn-primary" onClick={() => setScannerOpen(true)}>
            📷 Escanear código
          </button>
          <form onSubmit={handleManualSearch} className="flex gap-2 flex-1">
            <input
              className="input flex-1"
              value={isbnInput}
              onChange={(e) => setIsbnInput(e.target.value)}
              placeholder="ISBN manual, ej. 978…"
              inputMode="numeric"
              aria-label="ISBN"
            />
            <button type="submit" className="btn-ghost shrink-0" disabled={searching}>
              Buscar
            </button>
          </form>
        </div>
      </div>

      {searching && <Spinner label="Buscando por ISBN…" />}
      {searchError && <ErrorBanner message={searchError} />}

      {!searching && isbn !== null && results.length === 0 && !searchError && (
        <EmptyState
          title="Sin resultados"
          message={`No se encontraron libros para el ISBN ${isbn}.`}
        />
      )}

      {results.length > 0 && (
        <ul className="flex flex-col gap-4">
          {results.map((result) => (
            <li key={result.id} className="result-card flex gap-5">
              {result.coverImage ? (
                <img
                  src={result.coverImage}
                  alt={result.title}
                  className="w-20 h-28 object-cover rounded shadow-sm shrink-0 bg-paper"
                />
              ) : (
                <div className="w-20 h-28 rounded shrink-0 bg-paper border border-silver/60 flex items-center justify-center text-caption text-slate">
                  <span>Sin imagen</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-heading leading-snug mb-1">{result.title || 'Sin título'}</h3>
                <p className="text-caption text-slate mt-1">
                  {[(result.authors || []).join(', '), result.publisher].filter(Boolean).join(' · ')}
                </p>
                <button className="btn-primary !px-4 !py-2 mt-4" onClick={() => {
                  setSelected(result)
                  setAddError(null)
                  setModalType(BookType.NOVEL)
                  setModalState(BookState.TO_READ)
                  setModalStartDate('')
                  setModalEndDate('')
                  setModalStart(0)
                  setModalComment('')
                  setModalPages('')
                  // Fechas de seguimiento obligatorias: se propone hoy al añadir.
                  setModalAcquisitionDate(todayIso())
                  setModalAcquisitionPrice('')
                  setModalStartDate(todayIso())
                  setModalEndDate(todayIso())
                }}>
                  Añadir a mi colección
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md modal-sheet"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="modal-paper w-full max-w-md max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-heading-sm mb-1 leading-snug">{selected.title}</h3>
            <p className="text-body text-graphite mb-5">ISBN {isbn}</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="label">Tipo</label>
                <select className="input" value={modalType} onChange={(e) => setModalType(e.target.value as BookType)}>
                  {Object.entries(BOOK_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Estado</label>
                <select className="input" value={modalState} onChange={(e) => setModalState(e.target.value as BookState)}>
                  {Object.entries(BOOK_STATES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              {showStartDate && (
                <div>
                  <label className="label" htmlFor="book-start-date">Fecha de inicio <span className="text-brand">*</span></label>
                  <input  id="book-start-date"className="input" type="date" value={modalStartDate} onChange={(e) => setModalStartDate(e.target.value)} />
                </div>
              )}
              {showEndDate && (
                <div>
                  <label className="label" htmlFor="book-end-date">Fecha de fin <span className="text-brand">*</span></label>
                  <input  id="book-end-date"className="input" type="date" value={modalEndDate} onChange={(e) => setModalEndDate(e.target.value)} />
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
              {needsPages && (
                <div>
                  <label className="label">
                    Nº de páginas <span className="text-brand">*</span>
                  </label>
                  <input
                    className="input"
                    type="number"
                    min="1"
                    value={modalPages}
                    onChange={(e) => setModalPages(e.target.value)}
                    placeholder="Ej. 320"
                  />
                </div>
              )}
              {showAcquisition && (
                <>
                  <div>
                    <label className="label" htmlFor="book-acq-date">Fecha de obtención <span className="text-brand">*</span></label>
                    <input
 id="book-acq-date"                      className="input"
                      type="date"
                      value={modalAcquisitionDate}
                      onChange={(e) => setModalAcquisitionDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Precio de adquisición</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      step="0.01"
                      value={modalAcquisitionPrice}
                      onChange={(e) => setModalAcquisitionPrice(e.target.value)}
                      placeholder="12.50"
                    />
                  </div>
                </>
              )}
            </div>
            {addError && <ErrorBanner message={addError} />}
            <div className="flex justify-end gap-3 mt-6 border-t border-silver/60 pt-5">
              <button type="button" className="btn-ghost" onClick={() => setSelected(null)} disabled={adding}>
                Cancelar
              </button>
              <button type="button" className="btn-primary" onClick={handleConfirm} disabled={adding}>
                {adding ? 'Añadiendo…' : 'Añadir'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BookBarcodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onBarcodeDetected={handleBarcodeDetected}
      />
    </div>
  )
}
