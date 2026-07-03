import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StarRating({ rating, size = 'md', className }: StarRatingProps) {
  const sz = { sm: 'h-3 w-3', md: 'h-4 w-4', lg: 'h-5 w-5' }[size]

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(sz, s <= Math.round(rating)
            ? 'fill-blue-600 text-blue-600'
            : 'fill-blue-200 text-blue-200'
          )}
        />
      ))}
    </div>
  )
}
