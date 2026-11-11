# EmergencyAmbulanceRoutePlanner

An intelligent emergency ambulance dispatch and route planning system that streamlines accident reporting, ambulance selection, congestion-aware route optimization using Dijkstra's algorithm, hospital capacity management, and real-time incident tracking for efficient emergency response.

## Key Features
- **Accident Reporting Portal**: Immediate incident reporting with location selection, caller details, and customizable hazard tags.
- **Congestion-Aware Dijkstra Routing**: Dynamic shortest-path optimization between ambulance base stations, incident locations, and nearest available hospitals.
- **Kerala 108 CAD Console**: Live telemetry, dispatch triage pipeline, fleet allocation, and status management.
- **Hospital Bed & Trauma Tracking**: Real-time ICU and trauma bed availability monitoring and hospital diversion toggles.
- **Gemini AI Integration**: Real-time AI incident verification, multi-turn emergency assistance, and first-aid recommendations.
- **Light & Dark Mode**: Full high-contrast support across city road graph visualizers and Google Maps.

## Run Locally

**Prerequisites:** Node.js (v18+)

1. Clone and navigate to the project directory:
   ```bash
   git clone https://github.com/angeleenarajiv/EmergencyAmbulanceRoutePlanner.git
   cd EmergencyAmbulanceRoutePlanner
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your `GEMINI_API_KEY` and `VITE_GOOGLE_MAPS_API_KEY` if desired.

4. Start the application:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.
