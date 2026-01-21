'use client';

import { useFlightStore } from '@/stores/useFlightStore';
import { DepartureTimeSlot } from '@/types/flight';
import { TIME_SLOT_RANGES, ALL_TIME_SLOTS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Sunrise, Sun, Sunset, Moon } from 'lucide-react';

const SLOT_ICONS: Record<DepartureTimeSlot, React.ComponentType<{ className?: string }>> = {
  early: Moon,
  morning: Sunrise,
  afternoon: Sun,
  evening: Sunset,
};

export function DepartureTimeFilter() {
  const filters = useFlightStore((state) => state.filters);
  const setFilters = useFlightStore((state) => state.setFilters);
  const flights = useFlightStore((state) => state.flights);

  const selectedSlots = filters.departureTimeSlots;
  const isAllSelected = selectedSlots.length === ALL_TIME_SLOTS.length;

  // Count flights in each time slot
  const getFlightCount = (slot: DepartureTimeSlot): number => {
    const range = TIME_SLOT_RANGES[slot];
    return flights.filter((f) => {
      const hour = new Date(f.departureTime).getHours();
      return hour >= range.start && hour < range.end;
    }).length;
  };

  // Toggle a specific time slot
  const toggleSlot = (slot: DepartureTimeSlot) => {
    const currentSlots = [...selectedSlots];
    const index = currentSlots.indexOf(slot);

    if (index > -1) {
      // Remove slot (but keep at least one selected)
      if (currentSlots.length > 1) {
        currentSlots.splice(index, 1);
        setFilters({ departureTimeSlots: currentSlots });
      }
    } else {
      // Add slot
      currentSlots.push(slot);
      // Sort to maintain order
      const sortedSlots = ALL_TIME_SLOTS.filter(s => currentSlots.includes(s));
      setFilters({ departureTimeSlots: sortedSlots });
    }
  };

  // Select all time slots
  const selectAll = () => {
    setFilters({ departureTimeSlots: [...ALL_TIME_SLOTS] });
  };

  const isSelected = (slot: DepartureTimeSlot) => selectedSlots.includes(slot);

  // Get active filters count for badge
  const activeCount = isAllSelected ? 0 : selectedSlots.length;

  return (
    <div className="space-y-3" role="group" aria-labelledby="departure-time-label">
      <div className="flex items-center justify-between">
        <h3 
          id="departure-time-label" 
          className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2"
        >
          Departure Time
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full">
              {activeCount}
            </span>
          )}
        </h3>
        {!isAllSelected && (
          <button
            onClick={selectAll}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded"
            aria-label="Select all departure times"
          >
            All times
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ALL_TIME_SLOTS.map((slot) => {
          const Icon = SLOT_ICONS[slot];
          const range = TIME_SLOT_RANGES[slot];
          const count = getFlightCount(slot);
          const selected = isSelected(slot);
          const isDisabled = count === 0;
          const isOnlySelected = selected && selectedSlots.length === 1;

          return (
            <button
              key={slot}
              onClick={() => !isDisabled && toggleSlot(slot)}
              disabled={isDisabled || isOnlySelected}
              aria-pressed={selected}
              aria-label={`${range.label}: ${range.description}, ${count} flights available${selected ? ', currently selected' : ''}`}
              title={isOnlySelected ? 'At least one time slot must be selected' : undefined}
              className={cn(
                'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
                isDisabled && 'opacity-40 cursor-not-allowed',
                isOnlySelected && !isDisabled && 'cursor-not-allowed',
                selected && !isDisabled
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 shadow-sm'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
              )}
            >
              {/* Selected indicator */}
              {selected && !isDisabled && (
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" aria-hidden="true" />
              )}
              
              <Icon 
                className={cn(
                  'w-5 h-5 transition-colors',
                  selected && !isDisabled
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-neutral-400 dark:text-neutral-500'
                )} 
                aria-hidden="true" 
              />
              
              <span 
                className={cn(
                  'text-xs font-semibold transition-colors',
                  selected && !isDisabled
                    ? 'text-emerald-700 dark:text-emerald-300' 
                    : 'text-neutral-700 dark:text-neutral-300'
                )}
              >
                {range.label}
              </span>
              
              <span 
                className={cn(
                  'text-[10px] transition-colors',
                  selected && !isDisabled
                    ? 'text-emerald-600/70 dark:text-emerald-400/70' 
                    : 'text-neutral-400 dark:text-neutral-500'
                )}
              >
                {range.description}
              </span>
              
              <span 
                className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors',
                  selected && !isDisabled
                    ? 'bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300' 
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                )}
              >
                {count} {count === 1 ? 'flight' : 'flights'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Summary text */}
      <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center" aria-live="polite">
        {isAllSelected 
          ? 'Showing flights at any time' 
          : `Showing ${selectedSlots.map(s => TIME_SLOT_RANGES[s].label.toLowerCase()).join(' & ')} flights`
        }
      </p>
    </div>
  );
}
