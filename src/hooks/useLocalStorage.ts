'use client';

import { useState, useEffect, useCallback, useRef, startTransition } from 'react';

// Custom event for same-tab synchronization
const STORAGE_SYNC_EVENT = 'storage-sync';

interface StorageSyncEvent extends CustomEvent {
  detail: {
    key: string;
    value: unknown;
  };
}

// Helper to dispatch sync event for same-tab updates
function dispatchStorageSync(key: string, value: unknown) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(STORAGE_SYNC_EVENT, {
        detail: { key, value },
      })
    );
  }
}

/**
 * Custom hook for localStorage with SSR-safe hydration
 * Uses useState + useEffect pattern to avoid hydration mismatch
 * Supports real-time sync across components in the same tab
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, boolean] {
  // Always initialize with initialValue for SSR consistency
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Use ref to track if we've hydrated to prevent double hydration
  const hasHydrated = useRef(false);
  // Track the source of the update to prevent infinite loops
  const isInternalUpdate = useRef(false);
  
  // Hydrate from localStorage after mount - runs only once
  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;
    
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item) as T;
        // Use startTransition to avoid the lint error about synchronous setState
        startTransition(() => {
          setStoredValue(parsed);
        });
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    startTransition(() => {
      setIsHydrated(true);
    });
  }, [key]);
  
  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          startTransition(() => {
            setStoredValue(JSON.parse(e.newValue!) as T);
          });
        } catch {
          // Ignore parse errors
        }
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  // Listen for same-tab sync events
  useEffect(() => {
    const handleSync = (e: Event) => {
      const event = e as StorageSyncEvent;
      if (event.detail.key === key && !isInternalUpdate.current) {
        startTransition(() => {
          setStoredValue(event.detail.value as T);
        });
      }
    };
    
    window.addEventListener(STORAGE_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(STORAGE_SYNC_EVENT, handleSync);
  }, [key]);

  // Stable setValue function using useCallback with ref
  const valueRef = useRef(storedValue);
  
  // Update ref in effect (not during render)
  useEffect(() => {
    valueRef.current = storedValue;
  }, [storedValue]);
  
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const newValue = value instanceof Function ? value(valueRef.current) : value;
      isInternalUpdate.current = true;
      setStoredValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
      // Dispatch sync event for other components in the same tab
      dispatchStorageSync(key, newValue);
      // Reset flag after a microtask
      Promise.resolve().then(() => {
        isInternalUpdate.current = false;
      });
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue, isHydrated];
}

// Hook specifically for search history
export interface SearchHistoryItem {
  id: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  timestamp: number;
}

const MAX_HISTORY_ITEMS = 10;

export function useSearchHistory() {
  const [history, setHistory, isHydrated] = useLocalStorage<SearchHistoryItem[]>('flight-search-history', []);

  const addSearch = useCallback((item: Omit<SearchHistoryItem, 'id' | 'timestamp'>) => {
    setHistory((prev) => {
      // Check if this exact search already exists
      const exists = prev.find(
        (h) =>
          h.origin === item.origin &&
          h.destination === item.destination &&
          h.departureDate === item.departureDate
      );

      if (exists) {
        // Move to top and update timestamp
        const filtered = prev.filter((h) => h.id !== exists.id);
        return [
          { ...item, id: exists.id, timestamp: Date.now() },
          ...filtered,
        ].slice(0, MAX_HISTORY_ITEMS);
      }

      // Add new search
      const newItem: SearchHistoryItem = {
        ...item,
        id: `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      return [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
    });
  }, [setHistory]);

  const removeSearch = useCallback((id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }, [setHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  return { history, addSearch, removeSearch, clearHistory, isHydrated };
}

// Hook for favorite flights
export interface FavoriteFlight {
  id: string;
  flightId: string;
  airline: string;
  airlineCode: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  price: number;
  currency: string;
  duration: number;
  stops: number;
  savedAt: number;
}

const MAX_FAVORITES = 20;

export function useFavorites() {
  const [favorites, setFavorites, isHydrated] = useLocalStorage<FavoriteFlight[]>('flight-favorites', []);

  const addFavorite = useCallback((flight: Omit<FavoriteFlight, 'id' | 'savedAt'>) => {
    setFavorites((prev) => {
      // Check if already favorited
      if (prev.find((f) => f.flightId === flight.flightId)) {
        return prev;
      }

      const newFavorite: FavoriteFlight = {
        ...flight,
        id: `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        savedAt: Date.now(),
      };

      return [newFavorite, ...prev].slice(0, MAX_FAVORITES);
    });
  }, [setFavorites]);

  const removeFavorite = useCallback((flightId: string) => {
    setFavorites((prev) => prev.filter((f) => f.flightId !== flightId));
  }, [setFavorites]);

  // Use the actual favorites state for checking
  const isFavorite = useCallback((flightId: string) => {
    return favorites.some((f) => f.flightId === flightId);
  }, [favorites]);

  const toggleFavorite = useCallback((flight: Omit<FavoriteFlight, 'id' | 'savedAt'>) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.flightId === flight.flightId);
      if (exists) {
        return prev.filter((f) => f.flightId !== flight.flightId);
      }
      
      const newFavorite: FavoriteFlight = {
        ...flight,
        id: `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        savedAt: Date.now(),
      };
      return [newFavorite, ...prev].slice(0, MAX_FAVORITES);
    });
  }, [setFavorites]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, [setFavorites]);

  return { favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite, clearFavorites, isHydrated };
}
