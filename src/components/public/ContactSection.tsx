import React from 'react';
import { motion } from 'motion/react';
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
import { staggerContainer, staggerItem, fadeInLeft, fadeInRight, viewportOnce } from '../../utils/motionVariants';

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

  const telegramUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME?.replace(/^@/, '');
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
    <section id="kontak" className="py-16 sm:py-20 bg-[#1C1917] text-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
          variants={staggerContainer(0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A8441A]/20 border border-[#A8441A]/40 text-[#F2A054] text-xs font-bold tracking-wide uppercase mb-3">
            <MessageSquare className="w-3.5 h-3.5 text-[#F2A054]" />
            <span>Kontak & Lokasi Pabrik</span>
          </motion.div>
          <motion.h2 variants={staggerItem} className="text-3xl sm:text-4xl font-bold text-white tracking-tight" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            Kunjungi Pabrik Kami di Boyolali atau Pesan Online
          </motion.h2>
          <motion.p variants={staggerItem} className="mt-3 text-stone-300 text-sm sm:text-base leading-relaxed">
            Kami melayani pembelian eceran, paket oleh-oleh khas Boyolali, hingga suplai pesanan rutin partai besar untuk rumah makan dan mitra warung.
          </motion.p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16"
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          {steps.map((st, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className="p-5 sm:p-6 rounded-2xl bg-[#26201D] border border-[#3E302A] relative overflow-hidden flex flex-col justify-between"
              whileHover={{ y: -5, borderColor: 'rgba(168, 68, 26, 0.6)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div>
                <div className="text-3xl font-extrabold text-[#F2A054]/30 mb-2" style={{ fontFamily: 'Urbanist, sans-serif' }}>{st.num}</div>
                <h4 className="text-base font-bold text-white mb-1.5">{st.title}</h4>
                <p className="text-xs text-stone-300 leading-relaxed">{st.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 2-Column: Left (Contact Info & Direct Order) + Right (Google Maps Embed & Route CTA) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Business Details & Contact Cards */}
          <motion.div
            className="lg:col-span-6 space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={staggerContainer(0.12)}
          >
            <motion.div variants={staggerItem} className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
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
              <h3 className="text-2xl font-bold text-white" style={{ fontFamily: 'Urbanist, sans-serif' }}>{businessName}</h3>
              <p className="text-stone-300 text-sm leading-relaxed">
                Pintu kami selalu terbuka untuk Anda yang ingin mencicipi langsung kerenyahan kerupuk rambak sapi fresh dari kuali penggorengan tradisional kami.
              </p>
            </motion.div>

            <div className="space-y-3.5 pt-1">
              {[
                {
                  icon: <MapPin className="w-5 h-5 text-[#F2A054] shrink-0 mt-0.5" />,
                  title: 'Alamat Pabrik & Sentra Produksi:',
                  content: (
                    <>
                      <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed break-words">{address}</p>
                      {plusCode && (
                        <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-stone-400 bg-stone-900/60 px-2 py-0.5 rounded border border-stone-700/60">
                          <Compass className="w-3 h-3 text-[#F2A054]" />
                          <span>Plus Code: <strong>{plusCode}</strong></span>
                        </div>
                      )}
                    </>
                  ),
                },
                {
                  icon: <Clock className="w-5 h-5 text-[#F2A054] shrink-0 mt-0.5" />,
                  title: 'Jam Operasional:',
                  content: (
                    <>
                      <p className="text-xs sm:text-sm text-stone-300 mt-1 font-medium">{operatingHours}</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">Layanan pemesanan, pengiriman, dan kunjungan pabrik standby setiap hari.</p>
                    </>
                  ),
                },
                {
                  icon: <Phone className="w-5 h-5 text-[#F2A054] shrink-0 mt-0.5" />,
                  title: 'No. Telepon & WhatsApp:',
                  content: (
                    <>
                      <p className="text-xs sm:text-sm text-stone-300 mt-1 font-mono font-semibold">{phone}</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">Respon cepat pemesanan eceran, kartonan, dan kemitraan agen.</p>
                    </>
                  ),
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={staggerItem}
                  className="flex items-start gap-3.5 p-4 rounded-xl bg-[#26201D] border border-[#3E302A]"
                  whileHover={{ x: 6, borderColor: 'rgba(168, 68, 26, 0.4)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {item.icon}
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-sm text-stone-200">{item.title}</h5>
                    {item.content}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Direct WhatsApp Callout Button */}
            <motion.div variants={staggerItem} className="pt-2">
              <motion.a
                href={`https://wa.me/${waNumber}?text=Halo%20Tisoffindo,%20saya%20mau%20order%20kerupuk%20rambak%20sapi%20asli.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-[#A8441A] hover:bg-[#8F3713] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 transition-all border border-[#C25222]/30"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <Phone className="w-4 h-4" />
                <span>Chat Langsung via WhatsApp ({phone})</span>
              </motion.a>
            </motion.div>
            {telegramUsername && /^[A-Za-z0-9_]{5,32}$/.test(telegramUsername) && (
              <a
                href={`https://t.me/${telegramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center rounded-xl border border-[#F2A054] px-4 py-3 font-bold text-sm text-[#F2A054] hover:bg-[#F2A054]/10"
              >
                Tanya produk via bot Telegram
              </a>
            )}
          </motion.div>

          {/* Right Column: Google Maps Embed Card */}
          <motion.div
            className="lg:col-span-6 rounded-2xl bg-stone-850 p-4 sm:p-6 border border-stone-700 shadow-xl space-y-4"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewportOnce}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-700/80 pb-3">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Urbanist, sans-serif' }}>
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Peta Lokasi Google Maps</span>
                </h4>
                <p className="text-xs text-stone-400">Jeron, Kec. Nogosari, Kabupaten Boyolali</p>
              </div>

              <motion.a
                href={gmapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka Petunjuk Arah di Google Maps"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Navigation className="w-3.5 h-3.5 fill-current" />
                <span>Rute ke Lokasi</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </motion.a>
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
          </motion.div>
        </div>
      </div>
    </section>
  );
};
