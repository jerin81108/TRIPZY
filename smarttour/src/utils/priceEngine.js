// Price Engine — fair price estimation
import { PRICE_RATES } from '../data/mockData';

export function estimateFare(type, distanceKm) {
  const rate = PRICE_RATES[type];
  if (!rate) return { min: 0, max: 0 };

  let fare;
  if (type === 'bus') {
    fare = Math.max(rate.min, rate.base + distanceKm * rate.perKm);
    return { min: Math.round(fare * 0.9), max: Math.round(fare * 1.1), fair: Math.round(fare) };
  }
  fare = rate.base + distanceKm * rate.perKm;
  const min = Math.max(rate.min, Math.round(fare * 0.9));
  const max = Math.round(fare * 1.15);
  return { min, max, fair: Math.round(fare) };
}

export function checkPrice(type, distanceKm, quotedPrice) {
  const estimate = estimateFare(type, distanceKm);
  const overchargeRatio = quotedPrice / estimate.max;
  let status, message, severity;

  if (overchargeRatio <= 1.05) {
    status = 'fair';
    message = '✅ Fair price! This is within the estimated range.';
    severity = 'success';
  } else if (overchargeRatio <= 1.3) {
    status = 'slightly_high';
    message = '⚠️ Slightly above estimate. Try negotiating.';
    severity = 'warning';
  } else {
    status = 'overcharge';
    message = '🚨 Potential overcharging detected! This is significantly above the estimated fair price.';
    severity = 'danger';
  }

  return { ...estimate, quotedPrice, status, message, severity, overchargeRatio: Math.round(overchargeRatio * 100) };
}

export const TRANSPORT_TYPES = [
  { id: 'auto', label: 'Auto Rickshaw', icon: '🛺' },
  { id: 'taxi', label: 'Taxi (Non-AC)', icon: '🚕' },
  { id: 'cab_ac', label: 'Cab (AC)', icon: '🚙' },
  { id: 'bike_taxi', label: 'Bike Taxi', icon: '🏍️' },
  { id: 'bus', label: 'Local Bus', icon: '🚌' },
];
