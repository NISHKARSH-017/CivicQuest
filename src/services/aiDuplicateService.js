/**
 * CivicQuest AI Duplicate Detection Service (Mock Engine)
 *
 * BACKEND INTEGRATION NOTE:
 * When connecting to a real AI/backend API (e.g. Flask/FastAPI/Python microservice),
 * replace the body of `checkDuplicate()` with a fetch call:
 *
 *   export async function checkDuplicate(reportData) {
 *     const response = await fetch('/api/v1/issues/duplicate-check', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(reportData)
 *     });
 *     return await response.json();
 *   }
 */

// Sample database of existing community issues in Maplewood / Portland
const EXISTING_COMMUNITY_ISSUES = [
  {
    id: 'CQ-2026-7819',
    category: 'Pothole',
    title: 'Severe Pothole on Maple Ave near 23rd St',
    location: 'Maple Ave & 23rd St',
    distance: '45 meters away',
    coordinates: { lat: 45.5152, lng: -122.6784 },
    status: 'In Review · Public Works',
    reportedAt: 'Yesterday, 3:15 PM',
    reportedBy: 'Jordan Miller',
    upvotes: 14,
    description: 'Deep asphalt pothole causing vehicles to swerve near the pedestrian crossing. Rim hazard.',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    similarityScore: 94,
    matchKeywords: ['pothole', 'maple', '23rd', 'hole', 'road', 'asphalt'],
  },
  {
    id: 'CQ-2026-7241',
    category: 'Broken Streetlight',
    title: 'Flickering Streetlight pole #14B',
    location: 'Fremont St & 14th Ave',
    distance: '80 meters away',
    coordinates: { lat: 45.5190, lng: -122.6710 },
    status: 'Scheduled for Repair',
    reportedAt: '3 days ago',
    reportedBy: 'Sam Kim',
    upvotes: 8,
    description: 'Streetlight stays dark or flickers continuously at night, leaving sidewalk pitch black.',
    photoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    similarityScore: 88,
    matchKeywords: ['streetlight', 'light', 'fremont', 'dark', 'lamp', 'pole'],
  },
  {
    id: 'CQ-2026-6912',
    category: 'Overflowing Garbage',
    title: 'Public park bin overflowing into walkway',
    location: 'Maplewood Park Entrance',
    distance: '120 meters away',
    coordinates: { lat: 45.5165, lng: -122.6730 },
    status: 'Assigned to Sanitation',
    reportedAt: 'Today, 8:00 AM',
    reportedBy: 'Elena Rostova',
    upvotes: 19,
    description: 'Recycling and trash bins overflowing onto the grassy verge. Attracting raccoons.',
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
    similarityScore: 91,
    matchKeywords: ['garbage', 'trash', 'overflowing', 'bin', 'park', 'waste'],
  },
  {
    id: 'CQ-2026-5830',
    category: 'Water Leakage',
    title: 'Water main pooling across bike lane',
    location: 'Maple Ave & 18th St',
    distance: '65 meters away',
    coordinates: { lat: 45.5140, lng: -122.6750 },
    status: 'In Review · Portland Water Bureau',
    reportedAt: 'Yesterday, 11:20 AM',
    reportedBy: 'Marcus Chen',
    upvotes: 11,
    description: 'Clean water bubbling through curb seam and flooding sidewalk and bike path.',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80',
    similarityScore: 89,
    matchKeywords: ['water', 'leak', 'main', 'pipe', 'pooling', 'flood'],
  },
  {
    id: 'CQ-2026-5104',
    category: 'Unsafe Public Area',
    title: 'Broken railing at Oak Street Crosswalk',
    location: 'Oak Street Crosswalk',
    distance: '90 meters away',
    coordinates: { lat: 45.5172, lng: -122.6801 },
    status: 'In Review · Parks & Safety',
    reportedAt: '4 days ago',
    reportedBy: 'Priya Nair',
    upvotes: 7,
    description: 'Metal pedestrian rail is detached and a missing manhole cover leaves an open hazard.',
    photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    similarityScore: 86,
    matchKeywords: ['unsafe', 'railing', 'manhole', 'hazard', 'oak', 'rail'],
  },
  {
    id: 'CQ-2026-4477',
    category: 'Other',
    title: 'Graffiti and damaged bench at City Hall Plaza',
    location: 'City Hall Plaza',
    distance: '150 meters away',
    coordinates: { lat: 45.5128, lng: -122.6766 },
    status: 'Reported · Neighborhood Response',
    reportedAt: '5 days ago',
    reportedBy: 'Chris Alvarez',
    upvotes: 4,
    description: 'Vandalized signage and a broken public bench near the plaza fountain.',
    photoUrl: 'https://images.unsplash.com/photo-1581852017103-68ac65514be0?auto=format&fit=crop&w=800&q=80',
    similarityScore: 82,
    matchKeywords: ['graffiti', 'bench', 'sign', 'vandalism', 'plaza'],
  },
];

function normalize(text) {
  return (text || '').toLowerCase().trim();
}

function tokens(text) {
  return normalize(text)
    .split(/[\s,&./#'\-]+/)
    .filter((word) => word.length > 2);
}

function hasWholeWord(text, keyword) {
  const escaped = String(keyword || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!escaped) return false;
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text || '');
}

/**
 * Simulates AI Duplicate Detection
 * Performs fuzzy keyword + category + geo matching against mock issues.
 *
 * @param {Object} reportData
 * @param {string} reportData.category
 * @param {string} reportData.location
 * @param {string} reportData.description
 * @param {string} [reportData.photoUrl]
 * @param {boolean} [reportData.forceDuplicate] - Optional hackathon test toggle
 * @param {boolean} [reportData.forceUnique] - Optional hackathon test toggle
 * @returns {Promise<Object>} Detection result
 */
export async function checkDuplicate(reportData) {
  // Simulate realistic network & AI processing latency (1100ms)
  await new Promise((resolve) => setTimeout(resolve, 1100));

  // Explicit override if requested in demo mode
  if (reportData.forceUnique) {
    return {
      hasDuplicate: false,
      similarityScore: 12,
      message: 'No similar issues found nearby. Your issue is unique.',
    };
  }

  if (reportData.forceDuplicate) {
    const match = EXISTING_COMMUNITY_ISSUES.find((i) => i.category === reportData.category) || EXISTING_COMMUNITY_ISSUES[0];
    return {
      hasDuplicate: true,
      similarityScore: 95,
      reason: 'High spatial proximity (<50m) and matching issue category.',
      existingReport: match,
    };
  }

  // Duplicate only when category matches AND location/description is reasonably similar
  const category = normalize(reportData.category);
  const location = normalize(reportData.location);
  const description = normalize(reportData.description);
  const userLocTokens = new Set(tokens(location));

  let bestMatch = null;
  let highestScore = 0;

  for (const issue of EXISTING_COMMUNITY_ISSUES) {
    if (issue.category.toLowerCase() !== category) continue;

    let locationHits = 0;
    for (const word of tokens(issue.location)) {
      if (userLocTokens.has(word)) locationHits += 1;
    }

    let keywordHits = 0;
    for (const kw of issue.matchKeywords) {
      if (hasWholeWord(description, kw) || hasWholeWord(location, kw)) {
        keywordHits += 1;
      }
    }

    const locationSimilar = locationHits >= 2;
    const descriptionSimilar = keywordHits >= 2;
    // Require same category (above) plus a nearby location match.
    // Description overlap only confirms the match; it cannot replace location.
    if (!locationSimilar) continue;
    if (!descriptionSimilar && locationHits < 3) continue;

    const score = 50 + locationHits * 15 + keywordHits * 8;
    if (score > highestScore) {
      highestScore = score;
      bestMatch = issue;
    }
  }

  if (bestMatch) {
    return {
      hasDuplicate: true,
      similarityScore: Math.min(98, highestScore),
      reason: `Similar ${bestMatch.category.toLowerCase()} report found within ${bestMatch.distance}.`,
      existingReport: bestMatch,
    };
  }

  return {
    hasDuplicate: false,
    similarityScore: highestScore,
    message: 'No similar issue found in this vicinity. Your report is verified as unique.',
  };
}

/**
 * Returns existing mock issues for inspection
 */
export function getExistingIssues() {
  return EXISTING_COMMUNITY_ISSUES;
}
