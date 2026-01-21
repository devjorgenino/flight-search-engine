# FlightSearch - Implementation Guide

## Overview

FlightSearch is a flight search engine built as a technical challenge, demonstrating modern React patterns, TypeScript proficiency, and UX best practices. This document explains the implementation decisions and architecture.

---

## Table of Contents

1. [Architecture Decisions](#architecture-decisions)
2. [State Management](#state-management)
3. [API Integration](#api-integration)
4. [UI/UX Design](#uiux-design)
5. [Accessibility](#accessibility)
6. [Performance Optimizations](#performance-optimizations)
7. [Key Components](#key-components)
8. [Data Flow](#data-flow)

---

## Architecture Decisions

### Why Next.js 15 with App Router?

- **Server Components**: Reduces client bundle size for static content
- **API Routes**: Built-in backend for Amadeus API proxy (hides credentials)
- **Built-in optimizations**: Image optimization, code splitting, prefetching
- **TypeScript first**: Excellent DX with strict type checking

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
│   ├── isComparisonOpen     # Drawer visibility
│   ├── selectedFlight       # Flight chosen for booking
│   └── isBookingConfirmationOpen
│
└── Computed (getters)
    ├── getFilteredFlights() # Applies all filters + sorting
    ├── getAvailableAirlines() # Unique airlines from results
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
    .sort(/* by selected criteria */);
};
```

**Benefits**:

- Single source of truth
- Both FlightList and PriceGraph use same filtered data
- Filters update both simultaneously

---

## API Integration

### Amadeus API Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│  /api/flights │────▶│  Amadeus    │
│  (Browser)  │◀────│   (Next.js)   │◀────│    API      │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  In-Memory   │
                    │    Cache     │
                    └──────────────┘
```

### Why Server-Side Proxy?

1. **Security**: API keys never exposed to client
2. **CORS**: Avoids cross-origin issues
3. **Caching**: Server-side cache reduces API calls
4. **Transform**: Convert Amadeus format to our types

### Performance Optimizations

```typescript
// src/app/api/flights/route.ts

// 1. In-memory cache with 5-minute TTL
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

// 2. Limited results for faster response
max: 25, // Instead of default 250

// 3. Fallback to mock data on API errors
if (parsedError.type === 'RATE_LIMITED') {
  return generateMockFlights(params); // Graceful degradation
}
```

### Data Transformation

Amadeus returns complex nested structures. We transform to a clean interface:

```typescript
// Amadeus format (abbreviated)
{
  itineraries: [{
    segments: [{
      departure: { iataCode: "MAD", at: "2024-01-27T07:30:00" },
      arrival: { iataCode: "BCN", at: "2024-01-27T08:55:00" },
      carrierCode: "IB",
      number: "3214"
    }]
  }],
  price: { grandTotal: "89.50", currency: "EUR" }
}

// Our format (clean, typed)
{
  id: "1",
  airline: { code: "IB", name: "Iberia" },
  origin: { code: "MAD", city: "Madrid" },
  destination: { code: "BCN", city: "Barcelona" },
  departureTime: "2024-01-27T07:30:00",
  arrivalTime: "2024-01-27T08:55:00",
  duration: 85,
  stops: 0,
  segments: [/* detailed segment info */],
  price: { amount: 89.50, currency: "EUR" }
}
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
--warning: amber-500; /* Stops, limited seats */
--error: red-500; /* Errors */

/* Neutral scale for content */
--text-primary: neutral-900;
--text-secondary: neutral-500;
--border: neutral-200;
```

### Flight Card Design Decisions

| Element | Decision             | Rationale                      |
| ------- | -------------------- | ------------------------------ |
| Price   | Large, right-aligned | Most important decision factor |
| Time    | Tabular nums font    | Easy scanning, aligned numbers |
| Stops   | Color-coded badge    | Quick visual distinction       |
| Airline | Logo/code box        | Brand recognition              |
| Actions | Icon buttons + text  | Accessible on mobile           |

### Stops Detail Component

For flights with stops, users can expand to see:

```
MAD ─────●───────●───── BCN
     ┌──────────────────────┐
     │  1 stop (PMI)        │  ← Click to expand
     └──────────────────────┘
         ▼ expanded
     ┌──────────────────────────────────────┐
     │ ● 07:30 MAD - Adolfo Suárez          │
     │ │ UX7701 · 1h 20m · Air Europa       │
     │ ○ 08:50 PMI - Palma de Mallorca      │
     │                                       │
     │ ⏱ 2h 15m layover in Palma            │
     │                                       │
     │ ○ 11:05 PMI                          │
     │ │ UX7702 · 55m · Air Europa          │
     │ ● 12:00 BCN - El Prat                │
     └──────────────────────────────────────┘
```

**UX Decisions**:

- Timeline visualization for clear journey understanding
- Layover warnings (short < 60min, long > 3hrs)
- Airport names, not just codes
- Smooth expand/collapse animation

---

## Accessibility

### WCAG 2.1 AA Compliance

| Feature             | Implementation                               |
| ------------------- | -------------------------------------------- |
| Skip links          | "Skip to flight results" for keyboard users  |
| Focus visible       | 2px emerald ring on all interactive elements |
| ARIA labels         | Descriptive labels on buttons, regions       |
| Screen reader text  | Hidden descriptions for complex UI           |
| Keyboard navigation | Enter/Space for expandable sections          |
| Color contrast      | All text meets 4.5:1 ratio                   |
| Reduced motion      | Respects `prefers-reduced-motion`            |

### Semantic HTML

```html
<!-- Proper document structure -->
<header>...</header>
<main id="main-content">
  <aside aria-label="Flight filters">...</aside>
  <section id="flight-results" aria-label="Flight results">
    <article role="listitem"><!-- FlightCard --></article>
  </section>
</main>

<!-- Modal accessibility -->
<div role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title">
  <h2 id="confirmation-title">Flight Selected!</h2>
</div>
```

### Screen Reader Experience

```html
<span class="sr-only">
  Iberia flight from Madrid to Barcelona, departing at 07:30, arriving at 08:55,
  Non-stop, €89.50
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

3. **Lazy loading for modals**

   ```typescript
   // BookingConfirmation only renders when needed
   {isBookingConfirmationOpen && <BookingConfirmation />}
   ```

4. **CSS transitions over JS animations**
   ```css
   .expand {
     transition: max-height 300ms ease-out;
   }
   ```

### Server-Side

1. **API result caching** (5-minute TTL)
2. **Limited results** (25 instead of 250)
3. **Graceful degradation** (fallback to mocks)
4. **Singleton Amadeus client** (connection reuse)

### Bundle Optimization

- Tree-shaking with ES modules
- Dynamic imports for non-critical components
- Lucide icons (individual imports, not full library)

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
│   ├── PriceGraph
│   └── FlightList
│       └── FlightCard[]
│           └── FlightStopsDetail (expandable)
├── MobileFilterPanel (slide-over)
├── ComparisonDrawer (bottom sheet)
└── BookingConfirmation (modal)
```

### FlightCard

The core result component with:

- Airline branding
- Time/duration visualization
- Stops indicator (clickable if > 0)
- Price with scarcity badge
- Compare toggle button
- Select button

### FlightStopsDetail

Expandable timeline showing:

- Each segment with times
- Flight numbers and airlines
- Layover duration and warnings
- Airport names and codes

### BookingConfirmation

Success modal with:

- Animated checkmark
- Flight summary
- Auto-redirect countdown
- Keyboard dismissible

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
6. API route checks cache → miss → calls Amadeus
   ↓
7. Transform response → cache → return
   ↓
8. setFlights(results) → store update
   ↓
9. FlightList + PriceGraph re-render
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
5. Both FlightList and PriceGraph update simultaneously
```

### Selection Flow

```
1. User clicks "Select" on FlightCard
   ↓
2. selectFlight(flight) → store update
   ↓
3. isBookingConfirmationOpen = true
   ↓
4. BookingConfirmation modal appears
   ↓
5. 3-second countdown starts
   ↓
6. resetAll() + router.push('/')
   ↓
7. User returns to home with clean state
```

---

## Testing Checklist

### Manual Test Flow

1. **Search**: MAD → BCN, future date, search
2. **Results**: Verify flights display, graph shows
3. **Filters**: Toggle stops, slide price, select airline
4. **Stops Detail**: Click "1 stop" to expand timeline
5. **Comparison**: Add 2-3 flights, open drawer
6. **Selection**: Click "Select" → confirmation → redirect
7. **Accessibility**: Tab through, use screen reader
8. **Mobile**: Resize, test filter slide-over

### API Test

```bash
curl "http://localhost:3000/api/flights?origin=MAD&destination=BCN&departureDate=2024-02-15"
```

---

## Deployment

```bash
# Vercel (recommended)
npm install -g vercel
vercel

# Environment variables in Vercel dashboard:
AMADEUS_API_KEY=xxx
AMADEUS_API_SECRET=xxx
AMADEUS_ENVIRONMENT=test  # or 'production'
NEXT_PUBLIC_USE_MOCK=false
```

---

## Conclusion

FlightSearch demonstrates a production-ready flight search with:

- **Clean architecture**: Separation of concerns, typed interfaces
- **Real API integration**: Amadeus with caching and fallbacks
- **Excellent UX**: Progressive disclosure, immediate feedback
- **Full accessibility**: WCAG 2.1 AA compliant
- **Performance focused**: Selective renders, optimized API calls

The codebase is maintainable, extensible, and ready for production deployment.
