'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useFavorites, FavoriteFlight } from '@/hooks/useLocalStorage';
import { useFlightStore } from '@/stores/useFlightStore';
import { useUIStore } from '@/stores/useUIStore';
import { Card, Badge } from '@/components/ui';
import { Heart, X, ChevronDown, ArrowRight, Info } from 'lucide-react';
import { formatDuration, formatPrice, cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

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
  variant?: 'full' | 'compact' | 'sidebar';
  maxItems?: number;
}

// ============================================================================
// Helpers
// ============================================================================

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

function getFullTimeDescription(timestamp: number): string {
  const date = new Date(timestamp);
  return `Saved on ${date.toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric'
  })}`;
}

function announceToScreenReader(message: string) {
  const el = document.createElement('div');
  el.setAttribute('aria-live', 'assertive');
  el.setAttribute('aria-atomic', 'true');
  el.className = 'sr-only';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => document.body.removeChild(el), 1000);
}

// ============================================================================
// FavoriteFlightCard - Single line, nothing overlapping
// ============================================================================

function FavoriteFlightCard({ favorite, onRemove, index, total }: FavoriteFlightCardProps) {
  const router = useRouter();
  const setFilters = useFlightStore((state) => state.setFilters);
  const setFilterPanelOpen = useUIStore((state) => state.setFilterPanelOpen);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleSearch = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    
    // Apply filters based on the saved flight
    setFilters({
      airlines: [favorite.airlineCode],
      stops: [favorite.stops],
    });
    
    // Close mobile filter panel if open
    setFilterPanelOpen(false);
    
    // Navigate to search
    const params = new URLSearchParams({
      origin: favorite.origin,
      destination: favorite.destination,
      departureDate: today.toISOString().split('T')[0],
      passengers: '1',
    });
    router.push(`/search?${params.toString()}`);
    
    // Announce to screen readers
    announceToScreenReader(`Searching ${favorite.origin} to ${favorite.destination} with ${favorite.airline} filter applied`);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemoving(true);
    announceToScreenReader(`Flight ${favorite.origin} to ${favorite.destination} removed`);
    setTimeout(() => onRemove(favorite.flightId), 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      setIsRemoving(true);
      setTimeout(() => onRemove(favorite.flightId), 150);
    }
  };

  const stopsText = favorite.stops === 0 ? 'Direct' : `${favorite.stops} stop${favorite.stops > 1 ? 's' : ''}`;

  return (
    <div
      role="listitem"
      tabIndex={0}
      onClick={handleSearch}
      onKeyDown={handleKeyDown}
      aria-label={`${favorite.airline}, ${favorite.origin} to ${favorite.destination}, ${formatPrice(favorite.price, favorite.currency)}, ${stopsText}. Item ${index + 1} of ${total}.`}
      className={cn(
        // Single row layout with overflow hidden
        "flex items-center h-14 px-3 gap-2",
        "rounded-lg cursor-pointer overflow-hidden",
        "bg-white dark:bg-neutral-800/60",
        "border border-neutral-200 dark:border-neutral-700/50",
        "hover:border-emerald-400 dark:hover:border-emerald-600",
        "hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
        "transition-all duration-150",
        isRemoving && "opacity-0 scale-95"
      )}
    >
      {/* Airline code */}
      <div 
        className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300">
          {favorite.airlineCode}
        </span>
      </div>

      {/* Route: Origin -> Destination */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
          {favorite.origin}
        </span>
        <ArrowRight className="w-3 h-3 text-emerald-500" aria-hidden="true" />
        <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
          {favorite.destination}
        </span>
      </div>

      {/* Duration & Stops - hidden on small screens */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-neutral-500 shrink-0">
        <span>{formatDuration(favorite.duration)}</span>
        <Badge 
          variant={favorite.stops === 0 ? 'success' : 'warning'} 
          size="sm"
          className="text-[10px] h-4 px-1"
        >
          {stopsText}
        </Badge>
      </div>

      {/* Spacer */}
      <div className="flex-1 min-w-0" />

      {/* Price */}
      <div className="shrink-0">
        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
          {formatPrice(favorite.price, favorite.currency)}
        </span>
      </div>

      {/* Remove button */}
      <button
        onClick={handleRemove}
        className="w-6 h-6 rounded flex items-center justify-center shrink-0 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        aria-label="Remove from favorites"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function FavoritesListSkeleton({ className, count = 3 }: { className?: string; count?: number }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          <div className="w-24 h-4 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        </div>
      </div>
      <div className="p-2 space-y-1">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center h-14 px-3 gap-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/30">
            <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
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

function EmptyState({ variant }: { variant: FavoritesListProps['variant'] }) {
  if (variant === 'sidebar' || variant === 'compact') {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-neutral-400">
          <Heart className="w-4 h-4" />
          <span className="text-sm">No saved flights</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="py-10 px-6">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-3">
          <Heart className="w-6 h-6 text-red-300 dark:text-red-700" />
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No saved flights yet. Click <Heart className="inline w-3.5 h-3.5 text-red-400 mx-0.5" /> on any flight to save it.
        </p>
      </div>
    </Card>
  );
}

// ============================================================================
// Main FavoritesList
// ============================================================================

export function FavoritesList({ className, variant = 'full', maxItems }: FavoritesListProps) {
  const { favorites, removeFavorite, clearFavorites, isHydrated } = useFavorites();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (showClearConfirm) {
      clearTimeoutRef.current = setTimeout(() => setShowClearConfirm(false), 3000);
    }
    return () => {
      if (clearTimeoutRef.current) clearTimeout(clearTimeoutRef.current);
    };
  }, [showClearConfirm]);

  const handleListKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const items = e.currentTarget.querySelectorAll('[role="listitem"]');
    const idx = Array.from(items).indexOf(document.activeElement as Element);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      (items[Math.min(idx + 1, items.length - 1)] as HTMLElement)?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      (items[Math.max(idx - 1, 0)] as HTMLElement)?.focus();
    }
  }, []);

  const handleClearAll = () => {
    if (showClearConfirm) {
      clearFavorites();
      setShowClearConfirm(false);
      announceToScreenReader('All favorites cleared');
    } else {
      setShowClearConfirm(true);
    }
  };

  if (!isHydrated) return <FavoritesListSkeleton className={className} count={variant === 'sidebar' ? 2 : 3} />;
  if (favorites.length === 0) return <EmptyState variant={variant} />;

  const displayed = maxItems ? favorites.slice(0, maxItems) : favorites;
  const hasMore = maxItems && favorites.length > maxItems;
  const isCompact = variant === 'compact' || variant === 'sidebar';

  return (
    <Card className={cn("overflow-hidden", className)} role="region" aria-label={`Saved flights (${favorites.length})`}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-red-50/40 to-pink-50/20 dark:from-red-950/20 dark:to-pink-950/10">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded p-0.5 -m-0.5"
          aria-expanded={isExpanded}
        >
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">Saved Flights</span>
          <Badge size="sm" className="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 text-xs px-1.5">
            {favorites.length}
          </Badge>
          {isCompact && <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", isExpanded && "rotate-180")} />}
        </button>

        {favorites.length > 1 && isExpanded && (
          showClearConfirm ? (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-red-500">Clear all?</span>
              <button onClick={handleClearAll} className="font-medium text-white bg-red-500 hover:bg-red-600 px-2 py-0.5 rounded">Yes</button>
              <button onClick={() => setShowClearConfirm(false)} className="text-neutral-500 hover:text-neutral-700 px-1">No</button>
            </div>
          ) : (
            <button onClick={() => setShowClearConfirm(true)} className="text-xs text-neutral-400 hover:text-red-500 transition-colors">
              Clear all
            </button>
          )
        )}
      </header>

      {/* List */}
      {(!isCompact || isExpanded) && (
        <div
          role="list"
          onKeyDown={handleListKeyDown}
          className="p-2 space-y-1 max-h-[400px] overflow-y-auto"
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
            <p className="text-xs text-center text-neutral-400 py-2">+{favorites.length - maxItems!} more</p>
          )}
        </div>
      )}

      {/* Footer */}
      {(!isCompact || isExpanded) && favorites.length > 0 && (
        <footer className="px-3 py-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
          <p className="text-[10px] text-neutral-400 flex items-center justify-center gap-1">
            <Info className="w-3 h-3" />
            Prices may have changed
          </p>
        </footer>
      )}
    </Card>
  );
}
