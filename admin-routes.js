import express from "express";
import { awardCoins } from "./db.js";
import { requireAuth, requireRole } from "./auth.js";
import { notify } from "./notifications.js";

export function createAdminRouter(db) {
  const router = express.Router();
  router.use(requireAuth, requireRole("admin"));
  router.get("/issues", (_req, res) => res.json(db.prepare("SELECT i.*, u.name AS reporter, u.email FROM issues i JOIN users u ON u.id = i.user_id ORDER BY i.created_at DESC").all()));
  router.patch("/issues/:id", async (req, res) => {
    const issue = db.prepare("SELECT * FROM issues WHERE id = ?").get(Number(req.params.id));
    if (!issue) return res.status(404).json({ error: "Issue not found" });
    const status = req.body?.status;
    if (!["REPORTED", "VERIFIED", "IN_PROGRESS", "RESOLVED", "INVALID"].includes(status)) return res.status(400).json({ error: "Invalid status" });
    const transition = db.transaction(() => {
      db.prepare("UPDATE issues SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(status, issue.id);
      if (status === "VERIFIED" && issue.status !== "VERIFIED") awardCoins(issue.user_id, 30, "Issue verified", issue.id);
      if (status === "RESOLVED" && issue.status !== "RESOLVED") {
        awardCoins(issue.user_id, 50, "Issue resolved", issue.id);
        db.prepare("UPDATE users SET issues_resolved = issues_resolved + 1 WHERE id = ?").run(issue.user_id);
      }
    });
    transition();
    const reporter = db.prepare("SELECT email FROM users WHERE id = ?").get(issue.user_id);
    await notify({ subject: `CivicQuest issue ${status.toLowerCase()}`, message: `Issue #${issue.id} is now ${status}.`, email: reporter?.email });
    res.json(db.prepare("SELECT * FROM issues WHERE id = ?").get(issue.id));
  });
  router.get("/stats", (_req, res) => res.json({
    users: db.prepare("SELECT COUNT(*) AS count FROM users").get().count,
    issues: db.prepare("SELECT COUNT(*) AS count FROM issues").get().count,
    resolved: db.prepare("SELECT COUNT(*) AS count FROM issues WHERE status = 'RESOLVED'").get().count,
    coinsIssued: db.prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM coin_ledger WHERE amount > 0").get().total
  }));
  return router;
}
