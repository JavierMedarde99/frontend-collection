import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchFunkosPage, createFunko } from '../api/funkosApi'
import { FIGURE_STATUS_LABELS } from '../constants/figures'
import { FunkoStatus } from '../types'
import type { FunkoFormData, FunkoSearchResult } from '../types'
import Spinner from './Spinner'
import EmptyState from './EmptyState'
import ErrorBanner from './ErrorBanner'
import SearchField from './SearchField'
import SkeletonInline from './SkeletonInline'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'

const MIN_QUERY_LENGTH = 2

function mapResultToFunko(result: FunkoSearchResult): Omit<FunkoFormData, 'status'> {
  return {
    externalId: result.externalId,
    name: result.name || 'Sin nombre',
    series: result.series,
    number: result.number,
    category: result.category,
    exclusive: result.exclusive,
    vaulted: result.vaulted,
    releaseYear: result.releaseYear,
    franchise: result.franchise,
    popType: result.popType,
    rarityScore: result.rarityScore,
    imageUrl: result.imageUrl,
    externalSource: result.externalSource,
  }
}

export default function FunkoSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [guardError, setGuardError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const {
    items: results,
    hasMore,
    loading,
    loadingMore,
    error,
    sentinelRef,
  } = useInfiniteScroll<FunkoSearchResult>({
    size: 10,
    errorMessage: 'No se pudo realizar la búsqueda.',
    enabled: submitted !== null,
    fetchPage: (page, size) => searchFunkosPage(submitted ?? '', page, size),
    deps: [submitted],
  })

  const [selected, setSelected] = useState<FunkoSearchResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [modalStatus, setModalStatus] = useState<FunkoStatus>(FunkoStatus.OWNED)
  const [modalNotes, setModalNotes] = useState('')

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    // El backend de Funko exige un mínimo de 2 caracteres (400 por debajo).
    if (q.length < MIN_QUERY_LENGTH) {
      setGuardError('Escribe al menos 2 caracteres.')
      return
    }
    setGuardError(null)
    setSubmitted(q)
  }

  function handleAddClick(result: FunkoSearchResult) {
    setSelected(result)
    setSubmitError(null)
    setModalStatus(FunkoStatus.OWNED)
    setModalNotes('')
  }

  async function handleConfirm() {
    if (!selected) return
    setSubmitError(null)
    setSaving(selected.externalId)
    try {
      await createFunko({
        ...mapResultToFunko(selected),
        status: modalStatus,
        notes: modalNotes.trim() || undefined,
      })
      setSelected(null)
      navigate('/figuras/funkopop')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo añadir el Funko Pop.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <SearchField
        value={query}
        onChange={setQuery}
        onSubmit={handleSearch}
        placeholder="Buscar por nombre…"
        label="Búsqueda"
        loading={loading}
      />

      {guardError && <ErrorBanner message={guardError} />}

      {error && <ErrorBanner message={error} />}

      {loading && <Spinner label="Buscando…" />}

      {!loading && submitted !== null && results.length === 0 && !error && (
        <EmptyState title="Sin resultados" message={`No se encontraron resultados para "${submitted}".`} />
      )}

      {!loading && results.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((result) => {
              const collection = [result.series, result.number].filter(Boolean).join(' · ')
              const details = [collection || null, result.releaseYear ? String(result.releaseYear) : null]
                .filter(Boolean)
                .join(' · ')
              return (
                <article key={result.externalId} className="result-card">
                  {result.imageUrl ? (
                    <img
                      src={result.imageUrl}
                      alt={result.name}
                      className="w-20 h-28 object-cover rounded shadow-sm shrink-0 bg-paper"
                    />
                  ) : (
                    <div className="w-20 h-28 rounded shrink-0 bg-paper border border-silver/60 flex items-center justify-center text-caption text-slate">
                      <span>Sin imagen</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-heading leading-snug mb-1">{result.name || 'Sin nombre'}</h3>
                    {details && <p className="text-caption text-slate mt-1">{details}</p>}
                    {result.franchise && (
                      <p className="text-body text-slate line-clamp-2 mt-2">{result.franchise}</p>
                    )}
                    <button
                      className="btn-primary !px-4 !py-2 mt-4"
                      onClick={() => handleAddClick(result)}
                      disabled={saving === result.externalId}
                    >
                      {saving === result.externalId ? 'Añadiendo…' : 'Añadir a mi colección'}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
          {loadingMore && <SkeletonInline count={2} />}
          {!hasMore && (
            <p className="text-body-sm text-graphite text-center" role="status">
              No hay más resultados
            </p>
          )}
          <div ref={sentinelRef} className="h-px" aria-hidden="true" />
        </>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md modal-sheet">
          <div role="dialog" aria-modal="true" className="modal-paper w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <h3 className="font-display text-heading-sm mb-1 leading-snug">{selected.name}</h3>
            <p className="text-body text-graphite mb-5">
              {[selected.series, selected.number].filter(Boolean).join(' · ') || 'Funko Pop'}
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="label">
                  Estado <span className="text-brand">*</span>
                </label>
                <select
                  className="input"
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as FunkoStatus)}
                >
                  {Object.entries(FIGURE_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Notas</label>
                <textarea
                  className="input !h-auto !min-h-[80px] !py-3"
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Notas personales…"
                />
              </div>
            </div>

            {submitError && <ErrorBanner message={submitError} />}

            <div className="flex justify-end gap-3 mt-6 border-t border-silver/60 pt-5">
              <button
                className="btn-ghost"
                onClick={() => setSelected(null)}
                disabled={saving === selected.externalId}
              >
                Cancelar
              </button>
              <button
                className="btn-primary"
                onClick={handleConfirm}
                disabled={saving === selected.externalId}
              >
                {saving === selected.externalId ? 'Añadiendo…' : 'Añadir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
