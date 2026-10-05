import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, PaymentMethod } from '../../types';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  CreditCard,
  Banknote,
  QrCode,
  User,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  Boxes,
} from 'lucide-react';
import { resolveProductImageUrl, getProductFallbackImage } from '../../utils/productImages';

interface CartItem {
  product: Product;
  quantity: number;
}

export const PosView: React.FC = () => {
  const { products, categories, createSale, currentUser } = useApp();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [cashGiven, setCashGiven] = useState<number | ''>('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  // Responsive tab switcher for mobile/tablet portrait
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');

  // Filter active products
  const activeProducts = products.filter((p) => p.is_active);
  const selectedCatObj = categories.find((c) => c.id === selectedCategory);
  const filteredProducts = activeProducts.filter((p) => {
    const matchCat =
      selectedCategory === 'all' ||
      p.category_id === selectedCategory ||
      (selectedCatObj && p.category_name?.toLowerCase().trim() === selectedCatObj.name.toLowerCase().trim());
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Cart operations
  const addToCart = (product: Product) => {
    setCheckoutError('');
    // Check available stock
    const existing = cart.find((item) => item.product.id === product.id);
    const currentQtyInCart = existing ? existing.quantity : 0;

    if (currentQtyInCart + 1 > product.stock_qty) {
      setCheckoutError(`Stok produk "${product.name}" tidak mencukupi (sisa ${product.stock_qty} ${product.unit}).`);
      return;
    }

    if (existing) {
      setCart(
        cart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCheckoutError('');
    const target = cart.find((item) => item.product.id === productId);
    if (!target) return;

    const newQty = target.quantity + delta;
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > target.product.stock_qty) {
      setCheckoutError(
        `Maksimal kuantitas adalah stok yang tersedia (${target.product.stock_qty} ${target.product.unit}).`
      );
      return;
    }

    setCart(
      cart.map((item) => (item.product.id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCashGiven('');
    setCustomerName('');
    setCheckoutError('');
  };

  // Calculations
  const grandTotal = cart.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const numericCash = typeof cashGiven === 'number' ? cashGiven : 0;
  const cashChange = numericCash >= grandTotal ? numericCash - grandTotal : 0;

  // Quick cash buttons
  const setQuickCash = (amount: number) => {
    setCashGiven(amount);
  };

  const handleCheckout = () => {
    setCheckoutError('');
    if (cart.length === 0) {
      setCheckoutError('Keranjang belanja masih kosong.');
      return;
    }

    if (paymentMethod === 'Tunai') {
      if (typeof cashGiven !== 'number' || cashGiven < grandTotal) {
        setCheckoutError('Uang tunai yang diterima kurang dari total transaksi.');
        return;
      }
    }

    setIsProcessing(true);

    const payload = cart.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    const result = createSale(
      payload,
      paymentMethod,
      customerName || 'Pelanggan Umum',
      paymentMethod === 'Tunai' ? numericCash : undefined
    );

    setIsProcessing(false);

    if (result.success) {
      // Clear cart
      setCart([]);
      setCashGiven('');
      setCustomerName('');
    } else {
      setCheckoutError(result.error || 'Gagal memproses transaksi.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile/Tablet Tab Switcher (Visible on < lg screens) */}
      <div className="lg:hidden flex items-center bg-stone-200/70 p-1 rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => setMobileTab('catalog')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all min-h-[44px] ${
            mobileTab === 'catalog'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Boxes className="w-4 h-4 text-amber-700" />
          <span>Katalog Produk ({filteredProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all min-h-[44px] relative ${
            mobileTab === 'cart'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <div className="relative">
            <ShoppingCart className="w-4 h-4 text-amber-700" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-600" />
            )}
          </div>
          <span>Keranjang ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
          {cart.length > 0 && (
            <span className="text-[10px] font-mono font-bold text-amber-800 hidden sm:inline">
              Rp {grandTotal.toLocaleString('id-ID')}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Selection Grid */}
        <div className={`space-y-4 lg:col-span-7 ${mobileTab === 'catalog' ? 'block' : 'hidden lg:block'}`}>
          {/* Search & Category Filter Header */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama kerupuk rambak..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="text-xs text-stone-500 shrink-0 font-medium self-start sm:self-auto">
                Kasir:{' '}
                <span className="font-bold text-stone-800">{currentUser?.full_name}</span>
              </div>
            </div>

            {/* Category Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[36px] ${
                  selectedCategory === 'all'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Semua ({activeProducts.length})
              </button>
              {categories.map((c) => {
                const count = activeProducts.filter(
                  (p) => p.category_id === c.id || p.category_name?.toLowerCase().trim() === c.name.toLowerCase().trim()
                ).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors min-h-[36px] ${
                      selectedCategory === c.id
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {c.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[640px] overflow-y-auto p-0.5">
            {filteredProducts.map((p) => {
              const isOutOfStock = p.stock_qty <= 0;
              const isLowStock = p.stock_qty <= p.min_stock;
              const inCart = cart.find((item) => item.product.id === p.id);

              return (
                <div
                  key={p.id}
                  onClick={() => !isOutOfStock && addToCart(p)}
                  className={`group relative bg-white rounded-xl border border-stone-200/90 p-3 shadow-2xs transition-all flex flex-col justify-between ${
                    isOutOfStock
                      ? 'opacity-50 cursor-not-allowed bg-stone-50'
                      : 'cursor-pointer hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-stone-100 mb-2">
                      <img
                        src={resolveProductImageUrl(p.image_url, p.name, p.category_name)}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const fallback = getProductFallbackImage(p.name, p.category_name);
                          if (e.currentTarget.src !== fallback) {
                            e.currentTarget.src = fallback;
                          }
                        }}
                      />
                      {/* Stock pill */}
                      <div className="absolute bottom-1.5 left-1.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs ${
                            isOutOfStock
                              ? 'bg-stone-800 text-white'
                              : isLowStock
                              ? 'bg-rose-500 text-white'
                              : 'bg-stone-900/80 text-amber-300 backdrop-blur-2xs'
                          }`}
                        >
                          {isOutOfStock ? 'Habis' : `Stok: ${p.stock_qty} ${p.unit}`}
                        </span>
                      </div>

                      {inCart && (
                        <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                          {inCart.quantity}
                        </div>
                      )}
                    </div>

                    <h4 className="font-bold text-stone-900 text-xs line-clamp-2 leading-snug">
                      {p.name}
                    </h4>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-stone-900 font-serif">
                      Rp {p.price.toLocaleString('id-ID')}
                    </span>
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      className="p-1.5 rounded-lg bg-amber-50 text-amber-800 group-hover:bg-amber-600 group-hover:text-white transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Cart & Checkout Terminal */}
        <div className={`space-y-4 lg:col-span-5 ${mobileTab === 'cart' ? 'block' : 'hidden lg:block'} bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-2xs`}>
          {/* Back to Catalog button on mobile */}
          <button
            type="button"
            onClick={() => setMobileTab('catalog')}
            className="lg:hidden w-full py-2 px-3 mb-1 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-stone-50 min-h-[40px]"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-stone-600" />
            <span>Kembali ke Katalog Produk</span>
          </button>

          {/* Cart Header */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-stone-900 text-sm font-serif">Keranjang Belanja</h3>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold">
                {cart.reduce((a, b) => a + b.quantity, 0)} item
              </span>
            </div>

            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 min-h-[36px] px-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Kosongkan</span>
              </button>
            )}
          </div>

          {/* Customer Name Input (FR-18) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nama Pelanggan (Opsional)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Pak Budi / Pelanggan Umum"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-stone-400 space-y-2">
                <ShoppingCart className="w-8 h-8 mx-auto stroke-1" />
                <p className="text-xs">Klik produk di katalog untuk menambahkan ke keranjang.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-stone-900 truncate">{item.product.name}</p>
                    <p className="text-[11px] text-stone-500">
                      Rp {item.product.price.toLocaleString('id-ID')} / {item.product.unit}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-300 flex items-center justify-center text-stone-700 hover:bg-stone-100 min-w-[28px] min-h-[28px]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center font-bold text-stone-900 font-mono text-xs">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-300 flex items-center justify-center text-stone-700 hover:bg-stone-100 min-w-[28px] min-h-[28px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px] shrink-0 font-bold font-mono text-stone-900 text-xs">
                    Rp {(item.product.price * item.quantity).toLocaleString('id-ID')}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Payment Methods Selection (FR-20) */}
          {cart.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Metode Pembayaran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Tunai')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all min-h-[44px] ${
                      paymentMethod === 'Tunai'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-600'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-amber-700" />
                    <span>Tunai (Cash)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Transfer QRIS')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all min-h-[44px] ${
                      paymentMethod === 'Transfer QRIS'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-600'
                        : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-amber-700" />
                    <span>Transfer QRIS</span>
                  </button>
                </div>
              </div>

              {/* Cash Given & Quick Amount Tender (For Tunai) */}
              {paymentMethod === 'Tunai' && (
                <div className="space-y-2 bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-stone-700">Uang Diterima (Rp)</label>
                    <span className="text-[11px] text-stone-500">Pilih Cepat:</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
                    <button
                      type="button"
                      onClick={() => setQuickCash(grandTotal)}
                      className="py-1.5 px-2 rounded-lg bg-white border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 min-h-[36px]"
                    >
                      Uang Pas
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickCash(50000)}
                      className="py-1.5 px-2 rounded-lg bg-white border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 min-h-[36px]"
                    >
                      50.000
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickCash(100000)}
                      className="py-1.5 px-2 rounded-lg bg-white border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 min-h-[36px]"
                    >
                      100.000
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickCash(200000)}
                      className="py-1.5 px-2 rounded-lg bg-white border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-100 min-h-[36px]"
                    >
                      200.000
                    </button>
                  </div>

                  <input
                    type="number"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value ? Number(e.target.value) : '')}
                    placeholder={`Min: Rp ${grandTotal.toLocaleString('id-ID')}`}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-base sm:text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />

                  {numericCash > 0 && (
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="font-semibold text-stone-600">Kembalian:</span>
                      <span
                        className={`font-mono font-bold ${
                          numericCash >= grandTotal ? 'text-emerald-600 text-sm' : 'text-rose-600'
                        }`}
                      >
                        {numericCash >= grandTotal
                          ? `Rp ${cashChange.toLocaleString('id-ID')}`
                          : 'Uang kurang'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Error banner */}
              {checkoutError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Total Summary */}
              <div className="pt-2 space-y-1 text-xs">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal ({cart.length} jenis produk):</span>
                  <span className="font-mono">Rp {grandTotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-stone-900 font-extrabold text-base pt-1 border-t border-stone-200">
                  <span>Total Bayar:</span>
                  <span className="text-amber-800 font-serif">
                    Rp {grandTotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                disabled={isProcessing || cart.length === 0}
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-h-[48px]"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Selesaikan Transaksi & Cetak Struk</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Checkout Trigger for Mobile (Visible when on catalog tab and cart has items) */}
      {mobileTab === 'catalog' && cart.length > 0 && (
        <div className="lg:hidden fixed bottom-18 left-3 right-3 z-30 bg-stone-900 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between border border-stone-800/80 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {cart.reduce((a, b) => a + b.quantity, 0)}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-stone-400 block leading-tight">Keranjang Belanja</span>
              <span className="text-xs sm:text-sm font-bold font-mono text-amber-300 truncate block">
                Rp {grandTotal.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileTab('cart')}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition-colors flex items-center gap-1.5 shrink-0 min-h-[40px]"
          >
            <span>Buka Kasir</span>
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
