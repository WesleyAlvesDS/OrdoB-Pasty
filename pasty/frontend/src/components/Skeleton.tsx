interface SkeletonProps {
  className?: string
}

function SkeletonBase({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800 ${className}`}
      aria-hidden="true"
    />
  )
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Carregando conteúdo">
      <span className="sr-only">Carregando...</span>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Carregando itens">
      <span className="sr-only">Carregando...</span>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50"
        >
          <SkeletonBase className="w-8 h-8 rounded-lg" />
          <div className="flex-1 space-y-2">
            <SkeletonBase className="h-4 w-3/4" />
            <SkeletonBase className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function HistorySkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Carregando histórico">
      <span className="sr-only">Carregando histórico...</span>
      <div className="flex gap-2">
        <SkeletonBase className="h-10 flex-1" />
        <SkeletonBase className="h-10 w-20" />
        <SkeletonBase className="h-10 w-20" />
        <SkeletonBase className="h-10 w-20" />
      </div>
      <CardSkeleton count={5} />
    </div>
  )
}

export function PageHeroSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 sm:py-28" role="status" aria-label="Carregando página">
      <span className="sr-only">Carregando...</span>
      <div className="text-center max-w-2xl mx-auto space-y-6">
        <SkeletonBase className="h-6 w-40 mx-auto rounded-full" />
        <SkeletonBase className="h-14 w-full max-w-lg mx-auto" />
        <SkeletonBase className="h-12 w-3/4 mx-auto" />
        <SkeletonBase className="h-6 w-full max-w-md mx-auto" />
        <div className="flex justify-center gap-4 pt-4">
          <SkeletonBase className="h-12 w-40 rounded-xl" />
          <SkeletonBase className="h-12 w-40 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="status" aria-label="Carregando estatísticas">
      <span className="sr-only">Carregando...</span>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
        >
          <SkeletonBase className="h-8 w-8 mb-3" />
          <SkeletonBase className="h-6 w-20 mb-2" />
          <SkeletonBase className="h-4 w-32" />
        </div>
      ))}
    </div>
  )
}
