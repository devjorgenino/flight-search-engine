# FlightSearch - Flight Search Engine

A modern, responsive flight search engine built with Next.js 16, React 19, TypeScript, and Tailwind CSS. Features real-time flight data from Google Flights via SerpApi, interactive price charts, and a clean UI design.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)

---

## Overview

FlightSearch is a flight search application that allows users to search for flights using real-time data from Google Flights, filter results by multiple criteria, and visualize price trends through an interactive chart. The application is designed with a focus on user experience, performance, and code maintainability.

### Key Highlights

- **Real Flight Data**: Live flight prices from Google Flights via SerpApi
- **Real-time Filtering**: Filters update both the flight list and price chart simultaneously
- **Airline Logos**: Actual airline logos from Google Flights with smart fallbacks
- **Interactive Route Map**: Animated flight path visualization with stop markers
- **Modern UI**: Custom design with gradients, cards, and smooth transitions
- **Responsive Design**: Fully functional on mobile with slide-over filter panel

---

## Features

| Feature                  | Description                                                       |
| ------------------------ | ----------------------------------------------------------------- |
| **Real Flight Data**     | Live prices from Google Flights via SerpApi                       |
| **Airline Logos**        | Actual airline logos with fallback to styled initials             |
| **Smart Search**         | Airport autocomplete with 140+ global airports                    |
| **Live Price Graph**     | Interactive Recharts visualization with filter updates            |
| **Advanced Filters**     | Filter by stops, price range, airlines, and sort options          |
| **Flight Comparison**    | Compare up to 3 flights side-by-side                              |
| **Favorites System**     | Save flights with real-time sync across tabs                      |
| **Search History**       | Recent searches with one-click repeat                             |
| **Price Calendar**       | Visual price calendar with hover popover details                  |
| **Route Map**            | Animated flight paths with layover markers                        |
| **Responsive**           | Mobile-first design with adaptive layouts                         |
| **Accessible**           | ARIA labels, keyboard navigation, screen reader support           |

---

## Tech Stack

| Technology         | Purpose                              |
| ------------------ | ------------------------------------ |
| **Next.js 16**     | React framework with App Router      |
| **React 19**       | UI library with latest features      |
| **TypeScript**     | Type safety and developer experience |
| **Tailwind CSS 4** | Utility-first styling                |
| **Zustand**        | Lightweight state management         |
| **Recharts**       | Composable chart library             |
| **SerpApi**        | Google Flights data provider         |
| **Lucide React**   | Icon library                         |
| **date-fns**       | Date manipulation                    |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- SerpApi API key (get one at [serpapi.com](https://serpapi.com))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/flight-search-engine.git
cd flight-search-engine

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your SERPAPI_API_KEY

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

```env
# Required: SerpApi key for Google Flights data
SERPAPI_API_KEY=your_serpapi_key

# Optional: Use mock data instead of real API
NEXT_PUBLIC_USE_MOCK=false
```

### Available Scripts

| Command         | Description                             |
| --------------- | --------------------------------------- |
| `npm run dev`   | Start development server with Turbopack |
| `npm run build` | Create production build                 |
| `npm start`     | Start production server                 |
| `npm run lint`  | Run ESLint                              |

---

## API Integration

### SerpApi (Google Flights)

The application uses SerpApi to fetch real-time flight data from Google Flights:

```typescript
// src/lib/providers/serpapi-adapter.ts
export class SerpApiFlightProvider implements FlightSearchProvider {
  async search(params: SearchParams): Promise<Flight[]> {
    const response = await fetch(`https://serpapi.com/search?engine=google_flights&...`);
    return this.transformResponse(response);
  }
}
```

**Features:**
- Real airline logos
- Live pricing
- Actual flight schedules
- Multi-segment flights with layover details

### Provider Pattern

The API uses an abstract provider pattern for easy switching:

```typescript
// Automatic provider detection
const provider = createFlightProvider(); // Uses SerpApi if key available
const flights = await provider.search(params);
```

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── airports/route.ts    # Airport search API
│   │   └── flights/route.ts     # Flight search API (SerpApi)
│   ├── search/page.tsx          # Search results page
│   └── page.tsx                 # Landing page
│
├── components/
│   ├── ui/                      # Base UI components
│   ├── search/                  # Search functionality
│   ├── results/                 # Flight results display
│   ├── filters/                 # Filter components
│   ├── charts/                  # Price graph
│   ├── features/                # Feature components
│   └── comparison/              # Flight comparison
│
├── lib/
│   ├── providers/               # API providers (SerpApi)
│   └── utils.ts                 # Helper functions
│
├── stores/                      # Zustand state stores
├── hooks/                       # Custom React hooks
├── types/                       # TypeScript interfaces
└── mocks/                       # Mock data for development
```

---

## Key Components

### Airline Logos

Real airline logos with intelligent fallbacks:

```tsx
<AirlineLogo airline={flight.airline} size={40} />
// Shows actual logo from Google Flights
// Falls back to styled initials with airline-specific colors
```

### Route Map

Interactive flight path visualization:

- 120+ airports with global coordinates
- Animated flight path with plane icon
- Stop/layover markers for multi-leg flights
- Origin/destination markers with city info

### Price Graph

Dynamic chart that updates with filters:

- Real-time filter integration
- Best time to book indicator
- Stats row (lowest, average, highest, trend)
- Interactive tooltips

### Price Calendar

Hover-based price information:

- Click date to see detailed popover
- Price comparison vs average
- Savings indicator
- Keyboard navigation (arrows, PageUp/Down)

### Favorites List

Collapsible saved flights:

- Expandable flight details
- Quick search again button
- Keyboard accessible
- Real-time sync across tabs

---

## Accessibility

- **Skip links** for keyboard users
- **ARIA labels** on all interactive elements
- **Focus-visible** states with ring indicators
- **Keyboard navigation** for all components
- **Screen reader** support with descriptive text
- **Color contrast** meets WCAG AA standards

---

## Testing

### Manual Test Flow

1. **Search**: Select origin/destination, date, search
2. **Results**: Verify flights display with real logos
3. **Filters**: Toggle stops, slide price, select airline
4. **Map**: Click flights to see route visualization
5. **Comparison**: Add 2-3 flights, compare
6. **Calendar**: Hover dates to see price popover

---

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Environment Variables (Production)

```env
SERPAPI_API_KEY=your_production_key
NEXT_PUBLIC_USE_MOCK=false
```

---

## License

MIT License - feel free to use this project for learning or as a starting point.

---

<p align="center">
  <strong>FlightSearch</strong> - Find Your Perfect Flight
</p>
