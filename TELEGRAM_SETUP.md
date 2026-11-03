# Bot Telegram pelanggan Tisoffindo

Webhook serverless: `POST /api/telegram` di deployment Vercel. Bot menjawab pertanyaan produk, harga, ketersediaan, alamat, jam operasional, kontak, dan URL website menggunakan tabel `products` dan `company_profile` di Supabase. Jawaban berbasis pencocokan kata kunci (bukan AI percakapan bebas). Tidak perlu proses bot yang terus berjalan di laptop. Tidak menerima pembayaran/pesanan dan tidak mengakses tabel privat.

## Aktivasi (setelah token bot tersedia)

1. Buat bot melalui BotFather. Simpan token sebagai environment variable **server-side** `TELEGRAM_BOT_TOKEN` di Vercel; jangan taruh di kode, chat publik, atau variabel `VITE_`.
2. Buat secret acak (mis. `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`) dan simpan sebagai `TELEGRAM_WEBHOOK_SECRET` di Vercel. Telegram mensyaratkan karakter `A-Z a-z 0-9 _ -` dan panjang 1–256.
3. Di Vercel set `SUPABASE_URL` dan `SUPABASE_ANON_KEY` dari proyek Supabase yang digunakan website (kunci anon/publishable, **bukan service role**); set `PUBLIC_SITE_URL` ke URL HTTPS website tanpa slash akhir; set `VITE_TELEGRAM_BOT_USERNAME` ke username bot (tanpa @) agar tautan Telegram tampil pada halaman kontak. Redeploy setelah mengubah environment variables.
4. Pastikan skema dan data sudah ada di Supabase: tabel `products` dan `company_profile` harus memiliki kebijakan SELECT publik seperti dalam `supabase/schema.sql`. Jika RLS menolak, bot mengembalikan HTTP 500 dan Telegram akan mencoba lagi; periksa log fungsi Vercel.
5. Pada lingkungan terminal pribadi, set `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, dan `PUBLIC_SITE_URL` dengan nilai yang sama seperti di Vercel. Jalankan `node scripts/register-telegram-webhook.mjs`. Script memanggil `setWebhook` dan memeriksa hasil lewat `getWebhookInfo`. Jangan jalankan `getUpdates`/polling dengan token yang sama.
6. Uji chat privat: `/start`, `/produk`, `harga rambak sapi`, `alamat`, `jam buka`, `website`. Cek `getWebhookInfo` dan log Vercel jika gagal.

Penting: aplikasi website saat ini menyimpan perubahan dari layar admin di `localStorage` browser; fungsi edit admin belum menulis ke Supabase. Bot membaca data Supabase yang tersimpan, **bukan** perubahan lokal tersebut. Agar perubahan produk/profil dari admin langsung terlihat oleh bot dan pengguna lain, perlu migrasi alur tulis admin ke database dengan autentikasi Supabase yang aman. Jangan menambahkan service-role key ke browser untuk mengatasinya.
