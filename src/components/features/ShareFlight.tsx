'use client';

import { useState, useCallback } from 'react';
import { Flight } from '@/types/flight';
import { Share2, Check, Mail, MessageCircle, Twitter, Facebook, Link2 } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

interface ShareFlightProps {
  flight: Flight;
  className?: string;
}

export function ShareFlight({ flight, className }: ShareFlightProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const flightUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/search?flightId=${flight.id}` 
    : '';
  
  const shareText = `Check out this flight: ${flight.origin.city} to ${flight.destination.city} for ${formatPrice(flight.price.amount, flight.price.currency)} with ${flight.airline.name}!`;
  
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(flightUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [flightUrl]);

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/50',
      url: `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + flightUrl)}`,
    },
    {
      name: 'Email',
      icon: Mail,
      color: 'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/50',
      url: `mailto:?subject=${encodeURIComponent(`Flight deal: ${flight.origin.city} to ${flight.destination.city}`)}&body=${encodeURIComponent(shareText + '\n\n' + flightUrl)}`,
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/50',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(flightUrl)}`,
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(flightUrl)}`,
    },
  ];

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Flight: ${flight.origin.city} to ${flight.destination.city}`,
          text: shareText,
          url: flightUrl,
        });
        setIsOpen(false);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  }, [flight.origin.city, flight.destination.city, shareText, flightUrl]);

  const handleClick = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      handleNativeShare();
    } else {
      setIsOpen((prev) => !prev);
    }
  }, [handleNativeShare]);

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={handleClick}
        className={cn(
          'p-2 rounded-lg transition-all duration-150',
          'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100',
          'dark:hover:text-neutral-300 dark:hover:bg-neutral-800',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500'
        )}
        aria-label="Share flight"
        aria-expanded={isOpen}
      >
        <Share2 className="w-4 h-4" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu */}
          <div className="absolute right-0 top-full mt-2 z-50 w-56 bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-3 border-b border-neutral-100 dark:border-neutral-700">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Share this flight
              </p>
            </div>
            
            <div className="p-2">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => handleShare(option.url)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm',
                    'text-neutral-700 dark:text-neutral-300',
                    'transition-colors',
                    option.color
                  )}
                >
                  <option.icon className="w-4 h-4" />
                  {option.name}
                </button>
              ))}
              
              <div className="border-t border-neutral-100 dark:border-neutral-700 my-2" />
              
              <button
                onClick={handleCopyLink}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm',
                  'text-neutral-700 dark:text-neutral-300',
                  'hover:bg-neutral-100 dark:hover:bg-neutral-700',
                  'transition-colors',
                  copied && 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    Copy link
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
