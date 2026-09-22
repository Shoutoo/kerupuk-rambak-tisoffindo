import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, LogIn, Menu, X, PhoneCall, ShieldCheck, UserCheck } from 'lucide-react';

export const PublicNavbar: React.FC = () => {
  const { setCurrentView, currentUser, logout, quickLogin, companyProfile } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div
            onClick={() => {
              setCurrentView('company_profile');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-stone-900 font-serif">
                  Tisoffindo
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Boyolali
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium hidden sm:block">
                Pabrik & Sentra Kerupuk Rambak Sapi Asli Gurih
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            <button
              onClick={() => scrollToSection('beranda')}
              className="text-sm font-medium text-stone-700 hover:text-amber-600 transition-colors"
            >
              Beranda
            </button>
            <button
              onClick={() => scrollToSection('tentang')}
              className="text-sm font-medium text-stone-700 hover:text-amber-600 transition-colors"
            >
              Tentang Kami
            </button>
            <button
              onClick={() => scrollToSection('produk')}
              className="text-sm font-medium text-stone-700 hover:text-amber-600 transition-colors"
            >
              Katalog Produk
            </button>
            <button
              onClick={() => scrollToSection('galeri')}
              className="text-sm font-medium text-stone-700 hover:text-amber-600 transition-colors"
            >
              Galeri & Testimoni
            </button>
            <button
              onClick={() => scrollToSection('kontak')}
              className="text-sm font-medium text-stone-700 hover:text-amber-600 transition-colors"
            >
              Lokasi & Kontak
            </button>
          </div>

          {/* Action: Portal Internal / Login */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-xs transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  Dashboard ({currentUser.role === 'admin' ? 'Admin' : 'Petugas'})
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 text-sm font-medium transition-colors"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('login')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold shadow-xs transition-all hover:shadow-md"
                >
                  <LogIn className="w-4 h-4 text-amber-400" />
                  Masuk Sistem
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setCurrentView('login')}
              className="p-2 rounded-lg bg-stone-900 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              Login
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-700 hover:bg-stone-100"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stone-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <button
            onClick={() => scrollToSection('beranda')}
            className="block w-full text-left py-2 text-stone-800 font-medium hover:text-amber-600"
          >
            Beranda
          </button>
          <button
            onClick={() => scrollToSection('tentang')}
            className="block w-full text-left py-2 text-stone-800 font-medium hover:text-amber-600"
          >
            Tentang Kami
          </button>
          <button
            onClick={() => scrollToSection('produk')}
            className="block w-full text-left py-2 text-stone-800 font-medium hover:text-amber-600"
          >
            Katalog Produk
          </button>
          <button
            onClick={() => scrollToSection('galeri')}
            className="block w-full text-left py-2 text-stone-800 font-medium hover:text-amber-600"
          >
            Galeri
          </button>
          <button
            onClick={() => scrollToSection('kontak')}
            className="block w-full text-left py-2 text-stone-800 font-medium hover:text-amber-600"
          >
            Kontak & Pemesanan
          </button>
          <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
            {currentUser ? (
              <button
                onClick={() => setCurrentView('dashboard')}
                className="w-full py-2.5 rounded-lg bg-amber-600 text-white text-center font-medium"
              >
                Masuk ke Dashboard ({currentUser.role})
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('login')}
                className="w-full py-2.5 rounded-lg bg-stone-900 text-white text-center font-medium flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                Masuk Sistem (Admin / Petugas)
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
