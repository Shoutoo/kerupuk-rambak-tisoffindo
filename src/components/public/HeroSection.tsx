import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Phone, Star, ExternalLink, ChevronDown } from 'lucide-react';
import { APP_ASSETS } from '../../assets/images';

// Anchor Case: E5 · 3D Jack Portfolio (MotionSites)
// Preserve: (1) overflow-hidden heading wrapper for clip-reveal animation,
//           (2) flex justify-between bottom bar with copy left + CTAs right,
//           (3) viewport-unit headline font sizes (vw-based)
// Replace:  dark theme → Tisoffindo warm brand palette; "jack" → brand name; creator portfolio → kerupuk rambak
// Avoid:    portfolio grid, pricing personal, black dominant, 3D creator identity

export const HeroSection: React.FC = () => {
  const { setCurrentView, companyProfile, currentUser } = useApp();
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (shouldReduceMotion && videoRef.current) {
      videoRef.current.pause();
    }
  }, [shouldReduceMotion]);

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

  const businessName = companyProfile?.business_name || 'Tisoffindo';

  return (
    <div
      id="beranda"
      style={{ backgroundColor: '#F4EFE9', fontFamily: 'Urbanist, sans-serif' }}
      className="relative h-svh min-h-[600px] max-h-[1000px] flex flex-col overflow-hidden"
    >
      {/* Warm organic background blobs */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: '#F2A054', opacity: 0.10 }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: '#A8441A', opacity: 0.06 }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: '#EDE3D6', opacity: 0.7 }}
        aria-hidden="true"
      />

      {/* Full-bleed hero image — very subtle texture overlay */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <img
          src={APP_ASSETS.rambakStacks}
          alt=""
          width="1920"
          height="1080"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover object-center"
          style={{ opacity: 0.07 }}
        />
      </div>

      {/* ── TOP: Badges + auth shortcut ── */}
      <motion.div
        className="relative z-10 flex items-center gap-3 px-5 sm:px-8 lg:px-12 pt-6"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Google rating badge */}
        <a
          href={companyProfile?.gmaps_url || 'https://maps.app.goo.gl/G8kHXoGYuuycJxxy7'}
          target="_blank"
          rel="noopener noreferrer"
          title="Buka ulasan Google Maps Tisoffindo"
          style={{ backgroundColor: '#F2A054', color: '#2A1405' }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
        >
          <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
          <span>{companyProfile?.rating ? Number(companyProfile.rating).toFixed(1).replace('.', ',') : '5,0'}</span>
          <span className="font-medium">({companyProfile?.review_count || 6} ulasan Google)</span>
          <ExternalLink className="w-3 h-3 opacity-70" aria-hidden="true" />
        </a>

        <div
          style={{ backgroundColor: '#EDE3D6', color: '#5C554F', borderColor: '#E0D6CA' }}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold tracking-wide"
        >
          Sentra Boyolali · Buka 24 Jam
        </div>

        {/* Auth shortcut */}
        <div className="ml-auto">
          {currentUser ? (
            <button
              type="button"
              onClick={() => setCurrentView('dashboard')}
              style={{ color: '#A8441A' }}
              className="text-xs font-bold hover:underline transition-colors flex items-center gap-1"
            >
              Dashboard ({currentUser.role === 'admin' ? 'Admin' : 'Petugas'}) →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentView('login')}
              style={{ color: '#8E857C' }}
              className="text-xs hover:text-[#A8441A] underline underline-offset-4 transition-colors"
            >
              Staf / Pemilik? Masuk →
            </button>
          )}
        </div>
      </motion.div>

      {/* ── MASSIVE HEADLINE — E5 Preserve #1 (overflow-hidden clip reveal) + #3 (vw font) ── */}
      <div className="relative z-10 flex-1 flex flex-col justify-center overflow-hidden px-5 sm:px-8 lg:px-12 -mt-4">
        <div className="overflow-hidden">
          <motion.h1
            style={{
              color: '#1C1917',
              fontFamily: 'Urbanist, sans-serif',
              lineHeight: 0.88,
              letterSpacing: '-0.03em',
            }}
            className="font-black uppercase whitespace-nowrap w-full text-[13vw] sm:text-[13vw] md:text-[14vw] lg:text-[15vw]"
            initial={{ y: shouldReduceMotion ? 0 : '110%', opacity: shouldReduceMotion ? 1 : 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            {businessName}
          </motion.h1>
        </div>

        <div className="overflow-hidden mt-1">
          <motion.p
            style={{ color: '#A8441A', fontFamily: 'Urbanist, sans-serif' }}
            className="font-bold uppercase tracking-widest text-[3.5vw] sm:text-[2.5vw] md:text-[2vw] lg:text-[1.6vw]"
            initial={{ y: shouldReduceMotion ? 0 : '110%', opacity: shouldReduceMotion ? 1 : 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}
          >
            Kerupuk Rambak Sapi &amp; Kerbau Asli · Boyolali
          </motion.p>
        </div>
      </div>

      {/* ── BOTTOM BAR — E5 Preserve #2: flex justify-between items-end ── */}
      <motion.div
        className="relative z-10 flex items-end justify-between gap-4 px-5 sm:px-8 lg:px-12 pb-8 sm:pb-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.45 }}
      >
        {/* Left: short value prop */}
        <p
          style={{ color: '#5C554F', fontFamily: 'Urbanist, sans-serif' }}
          className="max-w-xs sm:max-w-sm text-sm sm:text-base leading-snug"
        >
          100% kulit sapi segar, dijemur matahari, digoreng hingga mekar renyah sempurna. Siap kirim ke seluruh Indonesia.
        </p>

        {/* Right: CTAs */}
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
          <motion.button
            type="button"
            onClick={scrollToProducts}
            style={{ backgroundColor: '#F2A054', color: '#2A1405', fontFamily: 'Urbanist, sans-serif' }}
            className="px-6 py-3 rounded-full font-bold text-sm shadow-md flex items-center gap-2 transition-colors hover:bg-[#E88D3A]"
            whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
          >
            <span>Lihat Katalog</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </motion.button>

          <motion.button
            type="button"
            onClick={openWhatsApp}
            style={{ backgroundColor: '#EDE3D6', color: '#1C1917', borderColor: '#E0D6CA', fontFamily: 'Urbanist, sans-serif' }}
            className="px-6 py-3 rounded-full border font-semibold text-sm flex items-center gap-2 hover:bg-[#E0D6CA] transition-colors"
            whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
          >
            <Phone className="w-4 h-4 shrink-0" style={{ color: '#A8441A' }} aria-hidden="true" />
            <span className="hidden sm:inline">WhatsApp: </span>
            <span>{companyProfile?.phone || '0812-3456-7890'}</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10" aria-hidden="true">
        {!shouldReduceMotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 6, 0] }}
            transition={{
              opacity: { delay: 1.1, duration: 0.4 },
              y: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: 1.1 },
            }}
          >
            <ChevronDown className="w-5 h-5" style={{ color: '#8E857C' }} />
          </motion.div>
        )}
      </div>
    </div>
  );
};
