/**
 * Geospatial computation utilities for CiviNexus AI
 */

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Calculates Haversine distance between two coordinates in meters
 */
export function calculateDistanceMeters(coord1: LatLng, coord2: LatLng): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);
  const lat1 = toRad(coord1.lat);
  const lat2 = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Computes geographic centroid of multiple coordinates
 */
export function calculateCentroid(coords: LatLng[]): LatLng {
  if (coords.length === 0) return { lat: 13.6288, lng: 79.4192 }; // Default Tirupati Municipal Center

  const sum = coords.reduce(
    (acc, curr) => ({
      lat: acc.lat + curr.lat,
      lng: acc.lng + curr.lng,
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: Number((sum.lat / coords.length).toFixed(6)),
    lng: Number((sum.lng / coords.length).toFixed(6)),
  };
}

/**
 * Computes maximum pairwise distance among a set of coordinates (corridor span)
 */
export function calculateMaxPairwiseDistance(coords: LatLng[]): number {
  if (coords.length < 2) return 0;
  let maxDist = 0;
  for (let i = 0; i < coords.length; i++) {
    for (let j = i + 1; j < coords.length; j++) {
      const dist = calculateDistanceMeters(coords[i], coords[j]);
      if (dist > maxDist) maxDist = dist;
    }
  }
  return maxDist;
}

/**
 * Human-readable distance display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

/**
 * Relative time formatter for civic report timestamps
 */
export function formatRelativeTime(isoString: string): string {
  try {
    const reportDate = new Date(isoString);
    const now = new Date('2026-10-24T05:24:00Z'); // Current simulation baseline
    const diffMs = now.getTime() - reportDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 14) return `${diffDays} days ago`;
    return reportDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}
