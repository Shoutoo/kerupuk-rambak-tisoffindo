import assert from 'node:assert/strict';
import { test } from 'node:test';
import handler from '../api/telegram';
import type { IncomingMessage, ServerResponse } from 'node:http';

function response() {
  let status = 0;
  return {
    get status() { return status; },
    writeHead(code: number) { status = code; return this; },
    end() { return this; },
  } as unknown as ServerResponse & { status: number };
}

test('webhook rejects unauthenticated requests and replies with Supabase catalog data', async () => {
  const originalFetch = globalThis.fetch;
  const names = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_WEBHOOK_SECRET', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'PUBLIC_SITE_URL'] as const;
  const original = names.map((name) => process.env[name]);
  const sent: string[] = [];
  try {
    process.env.TELEGRAM_BOT_TOKEN = 'test-token';
    process.env.TELEGRAM_WEBHOOK_SECRET = 'test-secret';
    process.env.SUPABASE_URL = 'https://db.example.com';
    process.env.SUPABASE_ANON_KEY = 'test-anon-key';
    process.env.PUBLIC_SITE_URL = 'https://site.example.com';
    globalThis.fetch = async (input, init) => {
      const url = String(input);
      if (url.includes('/products?')) return Response.json([{ name: 'Krecek Mentah', description: 'Siap goreng', price: 95000, unit: 'kg', stock_qty: 3 }]);
      if (url.includes('/company_profile?')) return Response.json({ business_name: 'Tisoffindo', address: 'Boyolali', phone: '0812', operating_hours: '08.00', gmaps_url: 'https://maps.example' });
      if (url.includes('/sendMessage')) {
        sent.push(JSON.parse(String(init?.body)).text);
        return Response.json({ ok: true, result: {} });
      }
      throw new Error(`Unexpected request: ${url}`);
    };
    const bad = response();
    await handler({ method: 'POST', headers: {}, body: { message: { chat: { id: 123, type: 'private' }, text: '/produk' } } } as unknown as IncomingMessage, bad);
    assert.equal(bad.status, 403);
    assert.equal(sent.length, 0);

    const ok = response();
    await handler({ method: 'POST', headers: { 'x-telegram-bot-api-secret-token': 'test-secret' }, body: { message: { chat: { id: 123, type: 'private' }, text: '/produk' } } } as unknown as IncomingMessage, ok);
    assert.equal(ok.status, 200);
    assert.match(sent[0], /Krecek Mentah.*Rp 95\.000\/kg/);
  } finally {
    globalThis.fetch = originalFetch;
    names.forEach((name, index) => { if (original[index] === undefined) delete process.env[name]; else process.env[name] = original[index]; });
  }
});
