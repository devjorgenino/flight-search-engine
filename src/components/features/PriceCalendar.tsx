'use client';

import { useState, useMemo, useCallback, useId, useRef, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { ChevronLeft, ChevronRight, TrendingDown, Sparkles, Calendar, Plane, Info, X } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfToday, addDays } from 'date-fns';

interface PriceCalendarProps {
  prices: Record<string, number>;
  currency?: string;
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  className?: string;
  minDate?: Date;
  showStats?: boolean;
}

type PriceLevel = 'lowest' | 'low' | 'medium' | 'high' | 'highest';

// ============================================================================
// Price Level Styles
// ============================================================================

const PRICE_STYLES: Record<PriceLevel, { bg: string; text: string; border: string; hover: string; dot: string; label: string }> = {
  lowest: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/50',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-700',
    hover: 'hover:bg-emerald-150 dark:hover:bg-emerald-800/70 hover:shadow-emerald-200/50',
    dot: 'bg-emerald-500',
    label: 'Best Price',
  },
  low: {
    bg: 'bg-green-50 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
    hover: 'hover:bg-green-100 dark:hover:bg-green-800/50 hover:shadow-green-200/50',
    dot: 'bg-green-500',
    label: 'Good Deal',
  },
  medium: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    hover: 'hover:bg-amber-100 dark:hover:bg-amber-800/50 hover:shadow-amber-200/50',
    dot: 'bg-amber-500',
    label: 'Average',
  },
  high: {
    bg: 'bg-orange-50 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
    hover: 'hover:bg-orange-100 dark:hover:bg-orange-800/50 hover:shadow-orange-200/50',
    dot: 'bg-orange-500',
    label: 'High Price',
  },
  highest: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
    hover: 'hover:bg-red-100 dark:hover:bg-red-800/50 hover:shadow-red-200/50',
    dot: 'bg-red-500',
    label: 'Peak Price',
  },
};

const WEEKDAYS = [
  { key: 'sun', short: 'S', medium: 'Sun', full: 'Sunday' },
  { key: 'mon', short: 'M', medium: 'Mon', full: 'Monday' },
  { key: 'tue', short: 'T', medium: 'Tue', full: 'Tuesday' },
  { key: 'wed', short: 'W', medium: 'Wed', full: 'Wednesday' },
  { key: 'thu', short: 'T', medium: 'Thu', full: 'Thursday' },
  { key: 'fri', short: 'F', medium: 'Fri', full: 'Friday' },
  { key: 'sat', short: 'S', medium: 'Sat', full: 'Saturday' },
];

// ============================================================================
// Price Tooltip Popover
// ============================================================================

interface PriceTooltipProps {
  date: Date;
  price: number;
  currency: string;
  priceLevel: PriceLevel;
  isLowest: boolean;
  avgPrice: number;
  position: { x: number; y: number };
  onClose: () => void;
}

function PriceTooltip({ date, price, currency, priceLevel, isLowest, avgPrice, position, onClose }: PriceTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const style = PRICE_STYLES[priceLevel];
  const savings = avgPrice - price;
  const savingsPercent = avgPrice > 0 ? Math.round((savings / avgPrice) * 100) : 0;
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Adjust position to stay within viewport
  const [adjustedPos, setAdjustedPos] = useState(position);
  useEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const newPos = { ...position };
      
      // Adjust horizontal position
      if (rect.right > window.innerWidth - 10) {
        newPos.x = position.x - (rect.right - window.innerWidth) - 20;
      }
      if (rect.left < 10) {
        newPos.x = 10;
      }
      
      // Adjust vertical position (show above if too close to bottom)
      if (rect.bottom > window.innerHeight - 10) {
        newPos.y = position.y - rect.height - 60;
      }
      
      setAdjustedPos(newPos);
    }
  }, [position]);

  return (
    <div
      ref={tooltipRef}
      className={cn(
        "fixed z-50 w-64 bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700",
        "animate-in fade-in-0 zoom-in-95 duration-200"
      )}
      style={{ left: adjustedPos.x, top: adjustedPos.y }}
      role="tooltip"
      aria-live="polite"
    >
      {/* Header */}
      <div className={cn(
        "px-4 py-3 rounded-t-xl border-b",
        style.bg, style.border
      )}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {format(date, 'EEEE')}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              {format(date, 'MMMM d, yyyy')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label="Close tooltip"
          >
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Price */}
        <div className="text-center">
          <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums">
            {formatPrice(price, currency)}
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <div className={cn("w-2 h-2 rounded-full", style.dot)} />
            <span className={cn("text-xs font-medium", style.text)}>
              {style.label}
            </span>
            {isLowest && (
              <Sparkles className="w-3 h-3 text-emerald-500 ml-1" />
            )}
          </div>
        </div>
        
        {/* Savings indicator */}
        {savings > 0 && (
          <div className="flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Save {formatPrice(savings, currency)} ({savingsPercent}% below avg)
            </span>
          </div>
        )}
        
        {savings < 0 && (
          <div className="flex items-center justify-center gap-2 py-2 px-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
              {formatPrice(Math.abs(savings), currency)} above average
            </span>
          </div>
        )}
        
        {/* Info */}
        <p className="text-xs text-center text-neutral-500 dark:text-neutral-400">
          Sample price for this date. Actual prices may vary.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function PriceCalendar({
  prices,
  currency = 'EUR',
  selectedDate,
  onSelectDate,
  className,
  minDate = startOfToday(),
  showStats = true,
}: PriceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(selectedDate || new Date()));
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [focusedDate, setFocusedDate] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<{
    date: Date;
    price: number;
    position: { x: number; y: number };
  } | null>(null);
  const calendarId = useId();
  const calendarRef = useRef<HTMLDivElement>(null);

  // Calculate month data
  const { days, lowestPrice, highestPrice, averagePrice, lowestDate, priceCount } = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    const pricesWithDates = days
      .map(day => ({ date: day, price: prices[format(day, 'yyyy-MM-dd')] }))
      .filter(d => d.price !== undefined);
    
    const monthPrices = pricesWithDates.map(d => d.price);
    const lowest = monthPrices.length > 0 ? Math.min(...monthPrices) : 0;
    const highest = monthPrices.length > 0 ? Math.max(...monthPrices) : 0;
    const average = monthPrices.length > 0 ? Math.round(monthPrices.reduce((a, b) => a + b, 0) / monthPrices.length) : 0;
    const lowestDateEntry = pricesWithDates.find(d => d.price === lowest);
    
    return {
      days,
      lowestPrice: lowest,
      highestPrice: highest,
      averagePrice: average,
      lowestDate: lowestDateEntry?.date,
      priceCount: monthPrices.length,
    };
  }, [currentMonth, prices]);

  const getPriceLevel = useCallback((price: number): PriceLevel => {
    if (!lowestPrice || !highestPrice || lowestPrice === highestPrice) return 'medium';
    const ratio = (price - lowestPrice) / (highestPrice - lowestPrice);
    if (ratio <= 0.1) return 'lowest';
    if (ratio <= 0.35) return 'low';
    if (ratio <= 0.65) return 'medium';
    if (ratio <= 0.85) return 'high';
    return 'highest';
  }, [lowestPrice, highestPrice]);

  const goToPrevMonth = useCallback(() => setCurrentMonth(prev => subMonths(prev, 1)), []);
  const goToNextMonth = useCallback(() => setCurrentMonth(prev => addMonths(prev, 1)), []);
  
  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  const canGoPrev = !isBefore(subMonths(currentMonth, 1), startOfMonth(minDate));

  // Handle date click - show tooltip
  const handleDateClick = useCallback((day: Date, price: number, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setTooltipData({
      date: day,
      price,
      position: {
        x: rect.left + rect.width / 2 - 128, // Center the 256px tooltip
        y: rect.bottom + 8,
      },
    });
    onSelectDate?.(day);
  }, [onSelectDate]);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipData && calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setTooltipData(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [tooltipData]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent, day: Date) => {
    let newDate: Date | null = null;
    
    switch (e.key) {
      case 'ArrowLeft':
        newDate = addDays(day, -1);
        break;
      case 'ArrowRight':
        newDate = addDays(day, 1);
        break;
      case 'ArrowUp':
        newDate = addDays(day, -7);
        break;
      case 'ArrowDown':
        newDate = addDays(day, 7);
        break;
      case 'Home':
        newDate = startOfMonth(currentMonth);
        break;
      case 'End':
        newDate = endOfMonth(currentMonth);
        break;
      case 'PageUp':
        e.preventDefault();
        goToPrevMonth();
        return;
      case 'PageDown':
        e.preventDefault();
        goToNextMonth();
        return;
      case 'Escape':
        setTooltipData(null);
        return;
      default:
        return;
    }
    
    if (newDate) {
      e.preventDefault();
      const dateKey = format(newDate, 'yyyy-MM-dd');
      setFocusedDate(dateKey);
      const button = document.querySelector(`[data-date="${dateKey}"]`) as HTMLButtonElement;
      button?.focus();
    }
  }, [currentMonth, goToPrevMonth, goToNextMonth]);

  // Announce month changes
  const handleMonthChange = useCallback((direction: 'prev' | 'next') => {
    setTooltipData(null); // Close tooltip when changing months
    if (direction === 'prev') {
      goToPrevMonth();
    } else {
      goToNextMonth();
    }
  }, [goToPrevMonth, goToNextMonth]);

  return (
    <div ref={calendarRef} className="relative">
      <Card 
        className={cn('overflow-hidden shadow-lg', className)}
        role="application"
        aria-label="Price calendar - Hover over dates to see price details"
      >
        {/* Header */}
        <header className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 dark:from-emerald-600 dark:via-teal-600 dark:to-cyan-600" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          
          <div className="relative p-5">
            {/* Title row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Price Calendar</h2>
                  <p className="text-white/70 text-xs">Click any date for details</p>
                </div>
              </div>
              
              {priceCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur rounded-full">
                  <Plane className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                  <span className="text-white text-xs font-medium">{priceCount} prices</span>
                </div>
              )}
            </div>

            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMonthChange('prev')}
                disabled={!canGoPrev}
                aria-label={`Go to previous month, ${format(subMonths(currentMonth, 1), 'MMMM yyyy')}`}
                className="text-white hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed h-10 w-10 p-0 rounded-xl"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              <h3 
                className="text-xl font-bold text-white tracking-wide"
                id={`${calendarId}-month`}
                aria-live="polite"
                aria-atomic="true"
              >
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMonthChange('next')}
                aria-label={`Go to next month, ${format(addMonths(currentMonth, 1), 'MMMM yyyy')}`}
                className="text-white hover:bg-white/20 h-10 w-10 p-0 rounded-xl"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Stats bar */}
        {showStats && lowestPrice > 0 && (
          <div 
            className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 px-5 py-3.5 border-b border-emerald-100 dark:border-emerald-900/50"
            role="region"
            aria-label="Price statistics for this month"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Lowest price highlight */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/60 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">
                    {formatPrice(lowestPrice, currency)}
                  </span>
                </div>
                {lowestDate && (
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">
                    Best on <strong>{format(lowestDate, 'MMM d')}</strong>
                  </span>
                )}
              </div>
              
              {/* Other stats - desktop only */}
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-500 dark:text-neutral-400">Avg:</span>
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">{formatPrice(averagePrice, currency)}</span>
                </div>
                <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700" />
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-500 dark:text-neutral-400">Peak:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">{formatPrice(highestPrice, currency)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar grid */}
        <div className="p-4 sm:p-5">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-3" role="row">
            {WEEKDAYS.map((day, index) => {
              const isWeekend = index === 0 || index === 6;
              return (
                <div
                  key={day.key}
                  role="columnheader"
                  aria-label={day.full}
                  className={cn(
                    'text-center py-2 text-xs font-semibold rounded-lg',
                    isWeekend
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'
                      : 'text-neutral-500 dark:text-neutral-400'
                  )}
                >
                  <span className="sm:hidden">{day.short}</span>
                  <span className="hidden sm:inline">{day.medium}</span>
                </div>
              );
            })}
          </div>

          {/* Days grid */}
          <div 
            className="grid grid-cols-7 gap-1.5 sm:gap-2"
            role="grid"
            aria-labelledby={`${calendarId}-month`}
          >
            {/* Empty cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" role="gridcell" aria-hidden="true" />
            ))}
            
            {/* Day cells */}
            {days.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const price = prices[dateKey];
              const isPast = isBefore(day, minDate);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isLowestDay = lowestDate && isSameDay(day, lowestDate);
              const isTodayDate = isToday(day);
              const isHovered = hoveredDate === dateKey;
              const isFocused = focusedDate === dateKey;
              const isTooltipOpen = tooltipData && isSameDay(tooltipData.date, day);
              const priceLevel = price ? getPriceLevel(price) : null;
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              const style = priceLevel ? PRICE_STYLES[priceLevel] : null;
              
              return (
                <button
                  key={dateKey}
                  data-date={dateKey}
                  onClick={(e) => !isPast && price && handleDateClick(day, price, e)}
                  onMouseEnter={() => setHoveredDate(dateKey)}
                  onMouseLeave={() => setHoveredDate(null)}
                  onFocus={() => setFocusedDate(dateKey)}
                  onBlur={() => setFocusedDate(null)}
                  onKeyDown={(e) => handleKeyDown(e, day)}
                  disabled={isPast || !price}
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-disabled={isPast || !price}
                  aria-label={`${format(day, 'EEEE, MMMM d')}: ${price ? `${formatPrice(price, currency)}${isLowestDay ? ' - Best price!' : ''}. Click for details.` : 'No price available'}`}
                  tabIndex={isSelected || (isTodayDate && !selectedDate) ? 0 : -1}
                  className={cn(
                    'relative aspect-square rounded-xl flex flex-col items-center justify-center',
                    'transition-all duration-200 ease-out',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                    
                    // Disabled/past state
                    isPast && 'opacity-30 cursor-not-allowed',
                    
                    // No price state
                    !price && !isPast && 'bg-neutral-100 dark:bg-neutral-800/40 text-neutral-400 dark:text-neutral-600 cursor-default',
                    
                    // With price - apply level styles
                    price && !isPast && style && [
                      style.bg,
                      style.text,
                      'border',
                      style.border,
                      'cursor-pointer',
                      style.hover,
                      'hover:shadow-md hover:scale-[1.02]',
                      'active:scale-[0.98]',
                    ],
                    
                    // Selected/tooltip open state
                    (isSelected || isTooltipOpen) && 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-neutral-900 scale-105 shadow-lg z-10',
                    
                    // Hovered state
                    (isHovered || isFocused) && price && !isPast && !isSelected && !isTooltipOpen && 'shadow-lg scale-105 z-10',
                    
                    // Today indicator
                    isTodayDate && !isSelected && !isTooltipOpen && 'ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-1',
                    
                    // Focus ring
                    'focus-visible:ring-emerald-500 dark:focus-visible:ring-offset-neutral-900'
                  )}
                >
                  {/* Day number */}
                  <span className={cn(
                    'text-sm font-medium leading-none',
                    isTodayDate && 'font-bold',
                    isWeekend && !price && 'text-amber-500 dark:text-amber-400',
                    isLowestDay && 'text-emerald-700 dark:text-emerald-200'
                  )}>
                    {format(day, 'd')}
                  </span>
                  
                  {/* Price */}
                  {price && (
                    <span className={cn(
                      'text-[10px] sm:text-xs font-bold leading-tight mt-0.5',
                      isLowestDay && 'text-emerald-600 dark:text-emerald-300'
                    )}>
                      {currency === 'EUR' ? '€' : '$'}{price}
                    </span>
                  )}
                  
                  {/* Lowest price sparkle */}
                  {isLowestDay && (
                    <div 
                      className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"
                      aria-hidden="true"
                    >
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                  
                  {/* Today dot */}
                  {isTodayDate && (
                    <div 
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-blue-500 rounded text-[8px] text-white font-bold"
                      aria-hidden="true"
                    >
                      TODAY
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Price levels (click for details)
              </p>
              
              <div className="flex flex-wrap items-center gap-3" role="list" aria-label="Price level legend">
                {[
                  { level: 'lowest', label: 'Best' },
                  { level: 'low', label: 'Good' },
                  { level: 'medium', label: 'Avg' },
                  { level: 'high', label: 'High' },
                  { level: 'highest', label: 'Peak' },
                ].map(item => (
                  <div 
                    key={item.level}
                    className="flex items-center gap-1.5"
                    role="listitem"
                  >
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      PRICE_STYLES[item.level as PriceLevel].dot
                    )} aria-hidden="true" />
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Keyboard hint */}
          <p className="sr-only">
            Use arrow keys to navigate dates. Page Up and Page Down to change months. Enter or Space to view price details. Escape to close tooltip.
          </p>
        </div>
      </Card>
      
      {/* Price Tooltip */}
      {tooltipData && (
        <PriceTooltip
          date={tooltipData.date}
          price={tooltipData.price}
          currency={currency}
          priceLevel={getPriceLevel(tooltipData.price)}
          isLowest={lowestDate ? isSameDay(tooltipData.date, lowestDate) : false}
          avgPrice={averagePrice}
          position={tooltipData.position}
          onClose={() => setTooltipData(null)}
        />
      )}
    </div>
  );
}

// Generate mock prices for demo
export function generateMockPrices(startDate: Date, days: number = 60): Record<string, number> {
  const prices: Record<string, number> = {};
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateKey = format(date, 'yyyy-MM-dd');
    
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    const seed = dayOfMonth * 7 + dayOfWeek;
    const pseudoRandom = ((seed * 9301 + 49297) % 233280) / 233280;
    
    const basePrice = 45 + pseudoRandom * 60;
    const weekendMultiplier = isWeekend ? 1.4 : 1;
    
    if (seed % 10 !== 0) {
      prices[dateKey] = Math.round(basePrice * weekendMultiplier);
    }
  }
  
  return prices;
}
