# Aethera — Luxury Travel Studio & Live Companion
### Complete Project Documentation & Feature Summary

---

## 1. Overview & Vision
**Aethera** is a luxury, minimal editorial travel workspace designed to take travelers seamlessly from **vision to itinerary**, and from **planning to live in-destination execution**. Built with a focus on editorial typography (*Instrument Serif* & *Inter*), rich whitespace, cinematic video backgrounds, and calm, non-intrusive AI assistance.

---

## 2. Technology Stack & Design System

- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Custom CSS Variables & Keyframe Animations (`src/styles/theme.css`, `src/styles/fonts.css`)
- **Icons**: Lucide React
- **Typography**:
  - **Headings & Brand**: *Instrument Serif* (Italic & Regular)
  - **Body, UI & Data**: *Inter* / System UI
  - **Status, Coordinates & Metrics**: Monospace (`font-mono`)
- **Color Palette**:
  - Primary Backgrounds: `#FFFFFF` and Warm Off-White (`#FAF8F5`)
  - Typography: Jet Black (`#000000`) and Muted Gray (`#6F6F6F`)
  - Borders & Dividers: Subtle Cream Stone (`#E7E5E2`)
  - Accent / Highlights: Pure Black pills, Emerald indicators, `#F598F2` (International)

---

## 3. Architecture & Core Modes

The application operates across **three primary chapters**:

```
                  ┌────────────────────────────────────────┐
                  │          Cinematic Landing Hero        │
                  │  Looping Video + "Begin Journey" CTA   │
                  └───────────────────┬────────────────────┘
                                      │
                                      ▼
                  ┌────────────────────────────────────────┐
                  │     Aethera Travel Studio Dashboard    │
                  └─────────┬────────────────────┬─────────┘
                            │                    │
            ┌───────────────┴──────┐      ┌──────┴───────────────┐
            │    PLANNING MODE     │      │  LIVE JOURNEY MODE   │
            │  (Pre-trip Studio)   │      │  (Active Day 4 Goa)  │
            └───────────┬──────────┘      └──────────────────────┘
                        │
                        ▼
            ┌──────────────────────┐
            │ "+ Plan New Journey" │
            │  (Modal Selection)   │
            └───────┬───────┬──────┘
                    │       │
       ┌────────────┘       └────────────┐
       ▼                                 ▼
┌──────────────────────┐   ┌──────────────────────────┐
│   NATIONAL JOURNEY   │   │  INTERNATIONAL JOURNEY   │
│  4-Video Lumora Engine│  │  3-Video Global Showcase │
│  PNG Train Overlay   │   │  Live Clock & Visa Desks │
│  Liquid Glass Form   │   │  Multi-Currency Dossiers │
└──────────────────────┘   └──────────────────────────┘
```

---

## 4. Feature Breakdown by Component

### A. Landing Page & Cinematic Hero
- **File**: `src/App.tsx` / `src/components/landing/`
- **Video Background**: Custom `requestAnimationFrame` 0.5s fade-in/fade-out loop ensuring seamless video transition without hard cuts.
- **Top Brand Bar**: `Aethera®` with minimal navigation.
- **Headline**: Centered Instrument Serif headline *"Beyond silence, we build the eternal."* with black pill `[ Begin Journey ]` CTA.

---

### B. Dashboard Planning Studio (`src/components/dashboard/`)
- **[DashboardNavbar.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/dashboard/DashboardNavbar.tsx)**:
  - Sticky glassmorphic bar with mode toggle (`● LIVE JOURNEY` vs `PLANNING`).
  - Section shortcuts (*Journeys*, *Dream*, *AI Planner*, *Itinerary*, *Budget*, *Map*).
- **[DashboardHero.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/dashboard/DashboardHero.tsx)**:
  - Headline: *"Where will your next journey take you?"*
  - **Train Hover Animation**: Single-shot horizontal train pass across the `+ Plan a New Journey` button on hover (`left: -48px` to `100% + 48px`, 800ms).
- **[CurrentJourneyCard.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/dashboard/CurrentJourneyCard.tsx)**:
  - Cinematic photography card for *Goa · Mumbai · Delhi* (Day 4 of 10 progress indicator, direct `[ Continue Journey ]` into live mode).
- **[MyJourneysSection.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/dashboard/MyJourneysSection.tsx)**:
  - Magazine cover archives (Goa, Rajasthan, Kerala, Ladakh).
- **[CreateJourneySection.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/dashboard/CreateJourneySection.tsx)**:
  - *"Dream somewhere new"* destination generator with quick tags.
- **[AIPlannerSection.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/dashboard/AIPlannerSection.tsx)**:
  - Natural language travel prompt synthesizer.
- **[UpcomingItinerary.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/dashboard/UpcomingItinerary.tsx)**:
  - Vertical timeline with check-off nodes and duration estimates.
- **[TravelBudget.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/dashboard/TravelBudget.tsx)**:
  - Monochrome budget breakdown (Flights, Stays, Dining, Experiences) + AI optimization insights.
- **[JourneyMap.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/dashboard/JourneyMap.tsx)**:
  - Route visualizer (Chennai $\to$ Goa $\to$ Mumbai $\to$ Delhi).
- **[TravelTogether.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/dashboard/TravelTogether.tsx)**:
  - Traveler avatars and group invite modal.
- **[DestinationDiscovery.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/dashboard/DestinationDiscovery.tsx)**:
  - Editorial showcase (`01 Goa`, `02 Ladakh`, `03 Rajasthan`).
- **[JourneyPlanner.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/dashboard/JourneyPlanner.tsx)** & **[JourneyDetail.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/dashboard/JourneyDetail.tsx)**:
  - Full-detail day-by-day itinerary and trip manager with local storage persistence.

---

### C. Create New Journey Flow (`src/components/planner/`)
- **[CreateJourneyModal.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/planner/CreateJourneyModal.tsx)**:
  - Centered modal with clean backdrop (no heavy blur).
  - Two large cards:
    - **NATIONAL**: *"Explore destinations closer to home."*
    - **INTERNATIONAL**: *"Cross borders and discover somewhere new."*
- **[NationalJourney.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/planner/NationalJourney.tsx)**:
  - **4 Fullscreen Looping Videos**: *01 Golden Hour*, *02 Still Water*, *03 Deep Woods* (dark mode text switch `#182C41`), *04 Quiet Dawn*.
  - **Transparent PNG Overlay**: Continuous `train-bob` animation (`translateY: 0 to -6px`, `scale: 1.03`).
  - **`.liquid-glass` Styling**: Multi-stop gradient borders with frosted backdrop.
  - **3-Stage Flow**:
    1. *Destination Search* + "Popular in India" pills (Goa, Kerala, Rajasthan, Kashmir, Himachal Pradesh, Tamil Nadu).
    2. *Preferences* (Styles, Flexible Dates, 1–20 Travelers, Budget Tiers).
    3. *Review & AI Synthesis* (Animated generation sequence $\to$ Active Dashboard).
- **[InternationalJourney.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/planner/InternationalJourney.tsx)**:
  - **3 Fullscreen Looping Videos**: *01 Water Wave*, *02 Gridwave*, *03 Light Tunnel*.
  - Live 24h Clock (`CUP HH:MM:SS`) + glowing pulse status dot.
  - Global Destination Cards: *Japan, Italy, Switzerland, Thailand, Bali, Australia*.
  - International Readiness: Passport validity, Multi-currency cards, Travel insurance.

---

### D. Live Journey & Travel Companion (`src/components/live/`)
- **[LiveJourneyHero.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/live/LiveJourneyHero.tsx)**:
  - Active status: `YOUR JOURNEY · DAY 4 OF 10`.
  - Headline: `Goa · Mumbai · Delhi` | Location: `📍 Panaji, Goa · 28°C`.
  - Checkpoint: `Next: Fort Aguada · 15:30 (4.2 km away · 14 min)`.
- **[LiveLocationMap.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/live/LiveLocationMap.tsx)**:
  - Interactive map with `📍 YOU ARE HERE` marker and waypoint nodes (`Hotel` $\to$ `Baga Beach` $\to$ `Lunch` $\to$ `Fort Aguada` $\to$ `Anjuna`).
  - Location permission handling & manual input fallback.
- **[QuickAssistanceGrid.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/live/QuickAssistanceGrid.tsx)**:
  - Prominent **"I'm not feeling well"** immediate medical care banner.
  - 8 Near-You service categories: Hospitals, Pharmacies, Rides, Restaurants, Hotels, ATMs, Fuel/EV, Emergency SOS.
- **[ServiceModals.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/live/ServiceModals.tsx)**:
  - **Medical Support**: CityCare Hospital & Apollo Victor Hospital (24/7 emergency badges, direct calling, ride booking).
  - **Get a Ride**: Fare & ETA comparison across Uber, Ola, and GoaMiles.
  - **Emergency SOS (24/7)**: Exact GPS coordinates (`15.4909° N, 73.8278° E`) with one-touch dialing for 112, 108, 100.
- **[TodayLiveItinerary.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/live/TodayLiveItinerary.tsx)**:
  - Chronological schedule with live drive durations, checklist nodes, `[ Navigate ]`, and `[ Get Ride ]` buttons.
- **[SmartTravelSuggestions.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/live/SmartTravelSuggestions.tsx)**:
  - Non-intrusive departure alerts, hotel return durations, and golden hour weather forecasts.
- **[GroupLocationSharing.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/live/GroupLocationSharing.tsx)**:
  - Proximity tracker for 4 companions (`You`, `Rahul`, `Priya`, `Arjun`) with broadcast toggle.
- **[LiveTravelCompanionDrawer.tsx](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/components/live/LiveTravelCompanionDrawer.tsx)**:
  - Floating `✦ Travel Companion` AI drawer aware of live trip parameters, nearby clinics, and itinerary stops.

---

### E. State Management & Persistence (`src/services/`)
- **[travelStorage.ts](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/services/travelStorage.ts)**: LocalStorage synchronization for user journeys, active trips, and custom itineraries.
- **[destinations.ts](file:///c:/Users/shyam/OneDrive/Documents/Desktop/odoo-LDCE/src/services/destinations.ts)**: Curated database of domestic and international destinations with metadata, coordinates, and recommendations.

---

## 5. Directory Structure

```
odoo-LDCE/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── AIAssistantDrawer.tsx
│   │   │   ├── AIPlannerSection.tsx
│   │   │   ├── CreateJourneySection.tsx
│   │   │   ├── CurrentJourneyCard.tsx
│   │   │   ├── DashboardFooter.tsx
│   │   │   ├── DashboardHero.tsx
│   │   │   ├── DashboardNavbar.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── DestinationDiscovery.tsx
│   │   │   ├── JourneyDetail.tsx
│   │   │   ├── JourneyMap.tsx
│   │   │   ├── JourneyPlanner.tsx
│   │   │   ├── MyJourneysSection.tsx
│   │   │   ├── TravelBudget.tsx
│   │   │   ├── TravelTogether.tsx
│   │   │   └── UpcomingItinerary.tsx
│   │   ├── live/
│   │   │   ├── GroupLocationSharing.tsx
│   │   │   ├── LiveJourneyHero.tsx
│   │   │   ├── LiveLocationMap.tsx
│   │   │   ├── LiveTravelCompanionDrawer.tsx
│   │   │   ├── QuickAssistanceGrid.tsx
│   │   │   ├── ServiceModals.tsx
│   │   │   ├── SmartTravelSuggestions.tsx
│   │   │   └── TodayLiveItinerary.tsx
│   │   └── planner/
│   │       ├── CreateJourneyModal.tsx
│   │       ├── InternationalJourney.tsx
│   │       └── NationalJourney.tsx
│   ├── services/
│   │   ├── destinations.ts
│   │   └── travelStorage.ts
│   ├── styles/
│   │   ├── fonts.css
│   │   ├── index.css
│   │   └── theme.css
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── PROJECT_OVERVIEW.md
```

---

## 6. How to Run Locally

```bash
# Install dependencies
npm install

# Start Vite local development server
npm run dev

# Build production bundle & type check
npm run build
```

---
*Built with care for Aethera.*
