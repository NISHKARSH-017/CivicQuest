function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function similarity(left, right) {
  const a = new Set(normalize(left).split(" ").filter(Boolean));
  const b = new Set(normalize(right).split(" ").filter(Boolean));
  const intersection = [...a].filter((word) => b.has(word)).length;
  return intersection / Math.max(1, new Set([...a, ...b]).size);
}

export function findDuplicate(db, { category, location, description = "", userId }) {
  const candidates = db.prepare(`
    SELECT * FROM issues
    WHERE user_id != ? AND status != 'INVALID' AND created_at >= datetime('now', '-14 days')
    ORDER BY created_at DESC LIMIT 100
  `).all(userId);
  return candidates
    .map((issue) => ({ issue, score: similarity(`${category} ${location} ${description}`, `${issue.category} ${issue.location} ${issue.description}`) }))
    .filter((match) => match.score >= 0.55)
    .sort((a, b) => b.score - a.score)[0] || null;
}
