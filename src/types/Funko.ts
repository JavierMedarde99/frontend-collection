import type { UserOwned } from './Api'

export enum FunkoStatus {
  OWNED = 'OWNED',
  WISHLIST = 'WISHLIST',
}

export interface Funko {
  id: string
  externalId: string
  name: string
  series?: string
  number?: string
  category?: string
  exclusive?: string
  vaulted?: boolean
  releaseYear?: number
  franchise?: string
  popType?: string
  rarityScore?: number
  imageUrl?: string
  status: FunkoStatus
  notes?: string
  dateAdded?: string
  userOwned?: UserOwned | null
}

export interface FunkoFormData {
  externalId: string
  name: string
  series?: string
  number?: string
  category?: string
  exclusive?: string
  vaulted?: boolean
  releaseYear?: number
  franchise?: string
  popType?: string
  rarityScore?: number
  imageUrl?: string
  status: FunkoStatus
  notes?: string
  dateAdded?: string
  externalSource?: string
}

export interface FunkoSearchResult {
  externalId: string
  name: string
  series?: string
  number?: string
  category?: string
  exclusive?: string
  vaulted?: boolean
  releaseYear?: number
  franchise?: string
  popType?: string
  rarityScore?: number
  imageUrl?: string
  externalSource?: string
}

export interface PageFunkoSearchResult {
  content: FunkoSearchResult[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  empty: boolean
}

export interface PageFunkoResponse {
  content: Funko[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  empty: boolean
}

export interface ListFunkosParams {
  page?: number
  size?: number
  sort?: string
  name?: string
  status?: FunkoStatus | ''
  owner?: 'mine' | 'other' | ''
}

export interface FunkoCategory {
  name: string
  count: number
}
