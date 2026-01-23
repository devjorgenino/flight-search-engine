"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useFavorites, FavoriteFlight } from "@/hooks/useLocalStorage";
import { useFlightStore } from "@/stores/useFlightStore";
import { useUIStore } from "@/stores/useUIStore";
import { Card, Badge } from "@/components/ui";
import { Heart, X, ChevronDown, ArrowRight } from "lucide-react";
import { formatDuration, formatPrice, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// ============================================================================
// Types
// ============================================================================

interface FavoriteFlightCardProps {
  favorite: FavoriteFlight;
  onRemove: (flightId: string) => void;
  index: number;
  total: number;
}

interface FavoritesListProps {
  className?: string;
  variant?: "full" | "compact" | "sidebar";
  maxItems?: number;
}

// ============================================================================
// Helpers
// ============================================================================

function announceToScreenReader(message: string) {
  const el = document.createElement("div");
  el.setAttribute("aria-live", "assertive");
  el.setAttribute("aria-atomic", "true");
  el.className = "sr-only";
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => document.body.removeChild(el), 1000);
}

// ============================================================================
// Collapsible FavoriteFlightCard - Clean single-line with expandable details
// ============================================================================

function FavoriteFlightCard({
  favorite,
  onRemove,
  index,
  total,
}: FavoriteFlightCardProps) {
  const router = useRouter();
  const setFilters = useFlightStore((state) => state.setFilters);
  const setFilterPanelOpen = useUIStore((state) => state.setFilterPanelOpen);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleSearch = useCallback(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);

    setFilters({
      airlines: [favorite.airlineCode],
      stops: [favorite.stops],
    });

    setFilterPanelOpen(false);

    const params = new URLSearchParams({
      origin: favorite.origin,
      destination: favorite.destination,
      departureDate: today.toISOString().split("T")[0],
      passengers: "1",
    });
    router.push(`/search?${params.toString()}`);

    announceToScreenReader(
      `Searching ${favorite.origin} to ${favorite.destination} with ${favorite.airline} filter applied`,
    );
  }, [favorite, router, setFilters, setFilterPanelOpen]);

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsRemoving(true);
      announceToScreenReader(
        `Flight ${favorite.origin} to ${favorite.destination} removed`,
      );
      setTimeout(() => onRemove(favorite.flightId), 200);
    },
    [favorite, onRemove],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSearch();
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        setIsRemoving(true);
        setTimeout(() => onRemove(favorite.flightId), 200);
      }
    },
    [handleSearch, onRemove, favorite.flightId],
  );

  const stopsText =
    favorite.stops === 0
      ? "Direct"
      : `${favorite.stops} stop${favorite.stops > 1 ? "s" : ""}`;

  return (
    <div
      role="listitem"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleSearch}
      aria-label={`${favorite.airline}, ${favorite.origin} to ${favorite.destination}, ${formatPrice(favorite.price, favorite.currency)}, ${stopsText}. Item ${index + 1} of ${total}. Press Enter to search.`}
      className={cn(
        "group rounded-xl border transition-all duration-200 cursor-pointer",
        "bg-white dark:bg-neutral-800/60",
        "border-neutral-200 dark:border-neutral-700/50",
        "hover:border-emerald-300 dark:hover:border-emerald-700",
        "hover:shadow-sm hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        isRemoving && "opacity-0 scale-95",
      )}
    >
      {/* Single Row - Clean compact layout */}
      <div className="flex items-center h-12 px-3 gap-3">
        {/* Route: Origin -> Destination */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
            {favorite.origin}
          </span>
          <ArrowRight
            className="w-3 h-3 text-emerald-500 flex-shrink-0"
            aria-hidden="true"
          />
          <span className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
            {favorite.destination}
          </span>
        </div>

        {/* Separator */}
        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 flex-shrink-0" />

        {/* Airline */}
        <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate hidden sm:hidden max-w-[100px]">
          {favorite.airline}
        </span>
        <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 sm:hidden">
          {favorite.airlineCode}
        </span>

        {/* Stops badge */}
        {/* <span
          className={cn(
            "text-xs font-medium px-1.5 py-0.5 rounded hidden sm:inline-flex",
            favorite.stops === 0
              ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              : "bg-neutral-100 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400",
          )}
        >
          {stopsText}
        </span> */}

        {/* Spacer */}
        <div className="flex-1 min-w-2" />

        {/* Price */}
        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums flex-shrink-0">
          {formatPrice(favorite.price, favorite.currency)}
        </span>

        {/* Remove button */}
        <button
          onClick={handleRemove}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center ml-[5px] flex-shrink-0",
            "text-neutral-400 hover:text-red-500",
            "hover:bg-red-50 dark:hover:bg-red-900/20",
            "transition-colors duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500",
            "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
          )}
          aria-label="Remove from favorites"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function FavoritesListSkeleton({
  className,
  count = 3,
}: {
  className?: string;
  count?: number;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          <div className="w-24 h-4 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        </div>
      </div>
      <div className="p-3 space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center h-14 px-3 gap-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/30"
          >
            <div className="w-6 h-6 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
            <div className="w-20 h-4 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
            <div className="flex-1" />
            <div className="w-16 h-4 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyState({ variant }: { variant: FavoritesListProps["variant"] }) {
  const isCompact = variant === "sidebar" || variant === "compact";

  return (
    <Card className={cn("text-center", isCompact ? "p-4" : "py-10 px-6")}>
      <div
        className={cn(
          "rounded-full bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30",
          "flex items-center justify-center mx-auto mb-3",
          isCompact ? "w-10 h-10" : "w-14 h-14",
        )}
      >
        <Heart
          className={cn(
            "text-rose-300 dark:text-rose-700",
            isCompact ? "w-4 h-4" : "w-6 h-6",
          )}
        />
      </div>
      <p
        className={cn(
          "text-neutral-500 dark:text-neutral-400",
          isCompact ? "text-xs" : "text-sm",
        )}
      >
        No saved flights yet
      </p>
      {!isCompact && (
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
          Click <Heart className="inline w-3 h-3 text-rose-400 mx-0.5" /> on any
          flight to save it
        </p>
      )}
    </Card>
  );
}

// ============================================================================
// Main FavoritesList
// ============================================================================

export function FavoritesList({
  className,
  variant = "full",
  maxItems,
}: FavoritesListProps) {
  const { favorites, removeFavorite, clearFavorites, isHydrated } =
    useFavorites();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (showClearConfirm) {
      clearTimeoutRef.current = setTimeout(
        () => setShowClearConfirm(false),
        3000,
      );
    }
    return () => {
      if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
    };
  }, [showClearConfirm]);

  const handleListKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const items = e.currentTarget.querySelectorAll('[role="listitem"]');
      const idx = Array.from(items).indexOf(document.activeElement as Element);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        (items[Math.min(idx + 1, items.length - 1)] as HTMLElement)?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        (items[Math.max(idx - 1, 0)] as HTMLElement)?.focus();
      }
    },
    [],
  );

  const handleClearAll = useCallback(() => {
    if (showClearConfirm) {
      clearFavorites();
      setShowClearConfirm(false);
      announceToScreenReader("All favorites cleared");
    } else {
      setShowClearConfirm(true);
    }
  }, [showClearConfirm, clearFavorites]);

  if (!isHydrated)
    return (
      <FavoritesListSkeleton
        className={className}
        count={variant === "sidebar" ? 2 : 3}
      />
    );
  if (favorites.length === 0) return <EmptyState variant={variant} />;

  const displayed = maxItems ? favorites.slice(0, maxItems) : favorites;
  const hasMore = maxItems && favorites.length > maxItems;
  const isCompact = variant === "compact" || variant === "sidebar";

  return (
    <Card
      className={cn("overflow-hidden", className)}
      role="region"
      aria-label={`Saved flights (${favorites.length})`}
    >
      {/* Header */}
      <header
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b",
          "border-neutral-100 dark:border-neutral-800",
          "bg-gradient-to-r from-rose-50/50 to-pink-50/30 dark:from-rose-950/20 dark:to-pink-950/10",
        )}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center gap-2 hover:opacity-80 transition-opacity",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded p-0.5 -m-0.5",
          )}
          aria-expanded={isExpanded}
        >
          <Heart
            className="w-4 h-4 text-rose-500 fill-rose-500"
            aria-hidden="true"
          />
          <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
            Saved Flights
          </span>
          <Badge
            size="sm"
            className="bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 text-xs px-1.5 border-rose-200 dark:border-rose-800"
          >
            {favorites.length}
          </Badge>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-neutral-400 transition-transform",
              isExpanded && "rotate-180",
            )}
            aria-hidden="true"
          />
        </button>

        {favorites.length > 1 &&
          isExpanded &&
          (showClearConfirm ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-rose-500">Clear all?</span>
              <button
                onClick={handleClearAll}
                className="font-medium text-white bg-rose-500 hover:bg-rose-600 px-2 py-1 rounded-md transition-colors"
              >
                Yes
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 px-1"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-neutral-400 hover:text-rose-500 transition-colors"
            >
              Clear all
            </button>
          ))}
      </header>

      {/* List */}
      {isExpanded && (
        <div
          role="list"
          onKeyDown={handleListKeyDown}
          className="p-3 space-y-2 max-h-[400px] overflow-y-auto"
        >
          {displayed.map((fav, idx) => (
            <FavoriteFlightCard
              key={fav.id}
              favorite={fav}
              onRemove={removeFavorite}
              index={idx}
              total={displayed.length}
            />
          ))}
          {hasMore && (
            <p className="text-xs text-center text-neutral-400 py-2">
              +{favorites.length - maxItems!} more saved flights
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
