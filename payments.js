import crypto from "node:crypto";

export async function createRewardRedemption({ db, userId, title, cost }) {
  if (!title || !Number.isInteger(cost) || cost <= 0) throw new Error("A reward title and positive whole-number cost are required");
  const user = db.prepare("SELECT coins FROM users WHERE id = ?").get(userId);
  if (!user || user.coins < cost) throw new Error("Insufficient Civic Coins");
  const reference = `CQ-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
  const redeem = db.transaction(() => {
    db.prepare("UPDATE users SET coins = coins - ? WHERE id = ?").run(cost, userId);
    db.prepare("INSERT INTO reward_redemptions (user_id, title, cost, provider, provider_reference, status) VALUES (?, ?, ?, ?, ?, ?)").run(userId, title, cost, "local-voucher", reference, "PENDING");
  });
  redeem();
  return { title, cost, provider: "local-voucher", reference, status: "PENDING", balance: db.prepare("SELECT coins FROM users WHERE id = ?").get(userId).coins };
}
