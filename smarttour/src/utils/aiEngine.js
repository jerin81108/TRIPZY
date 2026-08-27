// AI Chat Engine — rule-based contextual responses
import { DESTINATIONS, BUSINESSES, NEARBY_FACILITIES } from '../data/mockData';
import { getCrowdLevel } from './crowdEngine';
import { checkPrice } from './priceEngine';

const greetings = ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good evening'];

function getBestDestinations(maxCrowd = 50) {
  return DESTINATIONS.filter((d) => d.crowdScore <= maxCrowd).sort((a, b) => a.crowdScore - b.crowdScore).slice(0, 3);
}

function getBeachOptions() {
  return DESTINATIONS.filter((d) => d.category === 'Beach').sort((a, b) => a.crowdScore - b.crowdScore);
}

export function getAIResponse(message) {
  const lower = message.toLowerCase();

  // Greeting
  if (greetings.some((g) => lower.includes(g))) {
    return {
      text: `👋 **Namaste! I'm Tripzy AI.**\n\nI can help you:\n- 🗺️ Find less-crowded destinations\n- 💰 Check if prices are fair\n- 🏥 Locate emergency services\n- 🍛 Recommend local experiences\n- 📅 Plan your day within a budget\n\nWhat would you like to explore today?`,
      type: 'greeting',
    };
  }

  // Hospital / Emergency
  if (lower.includes('hospital') || lower.includes('emergency') || lower.includes('doctor') || lower.includes('ambulance')) {
    const hospitals = NEARBY_FACILITIES.filter((f) => f.type === 'hospital');
    const list = hospitals.map((h) => `🏥 **${h.name}**\n   📍 ${h.distance} away | 📞 ${h.phone} | ${h.open24h ? '24/7 Open' : 'Check hours'}`).join('\n\n');
    return {
      text: `🚨 **Nearest Medical Facilities:**\n\n${list}\n\n*For immediate emergency, press the SOS button or call **108** (Ambulance).*`,
      type: 'emergency',
    };
  }

  // Police
  if (lower.includes('police') || lower.includes('theft') || lower.includes('stolen') || lower.includes('robbery')) {
    const police = NEARBY_FACILITIES.filter((f) => f.type === 'police');
    const list = police.map((p) => `🚔 **${p.name}**\n   📍 ${p.distance} away | 📞 ${p.phone}`).join('\n\n');
    return {
      text: `🚔 **Nearest Police Stations:**\n\n${list}\n\n*Emergency police: **100** | Tourist helpline: **1800-111-363***`,
      type: 'emergency',
    };
  }

  // Crowd / where to go
  if (lower.includes('crowded') || lower.includes('crowd') || lower.includes('where should i go') || lower.includes('less crowd') || lower.includes('quiet')) {
    const best = getBestDestinations(40);
    const list = best.map((d) => `🟢 **${d.name}** — ${d.crowdScore}% capacity\n   ⭐ ${d.rating} | ${d.category} | Entry: ${d.entryFee === 0 ? 'Free' : '₹' + d.entryFee}`).join('\n\n');
    return {
      text: `🗺️ **Best Low-Crowd Destinations Right Now:**\n\n${list}\n\n*These spots have significantly lower crowd levels compared to popular attractions.*`,
      type: 'recommendation',
      destinations: best,
    };
  }

  // Beach
  if (lower.includes('beach')) {
    const beaches = getBeachOptions();
    const list = beaches.map((d) => {
      const level = getCrowdLevel(d.crowdScore);
      return `${level.icon} **${d.name}** — ${d.crowdScore}% capacity (${level.label})\n   ⭐ ${d.rating} | Entry: Free`;
    }).join('\n\n');
    return {
      text: `🏖️ **Beach Options Near Chennai:**\n\n${list}\n\n*I recommend **Besant Nagar Beach** — it's significantly less crowded than Marina Beach right now.*`,
      type: 'recommendation',
    };
  }

  // Food
  if (lower.includes('food') || lower.includes('eat') || lower.includes('restaurant') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('breakfast')) {
    const food = BUSINESSES.filter((b) => b.category === 'food').slice(0, 3);
    const list = food.map((b) => `🍛 **${b.name}**\n   💰 ${b.priceRange} | ⭐ ${b.rating} | ${b.distance} km away\n   📍 ${b.city} | ${b.openHours}`).join('\n\n');
    return {
      text: `🍛 **Top Local Food Spots:**\n\n${list}\n\n*All are verified local businesses. Prefer eating at local restaurants — it directly supports the community!*`,
      type: 'business',
    };
  }

  // Price / fare check
  if (lower.includes('fare') || lower.includes('price') || lower.includes('expensive') || lower.includes('overcharging') || lower.includes('reasonable')) {
    return {
      text: `💰 **Fair Price Tips:**\n\n**Auto Rickshaw:** ₹20–25 per km (min ₹50)\n**Taxi (non-AC):** ₹14 per km (min ₹80)\n**AC Cab:** ₹18 per km (min ₹100)\n**Bike Taxi:** ₹10 per km (min ₹30)\n\n*Use the **Fair Price Checker** for exact estimates. If overcharged, you can report it directly in the app.*`,
      type: 'price',
    };
  }

  // Budget planning
  const budgetMatch = lower.match(/₹?\s*(\d[\d,]*)/);
  const hourMatch = lower.match(/(\d+)\s*hour/);
  if ((lower.includes('plan') || lower.includes('budget') || lower.includes('spend')) && budgetMatch) {
    const budget = parseInt(budgetMatch[1].replace(',', ''));
    const hours = hourMatch ? parseInt(hourMatch[1]) : 5;
    return {
      text: `📅 **Smart Day Plan — ₹${budget.toLocaleString('en-IN')} | ${hours} hours**\n\n🚶 **Local Heritage Walk** with Rajan Heritage Walks\n   ₹800/person | 2 hours | Low crowd\n\n🍛 **Breakfast at Murugan Idli Shop**\n   ₹120 | 30 mins | Authentic & budget-friendly\n\n🏛️ **Government Museum Chennai**\n   ₹15 entry | 1.5 hours | Low crowd, air-conditioned\n\n🛺 **Auto to Besant Nagar Beach**\n   ~₹80 | Peaceful evening walk\n\n**Total: ~₹1,015** | Remaining: ₹${(budget - 1015).toLocaleString('en-IN')}\n\n*All venues are less-crowded alternatives to popular hotspots.*`,
      type: 'plan',
    };
  }

  // Guide
  if (lower.includes('guide') || lower.includes('tour')) {
    const guides = BUSINESSES.filter((b) => b.category === 'guide');
    const list = guides.map((b) => `🧑‍🏫 **${b.name}**\n   💰 ${b.priceRange} | ⭐ ${b.rating} | ✅ Verified`).join('\n\n');
    return {
      text: `🧑‍🏫 **Certified Local Guides:**\n\n${list}\n\n*All guides are government-certified and background-verified for your safety.*`,
      type: 'business',
    };
  }

  // Default
  return {
    text: `🤔 I'm not sure about that, but I can help you with:\n\n- 🗺️ **"Where should I go now?"** — find less-crowded destinations\n- 🏖️ **"Which beach is less crowded?"** — beach comparisons\n- 🍛 **"Find cheap food near me"** — local restaurants\n- 💰 **"I have ₹2,000, plan my day"** — budget planning\n- 🏥 **"Where is the nearest hospital?"** — emergency services\n- 🚕 **"Is this taxi fare reasonable?"** — price check\n\nWhat would you like to know?`,
    type: 'default',
  };
}
