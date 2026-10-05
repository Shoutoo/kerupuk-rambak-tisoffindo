import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import {
  Boxes,
  Plus,
  Edit,
  Trash2,
  ArrowDownCircle,
  SlidersHorizontal,
  Search,
  AlertTriangle,
  CheckCircle,
  Eye,
  ShieldAlert,
  X,
  Package,
} from 'lucide-react';
import { resolveProductImageUrl, getProductFallbackImage } from '../../utils/productImages';

export const ProductsView: React.FC = () => {
  const {
    products,
    categories,
    currentUser,
    addProduct,
    updateProduct,
    deleteProduct,
    addStockMovement,
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'critical' | 'available'>('all');

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState<Product | null>(null);
  const [stockModalType, setStockModalType] = useState<'in' | 'adjustment'>('in');
  const [stockQtyInput, setStockQtyInput] = useState<number | ''>('');
  const [stockNoteInput, setStockNoteInput] = useState('');

  // Form state for add/edit product
  const [formData, setFormData] = useState({
    name: '',
    category_id: categories[0]?.id || '',
    description: '',
    price: 35000,
    unit: 'bungkus' as Product['unit'],
    image_url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
    stock_qty: 20,
    min_stock: 10,
    is_active: true,
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category_id: categories[0]?.id || '',
      description: '',
      price: 35000,
      unit: 'bungkus',
      image_url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80',
      stock_qty: 20,
      min_stock: 10,
      is_active: true,
    });
    setProductModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category_id: product.category_id,
      description: product.description,
      price: product.price,
      unit: product.unit,
      image_url: product.image_url,
      stock_qty: product.stock_qty,
      min_stock: product.min_stock,
      is_active: product.is_active,
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setProductModalOpen(false);
  };

  const openStockModal = (product: Product, type: 'in' | 'adjustment') => {
    setSelectedStockProduct(product);
    setStockModalType(type);
    setStockQtyInput('');
    setStockNoteInput(
      type === 'in'
        ? 'Hasil produksi penggorengan baru'
        : 'Penyesuaian stok opname fisik gudang'
    );
    setStockModalOpen(true);
  };

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockProduct || typeof stockQtyInput !== 'number' || stockQtyInput === 0) return;

    addStockMovement(
      selectedStockProduct.id,
      stockModalType,
      stockQtyInput,
      stockNoteInput.trim() || (stockModalType === 'in' ? 'Stok Masuk' : 'Penyesuaian Stok')
    );

    setStockModalOpen(false);
  };

  // Filter products
  const filtered = products.filter((p) => {
    const matchCat = categoryFilter === 'all' || p.category_id === categoryFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const isCritical = p.stock_qty <= p.min_stock;
    const matchStock =
      stockStatusFilter === 'all' ||
      (stockStatusFilter === 'critical' && isCritical) ||
      (stockStatusFilter === 'available' && !isCritical);
    return matchCat && matchSearch && matchStock;
  });

  return (
    <div className="space-y-6">
      {/* Header with Title & Action */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-serif text-stone-900">Data Produk & Inventaris Stok</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold">
              {products.length} Total Varian
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {isAdmin
              ? 'Kelola katalog produk, pantau level stok, dan catat barang masuk hasil produksi.'
              : 'Mode Petugas: Hanya dapat melihat data dan ketersediaan stok produk (View Only).'}
          </p>
        </div>

        {/* Action button: Admin only per FR-12 */}
        {isAdmin ? (
          <button
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 text-xs font-medium">
            <Eye className="w-4 h-4 text-stone-500" />
            <span>Akses Lihat Stok (Read Only)</span>
          </div>
        )}
      </div>

      {/* Role permission info banner for petugas */}
      {!isAdmin && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Sesuai aturan keamanan peran (PRD FR-17), Petugas hanya memiliki akses melihat kuantitas stok. Perubahan harga, nama produk, dan stok masuk dikelola oleh Admin.
          </span>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white text-stone-700 focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock filter */}
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white text-stone-700 focus:outline-none"
          >
            <option value="all">Semua Status Stok</option>
            <option value="critical">Stok Kritis / Menipis</option>
            <option value="available">Stok Aman</option>
          </select>
        </div>
      </div>

      {/* Products Display: Responsive Cards on Mobile (md:hidden), Full Table on Tablet & Desktop (hidden md:block) */}
      
      {/* Mobile Cards (md:hidden) */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200/90 p-8 text-center text-stone-400">
            Tidak ada produk yang cocok dengan pencarian / filter.
          </div>
        ) : (
          filtered.map((prod) => {
            const isCritical = prod.stock_qty <= prod.min_stock;
            const isZero = prod.stock_qty <= 0;

            return (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={resolveProductImageUrl(prod.image_url, prod.name, prod.category_name)}
                    alt={prod.name}
                    className="w-16 h-16 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-100"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const fallback = getProductFallbackImage(prod.name, prod.category_name);
                      if (e.currentTarget.src !== fallback) {
                        e.currentTarget.src = fallback;
                      }
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-medium">
                        {prod.category_name || 'Rambak'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          prod.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {prod.is_active ? 'Tampil' : 'Nonaktif'}
                      </span>
                    </div>

                    <h4 className="font-bold text-stone-900 text-sm mt-1 leading-snug">
                      {prod.name}
                    </h4>

                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="font-mono font-bold text-stone-900 text-sm">
                        Rp {prod.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[11px] text-stone-400">/{prod.unit}</span>
                    </div>
                  </div>
                </div>

                {/* Stock info strip */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                  <div>
                    <span className="text-stone-500 text-[11px] block">Stok Fisik / Min:</span>
                    <span className="font-bold font-mono text-stone-800">
                      {prod.stock_qty} / {prod.min_stock} {prod.unit}
                    </span>
                  </div>

                  <div>
                    {isZero ? (
                      <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-stone-900 text-white shadow-2xs">
                        Habis
                      </span>
                    ) : isCritical ? (
                      <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1 border border-rose-200 shadow-2xs">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Kritis
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Aman
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile Admin Action Buttons */}
                {isAdmin && (
                  <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openStockModal(prod, 'in')}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[40px]"
                    >
                      <ArrowDownCircle className="w-4 h-4 text-emerald-700" />
                      <span>Stok Masuk</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openStockModal(prod, 'adjustment')}
                      className="p-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                      title="Penyesuaian Stok"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(prod)}
                      className="p-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                      title="Edit Data Produk"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Hapus produk "${prod.name}"?`)) {
                          deleteProduct(prod.id);
                        }
                      }}
                      className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                      title="Hapus Produk"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Desktop / Tablet Table View (hidden md:block) */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Produk</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Harga Jual</th>
                <th className="py-3 px-3">Stok Saat Ini</th>
                <th className="py-3 px-3">Batas Min</th>
                <th className="py-3 px-3 text-center">Status</th>
                {isAdmin && <th className="py-3 px-4 text-right">Aksi Manajemen</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    Tidak ada produk yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const isCritical = prod.stock_qty <= prod.min_stock;
                  const isZero = prod.stock_qty <= 0;

                  return (
                    <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Product details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveProductImageUrl(prod.image_url, prod.name, prod.category_name)}
                            alt={prod.name}
                            className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              const fallback = getProductFallbackImage(prod.name, prod.category_name);
                              if (e.currentTarget.src !== fallback) {
                                e.currentTarget.src = fallback;
                              }
                            }}
                          />
                          <div>
                            <p className="font-bold text-stone-900 leading-snug">{prod.name}</p>
                            <p className="text-[11px] text-stone-400 line-clamp-1">{prod.description}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 text-stone-600">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-[11px] font-medium">
                          {prod.category_name || 'Rambak'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 font-mono font-bold text-stone-900">
                        Rp {prod.price.toLocaleString('id-ID')}
                        <span className="text-[10px] text-stone-400 font-normal"> /{prod.unit}</span>
                      </td>

                      {/* Stock Level with Alert Badge (FR-16) */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-stone-900 text-sm">
                            {prod.stock_qty} {prod.unit}
                          </span>
                          {isZero ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-stone-900 text-white">
                              Habis
                            </span>
                          ) : isCritical ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" />
                              Kritis
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                              Aman
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Min Stock */}
                      <td className="py-3 px-3 text-stone-500 font-mono">
                        {prod.min_stock} {prod.unit}
                      </td>

                      {/* Active status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            prod.is_active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {prod.is_active ? 'Tampil di Web' : 'Disembunyikan'}
                        </span>
                      </td>

                      {/* Admin Actions */}
                      {isAdmin && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Stock in button (FR-13) */}
                            <button
                              onClick={() => openStockModal(prod, 'in')}
                              className="px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 transition-colors"
                              title="Catat Stok Masuk"
                            >
                              <ArrowDownCircle className="w-3.5 h-3.5" />
                              <span>Stok Masuk</span>
                            </button>

                            {/* Stock Adjustment button */}
                            <button
                              onClick={() => openStockModal(prod, 'adjustment')}
                              className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 transition-colors"
                              title="Penyesuaian Stok"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => openEditModal(prod)}
                              className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 transition-colors"
                              title="Edit Data Produk"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Hapus produk "${prod.name}"?`)) {
                                  deleteProduct(prod.id);
                                }
                              }}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600 transition-colors"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Tambah / Edit Produk (FR-12) */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <h3 className="font-bold text-stone-900 text-base font-serif">
                {editingProduct ? 'Ubah Data Produk' : 'Tambah Produk Rambak Baru'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Produk Kerupuk Rambak
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Kerupuk Rambak Sapi Original 250g"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Satuan</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="bungkus">bungkus</option>
                    <option value="pouch">pouch</option>
                    <option value="kg">kg</option>
                    <option value="dus">dus</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Harga Jual (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Stok Saat Ini
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.stock_qty}
                    onChange={(e) => setFormData({ ...formData, stock_qty: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Batas Min Stok
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  URL Foto Produk
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Deskripsi Produk
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Jelaskan cita rasa, kemasan, atau keunggulan produk..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="is_active" className="text-xs font-semibold text-stone-700">
                  Tampilkan produk ini di katalog publik website
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Catat Stok Masuk / Penyesuaian (FR-13 & FR-15) */}
      {stockModalOpen && selectedStockProduct && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div className="flex items-center gap-2 text-stone-900">
                <Package className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm">
                  {stockModalType === 'in' ? 'Catat Stok Masuk' : 'Penyesuaian Stok'}
                </h3>
              </div>
              <button
                onClick={() => setStockModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 mb-4 font-semibold">
              Produk: <span className="text-amber-800">{selectedStockProduct.name}</span>
              <br />
              <span className="text-[11px] font-normal text-stone-500">
                Stok saat ini: {selectedStockProduct.stock_qty} {selectedStockProduct.unit}
              </span>
            </p>

            <form onSubmit={handleSaveStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {stockModalType === 'in' ? 'Jumlah Tambahan (+)' : 'Selisih Penyesuaian (+ / -)'}
                </label>
                <input
                  type="number"
                  required
                  value={stockQtyInput}
                  onChange={(e) => setStockQtyInput(e.target.value ? Number(e.target.value) : '')}
                  placeholder={stockModalType === 'in' ? 'Contoh: 50' : 'Contoh: -2 atau 5'}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Keterangan / Alasan
                </label>
                <input
                  type="text"
                  required
                  value={stockNoteInput}
                  onChange={(e) => setStockNoteInput(e.target.value)}
                  placeholder="Contoh: Produksi batch 22 Sep / Kerusakan display"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStockModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
