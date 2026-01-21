"use client";

import { useFlightStore } from "@/stores/useFlightStore";
import { cn } from "@/lib/utils";

// Filter for number of stops
export function StopsFilter() {
  const filters = useFlightStore((state) => state.filters);
  const setFilters = useFlightStore((state) => state.setFilters);
  const flights = useFlightStore((state) => state.flights);

  const stopOptions = [
    { value: 0, label: "Non-stop" },
    { value: 1, label: "1 stop" },
    { value: 2, label: "2+ stops" },
  ];

  // Count flights per stop option
  const getCount = (stops: number) => {
    if (stops === 2) {
      return flights.filter((f) => f.stops >= 2).length;
    }
    return flights.filter((f) => f.stops === stops).length;
  };

  const handleToggle = (value: number) => {
    const currentStops = [...filters.stops];
    const index = currentStops.indexOf(value);

    if (index > -1) {
      // Remove if already selected (but keep at least one)
      if (currentStops.length > 1) {
        currentStops.splice(index, 1);
      }
    } else {
      // Add if not selected
      currentStops.push(value);
    }

    setFilters({ stops: currentStops.sort() });
  };

  const isSelected = (value: number) => filters.stops.includes(value);

  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
        Stops
      </h3>
      <div
        className="space-y-2"
        role="group"
        aria-label="Filter by number of stops"
      >
        {stopOptions.map((option) => {
          const count = getCount(option.value);
          const selected = isSelected(option.value);

          return (
            <button
              key={option.value}
              onClick={() => handleToggle(option.value)}
              disabled={count === 0}
              role="checkbox"
              aria-checked={selected}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                selected
                  ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  : "bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700",
                count === 0 && "opacity-50 cursor-not-allowed",
              )}
            >
              <span className="font-medium">{option.label}</span>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  selected
                    ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                    : "bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
