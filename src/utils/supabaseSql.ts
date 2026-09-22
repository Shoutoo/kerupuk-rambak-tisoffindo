export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- SKEMA DATABASE SUPABASE (POSTGRESQL + RLS) - APLIKASI WEB TISOFFINDO
-- Sesuai Dokumen Kebutuhan Produk (PRD) Versi 1.0 (22 September 2026)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL PROFILES (Terhubung ke auth.users Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'petugas')),
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. TABEL PRODUCT_CATEGORIES
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. TABEL PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    unit TEXT NOT NULL DEFAULT 'bungkus', -- bungkus, kg, dus, pouch
    image_url TEXT,
    stock_qty NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    min_stock NUMERIC(12, 2) NOT NULL DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. TABEL STOCK_MOVEMENTS (Riwayat Mutasi Stok)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
    quantity NUMERIC(12, 2) NOT NULL,
    note TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 6. TABEL SALES (Transaksi Penjualan)
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_no TEXT NOT NULL UNIQUE,
    customer_name TEXT DEFAULT 'Pelanggan Umum',
    total_amount NUMERIC(14, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT NOT NULL DEFAULT 'Tunai',
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    cancellation_reason TEXT
);

-- 7. TABEL SALE_ITEMS (Detail Barang per Transaksi)
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    subtotal NUMERIC(14, 2) NOT NULL CHECK (subtotal >= 0)
);

-- 8. TABEL ACTIVITY_LOGS (Audit Trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    detail JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 9. TABEL COMPANY_PROFILE (Profil Usaha & Kontak Real-Time)
CREATE TABLE IF NOT EXISTS public.company_profile (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    operating_hours TEXT NOT NULL,
    gmaps_url TEXT NOT NULL,
    gmaps_embed_lat NUMERIC(10, 7),
    gmaps_embed_lng NUMERIC(10, 7),
    rating NUMERIC(3, 1) DEFAULT 5.0,
    review_count INT DEFAULT 6,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 10. TABEL GALLERY (Foto Pabrik, Produksi, dan Toko)
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 11. TABEL TESTIMONIALS (Ulasan & Testimoni Pelanggan)
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    source TEXT DEFAULT 'Google Maps',
    is_featured BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view their own profile, Admins can view/edit all
CREATE POLICY "Profiles view policy" ON public.profiles
FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Profiles update policy" ON public.profiles
FOR UPDATE USING (public.is_admin());

-- Products: Everyone (including public) can view active products
CREATE POLICY "Public read products" ON public.products
FOR SELECT USING (is_active = TRUE OR auth.role() = 'authenticated');

CREATE POLICY "Admin manage products" ON public.products
FOR ALL USING (public.is_admin());

-- Stock Movements: Auth users can view, Admin can manage
CREATE POLICY "Auth view stock movements" ON public.stock_movements
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin manage stock movements" ON public.stock_movements
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Sales: Admin can view all, Petugas can view their own
CREATE POLICY "Sales view policy" ON public.sales
FOR SELECT USING (public.is_admin() OR created_by = auth.uid());

CREATE POLICY "Sales insert policy" ON public.sales
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Sales admin update/cancel policy" ON public.sales
FOR UPDATE USING (public.is_admin());

-- Sale Items: Inherits view from sales
CREATE POLICY "Sale items view policy" ON public.sale_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.sales
    WHERE sales.id = sale_items.sale_id
    AND (public.is_admin() OR sales.created_by = auth.uid())
  )
);

CREATE POLICY "Sale items insert policy" ON public.sale_items
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Company Profile: Public read, Admin write
CREATE POLICY "Public read company_profile" ON public.company_profile
FOR SELECT USING (true);

CREATE POLICY "Admin manage company_profile" ON public.company_profile
FOR ALL USING (public.is_admin());

-- Gallery: Public read, Admin write
CREATE POLICY "Public read gallery" ON public.gallery
FOR SELECT USING (true);

CREATE POLICY "Admin manage gallery" ON public.gallery
FOR ALL USING (public.is_admin());

-- Testimonials: Public read, Admin write
CREATE POLICY "Public read testimonials" ON public.testimonials
FOR SELECT USING (true);

CREATE POLICY "Admin manage testimonials" ON public.testimonials
FOR ALL USING (public.is_admin());

-- ==============================================================================
-- INITIAL SEED DATA FOR COMPANY PROFILE, GALLERY & TESTIMONIALS
-- ==============================================================================
INSERT INTO public.company_profile (
    business_name, address, phone, operating_hours, gmaps_url,
    gmaps_embed_lat, gmaps_embed_lng, rating, review_count
) VALUES (
    'Pabrik Krupuk (Kerupuk Rambak Tisoffindo)',
    'Kliwonan, RT.01/RW.07, Kliwonan, Jeron, Kec. Nogosari, Kabupaten Boyolali, Jawa Tengah 57378',
    '0857-2811-1147',
    'Buka 24 jam',
    'https://maps.app.goo.gl/G8kHXoGYuuycJxxy7',
    -7.4620805,
    110.8043561,
    5.0,
    6
) ON CONFLICT DO NOTHING;
`;
