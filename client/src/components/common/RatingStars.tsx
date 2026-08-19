import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: number;
  showScore?: boolean;
  reviewCount?: number;
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  max = 5,
  size = 14,
  showScore = false,
  reviewCount,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex items-center text-amber-400">
        {Array.from({ length: max }).map((_, idx) => {
          const fillPercentage = Math.max(0, Math.min(1, rating - idx));
          return (
            <div key={idx} className="relative inline-block">
              <Star size={size} className="text-gray-200 fill-gray-200" />
              {fillPercentage > 0 && (
                <div
                  className="absolute top-0 left-0 overflow-hidden text-amber-400"
                  style={{ width: `${fillPercentage * 100}%` }}
                >
                  <Star size={size} className="fill-current" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showScore && (
        <span className="text-xs font-semibold text-charcoal-800 ml-0.5">
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="text-xs text-gray-500 font-normal">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
