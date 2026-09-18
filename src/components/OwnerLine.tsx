import { Link } from 'react-router-dom'
import type { UserOwned } from '../types'

interface OwnerLineProps {
  owner?: UserOwned | null
  className?: string
}

/**
 * "Colección de X" bajo el título. Si hay username enlaza al
 * perfil público; si no, texto plano (el backend aún no lo envía).
 */
export default function OwnerLine({ owner, className = '' }: OwnerLineProps) {
  if (!owner?.ownerName) return null
  return (
    <p className={`text-caption text-graphite ${className}`}>
      Colección de{' '}
      {owner.username ? (
        <Link to={`/perfil/${owner.username}`} className="font-semibold text-brand hover:underline">
          {owner.ownerName}
        </Link>
      ) : (
        <span className="font-semibold">{owner.ownerName}</span>
      )}
    </p>
  )
}
