import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUPABASE_SQL_SCHEMA } from '../../utils/supabaseSql';
import {
  Database,
  Copy,
  Check,
  Download,
  Upload,
  Key,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Server,
} from 'lucide-react';

export const SupabaseConfigView: React.FC = () => {
  const { products, sales, stockMovements, users, activityLogs, resetToInitialData } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'export_import' | 'credentials'>('sql');

  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('tisoffindo_sb_url') || '');
  const [supabaseKey, setSupabaseKey] = useState(() => localStorage.getItem('tisoffindo_sb_key') || '');
  const [saveStatus, setSaveStatus] = useState(false);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('tisoffindo_sb_url', supabaseUrl.trim());
    localStorage.setItem('tisoffindo_sb_key', supabaseKey.trim());
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2500);
  };

  // Export current full database as JSON
  const handleExportJson = () => {
    const backupData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      products,
      sales,
      stockMovements,
      users,
      activityLogs,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `tisoffindo_database_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold font-serif text-stone-900">
              Integrasi Supabase & Manajemen Data
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-semibold">
              PostgreSQL + RLS
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Skrip skema database Supabase lengkap dengan Row Level Security (RLS), kredensial proyek, dan pencadangan (backup).
          </p>
        </div>

        <button
          onClick={handleCopySql}
          className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Skrip SQL Supabase'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('sql')}
          className={`pb-3 px-4 text-xs font-bold transition-all ${
            activeTab === 'sql'
              ? 'text-amber-700 border-b-2 border-amber-600'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Skrip SQL & RLS Schema
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`pb-3 px-4 text-xs font-bold transition-all ${
            activeTab === 'credentials'
              ? 'text-amber-700 border-b-2 border-amber-600'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Kredensial API Supabase
        </button>
        <button
          onClick={() => setActiveTab('export_import')}
          className={`pb-3 px-4 text-xs font-bold transition-all ${
            activeTab === 'export_import'
              ? 'text-amber-700 border-b-2 border-amber-600'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          Backup & Reset Data
        </button>
      </div>

      {/* Tab: SQL Schema */}
      {activeTab === 'sql' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Petunjuk Deploy Database ke Supabase:
            </p>
            <p>
              1. Buka dashboard proyek Anda di{' '}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="underline font-semibold"
              >
                Supabase Dashboard
              </a>
              .
            </p>
            <p>2. Masuk ke menu <strong>SQL Editor</strong> &gt; <strong>New Query</strong>.</p>
            <p>3. Tempelkan seluruh skrip SQL di bawah ini dan klik tombol <strong>Run</strong>.</p>
            <p>
              Skrip ini secara otomatis membuat tabel <code>products</code>, <code>sales</code>,{' '}
              <code>sale_items</code>, <code>stock_movements</code>, <code>profiles</code>,{' '}
              serta mengaktifkan <strong>Row Level Security (RLS)</strong> untuk Admin & Petugas sesuai PRD.
            </p>
          </div>

          <div className="relative rounded-2xl border border-stone-800 bg-stone-950 p-4 overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-800 text-xs text-stone-400">
              <span className="font-mono text-emerald-400">supabase_schema_tisoffindo.sql</span>
              <button
                onClick={handleCopySql}
                className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin!' : 'Salin'}</span>
              </button>
            </div>
            <pre className="font-mono text-[11px] text-stone-300 overflow-x-auto max-h-[480px] p-2 leading-relaxed">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>
      )}

      {/* Tab: Credentials */}
      {activeTab === 'credentials' && (
        <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs max-w-xl space-y-4">
          <div className="flex items-center gap-2 text-stone-900">
            <Key className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-sm">Konfigurasi Sambungan Proyek Supabase</h3>
          </div>
          <p className="text-xs text-stone-500">
            Masukkan URL Project dan Anon Public Key dari menu <em>Project Settings &gt; API</em> di dashboard Supabase Anda untuk menghubungkan data langsung.
          </p>

          <form onSubmit={handleSaveCredentials} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Supabase Anon (Public) Key
              </label>
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {saveStatus && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Kredensial tersimpan ke penyimpanan browser lokal!</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
              >
                Simpan Kredensial Supabase
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Backup & Reset */}
      {activeTab === 'export_import' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-stone-900">Cadangkan Data (Export JSON)</h3>
            </div>
            <p className="text-xs text-stone-500">
              Unduh seluruh database (katalog produk, riwayat penjualan, log mutasi stok, akun user) ke file JSON.
            </p>
            <button
              onClick={handleExportJson}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Backup JSON</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-sm text-stone-900">Reset ke Data Awal Pabrik</h3>
            </div>
            <p className="text-xs text-stone-500">
              Kembalikan seluruh data ke seed awal (6 produk kerupuk rambak, transaksi contoh, dan akun admin/petugas).
            </p>
            <button
              onClick={() => {
                if (window.confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke kondisi awal?')) {
                  resetToInitialData();
                  window.location.reload();
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-700 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset Data Demo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
