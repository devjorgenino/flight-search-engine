'use client';

import { useState, useEffect } from 'react';
import { Timer, Flame, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfferCountdownProps {
  /** End time in ISO format or timestamp */
  endTime?: string | number;
  /** Duration in minutes from now (alternative to endTime) */
  durationMinutes?: number;
  /** Show urgency indicators */
  showUrgency?: boolean;
  /** Compact mode for card display */
  compact?: boolean;
  className?: string;
  onExpire?: () => void;
}

export function OfferCountdown({ 
  endTime, 
  durationMinutes = 30,
  showUrgency = true,
  compact = false,
  className,
  onExpire 
}: OfferCountdownProps) {
  // State for initial target time calculation  
  const [targetTime] = useState(() => {
    if (endTime) {
      return typeof endTime === 'string' ? new Date(endTime).getTime() : endTime;
    }
    // Use durationMinutes
    return Date.now() + durationMinutes * 60 * 1000;
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = targetTime - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  });

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      const diff = targetTime - Date.now();
      const newTimeLeft = Math.max(0, Math.floor(diff / 1000));
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft <= 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime, timeLeft, onExpire]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const isUrgent = timeLeft < 600; // Less than 10 minutes
  const isCritical = timeLeft < 300; // Less than 5 minutes

  if (timeLeft <= 0) {
    return (
      <div className={cn(
        'inline-flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500',
        className
      )}>
        <Timer className="w-3.5 h-3.5" />
        <span className="text-xs">Offer expired</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div 
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
          'transition-colors duration-300',
          isCritical 
            ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 animate-pulse'
            : isUrgent 
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
          className
        )}
      >
        {isCritical ? (
          <Flame className="w-3 h-3" />
        ) : isUrgent ? (
          <Zap className="w-3 h-3" />
        ) : (
          <Timer className="w-3 h-3" />
        )}
        <span className="tabular-nums">
          {hours > 0 && `${hours}:`}
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl',
        'transition-colors duration-300',
        isCritical 
          ? 'bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/50 dark:to-orange-950/50 border border-red-200 dark:border-red-800'
          : isUrgent 
            ? 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/50 dark:to-yellow-950/50 border border-amber-200 dark:border-amber-800'
            : 'bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 border border-emerald-200 dark:border-emerald-800',
        className
      )}
    >
      {showUrgency && (
        <div className={cn(
          'flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider',
          isCritical 
            ? 'text-red-600 dark:text-red-400'
            : isUrgent 
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-emerald-600 dark:text-emerald-400'
        )}>
          {isCritical ? (
            <>
              <Flame className="w-4 h-4 animate-pulse" />
              <span>Hurry! Price expires soon</span>
            </>
          ) : isUrgent ? (
            <>
              <Zap className="w-4 h-4" />
              <span>Limited time offer</span>
            </>
          ) : (
            <>
              <Timer className="w-4 h-4" />
              <span>Special price valid for</span>
            </>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        {hours > 0 && (
          <>
            <TimeUnit value={hours} label="hrs" urgent={isCritical} />
            <span className="text-2xl font-light text-neutral-300 dark:text-neutral-600">:</span>
          </>
        )}
        <TimeUnit value={minutes} label="min" urgent={isCritical} />
        <span className="text-2xl font-light text-neutral-300 dark:text-neutral-600">:</span>
        <TimeUnit value={seconds} label="sec" urgent={isCritical} />
      </div>
    </div>
  );
}

function TimeUnit({ value, label, urgent }: { value: number; label: string; urgent: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div 
        className={cn(
          'w-14 h-14 rounded-lg flex items-center justify-center',
          'font-bold text-2xl tabular-nums',
          'transition-colors duration-300',
          urgent
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm'
        )}
      >
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 mt-1 uppercase">
        {label}
      </span>
    </div>
  );
}
