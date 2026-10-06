import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  CircleDollarSign,
  ShoppingCart,
  Boxes,
  AlertTriangle,
  PackageCheck,
  Calendar,
  UserCheck,
  ShieldCheck,
  Receipt,
  Activity,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    currentUser,
    sales,
    products,
    criticalStockProducts,
    activityLogs,
    setCurrentView,
    setActiveReceipt,
  } = useApp();

  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

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

  // Average ticket per transaction today
  const avgTicketToday = todaySales.length > 0 ? Math.round(totalOmzetToday / todaySales.length) : 0;

  // Latest sale for cashier telemetry
  const latestSale = relevantSales.length > 0 ? relevantSales[0] : null;

  // Active products count
  const activeProductsCount = products.filter((p) => p.is_active).length;

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

  const maxTopSellingQty = topSellingProducts.length > 0 ? topSellingProducts[0].qty : 1;

  // Last 7 days trend - dynamic from actual sales data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const dayRevenue = relevantSales
      .filter((s) => s.status === 'completed' && s.created_at.startsWith(dateStr))
      .reduce((acc, s) => acc + s.total_amount, 0);
    return {
      dateStr,
      date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      day: d.toLocaleDateString('id-ID', { weekday: 'short' }).slice(0, 3),
      revenue: dayRevenue,
    };
  });

  const maxRevenue = Math.max(100000, ...last7Days.map((d) => d.revenue));
  const avgRevenue = Math.round(last7Days.reduce((acc, d) => acc + d.revenue, 0) / 7);
  const peakDay = last7Days.reduce((prev, curr) => (curr.revenue > prev.revenue ? curr : prev), last7Days[0]);

  // SVG Area Chart Geometry
  const svgWidth = 680;
  const svgHeight = 220;
  const paddingLeft = 56;
  const paddingRight = 32;
  const paddingTop = 28;
  const paddingBottom = 48;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const yBaseline = paddingTop + chartHeight;

  const chartPoints = last7Days.map((item, idx) => {
    const x = paddingLeft + (idx * chartWidth) / (last7Days.length - 1);
    const ratio = maxRevenue > 0 ? item.revenue / maxRevenue : 0;
    const y = yBaseline - ratio * chartHeight;
    return { x, y, ...item, idx };
  });

  // Smooth Bézier curve generation
  let linePath = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
  for (let i = 0; i < chartPoints.length - 1; i++) {
    const p0 = chartPoints[i];
    const p1 = chartPoints[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    linePath += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  const areaPath = `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${yBaseline} L ${chartPoints[0].x} ${yBaseline} Z`;

  return (
    <div className="space-y-6">
      {/* 0. Executive Control Header Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-950 uppercase tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Telemetri Sistem Tisoffindo
            </span>
            <span className="text-xs text-stone-300">|</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 capitalize flex items-center gap-1">
              {isAdmin ? (
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-stone-700" />
              )}
              Peran: {currentUser.role}
            </span>
            <span className="text-xs text-stone-300">|</span>
            <span className="text-xs text-stone-500 font-medium">
              {now.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
            Dashboard Kontrol Penjualan & Inventaris
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            {isAdmin
              ? 'Monitoring real-time omzet harian, deteksi ambang batas stok gudang, dan aktivitas kasir toko Tisoffindo.'
              : 'Pusat operasional kasir, pemantauan transaksi harian, dan pencatatan penjualan kerupuk rambak.'}
          </p>
        </div>

        {/* Quick Launch POS Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCurrentView('pos')}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Buka Kasir / POS Baru</span>
          </button>
        </div>
      </div>

      {/* 1. Top Section: 3-Column KPI Grid (WattVision Section 5: Vista de 3 columnas KPI en la parte superior) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* KPI 1: Omzet Hari Ini */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {isAdmin ? 'Omzet Hari Ini' : 'Penjualan Saya Hari Ini'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
              <CircleDollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="my-3">
            <p className="text-3xl font-mono font-bold tracking-tight text-stone-900">
              Rp {totalOmzetToday.toLocaleString('id-ID')}
            </p>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {todaySales.length} Transaksi Selesai
            </span>
            <span className="text-stone-400 font-mono text-[11px]">
              {todaySales.length > 0 ? `Rp ${avgTicketToday.toLocaleString('id-ID')}/nota` : 'Belum ada nota'}
            </span>
          </div>
        </div>

        {/* KPI 2: Akumulasi Omzet Bulan Ini */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {isAdmin
                ? `Akumulasi Bulan Ini (${now.toLocaleDateString('id-ID', { month: 'short' })})`
                : 'Penjualan Saya Bulan Ini'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="my-3">
            <p className="text-3xl font-mono font-bold tracking-tight text-stone-900">
              Rp {totalOmzetMonth.toLocaleString('id-ID')}
            </p>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-amber-900 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              {monthSales.length} Total Transaksi
            </span>
            <span className="text-stone-400 text-[11px]">
              Tahun {now.getFullYear()}
            </span>
          </div>
        </div>

        {/* KPI 3: Volume Penjualan Hari Ini */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Volume Penjualan Hari Ini
            </span>
            <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="my-3">
            <p className="text-3xl font-mono font-bold tracking-tight text-stone-900">
              {totalItemsSoldToday}{' '}
              <span className="text-base font-normal font-sans text-stone-500">bungkus</span>
            </p>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-stone-700 bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-md">
              <Boxes className="w-3.5 h-3.5 text-stone-600" />
              {activeProductsCount} Varian Aktif
            </span>
            <span className="text-stone-400 text-[11px]">
              Keluar otomatis gudang
            </span>
          </div>
        </div>
      </div>

      {/* 2. Middle Section: 12-Column Grid (WattVision: Gráfico principal 8 cols + Panel Alertas 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Chart & Velocity Breakdown Column (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Area Chart Card */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900 tracking-tight flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-600" />
                  Tren Omzet Penjualan 7 Hari Terakhir
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Visualisasi area kurva omzet harian dengan deteksi titik puncak transaksi kasir
                </p>
              </div>

              {/* Telemetry Stats Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-100/80 text-amber-900 border border-amber-200/80">
                  Puncak: Rp {peakDay.revenue.toLocaleString('id-ID')}
                </span>
                <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200/80">
                  Rata-rata: Rp {avgRevenue.toLocaleString('id-ID')}/hr
                </span>
              </div>
            </div>

            {/* Area Chart Container (SVG Area Gradient) */}
            <div className="relative w-full overflow-hidden pt-2">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-56 sm:h-64 overflow-visible select-none"
              >
                <defs>
                  {/* Tisoffindo Warm Amber Gradient for Area Chart */}
                  <linearGradient id="amberAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D97706" stopOpacity="0.35" />
                    <stop offset="60%" stopColor="#D97706" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#D97706" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Grid Lines & Y-Axis Labels */}
                {/* 100% Max Level */}
                <line
                  x1={paddingLeft}
                  y1={paddingTop}
                  x2={svgWidth - paddingRight}
                  y2={paddingTop}
                  stroke="#E7E5E4"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={paddingTop + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-stone-400 font-medium"
                >
                  Rp {(maxRevenue / 1000).toFixed(0)}k
                </text>

                {/* 50% Mid Level */}
                <line
                  x1={paddingLeft}
                  y1={paddingTop + chartHeight / 2}
                  x2={svgWidth - paddingRight}
                  y2={paddingTop + chartHeight / 2}
                  stroke="#E7E5E4"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={paddingTop + chartHeight / 2 + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-stone-400 font-medium"
                >
                  Rp {(maxRevenue / 2000).toFixed(0)}k
                </text>

                {/* Baseline 0 */}
                <line
                  x1={paddingLeft}
                  y1={yBaseline}
                  x2={svgWidth - paddingRight}
                  y2={yBaseline}
                  stroke="#E7E5E4"
                  strokeWidth="1.5"
                />
                <text
                  x={paddingLeft - 8}
                  y={yBaseline + 4}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-stone-400 font-medium"
                >
                  Rp 0
                </text>

                {/* Area Gradient Fill */}
                <path d={areaPath} fill="url(#amberAreaGradient)" />

                {/* Primary Data Line (Smooth Bézier curve) */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points, Markers & Interactive Hover Rings */}
                {chartPoints.map((p, idx) => {
                  const isHovered = hoveredDayIndex === idx;
                  const isPeak = p.revenue === peakDay.revenue && p.revenue > 0;
                  const isToday = idx === chartPoints.length - 1;

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredDayIndex(idx)}
                      onMouseLeave={() => setHoveredDayIndex(null)}
                    >
                      {/* Vertical Indicator Bar on Hover */}
                      {isHovered && (
                        <line
                          x1={p.x}
                          y1={paddingTop}
                          x2={p.x}
                          y2={yBaseline}
                          stroke="#D97706"
                          strokeDasharray="2 2"
                          strokeWidth="1.5"
                          opacity="0.6"
                        />
                      )}

                      {/* Circle Node */}
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHovered ? 6 : isPeak || isToday ? 5 : 4}
                        fill={isPeak ? '#B45309' : isToday ? '#D97706' : '#78716C'}
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                      />

                      {/* Peak Badge */}
                      {isPeak && !isHovered && (
                        <g transform={`translate(${p.x}, ${p.y - 12})`}>
                          <rect
                            x="-22"
                            y="-12"
                            width="44"
                            height="15"
                            rx="4"
                            fill="#F59E0B"
                            className="drop-shadow-xs"
                          />
                          <text
                            x="0"
                            y="-2"
                            textAnchor="middle"
                            className="text-[9px] font-bold fill-stone-900 font-sans"
                          >
                            Puncak
                          </text>
                        </g>
                      )}

                      {/* Hover Tooltip Card */}
                      {isHovered && (
                        <g transform={`translate(${p.x}, ${Math.max(paddingTop, p.y - 32)})`}>
                          <rect
                            x="-50"
                            y="-16"
                            width="100"
                            height="24"
                            rx="6"
                            fill="#1C1917"
                            className="drop-shadow-md"
                          />
                          <text
                            x="0"
                            y="0"
                            textAnchor="middle"
                            className="text-[10px] font-mono font-bold fill-white"
                          >
                            Rp {p.revenue.toLocaleString('id-ID')}
                          </text>
                        </g>
                      )}

                      {/* X-Axis Day & Date Labels */}
                      <text
                        x={p.x}
                        y={yBaseline + 18}
                        textAnchor="middle"
                        className={`text-xs font-semibold ${
                          isToday
                            ? 'fill-amber-700 font-bold'
                            : isHovered
                            ? 'fill-stone-900 font-bold'
                            : 'fill-stone-600'
                        }`}
                      >
                        {p.day}
                      </text>
                      <text
                        x={p.x}
                        y={yBaseline + 30}
                        textAnchor="middle"
                        className="text-[10px] font-mono fill-stone-400"
                      >
                        {p.date.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Top Selling Products Breakdown Card */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-amber-600" />
                  Performa Produk Terlaris (Top Volume)
                </h3>
                <p className="text-xs text-stone-500">
                  Daftar varian dengan volume penjualan tertinggi yang mendominasi omzet toko
                </p>
              </div>
              <button
                onClick={() => setCurrentView('reports')}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors hidden sm:inline-flex items-center gap-1"
              >
                <span>Lihat Laporan Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 mt-4">
              {topSellingProducts.length === 0 ? (
                <p className="text-xs text-stone-400 py-6 text-center">
                  Belum ada data penjualan tercatat.
                </p>
              ) : (
                topSellingProducts.map((p, idx) => {
                  const percentage = Math.round((p.qty / maxTopSellingQty) * 100);
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-stone-50/80 border border-stone-200/60 hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 h-6 rounded-md text-xs font-bold font-mono flex items-center justify-center shrink-0 ${
                              idx === 0
                                ? 'bg-amber-500 text-stone-950 font-black'
                                : idx === 1
                                ? 'bg-amber-200 text-amber-950 font-bold'
                                : idx === 2
                                ? 'bg-stone-200 text-stone-800'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-stone-800 truncate">
                            {p.name}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-stone-900">
                            {p.qty} <span className="font-sans font-normal text-stone-500">terjual</span>
                          </span>
                          <span className="text-[11px] font-mono text-amber-700 block">
                            Rp {p.revenue.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* Velocity Meter */}
                      <div className="w-full bg-stone-200/70 h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${percentage}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            idx === 0
                              ? 'bg-amber-600'
                              : idx === 1
                              ? 'bg-amber-500'
                              : 'bg-stone-600'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 mt-4 flex items-center justify-between text-xs sm:hidden">
              <button
                onClick={() => setCurrentView('reports')}
                className="font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                <span>Lihat Laporan Lengkap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 4-Column Alert & Telemetry Panel (WattVision Section 3 & 5: Panel de Alertas ocupando 4 columnas con borde izquierdo de 4px solid) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Panel Alerta & Status Sistem
            </h3>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE SISTEM
            </span>
          </div>

          {/* Alert Card 1: Critical Stock / Restok Warning (4px solid left border) */}
          {criticalStockProducts.length > 0 ? (
            <div className="bg-rose-50/90 border border-rose-200/90 border-l-4 border-l-rose-600 rounded-xl p-4 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  Peringatan Stok Kritis
                </span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-rose-200/70 text-rose-800">
                  {criticalStockProducts.length} Varian
                </span>
              </div>

              <p className="text-xs text-rose-900 leading-relaxed">
                Terdapat varian produk yang telah menyentuh atau berada di bawah batas minimum gudang. Segera lakukan restok.
              </p>

              <div className="space-y-1.5 pt-1">
                {criticalStockProducts.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs bg-white/80 p-2 rounded-lg border border-rose-200/60"
                  >
                    <span className="font-semibold text-stone-800 truncate pr-2">{p.name}</span>
                    <span className="font-mono font-bold text-rose-700 shrink-0">
                      Sisa: {p.stock_qty} {p.unit}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setCurrentView('products')}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Buka Inventaris & Restok</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50/90 border border-emerald-200/90 border-l-4 border-l-emerald-600 rounded-xl p-4 shadow-2xs space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Status Inventaris Optimal
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Semua varian kerupuk rambak ({products.length} varian) berada dalam batas persediaan aman di atas ambang minimum.
              </p>
              <div className="pt-1">
                <button
                  onClick={() => setCurrentView('products')}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 underline flex items-center gap-1"
                >
                  <span>Cek Rincian Stok Produk &rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* Alert Card 2: Terminal Kasir & POS Operasional (4px solid left border) */}
          <div className="bg-amber-50/90 border border-amber-200/90 border-l-4 border-l-amber-600 rounded-xl p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-amber-900 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-700 shrink-0" />
                Status Terminal Kasir
              </span>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900">
                Siap Transaksi
              </span>
            </div>

            <div className="text-xs space-y-1.5 bg-white/70 p-2.5 rounded-lg border border-amber-200/60">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Petugas Bertugas:</span>
                <span className="font-semibold text-stone-900">{currentUser.full_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Transaksi Terakhir:</span>
                <span className="font-mono font-bold text-stone-900">
                  {latestSale ? latestSale.invoice_no : 'Belum Ada'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Nominal Nota:</span>
                <span className="font-mono font-bold text-amber-800">
                  {latestSale ? `Rp ${latestSale.total_amount.toLocaleString('id-ID')}` : '-'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('pos')}
              className="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Input Penjualan Kasir (POS)</span>
            </button>
          </div>

          {/* Alert Card 3: Diagnostik Database & Penyimpanan (4px solid left border) */}
          <div className="bg-stone-50 border border-stone-200/90 border-l-4 border-l-stone-600 rounded-xl p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-1.5 text-stone-800 text-xs font-bold uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-stone-600 shrink-0" />
              Integritas & Audit Sistem
            </div>

            <div className="text-xs space-y-1 bg-white p-2.5 rounded-lg border border-stone-200/60">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Penyimpanan:</span>
                <span className="font-semibold text-emerald-700">Tersinkronisasi</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Audit Terakhir:</span>
                <span className="text-stone-800 truncate max-w-[130px] font-mono text-[11px]">
                  {activityLogs.length > 0 ? activityLogs[0].action : 'Normal'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 leading-tight">
              Sistem beroperasi dengan backup data terenkripsi dan log mutasi real-time.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Bottom Section: 12-Column Full Width Data Table (WattVision Section 3: Tablas con border-bottom y hover) */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-600" />
              {isAdmin ? 'Tabel Transaksi Kasir Real-Time (Semua Petugas)' : 'Transaksi Kasir yang Saya Input'}
            </h3>
            <p className="text-xs text-stone-500">
              Log transaksi penjualan kasir terperinci dengan metode bayar, timestamp, dan validasi struk nota
            </p>
          </div>

          <button
            onClick={() => setCurrentView('sales_history')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Buka Semua Riwayat Transaksi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[680px]">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">No. Faktur</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Waktu</th>
                <th className="py-2.5 px-3">Pelanggan</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Petugas</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Metode Bayar</th>
                <th className="py-2.5 px-3 text-right">Total Transaksi</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {relevantSales.slice(0, 6).map((sale) => (
                <tr
                  key={sale.id}
                  className="hover:bg-amber-50/40 transition-colors"
                >
                  <td className="py-3 px-3 font-mono font-bold text-stone-900 whitespace-nowrap">
                    {sale.invoice_no}
                  </td>
                  <td className="py-3 px-3 text-stone-500 font-mono whitespace-nowrap text-[11px]">
                    {new Date(sale.created_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    WIB
                  </td>
                  <td className="py-3 px-3 text-stone-800 font-medium">
                    {sale.customer_name || 'Pelanggan Umum'}
                  </td>
                  <td className="py-3 px-3 text-stone-600 whitespace-nowrap">
                    {sale.created_by_name}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-mono text-[11px] font-medium border border-stone-200/60">
                      {sale.payment_method}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-stone-900 font-mono whitespace-nowrap">
                    Rp {sale.total_amount.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
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
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => setActiveReceipt(sale)}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-800 transition-colors inline-flex items-center gap-1 text-[11px] font-semibold"
                      title="Cetak / Buka Struk Faktur"
                    >
                      <Receipt className="w-3.5 h-3.5 text-amber-700" />
                      <span>Struk</span>
                    </button>
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
