import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowRight, Award, CheckCircle2, Phone, Star, ExternalLink, MapPin, PackageCheck } from 'lucide-react';
import { APP_ASSETS } from '../../assets/images';

export const HeroSection: React.FC = () => {
  const { setCurrentView, companyProfile, currentUser } = useApp();

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
    <div id="beranda" style={{ backgroundColor: '#F4EFE9', fontFamily: 'Urbanist, sans-serif' }} className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      {/* Warm organic background blobs */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: '#F2A054', opacity: 0.08 }} />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: '#A8441A', opacity: 0.06 }} />
      <div className="absolute top-1/2 -left-20 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: '#EDE3D6', opacity: 0.6 }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Headlines & Call to Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Google Rating Badge */}
              <a
                href={companyProfile?.gmaps_url || 'https://maps.app.goo.gl/G8kHXoGYuuycJxxy7'}
                target="_blank"
                rel="noopener noreferrer"
                title="Buka Ulasan Google Maps Pabrik Kerupuk Rambak Tisoffindo"
                style={{ backgroundColor: '#F2A054', color: '#2A1405', fontFamily: 'Urbanist, sans-serif' }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:bg-[#E88D3A] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{companyProfile?.rating ? Number(companyProfile.rating).toFixed(1).replace('.', ',') : '5,0'}</span>
                </div>
                <span className="font-medium">({companyProfile?.review_count || 6} ulasan Google)</span>
                <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
              </a>

              {/* Tag Pill */}
              <div
                style={{ backgroundColor: '#EDE3D6', color: '#3A2618', borderColor: '#E0D6CA' }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide"
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#A8441A' }} />
                <span>SENTRA BOYOLALI</span>
              </div>
            </div>

            <h1 style={{ color: '#1C1917', fontFamily: 'Urbanist, sans-serif' }} className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Kerenyahan Autentik, <br />
              <span style={{ color: '#A8441A' }}>
                Gurih Alami Tanpa Kompromi.
              </span>
            </h1>

            <p style={{ color: '#5C554F', fontFamily: 'Urbanist, sans-serif' }} className="text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed">
              {companyProfile?.business_name || 'Tisoffindo'} memproduksi kerupuk rambak sapi dan kerbau pilihan langsung dari rumah produksi kami di Boyolali. Diproses dari kulit sapi segar berkualitas tinggi, dijemur matahari alami, dan digoreng teknik khusus hingga mekar renyah sempurna.
            </p>

            {/* Feature Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {[
                '100% Kulit Sapi & Kerbau Halal',
                'Minyak Nabati Berkualitas & Higienis',
                'Kemasan Kedap Udara Tahan 3+ Bulan',
                'Buka 24 Jam — Siap Kirim Seluruh RI',
              ].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#A8441A' }} />
                  <span style={{ color: '#3A2618', fontFamily: 'Urbanist, sans-serif' }} className="text-xs sm:text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                type="button"
                onClick={scrollToProducts}
                style={{ backgroundColor: '#F2A054', color: '#2A1405', fontFamily: 'Urbanist, sans-serif' }}
                className="px-6 py-3 rounded-full font-bold text-sm shadow-md hover:bg-[#E88D3A] flex items-center gap-2 transition-all"
              >
                <span>Lihat Katalog Produk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={openWhatsApp}
                style={{ backgroundColor: '#EDE3D6', color: '#1C1917', borderColor: '#E0D6CA', fontFamily: 'Urbanist, sans-serif' }}
                className="px-6 py-3 rounded-full border font-semibold text-sm flex items-center gap-2 transition-all hover:bg-[#E0D6CA]"
              >
                <Phone className="w-4 h-4" style={{ color: '#A8441A' }} />
                <span>WhatsApp: {companyProfile?.phone || '0812-3456-7890'}</span>
              </button>
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => setCurrentView('dashboard')}
                  style={{ color: '#A8441A', fontFamily: 'Urbanist, sans-serif' }}
                  className="text-xs font-bold hover:underline py-2 transition-colors flex items-center gap-1"
                >
                  <span>Buka Dashboard ({currentUser.role === 'admin' ? 'Admin' : 'Petugas'}) &rarr;</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentView('login')}
                  style={{ color: '#5C554F', fontFamily: 'Urbanist, sans-serif' }}
                  className="text-xs hover:text-[#A8441A] underline underline-offset-4 py-2 transition-colors"
                >
                  Staf / Pemilik? Masuk Sistem &rarr;
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Hero Visual Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Card glow */}
              <div className="absolute -inset-1 rounded-[40px] blur-md opacity-20 pointer-events-none" style={{ background: 'linear-gradient(135deg, #F2A054, #A8441A)' }} />

              <div style={{ backgroundColor: '#FFFFFF', borderColor: '#E0D6CA' }} className="relative rounded-[40px] p-4 border shadow-lg">
                <div className="relative aspect-4/3 rounded-[28px] overflow-hidden" style={{ backgroundColor: '#EDE3D6' }}>
                  <img
                    src={APP_ASSETS.rambakPack}
                    alt="Kemasan Asli Kerupuk Rambak Sapi Tisoffindo Boyolali"
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.92)', color: '#1C1917', borderColor: '#E0D6CA' }} className="absolute top-3 left-3 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 shadow-sm">
                    <PackageCheck className="w-3.5 h-3.5" style={{ color: '#A8441A' }} />
                    <span>Kemasan Asli Tisoffindo</span>
                  </div>
                  <div style={{ backgroundColor: '#F2A054', color: '#2A1405' }} className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold shadow-md">
                    Renyah &amp; Gurih
                  </div>
                </div>

                {/* Sub Card Stats */}
                <div style={{ borderColor: '#E0D6CA' }} className="mt-4 grid grid-cols-3 gap-2 text-center pt-3 border-t">
                  {[
                    { value: '100%', label: 'Kulit Sapi Asli' },
                    { value: '5.0 ★', label: 'Rating Google' },
                    { value: '24 Jam', label: 'Operasional' },
                  ].map((stat) => (
                    <div key={stat.label} style={{ backgroundColor: '#F4EFE9' }} className="p-2 rounded-[20px]">
                      <p style={{ color: '#A8441A', fontFamily: 'Urbanist, sans-serif' }} className="text-lg sm:text-xl font-bold">{stat.value}</p>
                      <p style={{ color: '#8E857C' }} className="text-[11px]">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

