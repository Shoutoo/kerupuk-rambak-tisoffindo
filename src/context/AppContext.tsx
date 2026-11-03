import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  ProductCategory,
  Product,
  StockMovement,
  Sale,
  SaleItem,
  PaymentMethod,
  ActivityLog,
  CompanyProfile,
  GalleryItem,
  Testimonial,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_SALES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_COMPANY_PROFILE,
  INITIAL_GALLERY,
  INITIAL_TESTIMONIALS,
} from '../data/initialData';
import { getSupabaseClient } from '../utils/supabaseClient';
import { resolveProductImageUrl } from '../utils/productImages';

const isUuid = (value?: string | null): boolean =>
  Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));

interface AppContextType {
  // Navigation & Session
  currentView: string;
  setCurrentView: (view: string) => void;
  currentUser: User | null;
  login: (email: string, password?: string) => Promise<boolean>;
  quickLogin: (role: UserRole) => void;
  logout: () => void;
  users: User[];
  addUser: (userData: Omit<User, 'id' | 'created_at'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;

  // Products & Categories
  products: Product[];
  categories: ProductCategory[];
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Stock
  stockMovements: StockMovement[];
  addStockMovement: (productId: string, type: 'in' | 'adjustment', quantity: number, note: string) => void;
  criticalStockProducts: Product[];

  // Sales & POS
  sales: Sale[];
  createSale: (
    items: { productId: string; quantity: number }[],
    paymentMethod: PaymentMethod,
    customerName?: string,
    cashGiven?: number
  ) => { success: boolean; sale?: Sale; error?: string };
  cancelSale: (saleId: string, reason: string) => boolean;
  activeReceipt: Sale | null;
  setActiveReceipt: (sale: Sale | null) => void;

  // Audit Logs
  activityLogs: ActivityLog[];
  logActivity: (action: string, detail: string) => void;

  // Company Profile & Public Content (FR-Real-Data)
  companyProfile: CompanyProfile;
  updateCompanyProfile: (data: Partial<CompanyProfile>) => void;
  gallery: GalleryItem[];
  addGalleryItem: (item: Omit<GalleryItem, 'id' | 'created_at'>) => void;
  deleteGalleryItem: (id: string) => void;
  testimonials: Testimonial[];
  addTestimonial: (data: Omit<Testimonial, 'id' | 'created_at'>) => void;
  updateTestimonial: (id: string, data: Partial<Testimonial>) => void;
  deleteTestimonial: (id: string) => void;
  toggleTestimonialFeatured: (id: string) => void;

  // Reset & Supabase Migration Tools
  resetToInitialData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'tisoffindo_current_user_v1',
  VIEW: 'tisoffindo_current_view_v1',
  PRODUCTS: 'tisoffindo_products_v2',
  USERS: 'tisoffindo_users_v1',
  SALES: 'tisoffindo_sales_v1',
  MOVEMENTS: 'tisoffindo_stock_movements_v1',
  LOGS: 'tisoffindo_activity_logs_v1',
  CATEGORIES: 'tisoffindo_categories_v1',
  COMPANY_PROFILE: 'tisoffindo_company_profile_v3',
  GALLERY: 'tisoffindo_gallery_v2',
  TESTIMONIALS: 'tisoffindo_testimonials_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current active view
  const [currentView, setCurrentViewState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIEW);
      return saved ? JSON.parse(saved) : 'company_profile';
    } catch {
      return 'company_profile';
    }
  });

  const setCurrentView = (view: string) => {
    setCurrentViewState(view);
    try {
      localStorage.setItem(STORAGE_KEYS.VIEW, JSON.stringify(view));
    } catch {
      // ignore
    }
  };

  // Active Receipt Modal
  const [activeReceipt, setActiveReceipt] = useState<Sale | null>(null);

  // Current Logged-in User
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Users
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Categories
  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // Sales
  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SALES);
      if (!saved) return INITIAL_SALES;
      const parsed: Sale[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // If all saved sales are older than 7 days, refresh with dynamic INITIAL_SALES so the dashboard graph stays active
        const hasRecentSale = parsed.some((s) => {
          const diffDays = (Date.now() - new Date(s.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return diffDays <= 7;
        });
        if (!hasRecentSale) {
          localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
          return INITIAL_SALES;
        }
        return parsed;
      }
      return INITIAL_SALES;
    } catch {
      return INITIAL_SALES;
    }
  });

  // Stock Movements
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      return saved ? JSON.parse(saved) : INITIAL_STOCK_MOVEMENTS;
    } catch {
      return INITIAL_STOCK_MOVEMENTS;
    }
  });

  // Activity Logs
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
    } catch {
      return INITIAL_ACTIVITY_LOGS;
    }
  });

  // Company Profile (FR-Real-Data)
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPANY_PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_COMPANY_PROFILE;
    } catch {
      return INITIAL_COMPANY_PROFILE;
    }
  });

  // Gallery (FR-Real-Data)
  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GALLERY);
      return saved ? JSON.parse(saved) : INITIAL_GALLERY;
    } catch {
      return INITIAL_GALLERY;
    }
  });

  // Testimonials (FR-Real-Data)
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
      return saved ? JSON.parse(saved) : INITIAL_TESTIMONIALS;
    } catch {
      return INITIAL_TESTIMONIALS;
    }
  });

  // Persist state updates to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANY_PROFILE, JSON.stringify(companyProfile));
  }, [companyProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  // Helper: fetch authenticated internal data when a real Supabase Auth session is active
  const fetchAuthenticatedSupabaseData = async () => {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      const { data: sessionData } = await client.auth.getSession();
      if (!sessionData.session?.user) return;

      const [salesRes, movRes, logsRes] = await Promise.all([
        client
          .from('sales')
          .select('*, sale_items(*, products(name, unit)), profiles(full_name, role)')
          .order('created_at', { ascending: false })
          .limit(200),
        client
          .from('stock_movements')
          .select('*, products(name), profiles(full_name)')
          .order('created_at', { ascending: false })
          .limit(200),
        client
          .from('activity_logs')
          .select('*, profiles(full_name, role)')
          .order('created_at', { ascending: false })
          .limit(200),
      ]);

      if (!salesRes.error && salesRes.data && salesRes.data.length > 0) {
        const mappedSales: Sale[] = salesRes.data.map((s: any) => ({
          id: s.id,
          invoice_no: s.invoice_no,
          customer_name: s.customer_name || 'Pelanggan Umum',
          total_amount: Number(s.total_amount),
          payment_method: (s.payment_method || 'Tunai') as PaymentMethod,
          status: (s.status || 'completed') as Sale['status'],
          created_by_id: s.created_by || '',
          created_by_name: s.profiles?.full_name || 'Staf Tisoffindo',
          created_by_role: (s.profiles?.role === 'admin' ? 'admin' : 'petugas') as UserRole,
          created_at: s.created_at || new Date().toISOString(),
          cancellation_reason: s.cancellation_reason || undefined,
          items: Array.isArray(s.sale_items)
            ? s.sale_items.map((si: any) => ({
                id: si.id,
                product_id: si.product_id,
                product_name: si.products?.name || 'Produk',
                unit: si.products?.unit || 'bungkus',
                quantity: Number(si.quantity),
                price: Number(si.price),
                subtotal: Number(si.subtotal),
              }))
            : [],
        }));
        setSales(mappedSales);
      }

      if (!movRes.error && movRes.data && movRes.data.length > 0) {
        const mappedMov: StockMovement[] = movRes.data.map((m: any) => ({
          id: m.id,
          product_id: m.product_id,
          product_name: m.products?.name || 'Produk',
          type: m.type,
          quantity: Number(m.quantity),
          note: m.note || '',
          created_by_name: m.profiles?.full_name || 'Staf Tisoffindo',
          created_by_id: m.created_by || '',
          created_at: m.created_at || new Date().toISOString(),
        }));
        setStockMovements(mappedMov);
      }

      if (!logsRes.error && logsRes.data && logsRes.data.length > 0) {
        const mappedLogs: ActivityLog[] = logsRes.data.map((l: any) => ({
          id: l.id,
          user_id: l.user_id || 'system',
          user_name: l.profiles
            ? `${l.profiles.full_name} (${l.profiles.role})`
            : 'Sistem',
          action: l.action,
          detail: typeof l.detail === 'string' ? l.detail : l.detail?.message || JSON.stringify(l.detail || ''),
          created_at: l.created_at || new Date().toISOString(),
        }));
        setActivityLogs(mappedLogs);
      }
    } catch (err) {
      console.warn('Authenticated Supabase sync skipped:', err);
    }
  };

  // Live Sync with Supabase on mount + Realtime subscription
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) return;

    const fetchLiveSupabaseData = async () => {
      try {
        const [cpRes, catRes, prodRes, testiRes, galRes] = await Promise.all([
          client.from('company_profile').select('*').limit(1).maybeSingle(),
          client.from('product_categories').select('*').order('created_at', { ascending: true }),
          client.from('products').select('*, product_categories(name)').order('name', { ascending: true }),
          client.from('testimonials').select('*').order('created_at', { ascending: false }),
          client.from('gallery').select('*').order('created_at', { ascending: false }),
        ]);

        // 1. Sync Company Profile
        if (!cpRes.error && cpRes.data) {
          const cpData = cpRes.data;
          setCompanyProfile((prev) => ({
            ...prev,
            id: cpData.id || prev.id,
            business_name: cpData.business_name || prev.business_name,
            address: cpData.address || prev.address,
            phone: cpData.phone || prev.phone,
            operating_hours: cpData.operating_hours || prev.operating_hours,
            gmaps_url: cpData.gmaps_url || prev.gmaps_url,
            gmaps_embed_lat: Number(cpData.gmaps_embed_lat) || prev.gmaps_embed_lat,
            gmaps_embed_lng: Number(cpData.gmaps_embed_lng) || prev.gmaps_embed_lng,
            rating: Number(cpData.rating) || prev.rating,
            review_count: Number(cpData.review_count) || prev.review_count,
            updated_at: cpData.updated_at || prev.updated_at,
          }));
        }

        // 2. Sync Product Categories
        if (!catRes.error && catRes.data && catRes.data.length > 0) {
          setCategories(
            catRes.data.map((c: any) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
            }))
          );
        }

        // 3. Sync Products
        if (!prodRes.error && prodRes.data && prodRes.data.length > 0) {
          const mapped: Product[] = prodRes.data.map((item: any) => ({
            id: item.id,
            category_id: item.category_id || '',
            category_name: item.product_categories?.name || 'Umum',
            name: item.name,
            description: item.description || '',
            price: Number(item.price),
            unit: (item.unit || 'bungkus') as Product['unit'],
            image_url: resolveProductImageUrl(item.image_url, item.name, item.product_categories?.name),
            stock_qty: Number(item.stock_qty),
            min_stock: Number(item.min_stock),
            is_active: item.is_active ?? true,
            created_at: item.created_at || new Date().toISOString(),
          }));
          setProducts(mapped);
        }

        // 4. Sync Testimonials
        if (!testiRes.error && testiRes.data && testiRes.data.length > 0) {
          setTestimonials(
            testiRes.data.map((t: any) => ({
              id: t.id,
              customer_name: t.customer_name,
              content: t.content,
              rating: Number(t.rating) || 5,
              source: t.source || 'Google Maps',
              is_featured: t.is_featured ?? true,
              created_at: t.created_at || new Date().toISOString(),
            }))
          );
        }

        // 5. Sync Gallery (only overwrite demo gallery when Supabase has gallery rows)
        if (!galRes.error && galRes.data && galRes.data.length > 0) {
          setGallery(
            galRes.data.map((g: any) => ({
              id: g.id,
              image_url: g.image_url,
              caption: g.caption || '',
              created_at: g.created_at || new Date().toISOString(),
            }))
          );
        }
      } catch (err) {
        console.warn('Supabase fetch failed silently, fallback to local storage:', err);
      }
    };

    fetchLiveSupabaseData();
    fetchAuthenticatedSupabaseData();

    // Realtime subscription for live updates from Supabase
    const channel = client
      .channel('tisoffindo-live-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchLiveSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'company_profile' }, () => {
        fetchLiveSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_categories' }, () => {
        fetchLiveSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'testimonials' }, () => {
        fetchLiveSupabaseData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, () => {
        fetchLiveSupabaseData();
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  // Log activity helper (+ background Supabase audit log if authenticated)
  const logActivity = (action: string, detail: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      user_id: currentUser ? currentUser.id : 'guest',
      user_name: currentUser ? `${currentUser.full_name} (${currentUser.role})` : 'Tamu / Sistem',
      action,
      detail,
      created_at: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    const client = getSupabaseClient();
    if (client) {
      client.auth.getSession().then(({ data }) => {
        const authUid = data.session?.user?.id;
        if (authUid) {
          client
            .from('activity_logs')
            .insert({ user_id: authUid, action, detail: { message: detail } })
            .then(() => {});
        }
      });
    }
  };

  // Auth: Login (Supabase Auth first when password provided, fallback to local demo users)
  const login = async (email: string, password?: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const client = getSupabaseClient();

    if (client && password) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (!error && data.user) {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profile && profile.is_active === false) {
            await client.auth.signOut();
            alert('Akun ini telah dinonaktifkan oleh Admin. Silakan hubungi pengelola.');
            return false;
          }

          const authedUser: User = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            full_name:
              profile?.full_name ||
              data.user.user_metadata?.full_name ||
              cleanEmail.split('@')[0],
            role: profile?.role === 'admin' ? 'admin' : 'petugas',
            phone: profile?.phone || '',
            is_active: true,
            created_at: profile?.created_at || data.user.created_at || new Date().toISOString(),
          };

          setCurrentUser(authedUser);
          setCurrentView('dashboard');
          logActivity('LOGIN', `User ${authedUser.full_name} (${authedUser.role}) masuk via Supabase Auth`);
          await fetchAuthenticatedSupabaseData();
          return true;
        }
      } catch {
        // Fallback to local users below
      }
    }

    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (found) {
      if (!found.is_active) {
        alert('Akun ini telah dinonaktifkan oleh Admin. Silakan hubungi pengelola.');
        return false;
      }
      setCurrentUser(found);
      setCurrentView('dashboard');
      logActivity('LOGIN', `User ${found.full_name} (${found.role}) masuk`);
      return true;
    }
    return false;
  };

  // Auth: Quick Login for demoing & testing
  const quickLogin = (role: UserRole) => {
    const matched = users.find((u) => u.role === role && u.is_active);
    if (matched) {
      setCurrentUser(matched);
      setCurrentView('dashboard');
      logActivity('LOGIN', `Login cepat sebagai ${matched.full_name} (${matched.role})`);
    }
  };

  // Auth: Logout
  const logout = () => {
    if (currentUser) {
      logActivity('LOGOUT', `User ${currentUser.full_name} keluar`);
    }
    getSupabaseClient()?.auth.signOut().catch(() => {});
    setCurrentUser(null);
    setCurrentView('company_profile');
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.setItem(STORAGE_KEYS.VIEW, JSON.stringify('company_profile'));
    } catch {
      // ignore
    }
  };

  const resolveSupabaseCategoryId = (categoryId?: string, categoryName?: string): string | null => {
    if (isUuid(categoryId)) return categoryId!;
    const matched = categories.find(
      (c) =>
        c.id === categoryId ||
        (categoryName && c.name.toLowerCase().trim() === categoryName.toLowerCase().trim())
    );
    return matched && isUuid(matched.id) ? matched.id : null;
  };

  // Product Management (Admin)
  const addProduct = (data: Omit<Product, 'id' | 'created_at'>) => {
    const cat = categories.find((c) => c.id === data.category_id);
    const tempId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...data,
      id: tempId,
      category_name: cat ? cat.name : 'Rambak Sapi',
      created_at: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    logActivity('TAMBAH_PRODUK', `Menambahkan produk baru: ${newProduct.name}`);

    if (data.stock_qty > 0 && currentUser) {
      const movement: StockMovement = {
        id: `mov-${Date.now()}`,
        product_id: newProduct.id,
        product_name: newProduct.name,
        type: 'in',
        quantity: data.stock_qty,
        note: 'Stok awal produk baru',
        created_by_name: currentUser.full_name,
        created_by_id: currentUser.id,
        created_at: new Date().toISOString(),
      };
      setStockMovements((prev) => [movement, ...prev]);
    }

    const client = getSupabaseClient();
    if (client) {
      client.auth.getSession().then(async ({ data: sessionData }) => {
        const authUid = sessionData.session?.user?.id;
        if (!authUid) return;
        const dbCategoryId = resolveSupabaseCategoryId(data.category_id, cat?.name);
        const { data: inserted } = await client
          .from('products')
          .insert({
            category_id: dbCategoryId,
            name: data.name,
            description: data.description,
            price: data.price,
            unit: data.unit,
            image_url: data.image_url,
            stock_qty: data.stock_qty,
            min_stock: data.min_stock,
            is_active: data.is_active,
          })
          .select('id, created_at')
          .maybeSingle();

        if (inserted?.id) {
          setProducts((prev) =>
            prev.map((p) => (p.id === tempId ? { ...p, id: inserted.id, created_at: inserted.created_at } : p))
          );
          if (data.stock_qty > 0) {
            await client.from('stock_movements').insert({
              product_id: inserted.id,
              type: 'in',
              quantity: data.stock_qty,
              note: 'Stok awal produk baru',
              created_by: authUid,
            });
          }
        }
      });
    }
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    const updatedCat = data.category_id
      ? categories.find((c) => c.id === data.category_id)?.name
      : undefined;

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, ...data, category_name: updatedCat || p.category_name };
        }
        return p;
      })
    );
    logActivity('UBAH_PRODUK', `Memperbarui data produk ID: ${id}`);

    const client = getSupabaseClient();
    if (client && isUuid(id)) {
      client.auth.getSession().then(async ({ data: sessionData }) => {
        if (!sessionData.session?.user) return;
        const payload: Record<string, unknown> = {};
        if (data.name !== undefined) payload.name = data.name;
        if (data.description !== undefined) payload.description = data.description;
        if (data.price !== undefined) payload.price = data.price;
        if (data.unit !== undefined) payload.unit = data.unit;
        if (data.image_url !== undefined) payload.image_url = data.image_url;
        if (data.stock_qty !== undefined) payload.stock_qty = data.stock_qty;
        if (data.min_stock !== undefined) payload.min_stock = data.min_stock;
        if (data.is_active !== undefined) payload.is_active = data.is_active;
        if (data.category_id !== undefined) {
          payload.category_id = resolveSupabaseCategoryId(data.category_id, updatedCat);
        }
        await client.from('products').update(payload).eq('id', id);
      });
    }
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (target) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      logActivity('HAPUS_PRODUK', `Menghapus produk: ${target.name}`);

      const client = getSupabaseClient();
      if (client && isUuid(id)) {
        client.auth.getSession().then(async ({ data: sessionData }) => {
          if (!sessionData.session?.user) return;
          await client.from('products').delete().eq('id', id);
        });
      }
    }
  };

  // Stock Management (Admin)
  const addStockMovement = (
    productId: string,
    type: 'in' | 'adjustment',
    quantity: number,
    note: string
  ) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod || !currentUser) return;

    const qtyChange = type === 'in' ? Math.abs(quantity) : quantity;
    const newStock = Math.max(0, prod.stock_qty + qtyChange);

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock_qty: newStock } : p))
    );

    const movement: StockMovement = {
      id: `mov-${Date.now()}`,
      product_id: productId,
      product_name: prod.name,
      type,
      quantity: qtyChange,
      note,
      created_by_name: currentUser.full_name,
      created_by_id: currentUser.id,
      created_at: new Date().toISOString(),
    };

    setStockMovements((prev) => [movement, ...prev]);
    logActivity(
      type === 'in' ? 'STOK_MASUK' : 'PENYESUAIAN_STOK',
      `${type === 'in' ? 'Stok masuk +' : 'Penyesuaian '}${qtyChange} ${prod.unit} pada ${prod.name} (${note})`
    );

    const client = getSupabaseClient();
    if (client && isUuid(productId)) {
      client.auth.getSession().then(async ({ data: sessionData }) => {
        const authUid = sessionData.session?.user?.id;
        if (!authUid) return;
        await Promise.all([
          client.from('products').update({ stock_qty: newStock }).eq('id', productId),
          client.from('stock_movements').insert({
            product_id: productId,
            type,
            quantity: qtyChange,
            note,
            created_by: authUid,
          }),
        ]);
      });
    }
  };

  // Sales Transaction (POS) - Accessible to both Admin & Petugas
  const createSale = (
    itemsList: { productId: string; quantity: number }[],
    paymentMethod: PaymentMethod,
    customerName?: string,
    cashGiven?: number
  ): { success: boolean; sale?: Sale; error?: string } => {
    if (!currentUser) {
      return { success: false, error: 'Sesi login telah berakhir' };
    }
    if (itemsList.length === 0) {
      return { success: false, error: 'Keranjang belanja masih kosong' };
    }

    // Verify stock availability
    for (const item of itemsList) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `Produk tidak ditemukan` };
      }
      if (prod.stock_qty < item.quantity) {
        return {
          success: false,
          error: `Stok ${prod.name} tidak mencukupi (sisa ${prod.stock_qty} ${prod.unit})`,
        };
      }
    }

    // Construct sale items & total
    const saleItems: SaleItem[] = [];
    let grandTotal = 0;

    for (const item of itemsList) {
      const prod = products.find((p) => p.id === item.productId)!;
      const subtotal = prod.price * item.quantity;
      grandTotal += subtotal;

      saleItems.push({
        id: `sitem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        product_id: prod.id,
        product_name: prod.name,
        unit: prod.unit,
        quantity: item.quantity,
        price: prod.price,
        subtotal,
      });
    }

    // Cash change computation
    let cashChange: number | undefined = undefined;
    if (paymentMethod === 'Tunai') {
      if (cashGiven !== undefined && cashGiven < grandTotal) {
        return { success: false, error: 'Uang tunai yang diterima kurang dari total belanja' };
      }
      cashChange = cashGiven !== undefined ? cashGiven - grandTotal : 0;
    }

    // Generate Invoice Number: INV-YYYYMMDD-COUNT
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const todaySalesCount =
      sales.filter((s) => s.created_at.startsWith(new Date().toISOString().slice(0, 10))).length + 1;
    const invoiceNo = `INV-${todayStr}-${String(todaySalesCount).padStart(3, '0')}`;

    const tempSaleId = `sale-${Date.now()}`;
    const newSale: Sale = {
      id: tempSaleId,
      invoice_no: invoiceNo,
      customer_name: customerName?.trim() || 'Pelanggan Umum',
      total_amount: grandTotal,
      payment_method: paymentMethod,
      cash_given: cashGiven,
      cash_change: cashChange,
      status: 'completed',
      created_by_id: currentUser.id,
      created_by_name: currentUser.full_name,
      created_by_role: currentUser.role,
      created_at: new Date().toISOString(),
      items: saleItems,
    };

    const nextStocks = new Map<string, number>();
    setProducts((prev) =>
      prev.map((p) => {
        const bought = itemsList.find((i) => i.productId === p.id);
        if (bought) {
          const updatedStock = Math.max(0, p.stock_qty - bought.quantity);
          nextStocks.set(p.id, updatedStock);
          return { ...p, stock_qty: updatedStock };
        }
        return p;
      })
    );

    const newMovements: StockMovement[] = saleItems.map((si) => ({
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      product_id: si.product_id,
      product_name: si.product_name,
      type: 'out',
      quantity: si.quantity,
      note: `Otomatis dari penjualan ${invoiceNo}`,
      created_by_name: currentUser.full_name,
      created_by_id: currentUser.id,
      created_at: new Date().toISOString(),
    }));

    setStockMovements((prev) => [...newMovements, ...prev]);
    setSales((prev) => [newSale, ...prev]);
    setActiveReceipt(newSale);

    logActivity(
      'TRANSAKSI_PENJUALAN',
      `Penjualan ${invoiceNo} berhasil dicatat senilai Rp ${grandTotal.toLocaleString('id-ID')} (${newSale.customer_name})`
    );

    const client = getSupabaseClient();
    if (client && saleItems.every((si) => isUuid(si.product_id))) {
      client.auth.getSession().then(async ({ data: sessionData }) => {
        const authUid = sessionData.session?.user?.id;
        if (!authUid) return;

        const { data: insertedSale } = await client
          .from('sales')
          .insert({
            invoice_no: invoiceNo,
            customer_name: newSale.customer_name,
            total_amount: grandTotal,
            payment_method: paymentMethod,
            status: 'completed',
            created_by: authUid,
          })
          .select('id')
          .maybeSingle();

        if (insertedSale?.id) {
          setSales((prev) =>
            prev.map((s) => (s.id === tempSaleId ? { ...s, id: insertedSale.id } : s))
          );

          await Promise.all([
            client.from('sale_items').insert(
              saleItems.map((si) => ({
                sale_id: insertedSale.id,
                product_id: si.product_id,
                quantity: si.quantity,
                price: si.price,
                subtotal: si.subtotal,
              }))
            ),
            client.from('stock_movements').insert(
              saleItems.map((si) => ({
                product_id: si.product_id,
                type: 'out',
                quantity: si.quantity,
                note: `Otomatis dari penjualan ${invoiceNo}`,
                created_by: authUid,
              }))
            ),
            ...Array.from(nextStocks.entries()).map(([prodId, qty]) =>
              client.from('products').update({ stock_qty: qty }).eq('id', prodId)
            ),
          ]);
        }
      });
    }

    return { success: true, sale: newSale };
  };

  // Cancel Sale (Admin only per PRD FR-23)
  const cancelSale = (saleId: string, reason: string): boolean => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale || sale.status === 'cancelled' || !currentUser) return false;

    const restoredStocks = new Map<string, number>();
    setProducts((prev) =>
      prev.map((p) => {
        const item = sale.items.find((si) => si.product_id === p.id);
        if (item) {
          const restored = p.stock_qty + item.quantity;
          restoredStocks.set(p.id, restored);
          return { ...p, stock_qty: restored };
        }
        return p;
      })
    );

    const restoreMovements: StockMovement[] = sale.items.map((si) => ({
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      product_id: si.product_id,
      product_name: si.product_name,
      type: 'in',
      quantity: si.quantity,
      note: `Pengembalian stok pembatalan transaksi ${sale.invoice_no}: ${reason}`,
      created_by_name: currentUser.full_name,
      created_by_id: currentUser.id,
      created_at: new Date().toISOString(),
    }));

    setStockMovements((prev) => [...restoreMovements, ...prev]);

    setSales((prev) =>
      prev.map((s) =>
        s.id === saleId
          ? {
              ...s,
              status: 'cancelled',
              cancellation_reason: reason,
            }
          : s
      )
    );

    logActivity(
      'BATALKAN_TRANSAKSI',
      `Pembatalan transaksi ${sale.invoice_no} oleh ${currentUser.full_name}. Alasan: ${reason}`
    );

    const client = getSupabaseClient();
    if (client && isUuid(saleId)) {
      client.auth.getSession().then(async ({ data: sessionData }) => {
        const authUid = sessionData.session?.user?.id;
        if (!authUid) return;
        await Promise.all([
          client
            .from('sales')
            .update({ status: 'cancelled', cancellation_reason: reason })
            .eq('id', saleId),
          client.from('stock_movements').insert(
            sale.items
              .filter((si) => isUuid(si.product_id))
              .map((si) => ({
                product_id: si.product_id,
                type: 'in',
                quantity: si.quantity,
                note: `Pengembalian stok pembatalan transaksi ${sale.invoice_no}: ${reason}`,
                created_by: authUid,
              }))
          ),
          ...Array.from(restoredStocks.entries())
            .filter(([prodId]) => isUuid(prodId))
            .map(([prodId, qty]) =>
              client.from('products').update({ stock_qty: qty }).eq('id', prodId)
            ),
        ]);
      });
    }

    return true;
  };

  // User Management (Admin Only)
  const addUser = (userData: Omit<User, 'id' | 'created_at'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    logActivity('TAMBAH_USER', `Menambahkan user baru: ${newUser.full_name} (${newUser.role})`);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...userData } : u)));
    logActivity('UBAH_USER', `Memperbarui data user ID: ${id}`);

    const client = getSupabaseClient();
    if (client && isUuid(id)) {
      client.auth.getSession().then(async ({ data: sessionData }) => {
        if (!sessionData.session?.user) return;
        const payload: Record<string, unknown> = {};
        if (userData.full_name !== undefined) payload.full_name = userData.full_name;
        if (userData.role !== undefined) payload.role = userData.role;
        if (userData.phone !== undefined) payload.phone = userData.phone;
        if (userData.is_active !== undefined) payload.is_active = userData.is_active;
        await client.from('profiles').update(payload).eq('id', id);
      });
    }
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const nextState = !u.is_active;
          logActivity(
            'STATUS_USER',
            `Mengubah status user ${u.full_name} menjadi ${nextState ? 'Aktif' : 'Nonaktif'}`
          );
          const client = getSupabaseClient();
          if (client && isUuid(id)) {
            client.auth.getSession().then(async ({ data: sessionData }) => {
              if (!sessionData.session?.user) return;
              await client.from('profiles').update({ is_active: nextState }).eq('id', id);
            });
          }
          return { ...u, is_active: nextState };
        }
        return u;
      })
    );
  };

  // Critical stock list
  const criticalStockProducts = products.filter((p) => p.is_active && p.stock_qty <= p.min_stock);

  // Company Profile Handlers (FR-Real-Data)
  const updateCompanyProfile = (data: Partial<CompanyProfile>) => {
    const nextTimestamp = new Date().toISOString();
    setCompanyProfile((prev) => {
      const updated = { ...prev, ...data, updated_at: nextTimestamp };
      logActivity(
        'UPDATE_PROFIL_USAHA',
        `Memperbarui profil usaha: ${data.business_name || prev.business_name}`
      );

      const client = getSupabaseClient();
      if (client && isUuid(updated.id)) {
        client.auth.getSession().then(async ({ data: sessionData }) => {
          if (!sessionData.session?.user) return;
          await client
            .from('company_profile')
            .update({
              business_name: updated.business_name,
              address: updated.address,
              phone: updated.phone,
              operating_hours: updated.operating_hours,
              gmaps_url: updated.gmaps_url,
              gmaps_embed_lat: updated.gmaps_embed_lat,
              gmaps_embed_lng: updated.gmaps_embed_lng,
              rating: updated.rating,
              review_count: updated.review_count,
              updated_at: nextTimestamp,
            })
            .eq('id', updated.id);
        });
      }

      return updated;
    });
  };

  // Gallery Handlers (FR-Real-Data)
  const addGalleryItem = (item: Omit<GalleryItem, 'id' | 'created_at'>) => {
    const tempId = `gal-${Date.now()}`;
    const newItem: GalleryItem = {
      id: tempId,
      image_url: item.image_url,
      caption: item.caption,
      created_at: new Date().toISOString(),
    };
    setGallery((prev) => [newItem, ...prev]);
    logActivity('TAMBAH_FOTO_GALERI', `Menambahkan foto galeri: ${item.caption || 'Foto baru'}`);

    const client = getSupabaseClient();
    if (client) {
      client.auth.getSession().then(async ({ data: sessionData }) => {
        if (!sessionData.session?.user) return;
        const { data: inserted } = await client
          .from('gallery')
          .insert({ image_url: item.image_url, caption: item.caption })
          .select('id, created_at')
          .maybeSingle();
        if (inserted?.id) {
          setGallery((prev) =>
            prev.map((g) => (g.id === tempId ? { ...g, id: inserted.id, created_at: inserted.created_at } : g))
          );
        }
      });
    }
  };

  const deleteGalleryItem = (id: string) => {
    setGallery((prev) => prev.filter((g) => g.id !== id));
    logActivity('HAPUS_FOTO_GALERI', `Menghapus foto galeri ID: ${id}`);

    const client = getSupabaseClient();
    if (client && isUuid(id)) {
      client.auth.getSession().then(async ({ data: sessionData }) => {
        if (!sessionData.session?.user) return;
        await client.from('gallery').delete().eq('id', id);
      });
    }
  };

  // Testimonial Handlers (FR-Real-Data)
  const addTestimonial = (data: Omit<Testimonial, 'id' | 'created_at'>) => {
    const tempId = `testi-${Date.now()}`;
    const newTesti: Testimonial = {
      id: tempId,
      customer_name: data.customer_name,
      content: data.content,
      rating: data.rating,
      source: data.source || 'Google Maps',
      is_featured: data.is_featured ?? true,
      created_at: new Date().toISOString(),
    };
    setTestimonials((prev) => [newTesti, ...prev]);
    logActivity('TAMBAH_TESTIMONI', `Menambahkan ulasan dari ${data.customer_name}`);

    const client = getSupabaseClient();
    if (client) {
      client.auth.getSession().then(async ({ data: sessionData }) => {
        if (!sessionData.session?.user) return;
        const { data: inserted } = await client
          .from('testimonials')
          .insert({
            customer_name: data.customer_name,
            content: data.content,
            rating: data.rating,
            source: data.source || 'Google Maps',
            is_featured: data.is_featured ?? true,
          })
          .select('id, created_at')
          .maybeSingle();
        if (inserted?.id) {
          setTestimonials((prev) =>
            prev.map((t) => (t.id === tempId ? { ...t, id: inserted.id, created_at: inserted.created_at } : t))
          );
        }
      });
    }
  };

  const updateTestimonial = (id: string, data: Partial<Testimonial>) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
    logActivity('UPDATE_TESTIMONI', `Memperbarui ulasan ID: ${id}`);

    const client = getSupabaseClient();
    if (client && isUuid(id)) {
      client.auth.getSession().then(async ({ data: sessionData }) => {
        if (!sessionData.session?.user) return;
        await client.from('testimonials').update(data).eq('id', id);
      });
    }
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    logActivity('HAPUS_TESTIMONI', `Menghapus ulasan ID: ${id}`);

    const client = getSupabaseClient();
    if (client && isUuid(id)) {
      client.auth.getSession().then(async ({ data: sessionData }) => {
        if (!sessionData.session?.user) return;
        await client.from('testimonials').delete().eq('id', id);
      });
    }
  };

  const toggleTestimonialFeatured = (id: string) => {
    setTestimonials((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextFeatured = !t.is_featured;
          const client = getSupabaseClient();
          if (client && isUuid(id)) {
            client.auth.getSession().then(async ({ data: sessionData }) => {
              if (!sessionData.session?.user) return;
              await client.from('testimonials').update({ is_featured: nextFeatured }).eq('id', id);
            });
          }
          return { ...t, is_featured: nextFeatured };
        }
        return t;
      })
    );
  };

  // Reset demo data helper
  const resetToInitialData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setUsers(INITIAL_USERS);
    setSales(INITIAL_SALES);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setCompanyProfile(INITIAL_COMPANY_PROFILE);
    setGallery(INITIAL_GALLERY);
    setTestimonials(INITIAL_TESTIMONIALS);
    localStorage.clear();
    logActivity('RESET_SISTEM', 'Database lokal dikembalikan ke data awal demo');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        currentUser,
        login,
        quickLogin,
        logout,
        users,
        addUser,
        updateUser,
        toggleUserStatus,
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        stockMovements,
        addStockMovement,
        criticalStockProducts,
        sales,
        createSale,
        cancelSale,
        activeReceipt,
        setActiveReceipt,
        activityLogs,
        logActivity,
        companyProfile,
        updateCompanyProfile,
        gallery,
        addGalleryItem,
        deleteGalleryItem,
        testimonials,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        toggleTestimonialFeatured,
        resetToInitialData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
