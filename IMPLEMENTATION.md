# FlightSearch - Implementation Guide

## Overview

FlightSearch is a modern flight search engine built as a technical challenge, demonstrating React 19 patterns, TypeScript proficiency, and UX best practices. The application uses **SerpApi (Google Flights API)** to fetch real flight data.

---

## Table of Contents

1. [Architecture Decisions](#architecture-decisions)
2. [Provider Pattern Architecture](#provider-pattern-architecture)
3. [State Management](#state-management)
4. [API Integration](#api-integration)
5. [UI/UX Design](#uiux-design)
6. [Key Components](#key-components)
7. [Accessibility](#accessibility)
8. [Performance Optimizations](#performance-optimizations)
9. [Data Flow](#data-flow)
10. [LocalStorage Sync System](#localstorage-sync-system)

---

## Architecture Decisions

### Why Next.js 16 with App Router?

- **Server Components**: Reduces client bundle size for static content
- **API Routes**: Built-in backend for API proxy (hides credentials)
- **Built-in optimizations**: Image optimization, code splitting, prefetching
- **TypeScript first**: Excellent DX with strict type checking
- **React 19**: Latest React features including improved Suspense

### Why Zustand over Redux/Context?

| Aspect      | Zustand   | Redux     | Context       |
| ----------- | --------- | --------- | ------------- |
| Bundle size | ~1KB      | ~7KB      | 0 (built-in)  |
| Boilerplate | Minimal   | High      | Medium        |
| Re-renders  | Selective | Selective | All consumers |
| DevTools    | Yes       | Yes       | Limited       |

**Decision**: Zustand provides the right balance of simplicity and power. Selective subscriptions prevent unnecessary re-renders when filters change.

```typescript
// Only re-renders when comparisonIds changes
const comparisonIds = useFlightStore((state) => state.comparisonIds);
```

### Why Tailwind CSS 4?

- **Utility-first**: Rapid iteration without context switching
- **CSS variables**: Easy theming with `--color-*` tokens
- **Dark mode**: Built-in `dark:` variant support
- **Tree shaking**: Only ships used styles

---

## Provider Pattern Architecture

### Why a Provider Pattern?

The application uses an abstract provider pattern that allows swapping flight data sources without changing application logic:

```
┌──────────────────────────────────────────────────────────┐
│                    FlightProvider                         │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Abstract Interface                     │  │
│  │  searchFlights(params): Promise<Flight[]>          │  │
│  │  getAirports(query): Promise<Airport[]>            │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
   │   SerpApi   │    │    Mock     │    │   Future    │
   │   Adapter   │    │  Provider   │    │  Provider   │
   └─────────────┘    └─────────────┘    └─────────────┘
```

### Provider Implementation

```typescript
// src/lib/providers/types.ts
export interface FlightProvider {
  name: string;
  searchFlights(params: SearchParams): Promise<FlightSearchResult>;
}

// src/lib/providers/serpapi-adapter.ts
export class SerpApiProvider implements FlightProvider {
  name = "SerpApi (Google Flights)";

  async searchFlights(params: SearchParams): Promise<FlightSearchResult> {
    // Transform params to SerpApi format
    // Call Google Flights via SerpApi
    // Transform response to our Flight type
  }
}

// src/lib/providers/index.ts
export function getFlightProvider(): FlightProvider {
  if (process.env.NEXT_PUBLIC_USE_MOCK === "true") {
    return new MockProvider();
  }
  return new SerpApiProvider();
}
```

### Benefits

1. **Testability**: Easy to swap mock provider for tests
2. **Flexibility**: Can add new providers (Skyscanner, Kiwi, etc.)
3. **Separation of concerns**: API logic isolated from UI
4. **Environment-based**: Mock in development, real API in production

---

## State Management

### Store Structure

```
FlightStore
├── Data
│   ├── flights[]           # Raw API results
│   ├── searchParams         # Current search criteria
│   └── filters              # User filter preferences
│
├── UI State
│   ├── isLoading            # API request in progress
│   ├── error                # Error message if any
│   ├── comparisonIds[]      # Selected flight IDs for comparison
│   ├── hoveredFlightId      # Flight being hovered (for map)
│   ├── selectedMapFlightId  # Flight selected to show on map
│   ├── isComparisonOpen     # Drawer visibility
│   └── selectedFlight       # Flight chosen for booking
│
└── Computed (getters)
    ├── getFilteredFlights() # Applies all filters + sorting
    ├── getAvailableAirlines() # Unique airlines with logos
    ├── getPriceRange()       # Min/max for slider
    └── getComparisonFlights() # Resolved flight objects
```

### Why Computed Values in Store?

Instead of deriving in components, we compute in the store:

```typescript
// In store - computed once, cached until dependencies change
getFilteredFlights: () => {
  const { flights, filters } = get();
  return flights
    .filter(/* stops */)
    .filter(/* price */)
    .filter(/* airlines */)
    .filter(/* departure time */)
    .sort(/* by selected criteria */);
};
```

**Benefits**:

- Single source of truth
- Both FlightList and PriceGraph use same filtered data
- Filters update both simultaneously

---

## API Integration

### SerpApi Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│  /api/flights │────▶│   SerpApi   │
│  (Browser)  │◀────│   (Next.js)   │◀────│   (Google)  │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  In-Memory   │
                    │    Cache     │
                    └──────────────┘
```

### Why SerpApi (Google Flights)?

1. **Real data**: Actual flight prices from Google Flights
2. **Rich information**: Airline logos, layover details, carbon emissions
3. **Reliable**: Google's flight data is comprehensive
4. **Simple API**: Easy to integrate, good documentation

### Why Server-Side Proxy?

1. **Security**: API keys never exposed to client
2. **CORS**: Avoids cross-origin issues
3. **Caching**: Server-side cache reduces API calls
4. **Transform**: Convert SerpApi format to our types

### Data Transformation

SerpApi returns Google Flights data that we transform:

```typescript
// SerpApi response (abbreviated)
{
  best_flights: [{
    flights: [{
      departure_airport: { id: "MAD", name: "Madrid", time: "07:30" },
      arrival_airport: { id: "BCN", name: "Barcelona", time: "08:55" },
      airline: "Iberia",
      airline_logo: "https://...",
      flight_number: "IB 3214",
      duration: 85
    }],
    price: 89,
    carbon_emissions: { this_flight: 45000 }
  }]
}

// Our format (clean, typed)
{
  id: "serpapi-0",
  airline: { code: "IB", name: "Iberia", logo: "https://..." },
  origin: { code: "MAD", city: "Madrid", name: "Madrid-Barajas" },
  destination: { code: "BCN", city: "Barcelona", name: "El Prat" },
  departureTime: "2024-01-27T07:30:00",
  arrivalTime: "2024-01-27T08:55:00",
  duration: 85,
  stops: 0,
  segments: [/* detailed segment info */],
  price: { amount: 89, currency: "EUR" },
  carbonEmissions: 45
}
```

### Airport Database

The application includes 140+ major airports with coordinates for the interactive map:

```typescript
// src/app/api/airports/route.ts
const AIRPORTS = [
  { code: "MAD", name: "Madrid-Barajas", city: "Madrid", country: "Spain", lat: 40.4719, lng: -3.5626 },
  { code: "BCN", name: "El Prat", city: "Barcelona", country: "Spain", lat: 41.2974, lng: 2.0833 },
  // ... 140+ airports
];
```

---

## UI/UX Design

### Design Principles

1. **Minimalist palette**: Neutral grays + single accent (emerald)
2. **Information hierarchy**: Price prominent, details on demand
3. **Progressive disclosure**: Stops details expand on click
4. **Immediate feedback**: Loading states, success confirmations

### Color System

```css
/* Semantic colors */
--accent: emerald-500; /* Primary actions */
--success: emerald-600; /* Best price, confirmation */
--warning: amber-500; /* Stops indicator */
--error: red-500; /* Errors */

/* Neutral scale for content */
--text-primary: neutral-900;
--text-secondary: neutral-500;
--border: neutral-200;
```

### Flight Card Design

| Element | Decision             | Rationale                      |
| ------- | -------------------- | ------------------------------ |
| Price   | Large, right-aligned | Most important decision factor |
| Time    | Tabular nums font    | Easy scanning, aligned numbers |
| Stops   | Color-coded badge    | Quick visual distinction       |
| Airline | Logo from API        | Brand recognition              |
| Actions | Icon buttons + text  | Accessible on mobile           |

### Interactive Route Map

The RouteMap component shows:

- **Flight path**: Curved arc from origin to destination
- **Stop markers**: Orange dots for layover airports
- **120+ airports**: Global coverage with proper coordinates
- **Hover sync**: Card hover highlights route on map
- **Click to select**: Click card to pin route on map

---

## Key Components

### Component Hierarchy

```
SearchPage
├── Header (sticky)
│   └── Logo, Route info, Filter button (mobile)
├── SearchForm (compact)
├── Main
│   ├── FilterPanel (desktop sidebar)
│   │   ├── SortOptions
│   │   ├── StopsFilter
│   │   ├── PriceRangeSlider
│   │   ├── DepartureTimeFilter
│   │   ├── AirlineFilter (with logos)
│   │   └── FavoritesList
│   ├── RouteMap (interactive Leaflet map)
│   ├── PriceGraph (Recharts bar chart)
│   └── FlightList
│       └── FlightCard[]
│           └── FlightStopsDetail (expandable)
├── MobileFilterPanel (slide-over)
├── ComparisonDrawer (bottom sheet)
└── BookingConfirmation (modal)

HomePage
├── SearchForm (hero variant)
├── PriceCalendar (with popover tooltips)
├── SearchHistory
└── FavoritesList
```

### FlightCard

The core result component with:

- Airline logo from SerpApi with fallback to code initials
- Time/duration visualization with visual flight path
- Stops indicator (clickable to expand details)
- Price with scarcity badge ("3 seats left")
- Compare toggle button (max 3 flights)
- Favorite button with heart icon
- Select button for booking

### FlightStopsDetail

Expandable timeline showing:

- Each segment with times and flight numbers
- Airlines per segment (for codeshares)
- Layover duration with contextual advice
- Clean neutral styling (not warning colors)

### PriceGraph

Interactive bar chart with:

- Price distribution by time of day
- Stat cards (Lowest, Average, Highest, Trend)
- "Best time to book" indicator
- Filter-aware (shows when filters active)
- Click to filter by time slot

### PriceCalendar

Calendar showing prices by date:

- Color-coded cells (green = cheap, red = expensive)
- Click to show price popover (not redirect)
- Savings calculation vs average

### RouteMap

Leaflet-based interactive map:

- 120+ airports with accurate coordinates
- Flight path arcs with animation
- Stop markers for layovers
- Synced with flight card hover/selection

---

## Accessibility

### WCAG 2.1 AA Compliance

| Feature             | Implementation                               |
| ------------------- | -------------------------------------------- |
| Skip links          | "Skip to flight results" for keyboard users  |
| Focus visible       | 2px emerald ring on all interactive elements |
| ARIA labels         | Descriptive labels on buttons, regions       |
| Screen reader text  | Hidden descriptions for complex UI           |
| Keyboard navigation | Enter/Space for actions, Arrows for lists    |
| Color contrast      | All text meets 4.5:1 ratio                   |
| Reduced motion      | Respects `prefers-reduced-motion`            |

### Keyboard Navigation

| Component      | Keys                                      |
| -------------- | ----------------------------------------- |
| FlightCard     | Enter/Space (select for map), Tab (actions) |
| FavoritesList  | Enter (search), Delete (remove)           |
| PriceCalendar  | Click for popover, Escape to close        |
| FilterPanel    | Tab navigation, Space/Enter for toggles   |
| ComparisonDrawer | Escape to close, Tab through flights    |

### Screen Reader Experience

```html
<span class="sr-only">
  Iberia flight from Madrid to Barcelona, departing at 07:30, arriving at 08:55,
  Non-stop, €89
</span>
```

---

## Performance Optimizations

### Client-Side

1. **Selective Zustand subscriptions**

   ```typescript
   // Only re-renders when this specific value changes
   const isLoading = useFlightStore((state) => state.isLoading);
   ```

2. **useCallback for event handlers**

   ```typescript
   const handleSelectClick = useCallback(
     (e: React.MouseEvent) => {
       e.stopPropagation();
       selectFlight(flight);
     },
     [flight, selectFlight],
   );
   ```

3. **Debounced hover for map sync**

   ```typescript
   // 100ms debounce prevents rapid state updates
   hoverTimeoutRef.current = setTimeout(() => {
     setHoveredFlightId(flight.id);
   }, 100);
   ```

4. **CSS transitions over JS animations**
   ```css
   .expand {
     transition: max-height 300ms ease-out;
   }
   ```

### Server-Side

1. **API result caching** (5-minute TTL)
2. **Graceful degradation** (fallback to mocks)
3. **Limited concurrent requests**

### Bundle Optimization

- Tree-shaking with ES modules
- Dynamic imports for modals
- Lucide icons (individual imports)
- Leaflet loaded only on search page

---

## Data Flow

### Search Flow

```
1. User fills SearchForm
   ↓
2. Navigate to /search?origin=MAD&destination=BCN&...
   ↓
3. SearchContent reads URL params
   ↓
4. useFlightSearch.search(params)
   ↓
5. fetch('/api/flights?...')
   ↓
6. API route checks cache → miss → calls SerpApi
   ↓
7. Transform response → cache → return
   ↓
8. setFlights(results) → store update
   ↓
9. FlightList + PriceGraph + RouteMap re-render
```

### Filter Flow

```
1. User clicks "Non-stop" filter
   ↓
2. setFilters({ stops: [0] })
   ↓
3. Store updates filters state
   ↓
4. Components subscribed to getFilteredFlights() re-render
   ↓
5. FlightList, PriceGraph, and stats update simultaneously
```

### Map Sync Flow

```
1. User hovers FlightCard
   ↓
2. Debounced setHoveredFlightId(flight.id)
   ↓
3. RouteMap receives hoveredFlightId
   ↓
4. Map highlights that flight's route
   ↓
5. User clicks card → setSelectedMapFlightId
   ↓
6. Route stays highlighted until another click
```

---

## LocalStorage Sync System

### Architecture

The application uses a custom localStorage hook with real-time synchronization:

```typescript
// Custom event for same-tab sync
const STORAGE_EVENT = "storage-sync";

const setValue = (newValue: T) => {
  localStorage.setItem(key, JSON.stringify(newValue));
  setStoredValue(newValue);

  // Notify other components
  window.dispatchEvent(
    new CustomEvent(STORAGE_EVENT, {
      detail: { key, value: newValue },
    }),
  );
};
```

### Hydration Safety

```typescript
const [isHydrated, setIsHydrated] = useState(false);

useEffect(() => {
  setIsHydrated(true);
}, []);

// Render skeleton until hydrated
if (!isHydrated) return <Skeleton />;
```

### Favorites System

When a user clicks a saved favorite:

1. Extracts airline and stops from the favorite
2. Applies filters to the flight store
3. Navigates to search with filters pre-applied

---

## Environment Configuration

```env
# .env.local
SERPAPI_API_KEY=your_serpapi_key_here
NEXT_PUBLIC_USE_MOCK=false  # Set to true for development without API
```

---

## Conclusion

FlightSearch demonstrates a production-ready flight search with:

- **Clean architecture**: Provider pattern for API abstraction
- **Real API integration**: SerpApi (Google Flights) with caching
- **Interactive map**: Leaflet with flight path visualization
- **Excellent UX**: Progressive disclosure, immediate feedback
- **Full accessibility**: WCAG 2.1 AA compliant
- **Performance focused**: Selective renders, debounced updates
- **Modern stack**: Next.js 16, React 19, TypeScript, Tailwind CSS 4

The codebase is maintainable, extensible, and ready for production deployment.
