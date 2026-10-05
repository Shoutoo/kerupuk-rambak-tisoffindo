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

interface AppContextType {
  // Navigation & Session
  currentView: string;
  setCurrentView: (view: string) => void;
  currentUser: User | null;
  login: (email: string, role?: UserRole) => boolean;
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
  const [categories] = useState<ProductCategory[]>(() => {
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
      return saved ? JSON.parse(saved) : INITIAL_SALES;
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

  // Live Sync with Supabase on mount
  useEffect(() => {
    const fetchLiveSupabaseData = async () => {
      const client = getSupabaseClient();
      if (!client) return;

      try {
        // 1. Fetch Company Profile
        const { data: cpData, error: cpErr } = await client
          .from('company_profile')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (!cpErr && cpData) {
          setCompanyProfile((prev) => ({
            ...prev,
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

        // 2. Fetch Products
        const { data: prodData, error: prodErr } = await client
          .from('products')
          .select('*, product_categories(name)')
          .order('name', { ascending: true });

        if (!prodErr && prodData && prodData.length > 0) {
          const mapped: Product[] = prodData.map((item: any) => ({
            id: item.id,
            category_id: item.category_id || '',
            category_name: item.product_categories?.name || 'Umum',
            name: item.name,
            description: item.description || '',
            price: Number(item.price),
            unit: (item.unit || 'bungkus') as any,
            image_url: resolveProductImageUrl(item.image_url, item.name, item.product_categories?.name),
            stock_qty: Number(item.stock_qty),
            min_stock: Number(item.min_stock),
            is_active: item.is_active ?? true,
            created_at: item.created_at || new Date().toISOString(),
          }));
          setProducts(mapped);
        }

        // 3. Fetch Testimonials
        const { data: testiData, error: testiErr } = await client
          .from('testimonials')
          .select('*')
          .order('created_at', { ascending: false });

        if (!testiErr && testiData && testiData.length > 0) {
          setTestimonials(
            testiData.map((t: any) => ({
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
      } catch (err) {
        console.warn('Supabase fetch failed silently, fallback to local storage:', err);
      }
    };

    fetchLiveSupabaseData();
  }, []);

  // Log activity helper
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
  };

  // Auth: Login
  const login = (email: string): boolean => {
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
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
    setCurrentUser(null);
    setCurrentView('company_profile');
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.setItem(STORAGE_KEYS.VIEW, JSON.stringify('company_profile'));
    } catch {
      // ignore
    }
  };

  // Product Management (Admin)
  const addProduct = (data: Omit<Product, 'id' | 'created_at'>) => {
    const cat = categories.find((c) => c.id === data.category_id);
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      category_name: cat ? cat.name : 'Rambak Sapi',
      created_at: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    logActivity('TAMBAH_PRODUK', `Menambahkan produk baru: ${newProduct.name}`);

    // If initial stock > 0, log stock movement
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
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updatedCat = data.category_id
            ? categories.find((c) => c.id === data.category_id)?.name
            : p.category_name;
          return { ...p, ...data, category_name: updatedCat || p.category_name };
        }
        return p;
      })
    );
    logActivity('UBAH_PRODUK', `Memperbarui data produk ID: ${id}`);
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    if (target) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      logActivity('HAPUS_PRODUK', `Menghapus produk: ${target.name}`);
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

    // Calculate new stock
    const qtyChange = type === 'in' ? Math.abs(quantity) : quantity; // adjustment can be positive or negative
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
    const todaySalesCount = sales.filter((s) => s.created_at.startsWith(new Date().toISOString().slice(0, 10))).length + 1;
    const invoiceNo = `INV-${todayStr}-${String(todaySalesCount).padStart(3, '0')}`;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
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

    // Deduct stock for each product
    setProducts((prev) =>
      prev.map((p) => {
        const bought = itemsList.find((i) => i.productId === p.id);
        if (bought) {
          return { ...p, stock_qty: Math.max(0, p.stock_qty - bought.quantity) };
        }
        return p;
      })
    );

    // Record stock movements for audit
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

    return { success: true, sale: newSale };
  };

  // Cancel Sale (Admin only per PRD FR-23)
  const cancelSale = (saleId: string, reason: string): boolean => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale || sale.status === 'cancelled' || !currentUser) return false;

    // Restore stock
    setProducts((prev) =>
      prev.map((p) => {
        const item = sale.items.find((si) => si.product_id === p.id);
        if (item) {
          return { ...p, stock_qty: p.stock_qty + item.quantity };
        }
        return p;
      })
    );

    // Record restitution movement
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

    // Mark sale as cancelled
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
    setCompanyProfile((prev) => {
      const updated = { ...prev, ...data, updated_at: new Date().toISOString() };
      logActivity(
        'UPDATE_PROFIL_USAHA',
        `Memperbarui profil usaha: ${data.business_name || prev.business_name}`
      );
      return updated;
    });
  };

  // Gallery Handlers (FR-Real-Data)
  const addGalleryItem = (item: Omit<GalleryItem, 'id' | 'created_at'>) => {
    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      image_url: item.image_url,
      caption: item.caption,
      created_at: new Date().toISOString(),
    };
    setGallery((prev) => [newItem, ...prev]);
    logActivity('TAMBAH_FOTO_GALERI', `Menambahkan foto galeri: ${item.caption || 'Foto baru'}`);
  };

  const deleteGalleryItem = (id: string) => {
    setGallery((prev) => prev.filter((g) => g.id !== id));
    logActivity('HAPUS_FOTO_GALERI', `Menghapus foto galeri ID: ${id}`);
  };

  // Testimonial Handlers (FR-Real-Data)
  const addTestimonial = (data: Omit<Testimonial, 'id' | 'created_at'>) => {
    const newTesti: Testimonial = {
      id: `testi-${Date.now()}`,
      customer_name: data.customer_name,
      content: data.content,
      rating: data.rating,
      source: data.source || 'Google Maps',
      is_featured: data.is_featured ?? true,
      created_at: new Date().toISOString(),
    };
    setTestimonials((prev) => [newTesti, ...prev]);
    logActivity('TAMBAH_TESTIMONI', `Menambahkan ulasan dari ${data.customer_name}`);
  };

  const updateTestimonial = (id: string, data: Partial<Testimonial>) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...data } : t))
    );
    logActivity('UPDATE_TESTIMONI', `Memperbarui ulasan ID: ${id}`);
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    logActivity('HAPUS_TESTIMONI', `Menghapus ulasan ID: ${id}`);
  };

  const toggleTestimonialFeatured = (id: string) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_featured: !t.is_featured } : t))
    );
  };

  // Reset demo data helper
  const resetToInitialData = () => {
    setProducts(INITIAL_PRODUCTS);
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
