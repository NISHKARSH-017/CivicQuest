import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { completeMission, createIssue, db, getDashboard, getUser, redeemReward, updateIssueStatus } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const userId = 1;
const root = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "2mb" }));
app.use(express.static(root));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "civicquest-api" }));
app.get("/api/dashboard", (_req, res) => res.json(getDashboard(userId)));
app.get("/api/wallet", (_req, res) => res.json(getUser(userId)));
app.get("/api/leaderboard", (_req, res) => res.json(db.prepare("SELECT name, neighborhood, coins FROM users ORDER BY coins DESC LIMIT 20").all()));
app.get("/api/issues", (_req, res) => res.json(db.prepare("SELECT * FROM issues ORDER BY created_at DESC").all()));

app.post("/api/issues", (req, res) => {
  const { category, location, description, photoUrl } = req.body || {};
  if (!category || !location) return res.status(400).json({ error: "category and location are required" });
  const result = createIssue({ userId, category, location, description, photoUrl });
  res.status(result.duplicateOf ? 200 : 201).json({ ...result, dashboard: getDashboard(userId) });
});

app.patch("/api/issues/:id/status", (req, res) => {
  try {
    const result = updateIssueStatus(Number(req.params.id), req.body?.status);
    if (!result) return res.status(404).json({ error: "Issue not found" });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/missions", (_req, res) => res.json(getDashboard(userId).missions));
app.post("/api/missions/:id/complete", (req, res) => {
  const result = completeMission(userId, Number(req.params.id));
  if (result.error) return res.status(409).json(result);
  res.json({ ...result, wallet: getUser(userId) });
});

app.post("/api/rewards/redeem", (req, res) => {
  const result = redeemReward(userId, Number(req.body?.cost), req.body?.title || "Community reward");
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

app.get("*", (_req, res) => res.sendFile(path.join(root, "index.html")));
app.listen(port, () => console.log(`CivicQuest running at http://localhost:${port}`));
