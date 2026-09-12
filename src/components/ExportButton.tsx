import { useState } from 'react'
import { listBooks } from '../api/booksApi'
import { listGames } from '../api/gamesApi'
import { listMagicCards } from '../api/magicApi'
import { listDecks } from '../api/deckApi'
import { listBoardGames } from '../api/boardgamesApi'
import { listMovieShows } from '../api/movieshowsApi'

const PAGE_SIZE = 500

async function fetchAllPages<T>(fetchPage: (page: number) => Promise<{ content?: T[] | null; last?: boolean }>): Promise<T[]> {
  const items: T[] = []
  let page = 0
  for (let i = 0; i < 50; i++) {
    const data = await fetchPage(page)
    const content = data.content || []
    items.push(...content)
    if (data.last || content.length === 0) break
    page += 1
  }
  return items
}

export async function buildBackup(): Promise<Record<string, unknown>> {
  const [books, games, magicCards, boardGames, movieShows, decks] = await Promise.all([
    fetchAllPages((page) => listBooks({ page, size: PAGE_SIZE })),
    fetchAllPages((page) => listGames({ page, size: PAGE_SIZE })),
    fetchAllPages((page) => listMagicCards({ page, size: PAGE_SIZE })),
    fetchAllPages((page) => listBoardGames({ page, size: PAGE_SIZE })),
    fetchAllPages((page) => listMovieShows({ page, size: PAGE_SIZE })),
    listDecks(),
  ])
  return {
    exportedAt: new Date().toISOString(),
    books,
    games,
    magicCards,
    decks,
    boardGames,
    movieShows,
  }
}

export default function ExportButton({ onDone }: { onDone?: () => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleExport() {
    setBusy(true)
    setError(null)
    try {
      const backup = await buildBackup()
      const date = new Date().toISOString().slice(0, 10)
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `coleccion-${date}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      onDone?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo exportar la colección.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        className="btn-ghost !p-2"
        onClick={handleExport}
        disabled={busy}
        title="Exportar colección (JSON)"
        aria-label="Exportar colección en JSON"
      >
        <svg
          aria-hidden="true"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      </button>
      {error && (
        <span className="text-caption text-red-600" role="alert">
          {error}
        </span>
      )}
    </span>
  )
}
