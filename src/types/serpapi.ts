/**
 * SerpApi Google Flights API Response Types
 * @see https://serpapi.com/google-flights-api
 *
 * These types represent the response structure from SerpApi's Google Flights engine.
 * They are used internally by the SerpApiAdapter to transform data into our Flight model.
 */

// ===== AIRPORT TYPES =====

export interface SerpApiAirport {
  name: string;
  id: string; // IATA code (e.g., "MAD")
  time?: string; // Time in "HH:MM" format (24h) or full timestamp
}

// ===== FLIGHT LEG TYPES =====

export interface SerpApiFlightLeg {
  departure_airport: SerpApiAirport;
  arrival_airport: SerpApiAirport;
  duration: number; // Duration in minutes
  airplane: string; // Aircraft type (e.g., "Airbus A320")
  airline: string; // Full airline name
  airline_logo: string; // URL to airline logo
  travel_class: string; // "Economy", "Business", etc.
  flight_number: string; // Flight number (e.g., "IB 3456")
  legroom?: string; // e.g., "30 in"
  extensions?: string[]; // Additional info like "Wi-Fi", "USB outlet"
  often_delayed_by_over_30_min?: boolean;
  overnight?: boolean;
}

// ===== LAYOVER TYPES =====

export interface SerpApiLayover {
  duration: number; // Layover duration in minutes
  name: string; // Airport name
  id: string; // IATA code
  overnight?: boolean;
}

// ===== FLIGHT RESULT TYPES =====

export interface SerpApiFlight {
  flights: SerpApiFlightLeg[]; // Array of legs (segments)
  layovers?: SerpApiLayover[]; // Layover info between segments
  total_duration: number; // Total flight duration in minutes
  carbon_emissions?: {
    this_flight: number; // Grams of CO2
    typical_for_this_route: number;
    difference_percent: number;
  };
  airline_logo: string; // Main airline logo
  departure_token?: string; // Token for booking/details
  type?: string; // "Round trip", "One way"
  price?: number; // Price in selected currency
  extensions?: string[]; // Additional info
}

// ===== PRICE INSIGHT TYPES =====

export interface SerpApiPriceInsights {
  lowest_price: number;
  price_level: 'low' | 'typical' | 'high';
  typical_price_range: [number, number];
  price_history: Array<[number, number]>; // [timestamp, price]
}

// ===== SEARCH METADATA =====

export interface SerpApiSearchMetadata {
  id: string;
  status: string;
  json_endpoint: string;
  created_at: string;
  processed_at: string;
  google_flights_url: string;
  raw_html_file: string;
  total_time_taken: number;
}

export interface SerpApiSearchParameters {
  engine: string;
  hl: string; // Language
  gl: string; // Country
  type: string; // "1" for round trip, "2" for one way
  departure_id: string;
  arrival_id: string;
  outbound_date: string;
  return_date?: string;
  travel_class: string;
  adults: number;
  children?: number;
  infants_in_seat?: number;
  infants_on_lap?: number;
  stops?: string;
  currency: string;
}

// ===== BOOKING OPTIONS =====

export interface SerpApiBookingOption {
  book_with: string; // Airline/Agency name
  price: number;
  local_prices?: Array<{
    currency: string;
    price: number;
  }>;
  airline_logos?: string[];
}

// ===== BEST FLIGHTS (Highlighted by Google) =====

export interface SerpApiBestFlight extends SerpApiFlight {
  booking_options?: SerpApiBookingOption[];
}

// ===== OTHER FLIGHTS =====

export interface SerpApiOtherFlight extends SerpApiFlight {
  booking_options?: SerpApiBookingOption[];
}

// ===== MAIN API RESPONSE =====

export interface SerpApiFlightsResponse {
  search_metadata: SerpApiSearchMetadata;
  search_parameters: SerpApiSearchParameters;
  best_flights?: SerpApiBestFlight[];
  other_flights?: SerpApiOtherFlight[];
  price_insights?: SerpApiPriceInsights;
  airports?: Array<{
    departure: SerpApiAirport[];
    arrival: SerpApiAirport[];
  }>;
  error?: string;
}

// ===== ERROR TYPES =====

export type SerpApiErrorType =
  | 'INVALID_API_KEY'
  | 'RATE_LIMITED'
  | 'NO_RESULTS'
  | 'INVALID_PARAMS'
  | 'NETWORK_ERROR'
  | 'UNKNOWN';

export interface SerpApiError {
  type: SerpApiErrorType;
  message: string;
  retryable: boolean;
}
