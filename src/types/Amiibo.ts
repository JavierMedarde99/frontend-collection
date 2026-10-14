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
