'use client';

import { FlightSegment } from '@/types/flight';
import { formatTime, formatDuration, cn } from '@/lib/utils';
import { Plane, Clock, MapPin, ChevronDown, ArrowRight } from 'lucide-react';

interface FlightStopsDetailProps {
  segments: FlightSegment[];
  isExpanded: boolean;
  onToggle: () => void;
  stops: number;
}

// Calculate layover time between segments
function calculateLayover(arrivalTime: string, departureTime: string): number {
  const arrival = new Date(arrivalTime);
  const departure = new Date(departureTime);
  return Math.round((departure.getTime() - arrival.getTime()) / (1000 * 60));
}

function getTimeColorClass(time: string): string {
  const hours = parseInt(time.split(':')[0], 10);
  if (hours < 6 || hours >= 22) return 'text-red-600 dark:text-red-400';  // Early/late
  if (hours < 12) return 'text-blue-600 dark:text-blue-400';         // Morning
  if (hours < 18) return 'text-emerald-600 dark:text-emerald-400';     // Afternoon
  return 'text-orange-600 dark:text-orange-400';                      // Evening
}

export function FlightStopsDetail({ 
  segments, 
  isExpanded, 
  onToggle,
  stops 
}: FlightStopsDetailProps) {
  if (stops === 0 || segments.length <= 1) {
    return null;
  }

  // Calculate layovers between segments
  const layovers = segments.slice(0, -1).map((segment, index) => ({
    airport: segment.arrival.airport,
    duration: calculateLayover(
      segment.arrival.time, 
      segments[index + 1].departure.time
    ),
  }));

  return (
    <div className="border-t border-neutral-100 dark:border-neutral-800">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3',
          'text-sm text-neutral-600 dark:text-neutral-400',
          'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500'
        )}
        aria-expanded={isExpanded}
        aria-controls="stops-detail"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" aria-hidden="true" />
          <span className="font-medium">
            {stops === 1 ? '1 stop' : `${stops} stops`}
          </span>
          {layovers.length > 0 && (
            <span className="ml-1 text-neutral-400 text-xs">
              ({layovers.map(l => l.airport.code).join(', ')})
            </span>
          )}
        </div>
        <ChevronDown 
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )} 
          aria-hidden="true" 
        />
      </button>

      {/* Expandable Detail */}
      <div
        id="stops-detail"
        role="region"
        aria-label="Flight stops details"
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-4 pb-4">
          {/* Timeline */}
          <div className="space-y-6 py-4">
            {segments.map((segment, index) => {
              const isLast = index === segments.length - 1;
              const layover = !isLast ? layovers[index] : null;

              return (
                <div key={`segment-${index}`} className="relative">
                  {/* Connection line */}
                  {!isLast && (
                    <div 
                      className="absolute left-6 top-12 bottom-0 w-1 bg-gradient-to-b from-emerald-200 via-amber-200 to-emerald-200 dark:from-emerald-600 dark:via-amber-600 dark:to-emerald-600"
                      aria-hidden="true"
                    />
                  )}

                      {/* Station point */}
                      <div className="relative flex items-start gap-4">
                        {/* Icon */}
                        <div className="relative z-10">
                          <div 
                            className={cn(
                              'w-12 h-12 rounded-full flex items-center justify-center',
                              'border-2 border-white dark:border-neutral-900 shadow-lg',
                              'transition-all duration-200',
                              isLast 
                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-600' 
                                : 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-600'
                            )}
                          >
                            {isLast ? (
                              <MapPin className="w-5 h-5 text-white" />
                            ) : (
                              <Plane className="w-5 h-5 text-white rotate-45" />
                            )}
                          </div>
                        </div>

                    {/* Station content */}
                    <div className="flex-1 min-w-0 pb-6">
                      {/* Time and Airport */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span 
                              className={cn(
                                'text-2xl font-bold tabular-nums',
                                getTimeColorClass(isLast ? segment.arrival.time : segment.departure.time)
                              )}
                            >
                              {formatTime(isLast ? segment.arrival.time : segment.departure.time)}
                            </span>
                            <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                              {isLast ? segment.arrival.airport.code : segment.departure.airport.code}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                              {isLast ? segment.arrival.airport.city : segment.departure.airport.city}
                            </span>
                            <span className="text-xs text-neutral-500">
                              {isLast ? segment.arrival.airport.name : segment.departure.airport.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Flight info card */}
                      {!isLast && (
                        <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 rounded-lg p-3 border border-neutral-200 dark:border-neutral-600 shadow-sm">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            {/* Flight number and airline */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-neutral-900 rounded border border-neutral-200 dark:border-neutral-700">
                                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                                  {segment.flightNumber}
                                </span>
                              </div>
                              <span className="text-neutral-600 dark:text-neutral-400 font-medium">
                                {segment.airline.name}
                              </span>
                            </div>

                            {/* Duration with arrow */}
                            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
                              <Clock className="w-4 h-4" aria-hidden="true" />
                              <span className="font-medium">{formatDuration(segment.duration)}</span>
                              <ArrowRight className="w-3 h-3" aria-hidden="true" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Layover info */}
                      {layover && (
                        <div 
                          className="relative mt-4 p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border border-amber-200 dark:border-amber-800 rounded-lg shadow-sm"
                          role="note"
                          aria-label={`Layover of ${formatDuration(layover.duration)} at ${layover.airport.city}`}
                        >
                          <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <span className="font-bold text-amber-800 dark:text-amber-200">
                                  {formatDuration(layover.duration)} layover
                                </span>
                                <span className="text-amber-700 dark:text-amber-300">
                                  at {layover.airport.city} ({layover.airport.code})
                                </span>
                              </div>
                              
                              {/* Contextual advice */}
                              <div className="mt-2">
                                {layover.duration > 180 && (
                                  <p className="text-sm text-amber-700 dark:text-amber-300">
                                    <span className="font-medium">Long layover</span> — You may have time to explore airport facilities or grab a meal.
                                  </p>
                                )}
                                {layover.duration < 60 && (
                                  <p className="text-sm text-amber-700 dark:text-amber-300">
                                    <span className="font-medium">Short connection</span> — Proceed directly to your next gate to avoid missing your flight.
                                  </p>
                                )}
                                {layover.duration >= 60 && layover.duration <= 180 && (
                                  <p className="text-sm text-amber-700 dark:text-amber-300">
                                    <span className="font-medium">Comfortable layover</span> — You have enough time for shopping and refreshments.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
