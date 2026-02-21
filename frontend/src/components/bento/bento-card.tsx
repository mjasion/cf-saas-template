import { cn } from '@/lib/utils'

interface BentoCardProps {
  children: React.ReactNode
  className?: string
  colSpan?: 1 | 2 | 'full'
  rowSpan?: 1 | 2
  interactive?: boolean
  glass?: boolean
  index?: number
  as?: 'section' | 'article' | 'div'
  'aria-label'?: string
}

export function BentoCard({
  children,
  className,
  colSpan = 1,
  rowSpan = 1,
  interactive = false,
  glass = false,
  index,
  as: Tag = 'section',
  'aria-label': ariaLabel,
}: BentoCardProps) {
  return (
    <Tag
      aria-label={ariaLabel}
      className={cn(
        'rounded-2xl border p-6 shadow-sm',
        glass
          ? 'backdrop-blur-md bg-[var(--glass-background)] border-[var(--glass-border)]'
          : 'border-border bg-card',
        colSpan === 2 && 'sm:col-span-2',
        colSpan === 'full' && 'col-span-full',
        rowSpan === 2 && 'row-span-2',
        interactive && 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
        index !== undefined && 'bento-animate-in',
        className,
      )}
      style={index !== undefined ? { animationDelay: `${index * 75}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
