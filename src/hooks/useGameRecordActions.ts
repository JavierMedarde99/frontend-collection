import { useState } from 'react'
import { updateGame } from '../api/gamesApi'
import { GameStatus } from '../types'
import type { Game, GameFormData } from '../types'

function gameToPayload(game: Game, patch: Partial<GameFormData>): GameFormData {
  return {
    title: game.title,
    platform: game.platform,
    status: game.status,
    thumbnailUrl: game.thumbnailUrl,
    userRating: game.userRating,
    comment: game.comment,
    dateAdded: game.dateAdded,
    dateCompleted: game.dateCompleted,
    externalSource: game.externalSource,
    externalId: game.externalId,
    obtainPlatinum: game.obtainPlatinum,
    steamAppId: game.steamAppId,
    genres: game.genres ?? [],
    acquisitionDate: game.acquisitionDate,
    acquisitionPrice: game.acquisitionPrice,
    ...patch,
  }
}

export interface UseGameRecordActionsResult {
  record: Game
  saving: boolean
  actionError: string | null
  openPlaying: boolean
  openAcquiring: boolean
  openCompleting: boolean
  setOpenPlaying: (v: boolean) => void
  setOpenAcquiring: (v: boolean) => void
  setOpenCompleting: (v: boolean) => void
  onSavePlaying: (date: string) => Promise<void>
  onSaveAcquiring: (acquisitionDate: string, acquisitionPrice: number) => Promise<void>
  onSaveComplete: (date: string, rating: number, comment: string) => Promise<void>
}

export default function useGameRecordActions(game: Game): UseGameRecordActionsResult {
  const [override, setOverride] = useState<Partial<Game>>({})
  const [openPlaying, setOpenPlaying] = useState(false)
  const [openAcquiring, setOpenAcquiring] = useState(false)
  const [openCompleting, setOpenCompleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const record = { ...game, ...override }

  async function applyStatus(patch: Partial<GameFormData>) {
    setActionError(null)
    setSaving(true)
    try {
      const updated = await updateGame(game.id, gameToPayload(game, patch))
      setOverride((o) => ({
        ...o,
        status: updated.status,
        dateAdded: updated.dateAdded,
        dateCompleted: updated.dateCompleted,
        acquisitionDate: updated.acquisitionDate,
        acquisitionPrice: updated.acquisitionPrice,
        userRating: updated.userRating,
        comment: updated.comment,
      }))
      setOpenPlaying(false)
      setOpenCompleting(false)
      setOpenAcquiring(false)
    } catch {
      setActionError('No se pudo actualizar el videojuego.')
    } finally {
      setSaving(false)
    }
  }

  async function onSavePlaying(date: string) {
    return applyStatus({ status: GameStatus.PLAYING, dateAdded: date })
  }

  async function onSaveAcquiring(acquisitionDate: string, acquisitionPrice: number) {
    return applyStatus({
      status: GameStatus.OWNED,
      acquisitionDate,
      acquisitionPrice,
      dateAdded: undefined,
      dateCompleted: undefined,
    })
  }

  async function onSaveComplete(date: string, rating: number, comment: string) {
    return applyStatus({
      status: GameStatus.COMPLETED,
      dateCompleted: date,
      userRating: rating > 0 ? rating : undefined,
      comment: comment.trim() || undefined,
    })
  }

  return {
    record,
    saving,
    actionError,
    openPlaying,
    openAcquiring,
    openCompleting,
    setOpenPlaying,
    setOpenAcquiring,
    setOpenCompleting,
    onSavePlaying,
    onSaveAcquiring,
    onSaveComplete,
  }
}
