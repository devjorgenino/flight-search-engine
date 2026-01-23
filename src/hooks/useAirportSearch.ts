'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Airport } from '@/types/flight';

interface AirportSearchState {
  results: Airport[];
  popularAirports: Airport[];
  isLoading: boolean;
  error: string | null;
}

interface UseAirportSearchOptions {
  excludeCode?: string;
  debounceMs?: number;
  limit?: number;
}

/**
 * Hook for searching airports via the API
 * 
 * @example
 * ```tsx
 * const { search, results, isLoading, popularAirports } = useAirportSearch();
 * 
 * // Search airports
 * search('mad'); // Triggers API call
 * 
 * // Access popular airports (fetched on mount)
 * console.log(popularAirports);
 * ```
 */
export function useAirportSearch(options: UseAirportSearchOptions = {}) {
  const { excludeCode, debounceMs = 150, limit = 10 } = options;
  
  const [state, setState] = useState<AirportSearchState>({
    results: [],
    popularAirports: [],
    isLoading: false,
    error: null,
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch popular airports on mount
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const params = new URLSearchParams({ popular: 'true', limit: '6' });
        if (excludeCode) {
          params.set('exclude', excludeCode);
        }
        
        const response = await fetch(`/api/airports?${params.toString()}`);
        const data = await response.json();
        
        if (response.ok && data.data) {
          setState((prev) => ({ ...prev, popularAirports: data.data }));
        }
      } catch (err) {
        console.error('Failed to fetch popular airports:', err);
      }
    };
    
    fetchPopular();
  }, [excludeCode]);
  
  // Search airports with debouncing
  const search = useCallback(
    async (query: string) => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Clear results if query is too short
      if (query.length < 2) {
        setState((prev) => ({ ...prev, results: [], isLoading: false, error: null }));
        return;
      }
      
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      // Debounce the API call
      debounceTimerRef.current = setTimeout(async () => {
        const controller = new AbortController();
        abortControllerRef.current = controller;
        
        try {
          const params = new URLSearchParams({
            q: query,
            limit: String(limit),
          });
          
          if (excludeCode) {
            params.set('exclude', excludeCode);
          }
          
          const response = await fetch(`/api/airports?${params.toString()}`, {
            signal: controller.signal,
          });
          
          const data = await response.json();
          
          if (response.ok && data.data) {
            setState((prev) => ({
              ...prev,
              results: data.data,
              isLoading: false,
              error: null,
            }));
          } else {
            setState((prev) => ({
              ...prev,
              results: [],
              isLoading: false,
              error: data.error || 'Failed to search airports',
            }));
          }
        } catch (err) {
          // Ignore abort errors
          if (err instanceof DOMException && err.name === 'AbortError') {
            return;
          }
          
          setState((prev) => ({
            ...prev,
            results: [],
            isLoading: false,
            error: 'Failed to search airports',
          }));
        }
      }, debounceMs);
    },
    [excludeCode, limit, debounceMs]
  );
  
  // Clear search results
  const clearResults = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState((prev) => ({ ...prev, results: [], isLoading: false, error: null }));
  }, []);
  
  // Get airport by code
  const getAirportByCode = useCallback(async (code: string): Promise<Airport | null> => {
    try {
      const response = await fetch(`/api/airports?code=${code}`);
      const data = await response.json();
      
      if (response.ok && data.data) {
        return data.data;
      }
      return null;
    } catch {
      return null;
    }
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);
  
  return {
    // State
    results: state.results,
    popularAirports: state.popularAirports,
    isLoading: state.isLoading,
    error: state.error,
    
    // Actions
    search,
    clearResults,
    getAirportByCode,
  };
}
