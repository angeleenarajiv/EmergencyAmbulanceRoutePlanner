import os
import asyncio
from typing import List, Tuple, Dict, Any
import httpx

# Load Google Maps API key from environment
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')
if not GOOGLE_MAPS_API_KEY:
    raise EnvironmentError('GOOGLE_MAPS_API_KEY environment variable not set')

# ---------------------------------------------------------------------------
# Helper functions for Google Maps APIs
# ---------------------------------------------------------------------------

async def geocode_address(address: str) -> Tuple[float, float]:
    """Convert a free‑text address to (lat, lng) using the Google Geocoding API.
    Returns a tuple of floats. Raises an exception if the API call fails.
    """
    url = 'https://maps.googleapis.com/maps/api/geocode/json'
    params = {'address': address, 'key': GOOGLE_MAPS_API_KEY}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, timeout=10.0)
        resp.raise_for_status()
        data = resp.json()
        if data['status'] != 'OK' or not data['results']:
            raise ValueError(f"Geocoding failed for address '{address}': {data.get('status')}")
        location = data['results'][0]['geometry']['location']
        return float(location['lat']), float(location['lng'])

async def distance_matrix(orig: Tuple[float, float], dests: List[Tuple[float, float]]) -> List[int]:
    """Call the Google Distance‑Matrix API.
    Returns a list of travel times in seconds from `orig` to each destination.
    """
    url = 'https://maps.googleapis.com/maps/api/distancematrix/json'
    origins = f"{orig[0]},{orig[1]}"
    destinations = '|'.join(f"{lat},{lng}" for lat, lng in dests)
    params = {
        'origins': origins,
        'destinations': destinations,
        'key': GOOGLE_MAPS_API_KEY,
        'mode': 'driving',
    }
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params, timeout=15.0)
        resp.raise_for_status()
        data = resp.json()
        if data['status'] != 'OK':
            raise ValueError(f"Distance matrix error: {data.get('status')}")
        durations = []
        for row in data['rows']:
            for element in row['elements']:
                if element['status'] != 'OK':
                    durations.append(float('inf'))
                else:
                    durations.append(int(element['duration']['value']))
        return durations

# ---------------------------------------------------------------------------
# Simple star‑graph "Dijkstra" – pick minimum travel time
# ---------------------------------------------------------------------------

def _pick_minimum(distances: List[int]) -> Tuple[int, int]:
    """Return the index and value of the smallest distance.
    Raises if none reachable.
    """
    min_idx, min_val = -1, float('inf')
    for idx, val in enumerate(distances):
        if val < min_val:
            min_idx, min_val = idx, val
    if min_idx == -1:
        raise RuntimeError('No reachable ambulance stations found')
    return min_idx, min_val

async def compute_fastest_route(
    incident_address: str,
    stations: List[Tuple[float, float]],
) -> Dict[str, Any]:
    """High‑level helper used by the FastAPI endpoint.
    1️⃣ Geocode the incident.
    2️⃣ Get travel times to all stations.
    3️⃣ Pick the station with the smallest travel time.
    4️⃣ Return index, ETA and a placeholder polyline.
    """
    incident_latlng = await geocode_address(incident_address)
    travel_times = await distance_matrix(incident_latlng, stations)
    best_idx, best_time = _pick_minimum(travel_times)
    # Placeholder polyline (incident -> station)
    placeholder_polyline = f"{incident_latlng[0]},{incident_latlng[1]}|{stations[best_idx][0]},{stations[best_idx][1]}"
    return {
        'ambulance_index': best_idx,
        'eta_seconds': best_time,
        'polyline': placeholder_polyline,
    }

# ---------------------------------------------------------------------------
# Example static list of ambulance stations (lat, lng).
# In production use a DB table.
# ---------------------------------------------------------------------------
STATIONS: List[Tuple[float, float]] = [
    (28.6139, 77.2090),  # Delhi
    (19.0760, 72.8777),  # Mumbai
    (13.0827, 80.2707),  # Chennai
]

async def get_optimal_ambulance_route(incident_address: str) -> Dict[str, Any]:
    """Convenient wrapper using the hard‑coded STATIONS list."""
    return await compute_fastest_route(incident_address, STATIONS)
