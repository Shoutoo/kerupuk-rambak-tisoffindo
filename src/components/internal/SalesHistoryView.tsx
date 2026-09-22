import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sale } from '../../types';
import {
  Receipt,
  Search,
  Printer,
  XCircle,
  Eye,
  Calendar,
  AlertTriangle,
  User,
  ShieldCheck,
  CheckCircle,
  FileText,
  X,
} from 'lucide-react';

export const SalesHistoryView: React.FC = () => {
  const { sales, currentUser, cancelSale, setActiveReceipt } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<Sale | null>(null);

  // Void/Cancel modal state
  const [cancelModalSale, setCancelModalSale] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Role visibility: Admin sees all, Petugas only sees their own transactions (FR-22 & FR-23)
  const accessibleSales = isAdmin
    ? sales
    : sales.filter((s) => s.created_by_id === currentUser?.id);

  const filteredSales = accessibleSales.filter((sale) => {
    const matchStatus = statusFilter === 'all' || sale.status === statusFilter;
    const matchSearch =
      sale.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
      (sale.customer_name && sale.customer_name.toLowerCase().includes(search.toLowerCase())) ||
      sale.created_by_name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalSale || !cancelReason.trim()) return;

    cancelSale(cancelModalSale.id, cancelReason.trim());
    setCancelModalSale(null);
    setCancelReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-serif text-stone-900">Daftar Transaksi Penjualan</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-semibold">
              {accessibleSales.length} Total Faktur
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {isAdmin
              ? 'Seluruh riwayat transaksi toko. Admin memiliki wewenang mencetak ulang dan membatalkan faktur (void).'
              : 'Menampilkan riwayat transaksi yang Anda input saat bertugas di kasir.'}
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'completed' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Selesai
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              statusFilter === 'cancelled' ? 'bg-white text-rose-800 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Dibatalkan
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari no. faktur, nama pembeli, kasir..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Transactions List: Mobile Cards (md:hidden) & Desktop Table (hidden md:block) */}

      {/* Mobile Card List */}
      <div className="md:hidden space-y-3">
        {filteredSales.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200/90 p-8 text-center text-stone-400">
            Tidak ada transaksi yang cocok dengan kriteria filter.
          </div>
        ) : (
          filteredSales.map((sale) => {
            const formattedTime = new Date(sale.created_at).toLocaleString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={sale.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                  <div>
                    <span className="font-mono font-bold text-stone-900 text-sm block">
                      {sale.invoice_no}
                    </span>
                    <span className="text-[11px] text-stone-400 font-mono">
                      {formattedTime}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      sale.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {sale.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-stone-400 block">Pelanggan:</span>
                    <span className="font-semibold text-stone-800 truncate block">
                      {sale.customer_name || 'Pelanggan Umum'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] text-stone-400 block">Kasir / Petugas:</span>
                    <span className="font-medium text-stone-700 truncate block">
                      {sale.created_by_name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/70">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-semibold block">
                      {sale.payment_method} &bull; {sale.items.reduce((acc, i) => acc + i.quantity, 0)} bks
                    </span>
                    <span className="font-mono font-bold text-stone-900 text-base">
                      Rp {sale.total_amount.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Struk / Cetak Ulang */}
                    <button
                      type="button"
                      onClick={() => setActiveReceipt(sale)}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center gap-1 border border-amber-200 min-h-[36px]"
                      title="Cetak Struk"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-700" />
                      <span>Struk</span>
                    </button>

                    {/* Detail Modal */}
                    <button
                      type="button"
                      onClick={() => setSelectedSaleDetail(sale)}
                      className="p-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="Lihat Detail"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Cancel Sale: Admin Only */}
                    {isAdmin && sale.status === 'completed' && (
                      <button
                        type="button"
                        onClick={() => {
                          setCancelModalSale(sale);
                          setCancelReason('');
                        }}
                        className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Batalkan (Void)"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
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
                <th className="py-3 px-4">No. Faktur</th>
                <th className="py-3 px-3">Waktu Transaksi</th>
                <th className="py-3 px-3">Pelanggan</th>
                <th className="py-3 px-3">Kasir / Petugas</th>
                <th className="py-3 px-3">Metode Bayar</th>
                <th className="py-3 px-3 text-right">Total Transaksi</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">
                    Tidak ada transaksi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const formattedTime = new Date(sale.created_at).toLocaleString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={sale.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-stone-900">
                        {sale.invoice_no}
                      </td>
                      <td className="py-3 px-3 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                        {formattedTime}
                      </td>
                      <td className="py-3 px-3 text-stone-800 font-medium">
                        {sale.customer_name || 'Pelanggan Umum'}
                      </td>
                      <td className="py-3 px-3 text-stone-600">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-stone-400" />
                          <span>{sale.created_by_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-medium">
                          {sale.payment_method}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-stone-900 text-sm">
                        Rp {sale.total_amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            sale.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {sale.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Struk / Cetak Ulang (FR-24) */}
                          <button
                            onClick={() => setActiveReceipt(sale)}
                            className="p-1.5 rounded-md hover:bg-stone-100 text-stone-700 transition-colors"
                            title="Buka / Cetak Struk Transaksi"
                          >
                            <Printer className="w-3.5 h-3.5 text-amber-700" />
                          </button>

                          {/* Detail Modal */}
                          <button
                            onClick={() => setSelectedSaleDetail(sale)}
                            className="p-1.5 rounded-md hover:bg-stone-100 text-stone-600 transition-colors"
                            title="Lihat Rincian Item"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Cancel Sale: Admin Only (FR-23) */}
                          {isAdmin && sale.status === 'completed' && (
                            <button
                              onClick={() => {
                                setCancelModalSale(sale);
                                setCancelReason('');
                              }}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600 transition-colors"
                              title="Batalkan Transaksi (Void & Kembalikan Stok)"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
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

      {/* Modal Detail Item Transaksi */}
      {selectedSaleDetail && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">
                  Rincian Transaksi {selectedSaleDetail.invoice_no}
                </h3>
                <p className="text-[11px] text-stone-500">
                  {new Date(selectedSaleDetail.created_at).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => setSelectedSaleDetail(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              {selectedSaleDetail.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-stone-900">{item.product_name}</p>
                    <p className="text-[11px] text-stone-500">
                      {item.quantity} {item.unit} x Rp {item.price.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-stone-900">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>

            {selectedSaleDetail.status === 'cancelled' && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                <p className="font-bold">Transaksi Ini Dibatalkan</p>
                <p className="text-[11px] mt-0.5">Alasan: {selectedSaleDetail.cancellation_reason}</p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-600">Total Transaksi:</span>
              <span className="font-serif font-extrabold text-stone-900 text-base">
                Rp {selectedSaleDetail.total_amount.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setActiveReceipt(selectedSaleDetail);
                  setSelectedSaleDetail(null);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Buka Struk Cetak</span>
              </button>
              <button
                onClick={() => setSelectedSaleDetail(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-semibold text-xs hover:bg-stone-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pembatalan Transaksi (Void) - Admin Only per FR-23 */}
      {cancelModalSale && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-stone-900 text-base">Batalkan Transaksi?</h3>
            </div>
            <p className="text-xs text-stone-600 mb-3 leading-relaxed">
              Faktur <strong className="text-stone-900">{cancelModalSale.invoice_no}</strong> senilai{' '}
              <strong className="text-stone-900">
                Rp {cancelModalSale.total_amount.toLocaleString('id-ID')}
              </strong>{' '}
              akan dibatalkan. Kuantitas barang akan otomatis dikembalikan ke stok gudang.
            </p>

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Alasan Pembatalan
                </label>
                <textarea
                  required
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Contoh: Pelanggan salah pilih produk / Transaksi ganda"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalSale(null)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Konfirmasi Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
