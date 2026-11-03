// Run only after deploying api/telegram.ts and setting the same env values on Vercel.
const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_WEBHOOK_SECRET: secret, PUBLIC_SITE_URL: site } = process.env;
if (!token || !secret || !site || !/^https:\/\//.test(site)) {
  console.error('Set TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET, and PUBLIC_SITE_URL (https://...) in the environment first.');
  process.exit(1);
}
const endpoint = `https://api.telegram.org/bot${token}`;
const response = await fetch(`${endpoint}/setWebhook`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: `${site.replace(/\/$/, '')}/api/telegram`, secret_token: secret, allowed_updates: ['message'], drop_pending_updates: false }),
});
const data = await response.json();
if (!response.ok || !data.ok) {
  console.error('Telegram rejected the webhook:', data.description || response.status);
  process.exit(1);
}
const check = await fetch(`${endpoint}/getWebhookInfo`).then((result) => result.json());
if (!check.ok || check.result?.url !== `${site.replace(/\/$/, '')}/api/telegram`) {
  console.error('Webhook verification failed.');
  process.exit(1);
}
console.log(`Webhook registered and verified: ${check.result.url}`);
