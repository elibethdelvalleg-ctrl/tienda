import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingDisplayProps {
  rating: number;
  maxStars?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showValue?: boolean;
  count?: number;
  className?: string;
}

export const StarRatingDisplay: React.FC<StarRatingDisplayProps> = ({
  rating,
  maxStars = 5,
  size = 'sm',
  showValue = false,
  count,
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const starSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5" aria-label={`Calificación: ${rating} de ${maxStars}`}>
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.round(rating);
          return (
            <Star
              key={index}
              className={`${starSize} transition-colors ${
                isFilled
                  ? 'fill-[#D4B24C] text-[#D4B24C]'
                  : 'text-stone-300 dark:text-stone-700'
              }`}
            />
          );
        })}
      </div>

      {showValue && (
        <span className="font-mono text-xs font-bold text-[#8B6F38] dark:text-[#D4B24C]">
          {rating.toFixed(1)}
        </span>
      )}

      {count !== undefined && (
        <span className="text-[11px] text-stone-400 font-medium">
          ({count})
        </span>
      )}
    </div>
  );
};

interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
  disabled?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Mala experiencia',
  2: 'Regular',
  3: 'Buena calidad',
  4: 'Muy buena, me gustó',
  5: '¡Excelente, me encantó!',
};

export const StarRatingInput: React.FC<StarRatingInputProps> = ({
  value,
  onChange,
  maxStars = 5,
  size = 'md',
  showLabel = true,
  className = '',
  disabled = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const starSize = sizeMap[size];
  const activeRating = hoverRating || value;

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 ${className}`}>
      <div 
        className="flex items-center gap-1 bg-white dark:bg-[#12100E] px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs w-fit"
        onMouseLeave={() => !disabled && setHoverRating(0)}
      >
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isHighlighted = starValue <= activeRating;

          return (
            <button
              key={starValue}
              type="button"
              disabled={disabled}
              onClick={() => onChange(starValue)}
              onMouseEnter={() => !disabled && setHoverRating(starValue)}
              className="p-1 text-stone-300 hover:scale-115 active:scale-95 transition-all cursor-pointer disabled:cursor-not-allowed"
              aria-label={`Calificar con ${starValue} de ${maxStars} estrellas`}
            >
              <Star
                className={`${starSize} transition-colors ${
                  isHighlighted
                    ? 'fill-[#D4B24C] text-[#D4B24C] drop-shadow-xs'
                    : 'text-stone-300 dark:text-stone-700'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && (
        <span className="text-xs font-bold text-[#8B6F38] dark:text-[#D4B24C] pl-1 animate-in fade-in duration-150">
          {RATING_LABELS[activeRating] || 'Selecciona una puntuación'}
        </span>
      )}
    </div>
  );
};
