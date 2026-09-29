import { APP_ASSETS } from '../assets/images';

/**
 * Mengembalikan gambar otentik Tisoffindo berdasarkan nama produk atau kategori
 */
export const getProductFallbackImage = (name?: string, categoryName?: string): string => {
  const n = (name || '').toLowerCase();
  const c = (categoryName || '').toLowerCase();

  // Krecek / Mentah / Sayur
  if (
    n.includes('krecek') ||
    n.includes('mentah') ||
    n.includes('sayur') ||
    c.includes('krecek') ||
    c.includes('mentah')
  ) {
    return APP_ASSETS.krecekMentah;
  }

  // Jumbo, Dus Oleh-Oleh, Tumpukan Kemasan
  if (
    n.includes('jumbo') ||
    n.includes('dus') ||
    n.includes('paket') ||
    n.includes('stok') ||
    c.includes('paket') ||
    c.includes('dus')
  ) {
    return APP_ASSETS.rambakStacks;
  }

  // Kulit Kerbau, Balado, Pedas Daun Jeruk
  if (
    n.includes('kerbau') ||
    n.includes('balado') ||
    n.includes('pedas') ||
    n.includes('crisp') ||
    c.includes('rasa') ||
    c.includes('kerbau')
  ) {
    return APP_ASSETS.rambakCrisp;
  }

  // Default Kemasan Asli Tisoffindo Plastik Bening Stempel Biru (250g)
  return APP_ASSETS.rambakPack;
};

/**
 * Menyelesaikan URL gambar produk: jika kosong, null, atau tidak valid,
 * otomatis gunakan foto otentik Tisoffindo lokal.
 */
export const resolveProductImageUrl = (
  imageUrl?: string | null,
  name?: string,
  categoryName?: string
): string => {
  if (imageUrl && imageUrl.trim().length > 5 && !imageUrl.startsWith('blob:')) {
    return imageUrl;
  }
  return getProductFallbackImage(name, categoryName);
};
