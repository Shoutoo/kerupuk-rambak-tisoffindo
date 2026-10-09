import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { LogIn, Menu, X, UserCheck } from 'lucide-react';
import { APP_ASSETS } from '../../assets/images';

const navSections = [
  { id: 'beranda', label: 'Beranda' },
  { id: 'tentang', label: 'Tentang Kami' },
  { id: 'produk', label: 'Katalog Produk' },
  { id: 'galeri', label: 'Galeri' },
  { id: 'kontak', label: 'Kontak' },
];

export const PublicNavbar: React.FC = () => {
  const { setCurrentView, currentUser, logout, companyProfile } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.nav
      style={{ backgroundColor: '#F4EFE9', borderBottomColor: '#E0D6CA' }}
      className="sticky top-0 z-40 border-b backdrop-blur-md shadow-sm"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">

          {/* Logo & Brand */}
          <motion.div
            onClick={() => {
              setCurrentView('company_profile');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 cursor-pointer group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <div
              style={{ borderColor: '#E0D6CA' }}
              className="w-11 h-11 rounded-[20px] overflow-hidden shadow-md border bg-white shrink-0 group-hover:scale-105 transition-transform duration-300"
            >
              <img
                src={APP_ASSETS.logo}
                alt="Logo Tisoffindo"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  style={{ color: '#1C1917', fontFamily: 'Urbanist, sans-serif' }}
                  className="text-xl font-bold tracking-tight"
                >
                  Tisoffindo
                </span>
                <span
                  style={{ backgroundColor: '#EDE3D6', color: '#3A2618' }}
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                >
                  Boyolali
                </span>
              </div>
              <p style={{ color: '#8E857C', fontFamily: 'Urbanist, sans-serif' }} className="text-xs font-medium hidden sm:block">
                Pabrik &amp; Sentra Kerupuk Rambak Sapi Asli
              </p>
            </div>
          </motion.div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7">
            {navSections.map((section, i) => (
              <motion.button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                style={{ color: '#5C554F', fontFamily: 'Urbanist, sans-serif' }}
                className="text-sm font-semibold hover:text-[#A8441A] transition-colors"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                whileHover={{ y: -1 }}
              >
                {section.label}
              </motion.button>
            ))}
          </div>

          {/* CTA: Login / Dashboard */}
          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => setCurrentView('dashboard')}
                  style={{ backgroundColor: '#F2A054', color: '#2A1405', fontFamily: 'Urbanist, sans-serif' }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-[#E88D3A] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <UserCheck className="w-4 h-4" />
                  Dashboard ({currentUser.role === 'admin' ? 'Admin' : 'Petugas'})
                </motion.button>
                <motion.button
                  onClick={logout}
                  style={{ color: '#5C554F', borderColor: '#E0D6CA', fontFamily: 'Urbanist, sans-serif' }}
                  className="px-3 py-2 rounded-full border text-sm font-medium hover:bg-[#EDE3D6] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Keluar
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={() => setCurrentView('login')}
                style={{ backgroundColor: '#1C1917', color: '#FFFFFF', fontFamily: 'Urbanist, sans-serif' }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-[#A8441A] transition-colors"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogIn className="w-4 h-4 text-[#F2A054]" />
                Masuk Sistem
              </motion.button>
            )}
          </div>

          {/* Mobile trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setCurrentView('login')}
              style={{ backgroundColor: '#1C1917', color: '#FFFFFF' }}
              className="p-2 rounded-full text-xs font-semibold flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-[#F2A054]" />
              Login
            </button>
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: '#1C1917' }}
              className="p-2 rounded-[20px] hover:bg-[#EDE3D6] transition-colors"
              aria-label="Buka Menu"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileMenuOpen ? (
                  <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="w-6 h-6" />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="w-6 h-6" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{ backgroundColor: '#F4EFE9', borderColor: '#E0D6CA' }}
            className="md:hidden border-b overflow-hidden"
          >
            <motion.div
              className="px-4 pt-2 pb-6 space-y-1"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {navSections.map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  style={{ color: '#1C1917', fontFamily: 'Urbanist, sans-serif' }}
                  className="block w-full text-left py-2.5 text-sm font-semibold hover:text-[#A8441A] transition-colors"
                  variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
                >
                  {item.label}
                </motion.button>
              ))}
              <div className="pt-3" style={{ borderTop: '1px solid #E0D6CA' }}>
                {currentUser ? (
                  <button
                    onClick={() => setCurrentView('dashboard')}
                    style={{ backgroundColor: '#F2A054', color: '#2A1405', fontFamily: 'Urbanist, sans-serif' }}
                    className="w-full py-2.5 rounded-full text-center font-bold text-sm"
                  >
                    Dashboard ({currentUser.role})
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentView('login')}
                    style={{ backgroundColor: '#1C1917', color: '#FFFFFF', fontFamily: 'Urbanist, sans-serif' }}
                    className="w-full py-2.5 rounded-full text-center font-bold text-sm flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4 text-[#F2A054]" />
                    Masuk Sistem (Admin / Petugas)
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
