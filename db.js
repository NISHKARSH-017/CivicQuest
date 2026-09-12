import Database from "better-sqlite3";

const db = new Database(process.env.DB_FILE || "civicquest.sqlite");
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    coins INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    issues_reported INTEGER NOT NULL DEFAULT 0,
    issues_resolved INTEGER NOT NULL DEFAULT 0,
    trees_funded INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'REPORTED',
    duplicate_of INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(duplicate_of) REFERENCES issues(id)
  );
  CREATE TABLE IF NOT EXISTS coin_ledger (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    issue_id INTEGER,
    reason TEXT NOT NULL,
    amount INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(issue_id) REFERENCES issues(id)
  );
  CREATE TABLE IF NOT EXISTS missions (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    reward INTEGER NOT NULL,
    cadence TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS mission_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mission_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mission_id, user_id),
    FOREIGN KEY(mission_id) REFERENCES missions(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

const seedUser = db.prepare(`INSERT OR IGNORE INTO users (id, name, neighborhood, coins, level, issues_reported, issues_resolved, trees_funded) VALUES (1, 'Alex Stone', 'Maplewood', 2840, 7, 18, 12, 3)`);
seedUser.run();
const seedMission = db.prepare("INSERT OR IGNORE INTO missions (id, title, description, reward, cadence) VALUES (?, ?, ?, ?, ?)");
[
  [1, "Report a civic issue", "Submit a verified issue", 30, "daily"],
  [2, "Walk & spot", "Complete a 15 minute neighborhood scan", 30, "daily"],
  [3, "Community cleanup", "Participate in a local cleanup", 75, "weekly"],
  [4, "Neighborhood challenge", "Complete your crew challenge", 100, "weekly"]
].forEach((mission) => seedMission.run(...mission));

export function getUser(userId = 1) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
}

export function getDashboard(userId = 1) {
  const user = getUser(userId);
  const issues = db.prepare("SELECT * FROM issues WHERE user_id = ? ORDER BY created_at DESC LIMIT 10").all(userId);
  const missions = db.prepare(`
    SELECT m.*, EXISTS(SELECT 1 FROM mission_completions c WHERE c.mission_id = m.id AND c.user_id = ?) AS completed
    FROM missions m WHERE m.active = 1 ORDER BY m.id
  `).all(userId);
  const leaderboard = db.prepare(`
    SELECT name, neighborhood, coins FROM users ORDER BY coins DESC LIMIT 10
  `).all();
  return { user, issues, missions, leaderboard };
}

export function createIssue({ userId = 1, category, location, description = "", photoUrl = "" }) {
  const duplicate = db.prepare(`
    SELECT id FROM issues
    WHERE user_id != ? AND lower(category) = lower(?) AND lower(location) = lower(?)
      AND created_at >= datetime('now', '-7 days')
    ORDER BY id DESC LIMIT 1
  `).get(userId, category, location);
  const insert = db.prepare(`
    INSERT INTO issues (user_id, category, location, description, photo_url, status, duplicate_of)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const addIssue = db.transaction(() => {
    const result = insert.run(userId, category, location, description, photoUrl, duplicate ? "DUPLICATE" : "REPORTED", duplicate?.id || null);
    if (duplicate) return { id: result.lastInsertRowid, duplicateOf: duplicate.id, coins: 0 };
    db.prepare("UPDATE users SET coins = coins + 10, issues_reported = issues_reported + 1 WHERE id = ?").run(userId);
    db.prepare("INSERT INTO coin_ledger (user_id, issue_id, reason, amount) VALUES (?, ?, ?, ?)").run(userId, result.lastInsertRowid, "Issue submitted", 10);
    return { id: result.lastInsertRowid, duplicateOf: null, coins: 10 };
  });
  return addIssue();
}

export function updateIssueStatus(issueId, status) {
  const allowed = ["REPORTED", "VERIFIED", "IN_PROGRESS", "RESOLVED", "INVALID"];
  if (!allowed.includes(status)) throw new Error("Invalid issue status");
  const issue = db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId);
  if (!issue) return null;
  const transition = db.transaction(() => {
    db.prepare("UPDATE issues SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, issueId);
    if (status === "VERIFIED" && issue.status !== "VERIFIED") award(issue.user_id, 30, "Issue verified", issueId);
    if (status === "RESOLVED" && issue.status !== "RESOLVED") {
      award(issue.user_id, 50, "Issue resolved", issueId);
      db.prepare("UPDATE users SET issues_resolved = issues_resolved + 1 WHERE id = ?").run(issue.user_id);
    }
  });
  transition();
  return db.prepare("SELECT * FROM issues WHERE id = ?").get(issueId);
}

function award(userId, amount, reason, issueId = null) {
  db.prepare("UPDATE users SET coins = coins + ?, level = 1 + CAST((coins + ?) / 500 AS INTEGER) WHERE id = ?").run(amount, amount, userId);
  db.prepare("INSERT INTO coin_ledger (user_id, issue_id, reason, amount) VALUES (?, ?, ?, ?)").run(userId, issueId, reason, amount);
}

export function completeMission(userId, missionId) {
  const mission = db.prepare("SELECT * FROM missions WHERE id = ? AND active = 1").get(missionId);
  if (!mission) return { error: "Mission not found" };
  try {
    db.prepare("INSERT INTO mission_completions (mission_id, user_id) VALUES (?, ?)").run(missionId, userId);
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") return { error: "Mission already completed" };
    throw error;
  }
  award(userId, mission.reward, `${mission.title} completed`);
  return { mission, coins: mission.reward };
}

export function redeemReward(userId, cost, title) {
  const user = getUser(userId);
  if (!Number.isInteger(cost) || cost <= 0 || user.coins < cost) return { error: "Insufficient Civic Coins" };
  db.transaction(() => {
    db.prepare("UPDATE users SET coins = coins - ? WHERE id = ?").run(cost, userId);
    db.prepare("INSERT INTO coin_ledger (user_id, reason, amount) VALUES (?, ?, ?)").run(userId, `Redeemed: ${title}`, -cost);
  })();
  return { title, cost, balance: getUser(userId).coins };
}

export { db };
