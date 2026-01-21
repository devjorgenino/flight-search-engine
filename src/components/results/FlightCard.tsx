'use client';

import { useState, useCallback, useMemo } from 'react';
import { Flight } from '@/types/flight';
import { Card, Badge, Button } from '@/components/ui';
import { FlightStopsDetail } from './FlightStopsDetail';
import { FavoriteButton, ShareFlight, OfferCountdown } from '@/components/features';
import { formatDuration, formatTime, formatPrice, getStopsLabel } from '@/lib/utils';
import { Clock, Check, Scale, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlightStore } from '@/stores/useFlightStore';

interface FlightCardProps {
  flight: Flight;
  onSelect?: (flight: Flight) => void;
  showCountdown?: boolean;
  variant?: 'default' | 'compact' | 'favorite';
}

export function FlightCard({ flight, onSelect, showCountdown = false, variant = 'default' }: FlightCardProps) {
  const [isStopsExpanded, setIsStopsExpanded] = useState(false);
  
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
  const hoveredFlightId = useFlightStore((state) => state.hoveredFlightId);
  const selectedMapFlightId = useFlightStore((state) => state.selectedMapFlightId);
  const isInComparison = comparisonIds.includes(flight.id);
  const canAddToComparison = comparisonIds.length < 3;
  const isHovered = hoveredFlightId === flight.id;
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

  const handleMouseEnter = useCallback(() => {
    setHoveredFlightId(flight.id);
  }, [setHoveredFlightId, flight.id]);

  const handleMouseLeave = useCallback(() => {
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
        'group transition-all duration-200 overflow-hidden',
        'hover:shadow-lg hover:border-neutral-300 dark:hover:border-neutral-600',
        'focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2',
        isInComparison && 'border-emerald-500 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20',
        isSelectedForMap && !isInComparison && 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-950/30 shadow-lg ring-2 ring-blue-500/20',
        isHovered && !isInComparison && !isSelectedForMap && 'border-blue-300 dark:border-blue-600 bg-blue-50/20 dark:bg-blue-950/10',
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
            {/* Airline */}
            <div className="flex items-center gap-3 w-24 flex-shrink-0">
              <div 
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center shadow-sm"
                aria-hidden="true"
              >
                <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300">
                  {flight.airline.code}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 truncate max-w-[60px]">
                  {flight.airline.name}
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
                      : 'text-amber-600 dark:text-amber-400 hover:underline cursor-pointer'
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
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
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
