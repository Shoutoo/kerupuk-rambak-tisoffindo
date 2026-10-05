import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  CircleDollarSign,
  ShoppingCart,
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  PackageCheck,
  Calendar,
  UserCheck,
  ShieldCheck,
  PlusCircle,
  Receipt,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { currentUser, sales, products, criticalStockProducts, setCurrentView } = useApp();

  if (!currentUser) return null;
  const isAdmin = currentUser.role === 'admin';

  // Current Date helpers (dynamic)
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const currentMonthStr = now.toISOString().slice(0, 7);

  // Filter sales based on user role
  const relevantSales = isAdmin ? sales : sales.filter((s) => s.created_by_id === currentUser.id);

  // Sales today
  const todaySales = relevantSales.filter(
    (s) => s.status === 'completed' && s.created_at.startsWith(todayStr)
  );
  const totalOmzetToday = todaySales.reduce((acc, curr) => acc + curr.total_amount, 0);

  // Sales this month
  const monthSales = relevantSales.filter(
    (s) => s.status === 'completed' && s.created_at.startsWith(currentMonthStr)
  );
  const totalOmzetMonth = monthSales.reduce((acc, curr) => acc + curr.total_amount, 0);

  // Calculate items sold today
  const totalItemsSoldToday = todaySales.reduce(
    (acc, curr) => acc + curr.items.reduce((iAcc, item) => iAcc + item.quantity, 0),
    0
  );

  // Top selling products computation
  const productSalesMap: { [prodId: string]: { name: string; qty: number; revenue: number } } = {};
  relevantSales
    .filter((s) => s.status === 'completed')
    .forEach((s) => {
      s.items.forEach((item) => {
        if (!productSalesMap[item.product_id]) {
          productSalesMap[item.product_id] = { name: item.product_name, qty: 0, revenue: 0 };
        }
        productSalesMap[item.product_id].qty += item.quantity;
        productSalesMap[item.product_id].revenue += item.subtotal;
      });
    });

  const topSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Last 7 days trend bar - dynamic from actual sales data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const dayRevenue = relevantSales
      .filter((s) => s.status === 'completed' && s.created_at.startsWith(dateStr))
      .reduce((acc, s) => acc + s.total_amount, 0);
    return {
      date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      day: d.toLocaleDateString('id-ID', { weekday: 'short' }).slice(0, 3),
      revenue: dayRevenue,
    };
  });
  const maxRevenue = Math.max(...last7Days.map((d) => d.revenue));

  return (
    <div className="space-y-6">
      {/* Top Banner with Greeting & Role Badge */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 capitalize flex items-center gap-1">
              {isAdmin ? <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> : <UserCheck className="w-3.5 h-3.5 text-stone-700" />}
              Peran: {currentUser.role}
            </span>
            <span className="text-xs text-stone-400">|</span>
            <span className="text-xs text-stone-500 font-medium">{now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
            Selamat Datang, {currentUser.full_name}!
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {isAdmin
              ? 'Pantau pergerakan omzet, stok kritis, dan aktivitas kasir toko Tisoffindo secara real-time.'
              : 'Siap melayani transaksi kasir dan pencatatan penjualan kerupuk rambak hari ini.'}
          </p>
        </div>

        {/* Quick Launch Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentView('pos')}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Buka Kasir / POS Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omzet Hari Ini */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">
              {isAdmin ? 'Omzet Hari Ini' : 'Penjualan Saya Hari Ini'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CircleDollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 font-serif mt-2">
            Rp {totalOmzetToday.toLocaleString('id-ID')}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{todaySales.length} transaksi selesai hari ini</span>
          </div>
        </div>

        {/* Total Omzet Bulan Berjalan */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">
              {isAdmin ? 'Omzet Bulan Berjalan (Sep)' : 'Penjualan Saya Bulan Ini'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 font-serif mt-2">
            Rp {totalOmzetMonth.toLocaleString('id-ID')}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-stone-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Total {monthSales.length} transaksi tercatat</span>
          </div>
        </div>

        {/* Item Terjual Hari Ini */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Item Terjual Hari Ini</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 font-serif mt-2">
            {totalItemsSoldToday} <span className="text-sm font-normal text-stone-500">bungkus/unit</span>
          </p>
          <div className="mt-2 text-[11px] text-stone-500">
            Dikeluarkan otomatis dari stok gudang
          </div>
        </div>

        {/* Stok Kritis Alert */}
        <div
          onClick={() => setCurrentView('products')}
          className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500">Status Stok Produk</span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                criticalStockProducts.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 font-serif mt-2">
            {criticalStockProducts.length}{' '}
            <span className="text-sm font-normal text-rose-600">
              {criticalStockProducts.length > 0 ? 'Perlu Restok' : 'Aman'}
            </span>
          </p>
          <div className="mt-2 text-[11px] text-amber-700 font-medium flex items-center gap-1">
            <span>Buka inventaris &rarr;</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Sales Trend Chart & Top Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Bar Visualizer */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Tren Penjualan 7 Hari Terakhir</h3>
              <p className="text-xs text-stone-500">Pergerakan total nominal transaksi per hari</p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 font-semibold">
              Rata-rata: Rp 450.000 / hr
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="h-52 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
            {last7Days.map((item, index) => {
              const heightPercent = Math.max(15, Math.round((item.revenue / maxRevenue) * 100));
              const isToday = index === last7Days.length - 1;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-semibold text-stone-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Rp {(item.revenue / 1000).toFixed(0)}k
                  </span>
                  <div className="w-full max-w-[36px] bg-stone-100 rounded-t-lg h-36 flex items-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isToday
                          ? 'bg-amber-500 group-hover:bg-amber-600'
                          : 'bg-stone-700 group-hover:bg-amber-400'
                      }`}
                    />
                  </div>
                  <div className="text-center">
                    <p className={`text-xs font-semibold ${isToday ? 'text-amber-700 font-bold' : 'text-stone-700'}`}>
                      {item.day}
                    </p>
                    <p className="text-[10px] text-stone-400">{item.date.split(' ')[0]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-sm">Produk Terlaris (Top Selling)</h3>
                <p className="text-xs text-stone-500">Paling banyak dibeli pelanggan</p>
              </div>
            </div>

            <div className="space-y-3 mt-3">
              {topSellingProducts.length === 0 ? (
                <p className="text-xs text-stone-400 py-6 text-center">Belum ada data penjualan tercatat.</p>
              ) : (
                topSellingProducts.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-stone-200 text-stone-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-stone-800 truncate">{p.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-amber-700 block">{p.qty} terjual</span>
                      <span className="text-[10px] text-stone-400">
                        Rp {p.revenue.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 mt-4 flex items-center justify-between text-xs">
            <span className="text-stone-500">Total Varian Aktif: {products.filter((p) => p.is_active).length} varian</span>
            <button
              onClick={() => setCurrentView('reports')}
              className="font-bold text-amber-700 hover:text-amber-800"
            >
              Lihat Rekap Lengkap &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions List */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">
              {isAdmin ? 'Transaksi Penjualan Terbaru (Semua Petugas)' : 'Transaksi Terbaru yang Saya Input'}
            </h3>
            <p className="text-xs text-stone-500">
              Riwayat penjualan kasir real-time dengan status dan metode pembayaran
            </p>
          </div>
          <button
            onClick={() => setCurrentView('sales_history')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800"
          >
            Lihat Semua Transaksi &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">No. Faktur</th>
                <th className="py-2.5 px-3">Waktu</th>
                <th className="py-2.5 px-3">Pelanggan</th>
                <th className="py-2.5 px-3">Petugas</th>
                <th className="py-2.5 px-3">Metode Bayar</th>
                <th className="py-2.5 px-3 text-right">Total Transaksi</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {relevantSales.slice(0, 5).map((sale) => (
                <tr key={sale.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-stone-900">{sale.invoice_no}</td>
                  <td className="py-3 px-3 text-stone-500">
                    {new Date(sale.created_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    WIB
                  </td>
                  <td className="py-3 px-3 text-stone-800 font-medium">
                    {sale.customer_name || 'Pelanggan Umum'}
                  </td>
                  <td className="py-3 px-3 text-stone-600">{sale.created_by_name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-medium">
                      {sale.payment_method}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-stone-900 font-mono">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
