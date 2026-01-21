'use client';

import { useFlightStore } from '@/stores/useFlightStore';
import { Button, Badge } from '@/components/ui';
import { formatDuration, formatTime, formatPrice, cn } from '@/lib/utils';
import { X, Scale, Plane, Clock, Trophy, Trash2 } from 'lucide-react';
import { useEffect, useCallback } from 'react';
import { Flight } from '@/types/flight';

interface StopsSummaryProps {
  segments: Flight['segments'];
  stops: number;
}

function StopsSummary({ segments, stops }: StopsSummaryProps) {
  if (stops === 0) {
    return (
      <div className="flex items-center gap-2">
        <Plane className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          Non-stop
        </span>
      </div>
    );
  }

  const stopAirports = segments.slice(0, -1).map(s => s.arrival.airport.code);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Plane className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
          {stops === 1 ? '1 stop' : `${stops} stops`}
        </span>
      </div>
      <div className="text-xs text-neutral-500 dark:text-neutral-400">
        <span className="inline-block bg-neutral-100 dark:bg-neutral-800 rounded px-1.5 py-0.5">
          {stopAirports.join(' • ')}
        </span>
      </div>
    </div>
  );
}

export function ComparisonDrawer() {
  const isOpen = useFlightStore((state) => state.isComparisonOpen);
  const setOpen = useFlightStore((state) => state.setComparisonOpen);
  const getComparisonFlights = useFlightStore((state) => state.getComparisonFlights);
  const clearComparison = useFlightStore((state) => state.clearComparison);
  const toggleComparison = useFlightStore((state) => state.toggleComparison);
  const selectFlight = useFlightStore((state) => state.selectFlight);

  const flights = getComparisonFlights();

  // Find best values for highlighting
  const bestPrice = flights.length > 0 ? Math.min(...flights.map(f => f.price.amount)) : 0;
  const bestDuration = flights.length > 0 ? Math.min(...flights.map(f => f.duration)) : 0;

  // Handle flight selection
  const handleSelectFlight = useCallback((flight: Flight) => {
    selectFlight(flight);
  }, [selectFlight]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, setOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (flights.length === 0) return null;

  return (
    <>
      {/* Floating Compare Button */}
      <div 
        className={cn(
          'fixed bottom-6 left-1/2 -translate-x-1/2 z-40',
          'transition-all duration-300',
          isOpen ? 'opacity-0 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'
        )}
      >
        <button
          onClick={() => setOpen(true)}
          className={cn(
            'flex items-center gap-3 px-5 py-3 rounded-full',
            'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900',
            'shadow-lg hover:shadow-xl transition-shadow',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2'
          )}
          aria-label={`Compare ${flights.length} flights`}
        >
          <Scale className="w-5 h-5" aria-hidden="true" />
          <span className="font-medium">Compare</span>
          <Badge variant="accent" size="sm" className="ml-1">
            {flights.length}
          </Badge>
        </button>
      </div>

      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="comparison-title"
        className={cn(
          'fixed inset-x-0 bottom-0 z-50',
          'bg-white dark:bg-neutral-900',
          'rounded-t-2xl shadow-2xl',
          'transform transition-transform duration-300 ease-out',
          'max-h-[85vh] overflow-hidden flex flex-col',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            </div>
            <div>
              <h2 id="comparison-title" className="font-semibold text-neutral-900 dark:text-neutral-100">
                Flight Comparison
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {flights.length} of 3 flights selected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearComparison}
              className="text-neutral-500"
            >
              <Trash2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
              Clear all
            </Button>
            <button
              onClick={() => setOpen(false)}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close comparison"
            >
              <X className="w-5 h-5 text-neutral-500" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {flights.map((flight) => {
              const isBestPrice = flight.price.amount === bestPrice;
              const isBestDuration = flight.duration === bestDuration;
              
              return (
                <div
                  key={flight.id}
                  className={cn(
                    'relative rounded-xl border p-5',
                    'bg-white dark:bg-neutral-900',
                    'border-neutral-200 dark:border-neutral-800'
                  )}
                >
                  {/* Remove button */}
                  <button
                    onClick={() => toggleComparison(flight.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    aria-label={`Remove ${flight.airline.name} from comparison`}
                  >
                    <X className="w-4 h-4 text-neutral-400" aria-hidden="true" />
                  </button>

                  {/* Airline */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                      <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                        {flight.airline.code}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {flight.airline.name}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {flight.origin.code} → {flight.destination.code}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3">
                    {/* Time */}
                    <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <span className="text-sm text-neutral-500">Departure</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {formatTime(flight.departureTime)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <span className="text-sm text-neutral-500">Arrival</span>
                      <span className="font-medium text-neutral-900 dark:text-neutral-100">
                        {formatTime(flight.arrivalTime)}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <span className="text-sm text-neutral-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        Duration
                      </span>
                      <span className={cn(
                        'font-medium flex items-center gap-1.5',
                        isBestDuration 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-neutral-900 dark:text-neutral-100'
                      )}>
                        {isBestDuration && <Trophy className="w-3.5 h-3.5" aria-hidden="true" />}
                        {formatDuration(flight.duration)}
                      </span>
                    </div>

                    {/* Stops */}
                    <div className="py-2 border-b border-neutral-100 dark:border-neutral-800">
                      <StopsSummary 
                        segments={flight.segments}
                        stops={flight.stops}
                      />
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-3">
                      <span className="text-sm text-neutral-500">Price</span>
                      <div className="flex items-center gap-2">
                        {isBestPrice && (
                          <Badge variant="success" size="sm">
                            <Trophy className="w-3 h-3 mr-1" aria-hidden="true" />
                            Best
                          </Badge>
                        )}
                        <span className={cn(
                          'text-xl font-bold',
                          isBestPrice 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-neutral-900 dark:text-neutral-100'
                        )}>
                          {formatPrice(flight.price.amount, flight.price.currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Select Button */}
                  <Button 
                    className="w-full mt-4" 
                    size="md"
                    onClick={() => handleSelectFlight(flight)}
                    aria-label={`Select ${flight.airline.name} flight for ${formatPrice(flight.price.amount, flight.price.currency)}`}
                  >
                    Select this flight
                  </Button>
                </div>
              );
            })}

            {/* Empty slots */}
            {Array.from({ length: 3 - flights.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className={cn(
                  'rounded-xl border-2 border-dashed p-5',
                  'border-neutral-200 dark:border-neutral-800',
                  'flex flex-col items-center justify-center min-h-[300px]',
                  'text-neutral-400 dark:text-neutral-600'
                )}
              >
                <Scale className="w-8 h-8 mb-2" aria-hidden="true" />
                <p className="text-sm">Add a flight to compare</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
