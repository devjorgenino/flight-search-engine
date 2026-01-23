'use client';

import { Flight } from '@/types/flight';
import { FlightCard } from './FlightCard';
import { FlightCardSkeleton } from './FlightCardSkeleton';
import { useFlightStore } from '@/stores/useFlightStore';
import { useFilteredFlights, useFlightStats } from '@/hooks/useFilteredFlights';
import { Button } from '@/components/ui';
import { Plane, SearchX, AlertCircle, RefreshCw, Info } from 'lucide-react';

// Valid data sources for the flight search
type FlightDataSource = 'serpapi' | 'amadeus' | 'mock' | 'cache' | null;

interface FlightListProps {
  onSelectFlight?: (flight: Flight) => void;
  warning?: string | null;
  dataSource?: FlightDataSource;
  isRetryable?: boolean;
  onRetry?: () => void;
}

export function FlightList({ 
  onSelectFlight, 
  warning, 
  dataSource,
  isRetryable,
  onRetry 
}: FlightListProps) {
  const isLoading = useFlightStore((state) => state.isLoading);
  const error = useFlightStore((state) => state.error);
  const filteredFlights = useFilteredFlights();
  const { totalFlights, filteredCount } = useFlightStats();

  // Loading state with enhanced skeleton
  if (isLoading) {
    return (
      <div className="space-y-4" role="status" aria-label="Loading flights">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-5 h-5 border-2 border-neutral-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Searching for the best flights...
          </p>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <FlightCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Error state with retry option
  if (error) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-16 text-center"
        role="alert"
        aria-live="polite"
      >
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          Unable to load flights
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-md mb-6">
          {error}
        </p>
        {isRetryable && onRetry && (
          <Button
            variant="primary"
            onClick={onRetry}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // Empty state - no search yet
  if (totalFlights === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-16 text-center"
        role="status"
      >
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
          <Plane className="w-8 h-8 text-neutral-400" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          Search for flights
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-md">
          Enter your travel details above to find available flights.
        </p>
      </div>
    );
  }

  // No results after filtering
  if (filteredCount === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-16 text-center"
        role="status"
        aria-live="polite"
      >
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
          <SearchX className="w-8 h-8 text-amber-500" aria-hidden="true" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          No flights match your filters
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-md">
          Try adjusting your filters to see more results. 
          There are {totalFlights} flights available for this route.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Warning banner (e.g., using mock data) */}
      {warning && (
        <div 
          className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
          role="alert"
        >
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {warning}
            </p>
          </div>
        </div>
      )}

      {/* Results count with data source indicator */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Showing <span className="font-medium text-neutral-900 dark:text-neutral-100">{filteredCount}</span>
          {filteredCount !== totalFlights && (
            <span> of {totalFlights}</span>
          )} flights
          {dataSource === 'cache' && (
            <span className="ml-2 text-xs text-neutral-400">(cached)</span>
          )}
        </p>
        {(dataSource === 'amadeus' || dataSource === 'serpapi') && (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live prices
          </span>
        )}
      </div>

      {/* Flight cards */}
      <div className="space-y-3" role="list" aria-label="Available flights">
        {filteredFlights.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            onSelect={onSelectFlight}
          />
        ))}
      </div>
    </div>
  );
}
