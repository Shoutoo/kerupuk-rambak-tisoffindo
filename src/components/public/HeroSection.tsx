import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowRight, Award, CheckCircle2, Phone, Star, ExternalLink, MapPin, PackageCheck } from 'lucide-react';
import { APP_ASSETS } from '../../assets/images';

export const HeroSection: React.FC = () => {
  const { setCurrentView, companyProfile } = useApp();

  const scrollToProducts = () => {
    const el = document.getElementById('produk');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const openWhatsApp = () => {
    const cleanPhone = (companyProfile?.phone || '0812-3456-7890').replace(/[^0-9]/g, '');
    const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    window.open(
      `https://wa.me/${waNumber}?text=Halo%20${encodeURIComponent(
        companyProfile?.business_name || 'Tisoffindo'
      )},%20saya%20tertarik%20dengan%20kerupuk%20rambak%20asli.%20Boleh%20minta%20info%20katalog%20dan%20pemesanan%3F`,
      '_blank'
    );
  };

  return (
    <div id="beranda" className="relative overflow-hidden bg-stone-900 text-stone-100 py-16 sm:py-20 lg:py-24">
      {/* Subtle Warm Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/60 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Badges Row */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Google Rating Badge (User Requirement 5) */}
              <a
                href={companyProfile?.gmaps_url || 'https://maps.app.goo.gl/G8kHXoGYuuycJxxy7'}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka Ulasan Google Maps Pabrik Kerupuk Rambak Tisoffindo"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-stone-950 text-xs font-bold shadow-md hover:bg-amber-300 transition-all hover:scale-102 cursor-pointer group"
              >
                <div className="flex items-center gap-0.5 text-stone-950">
                  <Star className="w-3.5 h-3.5 fill-current text-stone-950" />
                  <span>{companyProfile?.rating ? Number(companyProfile.rating).toFixed(1).replace('.', ',') : '5,0'}</span>
                </div>
                <span className="text-stone-800 font-medium">({companyProfile?.review_count || 6} ulasan Google)</span>
                <ExternalLink className="w-3 h-3 text-stone-700 group-hover:text-stone-950 ml-0.5" />
              </a>

              {/* Tag Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-800/90 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>SENTRA BOYOLALI</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-serif tracking-tight text-white leading-tight">
              Kerenyahan Autentik, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200">
                Gurih Alami Tanpa Kompromi.
              </span>
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-stone-300 max-w-2xl leading-relaxed">
              {companyProfile?.business_name || 'Tisoffindo'} memproduksi kerupuk rambak sapi dan kerbau pilihan langsung dari rumah produksi kami di Boyolali. Diproses dari kulit sapi segar berkualitas tinggi, dijemur matahari alami, dan digoreng teknik khusus hingga mekar renyah sempurna.
            </p>

            {/* Feature Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs sm:text-sm text-stone-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>100% Kulit Sapi & Kerbau Halal</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Minyak Nabati Berkualitas & Higienis</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Kemasan Kedap Udara Tahan 3+ Bulan</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Buka 24 Jam — Siap Kirim Seluruh RI</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                type="button"
                onClick={scrollToProducts}
                className="px-5 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>Lihat Katalog Produk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={openWhatsApp}
                className="px-5 sm:px-6 py-3 rounded-xl bg-stone-800/90 hover:bg-stone-800 text-stone-100 border border-stone-700 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all hover:border-amber-500/50"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                <span>WhatsApp: {companyProfile?.phone || '0812-3456-7890'}</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentView('login')}
                className="text-xs text-stone-400 hover:text-amber-400 underline underline-offset-4 py-2"
              >
                Staf / Pemilik? Masuk Sistem &rarr;
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Back Card Decoration */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-700 rounded-3xl blur-md opacity-30 group-hover:opacity-100 transition duration-1000" />

              <div className="relative rounded-2xl bg-stone-850 p-3 sm:p-4 border border-stone-700/80 shadow-2xl">
                <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-800">
                  <img
                    src={APP_ASSETS.rambakPack}
                    alt="Kemasan Asli Kerupuk Rambak Sapi Tisoffindo Boyolali"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-amber-300 border border-stone-700 flex items-center gap-1.5 shadow-sm">
                    <PackageCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Kemasan Asli Tisoffindo</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-amber-500 text-stone-950 px-3 py-1 rounded-lg text-xs font-bold shadow-md">
                    Renyah & Gurih
                  </div>
                </div>

                {/* Sub Card Stats */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center pt-2 border-t border-stone-800">
                  <div className="p-2 rounded-lg bg-stone-800/50">
                    <p className="text-lg sm:text-xl font-bold text-amber-400 font-serif">100%</p>
                    <p className="text-[11px] text-stone-400">Kulit Sapi Asli</p>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-800/50">
                    <p className="text-lg sm:text-xl font-bold text-amber-400 font-serif">5.0 ★</p>
                    <p className="text-[11px] text-stone-400">Rating Google</p>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-800/50">
                    <p className="text-lg sm:text-xl font-bold text-amber-400 font-serif">24 Jam</p>
                    <p className="text-[11px] text-stone-400">Operasional</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

