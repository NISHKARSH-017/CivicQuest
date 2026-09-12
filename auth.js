import crypto from "node:crypto";
import express from "express";

const secret = process.env.AUTH_SECRET || "development-only-change-this-secret";
const tokenLifetimeSeconds = 60 * 60 * 24 * 7;

export function hashPassword(password) {
  if (typeof password !== "string" || password.length < 8) throw new Error("Password must contain at least 8 characters");
  const salt = crypto.randomBytes(16).toString("hex");
  const digest = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${digest}`;
}

function verifyPassword(password, stored) {
  const [salt, expected] = String(stored).split(":");
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
}

function sign(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function readToken(token) {
  const [body, signature] = String(token || "").split(".");
  if (!body || !signature) return null;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  return payload.exp > Math.floor(Date.now() / 1000) ? payload : null;
}

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const payload = readToken(token);
  if (!payload) return res.status(401).json({ error: "Authentication required" });
  req.user = payload;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: "Insufficient permissions" });
    next();
  };
}

export function createAuthRouter(db) {
  const router = express.Router();
  router.post("/register", (req, res) => {
    const { name, email, password, neighborhood = "Maplewood" } = req.body || {};
    if (!name || !email || !password) return res.status(400).json({ error: "name, email, and password are required" });
    try {
      const result = db.prepare("INSERT INTO users (name, email, password_hash, neighborhood) VALUES (?, ?, ?, ?)").run(name.trim(), email.trim().toLowerCase(), hashPassword(password), neighborhood.trim());
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid);
      return res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token: sign({ id: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + tokenLifetimeSeconds }) });
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") return res.status(409).json({ error: "Email is already registered" });
      throw error;
    }
  });
  router.post("/login", (req, res) => {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(String(req.body?.email || "").toLowerCase());
    if (!user || !verifyPassword(String(req.body?.password || ""), user.password_hash)) return res.status(401).json({ error: "Invalid email or password" });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token: sign({ id: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + tokenLifetimeSeconds }) });
  });
  router.get("/me", requireAuth, (req, res) => res.json(db.prepare("SELECT id, name, email, neighborhood, role, coins, level FROM users WHERE id = ?").get(req.user.id)));
  return router;
}
