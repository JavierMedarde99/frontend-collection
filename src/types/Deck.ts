import type { UserOwned } from './Api'

export type DeckStatus = 'DRAFT' | 'COMPLETE' | 'INVALID'

export interface DeckResponse {
  id: string
  name: string
  description?: string
  commander?: string
  commanderColors?: string[]
  commanderInCollection?: boolean
  commanderIsProxy?: boolean
  cards?: DeckCardResponse[]
  createdAt?: string
  updatedAt?: string
  userOwned?: UserOwned | null
}

export interface DeckRequest {
  name: string
  description?: string
  commander?: string
  commanderColors?: string[]
}

export interface DeckCardResponse {
  cardName: string
  quantity: number
  inCollection: boolean
  isProxy: boolean
  manaCost?: string
  typeLine?: string
  colorIdentity?: string[]
  imageUrl?: string
  scryfallId?: string
}

export interface DeckCardRequest {
  scryfallId: string
  quantity: number
}

export interface DeckStatusResponse {
  status: DeckStatus
  message?: string | null
}

export interface PageDeckResponse {
  content: DeckResponse[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  empty: boolean
}

export interface ListDecksParams {
  page?: number
  size?: number
  sort?: string
  name?: string
  owner?: 'mine' | 'other' | ''
  viewerId?: string
}

export type DeckImportStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'

export interface DeckImportAcceptedResponse {
  jobId: string
  status: string
  statusUrl: string
}

export interface DeckImportProgressResponse {
  total: number
  processed: number
  resolved: number
  sideboardIgnored: number
}

export interface DeckImportCandidateResponse {
  scryfallId: string
  name: string
  manaCost?: string
  type?: string
  rarity?: string
  setCode?: string
  setName?: string
  imageUrl?: string
  priceUsd?: string
  colorIdentity?: string[]
}

export type DeckImportUnresolvedReason = 'NOT_FOUND' | 'AMBIGUOUS' | 'UPSTREAM_ERROR'

export interface DeckImportUnresolvedResponse {
  line: number
  raw: string
  quantity: number
  name: string
  reason: DeckImportUnresolvedReason
  candidates: DeckImportCandidateResponse[]
}

export interface DeckImportValidationResponse {
  status: DeckStatus
  reasons: string[]
}

export interface DeckImportJobResponse {
  jobId: string
  status: DeckImportStatus
  phase: string
  deck: DeckResponse | null
  commander: string | null
  commanderColors: string[]
  unresolved: DeckImportUnresolvedResponse[]
  validation: DeckImportValidationResponse | null
  error: string | null
  progress: DeckImportProgressResponse
  createdAt: string
  updatedAt: string
  completedAt: string | null
}
