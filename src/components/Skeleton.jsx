export function SkeletonBookCard() {
  return (
    <div className="card flex flex-col gap-5" aria-hidden="true">
      <div className="flex gap-5">
        <div className="skeleton w-28 h-36 shrink-0" />
        <div className="flex-1 flex flex-col gap-2.5 py-1">
          <div className="skeleton h-5 w-3/4" />
          <div className="skeleton h-3.5 w-1/2" />
          <div className="mt-2 flex gap-2">
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
      <div className="skeleton h-4 w-11/12" />
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-silver/60">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-8 w-16 rounded-full" />
      </div>
    </div>
  )
}

export default function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBookCard key={i} />
      ))}
    </div>
  )
}