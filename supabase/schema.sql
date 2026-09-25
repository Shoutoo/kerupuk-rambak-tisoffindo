-- ==============================================================================
-- SKEMA LENGKAP DATABASE SUPABASE (POSTGRESQL + RLS + SEED DATA)
-- PROYEK: Pabrik Krupuk (Kerupuk Rambak Tisoffindo) Boyolali
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. TABEL PROFILES (Terkoneksi ke auth.users Supabase)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'petugas' CHECK (role IN ('admin', 'petugas')),
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 3. TABEL PRODUCT_CATEGORIES (Kategori Kerupuk Rambak)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 4. TABEL PRODUCTS (Katalog Kerupuk Rambak & Krecek)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    unit TEXT NOT NULL DEFAULT 'bungkus',
    image_url TEXT,
    stock_qty NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    min_stock NUMERIC(12, 2) NOT NULL DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 5. TABEL STOCK_MOVEMENTS (Riwayat Mutasi Stok Masuk/Keluar)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
    quantity NUMERIC(12, 2) NOT NULL,
    note TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 6. TABEL SALES (Transaksi Penjualan POS Kasir)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no TEXT NOT NULL UNIQUE,
    customer_name TEXT DEFAULT 'Pelanggan Umum',
    total_amount NUMERIC(14, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method TEXT NOT NULL DEFAULT 'Tunai',
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    cancellation_reason TEXT
);

-- ------------------------------------------------------------------------------
-- 7. TABEL SALE_ITEMS (Detail Barang per Transaksi)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    subtotal NUMERIC(14, 2) NOT NULL CHECK (subtotal >= 0)
);

-- ------------------------------------------------------------------------------
-- 8. TABEL ACTIVITY_LOGS (Audit Trail Aktivitas Sistem)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    detail JSONB,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 9. TABEL COMPANY_PROFILE (Profil Pabrik & Kontak Real-Time)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.company_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- ------------------------------------------------------------------------------
-- 10. TABEL GALLERY (Foto Pabrik & Dokumentasi)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ------------------------------------------------------------------------------
-- 11. TABEL TESTIMONIALS (Ulasan & Testimoni Pelanggan)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    content TEXT NOT NULL,
    rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    source TEXT DEFAULT 'Google Maps',
    is_featured BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & HELPER FUNCTIONS
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin' AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, phone, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'petugas'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    TRUE
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- --- RLS POLICIES (Idempotent) ---

DROP POLICY IF EXISTS "Profiles view policy" ON public.profiles;
CREATE POLICY "Profiles view policy" ON public.profiles
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
CREATE POLICY "Profiles update policy" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Public read product_categories" ON public.product_categories;
CREATE POLICY "Public read product_categories" ON public.product_categories
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage product_categories" ON public.product_categories;
CREATE POLICY "Admin manage product_categories" ON public.product_categories
FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public read products" ON public.products;
CREATE POLICY "Public read products" ON public.products
FOR SELECT USING (is_active = TRUE OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin manage products" ON public.products;
CREATE POLICY "Admin manage products" ON public.products
FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Auth view stock movements" ON public.stock_movements;
CREATE POLICY "Auth view stock movements" ON public.stock_movements
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert stock movements" ON public.stock_movements;
CREATE POLICY "Auth insert stock movements" ON public.stock_movements
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Sales view policy" ON public.sales;
CREATE POLICY "Sales view policy" ON public.sales
FOR SELECT TO authenticated
USING (public.is_admin() OR created_by = auth.uid());

DROP POLICY IF EXISTS "Sales insert policy" ON public.sales;
CREATE POLICY "Sales insert policy" ON public.sales
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Sales update policy" ON public.sales;
CREATE POLICY "Sales update policy" ON public.sales
FOR UPDATE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Sale items view policy" ON public.sale_items;
CREATE POLICY "Sale items view policy" ON public.sale_items
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.sales
    WHERE sales.id = sale_items.sale_id
    AND (public.is_admin() OR sales.created_by = auth.uid())
  )
);

DROP POLICY IF EXISTS "Sale items insert policy" ON public.sale_items;
CREATE POLICY "Sale items insert policy" ON public.sale_items
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Logs view policy" ON public.activity_logs;
CREATE POLICY "Logs view policy" ON public.activity_logs
FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Logs insert policy" ON public.activity_logs;
CREATE POLICY "Logs insert policy" ON public.activity_logs
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public read company_profile" ON public.company_profile;
CREATE POLICY "Public read company_profile" ON public.company_profile
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage company_profile" ON public.company_profile;
CREATE POLICY "Admin manage company_profile" ON public.company_profile
FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public read gallery" ON public.gallery;
CREATE POLICY "Public read gallery" ON public.gallery
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage gallery" ON public.gallery;
CREATE POLICY "Admin manage gallery" ON public.gallery
FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Public read testimonials" ON public.testimonials;
CREATE POLICY "Public read testimonials" ON public.testimonials
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage testimonials" ON public.testimonials;
CREATE POLICY "Admin manage testimonials" ON public.testimonials
FOR ALL USING (public.is_admin());

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

INSERT INTO public.product_categories (name, slug) VALUES
('Rambak Sapi Matang', 'rambak-sapi-matang'),
('Rambak Kerbau Matang', 'rambak-kerbau-matang'),
('Rambak Varian Rasa', 'rambak-varian-rasa'),
('Krecek / Mentah Siap Goreng', 'krecek-mentah'),
('Paket Dus & Oleh-Oleh', 'paket-dus')
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
  cat_sapi UUID;
  cat_kerbau UUID;
  cat_rasa UUID;
  cat_krecek UUID;
  cat_dus UUID;
BEGIN
  SELECT id INTO cat_sapi FROM public.product_categories WHERE slug = 'rambak-sapi-matang' LIMIT 1;
  SELECT id INTO cat_kerbau FROM public.product_categories WHERE slug = 'rambak-kerbau-matang' LIMIT 1;
  SELECT id INTO cat_rasa FROM public.product_categories WHERE slug = 'rambak-varian-rasa' LIMIT 1;
  SELECT id INTO cat_krecek FROM public.product_categories WHERE slug = 'krecek-mentah' LIMIT 1;
  SELECT id INTO cat_dus FROM public.product_categories WHERE slug = 'paket-dus' LIMIT 1;

  INSERT INTO public.products (category_id, name, description, price, unit, stock_qty, min_stock, is_active)
  VALUES
    (cat_sapi, 'Kerupuk Rambak Sapi Super Gurih (250g)', 'Kemasan asli Tisoffindo plastik bening berstempel biru. Terbuat dari 100% kulit sapi pilihan Boyolali, digoreng dengan minyak nabati higienis, mekar renyah dan gurih alami.', 38000, 'bungkus', 65, 15, TRUE),
    (cat_sapi, 'Kerupuk Rambak Sapi Kemasan Jumbo (500g)', 'Kemasan ekonomis lebih besar, isi padat kerupuk rambak sapi mekar renyah siap santap. Cocok untuk hidangan hajatan atau stok lauk keluarga.', 72000, 'bungkus', 28, 10, TRUE),
    (cat_kerbau, 'Rambak Kulit Kerbau Asli Istimewa (250g)', 'Rambak kulit kerbau asli dengan ketebalan khas yang lebih mantap, rasa gurih pekat beraroma khas tradisi Boyolali.', 45000, 'bungkus', 12, 10, TRUE),
    (cat_rasa, 'Rambak Sapi Pedas Daun Jeruk (200g)', 'Perpaduan gurih renyahnya rambak sapi dengan racikan cabai asli dan aroma segar daun jeruk purut.', 36000, 'bungkus', 40, 15, TRUE),
    (cat_rasa, 'Rambak Sapi Balado Spesial (200g)', 'Bumbu balado manis pedas khas Nusantara merata di setiap gigitan kerupuk rambak.', 35000, 'bungkus', 8, 10, TRUE),
    (cat_krecek, 'Krecek Kulit Sapi Mentah Siap Goreng (1 Kg)', 'Bahan mentah kerupuk rambak kulit sapi yang sudah dijemur kering terik matahari dengan bumbu rempah alami. Siap langsung digoreng mekar.', 95000, 'kg', 54, 20, TRUE),
    (cat_krecek, 'Krecek Sayur / Sambal Goreng (500g)', 'Potongan krecek kulit sapi khusus untuk olahan kuliner masakan seperti sambal goreng krecek gudeg atau masakan santan.', 55000, 'bungkus', 6, 12, TRUE),
    (cat_dus, 'Paket Dus Oleh-Oleh Istimewa (Isi 6 Pcs)', 'Kemasan kardus jinjing cantik berisi aneka varian kemasan asli kerupuk rambak Tisoffindo. Pilihan oleh-oleh khas Boyolali.', 215000, 'dus', 18, 5, TRUE)
  ON CONFLICT DO NOTHING;
END $$;

INSERT INTO public.company_profile (
    business_name, address, phone, operating_hours, gmaps_url,
    gmaps_embed_lat, gmaps_embed_lng, rating, review_count
) VALUES (
    'Pabrik Krupuk (Kerupuk Rambak Tisoffindo)',
    'Kliwonan, RT.01/RW.07, Kliwonan, Jeron, Kec. Nogosari, Kabupaten Boyolali, Jawa Tengah 57378',
    '0812-3456-7890',
    'Buka 24 jam',
    'https://maps.app.goo.gl/G8kHXoGYuuycJxxy7',
    -7.4620805,
    110.8043561,
    5.0,
    6
) ON CONFLICT DO NOTHING;

INSERT INTO public.testimonials (customer_name, content, rating, source, is_featured) VALUES
('Pelanggan Google Maps', 'Rambak renyah, gurih, dan berkualitas. Sangat cocok untuk lauk makan atau camilan keluarga.', 5, 'Google Maps', TRUE),
('Pengunjung Pabrik Boyolali', 'Rasa istimewa, rambak mantap. Langsung beli di pabriknya di Nogosari Boyolali, masih fresh dan harum.', 5, 'Google Maps', TRUE),
('Mitra Rumah Makan Soto & Rawon', 'Tekstur renyah mekar sempurna, gurihnya pas dan tidak serik di tenggorokan. Pelanggan warung kami sangat suka.', 5, 'Google Maps', TRUE),
('Pembeli Oleh-oleh Khas Boyolali', 'Pelayanan ramah, buka 24 jam jadi fleksibel kalau lewat Boyolali mau mampir borong kerupuk rambak.', 5, 'Google Maps', TRUE)
ON CONFLICT DO NOTHING;
