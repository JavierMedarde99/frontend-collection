import { PLATFORM_LABELS, PLATFORM_BADGE_COLORS } from '../constants/games'
import { GamePlatform } from '../types'

interface GamePlatformBadgeProps {
  platform: GamePlatform
}

export default function GamePlatformBadge({ platform }: GamePlatformBadgeProps) {
  const color = PLATFORM_BADGE_COLORS[platform] || PLATFORM_BADGE_COLORS[GamePlatform.PC]
  const label = PLATFORM_LABELS[platform] || platform
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium ${color}`}>
      {label}
    </span>
  )
}
