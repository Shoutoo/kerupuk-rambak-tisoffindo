import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Heart, ShieldCheck, Lock } from 'lucide-react';
import { APP_ASSETS } from '../../assets/images';

export const PublicFooter: React.FC = () => {
  const { setCurrentView, companyProfile } = useApp();

  const businessName = companyProfile?.business_name || 'Pabrik Krupuk (Kerupuk Rambak Tisoffindo)';
  const address = companyProfile?.address || 'Kliwonan, RT.01/RW.07, Jeron, Kec. Nogosari, Kabupaten Boyolali, Jawa Tengah 57378';
  const phone = companyProfile?.phone || '0857-2811-1147';
  const gmapsUrl = companyProfile?.gmaps_url || 'https://maps.app.goo.gl/G8kHXoGYuuycJxxy7';

  return (
    <footer className="bg-stone-950 text-stone-400 py-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-white border border-amber-400/40 shrink-0">
                <img
                  src={APP_ASSETS.logo}
                  alt="Logo Tisoffindo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-lg font-bold text-white font-serif tracking-tight">
                {businessName}
              </span>
            </div>
            <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
              Sentra produksi dan penjualan kerupuk rambak kulit sapi dan kerbau khas Boyolali. Menjaga kualitas higienis, gurih alami, dan kerenyahan optimal tanpa bahan pengawet kimia.
            </p>
            <p className="text-xs text-stone-400">
              <strong className="text-stone-300">Pabrik & Toko:</strong> {address}
            </p>
            <p className="text-xs text-stone-400">
              <strong className="text-stone-300">WhatsApp / Telp:</strong> {phone} (Buka 24 Jam)
            </p>
            <div className="flex items-center gap-3 text-xs text-stone-500 pt-1">
              <div className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>100% Kulit Halal & Teruji Higienis</span>
              </div>
              <a
                href={gmapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline"
              >
                Google Maps (5.0 ★)
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3">Navigasi</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#beranda" className="hover:text-amber-400 transition-colors">Beranda</a>
              </li>
              <li>
                <a href="#tentang" className="hover:text-amber-400 transition-colors">Tentang Kami</a>
              </li>
              <li>
                <a href="#produk" className="hover:text-amber-400 transition-colors">Katalog Produk</a>
              </li>
              <li>
                <a href="#galeri" className="hover:text-amber-400 transition-colors">Galeri Foto</a>
              </li>
              <li>
                <a href="#kontak" className="hover:text-amber-400 transition-colors">Kontak & Pemesanan</a>
              </li>
            </ul>
          </div>

          {/* Akses Internal */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-stone-200 mb-3">Portal Toko</h5>
            <p className="text-xs text-stone-400 mb-3 leading-relaxed">
              Khusus Petugas Kasir dan Pemilik Usaha untuk pencatatan penjualan dan stok:
            </p>
            <button
              onClick={() => setCurrentView('login')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-stone-850 hover:bg-stone-800 border border-stone-700 text-xs text-amber-400 font-semibold transition-colors"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login Sistem Internal</span>
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© 2026 Tisoffindo Kerupuk Rambak. Seluruh hak cipta dilindungi undang-undang.</p>
          <p className="flex items-center gap-1">
            Dibuat untuk usaha UMKM Kerupuk Rambak Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
};
