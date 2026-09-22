import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Lock, Mail, ArrowLeft, Shield, UserCheck, KeyRound, AlertCircle, Info } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, quickLogin, setCurrentView, users } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email) {
      setErrorMsg('Mohon masukkan alamat email akun Anda.');
      return;
    }

    const success = login(email);
    if (!success) {
      setErrorMsg('Email tidak terdaftar atau akun dinonaktifkan. Silakan gunakan tombol demo di bawah.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSuccess(true);
    setTimeout(() => {
      setResetModalOpen(false);
      setResetSuccess(false);
      setResetEmail('');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Back button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => setCurrentView('company_profile')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold shadow-2xs hover:bg-stone-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Website Profil</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-lg shadow-amber-500/25 mb-4">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
            Sistem Internal Tisoffindo
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-stone-500">
            Masuk untuk akses Kasir POS, Manajemen Stok, dan Rekap Penjualan
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg rounded-2xl border border-stone-200/80 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Regular Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Alamat Email Pengguna
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tisoffindo.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-stone-700">
                  Kata Sandi (Password)
                </label>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(true)}
                  className="text-xs text-amber-700 hover:underline font-medium"
                >
                  Lupa kata sandi?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <span>Masuk ke Akun</span>
            </button>
          </form>

          {/* Quick Demo Login Buttons per PRD testing */}
          <div className="pt-4 border-t border-stone-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>Akses Cepat Pengujian (1-Klik):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => quickLogin('admin')}
                className="p-3 rounded-xl border border-amber-300 bg-amber-50/80 hover:bg-amber-100/80 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Shield className="w-4 h-4 text-amber-700" />
                  <span>Masuk sbg Admin</span>
                </div>
                <p className="text-[11px] text-amber-800/80 mt-1">
                  Akses penuh: kelola stok, produk, user & rekap penjualan
                </p>
              </button>

              <button
                type="button"
                onClick={() => quickLogin('petugas')}
                className="p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-left transition-all group"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                  <UserCheck className="w-4 h-4 text-stone-600" />
                  <span>Masuk sbg Petugas</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  Kasir POS, lihat stok (view only), & riwayat penjualan
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal (FR-10) */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center gap-2.5 text-amber-600 mb-2">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-bold text-stone-900 text-base">Reset Kata Sandi</h3>
            </div>
            <p className="text-xs text-stone-500 mb-4 leading-relaxed">
              Masukkan email akun Anda. Tautan pemulihan kata sandi akan dikirimkan melalui sistem Supabase Auth.
            </p>

            {resetSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                Tautan reset sandi berhasil dikirim! Silakan periksa kotak masuk email Anda.
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Email Anda</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="email@tisoffindo.com"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalOpen(false)}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Kirim Tautan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
