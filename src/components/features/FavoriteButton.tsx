'use client';

import { useState, useCallback } from 'react';
import { Flight } from '@/types/flight';
import { useFavorites } from '@/hooks/useLocalStorage';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  flight: Flight;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function FavoriteButton({ flight, className, size = 'md', showLabel = false }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isHydrated } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);

  const isLiked = isHydrated ? isFavorite(flight.id) : false;

  const handleToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const willBeLiked = !isLiked;
    
    if (willBeLiked) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }

    toggleFavorite({
      flightId: flight.id,
      airline: flight.airline.name,
      airlineCode: flight.airline.code,
      origin: flight.origin.code,
      originCity: flight.origin.city,
      destination: flight.destination.code,
      destinationCity: flight.destination.city,
      price: flight.price.amount,
      currency: flight.price.currency,
      duration: flight.duration,
      stops: flight.stops,
    });
  }, [isLiked, toggleFavorite, flight]);

  const sizeConfig = {
    sm: { icon: 'w-4 h-4', button: 'p-1.5 gap-1', text: 'text-xs' },
    md: { icon: 'w-5 h-5', button: 'p-2 gap-1.5', text: 'text-sm' },
    lg: { icon: 'w-6 h-6', button: 'p-2.5 gap-2', text: 'text-base' },
  };

  const config = sizeConfig[size];

  return (
    <button
      onClick={handleToggle}
      disabled={!isHydrated}
      className={cn(
        'relative rounded-lg transition-all duration-200 flex items-center',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
        config.button,
        isLiked 
          ? 'text-red-500 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50' 
          : 'text-neutral-400 hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800',
        !isHydrated && 'opacity-50 cursor-wait',
        className
      )}
      aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isLiked}
    >
      <Heart 
        className={cn(
          config.icon,
          'transition-all duration-200',
          isLiked && 'fill-current scale-110',
          isAnimating && 'animate-heart-beat'
        )} 
      />
      
      {showLabel && (
        <span className={cn(config.text, 'font-medium')}>
          {isLiked ? 'Saved' : 'Save'}
        </span>
      )}
      
      {/* Burst particles effect */}
      {isAnimating && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-red-400 rounded-full animate-particle"
              style={{
                '--angle': `${i * 45}deg`,
                '--delay': `${i * 0.03}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}
    </button>
  );
}
