/**
 * Flight Search Providers
 *
 * This module exports all available flight search providers and utilities.
 * Use the getFlightProvider() function to get the configured provider.
 */

export * from './types';
export * from './serpapi-adapter';

import { FlightSearchProvider, ProviderConfig, ProviderType, getProvider } from './types';
import { SerpApiAdapter } from './serpapi-adapter';

// ===== PROVIDER RESOLUTION =====

/**
 * Determine the active provider type based on environment configuration
 */
export function getActiveProviderType(): ProviderType {
  // Check for explicit provider setting
  const providerEnv = process.env.FLIGHT_PROVIDER?.toLowerCase();
  if (providerEnv === 'serpapi' || providerEnv === 'amadeus' || providerEnv === 'mock') {
    return providerEnv as ProviderType;
  }

  // Check for mock mode
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return 'mock';
  }

  // Check for SerpApi key
  if (process.env.SERPAPI_API_KEY) {
    return 'serpapi';
  }

  // Check for Amadeus keys (legacy fallback)
  if (process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET) {
    return 'amadeus';
  }

  // Default to mock if no API keys configured
  return 'mock';
}

/**
 * Get the configured flight search provider.
 *
 * This function automatically selects the appropriate provider based on:
 * 1. FLIGHT_PROVIDER environment variable (explicit selection)
 * 2. NEXT_PUBLIC_USE_MOCK environment variable (mock mode)
 * 3. SERPAPI_API_KEY presence (SerpApi)
 * 4. AMADEUS_API_KEY presence (Amadeus legacy)
 * 5. Falls back to mock provider if nothing configured
 *
 * @param config Optional configuration overrides
 * @returns The configured FlightSearchProvider instance
 */
export function getFlightProvider(config?: Partial<ProviderConfig>): FlightSearchProvider {
  const providerType = getActiveProviderType();

  // For SerpApi, create adapter directly
  if (providerType === 'serpapi') {
    return new SerpApiAdapter({
      apiKey: process.env.SERPAPI_API_KEY,
      ...config,
    });
  }

  // Try to get from registry
  const provider = getProvider(providerType, config);
  if (provider) {
    return provider;
  }

  // Fallback to SerpApi adapter if nothing else works
  return new SerpApiAdapter(config);
}

/**
 * Check if any real API provider is configured
 */
export function hasRealProvider(): boolean {
  const type = getActiveProviderType();
  return type === 'serpapi' || type === 'amadeus';
}
