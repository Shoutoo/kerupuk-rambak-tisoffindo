import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  SlidersHorizontal,
  Calendar,
  User,
  Filter,
  Search,
} from 'lucide-react';

export const StockMovementView: React.FC = () => {
  const { stockMovements } = useApp();
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filteredMovements = stockMovements.filter((m) => {
    const matchType = filterType === 'all' || m.type === filterType;
    const matchSearch =
      m.product_name.toLowerCase().includes(search.toLowerCase()) ||
      m.note.toLowerCase().includes(search.toLowerCase()) ||
      m.created_by_name.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-serif text-stone-900">Riwayat Mutasi Stok</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold">
              {stockMovements.length} Log Mutasi
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Catatan audit otomatis untuk setiap penambahan barang produksi, pengurangan kasir penjualan, dan penyesuaian fisik.
          </p>
        </div>

        {/* Quick Type Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterType('in')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'in' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Masuk (+)
          </button>
          <button
            onClick={() => setFilterType('out')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'out' ? 'bg-white text-amber-800 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Keluar (-)
          </button>
          <button
            onClick={() => setFilterType('adjustment')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'adjustment' ? 'bg-white text-blue-800 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Penyesuaian
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari produk, catatan, atau petugas..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Stock Movements Display: Mobile Cards (md:hidden) & Desktop Table (hidden md:block) */}

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {filteredMovements.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200/90 p-8 text-center text-stone-400">
            Tidak ada catatan mutasi stok yang cocok.
          </div>
        ) : (
          filteredMovements.map((item) => {
            const isPositive = item.quantity > 0;
            const formattedDate = new Date(item.created_at).toLocaleString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm leading-snug">
                      {item.product_name}
                    </h4>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {formattedDate} WIB
                    </span>
                  </div>

                  {item.type === 'in' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                      <ArrowDownLeft className="w-3 h-3" />
                      Masuk
                    </span>
                  ) : item.type === 'out' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 shrink-0">
                      <ArrowUpRight className="w-3 h-3" />
                      Keluar
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                      <SlidersHorizontal className="w-3 h-3" />
                      Penyesuaian
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs">
                  <div>
                    <span className="text-[11px] text-stone-500 block">Keterangan:</span>
                    <span className="font-medium text-stone-700">{item.note}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-stone-500 block">Jumlah:</span>
                    <span
                      className={`font-mono font-bold text-base ${
                        item.type === 'in' || (item.type === 'adjustment' && isPositive)
                          ? 'text-emerald-700'
                          : 'text-amber-800'
                      }`}
                    >
                      {item.type === 'in'
                        ? `+${item.quantity}`
                        : item.type === 'out'
                        ? `-${item.quantity}`
                        : `${item.quantity > 0 ? '+' : ''}${item.quantity}`}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 flex items-center gap-1.5 pt-1">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span>Dicatat oleh: <strong className="text-stone-700">{item.created_by_name}</strong></span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop / Tablet Table (hidden md:block) */}
      <div className="hidden md:block bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Waktu & Tanggal</th>
                <th className="py-3 px-3">Tipe Mutasi</th>
                <th className="py-3 px-3">Nama Produk</th>
                <th className="py-3 px-3 text-right">Jumlah</th>
                <th className="py-3 px-3">Keterangan / Catatan</th>
                <th className="py-3 px-4">Petugas / User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    Tidak ada catatan mutasi stok yang cocok.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((item) => {
                  const isPositive = item.quantity > 0;
                  const formattedDate = new Date(item.created_at).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 text-stone-500 whitespace-nowrap font-mono text-[11px]">
                        {formattedDate} WIB
                      </td>

                      {/* Movement Type */}
                      <td className="py-3 px-3">
                        {item.type === 'in' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <ArrowDownLeft className="w-3 h-3" />
                            Stok Masuk
                          </span>
                        ) : item.type === 'out' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                            <ArrowUpRight className="w-3 h-3" />
                            Keluar (Jual)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            <SlidersHorizontal className="w-3 h-3" />
                            Penyesuaian
                          </span>
                        )}
                      </td>

                      {/* Product */}
                      <td className="py-3 px-3 font-semibold text-stone-900">{item.product_name}</td>

                      {/* Quantity */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-sm">
                        <span
                          className={
                            item.type === 'in' || (item.type === 'adjustment' && isPositive)
                              ? 'text-emerald-700'
                              : 'text-amber-800'
                          }
                        >
                          {item.type === 'in' ? `+${item.quantity}` : item.type === 'out' ? `-${item.quantity}` : `${item.quantity > 0 ? '+' : ''}${item.quantity}`}
                        </span>
                      </td>

                      {/* Note */}
                      <td className="py-3 px-3 text-stone-600 max-w-xs">{item.note}</td>

                      {/* Created By User */}
                      <td className="py-3 px-4 text-stone-700 font-medium">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          <span>{item.created_by_name}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
