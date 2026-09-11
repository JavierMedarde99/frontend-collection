import { MediaType } from '../types'
import { MovieShowStatus } from '../types'

export const MOVIE_SHOW_STATES: Record<MovieShowStatus, string> = {
  [MovieShowStatus.WATCHING]: 'Viendo',
  [MovieShowStatus.WATCHED]: 'Visto',
  [MovieShowStatus.PLAN_TO_WATCH]: 'Plan para ver',
}

export const MOVIE_SHOW_STATE_LABELS: Record<MovieShowStatus, string> = MOVIE_SHOW_STATES

export const MOVIE_SHOW_STATE_COLORS: Record<MovieShowStatus, string> = {
  [MovieShowStatus.WATCHING]: 'bg-action-blue text-white',
  [MovieShowStatus.WATCHED]: 'bg-green-600 text-white',
  [MovieShowStatus.PLAN_TO_WATCH]: 'bg-slate-100 text-slate-700',
}

export const MOVIE_SHOW_DOT_COLORS: Record<MovieShowStatus, string> = {
  [MovieShowStatus.WATCHING]: 'bg-white',
  [MovieShowStatus.WATCHED]: 'bg-white',
  [MovieShowStatus.PLAN_TO_WATCH]: 'bg-slate-500',
}

export const MEDIA_TYPES: Record<MediaType, string> = {
  [MediaType.MOVIE]: 'Película',
  [MediaType.TV]: 'Serie',
}

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = MEDIA_TYPES

export const MEDIA_TYPE_BADGE_COLORS: Record<MediaType, string> = {
  [MediaType.MOVIE]: 'bg-indigo-100 text-indigo-700',
  [MediaType.TV]: 'bg-purple-100 text-purple-700',
}
