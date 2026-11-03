import assert from 'node:assert/strict';
import { test } from 'node:test';
import { answer } from '../api/telegram';

const products = [
  { name: 'Rambak Sapi Pedas', description: 'Renyah dan pedas', price: 36000, unit: 'bungkus', stock_qty: 4 },
  { name: 'Krecek Mentah', description: 'Siap goreng', price: 95000, unit: 'kg', stock_qty: 0 },
];
const profile = { business_name: 'Tisoffindo', address: 'Boyolali', phone: '08123456789', operating_hours: '08.00-17.00', gmaps_url: 'https://maps.example/test' };

test('helps customers and shows public business information', () => {
  assert.match(answer('/start', products, profile, ''), /Tisoffindo/);
  assert.match(answer('alamat toko dimana?', products, profile, ''), /Boyolali/);
  assert.match(answer('jam buka?', products, profile, ''), /08.00-17.00/);
  assert.match(answer('kontak', products, profile, ''), /08123456789/);
  assert.match(answer('website', products, profile, 'https://example.com'), /https:\/\/example.com/);
});

test('shows live product prices, filters by name and does not claim out-of-stock items available', () => {
  assert.match(answer('harga rambak sapi pedas', products, profile, ''), /Rp 36\.000\/bungkus/);
  assert.doesNotMatch(answer('harga rambak sapi pedas', products, profile, ''), /Krecek/);
  assert.match(answer('/produk', products, profile, ''), /stok habis/);
  assert.match(answer('harga produk tidak dikenal', products, profile, ''), /tidak ditemukan/);
});

test('does not invent catalog data if database is empty', () => {
  assert.match(answer('/produk', [], profile, ''), /belum tersedia/);
  assert.match(answer('alamat?', products, null, ''), /belum tersedia/);
});
