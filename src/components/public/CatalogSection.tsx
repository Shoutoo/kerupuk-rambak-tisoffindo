import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { Search, ShoppingBag, Phone, Check, Tag } from 'lucide-react';
import { resolveProductImageUrl, getProductFallbackImage } from '../../utils/productImages';
import { staggerContainer, staggerItem, scaleUp, fadeInUp, viewportOnce } from '../../utils/motionVariants';

export const CatalogSection: React.FC = () => {
  const { products, categories, companyProfile } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeProducts = products.filter((p) => p.is_active);
  const selectedCatObj = categories.find((c) => c.id === selectedCategory);

  const filteredProducts = activeProducts.filter((product) => {
    const matchCategory =
      selectedCategory === 'all' ||
      product.category_id === selectedCategory ||
      (selectedCatObj && product.category_name?.toLowerCase().trim() === selectedCatObj.name.toLowerCase().trim());
    const matchSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleOrderWhatsApp = (product: Product) => {
    const message = encodeURIComponent(
      `Halo Tisoffindo, saya ingin memesan:\n\n*Produk:* ${product.name}\n*Harga:* Rp ${product.price.toLocaleString('id-ID')} / ${product.unit}\n\nMohon info ketersediaan dan ongkos kirim ke alamat saya. Terima kasih!`
    );
    const cleanPhone = (companyProfile?.phone || '0812-3456-7890').replace(/[^0-9]/g, '');
    const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    window.open(`https://wa.me/${waNumber}?text=${message}`, '_blank');
  };

  return (
    <section id="produk" className="py-20" style={{ backgroundColor: '#EAE2D8' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          variants={staggerContainer(0.15)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold tracking-wide uppercase mb-3">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-700" />
            Katalog Produk Kami
          </motion.div>
          <motion.h2 variants={staggerItem} className="text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight" style={{ fontFamily: 'Urbanist, sans-serif' }}>
            Varian Kerupuk Rambak Tisoffindo
          </motion.h2>
          <motion.p variants={staggerItem} className="mt-3 text-stone-600 text-sm sm:text-base">
            Pilih varian favorit Anda, mulai dari rambak sapi super gurih matang, kemasan oleh-oleh, hingga krecek mentah siap goreng untuk persediaan jangka panjang.
          </motion.p>
        </motion.div>

        {/* Filter & Search Bar */}
        <motion.div
          className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.4 }}
        >
          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <motion.button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#A8441A] text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-[#F4EFE9]'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              Semua Kategori ({activeProducts.length})
            </motion.button>
            {categories.map((cat) => {
              const count = activeProducts.filter(
                (p) => p.category_id === cat.id || p.category_name?.toLowerCase().trim() === cat.name.toLowerCase().trim()
              ).length;
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-[#A8441A] text-white shadow-xs'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-[#F4EFE9]'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {cat.name} ({count})
                </motion.button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kerupuk rambak..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-white border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>
        </motion.div>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {filteredProducts.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-16 bg-white rounded-2xl border border-stone-200"
            >
              <p className="text-stone-500 text-sm">Tidak ada produk yang cocok dengan pencarian Anda.</p>
            </motion.div>
          ) : (
            <motion.div
              key={`${selectedCategory}-${searchQuery}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer(0.08)}
              initial="hidden"
              animate="visible"
            >
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  variants={staggerItem}
                  className="group bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden flex flex-col"
                  whileHover={{ y: -6, boxShadow: '0 16px 40px rgba(0,0,0,0.12)', borderColor: 'rgba(251,191,36,0.5)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {/* Product Image */}
                  <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                    <img
                      src={resolveProductImageUrl(product.image_url, product.name, product.category_name)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const fallback = getProductFallbackImage(product.name, product.category_name);
                        if (e.currentTarget.src !== fallback) {
                          e.currentTarget.src = fallback;
                        }
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-1 rounded-md bg-stone-900/80 backdrop-blur-xs text-[11px] font-semibold text-amber-300">
                        {product.category_name || 'Rambak'}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 text-[11px] font-bold shadow-xs">
                        100% Halal
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-stone-900 text-base leading-snug group-hover:text-amber-700 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-stone-400 block font-medium">Harga Resmi:</span>
                        <span className="text-base font-extrabold font-mono text-stone-900">
                          Rp {product.price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs text-stone-500 font-normal"> /{product.unit}</span>
                      </div>

                      <motion.button
                        onClick={() => handleOrderWhatsApp(product)}
                        className="px-3 py-2 rounded-full bg-[#1C1917] hover:bg-[#A8441A] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors shrink-0"
                        title="Pesan via WhatsApp"
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Pesan</span>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Note info banner */}
        <motion.div
          className="mt-12 p-5 rounded-2xl bg-[#EDE3D6] border border-[#E0D6CA] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#3A2618] text-xs sm:text-sm"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewportOnce}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F4EFE9] flex items-center justify-center shrink-0 border border-[#E0D6CA]">
              <Tag className="w-4 h-4 text-[#A8441A]" />
            </div>
            <span className="font-medium">Menerima pesanan partai besar (grosir), reseller, hajatan nikah, dan pengadaan rumah makan dengan harga khusus!</span>
          </div>
          <motion.button
            onClick={() => {
              const el = document.getElementById('kontak');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-5 py-2.5 rounded-full bg-[#F2A054] hover:bg-[#E88D3A] text-[#2A1405] font-bold text-xs shadow-xs transition-colors shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Hubungi Bagian Penjualan &rarr;
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
