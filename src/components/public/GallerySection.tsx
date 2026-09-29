import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Camera, Star, ExternalLink, Quote, X, Maximize2, ShieldCheck } from 'lucide-react';
import { GalleryItem, Testimonial } from '../../types';
import { APP_ASSETS } from '../../assets/images';

export const GallerySection: React.FC = () => {
  const { gallery, testimonials, companyProfile } = useApp();
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  const displayGallery = gallery && gallery.length > 0 ? gallery : [];
  const displayTestimonials = testimonials && testimonials.length > 0 ? testimonials : [];

  return (
    <section id="galeri" className="py-16 sm:py-20 bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold tracking-wide uppercase mb-3">
            <Camera className="w-3.5 h-3.5 text-amber-700" />
            <span>Dokumentasi & Ulasan Nyata</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-stone-900 tracking-tight">
            Dari Sentra Produksi Boyolali ke Meja Makan Anda
          </h2>
          <p className="mt-3 text-stone-600 text-sm sm:text-base leading-relaxed">
            Melihat lebih dekat proses ketelitian, bahan kulit sapi pilihan, dan kehigienisan pembuatan kerupuk rambak Tisoffindo.
          </p>
        </div>

        {/* Dynamic Gallery Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-16">
          {displayGallery.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="group relative rounded-2xl overflow-hidden aspect-4/3 bg-stone-200 shadow-sm border border-stone-200 cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
            >
              <img
                src={item.image_url || APP_ASSETS.rambakPack}
                alt={item.caption || 'Foto Galeri Pabrik Kerupuk Rambak Tisoffindo'}
                className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (e.currentTarget.src !== APP_ASSETS.rambakPack) {
                    e.currentTarget.src = APP_ASSETS.rambakPack;
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-900/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 sm:p-5">
                <div className="flex items-center justify-between text-amber-300 mb-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">Tisoffindo Gallery</span>
                  <Maximize2 className="w-3.5 h-3.5 text-white/80 group-hover:text-amber-300 transition-colors" />
                </div>
                <p className="text-white text-xs sm:text-sm font-medium line-clamp-2 leading-snug">
                  {item.caption || 'Sentra produksi kerupuk rambak berkualitas tinggi'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Photo Lightbox Modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="relative max-w-3xl w-full bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-stone-700"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-stone-950/70 hover:bg-stone-950 text-white flex items-center justify-center transition-colors"
                title="Tutup Preview"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-h-[70vh] bg-black flex items-center justify-center overflow-hidden">
                <img
                  src={selectedPhoto.image_url || APP_ASSETS.rambakPack}
                  alt={selectedPhoto.caption}
                  className="w-full h-full max-h-[70vh] object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (e.currentTarget.src !== APP_ASSETS.rambakPack) {
                      e.currentTarget.src = APP_ASSETS.rambakPack;
                    }
                  }}
                />
              </div>

              {selectedPhoto.caption && (
                <div className="p-4 sm:p-5 bg-stone-900 text-stone-200 border-t border-stone-800">
                  <p className="text-sm font-medium text-white">{selectedPhoto.caption}</p>
                  <p className="text-xs text-stone-400 mt-1">Pabrik Krupuk (Kerupuk Rambak Tisoffindo) • Jeron, Nogosari, Boyolali</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Testimonials Section */}
        <div className="pt-8 border-t border-stone-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full mb-2">
                <Star className="w-3.5 h-3.5 fill-current text-amber-600" />
                <span>Google Maps Review (Rating {companyProfile?.rating ? Number(companyProfile.rating).toFixed(1).replace('.', ',') : '5,0'} / 5.0)</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
                Ulasan Jujur Pelanggan & Pengunjung
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Diambil langsung dari ulasan pembeli di Google Maps Pabrik Kerupuk Rambak Tisoffindo Boyolali.
              </p>
            </div>

            <a
              href={companyProfile?.gmaps_url || 'https://maps.app.goo.gl/G8kHXoGYuuycJxxy7'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-sm transition-all shrink-0 self-start sm:self-end"
            >
              <span>Lihat Semua di Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayTestimonials.map((t) => (
              <div
                key={t.id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                      {t.source || 'Google Maps'}
                    </span>
                  </div>

                  <p className="text-stone-700 text-xs sm:text-sm italic leading-relaxed">
                    "{t.content}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-stone-900 text-xs sm:text-sm">{t.customer_name}</p>
                    <p className="text-[11px] text-stone-400">Pembeli Terverifikasi</p>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

