/**
 * Geo utilities for UAV Mission Planning.
 *
 * All calculations are performed purely on the client (no backend dependency).
 * These helpers are intentionally framework-agnostic so they can later be
 * reused or mirrored server-side once the FastAPI backend is introduced.
 */

const EARTH_RADIUS_METERS = 6371000;

/**
 * Sensible default demo map center for a new mission — an agricultural
 * region near Roorkee, Uttarakhand. This does NOT represent any user's real
 * farm; it is only a starting viewport for planning.
 */
export const DEFAULT_MAP_CENTER = [29.8656, 77.8965];

/**
 * Convert degrees to radians.
 * @param {number} deg
 * @returns {number}
 */
function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Great-circle distance between two GPS coordinates using the Haversine formula.
 * @param {{latitude:number, longitude:number}} pointA
 * @param {{latitude:number, longitude:number}} pointB
 * @returns {number} distance in meters
 */
export function haversineDistanceMeters(pointA, pointB) {
  if (!pointA || !pointB) return 0;

  const lat1 = toRadians(pointA.latitude);
  const lat2 = toRadians(pointB.latitude);
  const deltaLat = toRadians(pointB.latitude - pointA.latitude);
  const deltaLon = toRadians(pointB.longitude - pointA.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Total route distance across an ordered list of waypoints (sequential, not a closed loop).
 * @param {Array<{latitude:number, longitude:number}>} waypoints
 * @returns {number} total distance in meters
 */
export function calculateRouteDistance(waypoints) {
  if (!Array.isArray(waypoints) || waypoints.length < 2) return 0;

  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    total += haversineDistanceMeters(waypoints[i], waypoints[i + 1]);
  }
  return total;
}

/**
 * Estimated flight time in seconds, given a total distance (meters) and speed (m/s).
 * @param {number} distanceMeters
 * @param {number} speedMetersPerSecond
 * @returns {number} seconds (0 if speed is invalid)
 */
export function calculateFlightTimeSeconds(distanceMeters, speedMetersPerSecond) {
  if (!speedMetersPerSecond || speedMetersPerSecond <= 0) return 0;
  if (!distanceMeters || distanceMeters <= 0) return 0;
  return distanceMeters / speedMetersPerSecond;
}

/**
 * Human-readable distance string. Uses meters under 1km, kilometers above.
 * @param {number} meters
 * @returns {string}
 */
export function formatDistance(meters) {
  if (!meters || meters <= 0) return '0 m';
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
}

/**
 * Human-readable duration string. Uses seconds under 60s, minutes+seconds above.
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '0 sec';
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes} min ${remainingSeconds.toString().padStart(2, '0')} sec`;
}

/**
 * Generates a reasonably unique id for a mission or waypoint without a backend.
 * Falls back gracefully if crypto.randomUUID is unavailable.
 * @param {string} prefix
 * @returns {string}
 */
export function generateLocalId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
