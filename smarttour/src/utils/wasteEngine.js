// Waste Prediction Engine
export function predictWaste(visitors, isWeekend = false, hasEvent = false, weather = 'sunny') {
  const baseWastePerVisitor = 0.38; // kg
  let multiplier = 1.0;
  if (isWeekend) multiplier *= 1.2;
  if (hasEvent) multiplier *= 1.5;
  if (weather === 'rain') multiplier *= 0.85;

  const waste = visitors * baseWastePerVisitor * multiplier / 1000; // tonnes

  return {
    visitors,
    wasteKg: Math.round(waste * 1000),
    wasteTonnes: Math.round(waste * 10) / 10,
    breakdownTypes: {
      plastic: Math.round(waste * 0.35 * 10) / 10,
      organic: Math.round(waste * 0.40 * 10) / 10,
      paper: Math.round(waste * 0.15 * 10) / 10,
      other: Math.round(waste * 0.10 * 10) / 10,
    },
  };
}

export function getWasteStatus(wasteTonnes, collectionCapacity) {
  const ratio = wasteTonnes / collectionCapacity;
  if (ratio <= 0.7) return { status: 'OK', color: '#22c55e', label: 'Within Capacity' };
  if (ratio <= 0.9) return { status: 'Warning', color: '#eab308', label: 'Near Capacity' };
  if (ratio <= 1.1) return { status: 'High', color: '#f97316', label: 'At Capacity' };
  return { status: 'Critical', color: '#ef4444', label: 'Over Capacity — Action Needed' };
}

export function getWeeklyWasteForecast() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const visitors = [15000, 14200, 16800, 18400, 20100, 26500, 24200];
  return days.map((day, i) => {
    const w = predictWaste(visitors[i], i >= 5);
    return { day, visitors: visitors[i], waste: w.wasteTonnes };
  });
}
