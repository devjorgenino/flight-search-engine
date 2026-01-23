'use client';

import { FlightSegment } from '@/types/flight';
import { formatTime, formatDuration, cn } from '@/lib/utils';
import { Plane, Clock, MapPin, ChevronDown } from 'lucide-react';

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

// Get layover type for styling and messaging
function getLayoverType(duration: number): 'short' | 'comfortable' | 'long' {
  if (duration < 60) return 'short';
  if (duration > 180) return 'long';
  return 'comfortable';
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

  // Calculate total layover time
  const totalLayoverTime = layovers.reduce((acc, l) => acc + l.duration, 0);

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
          <span className="text-neutral-400 text-xs">
            ({layovers.map(l => l.airport.code).join(' · ')})
          </span>
          <span className="hidden sm:inline text-neutral-400 text-xs">
            · {formatDuration(totalLayoverTime)} total layover
          </span>
        </div>
        <ChevronDown 
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )} 
          aria-hidden="true" 
        />
      </button>

      {/* Expandable Detail - uses grid for smooth height animation */}
      <div
        id="stops-detail"
        role="region"
        aria-label="Flight stops details"
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4">
            {/* Journey Timeline - Compact horizontal layout */}
            <div className="space-y-3 pt-2">
              {segments.map((segment, index) => {
                const isFirst = index === 0;
                const isLast = index === segments.length - 1;
                const layover = !isLast ? layovers[index] : null;
                const layoverType = layover ? getLayoverType(layover.duration) : null;

                return (
                  <div key={`segment-${index}`}>
                    {/* Segment Card */}
                    <div 
                      className={cn(
                        "rounded-lg border p-3",
                        "bg-white dark:bg-neutral-800/50",
                        "border-neutral-200 dark:border-neutral-700"
                      )}
                      role="article"
                      aria-label={`Flight segment ${index + 1}: ${segment.departure.airport.code} to ${segment.arrival.airport.code}`}
                    >
                      {/* Segment Header - Flight info */}
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-100 dark:border-neutral-700">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded text-xs font-bold text-neutral-700 dark:text-neutral-200">
                          {segment.flightNumber}
                        </div>
                        <span className="text-sm text-neutral-600 dark:text-neutral-400">
                          {segment.airline.name}
                        </span>
                        <span className="ml-auto flex items-center gap-1 text-xs text-neutral-500">
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          {formatDuration(segment.duration)}
                        </span>
                      </div>

                      {/* Departure and Arrival in row */}
                      <div className="flex items-center gap-3">
                        {/* Departure */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full flex-shrink-0",
                              isFirst ? "bg-emerald-500" : "bg-neutral-400"
                            )} />
                            <span className="text-lg font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
                              {formatTime(segment.departure.time)}
                            </span>
                            <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                              {segment.departure.airport.code}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 ml-4 truncate" title={segment.departure.airport.name}>
                            {segment.departure.airport.city}
                          </p>
                        </div>

                        {/* Arrow */}
                        <div className="flex-shrink-0 flex flex-col items-center px-2">
                          <Plane className="w-4 h-4 text-neutral-400 rotate-90" aria-hidden="true" />
                        </div>

                        {/* Arrival */}
                        <div className="flex-1 min-w-0 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-semibold text-neutral-700 dark:text-neutral-200">
                              {segment.arrival.airport.code}
                            </span>
                            <span className="text-lg font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
                              {formatTime(segment.arrival.time)}
                            </span>
                            <div className={cn(
                              "w-2 h-2 rounded-full flex-shrink-0",
                              isLast ? "bg-emerald-500" : "bg-neutral-400"
                            )} />
                          </div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mr-4 truncate" title={segment.arrival.airport.name}>
                            {segment.arrival.airport.city}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Layover indicator between segments */}
                    {layover && (
                      <div 
                        className="flex items-center gap-3 py-2 px-3"
                        role="note"
                        aria-label={`Layover of ${formatDuration(layover.duration)} at ${layover.airport.city}`}
                      >
                        {/* Connector line */}
                        <div className="flex flex-col items-center w-4 flex-shrink-0">
                          <div className="w-px h-3 bg-neutral-300 dark:bg-neutral-600" />
                          <div className={cn(
                            "w-3 h-3 rounded-full border-2 flex-shrink-0",
                            layoverType === 'short' 
                              ? "border-amber-400 bg-amber-50 dark:bg-amber-900/30" 
                              : layoverType === 'long'
                                ? "border-blue-400 bg-blue-50 dark:bg-blue-900/30"
                                : "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30"
                          )} />
                          <div className="w-px h-3 bg-neutral-300 dark:bg-neutral-600" />
                        </div>

                        {/* Layover info */}
                        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
                          <span className={cn(
                            "font-semibold",
                            layoverType === 'short' 
                              ? "text-amber-600 dark:text-amber-400" 
                              : layoverType === 'long'
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-emerald-600 dark:text-emerald-400"
                          )}>
                            {formatDuration(layover.duration)}
                          </span>
                          <span className="text-neutral-500 dark:text-neutral-400">
                            layover in {layover.airport.city}
                          </span>
                          {layoverType === 'short' && (
                            <span className="text-xs text-neutral-400 dark:text-neutral-500">
                              · Tight connection
                            </span>
                          )}
                          {layoverType === 'long' && (
                            <span className="text-xs text-neutral-400 dark:text-neutral-500">
                              · Time to explore
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Screen reader summary */}
            <div className="sr-only">
              Flight has {stops} {stops === 1 ? 'stop' : 'stops'} with total layover time of {formatDuration(totalLayoverTime)}.
              Stops at: {layovers.map(l => `${l.airport.city} for ${formatDuration(l.duration)}`).join(', ')}.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
