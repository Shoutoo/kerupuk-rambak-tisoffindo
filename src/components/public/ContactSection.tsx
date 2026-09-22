import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Truck,
  Navigation,
  ExternalLink,
  Star,
  Compass,
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const { companyProfile } = useApp();

  const businessName = companyProfile?.business_name || 'Pabrik Krupuk (Kerupuk Rambak Tisoffindo)';
  const address =
    companyProfile?.address ||
    'Kliwonan, RT.01/RW.07, Kliwonan, Jeron, Kec. Nogosari, Kabupaten Boyolali, Jawa Tengah 57378';
  const phone = companyProfile?.phone || '0812-3456-7890';
  const operatingHours = companyProfile?.operating_hours || 'Buka 24 jam';
  const gmapsUrl = companyProfile?.gmaps_url || 'https://maps.app.goo.gl/G8kHXoGYuuycJxxy7';
  const lat = companyProfile?.gmaps_embed_lat || -7.4620805;
  const lng = companyProfile?.gmaps_embed_lng || 110.8043561;
  const plusCode = companyProfile?.plus_code || 'GRQ3+5P Jeron, Kabupaten Boyolali';
  const rating = companyProfile?.rating ? Number(companyProfile.rating).toFixed(1).replace('.', ',') : '5,0';
  const reviewCount = companyProfile?.review_count || 6;

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;

  const steps = [
    {
      num: '01',
      title: 'Pilih Produk',
      desc: 'Tentukan varian kerupuk rambak matang atau krecek mentah beserta kemasan yang diinginkan.',
    },
    {
      num: '02',
      title: 'Hubungi WhatsApp',
      desc: 'Klik tombol pesan WhatsApp untuk mengirimkan rincian pesanan dan alamat pengiriman Anda.',
    },
    {
      num: '03',
      title: 'Konfirmasi & Pembayaran',
      desc: 'Admin kami akan menghitung total plus estimasi ongkos kirim resmi. Lakukan transfer bank atau QRIS.',
    },
    {
      num: '04',
      title: 'Pengiriman Cepat',
      desc: 'Pesanan dikemas aman dengan kardus tebal dan plastik kedap udara langsung dari pabrik kami di Boyolali.',
    },
  ];

  return (
    <section id="kontak" className="py-16 sm:py-20 bg-stone-900 text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold tracking-wide uppercase mb-3">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Kontak & Lokasi Pabrik</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white tracking-tight">
            Kunjungi Pabrik Kami di Boyolali atau Pesan Online
          </h2>
          <p className="mt-3 text-stone-300 text-sm sm:text-base leading-relaxed">
            Kami melayani pembelian eceran, paket oleh-oleh khas Boyolali, hingga suplai pesanan rutin partai besar untuk rumah makan dan mitra warung.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {steps.map((st, i) => (
            <div
              key={i}
              className="p-5 sm:p-6 rounded-2xl bg-stone-800/80 border border-stone-700/80 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="text-3xl font-extrabold text-amber-500/30 font-serif mb-2">{st.num}</div>
                <h4 className="text-base font-bold text-white mb-1.5">{st.title}</h4>
                <p className="text-xs text-stone-400 leading-relaxed">{st.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 2-Column: Left (Contact Info & Direct Order) + Right (Google Maps Embed & Route CTA) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Business Details & Contact Cards */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  Operasional: {operatingHours}
                </span>
                <a
                  href={gmapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-semibold hover:bg-amber-400/25 transition-colors"
                >
                  <Star className="w-3 h-3 fill-current text-amber-400" />
                  <span>{rating} ({reviewCount} ulasan Google)</span>
                </a>
              </div>
              <h3 className="text-2xl font-bold font-serif text-white">{businessName}</h3>
              <p className="text-stone-300 text-sm leading-relaxed">
                Pintu kami selalu terbuka untuk Anda yang ingin mencicipi langsung kerenyahan kerupuk rambak sapi fresh dari kuali penggorengan tradisional kami.
              </p>
            </div>

            <div className="space-y-3.5 pt-1">
              {/* Alamat */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-stone-800/70 border border-stone-700">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h5 className="font-bold text-sm text-stone-200">Alamat Pabrik & Sentra Produksi:</h5>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">{address}</p>
                  {plusCode && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-stone-400 bg-stone-900/60 px-2 py-0.5 rounded border border-stone-700/60">
                      <Compass className="w-3 h-3 text-amber-400" />
                      <span>Plus Code: <strong>{plusCode}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Jam Operasional */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-stone-800/70 border border-stone-700">
                <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-sm text-stone-200">Jam Operasional:</h5>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1 font-medium text-emerald-400">
                    {operatingHours}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Layanan pemesanan, pengiriman, dan kunjungan pabrik standby setiap hari.
                  </p>
                </div>
              </div>

              {/* Kontak WA & Telp */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-stone-800/70 border border-stone-700">
                <Phone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h5 className="font-bold text-sm text-stone-200">No. Telepon & WhatsApp:</h5>
                  <p className="text-xs sm:text-sm text-stone-300 mt-1 font-mono font-semibold">
                    {phone}
                  </p>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Respon cepat pemesanan eceran, kartonan, dan kemitraan agen.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Callout Button */}
            <div className="pt-2">
              <a
                href={`https://wa.me/${waNumber}?text=Halo%20Tisoffindo,%20saya%20mau%20order%20kerupuk%20rambak%20sapi%20asli.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all transform hover:-translate-y-0.5"
              >
                <Phone className="w-4 h-4" />
                <span>Chat Langsung via WhatsApp ({phone})</span>
              </a>
            </div>
          </div>

          {/* Right Column: Google Maps Embed Card (User Requirement 2) */}
          <div className="lg:col-span-6 rounded-2xl bg-stone-850 p-4 sm:p-6 border border-stone-700 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-700/80 pb-3">
              <div>
                <h4 className="text-base sm:text-lg font-bold font-serif text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Peta Lokasi Google Maps</span>
                </h4>
                <p className="text-xs text-stone-400">Jeron, Kec. Nogosari, Kabupaten Boyolali</p>
              </div>

              {/* Rute ke Lokasi Button (User Requirement 2) */}
              <a
                href={gmapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka Petunjuk Arah di Google Maps"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-102"
              >
                <Navigation className="w-3.5 h-3.5 fill-current" />
                <span>Rute ke Lokasi</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>

            {/* Responsive Iframe Embed Container */}
            <div className="w-full rounded-xl overflow-hidden border border-stone-700 bg-stone-900 aspect-16/10 sm:aspect-16/9 relative shadow-inner">
              <iframe
                src={`https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '320px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Peta Lokasi Pabrik Kerupuk Rambak Tisoffindo Boyolali"
                className="w-full h-full"
              />
            </div>

            {/* Bottom Guarantee Banner */}
            <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-700/70 text-xs text-stone-300 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-amber-400">
                <Truck className="w-4 h-4" />
                <span>Garansi Kerenyahan & Pengiriman Seluruh Indonesia</span>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Setiap kemasan dilindungi segel kedap udara dan dipacking kardus tebal berlapis. Kerupuk sampai renyah mekar sempurna di tempat Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

