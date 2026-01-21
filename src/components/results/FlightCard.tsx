'use client';

import { useState, useCallback } from 'react';
import { Flight } from '@/types/flight';
import { Card, Badge, Button } from '@/components/ui';
import { FlightStopsDetail } from './FlightStopsDetail';
import { formatDuration, formatTime, formatPrice, getStopsLabel } from '@/lib/utils';
import { Plane, Clock, Check, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlightStore } from '@/stores/useFlightStore';

interface FlightCardProps {
  flight: Flight;
  onSelect?: (flight: Flight) => void;
}

export function FlightCard({ flight, onSelect }: FlightCardProps) {
  const [isStopsExpanded, setIsStopsExpanded] = useState(false);
  
  const departureTime = formatTime(flight.departureTime);
  const arrivalTime = formatTime(flight.arrivalTime);
  const duration = formatDuration(flight.duration);
  const price = formatPrice(flight.price.amount, flight.price.currency);
  const stopsLabel = getStopsLabel(flight.stops);
  
  const toggleComparison = useFlightStore((state) => state.toggleComparison);
  const comparisonIds = useFlightStore((state) => state.comparisonIds);
  const selectFlight = useFlightStore((state) => state.selectFlight);
  const isInComparison = comparisonIds.includes(flight.id);
  const canAddToComparison = comparisonIds.length < 3;

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

  const handleStopsToggle = useCallback(() => {
    setIsStopsExpanded(prev => !prev);
  }, []);

  return (
    <Card
      variant="bordered"
      padding="none"
      className={cn(
        'group transition-all duration-150',
        'hover:border-neutral-300 dark:hover:border-neutral-600',
        'focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2',
        isInComparison && 'border-emerald-500 dark:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
      )}
    >
      <div className="p-4 md:p-5">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Airline Logo & Name */}
          <div className="flex items-center gap-3 md:w-28 flex-shrink-0">
            <div 
              className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                {flight.airline.code}
              </span>
            </div>
            <div className="md:hidden">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {flight.airline.name}
              </p>
            </div>
          </div>

          {/* Flight Times */}
          <div className="flex-1 flex items-center gap-4">
            {/* Departure */}
            <div className="text-center md:text-left min-w-[60px]">
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {departureTime}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {flight.origin.code}
              </p>
            </div>

            {/* Duration & Stops */}
            <div className="flex-1 flex flex-col items-center px-2">
              <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500 mb-1.5">
                <Clock className="w-3 h-3" aria-hidden="true" />
                <span>{duration}</span>
              </div>
              <div className="w-full relative" aria-hidden="true">
                <div className="h-px bg-neutral-200 dark:bg-neutral-700" />
                {/* Stop indicators on the line */}
                {flight.stops > 0 && flight.segments.length > 1 && (
                  <div className="absolute top-1/2 left-0 right-0 flex justify-evenly -translate-y-1/2">
                    {flight.segments.slice(0, -1).map((segment, idx) => (
                      <div
                        key={idx}
                        className="w-2 h-2 bg-amber-500 rounded-full border border-white dark:border-neutral-900"
                        title={`Stop at ${segment.arrival.airport.code}`}
                      />
                    ))}
                  </div>
                )}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className={cn(
                    'flex items-center justify-center w-5 h-5 rounded-full',
                    flight.stops === 0 
                      ? 'bg-emerald-100 dark:bg-emerald-900/50' 
                      : 'bg-amber-100 dark:bg-amber-900/50'
                  )}>
                    <Plane className={cn(
                      'w-2.5 h-2.5 rotate-90',
                      flight.stops === 0 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-amber-600 dark:text-amber-400'
                    )} />
                  </div>
                </div>
              </div>
              <p className={cn(
                'text-xs mt-1.5 font-medium',
                flight.stops === 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-amber-600 dark:text-amber-400 cursor-pointer hover:underline'
              )}
              onClick={flight.stops > 0 ? handleStopsToggle : undefined}
              role={flight.stops > 0 ? 'button' : undefined}
              tabIndex={flight.stops > 0 ? 0 : undefined}
              onKeyDown={flight.stops > 0 ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStopsToggle();
                }
              } : undefined}
              aria-expanded={flight.stops > 0 ? isStopsExpanded : undefined}
              >
                {stopsLabel}
                {flight.stops > 0 && (
                  <span className="ml-1 text-neutral-400">
                    ({flight.segments.slice(0, -1).map(s => s.arrival.airport.code).join(', ')})
                  </span>
                )}
              </p>
            </div>

            {/* Arrival */}
            <div className="text-center md:text-right min-w-[60px]">
              <p className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {arrivalTime}
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {flight.destination.code}
              </p>
            </div>
          </div>

          {/* Price & Actions */}
          <div className="flex items-center justify-between md:flex-col md:items-end gap-3 md:w-32 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100 dark:border-neutral-800">
            <div className="text-right">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
                {price}
              </p>
              {flight.seatsLeft && flight.seatsLeft <= 5 && (
                <Badge variant="warning" size="sm" className="mt-1">
                  {flight.seatsLeft} left
                </Badge>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Compare Button */}
              <button
                onClick={handleCompareClick}
                disabled={!isInComparison && !canAddToComparison}
                className={cn(
                  'p-2 rounded-lg transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500',
                  isInComparison
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700',
                  !isInComparison && !canAddToComparison && 'opacity-50 cursor-not-allowed'
                )}
                aria-label={isInComparison ? 'Remove from comparison' : 'Add to comparison'}
                aria-pressed={isInComparison}
                title={isInComparison ? 'Remove from comparison' : canAddToComparison ? 'Add to comparison' : 'Max 3 flights'}
              >
                {isInComparison ? (
                  <Check className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Scale className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
              
              {/* Select Button */}
              <Button 
                size="sm"
                onClick={handleSelectClick}
                className="hidden md:flex"
                aria-label={`Select ${flight.airline.name} flight for ${price}`}
              >
                Select
              </Button>
            </div>
          </div>
        </div>
        
        {/* Mobile Select Button */}
        <div className="md:hidden mt-3">
          <Button 
            size="sm"
            onClick={handleSelectClick}
            className="w-full"
            aria-label={`Select ${flight.airline.name} flight for ${price}`}
          >
            Select Flight
          </Button>
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
