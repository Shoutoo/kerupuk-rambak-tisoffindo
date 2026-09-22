import React from 'react';
import { AppProvider, useApp } from './context/AppContext';

// Public components
import { PublicNavbar } from './components/public/PublicNavbar';
import { HeroSection } from './components/public/HeroSection';
import { AboutSection } from './components/public/AboutSection';
import { CatalogSection } from './components/public/CatalogSection';
import { GallerySection } from './components/public/GallerySection';
import { ContactSection } from './components/public/ContactSection';
import { PublicFooter } from './components/public/PublicFooter';

// Auth component
import { LoginView } from './components/auth/LoginView';

// Internal components
import { InternalLayout } from './components/internal/InternalLayout';
import { DashboardView } from './components/internal/DashboardView';
import { PosView } from './components/internal/PosView';
import { ProductsView } from './components/internal/ProductsView';
import { StockMovementView } from './components/internal/StockMovementView';
import { SalesHistoryView } from './components/internal/SalesHistoryView';
import { ReportsView } from './components/internal/ReportsView';
import { UsersView } from './components/internal/UsersView';
import { SupabaseConfigView } from './components/internal/SupabaseConfigView';
import { CompanyProfileSettingsView } from './components/internal/CompanyProfileSettingsView';
import { ReceiptModal } from './components/internal/ReceiptModal';

const AppContent: React.FC = () => {
  const { currentView, currentUser, activeReceipt, setActiveReceipt } = useApp();

  // 1. Company Profile View (Public side)
  if (currentView === 'company_profile') {
    return (
      <div className="min-h-screen bg-stone-50 font-sans text-stone-800 flex flex-col selection:bg-amber-200 selection:text-amber-950">
        <PublicNavbar />
        <main className="flex-1">
          <HeroSection />
          <AboutSection />
          <CatalogSection />
          <GallerySection />
          <ContactSection />
        </main>
        <PublicFooter />
      </div>
    );
  }

  // 2. Login View
  if (currentView === 'login') {
    return <LoginView />;
  }

  // 3. Fallback to login if not authenticated for internal views
  if (!currentUser) {
    return <LoginView />;
  }

  // 4. Internal System Views
  const renderInternalView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'pos':
        return <PosView />;
      case 'products':
        return <ProductsView />;
      case 'stock_movements':
        return <StockMovementView />;
      case 'sales_history':
        return <SalesHistoryView />;
      case 'reports':
        return <ReportsView />;
      case 'users':
        return currentUser.role === 'admin' ? <UsersView /> : <DashboardView />;
      case 'company_profile_settings':
        return currentUser.role === 'admin' ? <CompanyProfileSettingsView /> : <DashboardView />;
      case 'supabase_sql':
        return currentUser.role === 'admin' ? <SupabaseConfigView /> : <DashboardView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <>
      <InternalLayout>{renderInternalView()}</InternalLayout>
      {/* Receipt Modal for POS checkout / Reprint */}
      {activeReceipt && (
        <ReceiptModal sale={activeReceipt} onClose={() => setActiveReceipt(null)} />
      )}
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
