export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
}

export interface Airline {
  code: string;
  name: string;
  logo?: string;
}

export interface Price {
  amount: number;
  currency: string;
}

export interface FlightSegment {
  departure: {
    airport: Airport;
    time: string;
  };
  arrival: {
    airport: Airport;
    time: string;
  };
  duration: number; // in minutes
  flightNumber: string;
  airline: Airline;
}

export interface Flight {
  id: string;
  segments: FlightSegment[];
  airline: Airline;
  origin: Airport;
  destination: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: number; // total in minutes
  stops: number;
  price: Price;
  seatsLeft?: number;
}

export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  passengers: number;
  cabinClass?: 'economy' | 'business' | 'first';
}

export interface FilterState {
  stops: number[]; // [0, 1, 2] = all, [0] = non-stop only
  priceRange: [number, number];
  airlines: string[]; // airline codes
  departureTimeRange: [number, number]; // hours 0-24
  sortBy: 'price' | 'duration' | 'departure';
}

export interface FlightSearchState {
  flights: Flight[];
  filteredFlights: Flight[];
  filters: FilterState;
  isLoading: boolean;
  error: string | null;
  searchParams: SearchParams | null;
}

export interface PriceDataPoint {
  date: string;
  price: number;
  flightCount: number;
}
