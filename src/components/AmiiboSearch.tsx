import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchAmiibosPage, createAmiibo } from '../api/amiibosApi'
import { FIGURE_STATUS_LABELS } from '../constants/figures'
import { AmiiboStatus } from '../types'
import type { AmiiboFormData, AmiiboSearchResult } from '../types'
import Spinner from './Spinner'
import EmptyState from './EmptyState'
import ErrorBanner from './ErrorBanner'
import SearchField from './SearchField'
import SkeletonInline from './SkeletonInline'
import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { todayIso, missingRequiredDate } from '../utils/dates'

function mapResultToAmiibo(result: AmiiboSearchResult): Omit<AmiiboFormData, 'status'> {
  return {
    externalId: result.externalId,
    name: result.name || 'Sin nombre',
    character: result.character,
    amiiboSeries: result.amiiboSeries,
    gameSeries: result.gameSeries,
    amiiboType: result.amiiboType,
    releaseDates: result.releaseDates,
    imageUrl: result.imageUrl,
    compatibleGames: result.compatibleGames,
    externalSource: result.externalSource,
  }
}

export default function AmiiboSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const {
    items: results,
    hasMore,
    loading,
    loadingMore,
    error,
    sentinelRef,
  } = useInfiniteScroll<AmiiboSearchResult>({
    size: 10,
    errorMessage: 'No se pudo realizar la búsqueda.',
    enabled: submitted !== null,
    fetchPage: (page, size) => searchAmiibosPage(submitted ?? '', page, size),
    deps: [submitted],
  })

  const [selected, setSelected] = useState<AmiiboSearchResult | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [modalStatus, setModalStatus] = useState<AmiiboStatus>(AmiiboStatus.OWNED)
  const [modalNotes, setModalNotes] = useState('')
  const [modalAcquisitionDate, setModalAcquisitionDate] = useState('')
  const [modalAcquisitionPrice, setModalAcquisitionPrice] = useState('')

  const showAcquisition = modalStatus !== AmiiboStatus.WISHLIST

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    // Amiibo solo rechaza la consulta vacía: sin guarda de longitud mínima.
    if (!q) return
    setSubmitted(q)
  }

  function handleAddClick(result: AmiiboSearchResult) {
    setSelected(result)
    setSubmitError(null)
    setModalStatus(AmiiboStatus.OWNED)
    setModalNotes('')
    setModalAcquisitionDate(todayIso())
    setModalAcquisitionPrice('')
  }

  async function handleConfirm() {
    if (!selected) return
    setSubmitError(null)
    if (showAcquisition) {
      const dateError = missingRequiredDate(modalAcquisitionDate, 'La fecha de obtención')
      if (dateError) {
        setSubmitError(dateError)
        return
      }
    }
    setSaving(selected.externalId)
    try {
      await createAmiibo({
        ...mapResultToAmiibo(selected),
        status: modalStatus,
        notes: modalNotes.trim() || undefined,
        ...(showAcquisition && modalAcquisitionDate ? { acquisitionDate: modalAcquisitionDate } : {}),
        ...(showAcquisition && modalAcquisitionPrice !== ''
          ? { acquisitionPrice: Number(modalAcquisitionPrice) }
          : {}),
      })
      setSelected(null)
      navigate('/figuras/amiibo')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo añadir el Amiibo.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <SearchField
          value={query}
          onChange={setQuery}
          onSubmit={handleSearch}
          placeholder="Buscar por nombre (p. ej. «Link»)…"
          label="Buscar por nombre"
          loading={loading}
        />
        <p className="text-caption text-graphite">
          La búsqueda es por <strong>nombre</strong> de la figura o personaje (p. ej. «Link»), no por serie de
          juego («The Legend of Zelda»).
        </p>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading && <Spinner label="Buscando…" />}

      {!loading && submitted !== null && results.length === 0 && !error && (
        <EmptyState title="Sin resultados" message={`No se encontraron resultados para "${submitted}".`} />
      )}

      {!loading && results.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((result) => {
              const series = [result.amiiboSeries, result.gameSeries].filter(Boolean).join(' · ')
              const details = [result.character || null, series || null]
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
              {[selected.character, selected.amiiboSeries].filter(Boolean).join(' · ') || 'Amiibo'}
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="label">
                  Estado <span className="text-brand">*</span>
                </label>
                <select
                  className="input"
                  value={modalStatus}
                  onChange={(e) => setModalStatus(e.target.value as AmiiboStatus)}
                >
                  {Object.entries(FIGURE_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {showAcquisition && (
                <>
                  <div>
                    <label className="label">
                      Fecha de obtención <span className="text-brand">*</span>
                    </label>
                    <input
                      className="input"
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
                      placeholder="14.99"
                    />
                  </div>
                </>
              )}

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
