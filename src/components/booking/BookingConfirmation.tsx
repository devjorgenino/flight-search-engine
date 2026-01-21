'use client';

import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Flight } from '@/types/flight';
import { formatDuration, formatTime, formatPrice, cn } from '@/lib/utils';
import { CheckCircle, Plane, X } from 'lucide-react';

interface BookingConfirmationProps {
  flight: Flight | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BookingConfirmation({ flight, isOpen, onClose }: BookingConfirmationProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store previous focus and handle focus trap
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the dialog after animation
      const timer = setTimeout(() => {
        dialogRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto redirect after confirmation
  useEffect(() => {
    if (isOpen && flight) {
      const redirectTimer = setTimeout(() => {
        onClose();
        router.push('/');
      }, 3000);

      return () => clearTimeout(redirectTimer);
    }
  }, [isOpen, flight, onClose, router]);

  // Restore focus on close
  useEffect(() => {
    if (!isOpen && previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      router.push('/');
    }
  }, [onClose, router]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Handle immediate close
  const handleClose = useCallback(() => {
    onClose();
    router.push('/');
  }, [onClose, router]);

  if (!isOpen || !flight) return null;

  const content = (
    <>
      {/* Backdrop with fade */}
      <div 
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
          'animate-in fade-in duration-300'
        )}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-description"
        tabIndex={-1}
        className={cn(
          'fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-md mx-4',
          'animate-in zoom-in-95 fade-in duration-300'
        )}
      >
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden">
          {/* Success header with animation */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-8 text-center relative overflow-hidden">
            {/* Animated circles background */}
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full animate-pulse" />
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full animate-pulse delay-150" />
            </div>
            
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Close and go to home"
            >
              <X className="w-4 h-4 text-white" aria-hidden="true" />
            </button>
            
            {/* Success icon with animation */}
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
              <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-500" aria-hidden="true" />
              </div>
            </div>
            
            <h2 
              id="confirmation-title" 
              className="text-2xl font-bold text-white mb-2"
            >
              Flight Selected!
            </h2>
            <p className="text-emerald-100 text-sm">
              Your flight has been successfully selected
            </p>
          </div>

          {/* Flight details */}
          <div className="p-6">
            <div id="confirmation-description" className="space-y-4">
              {/* Route */}
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {flight.origin.code}
                  </p>
                  <p className="text-sm text-neutral-500">{flight.origin.city}</p>
                </div>
                
                <div className="flex-1 flex items-center justify-center px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-neutral-300 dark:bg-neutral-700" />
                    <Plane className="w-5 h-5 text-emerald-500 rotate-90" aria-hidden="true" />
                    <div className="h-px w-8 bg-neutral-300 dark:bg-neutral-700" />
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {flight.destination.code}
                  </p>
                  <p className="text-sm text-neutral-500">{flight.destination.city}</p>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-neutral-100 dark:border-neutral-800">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Airline</p>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {flight.airline.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Duration</p>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {formatDuration(flight.duration)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Departure</p>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {formatTime(flight.departureTime)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">Arrival</p>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {formatTime(flight.arrivalTime)}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Total Price</span>
                <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatPrice(flight.price.amount, flight.price.currency)}
                </span>
              </div>
            </div>

            {/* Redirect notice */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Redirecting to home in 3 seconds...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Use portal to render at document root for proper stacking
  if (typeof window === 'undefined') return null;
  
  return createPortal(content, document.body);
}
