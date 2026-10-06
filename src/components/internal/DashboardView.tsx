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
  RefreshCw,
  X,
  Filter,
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
  const [timeframe, setTimeframe] = useState<'7d' | 'month'>('7d');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

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

  // Dynamic Chart Points Generation (supports 7d vs 14d)
  const daysCount = timeframe === '7d' ? 7 : 14;

  const rawTrendDays = Array.from({ length: daysCount }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (daysCount - 1 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const daySales = relevantSales.filter(
      (s) => s.status === 'completed' && s.created_at.startsWith(dateStr)
    );
    const dayRevenue = daySales.reduce((acc, s) => acc + s.total_amount, 0);
    const dayQty = daySales.reduce(
      (acc, s) => acc + s.items.reduce((iAcc, item) => iAcc + item.quantity, 0),
      0
    );
    return {
      dateStr,
      date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      fullDate: d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }),
      day: d.toLocaleDateString('id-ID', { weekday: 'short' }),
      revenue: dayRevenue,
      trxCount: daySales.length,
      qty: dayQty,
    };
  });

  // Resilience: Anchor to latest sale if current calendar window has zero sales
  const hasAnyRevenue = rawTrendDays.some((d) => d.revenue > 0);
  const trendDays = hasAnyRevenue
    ? rawTrendDays
    : (() => {
        if (relevantSales.length === 0) return rawTrendDays;
        const sortedSales = [...relevantSales].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const anchorDate = new Date(sortedSales[0].created_at);
        return Array.from({ length: daysCount }, (_, i) => {
          const d = new Date(anchorDate);
          d.setDate(d.getDate() - (daysCount - 1 - i));
          const dateStr = d.toISOString().slice(0, 10);
          const daySales = relevantSales.filter(
            (s) => s.status === 'completed' && s.created_at.startsWith(dateStr)
          );
          const dayRevenue = daySales.reduce((acc, s) => acc + s.total_amount, 0);
          const dayQty = daySales.reduce(
            (acc, s) => acc + s.items.reduce((iAcc, item) => iAcc + item.quantity, 0),
            0
          );
          return {
            dateStr,
            date: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            fullDate: d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' }),
            day: d.toLocaleDateString('id-ID', { weekday: 'short' }),
            revenue: dayRevenue,
            trxCount: daySales.length,
            qty: dayQty,
          };
        });
      })();

  const maxRevenue = Math.max(100000, ...trendDays.map((d) => d.revenue));
  const avgRevenue = Math.round(trendDays.reduce((acc, d) => acc + d.revenue, 0) / trendDays.length);
  const totalPeriodRevenue = trendDays.reduce((acc, d) => acc + d.revenue, 0);
  const totalPeriodTrx = trendDays.reduce((acc, d) => acc + d.trxCount, 0);
  const peakDay = trendDays.reduce(
    (prev, curr) => (curr.revenue > prev.revenue ? curr : prev),
    trendDays[0]
  );

  // SVG Area Chart Geometry (Optimized padding to prevent any clipping)
  const svgWidth = 800;
  const svgHeight = 280;
  const paddingLeft = 72;
  const paddingRight = 40;
  const paddingTop = 44; // Ample headroom for peak badges & tooltips
  const paddingBottom = 54;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const yBaseline = paddingTop + chartHeight;

  const chartPoints = trendDays.map((item, idx) => {
    const x = paddingLeft + (idx * chartWidth) / (trendDays.length - 1);
    const ratio = maxRevenue > 0 ? item.revenue / maxRevenue : 0;
    const y = yBaseline - ratio * chartHeight;
    return { x, y, ...item, idx };
  });

  // Smooth Cubic Bézier Curve Path Generation
  let linePath = `M ${chartPoints[0].x} ${chartPoints[0].y}`;
  for (let i = 0; i < chartPoints.length - 1; i++) {
    const p0 = chartPoints[i];
    const p1 = chartPoints[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    linePath += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  const areaPath = `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${yBaseline} L ${chartPoints[0].x} ${yBaseline} Z`;

  // Grid steps (100%, 75%, 50%, 25%, 0%)
  const gridSteps = [1, 0.75, 0.5, 0.25, 0];

  // Filter sales for the table if a day was clicked on the chart
  const displayedSales = selectedDateFilter
    ? relevantSales.filter((s) => s.created_at.startsWith(selectedDateFilter))
    : relevantSales;

  return (
    <div className="space-y-6 w-full">
      {/* 0. Executive Control Header Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 capitalize flex items-center gap-1.5 border border-stone-200/70">
              {isAdmin ? (
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              ) : (
                <UserCheck className="w-3.5 h-3.5 text-stone-700" />
              )}
              {currentUser.full_name} ({currentUser.role})
            </span>
            <span className="text-xs text-stone-300">|</span>
            <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
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
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5 max-w-2xl">
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

      {/* 1. Top Section: Exactly 3-Column KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <p className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-stone-900 break-words">
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
            <p className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-stone-900 break-words">
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
        <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col justify-between sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Volume Penjualan Hari Ini
            </span>
            <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="my-3">
            <p className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-stone-900">
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

      {/* 2. Middle Section: 12-Column Grid (8 Columns Chart + 4 Columns Alert Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Chart Column (8 Columns - Interactive Dynamic Area Chart) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-4">
          {/* Chart Header & Interactive Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-600 shrink-0" />
                <h3 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                  Tren Omzet Penjualan
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Klik titik data pada grafik untuk memfilter transaksi di tabel bawah secara langsung
              </p>
            </div>

            {/* Timeframe selector + Telemetry badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex bg-stone-100 p-0.5 rounded-xl border border-stone-200/70 text-xs font-semibold">
                <button
                  onClick={() => {
                    setTimeframe('7d');
                    setSelectedDateFilter(null);
                  }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    timeframe === '7d'
                      ? 'bg-white text-stone-900 shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  7 Hari
                </button>
                <button
                  onClick={() => {
                    setTimeframe('month');
                    setSelectedDateFilter(null);
                  }}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    timeframe === 'month'
                      ? 'bg-white text-stone-900 shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  14 Hari
                </button>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-100/90 text-amber-950 border border-amber-300/80 shadow-2xs">
                Puncak: Rp {peakDay.revenue.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Active Filter Notice if clicked on chart */}
          {selectedDateFilter && (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2 text-xs">
              <span className="text-amber-900 font-medium flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-amber-700" />
                Memfilter tanggal: <strong>{selectedDateFilter}</strong>
              </span>
              <button
                onClick={() => setSelectedDateFilter(null)}
                className="text-amber-700 hover:text-amber-950 font-bold flex items-center gap-1 hover:underline"
              >
                <span>Hapus Filter</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* SVG Area Chart Visualizer (Clean, spacious, zero clipping) */}
          <div className="relative w-full pt-2">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-64 sm:h-72 select-none overflow-visible"
            >
              <defs>
                {/* Tisoffindo Warm Amber Gradient for Area Chart */}
                <linearGradient id="amberAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EA580C" stopOpacity="0.38" />
                  <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.14" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.00" />
                </linearGradient>

                {/* Subtle Stroke Gradient */}
                <linearGradient id="amberStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#D97706" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#EA580C" />
                </linearGradient>
              </defs>

              {/* Grid Lines & Y-Axis Labels */}
              {gridSteps.map((step, idx) => {
                const y = paddingTop + (1 - step) * chartHeight;
                const val = Math.round(maxRevenue * step);
                const label = step === 0 ? 'Rp 0' : `Rp ${(val / 1000).toFixed(0)}k`;
                return (
                  <g key={idx}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="#E7E5E4"
                      strokeDasharray={step === 0 ? 'none' : '4 4'}
                      strokeWidth={step === 0 ? 1.5 : 1}
                    />
                    <text
                      x={paddingLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="text-[10px] font-mono fill-stone-400 font-medium"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {/* Vertical Guide Lines for Each Day Column */}
              {chartPoints.map((p, idx) => (
                <line
                  key={`v-${idx}`}
                  x1={p.x}
                  y1={paddingTop}
                  x2={p.x}
                  y2={yBaseline}
                  stroke="#F5F5F4"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />
              ))}

              {/* Area Gradient Fill */}
              <path d={areaPath} fill="url(#amberAreaGrad)" />

              {/* Primary Data Line (Smooth Bézier curve) */}
              <path
                d={linePath}
                fill="none"
                stroke="url(#amberStrokeGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points, Markers & Interactive Hover Rings */}
              {chartPoints.map((p, idx) => {
                const isHovered = hoveredDayIndex === idx;
                const isSelected = selectedDateFilter === p.dateStr;
                const isPeak = p.revenue === peakDay.revenue && p.revenue > 0;
                const isToday = idx === chartPoints.length - 1;

                // Tooltip bounded coordinates (guaranteed zero clipping)
                const tooltipX = Math.max(75, Math.min(svgWidth - 75, p.x));
                const tooltipY = Math.max(22, p.y - 36);

                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredDayIndex(idx)}
                    onMouseLeave={() => setHoveredDayIndex(null)}
                    onClick={() => {
                      setSelectedDateFilter(selectedDateFilter === p.dateStr ? null : p.dateStr);
                    }}
                  >
                    {/* Hover Vertical Highlight Line */}
                    {(isHovered || isSelected) && (
                      <line
                        x1={p.x}
                        y1={paddingTop}
                        x2={p.x}
                        y2={yBaseline}
                        stroke="#D97706"
                        strokeDasharray="3 3"
                        strokeWidth="1.5"
                        opacity="0.8"
                      />
                    )}

                    {/* Outer Halo on Hover or Selection */}
                    {(isHovered || isSelected || isPeak) && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isSelected ? 10 : isHovered ? 9 : 8}
                        fill="#F59E0B"
                        opacity={isSelected ? 0.45 : isHovered ? 0.35 : 0.22}
                      />
                    )}

                    {/* Circle Node */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? 7 : isHovered ? 6 : isPeak || isToday ? 5 : 4}
                      fill={isSelected ? '#B45309' : isPeak ? '#B45309' : isToday ? '#EA580C' : '#78716C'}
                      stroke="#FFFFFF"
                      strokeWidth={isSelected ? 3 : 2.5}
                    />

                    {/* Peak Badge (Well within viewBox headroom) */}
                    {isPeak && !isHovered && !isSelected && (
                      <g transform={`translate(${p.x}, ${p.y - 16})`}>
                        <rect
                          x="-26"
                          y="-14"
                          width="52"
                          height="16"
                          rx="4"
                          fill="#F59E0B"
                          className="drop-shadow-xs"
                        />
                        <text
                          x="0"
                          y="-3"
                          textAnchor="middle"
                          className="text-[9px] font-bold fill-stone-950 font-sans tracking-tight"
                        >
                          ★ PUNCAK
                        </text>
                      </g>
                    )}

                    {/* Tooltip Card (Bounded, zero clipping) */}
                    {(isHovered || isSelected) && (
                      <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                        <rect
                          x="-64"
                          y="-20"
                          width="128"
                          height="36"
                          rx="8"
                          fill="#1C1917"
                          className="drop-shadow-lg"
                        />
                        <text
                          x="0"
                          y="-5"
                          textAnchor="middle"
                          className="text-[10px] font-mono font-bold fill-amber-300"
                        >
                          Rp {p.revenue.toLocaleString('id-ID')}
                        </text>
                        <text
                          x="0"
                          y="8"
                          textAnchor="middle"
                          className="text-[8.5px] fill-stone-300 font-sans"
                        >
                          {p.trxCount} transaksi • {p.qty} bungkus
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
                          : isHovered || isSelected
                          ? 'fill-stone-900 font-bold'
                          : 'fill-stone-600'
                      }`}
                    >
                      {p.day}
                    </text>
                    <text
                      x={p.x}
                      y={yBaseline + 32}
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

          {/* Telemetry Stats Strip below the Chart (Clean 4-metric strip) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-stone-100">
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Total Omzet {timeframe === '7d' ? '7 Hari' : '14 Hari'}
              </span>
              <span className="text-sm font-mono font-bold text-stone-900 block mt-0.5 truncate">
                Rp {totalPeriodRevenue.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Rata-rata Harian
              </span>
              <span className="text-sm font-mono font-bold text-stone-900 block mt-0.5 truncate">
                Rp {avgRevenue.toLocaleString('id-ID')}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                Total Transaksi
              </span>
              <span className="text-sm font-mono font-bold text-stone-900 block mt-0.5 truncate">
                {totalPeriodTrx} Nota Kasir
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                Hari Penjualan Tertinggi
              </span>
              <span className="text-sm font-mono font-bold text-amber-950 block mt-0.5 truncate">
                {peakDay.day} ({peakDay.date})
              </span>
            </div>
          </div>
        </div>

        {/* 4-Column Alert & Telemetry Panel (Harmonized height with the chart) */}
        <div className="lg:col-span-4 space-y-3.5">
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

          {/* Alert Card 1: Critical Stock Alert (4px solid left border) */}
          {criticalStockProducts.length > 0 ? (
            <div className="bg-rose-50/90 border border-rose-200/90 border-l-4 border-l-rose-600 rounded-xl p-3.5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wide text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  Peringatan Stok Kritis
                </span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-rose-200/70 text-rose-800">
                  {criticalStockProducts.length} Varian
                </span>
              </div>

              <p className="text-xs text-rose-900 leading-snug">
                Varian di bawah batas minimum gudang. Segera lakukan restok persediaan.
              </p>

              <div className="space-y-1.5 pt-0.5">
                {criticalStockProducts.slice(0, 2).map((p) => (
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
                className="w-full mt-1.5 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <span>Buka Inventaris & Restok</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50/90 border border-emerald-200/90 border-l-4 border-l-emerald-600 rounded-xl p-3.5 shadow-2xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Status Inventaris Optimal
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Semua varian kerupuk rambak ({products.length} varian) dalam batas persediaan aman.
              </p>
              <button
                onClick={() => setCurrentView('products')}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-900 underline flex items-center gap-1 pt-1"
              >
                <span>Cek Rincian Stok Produk &rarr;</span>
              </button>
            </div>
          )}

          {/* Alert Card 2: Terminal Kasir & POS Operasional (4px solid left border) */}
          <div className="bg-amber-50/90 border border-amber-200/90 border-l-4 border-l-amber-600 rounded-xl p-3.5 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-amber-900 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-amber-700 shrink-0" />
                Status Terminal Kasir
              </span>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900">
                Siap Transaksi
              </span>
            </div>

            <div className="text-xs space-y-1 bg-white/70 p-2.5 rounded-lg border border-amber-200/60">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Petugas:</span>
                <span className="font-semibold text-stone-900 truncate max-w-[150px]">
                  {currentUser.full_name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Nota Terakhir:</span>
                <span className="font-mono font-bold text-stone-900">
                  {latestSale ? latestSale.invoice_no : 'Belum Ada'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Nominal:</span>
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
          <div className="bg-stone-50 border border-stone-200/90 border-l-4 border-l-stone-600 rounded-xl p-3.5 shadow-2xs space-y-1.5">
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
              Sistem beroperasi dengan backup data terenkripsi dan log audit real-time.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Top Selling Products Breakdown (Responsive Grid: 1 sm:2 lg:3 xl:5) */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Boxes className="w-5 h-5 text-amber-600" />
              Performa 5 Varian Produk Terlaris (Top Selling)
            </h3>
            <p className="text-xs text-stone-500">
              Daftar varian dengan volume penjualan tertinggi yang mendominasi omzet toko Tisoffindo
            </p>
          </div>
          <button
            onClick={() => setCurrentView('reports')}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors inline-flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Lihat Laporan Rekap Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {topSellingProducts.length === 0 ? (
            <p className="text-xs text-stone-400 py-6 text-center col-span-full">
              Belum ada data penjualan tercatat.
            </p>
          ) : (
            topSellingProducts.map((p, idx) => {
              const percentage = Math.round((p.qty / maxTopSellingQty) * 100);
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-stone-50/90 border border-stone-200/70 hover:bg-stone-50 hover:border-amber-300 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span
                        className={`w-6 h-6 rounded-md text-xs font-bold font-mono flex items-center justify-center shrink-0 ${
                          idx === 0
                            ? 'bg-amber-500 text-stone-950 font-black shadow-2xs'
                            : idx === 1
                            ? 'bg-amber-200 text-amber-950 font-bold'
                            : idx === 2
                            ? 'bg-stone-200 text-stone-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        #{idx + 1}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        {p.qty} terjual
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-stone-900 line-clamp-2 leading-tight mb-2 min-h-[32px]" title={p.name}>
                      {p.name}
                    </h4>
                  </div>

                  <div className="mt-2 pt-2 border-t border-stone-200/60">
                    <div className="flex justify-between items-center text-[11px] mb-1.5">
                      <span className="text-stone-500">Omzet:</span>
                      <span className="font-mono font-bold text-stone-900">
                        Rp {p.revenue.toLocaleString('id-ID')}
                      </span>
                    </div>
                    {/* Meter bar */}
                    <div className="w-full bg-stone-200/80 h-1.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className={`h-full rounded-full ${
                          idx === 0 ? 'bg-amber-600' : idx === 1 ? 'bg-amber-500' : 'bg-stone-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Bottom Section: 12-Column Full Width Data Table (with Interactive Filter state) */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-600" />
                {isAdmin ? 'Tabel Transaksi Kasir Real-Time' : 'Transaksi Kasir yang Saya Input'}
              </h3>
              {selectedDateFilter && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <Filter className="w-3 h-3 text-amber-700" />
                  Filter: {selectedDateFilter}
                  <button
                    onClick={() => setSelectedDateFilter(null)}
                    className="ml-1 text-amber-700 hover:text-amber-950 font-bold"
                    title="Hapus filter"
                  >
                    &times;
                  </button>
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
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

        <div className="overflow-x-auto scrollbar-thin">
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
              {displayedSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400 text-xs">
                    Tidak ada transaksi ditemukan {selectedDateFilter ? `pada tanggal ${selectedDateFilter}` : ''}.
                  </td>
                </tr>
              ) : (
                displayedSales.slice(0, 8).map((sale) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer info & mobile hint */}
        <div className="pt-3 border-t border-stone-100 mt-2 flex items-center justify-between text-[11px] text-stone-500 flex-wrap gap-2">
          <span>
            Menampilkan {Math.min(8, displayedSales.length)} dari {displayedSales.length} transaksi tercatat
          </span>
          <span className="lg:hidden text-stone-400">
            Geser tabel ke samping untuk rincian &rarr;
          </span>
        </div>
      </div>
    </div>
  );
};
