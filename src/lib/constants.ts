import { Airline, Airport, DepartureTimeSlot } from '@/types/flight';

export const AIRLINES: Record<string, Airline> = {
  IB: { code: 'IB', name: 'Iberia' },
  VY: { code: 'VY', name: 'Vueling' },
  FR: { code: 'FR', name: 'Ryanair' },
  U2: { code: 'U2', name: 'easyJet' },
  LH: { code: 'LH', name: 'Lufthansa' },
  AF: { code: 'AF', name: 'Air France' },
  BA: { code: 'BA', name: 'British Airways' },
  KL: { code: 'KL', name: 'KLM' },
  AZ: { code: 'AZ', name: 'ITA Airways' },
  UX: { code: 'UX', name: 'Air Europa' },
};

export const AIRPORTS: Airport[] = [
  { code: 'MAD', city: 'Madrid', name: 'Adolfo Suárez Madrid-Barajas', country: 'Spain' },
  { code: 'BCN', city: 'Barcelona', name: 'Barcelona-El Prat', country: 'Spain' },
  { code: 'LHR', city: 'London', name: 'Heathrow', country: 'United Kingdom' },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle', country: 'France' },
  { code: 'FCO', city: 'Rome', name: 'Fiumicino', country: 'Italy' },
  { code: 'AMS', city: 'Amsterdam', name: 'Schiphol', country: 'Netherlands' },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany' },
  { code: 'MUC', city: 'Munich', name: 'Munich Airport', country: 'Germany' },
  { code: 'LIS', city: 'Lisbon', name: 'Humberto Delgado', country: 'Portugal' },
  { code: 'ATH', city: 'Athens', name: 'Eleftherios Venizelos', country: 'Greece' },
  { code: 'VIE', city: 'Vienna', name: 'Vienna International', country: 'Austria' },
  { code: 'ZRH', city: 'Zurich', name: 'Zurich Airport', country: 'Switzerland' },
  { code: 'BRU', city: 'Brussels', name: 'Brussels Airport', country: 'Belgium' },
  { code: 'DUB', city: 'Dublin', name: 'Dublin Airport', country: 'Ireland' },
  { code: 'CPH', city: 'Copenhagen', name: 'Copenhagen Airport', country: 'Denmark' },
  { code: 'OSL', city: 'Oslo', name: 'Oslo Gardermoen', country: 'Norway' },
  { code: 'ARN', city: 'Stockholm', name: 'Stockholm Arlanda', country: 'Sweden' },
  { code: 'HEL', city: 'Helsinki', name: 'Helsinki-Vantaa', country: 'Finland' },
  { code: 'WAW', city: 'Warsaw', name: 'Warsaw Chopin', country: 'Poland' },
  { code: 'PRG', city: 'Prague', name: 'Václav Havel', country: 'Czech Republic' },
];

// Time slot definitions with hour ranges
export const TIME_SLOT_RANGES: Record<DepartureTimeSlot, { start: number; end: number; label: string; description: string }> = {
  early: { start: 0, end: 6, label: 'Early', description: '12am - 6am' },
  morning: { start: 6, end: 12, label: 'Morning', description: '6am - 12pm' },
  afternoon: { start: 12, end: 18, label: 'Afternoon', description: '12pm - 6pm' },
  evening: { start: 18, end: 24, label: 'Evening', description: '6pm - 12am' },
};

// All time slots for "select all" state
export const ALL_TIME_SLOTS: DepartureTimeSlot[] = ['early', 'morning', 'afternoon', 'evening'];

export const DEFAULT_FILTERS = {
  stops: [0, 1, 2],
  priceRange: [0, 2000] as [number, number],
  airlines: [] as string[],
  departureTimeSlots: [...ALL_TIME_SLOTS] as DepartureTimeSlot[],
  sortBy: 'price' as const,
};

export const CABIN_CLASSES = [
  { value: 'economy', label: 'Economy' },
  { value: 'business', label: 'Business' },
  { value: 'first', label: 'First Class' },
];
