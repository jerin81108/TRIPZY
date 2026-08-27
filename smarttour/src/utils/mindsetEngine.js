// ============================================================
// SmartTour Mindset Recommendation Engine & Geo-Algorithms
// ============================================================

/**
 * Calculates Great-Circle Distance (Haversine Formula) between two coordinates in Kilometers
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 1 decimal place
}

/**
 * Estimated travel time based on road distance
 */
export function estimateTravelTime(distanceKm) {
  if (distanceKm <= 5) return `${Math.round(distanceKm * 4)} mins (Drive/Cab)`;
  if (distanceKm <= 30) return `${Math.round(distanceKm * 2)} mins (Drive)`;
  const hours = Math.floor(distanceKm / 50);
  const mins = Math.round(((distanceKm % 50) / 50) * 60);
  return `${hours}h ${mins > 0 ? `${mins}m` : ''} drive`;
}

/**
 * Multi-vector mindset scoring algorithm
 * Computes weighted similarity score between user preference vector and destination mindset vector
 */
export function scoreDestinationMindset(dest, userMindset) {
  const v = dest.mindsetVector || {};
  const dimensions = [
    { key: 'peace', weight: 1.2 },
    { key: 'adventure', weight: 1.2 },
    { key: 'spirituality', weight: 1.1 },
    { key: 'heritage', weight: 1.1 },
    { key: 'romance', weight: 1.0 },
    { key: 'foodie', weight: 1.0 },
    { key: 'nomad', weight: 1.0 },
    { key: 'family', weight: 1.0 },
    { key: 'nature', weight: 1.2 },
  ];

  let weightedSum = 0;
  let totalWeight = 0;
  let strongMatches = [];

  for (const dim of dimensions) {
    const userVal = userMindset[dim.key] ?? 50;
    const destVal = v[dim.key] ?? 50;

    // Proximity score: 100 - absolute difference
    const diff = Math.abs(userVal - destVal);
    const score = Math.max(0, 100 - diff * 0.85);

    weightedSum += score * dim.weight;
    totalWeight += dim.weight;

    if (userVal >= 65 && destVal >= 70) {
      strongMatches.push(dim.key);
    }
  }

  let finalScore = totalWeight > 0 ? weightedSum / totalWeight : 60;

  // Crowd tolerance penalty/boost
  const crowdTolerance = userMindset.crowdTolerance ?? 50;
  const destCrowd = v.crowdScore ?? 50;
  if (crowdTolerance < 40 && destCrowd > 65) {
    finalScore -= (destCrowd - 65) * 0.4;
  } else if (crowdTolerance < 40 && destCrowd < 40) {
    finalScore += 5; // boost peaceful low-crowd spots for zen seekers
  }

  // Budget factor
  if (userMindset.budgetLevel !== undefined && v.budgetLevel !== undefined) {
    const budgetDiff = Math.abs(userMindset.budgetLevel - v.budgetLevel);
    finalScore -= budgetDiff * 0.1;
  }

  const matchPercent = Math.min(99, Math.max(45, Math.round(finalScore)));

  // Generate dynamic explanation
  const matchLabels = {
    peace: 'Peaceful & tranquil vibe',
    adventure: 'High thrill & adventure energy',
    spirituality: 'Deep spiritual & devotional resonance',
    heritage: 'Rich cultural & historical depth',
    romance: 'Scenic romantic atmosphere',
    foodie: 'Exquisite local culinary flavors',
    nomad: 'Inspiring workspaces & chill cafes',
    family: 'High family safety & comfort',
    nature: 'Breathtaking pristine natural landscapes',
  };

  const rationale = strongMatches.length > 0
    ? `Matches your love for ${strongMatches.map(k => matchLabels[k] || k).slice(0, 2).join(' & ')}.`
    : `Balanced match for your current travel preferences with ${v.crowdScore || 40}% crowd density.`;

  return {
    matchPercent,
    rationale,
    strongMatches,
  };
}

/**
 * Parses user-uploaded CSV dataset string into structured objects
 */
export function parseCSVDataset(csvString) {
  const lines = csvString.trim().split('\n');
  if (lines.length < 2) throw new Error('CSV must contain header and at least one data row');

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle comma-separated values, basic split
    const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cols[idx] || '';
    });

    const item = {
      id: `uploaded-${Date.now()}-${i}`,
      name: row.name || `Custom Destination ${i}`,
      city: row.city || 'Tamil Nadu',
      state: row.state || 'Tamil Nadu',
      lat: parseFloat(row.lat) || 10.5,
      lng: parseFloat(row.lng) || 78.5,
      category: row.category || 'Mindset Destination',
      image: row.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
      description: row.description || 'Custom added destination tailored for mindset travel exploration.',
      entryFee: parseInt(row.entryfee || row.fee || 0, 10),
      rating: parseFloat(row.rating) || 4.8,
      vibeTags: row.vibes ? row.vibes.split(';').map(t => t.trim()) : ['Scenic', 'Mindset Pick'],
      mindsetVector: {
        spirituality: parseInt(row.spirituality || row.spiritual || 50, 10),
        heritage: parseInt(row.heritage || 50, 10),
        peace: parseInt(row.peace || 50, 10),
        adventure: parseInt(row.adventure || 50, 10),
        romance: parseInt(row.romance || 50, 10),
        foodie: parseInt(row.foodie || 50, 10),
        nomad: parseInt(row.nomad || 50, 10),
        family: parseInt(row.family || 50, 10),
        nature: parseInt(row.nature || 50, 10),
        budgetLevel: parseInt(row.budgetlevel || row.budget || 40, 10),
        pace: parseInt(row.pace || 50, 10),
        crowdScore: parseInt(row.crowdscore || row.crowd || 35, 10),
      },
      reels: [
        {
          id: `uploaded-reel-${i}`,
          title: `Exploring ${row.name || 'this gem'} 🌟`,
          creator: '@smarttour_community',
          videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
          thumbnail: row.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80',
          views: '50K',
          likes: '6.2K',
          song: 'Chill Travel Beats',
          duration: '0:25'
        }
      ]
    };
    results.push(item);
  }

  return results;
}

/**
 * Generates sample CSV template for user download
 */
export function generateSampleCSV(dataset) {
  const headers = [
    'name', 'city', 'state', 'category', 'lat', 'lng', 'rating', 'entryFee',
    'peace', 'adventure', 'spirituality', 'heritage', 'romance', 'foodie', 'nomad', 'family', 'nature',
    'crowdScore', 'vibes', 'description'
  ];

  const rows = dataset.map(d => {
    const v = d.mindsetVector || {};
    return [
      `"${d.name}"`,
      `"${d.city}"`,
      `"${d.state}"`,
      `"${d.category}"`,
      d.lat,
      d.lng,
      d.rating || 4.8,
      d.entryFee || 0,
      v.peace || 50,
      v.adventure || 50,
      v.spirituality || 50,
      v.heritage || 50,
      v.romance || 50,
      v.foodie || 50,
      v.nomad || 50,
      v.family || 50,
      v.nature || 50,
      v.crowdScore || 40,
      `"${(d.vibeTags || []).join(';')}"`,
      `"${(d.description || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
