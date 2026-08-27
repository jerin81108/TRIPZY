// ============================================================
// SmartTour Mindset & Recommendations Dataset
// Includes mindset dimensions: peace, adventure, spirituality, heritage, romance, foodie, nomad, family, nature, budgetLevel, pace
// ============================================================

export const DEFAULT_MINDSET_DATASET = [
  {
    id: 'mindset-dest-01',
    name: 'Meenakshi Amman Temple',
    city: 'Madurai',
    state: 'Tamil Nadu',
    lat: 9.9195,
    lng: 78.1193,
    category: 'Spiritual & Heritage',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80',
    description: 'Iconic Dravidian architecture with 14 majestic gopurams. A spiritual epicenter resonant with chanting, ancient rituals, and spiritual awakening.',
    mindsetVector: {
      spirituality: 98,
      heritage: 95,
      peace: 55,
      adventure: 20,
      romance: 40,
      foodie: 85,
      nomad: 30,
      family: 90,
      nature: 25,
      budgetLevel: 30,
      pace: 40,
      crowdScore: 78,
    },
    vibeTags: ['Sacred Chants', 'Architectural Marvel', 'Temple Prasadam', 'Ancient History'],
    bestMindset: ['spiritual', 'heritage', 'family'],
    entryFee: 0,
    rating: 4.9,
    reels: [
      {
        id: 'reel-m1',
        title: 'Morning Aarti & Golden Lotus Tank Vibe ✨',
        creator: '@madurai_explorer',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-smoke-and-fire-particles-in-the-dark-41584-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80',
        views: '124K',
        likes: '14.2K',
        song: 'Divine Temple Flute & Bells',
        duration: '0:28'
      },
      {
        id: 'reel-m2',
        title: 'Famous Madurai Jigarthanda & Street Bites 🍧',
        creator: '@foodie_tamilan',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-cup-of-hot-coffee-43338-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
        views: '88K',
        likes: '9.8K',
        song: 'Madurai Folk Beats',
        duration: '0:34'
      }
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
    description: 'Misty pine canopies, hidden waterfalls, and bohemian mountain cafes. Perfect for deep reflection, slow living, and artistic inspiration.',
    mindsetVector: {
      spirituality: 65,
      heritage: 30,
      peace: 95,
      adventure: 80,
      romance: 92,
      foodie: 70,
      nomad: 90,
      family: 75,
      nature: 98,
      budgetLevel: 45,
      pace: 25,
      crowdScore: 35,
    },
    vibeTags: ['Misty Trails', 'Campfire Acoustic', 'Cafe Working', 'Zen Solitude'],
    bestMindset: ['zen', 'nomad', 'romance', 'nature'],
    entryFee: 20,
    rating: 4.8,
    reels: [
      {
        id: 'reel-k1',
        title: 'Walking through clouds in Vatta Forest 🌲🌫️',
        creator: '@kodai_wanderer',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80',
        views: '340K',
        likes: '42K',
        song: 'Indie Mountain Acoustic Vibes',
        duration: '0:30'
      }
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
    description: '70 thrilling hairpin curves leading to Agaya Gangai waterfall. A paradise for bikers, trek enthusiasts, and adrenaline thrill-seekers.',
    mindsetVector: {
      spirituality: 40,
      heritage: 35,
      peace: 60,
      adventure: 98,
      romance: 50,
      foodie: 40,
      nomad: 45,
      family: 40,
      nature: 90,
      budgetLevel: 30,
      pace: 92,
      crowdScore: 25,
    },
    vibeTags: ['70 Hairpin Thrill', 'Agaya Gangai Trek', 'Biker Heaven', 'Pure Adrenaline'],
    bestMindset: ['thrill', 'adventure', 'nature'],
    entryFee: 10,
    rating: 4.7,
    reels: [
      {
        id: 'reel-kh1',
        title: '70 Hairpin bends on Royal Enfield 🔥🏍️',
        creator: '@tamilnadu_riders',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-winding-mountain-road-42777-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
        views: '210K',
        likes: '28K',
        song: 'Bass Boosted Rider Anthem',
        duration: '0:35'
      }
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
    description: 'Where two oceans meet at the edge of India. Ghostly remnants of the 1964 cyclone evoke deep existential peace and awe.',
    mindsetVector: {
      spirituality: 92,
      heritage: 78,
      peace: 94,
      adventure: 82,
      romance: 75,
      foodie: 35,
      nomad: 60,
      family: 70,
      nature: 96,
      budgetLevel: 25,
      pace: 35,
      crowdScore: 30,
    },
    vibeTags: ['Two Oceans Meeting', 'Ghost Town Mystery', 'Deep Solitude', 'End of Earth'],
    bestMindset: ['spiritual', 'zen', 'adventure'],
    entryFee: 0,
    rating: 4.8,
    reels: [
      {
        id: 'reel-dh1',
        title: 'Standing where Bay of Bengal meets Indian Ocean 🌊',
        creator: '@wanderlust_india',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-waves-in-the-water-1164-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
        views: '512K',
        likes: '63K',
        song: 'Ocean Waves & Ambient Piano',
        duration: '0:42'
      }
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
    description: '10,000 antique mansions with Burmese teak pillars, Belgian glass, and the legendary aromatic Chettinad spice cuisine.',
    mindsetVector: {
      spirituality: 50,
      heritage: 98,
      peace: 82,
      adventure: 30,
      romance: 78,
      foodie: 99,
      nomad: 65,
      family: 88,
      nature: 40,
      budgetLevel: 60,
      pace: 30,
      crowdScore: 28,
    },
    vibeTags: ['Authentic Spices', 'Thousand Window Palace', 'Athangudi Tiles', 'Royal Living'],
    bestMindset: ['foodie', 'heritage', 'family'],
    entryFee: 50,
    rating: 4.9,
    reels: [
      {
        id: 'reel-ch1',
        title: 'Authentic 24-item Chettinad Feast on Banana Leaf 🌶️🤤',
        creator: '@chennai_food_guide',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-table-with-traditional-food-43555-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80',
        views: '430K',
        likes: '51K',
        song: 'Spicy South Beats',
        duration: '0:31'
      }
    ]
  },
  {
    id: 'mindset-dest-06',
    name: 'Auroville & Promenade Beach',
    city: 'Puducherry / Pondicherry',
    state: 'Tamil Nadu & Puducherry',
    lat: 11.9416,
    lng: 79.8083,
    category: 'Zen, Nomad & Romantic',
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800&q=80',
    description: 'French colonial boulevards, beachfront cafes, Matrimandir golden globe meditation, and digital nomad co-working spaces.',
    mindsetVector: {
      spirituality: 88,
      heritage: 80,
      peace: 90,
      adventure: 45,
      romance: 96,
      foodie: 92,
      nomad: 98,
      family: 82,
      nature: 75,
      budgetLevel: 55,
      pace: 30,
      crowdScore: 50,
    },
    vibeTags: ['French Quarters', 'Matrimandir Silence', 'Croissants & Gelato', 'Digital Nomad Haven'],
    bestMindset: ['nomad', 'romance', 'zen', 'foodie'],
    entryFee: 0,
    rating: 4.85,
    reels: [
      {
        id: 'reel-pon1',
        title: 'French Colony cycling & Sunset by the Promenade 🥐🚴‍♀️',
        creator: '@pondydiaries',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-drinking-coffee-at-a-cafe-terrace-43407-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600&q=80',
        views: '680K',
        likes: '78K',
        song: 'Lo-Fi Chill French Accordion',
        duration: '0:38'
      }
    ]
  },
  {
    id: 'mindset-dest-07',
    name: 'Anamalai Tiger Reserve & Valparai Tea Valleys',
    city: 'Pollachi / Valparai',
    state: 'Tamil Nadu',
    lat: 10.3262,
    lng: 76.9554,
    category: 'Nature & Wildlife',
    image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=800&q=80',
    description: '40 hairpin curves through emerald tea plantations, Lion-tailed Macaques, wild elephants, and crisp mountain air.',
    mindsetVector: {
      spirituality: 60,
      heritage: 25,
      peace: 94,
      adventure: 88,
      romance: 85,
      foodie: 60,
      nomad: 70,
      family: 75,
      nature: 99,
      budgetLevel: 40,
      pace: 45,
      crowdScore: 22,
    },
    vibeTags: ['Emerald Tea Carpets', 'Wild Elephant Spotting', 'Untouched Western Ghats', 'Pure Clean Air'],
    bestMindset: ['nature', 'zen', 'adventure'],
    entryFee: 60,
    rating: 4.9,
    reels: [
      {
        id: 'reel-val1',
        title: 'Morning mist rolling over Valparai tea estates 🍃☕',
        creator: '@western_ghats_diaries',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&q=80',
        views: '195K',
        likes: '24K',
        song: 'Nature Soundscape & Acoustic Guitar',
        duration: '0:29'
      }
    ]
  },
  {
    id: 'mindset-dest-08',
    name: 'Thanjavur Royal Palace & Art Gallery',
    city: 'Thanjavur',
    state: 'Tamil Nadu',
    lat: 10.7870,
    lng: 79.1378,
    category: 'Cultural Heritage Buff',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&q=80',
    description: 'Saraswathi Mahal library, bronze Chola sculptures, and centuries of Nayak-Maratha royal grandeur.',
    mindsetVector: {
      spirituality: 75,
      heritage: 99,
      peace: 70,
      adventure: 25,
      romance: 60,
      foodie: 80,
      nomad: 50,
      family: 85,
      nature: 35,
      budgetLevel: 30,
      pace: 35,
      crowdScore: 42,
    },
    vibeTags: ['Ancient Palm Manuscripts', 'Royal Maratha Hall', 'Chola Bronzes', 'Classical Music Roots'],
    bestMindset: ['heritage', 'spiritual', 'family'],
    entryFee: 30,
    rating: 4.75,
    reels: [
      {
        id: 'reel-th1',
        title: 'Secrets inside the Saraswathi Mahal Palm Leaf Library 📜',
        creator: '@history_tamil',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-flipping-through-a-book-43471-large.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=80',
        views: '160K',
        likes: '19K',
        song: 'Classical Veena Fusion',
        duration: '0:33'
      }
    ]
  }
];

export const MINDSET_ARCHETYPES = [
  {
    id: 'zen',
    label: 'Peaceful Zen & Solitude',
    icon: '🧘',
    tagline: 'Quiet spots, meditation, mist, and deep mental recharge',
    color: '#06b6d4',
    idealVector: { peace: 95, nature: 90, spirituality: 75, adventure: 40, pace: 20, crowdTolerance: 20 }
  },
  {
    id: 'thrill',
    label: 'Adrenaline Thrill-Seeker',
    icon: '🧗',
    tagline: 'Hairpin curves, waterfall treks, biking & high-energy thrills',
    color: '#f43f5e',
    idealVector: { adventure: 98, nature: 85, pace: 90, peace: 40, spirituality: 20, crowdTolerance: 60 }
  },
  {
    id: 'spiritual',
    label: 'Spiritual & Soul-Searching',
    icon: '🕉️',
    tagline: 'Sacred energy, ancient temples, chants & transcendental moments',
    color: '#f59e0b',
    idealVector: { spirituality: 98, heritage: 90, peace: 70, family: 80, pace: 35, crowdTolerance: 75 }
  },
  {
    id: 'heritage',
    label: 'Cultural Heritage Buff',
    icon: '🏛️',
    tagline: 'Royal palaces, UNESCO architecture, ancient art & museums',
    color: '#8b5cf6',
    idealVector: { heritage: 98, spirituality: 75, foodie: 80, family: 85, pace: 35, crowdTolerance: 65 }
  },
  {
    id: 'romance',
    label: 'Romantic Escapist',
    icon: '💖',
    tagline: 'Sunset viewpoints, French boulevards, cozy stays & intimate vibes',
    color: '#ec4899',
    idealVector: { romance: 98, peace: 85, foodie: 85, nature: 80, pace: 30, crowdTolerance: 40 }
  },
  {
    id: 'foodie',
    label: 'Foodie & Cafe Hopper',
    icon: '🍜',
    tagline: 'Chettinad spice trails, street food, artisan coffees & local feasts',
    color: '#10b981',
    idealVector: { foodie: 99, heritage: 70, romance: 75, pace: 45, crowdTolerance: 70 }
  },
  {
    id: 'nomad',
    label: 'Digital Nomad & Chill',
    icon: '💻',
    tagline: 'Scenic cafes with fast Wi-Fi, mountain air & inspiring workspots',
    color: '#3b82f6',
    idealVector: { nomad: 98, peace: 88, nature: 80, foodie: 85, romance: 75, pace: 30, crowdTolerance: 45 }
  },
  {
    id: 'family',
    label: 'Family Joy & Leisure',
    icon: '👨‍👩‍👧‍👦',
    tagline: 'Safe, comfortable, engaging spots suitable for all age groups',
    color: '#eab308',
    idealVector: { family: 98, heritage: 80, spirituality: 75, peace: 70, budgetLevel: 45, crowdTolerance: 60 }
  },
];
