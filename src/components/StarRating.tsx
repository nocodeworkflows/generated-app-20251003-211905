import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
interface StarRatingProps {
  rating: number;
  totalStars?: number;
  size?: number;
  className?: string;
  onRate?: (rating: number) => void;
  readOnly?: boolean;
}
export function StarRating({
  rating,
  totalStars = 5,
  size = 20,
  className,
  onRate,
  readOnly = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const handleMouseEnter = (index: number) => {
    if (readOnly) return;
    setHoverRating(index);
  };
  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };
  const handleClick = (index: number) => {
    if (readOnly || !onRate) return;
    onRate(index);
  };
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[...Array(totalStars)].map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= (hoverRating || rating);
        return (
          <Star
            key={i}
            size={size}
            className={cn(
              "transition-colors duration-200",
              isFilled ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600",
              !readOnly && "cursor-pointer hover:scale-110"
            )}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starValue)}
          />
        );
      })}
    </div>
  );
}