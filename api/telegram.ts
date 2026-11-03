import type { IncomingMessage, ServerResponse } from 'node:http';
import { createClient } from '@supabase/supabase-js';

type Product = { name: string; description: string | null; price: number; unit: string; stock_qty: number };
type Profile = { business_name: string; address: string; phone: string; operating_hours: string; gmaps_url: string };
type Update = { message?: { chat?: { id?: number; type?: string }; text?: string } };

const rupiah = (amount: number) => `Rp ${Number(amount).toLocaleString('id-ID')}`;
const help = 'Halo! Saya bot informasi Tisoffindo. Tanyakan produk, harga, stok, alamat, jam buka, kontak, atau website. Ketik /produk untuk melihat katalog.';

export function answer(text: string, products: Product[], profile: Profile | null, websiteUrl: string): string {
  const question = text.trim().toLocaleLowerCase('id-ID');
  if (/^\/(start|help)(\s|$)/.test(question)) return help;
  if (/alamat|lokasi|maps|peta|dimana/.test(question))
    return profile ? `Alamat ${profile.business_name}: ${profile.address}\nPeta: ${profile.gmaps_url}` : 'Alamat belum tersedia. Silakan cek website kami.';
  if (/jam|buka|tutup|operasional/.test(question))
    return profile ? `Jam operasional ${profile.business_name}: ${profile.operating_hours}` : 'Jam operasional belum tersedia. Silakan hubungi kami.';
  if (/kontak|telepon|whatsapp|wa\b|pesan|order|beli/.test(question))
    return profile ? `Untuk pemesanan dan informasi lebih lanjut, hubungi ${profile.phone}.` : 'Kontak belum tersedia. Silakan cek website kami.';
  if (/website|web\b|situs|link/.test(question))
    return websiteUrl ? `Website resmi: ${websiteUrl}` : 'Alamat website belum dikonfigurasi.';

  if (!products.length) return 'Katalog belum tersedia saat ini. Silakan hubungi kami untuk informasi produk.';
  const terms = question.replace(/^\/produk\b/, '').replace(/\b(apa|saja|daftar|lihat|semua|produk|harga|berapa|stok|tersedia|ada|apakah|saya|ingin|cari|tentang|rasa|kemasan|yang|untuk|dan|di|ini|nya)\b/g, ' ').split(/\s+/).filter((word) => word.length > 2);
  const matches = terms.length
    ? products.filter((product) => terms.every((term) => `${product.name} ${product.description ?? ''}`.toLocaleLowerCase('id-ID').includes(term)))
    : products;
  if (!/^\/produk\b/.test(question) && !/produk|harga|stok|rambak|kerupuk|krecek|pedas|balado|sapi|kerbau/.test(question))
    return 'Saya bisa membantu soal produk dan informasi usaha. Ketik /produk untuk katalog, atau tanyakan harga, stok, alamat, jam buka, kontak, dan website.';
  if (!matches.length) return 'Produk yang dimaksud tidak ditemukan di katalog aktif. Coba sebutkan nama/varian lain atau ketik /produk.';
  const rows = matches.slice(0, 10).map((product) => {
    const detail = matches.length === 1 && product.description ? `\n${product.description.slice(0, 400)}` : '';
    return `• ${product.name} — ${rupiah(product.price)}/${product.unit} (${Number(product.stock_qty) > 0 ? 'tersedia' : 'stok habis'})${detail}`;
  });
  return `Katalog Tisoffindo:\n${rows.join('\n')}\n${matches.length > 10 ? `\nDan ${matches.length - 10} produk lainnya; sebutkan varian untuk detail.\n` : ''}\nHarga dan ketersediaan dapat berubah; konfirmasi ke admin sebelum memesan.`;
}

async function readBody(req: IncomingMessage): Promise<Update> {
  // Vercel may already have parsed JSON; otherwise enforce a small request limit.
  const parsed = (req as IncomingMessage & { body?: unknown }).body;
  if (parsed !== undefined) return typeof parsed === 'string' ? JSON.parse(parsed) : parsed as Update;
  let content = '';
  for await (const chunk of req) {
    content += chunk.toString();
    if (content.length > 16_384) throw new Error('Request too large');
  }
  return JSON.parse(content) as Update;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') { res.writeHead(405).end(); return; }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!token || !secret || !url || !key) { res.writeHead(503).end(); return; }
  if (req.headers['x-telegram-bot-api-secret-token'] !== secret) { res.writeHead(403).end(); return; }
  try {
    const update = await readBody(req);
    const chat = update?.message?.chat;
    const text = update?.message?.text;
    if (!chat || chat.type !== 'private' || !Number.isSafeInteger(chat.id) || typeof text !== 'string' || text.length > 2000) {
      res.writeHead(200).end(); return;
    }
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const [{ data: products, error: productError }, { data: profile, error: profileError }] = await Promise.all([
      client.from('products').select('name,description,price,unit,stock_qty').eq('is_active', true).order('name').limit(100),
      client.from('company_profile').select('business_name,address,phone,operating_hours,gmaps_url').limit(1).maybeSingle(),
    ]);
    if (productError || profileError) throw new Error(`Database read failed: ${productError?.message || profileError?.message}`);
    const reply = answer(text, products ?? [], profile, process.env.PUBLIC_SITE_URL || '');
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat.id, text: reply.slice(0, 3800) }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`Telegram sendMessage failed: HTTP ${response.status}`);
    res.writeHead(200).end();
  } catch (error) {
    console.error('Telegram webhook error:', error);
    res.writeHead(500).end(); // Telegram retries failed webhook deliveries.
  }
}
