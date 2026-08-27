// ============================================================
// SmartTour Fuzzy & Approximate String Matching Algorithm
// Searches across all registered users (Name, Username, Handle, ID, Email, Business Name, Location)
// ============================================================

/**
 * Computes Levenshtein Distance between two strings
 */
export function levenshteinDistance(a, b) {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = [];
  for (let i = 0; i <= bn; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= an; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[bn][an];
}

/**
 * Bigram Dice Coefficient for character sequence similarity
 */
function getBigrams(str) {
  const bigrams = new Set();
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.add(str.substring(i, i + 2));
  }
  return bigrams;
}

function diceCoefficient(str1, str2) {
  if (str1 === str2) return 1.0;
  if (str1.length < 2 || str2.length < 2) return 0.0;

  const b1 = getBigrams(str1);
  const b2 = getBigrams(str2);
  let intersection = 0;
  for (const item of b1) {
    if (b2.has(item)) intersection++;
  }
  return (2 * intersection) / (b1.size + b2.size);
}

/**
 * Calculates similarity score (0 to 100) between query and target string
 */
export function calculateSimilarity(query, target) {
  if (!query || !target) return 0;

  // Clean strings (remove leading @ if present)
  const q = query.trim().toLowerCase().replace(/^@/, '');
  const t = target.trim().toLowerCase().replace(/^@/, '');

  if (!q || !t) return 0;

  // 1. Exact match
  if (q === t) return 100;

  // 2. Starts with query (Prefix match)
  if (t.startsWith(q)) return 96;

  // 3. Target contains exact query substring
  if (t.includes(q)) {
    const words = t.split(/[\s_.-]+/);
    if (words.some(w => w.startsWith(q))) return 94;
    return 88;
  }

  // 4. Token & Word Level Comparison
  const targetWords = t.split(/[\s_.-]+/);
  let maxWordScore = 0;

  for (const word of targetWords) {
    if (word === q) return 98;
    if (word.startsWith(q)) return 92;

    const dist = levenshteinDistance(q, word);
    const maxLen = Math.max(q.length, word.length);
    const levRatio = Math.max(0, (1 - dist / maxLen) * 100);
    const diceScore = diceCoefficient(q, word) * 100;
    const combined = Math.max(levRatio, diceScore);
    if (combined > maxWordScore) {
      maxWordScore = combined;
    }
  }

  // 5. Full string edit distance
  const fullDist = levenshteinDistance(q, t);
  const fullMaxLen = Math.max(q.length, t.length);
  const fullLevRatio = Math.max(0, (1 - fullDist / fullMaxLen) * 100);
  const fullDice = diceCoefficient(q, t) * 100;

  return Math.round(Math.max(maxWordScore, fullLevRatio, fullDice));
}

/**
 * Searches ALL registered accounts across all fields:
 * - Username / Handle (@username)
 * - Display Name
 * - ID
 * - Business Name
 * - Email
 * - Location
 */
export function searchSimilarAccounts(users, query, currentUserId, filterRole = 'all', threshold = 25) {
  const cleanQ = (query || '').trim().toLowerCase().replace(/^@/, '');

  if (!cleanQ) {
    return users
      .filter(u => u.id !== currentUserId && (filterRole === 'all' || u.role === filterRole))
      .map(u => ({ ...u, similarityScore: 100, matchReason: 'Registered Account' }));
  }

  const results = [];

  for (const u of users) {
    if (u.id === currentUserId) continue;
    if (filterRole !== 'all' && u.role !== filterRole) continue;

    // Check all fields of the registered user account
    const nameScore = calculateSimilarity(cleanQ, u.name || '');
    const usernameScore = calculateSimilarity(cleanQ, u.username || '');
    const idScore = calculateSimilarity(cleanQ, u.id || '');
    const bizScore = calculateSimilarity(cleanQ, u.businessName || '');
    const emailScore = calculateSimilarity(cleanQ, (u.email || '').split('@')[0]);
    const locationScore = calculateSimilarity(cleanQ, u.location || '');

    const highestScore = Math.max(
      nameScore,
      usernameScore * 1.05, // boost username match
      idScore * 1.02,
      bizScore,
      emailScore * 0.9,
      locationScore * 0.75
    );

    const roundedScore = Math.min(100, Math.round(highestScore));

    if (roundedScore >= threshold) {
      let matchReason = 'Similar name';
      if (usernameScore >= 95) matchReason = 'Exact username match';
      else if (nameScore >= 95) matchReason = 'Exact name match';
      else if (idScore >= 95) matchReason = 'Exact ID match';
      else if (bizScore >= 90) matchReason = 'Business name match';
      else if (usernameScore >= 75) matchReason = 'Username match';
      else if (nameScore >= 75) matchReason = 'Name match';
      else if (locationScore >= 75) matchReason = 'Location match';

      results.push({
        ...u,
        similarityScore: roundedScore,
        matchReason,
      });
    }
  }

  // Sort by highest similarity score first, then by followers/priority
  results.sort((a, b) => {
    if (b.similarityScore !== a.similarityScore) {
      return b.similarityScore - a.similarityScore;
    }
    return (b.followers || 0) - (a.followers || 0);
  });

  return results;
}
