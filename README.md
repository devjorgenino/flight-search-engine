# ✈️ FlightSearch - Flight Search Engine

A modern, responsive flight search engine built with Next.js 15, TypeScript, and Tailwind CSS. Features real-time price filtering, interactive charts, and a clean UI design.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)
![Zustand](https://img.shields.io/badge/Zustand-5.0-orange?style=flat-square)
![Recharts](https://img.shields.io/badge/Recharts-2.0-22b5bf?style=flat-square)

---

## 🎯 Overview

FlightSearch is a flight search application that allows users to search for flights, filter results by multiple criteria, and visualize price trends through an interactive chart. The application is designed with a focus on user experience, performance, and code maintainability.

### Key Highlights

- **Real-time Filtering**: Filters update both the flight list and price chart simultaneously
- **Modern UI**: Custom design with gradients, cards, and smooth transitions
- **Responsive Design**: Fully functional on mobile with slide-over filter panel
- **Type-Safe**: Full TypeScript implementation with strict typing
- **API-Ready**: Prepared for Amadeus API integration with easy mock/production switch

---

## ✨ Features

| Feature                  | Description                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| 🔍 **Smart Search**      | Airport autocomplete with 36+ European airports                   |
| 📊 **Live Price Graph**  | Interactive Recharts visualization that updates with filters      |
| 🎚️ **Advanced Filters**  | Filter by stops, price range, airlines, and sort options          |
| ⚖️ **Flight Comparison** | Compare up to 3 flights side-by-side with highlighted best values |
| 📱 **Responsive**        | Mobile-first design with adaptive layouts                         |
| ⚡ **Fast**              | Optimized renders with Zustand selectors                          |
| 🎨 **Minimalist UI**     | Clean design with neutral palette and emerald accent              |
| ♿ **Accessible**        | ARIA labels, focus states, keyboard navigation, skip links        |

---

## 🛠️ Tech Stack

| Technology         | Purpose                              |
| ------------------ | ------------------------------------ |
| **Next.js 15**     | React framework with App Router      |
| **TypeScript**     | Type safety and developer experience |
| **Tailwind CSS 4** | Utility-first styling                |
| **Zustand**        | Lightweight state management         |
| **Recharts**       | Composable chart library             |
| **Lucide React**   | Icon library                         |
| **date-fns**       | Date manipulation                    |

---

## 🏗️ Architecture

### State Management Strategy

We use a **hybrid approach** combining Zustand for global state and URL search params for shareable searches:

```
┌─────────────────────────────────────────────────────────────┐
│                     URL SEARCH PARAMS                        │
│              (origin, destination, dates)                    │
│                 Shareable & Bookmarkable                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     ZUSTAND STORE                            │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐   │
│  │  flights[]  │  │   filters    │  │ getFilteredFlights│   │
│  │  (raw data) │  │  (user prefs)│  │    (computed)     │   │
│  └──────┬──────┘  └──────┬───────┘  └─────────┬─────────┘   │
│         │                │                    │              │
│         └────────────────┴────────────────────┘              │
└─────────────────────────────┬───────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
       ┌───────────┐   ┌───────────┐   ┌───────────┐
       │FlightList │   │PriceGraph │   │FilterPanel│
       └───────────┘   └───────────┘   └───────────┘
```

### Why Zustand over Context API?

1. **No re-render cascade** - Components only update when their selected state changes
2. **Granular selectors** - `useFlightStore(state => state.filters)` only subscribes to filters
3. **Less boilerplate** - No providers, reducers, or action types needed
4. **Built-in computed values** - `getFilteredFlights()` derives state efficiently

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/flights/          # API route for flight search
│   │   └── route.ts          # GET endpoint (mock/Amadeus ready)
│   ├── search/
│   │   └── page.tsx          # Search results page
│   ├── layout.tsx            # Root layout with fonts
│   ├── page.tsx              # Landing page with hero
│   └── globals.css           # Global styles
│
├── components/
│   ├── ui/                   # Base UI components
│   │   ├── Button.tsx        # Primary, secondary, ghost variants
│   │   ├── Card.tsx          # Elevated, bordered variants
│   │   ├── Input.tsx         # With label, icon, error states
│   │   ├── Badge.tsx         # Status indicators
│   │   └── Skeleton.tsx      # Loading placeholders
│   │
│   ├── search/               # Search functionality
│   │   ├── SearchForm.tsx    # Main search form (hero/compact)
│   │   └── AirportAutocomplete.tsx  # Airport search with keyboard nav
│   │
│   ├── results/              # Flight results display
│   │   ├── FlightList.tsx    # List container with states
│   │   ├── FlightCard.tsx    # Individual flight display
│   │   └── FlightCardSkeleton.tsx   # Loading state
│   │
│   ├── filters/              # Filter components
│   │   ├── FilterPanel.tsx   # Desktop sidebar + mobile slide-over
│   │   ├── StopsFilter.tsx   # Non-stop, 1 stop, 2+ stops
│   │   ├── PriceRangeFilter.tsx    # Dual-handle range slider
│   │   ├── AirlineFilter.tsx # Multi-select airline filter
│   │   └── SortFilter.tsx    # Cheapest, fastest, earliest
│   │
│   ├── comparison/
│   │   └── ComparisonDrawer.tsx  # Side-by-side flight comparison
│   │
│   └── charts/
│       └── PriceGraph.tsx    # Recharts area chart
│
├── stores/
│   ├── useFlightStore.ts     # Main state: flights, filters, actions
│   └── useUIStore.ts         # UI state: panels, modals
│
├── hooks/
│   ├── useFlightSearch.ts    # Search trigger and loading state
│   └── useFilteredFlights.ts # Memoized filtered results
│
├── lib/
│   ├── utils.ts              # Helpers: cn(), formatPrice(), etc.
│   └── constants.ts          # Airlines, airports, defaults
│
├── mocks/
│   ├── flights.ts            # 15 realistic mock flights
│   └── airports.ts           # 36 European airports
│
└── types/
    └── flight.ts             # TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/flight-search-engine.git
cd flight-search-engine

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command         | Description                             |
| --------------- | --------------------------------------- |
| `npm run dev`   | Start development server with Turbopack |
| `npm run build` | Create production build                 |
| `npm start`     | Start production server                 |
| `npm run lint`  | Run ESLint                              |

---

## 🔌 API Integration

The application is designed to work with mock data out of the box, with easy switching to the Amadeus API.

### Current Setup (Mock Data)

```typescript
// src/app/api/flights/route.ts
export async function GET(request: NextRequest) {
  // Currently returns mock data
  const flights = generateMockFlights(params);
  return NextResponse.json({ data: flights });
}
```

### Switching to Amadeus API

1. **Get API credentials** at [developers.amadeus.com](https://developers.amadeus.com)

2. **Create `.env.local`**:

```env
AMADEUS_API_KEY=your_api_key
AMADEUS_API_SECRET=your_api_secret
AMADEUS_ENVIRONMENT=test
```

3. **Update the route** to use the Amadeus client (implementation guide in comments)

### Mock Data Overview

The mock system provides:

- **15 flights** with realistic variety
- **7 non-stop** flights (€35-€142)
- **5 one-stop** flights (€65-€95)
- **3 two-stop** flights (€48-€62)
- **10 airlines**: Iberia, Vueling, Ryanair, easyJet, Lufthansa, Air France, British Airways, KLM, ITA Airways, Air Europa

---

## 🎨 Key Components

### SearchForm

Supports two variants for different contexts:

```tsx
// Hero variant (landing page) - full width, prominent
<SearchForm variant="hero" />

// Compact variant (results page) - inline, smaller
<SearchForm variant="compact" />
```

### PriceGraph

The chart automatically syncs with filters:

```tsx
function PriceGraph() {
  // Uses the same filtered data as FlightList
  const filteredFlights = useFilteredFlights();

  // Groups by hour and calculates average price
  const chartData = useMemo(() => {
    // ... aggregation logic
  }, [filteredFlights]);

  return <AreaChart data={chartData} />;
}
```

### FilterPanel

Desktop and mobile versions from the same component:

```tsx
// Desktop - sidebar
<aside className="hidden lg:block w-80">
  <FilterPanel />
</aside>

// Mobile - slide-over panel
<MobileFilterPanel />
```

### ComparisonDrawer

Compare up to 3 flights side-by-side:

```tsx
// Selection in FlightCard
const { toggleCompare, comparedFlights } = useFlightStore();
const isSelected = comparedFlights.some((f) => f.id === flight.id);

<Button
  onClick={() => toggleCompare(flight)}
  disabled={!isSelected && comparedFlights.length >= 3}
>
  {isSelected ? "Remove" : "Compare"}
</Button>;

// Drawer shows when flights are selected
{
  comparedFlights.length > 0 && <ComparisonDrawer />;
}
```

**Features:**

- Floating "Compare" button appears when 1+ flights selected
- Slide-up drawer with side-by-side comparison table
- Highlights best price (green) and fastest duration
- Easy add/remove with toggle buttons on each flight card

---

## 🎨 Design System

### Color Palette

The UI follows a minimalist approach with a single accent color:

| Color               | Usage                                       |
| ------------------- | ------------------------------------------- |
| **Neutral grays**   | Backgrounds, borders, text                  |
| **Emerald**         | Primary accent (buttons, links, highlights) |
| **Semantic colors** | Green for best price, red for errors        |

### Accessibility Features

- **Skip to main content** link for keyboard users
- **ARIA labels** on all interactive elements
- **Focus-visible** states with ring indicators
- **Semantic HTML** (main, nav, section, article)
- **Keyboard navigation** for autocomplete and filters
- **Color contrast** meets WCAG AA standards

---

## 📊 Data Flow

```
User Action                 Store Update              UI Response
───────────────────────────────────────────────────────────────────
1. Fill search form    →   setSearchParams()     →   Navigate to /search
2. Page loads          →   search() fetches      →   setFlights()
3. Click "Non-stop"    →   setFilters({stops})   →   List + Graph update
4. Slide price range   →   setFilters({price})   →   List + Graph update
5. Select airline      →   setFilters({airlines})→   List + Graph update
```

All filter changes trigger `getFilteredFlights()` which both `FlightList` and `PriceGraph` consume.

---

## 📱 Responsive Behavior

| Breakpoint        | Layout                                        |
| ----------------- | --------------------------------------------- |
| Mobile (<1024px)  | Single column, filter button opens slide-over |
| Desktop (≥1024px) | Sidebar filters + main content area           |

```tsx
// Filter button only visible on mobile
<Button className="lg:hidden" onClick={() => setFilterPanelOpen(true)}>
  Filters
</Button>

// Sidebar only visible on desktop
<aside className="hidden lg:block w-80">
  <FilterPanel />
</aside>
```

---

## 🧪 Testing the Application

### Manual Test Flow

1. **Landing Page**
   - Type "Madrid" → Select "Madrid (MAD)"
   - Type "Barcelona" → Select "Barcelona (BCN)"
   - Select a future date
   - Click "Search Flights"

2. **Results Page**
   - Verify 15 flights display
   - Verify price graph shows data points

3. **Filter Testing**
   - Click "Non-stop" → List reduces to 7 flights, graph updates
   - Slide price to "Under €100" → Both update
   - Select only "Ryanair" → Single flight shows

4. **Flight Comparison**
   - Click "Compare" on 2-3 flight cards
   - Floating "Compare (X)" button appears at bottom
   - Click to open comparison drawer
   - Best price highlighted in green
   - Click "Remove" to deselect flights

5. **Responsive Testing**
   - Resize to mobile width
   - Click "Filters" button
   - Verify slide-over panel works

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables (Production)

```env
AMADEUS_API_KEY=your_production_key
AMADEUS_API_SECRET=your_production_secret
AMADEUS_ENVIRONMENT=production
```

---

## 📈 Future Improvements

- [ ] Add React Query for data fetching with caching
- [ ] Implement date range selection for price calendar view
- [ ] Add flight details modal with segments
- [ ] Integrate real Amadeus API
- [ ] Add unit tests with Jest/Vitest
- [ ] Add E2E tests with Playwright
- [ ] Implement user authentication for saved searches
- [x] Flight comparison feature (compare up to 3 flights)

---

## 📄 License

MIT License - feel free to use this project for learning or as a starting point.

---

## 👤 Author

Built as a technical challenge demonstrating:

- Modern React patterns (hooks, composition)
- State management best practices
- TypeScript proficiency
- Responsive design implementation
- Clean code architecture

---

<p align="center">
  <strong>FlightSearch</strong> - Find Your Perfect Flight ✈️
</p>
