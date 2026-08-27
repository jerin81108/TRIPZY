// ============================================================
// SmartTour API Service
// Connects to Backend Server (http://localhost:5000) with local fallbacks
// ============================================================

import { calculateDistance, scoreDestinationMindset } from '../utils/mindsetEngine';

const API_BASE = 'http://localhost:5000/api';

/**
 * Checks if the backend server is reachable
 */
export async function checkServerHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1500) });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch Mindset Recommendations from Server or fallback to client model
 */
export async function getMindsetRecommendations(userMindset, dataset) {
  try {
    const res = await fetch(`${API_BASE}/recommendations/mindset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mindset: userMindset }),
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.recommendations) {
        return { source: 'backend-server', list: data.recommendations };
      }
    }
  } catch {
    // Fallback to local engine
  }

  // Local model calculation
  const list = dataset.map(dest => {
    const { matchPercent, rationale, strongMatches } = scoreDestinationMindset(dest, userMindset);
    return {
      ...dest,
      matchPercent,
      rationale,
      strongMatches,
    };
  });
  list.sort((a, b) => b.matchPercent - a.matchPercent);

  return { source: 'client-ai-engine', list };
}

/**
 * Fetch Nearby Places by Geolocation
 */
export async function getNearbyPlaces(lat, lng, radiusKm, category, dataset) {
  try {
    const url = new URL(`${API_BASE}/places/nearby`);
    url.searchParams.set('lat', lat);
    url.searchParams.set('lng', lng);
    url.searchParams.set('radius', radiusKm);
    if (category) url.searchParams.set('category', category);

    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.places) {
        return { source: 'backend-server', places: data.places };
      }
    }
  } catch {
    // Fallback to local
  }

  let places = dataset.map(d => {
    const dist = calculateDistance(lat, lng, d.lat, d.lng);
    return { ...d, distanceKm: dist };
  });

  if (category && category !== 'all') {
    places = places.filter(d => d.category?.toLowerCase().includes(category.toLowerCase()));
  }

  places = places.filter(d => d.distanceKm <= radiusKm);
  places.sort((a, b) => a.distanceKm - b.distanceKm);

  return { source: 'client-geo-radar', places };
}

/**
 * Fetch Related Reels / Short Videos
 */
export async function getRelatedReels(placeId, dataset) {
  try {
    const url = new URL(`${API_BASE}/reels/related`);
    if (placeId) url.searchParams.set('placeId', placeId);
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.reels) {
        return data.reels;
      }
    }
  } catch {
    // Fallback
  }

  let allReels = [];
  if (placeId) {
    const place = dataset.find(d => d.id === placeId);
    allReels = place ? place.reels || [] : [];
  } else {
    dataset.forEach(d => {
      if (d.reels) {
        d.reels.forEach(r => {
          allReels.push({ ...r, placeId: d.id, placeName: d.name, placeCity: d.city });
        });
      }
    });
  }

  return allReels;
}

/**
 * Sync Dataset to Backend Server
 */
export async function uploadDatasetToServer(items) {
  try {
    const res = await fetch(`${API_BASE}/dataset/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return { success: true, fallback: true, count: items.length };
}

/**
 * Send Opinion to Server
 */
export async function sendOpinionToServer(opinion) {
  try {
    const res = await fetch(`${API_BASE}/opinions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opinion),
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback
  }
  return { success: true, local: true };
}

/**
 * Send Opinion Reaction to Server
 */
export async function reactToOpinionOnServer(opinionId, emoji, from) {
  try {
    const res = await fetch(`${API_BASE}/opinions/${opinionId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji, from }),
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return { success: true, local: true };
}

/**
 * Send Opinion Response to Server
 */
export async function respondToOpinionOnServer(opinionId, responseData) {
  try {
    const res = await fetch(`${API_BASE}/opinions/${opinionId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(responseData),
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) return await res.json();
  } catch {
    // Fallback
  }
  return { success: true, local: true };
}
