import type { ReactNode } from 'react'

interface TooltipProps {
  label: string
  children: ReactNode
  side?: 'top' | 'bottom'
}

export function Tooltip({ label, children, side = 'top' }: TooltipProps) {
  return (
    <span className="relative group/tooltip inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 whitespace-nowrap rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium px-3 py-1.5 shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-150 ${
          side === 'top'
            ? 'bottom-full mb-2'
            : 'top-full mt-2'
        }`}
      >
        {label}
      </span>
    </span>
  )
}
