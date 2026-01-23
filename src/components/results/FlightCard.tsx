'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Flight } from '@/types/flight';
import { Card, Badge, Button } from '@/components/ui';
import { FlightStopsDetail } from './FlightStopsDetail';
import { FavoriteButton, ShareFlight, OfferCountdown } from '@/components/features';
import { formatDuration, formatTime, formatPrice, getStopsLabel } from '@/lib/utils';
import { Clock, Check, Scale, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlightStore } from '@/stores/useFlightStore';

// Airline logo component with fallback to initials - Improved UI/UX/Accessibility
function AirlineLogo({ airline, size = 40 }: { airline: { code: string; name: string; logo?: string }; size?: number }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Reset states if logo URL changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [airline.logo]);
  
  const showFallback = !airline.logo || hasError;
  
  // Generate a consistent color based on airline code for fallback
  const getAirlineColor = (code: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-indigo-500 to-indigo-600', 
      'from-violet-500 to-violet-600',
      'from-sky-500 to-sky-600',
      'from-teal-500 to-teal-600',
      'from-cyan-500 to-cyan-600',
    ];
    const index = code.charCodeAt(0) % colors.length;
    return colors[index];
  };
  
  if (showFallback) {
    return (
      <div 
        className={cn(
          "rounded-xl flex items-center justify-center shadow-sm",
          "bg-gradient-to-br",
          getAirlineColor(airline.code),
          "ring-1 ring-black/5 dark:ring-white/10"
        )}
        style={{ width: size, height: size }}
        role="img"
        aria-label={`${airline.name} logo`}
      >
        <span 
          className="font-bold text-white tracking-tight"
          style={{ fontSize: size * 0.3 }}
        >
          {airline.code.slice(0, 2)}
        </span>
      </div>
    );
  }
  
  return (
    <div 
      className={cn(
        "relative rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center",
        "ring-1 ring-neutral-200 dark:ring-neutral-700",
        "transition-all duration-200"
      )}
      style={{ width: size, height: size }}
    >
      {isLoading && (
        <div 
          className="absolute inset-0 bg-neutral-100 dark:bg-neutral-800 animate-pulse"
          aria-hidden="true"
        />
      )}
      <Image
        src={airline.logo as string}
        alt={`${airline.name} logo`}
        width={size - 6}
        height={size - 6}
        className={cn(
          "object-contain transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        unoptimized // External URLs from Google Flights
      />
    </div>
  );
}

interface FlightCardProps {
  flight: Flight;
  onSelect?: (flight: Flight) => void;
  showCountdown?: boolean;
  variant?: 'default' | 'compact' | 'favorite';
}

export function FlightCard({ flight, onSelect, showCountdown = false, variant = 'default' }: FlightCardProps) {
  const [isStopsExpanded, setIsStopsExpanded] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);
  
  const departureTime = formatTime(flight.departureTime);
  const arrivalTime = formatTime(flight.arrivalTime);
  const duration = formatDuration(flight.duration);
  const price = formatPrice(flight.price.amount, flight.price.currency);
  const stopsLabel = getStopsLabel(flight.stops);
  
  const toggleComparison = useFlightStore((state) => state.toggleComparison);
  const comparisonIds = useFlightStore((state) => state.comparisonIds);
  const selectFlight = useFlightStore((state) => state.selectFlight);
  const setHoveredFlightId = useFlightStore((state) => state.setHoveredFlightId);
  const setSelectedMapFlightId = useFlightStore((state) => state.setSelectedMapFlightId);
  const selectedMapFlightId = useFlightStore((state) => state.selectedMapFlightId);
  const isInComparison = comparisonIds.includes(flight.id);
  const canAddToComparison = comparisonIds.length < 3;
  const isSelectedForMap = selectedMapFlightId === flight.id;

  // Determine if this is a "hot deal" (low price, few seats)
  const isHotDeal = useMemo(() => {
    return flight.price.amount < 60 || (flight.seatsLeft && flight.seatsLeft <= 3);
  }, [flight.price.amount, flight.seatsLeft]);

  const handleCompareClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleComparison(flight.id);
  }, [toggleComparison, flight.id]);

  const handleSelectClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(flight);
    } else {
      selectFlight(flight);
    }
  }, [onSelect, flight, selectFlight]);

  const handleStopsToggle = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsStopsExpanded(prev => !prev);
  }, []);

  // Debounced hover to prevent rapid state updates
  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredFlightId(flight.id);
    }, 100); // 100ms debounce
  }, [setHoveredFlightId, flight.id]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredFlightId(null);
  }, [setHoveredFlightId]);

  const handleCardClick = useCallback(() => {
    if (selectedMapFlightId === flight.id) {
      setSelectedMapFlightId(null);
    } else {
      setSelectedMapFlightId(flight.id);
    }
  }, [selectedMapFlightId, flight.id, setSelectedMapFlightId]);

  const isCompact = variant === 'compact';

  return (
    <Card
      variant="bordered"
      padding="none"
      className={cn(
        'group overflow-hidden',
        // NO hover effects that cause layout shift - only subtle border color change
        'transition-colors duration-150',
        'hover:border-neutral-300 dark:hover:border-neutral-600',
        'focus-within:outline focus-within:outline-2 focus-within:outline-emerald-500 focus-within:outline-offset-2',
        isInComparison && 'border-emerald-500 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20',
        isSelectedForMap && !isInComparison && 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/30',
        !isCompact && 'cursor-pointer',
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={!isCompact ? handleCardClick : undefined}
      role={!isCompact ? "button" : undefined}
      tabIndex={!isCompact ? 0 : undefined}
      onKeyDown={!isCompact ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      } : undefined}
      aria-pressed={!isCompact ? isSelectedForMap : undefined}
      aria-label={!isCompact ? `${isSelectedForMap ? 'Deselect' : 'Select'} ${flight.airline.name} flight to view on map` : undefined}
    >
      {/* Hot Deal Banner */}
      {(showCountdown || isHotDeal) && !isCompact && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2">
          <div className="flex items-center justify-between">
            <OfferCountdown compact durationMinutes={15} />
            <Badge variant="warning" size="sm" className="bg-white/20 text-white border-0">
              Hot Deal
            </Badge>
          </div>
        </div>
      )}

      <div className={cn("p-4", isCompact ? "p-3" : "md:p-5")}>
        <div className="flex flex-col gap-4">
          {/* Main Row: Airline + Flight Info + Price */}
          <div className="flex items-center gap-4">
            {/* Airline Logo & Name */}
            <div className="flex items-center gap-2.5 min-w-[100px] md:min-w-[120px] flex-shrink-0">
              {/* Airline logo with fallback to initials */}
              <AirlineLogo airline={flight.airline} size={40} />
              {/* Airline name - visible on all screens */}
              <div className="flex-1 min-w-0">
                <p 
                  className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate"
                  title={flight.airline.name}
                >
                  {flight.airline.name}
                </p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 md:hidden">
                  {flight.airline.code}
                </p>
              </div>
            </div>

            {/* Flight Times */}
            <div className="flex-1 flex items-center gap-2 md:gap-4">
              {/* Departure */}
              <div className="text-center min-w-[50px]">
                <p className="text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                  {departureTime}
                </p>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {flight.origin.code}
                </p>
              </div>

              {/* Duration & Stops */}
              <div className="flex-1 flex flex-col items-center px-1 md:px-4">
                <div className="flex items-center gap-1 text-[10px] md:text-xs text-neutral-400 dark:text-neutral-500 mb-1">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  <span>{duration}</span>
                </div>
                
                {/* Visual line */}
                <div className="w-full relative h-2" aria-hidden="true">
                  <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-neutral-200 dark:bg-neutral-700 rounded-full" />
                  {/* Stops dots */}
                  {flight.stops > 0 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-1">
                      {Array.from({ length: Math.min(flight.stops, 2) }).map((_, idx) => (
                        <div
                          key={idx}
                          className="w-1.5 h-1.5 bg-amber-500 rounded-full"
                        />
                      ))}
                    </div>
                  )}
                  {/* Arrow */}
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 -translate-x-1">
                    <ChevronRight className="w-3 h-3 text-neutral-300 dark:text-neutral-600" />
                  </div>
                </div>
                
                <button
                  onClick={flight.stops > 0 ? (e) => { e.stopPropagation(); handleStopsToggle(); } : undefined}
                  className={cn(
                    'text-[10px] md:text-xs mt-1 font-medium',
                    flight.stops === 0 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-amber-600 dark:text-amber-500 hover:underline cursor-pointer'
                  )}
                  disabled={flight.stops === 0}
                  aria-expanded={flight.stops > 0 ? isStopsExpanded : undefined}
                >
                  {stopsLabel}
                </button>
              </div>

              {/* Arrival */}
              <div className="text-center min-w-[50px]">
                <p className="text-lg md:text-xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                  {arrivalTime}
                </p>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  {flight.destination.code}
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="text-right w-20 md:w-24 flex-shrink-0">
              <p className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {price}
              </p>
              {flight.seatsLeft && flight.seatsLeft <= 5 && (
                <p className="text-[10px] text-amber-600 dark:text-amber-500 font-medium">
                  {flight.seatsLeft} seats left
                </p>
              )}
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
            {/* Left: Quick actions */}
            <div className="flex items-center gap-1">
              <FavoriteButton flight={flight} size="sm" />
              <ShareFlight flight={flight} />
              <button
                onClick={handleCompareClick}
                disabled={!isInComparison && !canAddToComparison}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                  isInComparison
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700',
                  !isInComparison && !canAddToComparison && 'opacity-50 cursor-not-allowed'
                )}
                aria-label={isInComparison ? 'Remove from comparison' : 'Add to comparison'}
                aria-pressed={isInComparison}
              >
                {isInComparison ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Scale className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{isInComparison ? 'Comparing' : 'Compare'}</span>
              </button>
            </div>

            {/* Right: Select button */}
            <Button 
              size="sm"
              onClick={handleSelectClick}
              className="gap-1.5"
              aria-label={`Select ${flight.airline.name} flight for ${price}`}
            >
              <span>Select</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expandable Stops Detail */}
      {flight.stops > 0 && flight.segments.length > 1 && (
        <FlightStopsDetail
          segments={flight.segments}
          isExpanded={isStopsExpanded}
          onToggle={handleStopsToggle}
          stops={flight.stops}
        />
      )}
      
      {/* Screen reader description */}
      <span className="sr-only">
        {flight.airline.name} flight from {flight.origin.city} to {flight.destination.city}, 
        departing at {departureTime}, arriving at {arrivalTime}, 
        {stopsLabel}, {price}
      </span>
    </Card>
  );
}
