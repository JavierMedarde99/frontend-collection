export type DeckStatus = 'DRAFT' | 'COMPLETE' | 'INVALID'

export interface DeckResponse {
  id: string
  name: string
  description?: string
  commander?: string
  commanderColors?: string[]
  cards?: DeckCardResponse[]
  createdAt?: string
  updatedAt?: string
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
}
