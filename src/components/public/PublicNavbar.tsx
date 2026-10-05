import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LogIn, Menu, X, UserCheck } from 'lucide-react';
import { APP_ASSETS } from '../../assets/images';

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
    <nav
      style={{ backgroundColor: '#F4EFE9', borderBottomColor: '#E0D6CA' }}
      className="sticky top-0 z-40 border-b backdrop-blur-md shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">

          {/* Logo & Brand */}
          <div
            onClick={() => {
              setCurrentView('company_profile');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-3 cursor-pointer group"
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
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7">
            {['beranda', 'tentang', 'produk', 'galeri', 'kontak'].map((section) => {
              const labels: Record<string, string> = {
                beranda: 'Beranda',
                tentang: 'Tentang Kami',
                produk: 'Katalog Produk',
                galeri: 'Galeri',
                kontak: 'Kontak',
              };
              return (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  style={{ color: '#5C554F', fontFamily: 'Urbanist, sans-serif' }}
                  className="text-sm font-semibold hover:text-[#A8441A] transition-colors"
                >
                  {labels[section]}
                </button>
              );
            })}
          </div>

          {/* CTA: Login / Dashboard */}
          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  style={{ backgroundColor: '#F2A054', color: '#2A1405', fontFamily: 'Urbanist, sans-serif' }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-[#E88D3A] transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  Dashboard ({currentUser.role === 'admin' ? 'Admin' : 'Petugas'})
                </button>
                <button
                  onClick={logout}
                  style={{ color: '#5C554F', borderColor: '#E0D6CA', fontFamily: 'Urbanist, sans-serif' }}
                  className="px-3 py-2 rounded-full border text-sm font-medium hover:bg-[#EDE3D6] transition-colors"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentView('login')}
                style={{ backgroundColor: '#1C1917', color: '#FFFFFF', fontFamily: 'Urbanist, sans-serif' }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-[#A8441A] transition-colors"
              >
                <LogIn className="w-4 h-4 text-[#F2A054]" />
                Masuk Sistem
              </button>
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
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ color: '#1C1917' }}
              className="p-2 rounded-[20px] hover:bg-[#EDE3D6] transition-colors"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ backgroundColor: '#F4EFE9', borderColor: '#E0D6CA' }} className="md:hidden border-b px-4 pt-2 pb-6 space-y-1">
          {[
            { id: 'beranda', label: 'Beranda' },
            { id: 'tentang', label: 'Tentang Kami' },
            { id: 'produk', label: 'Katalog Produk' },
            { id: 'galeri', label: 'Galeri' },
            { id: 'kontak', label: 'Kontak & Pemesanan' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              style={{ color: '#1C1917', fontFamily: 'Urbanist, sans-serif' }}
              className="block w-full text-left py-2.5 text-sm font-semibold hover:text-[#A8441A] transition-colors"
            >
              {item.label}
            </button>
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
        </div>
      )}
    </nav>
  );
};
