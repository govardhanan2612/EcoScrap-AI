// EcoScrap AI — geo utilities. Pure math, no external mapping API, no network calls.

// Great-circle distance between two lat/lng points, in kilometers.
function haversineKm(lat1, lng1, lat2, lng2) {
  if ([lat1, lng1, lat2, lng2].some((v) => typeof v !== 'number' || Number.isNaN(v))) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Greedy nearest-neighbor route ordering — not a true shortest-route solver (that's an
// NP-hard TSP), but a standard, fast, good-enough heuristic for a handful of daily pickup
// stops, which is what a real kabadiwala's route looks like.
function nearestNeighborRoute(startCoord, stops) {
  const remaining = stops.slice();
  const ordered = [];
  let current = startCoord;

  while (remaining.length) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(current.latitude, current.longitude, remaining[i].latitude, remaining[i].longitude);
      const dist = d === null ? Infinity : d;
      if (dist < bestDist) { bestDist = dist; bestIdx = i; }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push({ ...next, distanceFromPrevKm: bestDist === Infinity ? null : bestDist });
    current = next;
  }

  return ordered;
}

window.GeoUtils = { haversineKm, nearestNeighborRoute };
