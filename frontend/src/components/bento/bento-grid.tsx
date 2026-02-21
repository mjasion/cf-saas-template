import { cn } from '@/lib/utils'

interface BentoGridProps {
  children: React.ReactNode
  className?: string
  columns?: 3 | 4
}

export function BentoGrid({ children, className, columns = 4 }: BentoGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 gap-4 [grid-auto-flow:dense]',
        columns === 4 && 'lg:grid-cols-3 xl:grid-cols-4',
        columns === 3 && 'lg:grid-cols-3',
        className,
      )}
    >
      {children}
    </div>
  )
}
