'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchHistory, SearchHistoryItem } from '@/hooks/useLocalStorage';
import { Card, Button } from '@/components/ui';
import { Clock, X, ArrowRight, Trash2, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface SearchHistoryProps {
  className?: string;
  variant?: 'dropdown' | 'full' | 'compact';
  onSelect?: () => void;
  maxItems?: number;
}

// ============================================================================
// Skeleton
// ============================================================================

function SearchHistorySkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          <div className="w-28 h-4 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        </div>
      </div>
      <div className="p-2 space-y-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 h-12 px-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/30">
            <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
            <div className="w-24 h-4 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
            <div className="flex-1" />
            <div className="w-16 h-3 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          </div>
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// History Item Card - Responsive: compact on mobile, detailed on desktop
// ============================================================================

interface HistoryItemCardProps {
  item: SearchHistoryItem;
  onSelect: () => void;
  onRemove: () => void;
  timeAgo: string;
}

function HistoryItemCard({ item, onSelect, onRemove, timeAgo }: HistoryItemCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onRemove();
    }
  };

  const formattedDate = format(parseISO(item.departureDate), 'MMM d, yyyy');
  const formattedDateShort = format(parseISO(item.departureDate), 'MMM d');

  return (
    <div
      role="listitem"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      aria-label={`Search from ${item.originCity} to ${item.destinationCity}, ${formattedDate}, ${item.passengers} passenger${item.passengers > 1 ? 's' : ''}. Press Enter to search again.`}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5",
        "rounded-lg cursor-pointer overflow-hidden",
        "bg-white dark:bg-neutral-800/60",
        "border border-neutral-200 dark:border-neutral-700/50",
        "hover:border-purple-300 dark:hover:border-purple-700",
        "hover:bg-purple-50/50 dark:hover:bg-purple-900/10",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500",
        "transition-all duration-150"
      )}
    >
      {/* Clock icon */}
      <div 
        className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        <Clock className="w-5 h-5 text-purple-500 dark:text-purple-400" />
      </div>

      {/* Route & Details */}
      <div className="flex-1 min-w-0">
        {/* Route - Always visible */}
        <div className="flex items-center gap-1.5">
          {/* Mobile: Just codes */}
          <span className="md:hidden font-semibold text-sm text-neutral-900 dark:text-neutral-100">
            {item.origin}
          </span>
          {/* Desktop: City + Code */}
          <span className="hidden md:inline font-semibold text-sm text-neutral-900 dark:text-neutral-100">
            {item.originCity}
          </span>
          <span className="hidden md:inline text-xs text-neutral-400">
            ({item.origin})
          </span>
          
          <ArrowRight className="w-3.5 h-3.5 text-purple-500 shrink-0" aria-hidden="true" />
          
          {/* Mobile: Just codes */}
          <span className="md:hidden font-semibold text-sm text-neutral-900 dark:text-neutral-100">
            {item.destination}
          </span>
          {/* Desktop: City + Code */}
          <span className="hidden md:inline font-semibold text-sm text-neutral-900 dark:text-neutral-100">
            {item.destinationCity}
          </span>
          <span className="hidden md:inline text-xs text-neutral-400">
            ({item.destination})
          </span>
        </div>

        {/* Details row - Desktop only */}
        <div className="hidden md:flex items-center gap-3 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" aria-hidden="true" />
            {formattedDate}
          </span>
          {item.returnDate && (
            <>
              <span className="text-neutral-300 dark:text-neutral-600">→</span>
              <span>{format(parseISO(item.returnDate), 'MMM d, yyyy')}</span>
            </>
          )}
          <span className="text-neutral-300 dark:text-neutral-600">•</span>
          <span>{item.passengers} passenger{item.passengers > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Date - Mobile only (short format) */}
      <span className="md:hidden text-xs text-neutral-500 shrink-0">
        {formattedDateShort}
      </span>

      {/* Time ago - Desktop */}
      <div className="hidden md:flex flex-col items-end shrink-0">
        <span className="text-xs text-neutral-400">
          {timeAgo} ago
        </span>
      </div>

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-neutral-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:opacity-100"
        aria-label="Remove from history"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function SearchHistory({ className, variant = 'full', onSelect, maxItems }: SearchHistoryProps) {
  const router = useRouter();
  const { history, removeSearch, clearHistory, isHydrated } = useSearchHistory();
  
  const [now, setNow] = useState<number>(() => Date.now());
  
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectSearch = useCallback((item: SearchHistoryItem) => {
    const params = new URLSearchParams({
      origin: item.origin,
      destination: item.destination,
      departureDate: item.departureDate,
      passengers: String(item.passengers),
    });
    
    if (item.returnDate) {
      params.set('returnDate', item.returnDate);
    }
    
    router.push(`/search?${params.toString()}`);
    onSelect?.();
  }, [router, onSelect]);

  const getTimeAgo = useCallback((timestamp: number) => {
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  }, [now]);

  if (!isHydrated) {
    return <SearchHistorySkeleton className={className} />;
  }

  if (history.length === 0) {
    if (variant === 'compact') {
      return (
        <Card className={cn('p-4', className)}>
          <div className="flex items-center gap-2 text-neutral-400">
            <History className="w-4 h-4" />
            <span className="text-sm">No recent searches</span>
          </div>
        </Card>
      );
    }

    return (
      <Card className={cn('py-8 px-6', className)}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6 text-purple-300 dark:text-purple-700" />
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No recent searches
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
            Your search history will appear here
          </p>
        </div>
      </Card>
    );
  }

  const displayedHistory = maxItems ? history.slice(0, maxItems) : history;
  const hasMore = maxItems && history.length > maxItems;
  const isCompact = variant === 'compact';

  return (
    <Card className={cn('overflow-hidden', className)} role="region" aria-label={`Search history (${history.length})`}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800 bg-gradient-to-r from-purple-50/40 to-indigo-50/20 dark:from-purple-950/20 dark:to-indigo-950/10">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-500" aria-hidden="true" />
          <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
            Recent Searches
          </span>
          <span className="text-xs text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">
            {history.length}
          </span>
        </div>
        
        {history.length > 1 && (
          <button
            onClick={clearHistory}
            className="text-xs text-neutral-400 hover:text-red-500 transition-colors px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label="Clear all search history"
          >
            Clear all
          </button>
        )}
      </header>

      {/* List */}
      <div 
        role="list" 
        aria-label="Search history"
        className={cn(
          "p-2 space-y-1",
          variant === 'dropdown' && 'max-h-80 overflow-y-auto',
          !isCompact && 'max-h-[400px] overflow-y-auto'
        )}
      >
        {displayedHistory.map((item) => (
          <HistoryItemCard
            key={item.id}
            item={item}
            onSelect={() => handleSelectSearch(item)}
            onRemove={() => removeSearch(item.id)}
            timeAgo={getTimeAgo(item.timestamp)}
          />
        ))}

        {hasMore && (
          <p className="text-xs text-center text-neutral-400 pt-2 pb-1">
            +{history.length - maxItems!} more
          </p>
        )}
      </div>
    </Card>
  );
}
