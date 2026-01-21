"use client";

import { useFlightStore } from "@/stores/useFlightStore";
import { cn } from "@/lib/utils";

type SortOption = "price" | "duration" | "departure";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "price", label: "Cheapest" },
  { value: "duration", label: "Fastest" },
  { value: "departure", label: "Earliest" },
];

// Client-side sort filter component
export function SortFilter() {
  const sortBy = useFlightStore((state) => state.filters.sortBy);
  const setFilters = useFlightStore((state) => state.setFilters);

  return (
    <div>
      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
        Sort by
      </h3>
      <div className="flex gap-2">
        {sortOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilters({ sortBy: option.value })}
            aria-pressed={sortBy === option.value}
            className={cn(
              "flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all",
              sortBy === option.value
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
