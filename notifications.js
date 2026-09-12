export async function notify({ subject, message, email, webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL }) {
  if (webhookUrl) {
    const response = await fetch(webhookUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ subject, message, email }) });
    if (!response.ok) throw new Error(`Notification webhook failed with ${response.status}`);
    return { provider: "webhook", delivered: true };
  }
  console.info(`[notification] ${subject}${email ? ` to ${email}` : ""}: ${message}`);
  return { provider: "console", delivered: false };
}
