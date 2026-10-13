import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { APP_ASSETS } from '../../assets/images';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  ArrowLeftRight,
  Receipt,
  BarChart3,
  Users,
  Building2,
  LogOut,
  Globe,
  Bell,
  Menu,
  X,
  Shield,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';

interface InternalLayoutProps {
  children: React.ReactNode;
}

export const InternalLayout: React.FC<InternalLayoutProps> = ({ children }) => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    logout,
    criticalStockProducts,
    resetToInitialData,
  } = useApp();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'petugas'],
      badge: null,
    },
    {
      id: 'pos',
      label: 'Kasir / Input Transaksi',
      icon: ShoppingCart,
      roles: ['admin', 'petugas'],
      badge: 'POS',
    },
    {
      id: 'products',
      label: 'Data Produk & Stok',
      icon: Boxes,
      roles: ['admin', 'petugas'],
      badge: criticalStockProducts.length > 0 ? `${criticalStockProducts.length} Kritis` : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'stock_movements',
      label: 'Riwayat Mutasi Stok',
      icon: ArrowLeftRight,
      roles: ['admin', 'petugas'],
      badge: null,
    },
    {
      id: 'sales_history',
      label: 'Daftar Transaksi',
      icon: Receipt,
      roles: ['admin', 'petugas'],
      badge: null,
    },
    {
      id: 'reports',
      label: isAdmin ? 'Laporan & Rekap Penjualan' : 'Rekap Penjualan Saya',
      icon: BarChart3,
      roles: ['admin', 'petugas'],
      badge: null,
    },
    {
      id: 'users',
      label: 'Manajemen Petugas & Log',
      icon: Users,
      roles: ['admin'],
      badge: 'Admin',
      badgeColor: 'bg-amber-100 text-amber-900',
    },
    {
      id: 'company_profile_settings',
      label: 'Profil Usaha & Galeri',
      icon: Building2,
      roles: ['admin'],
      badge: 'Website',
      badgeColor: 'bg-amber-100 text-amber-900',
    },
  ];

  const allowedNavItems = navItems.filter((item) => item.roles.includes(currentUser.role));
  const currentNavItem = navItems.find((item) => item.id === currentView) || navItems[0];
  const CurrentIcon = currentNavItem.icon;

  return (
    <div className="h-screen w-full flex overflow-hidden bg-stone-100/90 text-stone-900 select-none">
      {/* 1. Full-Height Left Navigation Sidebar (Desktop - Fixed / Never Scrolls) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-stone-200/90 h-screen z-30 shadow-2xs">
        {/* Brand / Logo Header */}
        <div
          onClick={() => setCurrentView('dashboard')}
          className="h-16 px-4 flex items-center gap-3 border-b border-stone-200/90 shrink-0 cursor-pointer hover:bg-stone-50/60 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white border border-amber-300 shadow-xs shrink-0">
            <img
              src={APP_ASSETS.logo}
              alt="Logo Tisoffindo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-stone-900 text-base tracking-tight truncate block leading-tight">
              Tisoffindo
            </span>
            <span className="text-[11px] text-stone-500 block leading-tight truncate">
              Sistem Kasir & Stok
            </span>
          </div>
        </div>

        {/* Scrollable Navigation Menu List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="px-3 py-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
            Menu Utama
          </div>

          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                }`}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      item.badgeColor || (isActive ? 'bg-amber-700 text-amber-100' : 'bg-stone-200 text-stone-700')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Sidebar Footer: Web Publik Shortcut & User Profile */}
        <div className="p-3 border-t border-stone-200/90 space-y-2 shrink-0 bg-stone-50/70">
          <button
            onClick={() => setCurrentView('company_profile')}
            className="w-full py-2 px-3 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-white transition-colors"
          >
            <Globe className="w-3.5 h-3.5 text-amber-600" />
            <span>Kunjungi Web Publik</span>
          </button>

          {/* User Profile Mini Bar */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200/80">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isAdmin ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-stone-200 text-stone-800'
                }`}
                title={`${currentUser.full_name} (${currentUser.role})`}
              >
                {isAdmin ? <Shield className="w-4 h-4 text-amber-800" /> : <UserCheck className="w-4 h-4 text-stone-700" />}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-stone-900 truncate leading-tight">
                  {currentUser.full_name}
                </p>
                <p className="text-[10px] text-stone-500 capitalize leading-tight">
                  {currentUser.role}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
              title="Keluar Akun"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Right Pane: Fixed Header on Top + Scrollable Content Below */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Header Navbar (Fixed at top - Does NOT scroll) */}
        <header className="h-16 shrink-0 bg-white border-b border-stone-200/90 shadow-2xs z-20 flex items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Left: Mobile Drawer Trigger & Current Page Header */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100 min-w-[40px] min-h-[40px] flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              aria-label="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Logo Brand */}
            <div
              onClick={() => setCurrentView('dashboard')}
              className="lg:hidden flex items-center gap-2 cursor-pointer min-w-0"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-amber-300 shrink-0">
                <img
                  src={APP_ASSETS.logo}
                  alt="Tisoffindo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-stone-900 text-sm truncate">
                Tisoffindo
              </span>
            </div>

            {/* Desktop Current Active View Title & Breadcrumb */}
            <div className="hidden lg:flex items-center gap-3 min-w-0">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/70 shadow-2xs">
                <CurrentIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-stone-900 leading-tight">
                    {currentNavItem.label}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live System
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 leading-tight">
                  Portal Administrasi & Operasional Bisnis Kerupuk Rambak
                </p>
              </div>
            </div>
          </div>

          {/* Right: Notifications, Web Link, User Badge & Logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Low stock notifications bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
                title="Peringatan Stok"
                aria-label="Notifikasi Stok"
              >
                <Bell className="w-5 h-5" />
                {criticalStockProducts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-xs sm:w-80 bg-white rounded-2xl shadow-xl border border-stone-200 p-4 z-50"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                        Peringatan Stok Menipis
                      </h4>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                        {criticalStockProducts.length} Produk
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                      {criticalStockProducts.length === 0 ? (
                        <p className="text-xs text-stone-500 py-3 text-center">
                          Semua stok produk dalam kondisi aman.
                        </p>
                      ) : (
                        criticalStockProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              setCurrentView('products');
                              setNotificationsOpen(false);
                            }}
                            className="p-2.5 rounded-xl bg-stone-50 hover:bg-amber-50/60 cursor-pointer border border-stone-200/60 transition-colors flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-stone-800 truncate">{p.name}</p>
                              <p className="text-[11px] text-stone-500">
                                Batas min: {p.min_stock} {p.unit}
                              </p>
                            </div>
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 shrink-0">
                              Sisa: {p.stock_qty}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {criticalStockProducts.length > 0 && (
                      <button
                        onClick={() => {
                          setCurrentView('products');
                          setNotificationsOpen(false);
                        }}
                        className="mt-3 w-full py-2 text-center text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 rounded-lg transition-colors"
                      >
                        Buka Kelola Stok Produk &rarr;
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Back to Public website */}
            <button
              onClick={() => setCurrentView('company_profile')}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-medium transition-colors"
              title="Kunjungi Website Publik"
            >
              <Globe className="w-3.5 h-3.5 text-amber-600" />
              <span>Web Publik</span>
            </button>

            {/* Topbar User Profile Badge */}
            <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-stone-200">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isAdmin ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-stone-200 text-stone-800'
                }`}
                title={`${currentUser.full_name} (${currentUser.role})`}
              >
                {isAdmin ? <Shield className="w-4 h-4 text-amber-800" /> : <UserCheck className="w-4 h-4 text-stone-700" />}
              </div>
              <div className="hidden sm:block text-left max-w-[120px] truncate">
                <p className="text-xs font-bold text-stone-900 leading-tight truncate">{currentUser.full_name}</p>
                <p className="text-[10px] text-stone-500 capitalize">{currentUser.role}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2 rounded-xl text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              title="Keluar (Logout)"
              aria-label="Keluar Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 3. Main Content Viewport: ONLY THIS SCROLLS! */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-6 bg-stone-100/90">
          <div className="max-w-[1600px] w-full mx-auto pb-24 lg:pb-6 select-text">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Navigation Drawer (Overlay on small screens) */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl p-4 flex flex-col justify-between z-10 overflow-y-auto"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                      T
                    </div>
                    <div>
                      <span className="font-bold text-stone-900 text-sm block">Tisoffindo Internal</span>
                      <span className="text-[10px] text-stone-500">Menu & Administrasi</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 min-w-[36px] min-h-[36px] flex items-center justify-center"
                    aria-label="Tutup Menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {allowedNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-xs font-semibold min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                          isActive
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              item.badgeColor || (isActive ? 'bg-amber-700 text-amber-100' : 'bg-stone-200 text-stone-800')
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 space-y-2 mt-6">
                <button
                  onClick={() => {
                    setCurrentView('company_profile');
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-stone-50 min-h-[44px]"
                >
                  <Globe className="w-4 h-4 text-amber-600" />
                  <span>Kunjungi Web Profil Publik</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-rose-100 min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Akun ({currentUser.full_name})</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar (Fixed at bottom on touch devices) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around safe-area-bottom">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[44px] ${
            currentView === 'dashboard' ? 'text-amber-600 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-tight">Dashboard</span>
        </button>

        <button
          onClick={() => setCurrentView('pos')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[44px] relative ${
            currentView === 'pos' ? 'text-amber-600 font-bold' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <div className={`p-1 rounded-lg ${currentView === 'pos' ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 text-stone-600'}`}>
            <ShoppingCart className="w-4 h-4" />
          </div>
          <span className="text-[10px] leading-tight mt-0.5">Kasir POS</span>
        </button>

        <button
          onClick={() => setCurrentView('products')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[44px] relative ${
            currentView === 'products' ? 'text-amber-600 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <Boxes className="w-4 h-4 mb-0.5" />
            {criticalStockProducts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </div>
          <span className="text-[10px] leading-tight">Stok</span>
        </button>

        <button
          onClick={() => setCurrentView('sales_history')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all min-h-[44px] ${
            currentView === 'sales_history' ? 'text-amber-600 font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Receipt className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-tight">Transaksi</span>
        </button>

        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-stone-500 hover:text-stone-800 transition-all min-h-[44px]"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span className="text-[10px] leading-tight">Menu</span>
        </button>
      </nav>
    </div>
  );
};
