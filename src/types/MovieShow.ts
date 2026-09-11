import { MediaType } from './MovieType'
import { MovieShowStatus } from './MovieShowStatus'

export interface MovieShow {
  id: string
  externalId?: string
  title: string
  overview?: string
  releaseDate?: string
  posterUrl?: string
  backdropUrl?: string
  voteAverage?: number
  mediaType: MediaType
  status: MovieShowStatus
  userRating?: number
  comment?: string
  dateAdded?: string
  dateCompleted?: string
  externalSource?: string
}

export interface MovieShowFormData {
  externalId?: string
  title: string
  overview?: string
  releaseDate?: string
  posterUrl?: string
  backdropUrl?: string
  voteAverage?: number
  mediaType: MediaType
  status: MovieShowStatus
  userRating?: number
  comment?: string
  dateAdded?: string
  dateCompleted?: string
  externalSource?: string
}

export interface SearchMovieShowResult {
  externalId: string
  title: string
  overview?: string
  releaseDate?: string
  posterUrl?: string
  backdropUrl?: string
  voteAverage?: number
  mediaType?: MediaType
  externalSource?: string
}

export interface PageMovieShowResponse {
  content: MovieShow[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  empty: boolean
}

export interface ListMovieShowsParams {
  page?: number
  size?: number
  sort?: string
  name?: string
  status?: MovieShowStatus | ''
  mediaType?: MediaType | ''
}
