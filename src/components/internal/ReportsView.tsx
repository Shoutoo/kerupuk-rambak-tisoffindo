import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  CircleDollarSign,
  Package,
  User,
  Filter,
  ArrowUpRight,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { sales, products, users, currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  // Filters
  const [period, setPeriod] = useState<'today' | '7days' | 'month' | 'all'>('month');
  const [selectedPetugas, setSelectedPetugas] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');

  // Today reference: 2026-09-22
  const todayStr = '2026-09-22';
  const monthStr = '2026-09';

  // Base sales filtered by role permission
  const baseSales = isAdmin ? sales : sales.filter((s) => s.created_by_id === currentUser?.id);

  // Apply period and entity filters
  const completedSales = baseSales.filter((s) => s.status === 'completed');

  const filteredSales = completedSales.filter((s) => {
    // Period filter
    let matchPeriod = true;
    if (period === 'today') {
      matchPeriod = s.created_at.startsWith(todayStr);
    } else if (period === '7days') {
      matchPeriod = s.created_at >= '2026-09-15';
    } else if (period === 'month') {
      matchPeriod = s.created_at.startsWith(monthStr);
    }

    // Petugas filter (Admin only)
    const matchPetugas =
      !isAdmin || selectedPetugas === 'all' || s.created_by_id === selectedPetugas;

    // Product filter
    const matchProduct =
      selectedProduct === 'all' || s.items.some((item) => item.product_id === selectedProduct);

    return matchPeriod && matchPetugas && matchProduct;
  });

  // Aggregated metrics
  const totalOmzet = filteredSales.reduce((acc, s) => acc + s.total_amount, 0);
  const totalTransaksi = filteredSales.length;
  const avgTransaksi = totalTransaksi > 0 ? Math.round(totalOmzet / totalTransaksi) : 0;

  // Breakdown by Product
  const productSummary: {
    [id: string]: { name: string; quantity: number; revenue: number; unit: string };
  } = {};

  filteredSales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (selectedProduct !== 'all' && item.product_id !== selectedProduct) return;
      if (!productSummary[item.product_id]) {
        productSummary[item.product_id] = {
          name: item.product_name,
          quantity: 0,
          revenue: 0,
          unit: item.unit,
        };
      }
      productSummary[item.product_id].quantity += item.quantity;
      productSummary[item.product_id].revenue += item.subtotal;
    });
  });

  const productBreakdownList = Object.values(productSummary).sort((a, b) => b.revenue - a.revenue);

  // Payment method breakdown
  const paymentBreakdown = filteredSales.reduce(
    (acc, curr) => {
      acc[curr.payment_method] = (acc[curr.payment_method] || 0) + curr.total_amount;
      return acc;
    },
    {} as { [method: string]: number }
  );

  // CSV Export Handler (FR-28)
  const handleExportCSV = () => {
    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += 'No Faktur,Tanggal,Petugas,Pelanggan,Metode Bayar,Total (Rp)\n';

    filteredSales.forEach((s) => {
      const date = new Date(s.created_at).toLocaleDateString('id-ID');
      const invoice = `"${s.invoice_no}"`;
      const petugas = `"${s.created_by_name}"`;
      const pelanggan = `"${s.customer_name || 'Pelanggan Umum'}"`;
      const bayar = `"${s.payment_method}"`;
      const total = s.total_amount;
      csvContent += `${invoice},${date},${petugas},${pelanggan},${bayar},${total}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Rekap_Penjualan_Tisoffindo_${period}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-serif text-stone-900">
              {isAdmin ? 'Laporan & Rekap Penjualan Bisnis' : 'Rekap Penjualan Pribadi'}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold">
              {isAdmin ? 'Akses Admin Lengkap' : 'Akses Kasir'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            {isAdmin
              ? 'Analisis omzet, filter rentang tanggal, evaluasi produk terlaris, dan ekspor laporan ke Excel/CSV.'
              : 'Ringkasan performa penjualan yang berhasil Anda catat pada periode terpilih.'}
          </p>
        </div>

        {/* Action Buttons: Export & Print */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isAdmin && (
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors shrink-0 min-h-[40px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor Excel</span>
            </button>
          )}

          <button
            onClick={handlePrintReport}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors shrink-0 min-h-[40px]"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Filter Bar (FR-26) */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl overflow-x-auto scrollbar-none">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[36px] ${
              period === 'today' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setPeriod('7days')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[36px] ${
              period === '7days' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[36px] ${
              period === 'month' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[36px] ${
              period === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Semua
          </button>
        </div>

        {/* Multi-Entity Filters (Admin Only) */}
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Petugas */}
            <select
              value={selectedPetugas}
              onChange={(e) => setSelectedPetugas(e.target.value)}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white text-stone-700 focus:outline-none min-h-[36px]"
            >
              <option value="all">Semua Petugas / Kasir</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.role})
                </option>
              ))}
            </select>

            {/* Filter Produk */}
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs bg-white text-stone-700 focus:outline-none"
            >
              <option value="all">Semua Produk</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Total Omzet Penjualan</span>
            <CircleDollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-stone-900 mt-2">
            Rp {totalOmzet.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">Status transaksi completed</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Jumlah Transaksi</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-stone-900 mt-2">
            {totalTransaksi} <span className="text-sm font-normal text-stone-500">faktur</span>
          </p>
          <p className="text-[11px] text-stone-400 mt-1">Berhasil dilayani di kasir</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Nilai Rata-rata per Transaksi</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-stone-900 mt-2">
            Rp {avgTransaksi.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">Basket size belanja pembeli</p>
        </div>
      </div>

      {/* Product Breakdown Table (FR-27) */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Rekap Penjualan per Varian Produk</h3>
            <p className="text-xs text-stone-500">Rincian kuantitas terjual dan kontribusi nominal omzet</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Nama Produk</th>
                <th className="py-2.5 px-3 text-right">Kuantitas Terjual</th>
                <th className="py-2.5 px-3 text-right">Total Pendapatan</th>
                <th className="py-2.5 px-3 text-right">Kontribusi Omzet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {productBreakdownList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-stone-400">
                    Tidak ada item terjual pada filter periode ini.
                  </td>
                </tr>
              ) : (
                productBreakdownList.map((item, idx) => {
                  const contribution =
                    totalOmzet > 0 ? Math.round((item.revenue / totalOmzet) * 100) : 0;

                  return (
                    <tr key={idx} className="hover:bg-stone-50/70">
                      <td className="py-3 px-3 font-semibold text-stone-900">{item.name}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-stone-800">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-stone-900">
                        Rp {item.revenue.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-semibold text-amber-800">{contribution}%</span>
                          <div className="w-16 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              style={{ width: `${contribution}%` }}
                              className="bg-amber-600 h-full rounded-full"
                            />
                          </div>
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

      {/* Payment Method Breakdown */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs">
        <h3 className="font-bold text-stone-900 text-sm mb-3">Distribusi Metode Pembayaran</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(paymentBreakdown).map(([method, amount]) => (
            <div key={method} className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
              <p className="text-xs font-semibold text-stone-600">{method}</p>
              <p className="text-base font-bold font-serif text-stone-900 mt-1">
                Rp {amount.toLocaleString('id-ID')}
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {totalOmzet > 0 ? Math.round((amount / totalOmzet) * 100) : 0}% dari total omzet
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
