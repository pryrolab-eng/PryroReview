import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StarRating({ rating, size = 'md', className }: StarRatingProps) {
  const sizeClass = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-6 w-6',
  }[size];

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            star <= Math.round(rating)
              ? 'fill-orange-500 text-orange-500'
              : 'fill-zinc-100 text-zinc-200'
          )}
        />
      ))}
    </div>
  );
}
