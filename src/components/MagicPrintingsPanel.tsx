import { useInfiniteScroll } from '../hooks/useInfiniteScroll'
import { getMagicCardPrintingsPage } from '../api/magicApi'
import type { MagicCardPrinting, MagicCardSearchResult } from '../types'
import ErrorBanner from './ErrorBanner'
import SkeletonInline from './SkeletonInline'
import Spinner from './Spinner'

interface MagicPrintingsPanelProps {
  /** Resultado de búsqueda del que se abrió el panel. */
  card: MagicCardSearchResult
  /** Cantidad marcada en el resultado; se aplica al guardar. */
  quantity: number
  onSelect: (printing: MagicCardPrinting) => void
  onClose: () => void
  /** Impresión que se está guardando (para deshabilitar y mostrar "Guardando…"). */
  busyScryfallId?: string | null
  saveError?: string | null
}

const LANG_LABELS: Record<string, string> = {
  en: 'Inglés',
  es: 'Español',
  fr: 'Francés',
  de: 'Alemán',
  it: 'Italiano',
  pt: 'Portugués',
  ja: 'Japonés',
  zh: 'Chino',
  ko: 'Coreano',
  ru: 'Ruso',
}

function langLabel(lang: string | undefined): string {
  if (!lang) return '—'
  const key = lang.toLowerCase()
  return LANG_LABELS[key] ?? key.toUpperCase()
}

function rarityLabel(rarity: string | undefined): string {
  if (!rarity) return ''
  return rarity.charAt(0).toUpperCase() + rarity.slice(1)
}

function badgesFor(printing: MagicCardPrinting): string[] {
  const badges: string[] = []
  if (printing.finishes?.includes('foil')) badges.push('Foil')
  if (printing.fullArt) badges.push('Full art')
  for (const effect of printing.frameEffects ?? []) {
    if (effect === 'extendedart') badges.push('Extended')
    else if (effect === 'borderless') badges.push('Borderless')
    else if (effect === 'showcase') badges.push('Showcase')
  }
  if ((printing.promoTypes?.length ?? 0) > 0) badges.push('Promo')
  return badges
}

/**
 * Panel para elegir una impresión concreta de una carta antes de guardarla.
 * Carga las impresiones con scroll infinito (páginas de 175, Scryfall ignora
 * page_size) y solo muestra lo que hay en el DOM; al elegir una, el padre
 * guarda con `addMagicCardFromScryfall(impresion.scryfallId, quantity)`.
 */
export default function MagicPrintingsPanel({
  card,
  quantity,
  onSelect,
  onClose,
  busyScryfallId = null,
  saveError = null,
}: MagicPrintingsPanelProps) {
  const {
    items: printings,
    hasMore,
    loading,
    loadingMore,
    error,
    sentinelRef,
  } = useInfiniteScroll<MagicCardPrinting>({
    size: 175,
    errorMessage: 'No se pudieron cargar las impresiones.',
    fetchPage: (page) => getMagicCardPrintingsPage(card.scryfallId, page),
    deps: [card.scryfallId],
  })

  function handleClose() {
    if (busyScryfallId) return
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-md modal-sheet"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Impresiones de ${card.name}`}
        className="modal-paper w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-head relative flex items-start justify-between gap-4 px-6 pt-6 pb-4">
          <span className="accent-bar" aria-hidden="true" />
          <div className="min-w-0">
            <h3 className="font-display text-heading-sm mb-1">
              Impresiones de <span className="text-brand">{card.name}</span>
            </h3>
            <p className="text-body-sm text-graphite">
              Elige la edición que quieres guardar · se añadirán {quantity}{quantity === 1 ? ' copia' : ' copias'}
            </p>
          </div>
          <button
            type="button"
            className="btn-ghost !p-2 !px-2.5 shrink-0"
            onClick={handleClose}
            aria-label="Cerrar"
            disabled={Boolean(busyScryfallId)}
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {saveError && <ErrorBanner message={saveError} />}
          {error && <ErrorBanner message={error} />}

          {loading ? (
            <Spinner label="Cargando impresiones…" />
          ) : printings.length === 0 ? (
            <p className="text-body text-slate text-center" role="status">
              Esta carta no tiene impresiones.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {printings.map((printing) => {
                  const saving = busyScryfallId === printing.scryfallId
                  const badges = badgesFor(printing)
                  return (
                    <article
                      key={printing.scryfallId}
                      className="card !p-3 flex flex-col gap-3"
                    >
                      {printing.artCropUrl ? (
                        <img
                          src={printing.artCropUrl}
                          alt={`Arte de ${printing.name} (${printing.set} ${printing.collectorNumber})`}
                          loading="lazy"
                          className="w-full aspect-[5/7] object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full aspect-[5/7] bg-brand-soft rounded-lg flex items-center justify-center text-caption text-graphite">
                          Sin arte
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        <div className="flex items-baseline gap-2 min-w-0">
                          <span className="font-display text-caption uppercase tracking-wide text-brand shrink-0">
                            {printing.set}
                          </span>
                          <span className="text-caption text-graphite tabular-nums">
                            {printing.collectorNumber}
                          </span>
                        </div>
                        <p className="text-body-sm text-graphite leading-snug line-clamp-1" title={printing.setName}>
                          {printing.setName}
                        </p>

                        <div className="flex flex-wrap gap-1.5">
                          {badges.map((badge) => (
                            <span
                              key={badge}
                              className="text-caption px-1.5 py-0.5 rounded bg-accent-soft text-brand-ink"
                            >
                              {badge}
                            </span>
                          ))}
                          {rarityLabel(printing.rarity) && (
                            <span className="text-caption px-1.5 py-0.5 rounded bg-silver/70 text-graphite">
                              {rarityLabel(printing.rarity)}
                            </span>
                          )}
                          <span className="text-caption px-1.5 py-0.5 rounded bg-silver/70 text-graphite">
                            {langLabel(printing.lang)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-body-sm font-semibold text-ink tabular-nums">
                            {printing.priceUsd ? `$${printing.priceUsd}` : 'Sin precio'}
                          </span>
                          <button
                            type="button"
                            className="btn-primary !px-3 !py-1.5 !text-caption"
                            aria-label={`Elegir ${printing.name} (${printing.set} ${printing.collectorNumber})`}
                            onClick={() => onSelect(printing)}
                            disabled={busyScryfallId !== null}
                          >
                            {saving ? 'Guardando…' : 'Elegir'}
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>

              {loadingMore && <SkeletonInline count={6} />}
              {!hasMore && !loadingMore && (
                <p className="text-body-sm text-graphite text-center" role="status">
                  No hay más impresiones
                </p>
              )}
              <div ref={sentinelRef} className="h-px" aria-hidden="true" />
            </>
          )}
        </div>

        <footer className="flex justify-end px-6 py-4 border-t border-silver/60">
          <button type="button" className="btn-ghost" onClick={handleClose} disabled={Boolean(busyScryfallId)}>
            Cancelar
          </button>
        </footer>
      </div>
    </div>
  )
}