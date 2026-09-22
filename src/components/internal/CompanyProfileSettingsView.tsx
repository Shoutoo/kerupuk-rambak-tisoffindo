import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Navigation,
  Star,
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Save,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { GalleryItem, Testimonial } from '../../types';

export const CompanyProfileSettingsView: React.FC = () => {
  const {
    companyProfile,
    updateCompanyProfile,
    gallery,
    addGalleryItem,
    deleteGalleryItem,
    testimonials,
    addTestimonial,
    deleteTestimonial,
    toggleTestimonialFeatured,
    currentUser,
    setCurrentView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'gallery' | 'testimonials'>('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states for Company Profile
  const [profileForm, setProfileForm] = useState({
    business_name: companyProfile?.business_name || '',
    address: companyProfile?.address || '',
    phone: companyProfile?.phone || '',
    operating_hours: companyProfile?.operating_hours || '',
    gmaps_url: companyProfile?.gmaps_url || '',
    gmaps_embed_lat: companyProfile?.gmaps_embed_lat || -7.4620805,
    gmaps_embed_lng: companyProfile?.gmaps_embed_lng || 110.8043561,
    rating: companyProfile?.rating || 5.0,
    review_count: companyProfile?.review_count || 6,
    plus_code: companyProfile?.plus_code || '',
  });

  // Form states for New Gallery Item
  const [showAddGalleryModal, setShowAddGalleryModal] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryCaption, setNewGalleryCaption] = useState('');

  // Form states for New Testimonial Item
  const [showAddTestiModal, setShowAddTestiModal] = useState(false);
  const [newTestiName, setNewTestiName] = useState('');
  const [newTestiContent, setNewTestiContent] = useState('');
  const [newTestiRating, setNewTestiRating] = useState(5);
  const [newTestiSource, setNewTestiSource] = useState('Google Maps');

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyProfile({
      business_name: profileForm.business_name,
      address: profileForm.address,
      phone: profileForm.phone,
      operating_hours: profileForm.operating_hours,
      gmaps_url: profileForm.gmaps_url,
      gmaps_embed_lat: Number(profileForm.gmaps_embed_lat),
      gmaps_embed_lng: Number(profileForm.gmaps_embed_lng),
      rating: Number(profileForm.rating),
      review_count: Number(profileForm.review_count),
      plus_code: profileForm.plus_code,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryUrl.trim()) return;
    addGalleryItem({
      image_url: newGalleryUrl.trim(),
      caption: newGalleryCaption.trim() || undefined,
    });
    setNewGalleryUrl('');
    setNewGalleryCaption('');
    setShowAddGalleryModal(false);
  };

  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestiName.trim() || !newTestiContent.trim()) return;
    addTestimonial({
      customer_name: newTestiName.trim(),
      content: newTestiContent.trim(),
      rating: Number(newTestiRating),
      source: newTestiSource.trim() || 'Google Maps',
      is_featured: true,
    });
    setNewTestiName('');
    setNewTestiContent('');
    setNewTestiRating(5);
    setShowAddTestiModal(false);
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-stone-500">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-stone-900">Akses Terbatas</h3>
        <p className="text-sm">Hanya akun Admin yang dapat mengelola profil usaha publik.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
              Company Profile Real-Time
            </span>
            <span className="text-xs text-stone-500">Tersimpan di tabel company_profile</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mt-1">
            Pengaturan Profil Usaha, Galeri & Testimoni
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
            Ubah data alamat, nomor WhatsApp, jam operasional, foto dokumentasi, dan ulasan Google Maps yang tampil di halaman depan website.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setCurrentView('company_profile')}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors shadow-2xs"
          >
            <Eye className="w-4 h-4 text-amber-600" />
            <span>Lihat Halaman Publik</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-stone-200 gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-white border-t-2 border-amber-600 text-stone-900 border-x border-stone-200 -mb-px'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-600" />
          <span>Profil & Kontak Bisnis</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'gallery'
              ? 'bg-white border-t-2 border-amber-600 text-stone-900 border-x border-stone-200 -mb-px'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-amber-600" />
          <span>Galeri Foto ({gallery?.length || 0})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('testimonials')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'testimonials'
              ? 'bg-white border-t-2 border-amber-600 text-stone-900 border-x border-stone-200 -mb-px'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-amber-600" />
          <span>Ulasan & Testimoni ({testimonials?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: Profile Form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {saveSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 animate-fade-in">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Data profil usaha berhasil diperbarui dan langsung tampil di halaman publik!</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card: Business Identity & Contact */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
                <Building2 className="w-4 h-4 text-amber-600" />
                <span>Identitas & Kontak Utama</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Usaha
                </label>
                <input
                  type="text"
                  value={profileForm.business_name}
                  onChange={(e) => setProfileForm({ ...profileForm, business_name: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                  placeholder="Pabrik Krupuk (Kerupuk Rambak Tisoffindo)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Alamat Lengkap Pabrik / Toko
                </label>
                <textarea
                  rows={3}
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                  placeholder="Kliwonan, RT.01/RW.07, Kliwonan, Jeron, Kec. Nogosari, Kabupaten Boyolali, Jawa Tengah 57378"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    No. WhatsApp / Telepon
                  </label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                    placeholder="0857-2811-1147"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Jam Operasional
                  </label>
                  <input
                    type="text"
                    value={profileForm.operating_hours}
                    onChange={(e) => setProfileForm({ ...profileForm, operating_hours: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                    placeholder="Buka 24 jam"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Plus Code Google Maps
                </label>
                <input
                  type="text"
                  value={profileForm.plus_code}
                  onChange={(e) => setProfileForm({ ...profileForm, plus_code: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                  placeholder="GRQ3+5P Jeron, Kabupaten Boyolali"
                />
              </div>
            </div>

            {/* Right Card: Google Maps Coordinates & Ratings */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Integrasi Google Maps & Rating</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Link Google Maps Asli (Share URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={profileForm.gmaps_url}
                    onChange={(e) => setProfileForm({ ...profileForm, gmaps_url: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                    placeholder="https://maps.app.goo.gl/G8kHXoGYuuycJxxy7"
                  />
                  <a
                    href={profileForm.gmaps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center shrink-0"
                    title="Uji Buka Google Maps"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Latitude Koordinat
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={profileForm.gmaps_embed_lat}
                    onChange={(e) => setProfileForm({ ...profileForm, gmaps_embed_lat: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                    placeholder="-7.4620805"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Longitude Koordinat
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={profileForm.gmaps_embed_lng}
                    onChange={(e) => setProfileForm({ ...profileForm, gmaps_embed_lng: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                    placeholder="110.8043561"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Rating Google (Bintang)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={profileForm.rating}
                    onChange={(e) => setProfileForm({ ...profileForm, rating: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                    placeholder="5.0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Jumlah Ulasan Google
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={profileForm.review_count}
                    onChange={(e) => setProfileForm({ ...profileForm, review_count: Number(e.target.value) })}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                    placeholder="6"
                  />
                </div>
              </div>

              {/* Map Preview Snippet */}
              <div className="pt-2">
                <p className="text-xs font-semibold text-stone-700 mb-2">Live Preview Embed Peta:</p>
                <div className="aspect-16/9 rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                  <iframe
                    src={`https://www.google.com/maps?q=${profileForm.gmaps_embed_lat},${profileForm.gmaps_embed_lng}&z=17&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    title="Live Preview Google Maps"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-all hover:scale-102"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Profil Usaha</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Gallery Management */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Koleksi Foto Pabrik, Penjemuran & Penggorengan</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Foto-foto ini langsung tampil di Galeri Dokumentasi sisi publik.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddGalleryModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Foto Galeri</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-4/3 bg-stone-100 overflow-hidden relative group">
                    <img
                      src={item.image_url}
                      alt={item.caption || 'Foto Galeri'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-xs sm:text-sm font-medium text-stone-800 line-clamp-2">
                      {item.caption || '(Tanpa keterangan)'}
                    </p>
                    <p className="text-[11px] text-stone-400 mt-1">
                      Ditambahkan: {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-stone-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Yakin ingin menghapus foto ini dari galeri?')) {
                        deleteGalleryItem(item.id);
                      }
                    }}
                    className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Gallery Modal */}
          {showAddGalleryModal && (
            <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
                <h3 className="text-lg font-bold text-stone-900">Tambah Foto ke Galeri</h3>
                <form onSubmit={handleAddGallery} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      URL Gambar (Link Gambar Online / Supabase Storage)
                    </label>
                    <input
                      type="url"
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                      required
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Keterangan / Caption Foto
                    </label>
                    <input
                      type="text"
                      value={newGalleryCaption}
                      onChange={(e) => setNewGalleryCaption(e.target.value)}
                      placeholder="Contoh: Proses penjemuran krecek kulit sapi segar di Jeron Boyolali"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                    />
                  </div>

                  {newGalleryUrl && (
                    <div>
                      <p className="text-xs text-stone-500 mb-1 font-semibold">Preview Foto:</p>
                      <div className="aspect-16/9 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                        <img
                          src={newGalleryUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddGalleryModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                    >
                      Simpan Foto
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Testimonials Management */}
      {activeTab === 'testimonials' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Daftar Testimoni & Ulasan Pelanggan</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Ulasan asli Google Maps dan pelanggan tetap yang ditampilkan di halaman beranda.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddTestiModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Ulasan Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 border border-stone-200">
                      {t.source || 'Google Maps'}
                    </span>
                  </div>

                  <p className="text-stone-700 text-sm italic leading-relaxed mb-4">
                    "{t.content}"
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-stone-900 text-xs sm:text-sm">{t.customer_name}</h5>
                    <p className="text-[11px] text-stone-400">
                      {new Date(t.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleTestimonialFeatured(t.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        t.is_featured
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      {t.is_featured ? 'Unggulan' : 'Standar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Hapus ulasan ini?')) {
                          deleteTestimonial(t.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                      title="Hapus Testimoni"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Testimonial Modal */}
          {showAddTestiModal && (
            <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
                <h3 className="text-lg font-bold text-stone-900">Tambah Ulasan / Testimoni</h3>
                <form onSubmit={handleAddTestimonial} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Nama Pelanggan / Pengulas
                    </label>
                    <input
                      type="text"
                      value={newTestiName}
                      onChange={(e) => setNewTestiName(e.target.value)}
                      required
                      placeholder="Contoh: Pembeli Google Maps Boyolali"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Isi Komentar / Ulasan
                    </label>
                    <textarea
                      rows={3}
                      value={newTestiContent}
                      onChange={(e) => setNewTestiContent(e.target.value)}
                      required
                      placeholder="Contoh: Kerupuk renyah gurih, tidak serik, sangat recommended!"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Rating Bintang (1 - 5)
                      </label>
                      <select
                        value={newTestiRating}
                        onChange={(e) => setNewTestiRating(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                      >
                        <option value={5}>5 Bintang (Sangat Puas)</option>
                        <option value={4}>4 Bintang (Puas)</option>
                        <option value={3}>3 Bintang (Cukup)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">
                        Sumber Ulasan
                      </label>
                      <input
                        type="text"
                        value={newTestiSource}
                        onChange={(e) => setNewTestiSource(e.target.value)}
                        placeholder="Google Maps / WhatsApp"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddTestiModal(false)}
                      className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
                    >
                      Simpan Ulasan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
