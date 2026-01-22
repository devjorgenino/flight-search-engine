'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Plane } from 'lucide-react';

interface FlightLoadingAnimationProps {
  className?: string;
  variant?: 'full' | 'compact' | 'inline';
  message?: string;
}

export function FlightLoadingAnimation({ 
  className, 
  variant = 'full',
  message = 'Searching for the best flights...'
}: FlightLoadingAnimationProps) {
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="relative w-6 h-6">
          <Plane className="w-6 h-6 text-emerald-500 animate-plane-fly" />
        </div>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">{message}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-col items-center gap-3 py-8', className)}>
        <div className="relative">
          {/* Clouds */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-8 flex gap-2">
              <div className="w-3 h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-cloud-1" />
              <div className="w-4 h-4 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-cloud-2" />
              <div className="w-3 h-3 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-cloud-3" />
            </div>
          </div>
          
          {/* Plane */}
          <div className="relative z-10">
            <Plane className="w-10 h-10 text-emerald-500 animate-plane-bounce" />
          </div>
        </div>
        
        <p className="text-sm text-neutral-500 dark:text-neutral-400 animate-pulse">
          {message}
        </p>
      </div>
    );
  }

  // Full variant - simplified with centered plane
  return (
    <div className={cn(
      'flex flex-col items-center justify-center gap-6 py-16',
      className
    )}>
      {/* Animated scene */}
      <div className="relative w-64 h-32">
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100 to-sky-50 dark:from-sky-950/50 dark:to-neutral-900 rounded-2xl overflow-hidden">
          {/* Sun/Moon */}
          <div className="absolute top-4 right-8 w-8 h-8 bg-amber-300 dark:bg-neutral-600 rounded-full opacity-60" />
          
          {/* Clouds layer 1 */}
          <div className="absolute top-6 animate-clouds-slow">
            <Cloud className="w-16 h-8" />
          </div>
          <div className="absolute top-12 left-32 animate-clouds-medium">
            <Cloud className="w-12 h-6" />
          </div>
          <div className="absolute top-4 left-48 animate-clouds-fast">
            <Cloud className="w-10 h-5" />
          </div>
          
          {/* Flight path - dashed line */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 256 128">
            <path
              d="M 20 70 Q 128 50 236 70"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="6 4"
              className="text-emerald-300 dark:text-emerald-700"
            />
          </svg>
          
          {/* Centered floating plane */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative animate-plane-float">
              <div className="absolute -inset-3 bg-emerald-400/30 rounded-full blur-lg" />
              <Plane className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading text */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          {message}
        </p>
        <div className="flex items-center justify-center gap-1">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce-delay-0" />
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce-delay-1" />
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce-delay-2" />
        </div>
      </div>
      
      {/* Fun facts */}
      <LoadingFacts />
    </div>
  );
}

function Cloud({ className }: { className?: string }) {
  return (
    <svg className={cn('text-white dark:text-neutral-700', className)} viewBox="0 0 64 32">
      <ellipse cx="20" cy="20" rx="16" ry="10" fill="currentColor" />
      <ellipse cx="36" cy="16" rx="14" ry="12" fill="currentColor" />
      <ellipse cx="50" cy="20" rx="12" ry="8" fill="currentColor" />
    </svg>
  );
}

function LoadingFacts() {
  const [factIndex, setFactIndex] = useState(0);
  
  const facts = [
    "The busiest airport is Hartsfield-Jackson Atlanta",
    "A Boeing 747 has over 6 million parts",
    "The shortest flight is 47 seconds (Scotland)",
    "Airplane air is drier than the Sahara Desert",
    "Pilots and co-pilots eat different meals",
  ];
  
  // Rotate facts every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % facts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [facts.length]);
  
  return (
    <div className="max-w-xs text-center">
      <p className="text-xs text-neutral-400 dark:text-neutral-500 animate-fade-in">
        Did you know? {facts[factIndex]}
      </p>
    </div>
  );
}

// Skeleton variants for flight cards
export function FlightCardLoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 md:p-5 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Airline */}
        <div className="flex items-center gap-3 md:w-28 flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
          <div className="md:hidden w-20 h-4 bg-neutral-200 dark:bg-neutral-800 rounded" />
        </div>

        {/* Flight times */}
        <div className="flex-1 flex items-center gap-4">
          <div className="text-center md:text-left min-w-[60px]">
            <div className="w-12 h-6 bg-neutral-200 dark:bg-neutral-800 rounded mb-1" />
            <div className="w-8 h-4 bg-neutral-100 dark:bg-neutral-800 rounded" />
          </div>

          <div className="flex-1 flex flex-col items-center px-2">
            <div className="w-16 h-3 bg-neutral-100 dark:bg-neutral-800 rounded mb-2" />
            <div className="w-full h-px bg-neutral-200 dark:bg-neutral-700 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-neutral-200 dark:bg-neutral-800 rounded-full" />
            </div>
            <div className="w-12 h-3 bg-neutral-100 dark:bg-neutral-800 rounded mt-2" />
          </div>

          <div className="text-center md:text-right min-w-[60px]">
            <div className="w-12 h-6 bg-neutral-200 dark:bg-neutral-800 rounded mb-1" />
            <div className="w-8 h-4 bg-neutral-100 dark:bg-neutral-800 rounded" />
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between md:flex-col md:items-end gap-3 md:w-32 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100 dark:border-neutral-800">
          <div className="w-20 h-8 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
            <div className="hidden md:block w-16 h-8 bg-emerald-200 dark:bg-emerald-900 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlightListLoadingSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <FlightCardLoadingSkeleton key={i} />
      ))}
    </div>
  );
}
