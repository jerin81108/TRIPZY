// ============================================================
// Tripzy Backend Server
// Zero-dependency Node.js HTTP Server with full CORS & REST API
// Maintained for: Mindset AI, Geolocation Nearby, Reels Stream,
// Opinions & Reactions, and 1-to-1 Messaging
// ============================================================

import http from 'node:http';
import url from 'node:url';

const PORT = process.env.PORT || 5000;

// In-memory data store for server
let serverDataset = [
  {
    id: 'mindset-dest-01',
    name: 'Meenakshi Amman Temple',
    city: 'Madurai',
    state: 'Tamil Nadu',
    lat: 9.9195,
    lng: 78.1193,
    category: 'Spiritual & Heritage',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80',
    description: 'Iconic Dravidian architecture with 14 majestic gopurams. A spiritual epicenter resonant with chanting and rituals.',
    mindsetVector: { spirituality: 98, heritage: 95, peace: 55, adventure: 20, romance: 40, foodie: 85, nomad: 30, family: 90, nature: 25, crowdScore: 78 },
    vibeTags: ['Sacred Chants', 'Architectural Marvel', 'Temple Prasadam'],
    entryFee: 0,
    rating: 4.9,
    reels: [
      { id: 'reel-m1', title: 'Morning Aarti & Golden Lotus Tank Vibe ✨', creator: '@madurai_explorer', views: '124K', likes: '14.2K', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-smoke-and-fire-particles-in-the-dark-41584-large.mp4', thumbnail: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80' }
    ]
  },
  {
    id: 'mindset-dest-02',
    name: 'Kodaikanal Pine Forest & Vattakanal',
    city: 'Kodaikanal',
    state: 'Tamil Nadu',
    lat: 10.2381,
    lng: 77.4892,
    category: 'Nature & Solitude',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
    description: 'Misty pine canopies, hidden waterfalls, and bohemian mountain cafes. Perfect for deep reflection and slow living.',
    mindsetVector: { spirituality: 65, heritage: 30, peace: 95, adventure: 80, romance: 92, foodie: 70, nomad: 90, family: 75, nature: 98, crowdScore: 35 },
    vibeTags: ['Misty Trails', 'Campfire Acoustic', 'Cafe Working', 'Zen Solitude'],
    entryFee: 20,
    rating: 4.8,
    reels: [
      { id: 'reel-k1', title: 'Walking through clouds in Vatta Forest 🌲🌫️', creator: '@kodai_wanderer', views: '340K', likes: '42K', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4', thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80' }
    ]
  },
  {
    id: 'mindset-dest-03',
    name: 'Kolli Hills 70 Hairpin Bends',
    city: 'Namakkal',
    state: 'Tamil Nadu',
    lat: 11.2485,
    lng: 78.3389,
    category: 'Adrenaline & Adventure',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    description: '70 thrilling hairpin curves leading to Agaya Gangai waterfall. A paradise for bikers and trek enthusiasts.',
    mindsetVector: { spirituality: 40, heritage: 35, peace: 60, adventure: 98, romance: 50, foodie: 40, nomad: 45, family: 40, nature: 90, crowdScore: 25 },
    vibeTags: ['70 Hairpin Thrill', 'Agaya Gangai Trek', 'Biker Heaven'],
    entryFee: 10,
    rating: 4.7,
    reels: [
      { id: 'reel-kh1', title: '70 Hairpin bends on Royal Enfield 🔥🏍️', creator: '@tamilnadu_riders', views: '210K', likes: '28K', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-winding-mountain-road-42777-large.mp4', thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80' }
    ]
  },
  {
    id: 'mindset-dest-04',
    name: 'Dhanushkodi Ghost Town & Lands End',
    city: 'Rameswaram',
    state: 'Tamil Nadu',
    lat: 9.1764,
    lng: 79.4183,
    category: 'Spiritual & Soul-Searching',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    description: 'Where two oceans meet at the edge of India. Evokes deep existential peace and awe.',
    mindsetVector: { spirituality: 92, heritage: 78, peace: 94, adventure: 82, romance: 75, foodie: 35, nomad: 60, family: 70, nature: 96, crowdScore: 30 },
    vibeTags: ['Two Oceans Meeting', 'Ghost Town Mystery', 'Deep Solitude'],
    entryFee: 0,
    rating: 4.8,
    reels: [
      { id: 'reel-dh1', title: 'Standing where Bay of Bengal meets Indian Ocean 🌊', creator: '@wanderlust_india', views: '512K', likes: '63K', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4', thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80' }
    ]
  },
  {
    id: 'mindset-dest-05',
    name: 'Chettinad Heritage Mansions & Culinary Trail',
    city: 'Karaikudi',
    state: 'Tamil Nadu',
    lat: 10.0712,
    lng: 78.7844,
    category: 'Heritage & Foodie',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',
    description: '10,000 antique mansions with Burmese teak pillars and legendary aromatic Chettinad cuisine.',
    mindsetVector: { spirituality: 50, heritage: 98, peace: 82, adventure: 30, romance: 78, foodie: 99, nomad: 65, family: 88, nature: 40, crowdScore: 28 },
    vibeTags: ['Authentic Spices', 'Thousand Window Palace', 'Athangudi Tiles'],
    entryFee: 50,
    rating: 4.9,
    reels: [
      { id: 'reel-ch1', title: 'Authentic 24-item Chettinad Feast on Banana Leaf 🌶️🤤', creator: '@chennai_food_guide', views: '430K', likes: '51K', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-table-with-traditional-food-43555-large.mp4', thumbnail: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80' }
    ]
  },
  {
    id: 'mindset-dest-06',
    name: 'Auroville & Promenade Beach',
    city: 'Puducherry',
    state: 'Puducherry',
    lat: 11.9416,
    lng: 79.8083,
    category: 'Zen, Nomad & Romantic',
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&q=80',
    description: 'French colonial boulevards, beachfront cafes, Matrimandir golden globe meditation, and co-working spaces.',
    mindsetVector: { spirituality: 88, heritage: 80, peace: 90, adventure: 45, romance: 96, foodie: 92, nomad: 98, family: 82, nature: 75, crowdScore: 50 },
    vibeTags: ['French Quarters', 'Matrimandir Silence', 'Digital Nomad Haven'],
    entryFee: 0,
    rating: 4.85,
    reels: [
      { id: 'reel-pon1', title: 'French Colony cycling & Sunset by the Promenade 🥐🚴‍♀️', creator: '@pondydiaries', views: '680K', likes: '78K', videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-drinking-coffee-at-a-cafe-terrace-43407-large.mp4', thumbnail: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600&q=80' }
    ]
  }
];

let serverOpinions = [
  {
    id: 'op-init-1',
    businessId: 'biz-u01',
    businessName: 'Rajan Heritage Walks',
    touristId: 'user-demo-01',
    touristName: 'Arjun Mehta',
    rating: 5,
    comment: 'The early morning heritage walk inside Mylapore and temple corridors was breathtaking! The storytelling was so immersive.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    reactions: [{ emoji: '❤️', from: 'biz-u01' }, { emoji: '🙏', from: 'biz-u01' }],
    responses: [
      {
        id: 'resp-1',
        responderId: 'biz-u01',
        responderName: 'Rajan Heritage Walks',
        text: 'Thank you so much Arjun! Delighted that you enjoyed the cultural lore. Looking forward to hosting you on our Thanjavur art trail next!',
        timestamp: new Date(Date.now() - 43200000).toISOString()
      }
    ]
  },
  {
    id: 'op-init-2',
    businessId: 'biz-demo-01',
    businessName: 'Rajan Heritage Walks',
    touristId: 'user-t02',
    touristName: 'Priya Sharma',
    rating: 5,
    comment: 'Exceptional attention to history, safe group navigation, and fantastic local tea breaks.',
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    reactions: [{ emoji: '👍', from: 'biz-demo-01' }],
    responses: []
  }
];

let serverMessages = {};

// In-memory store for role requests (admin/responder approval)
let roleRequests = [];

// Helper: Haversine distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Helper: Score destination for user mindset
function scoreDest(dest, userMindset) {
  const v = dest.mindsetVector || {};
  const dimensions = ['peace', 'adventure', 'spirituality', 'heritage', 'romance', 'foodie', 'nomad', 'family', 'nature'];
  let sum = 0;
  let matches = [];

  for (const dim of dimensions) {
    const uVal = userMindset[dim] ?? 50;
    const dVal = v[dim] ?? 50;
    const score = Math.max(0, 100 - Math.abs(uVal - dVal) * 0.9);
    sum += score;
    if (uVal >= 65 && dVal >= 70) matches.push(dim);
  }

  let finalScore = sum / dimensions.length;
  if ((userMindset.crowdTolerance ?? 50) < 40 && (v.crowdScore ?? 50) > 65) {
    finalScore -= 12;
  }
  const matchPercent = Math.min(99, Math.max(45, Math.round(finalScore)));
  return { matchPercent, strongMatches: matches };
}

// HTTP request handler
const server = http.createServer((req, res) => {
  // Setup CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // JSON helper
  const sendJSON = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  // Helper to read JSON body
  const readBody = (callback) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        callback(null, parsed);
      } catch (err) {
        callback(err, null);
      }
    });
  };

  // Routes
  if (pathname === '/api/health' && req.method === 'GET') {
    sendJSON(200, { status: 'ok', server: 'Tripzy Mindset AI & Geo Server', time: new Date().toISOString() });
    return;
  }

  // 1. Mindset Recommendations
  if (pathname === '/api/recommendations/mindset' && req.method === 'POST') {
    readBody((err, body) => {
      if (err) return sendJSON(400, { error: 'Invalid JSON body' });
      const userMindset = body.mindset || {};
      const limit = parseInt(query.limit || '10', 10);

      const scored = serverDataset.map(dest => {
        const { matchPercent, strongMatches } = scoreDest(dest, userMindset);
        return {
          ...dest,
          matchPercent,
          strongMatches,
          rationale: `AI Match: ${matchPercent}% compatibility with your selected mindset profile.`
        };
      });

      scored.sort((a, b) => b.matchPercent - a.matchPercent);
      sendJSON(200, {
        count: scored.length,
        recommendations: scored.slice(0, limit),
        appliedMindset: userMindset
      });
    });
    return;
  }

  // 2. Nearby Places (Geo-Radar)
  if (pathname === '/api/places/nearby' && req.method === 'GET') {
    const lat = parseFloat(query.lat || '9.9195');
    const lng = parseFloat(query.lng || '78.1193');
    const radiusKm = parseFloat(query.radius || '250');
    const category = query.category;

    let nearby = serverDataset.map(dest => {
      const dist = calculateDistance(lat, lng, dest.lat, dest.lng);
      return { ...dest, distanceKm: dist };
    });

    if (category && category !== 'all') {
      nearby = nearby.filter(d => d.category.toLowerCase().includes(category.toLowerCase()));
    }

    nearby = nearby.filter(d => d.distanceKm <= radiusKm);
    nearby.sort((a, b) => a.distanceKm - b.distanceKm);

    sendJSON(200, {
      origin: { lat, lng },
      radiusKm,
      count: nearby.length,
      places: nearby
    });
    return;
  }

  // 3. Related Reels Stream
  if (pathname === '/api/reels/related' && req.method === 'GET') {
    const placeId = query.placeId;
    let allReels = [];

    if (placeId) {
      const place = serverDataset.find(d => d.id === placeId);
      allReels = place ? place.reels || [] : [];
    } else {
      serverDataset.forEach(d => {
        if (d.reels) {
          d.reels.forEach(r => {
            allReels.push({ ...r, placeId: d.id, placeName: d.name, placeCity: d.city });
          });
        }
      });
    }

    sendJSON(200, { count: allReels.length, reels: allReels });
    return;
  }

  // 4. Opinions System (GET & POST)
  if (pathname === '/api/opinions' && req.method === 'GET') {
    const businessId = query.businessId;
    const touristId = query.touristId;
    let results = serverOpinions;
    if (businessId) results = results.filter(o => o.businessId === businessId);
    if (touristId) results = results.filter(o => o.touristId === touristId);
    sendJSON(200, { opinions: results });
    return;
  }

  if (pathname === '/api/opinions' && req.method === 'POST') {
    readBody((err, body) => {
      if (err) return sendJSON(400, { error: 'Invalid JSON body' });
      const newOp = {
        id: `op-${Date.now()}`,
        businessId: body.businessId,
        businessName: body.businessName || 'Business',
        touristId: body.touristId || 'user-demo-01',
        touristName: body.touristName || 'Tourist',
        rating: body.rating || 5,
        comment: body.comment || '',
        timestamp: new Date().toISOString(),
        reactions: [],
        responses: []
      };
      serverOpinions.unshift(newOp);
      sendJSON(201, { success: true, opinion: newOp });
    });
    return;
  }

  // Opinion Reaction
  if (pathname.startsWith('/api/opinions/') && pathname.endsWith('/react') && req.method === 'POST') {
    const parts = pathname.split('/');
    const opId = parts[3];
    readBody((err, body) => {
      const op = serverOpinions.find(o => o.id === opId);
      if (!op) return sendJSON(404, { error: 'Opinion not found' });
      if (!op.reactions) op.reactions = [];
      const emoji = body.emoji || '👍';
      const from = body.from || 'business';

      // Toggle or add reaction
      const existingIdx = op.reactions.findIndex(r => r.emoji === emoji && r.from === from);
      if (existingIdx >= 0) {
        op.reactions.splice(existingIdx, 1);
      } else {
        op.reactions.push({ emoji, from, timestamp: new Date().toISOString() });
      }
      sendJSON(200, { success: true, reactions: op.reactions });
    });
    return;
  }

  // Opinion Response
  if (pathname.startsWith('/api/opinions/') && pathname.endsWith('/respond') && req.method === 'POST') {
    const parts = pathname.split('/');
    const opId = parts[3];
    readBody((err, body) => {
      const op = serverOpinions.find(o => o.id === opId);
      if (!op) return sendJSON(404, { error: 'Opinion not found' });
      if (!op.responses) op.responses = [];
      const responseObj = {
        id: `resp-${Date.now()}`,
        responderId: body.responderId || 'business',
        responderName: body.responderName || 'Business Owner',
        text: body.text || '',
        timestamp: new Date().toISOString()
      };
      op.responses.push(responseObj);
      sendJSON(200, { success: true, response: responseObj, allResponses: op.responses });
    });
    return;
  }

  // 5. Dataset Management
  if (pathname === '/api/dataset' && req.method === 'GET') {
    sendJSON(200, { total: serverDataset.length, dataset: serverDataset });
    return;
  }

  if (pathname === '/api/dataset/upload' && req.method === 'POST') {
    readBody((err, body) => {
      if (err) return sendJSON(400, { error: 'Invalid JSON body' });
      const items = Array.isArray(body) ? body : body.items || [];
      if (!items || items.length === 0) return sendJSON(400, { error: 'No items provided' });

      // Add to server dataset
      serverDataset = [...items, ...serverDataset];
      sendJSON(200, { success: true, addedCount: items.length, totalDataset: serverDataset.length });
    });
    return;
  }

  // 6. Direct 1-on-1 Messages
  if (pathname === '/api/messages' && req.method === 'GET') {
    const convId = query.convId;
    if (convId) {
      sendJSON(200, { messages: serverMessages[convId] || [] });
    } else {
      sendJSON(200, { allMessages: serverMessages });
    }
    return;
  }

  if (pathname === '/api/messages' && req.method === 'POST') {
    readBody((err, body) => {
      const { fromUserId, toUserId, content } = body;
      if (!fromUserId || !toUserId || !content) {
        return sendJSON(400, { error: 'Missing fromUserId, toUserId, or content' });
      }
      const convId = [fromUserId, toUserId].sort().join('_');
      if (!serverMessages[convId]) serverMessages[convId] = [];

      const newMsg = {
        id: `msg-${Date.now()}`,
        senderId: fromUserId,
        receiverId: toUserId,
        content,
        timestamp: new Date().toISOString(),
        read: false
      };
      serverMessages[convId].push(newMsg);
      sendJSON(201, { success: true, message: newMsg, convId });
    });
    return;
  }

  // 7. Role Registration Requests (Admin/Responder Approval)
  if (pathname === '/api/role-requests' && req.method === 'GET') {
    const status = query.status; // optional filter: 'pending', 'approved', 'rejected'
    let results = roleRequests;
    if (status) results = results.filter(r => r.status === status);
    sendJSON(200, { roleRequests: results });
    return;
  }

  if (pathname === '/api/role-requests' && req.method === 'POST') {
    readBody((err, body) => {
      if (err) return sendJSON(400, { error: 'Invalid JSON body' });
      if (!body.name || !body.role) return sendJSON(400, { error: 'Missing name or role' });

      const newRequest = {
        id: `role-req-${Date.now()}`,
        name: body.name,
        username: body.username || `@${body.name.toLowerCase().replace(/\s+/g, '_')}`,
        email: body.email || '',
        role: body.role,
        avatar: body.avatar || body.name.slice(0, 2).toUpperCase(),
        location: body.location || 'Tamil Nadu, India',
        bio: body.bio || '',
        interests: body.interests || [],
        badge: body.badge || '',
        status: 'pending',
        requestedAt: new Date().toISOString(),
        reviewedBy: null,
        reviewedAt: null,
      };
      roleRequests.unshift(newRequest);
      sendJSON(201, { success: true, roleRequest: newRequest });
    });
    return;
  }

  if (pathname.startsWith('/api/role-requests/') && pathname.endsWith('/approve') && req.method === 'PUT') {
    const parts = pathname.split('/');
    const reqId = parts[3];
    readBody((err, body) => {
      const rr = roleRequests.find(r => r.id === reqId);
      if (!rr) return sendJSON(404, { error: 'Role request not found' });
      if (rr.status !== 'pending') return sendJSON(400, { error: `Request already ${rr.status}` });
      rr.status = 'approved';
      rr.reviewedBy = body.reviewedBy || 'admin';
      rr.reviewedAt = new Date().toISOString();
      sendJSON(200, { success: true, roleRequest: rr });
    });
    return;
  }

  if (pathname.startsWith('/api/role-requests/') && pathname.endsWith('/reject') && req.method === 'PUT') {
    const parts = pathname.split('/');
    const reqId = parts[3];
    readBody((err, body) => {
      const rr = roleRequests.find(r => r.id === reqId);
      if (!rr) return sendJSON(404, { error: 'Role request not found' });
      if (rr.status !== 'pending') return sendJSON(400, { error: `Request already ${rr.status}` });
      rr.status = 'rejected';
      rr.reviewedBy = body.reviewedBy || 'admin';
      rr.reviewedAt = new Date().toISOString();
      sendJSON(200, { success: true, roleRequest: rr });
    });
    return;
  }

  // 404 Fallback
  sendJSON(404, { error: 'Endpoint not found' });
});

server.listen(PORT, () => {
  console.log(`🚀 Tripzy Backend Server running on http://localhost:${PORT}`);
});
