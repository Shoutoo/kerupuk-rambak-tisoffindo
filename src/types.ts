export type UserRole = 'admin' | 'petugas';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  category_id: string;
  category_name?: string;
  name: string;
  description: string;
  price: number;
  unit: 'bungkus' | 'kg' | 'dus' | 'pouch' | 'bal';
  image_url: string;
  stock_qty: number;
  min_stock: number;
  is_active: boolean;
  created_at: string;
}

export type StockMovementType = 'in' | 'out' | 'adjustment';

export interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  type: StockMovementType;
  quantity: number;
  note: string;
  created_by_name: string;
  created_by_id: string;
  created_at: string;
}

export interface SaleItem {
  id: string;
  product_id: string;
  product_name: string;
  unit: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export type PaymentMethod = 'Tunai' | 'Transfer QRIS' | 'Transfer Bank BCA' | 'Transfer Bank Mandiri';
export type SaleStatus = 'completed' | 'cancelled';

export interface Sale {
  id: string;
  invoice_no: string;
  customer_name?: string;
  total_amount: number;
  payment_method: PaymentMethod;
  cash_given?: number;
  cash_change?: number;
  status: SaleStatus;
  created_by_id: string;
  created_by_name: string;
  created_by_role: UserRole;
  created_at: string;
  items: SaleItem[];
  cancellation_reason?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  detail: string;
  created_at: string;
}

export interface CompanyProfile {
  id: string;
  business_name: string;
  address: string;
  phone: string;
  operating_hours: string;
  gmaps_url: string;
  gmaps_embed_lat: number;
  gmaps_embed_lng: number;
  rating: number;
  review_count: number;
  plus_code?: string;
  updated_at?: string;
}

export interface GalleryItem {
  id: string;
  image_url: string;
  caption?: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  content: string;
  rating: number;
  source: string;
  is_featured: boolean;
  created_at: string;
}
