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
  /** Fecha de obtención de la pieza. No se rellena en WISHLIST. */
  acquisitionDate?: string
  /** Precio pagado por la pieza. No se rellena en WISHLIST. */
  acquisitionPrice?: number
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
  /** No se envía en WISHLIST: solo tiene sentido cuando la pieza está en posesión. */
  acquisitionDate?: string
  acquisitionPrice?: number | ''
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
