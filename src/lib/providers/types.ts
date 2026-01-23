/**
 * Flight Search Provider Interface
 *
 * This module defines the abstract contract for flight search providers.
 * It enables swapping between different API backends (SerpApi, Amadeus, Skyscanner, etc.)
 * without changing the consumer code (API routes, hooks, UI components).
 *
 * Design Pattern: Strategy Pattern + Adapter Pattern
 */

import { Flight, SearchParams } from '@/types/flight';

// ===== PROVIDER RESULT TYPES =====

export interface FlightSearchResult {
  flights: Flight[];
  metadata?: {
    totalResults?: number;
    searchId?: string;
    cached?: boolean;
    priceInsights?: {
      lowestPrice: number;
      priceLevel: 'low' | 'typical' | 'high';
      typicalPriceRange: [number, number];
    };
  };
}

export interface FlightSearchError {
  type: 'INVALID_CREDENTIALS' | 'RATE_LIMITED' | 'NO_RESULTS' | 'INVALID_PARAMS' | 'NETWORK_ERROR' | 'UNKNOWN';
  message: string;
  retryable: boolean;
  originalError?: unknown;
}

// ===== PROVIDER CONFIGURATION =====

export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  maxResults?: number;
  currency?: string;
  language?: string;
  country?: string;
}

// ===== ABSTRACT PROVIDER INTERFACE =====

/**
 * Abstract interface for flight search providers.
 * All API adapters must implement this interface.
 *
 * @example
 * ```typescript
 * const provider: FlightSearchProvider = new SerpApiAdapter(config);
 * const result = await provider.searchFlights(params);
 * ```
 */
export interface FlightSearchProvider {
  /**
   * Unique identifier for this provider
   */
  readonly providerName: string;

  /**
   * Search for flights based on the given parameters
   * @param params Search parameters (origin, destination, dates, etc.)
   * @returns Promise resolving to flights or throwing FlightSearchError
   */
  searchFlights(params: SearchParams): Promise<FlightSearchResult>;

  /**
   * Check if the provider is properly configured and ready to use
   * @returns true if the provider can make API calls
   */
  isConfigured(): boolean;

  /**
   * Parse provider-specific errors into a standardized format
   * @param error The raw error from the API
   * @returns Standardized FlightSearchError
   */
  parseError(error: unknown): FlightSearchError;
}

// ===== PROVIDER FACTORY =====

export type ProviderType = 'serpapi' | 'amadeus' | 'mock';

/**
 * Factory function type for creating provider instances
 */
export type ProviderFactory = (config?: Partial<ProviderConfig>) => FlightSearchProvider;

// ===== REGISTRY FOR PROVIDERS =====

const providerRegistry = new Map<ProviderType, ProviderFactory>();

/**
 * Register a new provider factory
 */
export function registerProvider(type: ProviderType, factory: ProviderFactory): void {
  providerRegistry.set(type, factory);
}

/**
 * Get a provider instance by type
 */
export function getProvider(type: ProviderType, config?: Partial<ProviderConfig>): FlightSearchProvider | null {
  const factory = providerRegistry.get(type);
  if (!factory) {
    return null;
  }
  return factory(config);
}

/**
 * Get all registered provider types
 */
export function getAvailableProviders(): ProviderType[] {
  return Array.from(providerRegistry.keys());
}
