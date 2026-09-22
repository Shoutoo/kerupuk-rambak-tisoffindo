import React from 'react';
import { Sale } from '../../types';
import { Printer, Download, Share2, X, CheckCircle2, ShoppingBag } from 'lucide-react';

interface ReceiptModalProps {
  sale: Sale;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(sale.created_at).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const sendWhatsAppReceipt = () => {
    let msg = `*STRUK PENJUALAN TISOFFINDO*\n`;
    msg += `No: ${sale.invoice_no}\n`;
    msg += `Tgl: ${formattedDate}\n`;
    msg += `Kasir: ${sale.created_by_name}\n`;
    msg += `Pelanggan: ${sale.customer_name || 'Pelanggan Umum'}\n`;
    msg += `--------------------------------\n`;
    sale.items.forEach((item) => {
      msg += `${item.product_name}\n`;
      msg += `  ${item.quantity} x Rp ${item.price.toLocaleString('id-ID')} = Rp ${item.subtotal.toLocaleString('id-ID')}\n`;
    });
    msg += `--------------------------------\n`;
    msg += `*TOTAL: Rp ${sale.total_amount.toLocaleString('id-ID')}*\n`;
    msg += `Bayar: ${sale.payment_method}\n`;
    if (sale.cash_given) {
      msg += `Tunai: Rp ${sale.cash_given.toLocaleString('id-ID')}\n`;
      msg += `Kembali: Rp ${(sale.cash_change || 0).toLocaleString('id-ID')}\n`;
    }
    msg += `\nTerima kasih telah berbelanja Kerupuk Rambak Tisoffindo!`;

    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 my-8">
        {/* Header Action */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold text-sm text-stone-900">Transaksi Berhasil</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Thermal Receipt (80mm styling) */}
        <div id="printable-receipt" className="py-4 text-xs font-mono text-stone-800 space-y-3">
          {/* Business Header */}
          <div className="text-center space-y-0.5">
            <p className="font-bold text-sm text-stone-900 uppercase">TISOFFINDO</p>
            <p className="text-[11px] text-stone-600">Sentra Kerupuk Rambak Kulit Sapi</p>
            <p className="text-[10px] text-stone-500">Bangsal, Mojokerto, Jawa Timur</p>
            <p className="text-[10px] text-stone-500">Telp: 0812-3456-7890</p>
          </div>

          <div className="border-t border-dashed border-stone-300 pt-2 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>No. Faktur:</span>
              <span className="font-bold">{sale.invoice_no}</span>
            </div>
            <div className="flex justify-between">
              <span>Waktu:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>{sale.created_by_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Pelanggan:</span>
              <span>{sale.customer_name || 'Pelanggan Umum'}</span>
            </div>
          </div>

          {/* Itemized List */}
          <div className="border-t border-dashed border-stone-300 pt-2 space-y-2">
            {sale.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-semibold text-stone-900">{item.product_name}</div>
                <div className="flex justify-between text-[11px] text-stone-600">
                  <span>
                    {item.quantity} {item.unit} x {item.price.toLocaleString('id-ID')}
                  </span>
                  <span className="font-medium text-stone-900">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Financial Totals */}
          <div className="border-t border-dashed border-stone-300 pt-2 space-y-1 text-[11px]">
            <div className="flex justify-between font-bold text-stone-900 text-xs">
              <span>TOTAL BELANJA:</span>
              <span>Rp {sale.total_amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Metode Bayar:</span>
              <span>{sale.payment_method}</span>
            </div>
            {sale.cash_given !== undefined && (
              <>
                <div className="flex justify-between">
                  <span>Tunai Diterima:</span>
                  <span>Rp {sale.cash_given.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Kembalian:</span>
                  <span>Rp {(sale.cash_change || 0).toLocaleString('id-ID')}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer note */}
          <div className="border-t border-dashed border-stone-300 pt-3 text-center space-y-1 text-[10px] text-stone-500">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>Barang yang sudah dibeli dapat ditukar jika cacat kemasan sebelum dibuka.</p>
            <p>Instagram: @tisoffindo.rambak</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex flex-col gap-2">
          <button
            onClick={handlePrint}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Cetak Struk Thermal (Print)</span>
          </button>

          <button
            onClick={sendWhatsAppReceipt}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Kirim Ringkasan ke WhatsApp</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-stone-500 hover:text-stone-800 text-xs font-semibold text-center"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
