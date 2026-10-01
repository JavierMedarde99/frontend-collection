import { platformBadgeClass, platformLabel } from '../constants/games'

interface GamePlatformBadgeProps {
  platform: string
}

export default function GamePlatformBadge({ platform }: GamePlatformBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium ${platformBadgeClass(platform)}`}>
      {platformLabel(platform)}
    </span>
  )
}
