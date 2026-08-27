// Crowd Engine — calculates and predicts crowd scores
import { DESTINATIONS } from '../data/mockData';

export function getCrowdScore(destination, customHour = null) {
  const now = new Date();
  const hour = customHour !== null ? customHour : now.getHours();
  const day = now.getDay(); // 0=Sun, 6=Sat
  const isWeekend = day === 0 || day === 6;

  const base = destination.crowdScore;

  // Time-based multiplier
  const peakHours = [9, 10, 11, 16, 17, 18];
  const offPeakHours = [6, 7, 21, 22];
  let timeMultiplier = 1.0;
  if (peakHours.includes(hour)) timeMultiplier = 1.15;
  if (offPeakHours.includes(hour)) timeMultiplier = 0.7;

  // Day multiplier
  const dayMultiplier = isWeekend ? destination.weekendMultiplier : destination.weekdayMultiplier;

  // Festival check (mock: Aug 15 = Independence Day)
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const isFestival = (month === 8 && date === 15) || (month === 10 && date === 2);
  const festivalMultiplier = isFestival ? destination.festivalMultiplier : 1.0;

  const score = Math.min(100, Math.round(base * timeMultiplier * dayMultiplier * festivalMultiplier * 0.85));
  return score;
}

export function getCrowdLevel(score) {
  if (score <= 30) return { label: 'Low', color: '#22c55e', bg: '#dcfce7', icon: '🟢', textColor: 'low' };
  if (score <= 60) return { label: 'Moderate', color: '#eab308', bg: '#fef9c3', icon: '🟡', textColor: 'moderate' };
  if (score <= 80) return { label: 'High', color: '#f97316', bg: '#ffedd5', icon: '🟠', textColor: 'high' };
  return { label: 'Critical', color: '#ef4444', bg: '#fee2e2', icon: '🔴', textColor: 'critical' };
}

export function getForecast(destination) {
  const base = destination.crowdScore;
  const forecast = [];
  for (let i = 0; i <= 5; i++) {
    const variation = Math.sin((i + 1) * 0.8) * 12 + (i < 3 ? 5 : -3);
    const score = Math.min(100, Math.max(0, Math.round(base + variation)));
    forecast.push({
      time: i === 0 ? 'Now' : `+${i}h`,
      crowd: score,
      level: getCrowdLevel(score),
    });
  }
  return forecast;
}

export function getAlternatives(destination, allDestinations = DESTINATIONS) {
  if (!destination.alternatives || destination.alternatives.length === 0) return [];
  return destination.alternatives
    .map((id) => allDestinations.find((d) => d.id === id))
    .filter(Boolean)
    .sort((a, b) => a.crowdScore - b.crowdScore);
}

export function getCapacityStatus(destination) {
  const pct = Math.round((destination.currentVisitors / destination.maxCapacity) * 100);
  let status = 'OK';
  if (pct >= 90) status = 'Critical';
  else if (pct >= 75) status = 'High';
  else if (pct >= 50) status = 'Moderate';
  else status = 'Low';
  return { percentage: pct, status, current: destination.currentVisitors, max: destination.maxCapacity };
}
