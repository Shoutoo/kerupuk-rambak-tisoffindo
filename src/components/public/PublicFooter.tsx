import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, MapPin, Phone } from 'lucide-react';
import { APP_ASSETS } from '../../assets/images';
import { staggerContainer, staggerItem, viewportOnce } from '../../utils/motionVariants';

export const PublicFooter: React.FC = () => {
  const { setCurrentView, companyProfile } = useApp();

  const businessName = companyProfile?.business_name || 'Pabrik Krupuk (Kerupuk Rambak Tisoffindo)';
  const address = companyProfile?.address || 'Kliwonan, RT.01/RW.07, Jeron, Kec. Nogosari, Kabupaten Boyolali, Jawa Tengah 57378';
  const phone = companyProfile?.phone || '0812-3456-7890';
  const gmapsUrl = companyProfile?.gmaps_url || 'https://maps.app.goo.gl/G8kHXoGYuuycJxxy7';
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: '#1C1917', color: '#FFFFFF', fontFamily: 'Urbanist, sans-serif' }} className="py-16 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10"
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >

          {/* Brand Column */}
          <motion.div variants={staggerItem} className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div style={{ borderColor: '#E0D6CA' }} className="w-10 h-10 rounded-[20px] overflow-hidden bg-white border shrink-0">
                <img
                  src={APP_ASSETS.logo}
                  alt="Logo Tisoffindo"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span style={{ color: '#FFFFFF', fontFamily: 'Urbanist, sans-serif' }} className="text-lg font-bold tracking-tight">
                {businessName}
              </span>
            </div>

            <p style={{ color: '#8E857C' }} className="text-sm leading-relaxed max-w-sm">
              Sentra produksi dan penjualan kerupuk rambak kulit sapi dan kerbau khas Boyolali. Menjaga kualitas higienis, gurih alami, dan kerenyahan optimal tanpa bahan pengawet kimia.
            </p>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F2A054' }} />
                <p style={{ color: '#8E857C' }} className="text-sm">{address}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" style={{ color: '#F2A054' }} />
                <p style={{ color: '#8E857C' }} className="text-sm">{phone} <span style={{ color: '#5C554F' }}>(Buka 24 Jam)</span></p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1.5" style={{ color: '#2F7D4F' }}>
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="text-xs font-semibold">100% Halal &amp; Higienis</span>
              </div>
              <a
                href={gmapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#F2A054' }}
                className="text-xs font-semibold hover:underline"
              >
                Google Maps (5.0 ★)
              </a>
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div variants={staggerItem}>
            <h5 style={{ color: '#EDE3D6', letterSpacing: '0.08em' }} className="text-xs font-bold uppercase mb-4">Navigasi</h5>
            <ul className="space-y-2">
              {[
                { href: '#beranda', label: 'Beranda' },
                { href: '#tentang', label: 'Tentang Kami' },
                { href: '#produk', label: 'Katalog Produk' },
                { href: '#galeri', label: 'Galeri Foto' },
                { href: '#kontak', label: 'Kontak & Pemesanan' },
              ].map((item) => (
                <li key={item.href}>
                  <a href={item.href} style={{ color: '#8E857C' }} className="text-sm hover:text-[#F2A054] transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Portal Internal */}
          <motion.div variants={staggerItem}>
            <h5 style={{ color: '#EDE3D6', letterSpacing: '0.08em' }} className="text-xs font-bold uppercase mb-4">Portal Toko</h5>
            <p style={{ color: '#8E857C' }} className="text-sm mb-4 leading-relaxed">
              Khusus Petugas Kasir dan Pemilik Usaha untuk pencatatan penjualan dan stok.
            </p>
            <motion.button
              onClick={() => setCurrentView('login')}
              style={{ backgroundColor: '#2A2420', borderColor: '#3A302A', color: '#F2A054', fontFamily: 'Urbanist, sans-serif' }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-bold hover:bg-[#3A302A] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Lock className="w-3.5 h-3.5" />
              Login Sistem Internal
            </motion.button>
          </motion.div>
        </motion.div>

        <div style={{ borderColor: '#2A2420' }} className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p style={{ color: '#5C554F' }} className="text-xs">
            © {year} Tisoffindo Kerupuk Rambak. Seluruh hak cipta dilindungi undang-undang.
          </p>
          <p style={{ color: '#5C554F' }} className="text-xs">
            Dibuat untuk UMKM Kerupuk Rambak Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
};
