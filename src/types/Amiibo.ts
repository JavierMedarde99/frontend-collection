import type { UserOwned } from './Api'

export enum AmiiboStatus {
  OWNED = 'OWNED',
  WISHLIST = 'WISHLIST',
}

export enum AmiiboType {
  CARD = 'CARD',
  FIGURE = 'FIGURE',
  BAND = 'BAND',
  YARN = 'YARN',
  BLOCK = 'BLOCK',
}

export interface AmiiboReleaseDates {
  au?: string
  eu?: string
  jp?: string
  na?: string
}

export interface Amiibo {
  id: string
  externalId: string
  name: string
  character?: string
  amiiboSeries?: string
  gameSeries?: string
  amiiboType?: AmiiboType | null
  releaseDates?: AmiiboReleaseDates
  imageUrl?: string
  compatibleGames?: string[]
  status: AmiiboStatus
  notes?: string
  dateAdded?: string
  /** Fecha de obtención del Amiibo. No se rellena en WISHLIST. */
  acquisitionDate?: string
  /** Precio pagado por el Amiibo. No se rellena en WISHLIST. */
  acquisitionPrice?: number
  userOwned?: UserOwned | null
}

export interface AmiiboFormData {
  externalId: string
  name: string
  character?: string
  amiiboSeries?: string
  gameSeries?: string
  amiiboType?: AmiiboType | null
  releaseDates?: AmiiboReleaseDates
  imageUrl?: string
  compatibleGames?: string[]
  status: AmiiboStatus
  notes?: string
  dateAdded?: string
  /** No se envía en WISHLIST: solo tiene sentido cuando el Amiibo está en posesión. */
  acquisitionDate?: string
  acquisitionPrice?: number | ''
  externalSource?: string
}

export interface AmiiboSearchResult {
  externalId: string
  name: string
  character?: string
  amiiboSeries?: string
  gameSeries?: string
  amiiboType?: AmiiboType | null
  releaseDates?: AmiiboReleaseDates
  imageUrl?: string
  compatibleGames?: string[]
  externalSource?: string
}

export interface PageAmiiboSearchResult {
  content: AmiiboSearchResult[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  empty: boolean
}

export interface PageAmiiboResponse {
  content: Amiibo[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  empty: boolean
}

export interface ListAmiibosParams {
  page?: number
  size?: number
  sort?: string
  name?: string
  status?: AmiiboStatus | ''
  owner?: 'mine' | 'other' | ''
}
