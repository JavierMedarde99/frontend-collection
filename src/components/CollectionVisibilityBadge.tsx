interface CollectionVisibilityBadgeProps {
  visibility: 'PUBLIC' | 'PRIVATE'
}

/** Badge verde "Pública" o rojo "Privada". */
export default function CollectionVisibilityBadge({ visibility }: CollectionVisibilityBadgeProps) {
  const isPublic = visibility === 'PUBLIC'
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-semibold ${
        isPublic ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
      }`}
      aria-label={isPublic ? 'Colección pública' : 'Colección privada'}
    >
      {isPublic ? 'Pública' : 'Privada'}
    </span>
  )
}
