import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SUPABASE_SQL_SCHEMA } from '../../utils/supabaseSql';
import {
  testSupabaseConnection,
  getSupabaseConfig,
  getSupabaseClient,
  ConnectionTestResult,
} from '../../utils/supabaseClient';
import {
  Database,
  Copy,
  Check,
  Download,
  Key,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Server,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

const DEFAULT_PROJECT_URL = 'https://kiwdioyxftsixxcuryhn.supabase.co';
const DEFAULT_PROJECT_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpd2Rpb3l4ZnRzaXh4Y3VyeWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNTkyNjgsImV4cCI6MjEwNTYzNTI2OH0.F30tM049_bN2LuJhomefvy9MnJHgn6eBXTD7CsRXoKQ';

export const SupabaseConfigView: React.FC = () => {
  const { products, sales, stockMovements, users, activityLogs, resetToInitialData } = useApp();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'credentials' | 'export_import'>('credentials');

  const [supabaseUrl, setSupabaseUrl] = useState(() => {
    return localStorage.getItem('tisoffindo_sb_url') || DEFAULT_PROJECT_URL;
  });
  const [supabaseKey, setSupabaseKey] = useState(() => {
    return localStorage.getItem('tisoffindo_sb_key') || DEFAULT_PROJECT_ANON_KEY;
  });
  const [saveStatus, setSaveStatus] = useState(false);

  // Connection testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);

  // Auto test on initial load if key is present
  useEffect(() => {
    const { key } = getSupabaseConfig();
    if (key) {
      handleTestConnection();
    }
  }, []);

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestResult({
        connected: false,
        message: `Terjadi kesalahan saat menguji sambungan: ${msg}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([SUPABASE_SQL_SCHEMA], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'supabase_schema.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('tisoffindo_sb_url', supabaseUrl.trim());
    localStorage.setItem('tisoffindo_sb_key', supabaseKey.trim());
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2500);

    // Run connection test right after saving
    await handleTestConnection();
  };

  // Export current full database as JSON
  const handleExportJson = () => {
    const backupData = {
      version: '1.1',
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

  const hasKey = Boolean(supabaseKey.trim());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold font-serif text-stone-900">
              Koneksi & Database Supabase
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-semibold">
              PostgreSQL
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Status koneksi real-time, konfigurasi kredensial API, skema SQL, dan sinkronisasi data Pabrik Tisoffindo.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadSql}
            className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-colors border border-stone-300"
          >
            <Download className="w-4 h-4 text-amber-600" />
            <span>Unduh .SQL</span>
          </button>
          <button
            onClick={handleCopySql}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Tersalin!' : 'Salin Skrip SQL'}</span>
          </button>
        </div>
      </div>

      {/* Connection Status Live Banner */}
      <div
        className={`rounded-2xl border p-5 transition-all ${
          testResult?.connected
            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
            : !hasKey
            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
            : testResult && !testResult.connected
            ? 'bg-rose-50/70 border-rose-300 text-rose-950'
            : 'bg-stone-50 border-stone-200 text-stone-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {testResult?.connected ? (
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : !hasKey ? (
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <Key className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">
                  {testResult?.connected
                    ? 'Status: Terhubung ke Database Supabase'
                    : !hasKey
                    ? 'Status: Belum Terhubung (Menunggu Anon Key)'
                    : 'Status: Belum Tersambung'}
                </span>
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    testResult?.connected
                      ? 'bg-emerald-500 animate-pulse'
                      : !hasKey
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                />
              </div>

              <p className="text-xs leading-relaxed max-w-2xl">
                {testResult
                  ? testResult.message
                  : !hasKey
                  ? 'Aplikasi siap disambungkan ke proyek Supabase Anda. Anda hanya perlu menyalin "anon public key" dari dashboard Supabase ke tab Kredensial di bawah.'
                  : 'Klik tombol di samping untuk menguji sambungan ke server Supabase.'}
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px] font-mono text-stone-600">
                <span className="bg-white/80 px-2 py-0.5 rounded border border-stone-200">
                  URL: {supabaseUrl}
                </span>
                {testResult?.latencyMs && (
                  <span className="bg-white/80 px-2 py-0.5 rounded border border-stone-200">
                    Latensi: {testResult.latencyMs}ms
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs font-bold flex items-center gap-2 shadow-2xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-amber-600' : ''}`} />
              <span>{isTesting ? 'Sedang Menguji...' : 'Uji Koneksi Ulang'}</span>
            </button>
            {!testResult?.connected && (
              <button
                onClick={() => setActiveTab('credentials')}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <span>Isi Anon Key</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200">
        <button
          onClick={() => setActiveTab('credentials')}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'credentials'
              ? 'text-amber-700 border-b-2 border-amber-600'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>1. Kredensial API Supabase</span>
        </button>
        <button
          onClick={() => setActiveTab('sql')}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'sql'
              ? 'text-amber-700 border-b-2 border-amber-600'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>2. Skrip SQL Supabase</span>
        </button>
        <button
          onClick={() => setActiveTab('export_import')}
          className={`pb-3 px-4 text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'export_import'
              ? 'text-amber-700 border-b-2 border-amber-600'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>3. Backup & Reset Data</span>
        </button>
      </div>

      {/* Tab: Credentials */}
      {activeTab === 'credentials' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-stone-900 border-b border-stone-100 pb-3">
              <Key className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="font-bold text-sm">Pengaturan Sambungan Supabase</h3>
                <p className="text-xs text-stone-500">
                  Masukkan kunci API dari proyek Supabase Anda agar aplikasi terhubung secara langsung.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCredentials} className="space-y-4 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Supabase Project URL
                  </label>
                  <button
                    type="button"
                    onClick={() => setSupabaseUrl(DEFAULT_PROJECT_URL)}
                    className="text-[11px] text-amber-700 hover:underline font-mono"
                  >
                    Gunakan Proyek kiwdioyxftsixxcuryhn
                  </button>
                </div>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyz.supabase.co"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Kunci publik aman digunakan di frontend browser untuk query data publik dan login staf.
                </p>
              </div>

              {saveStatus && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Kredensial berhasil disimpan dan sambungan diuji ulang!</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isTesting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Simpan & Uji Sambungan
                </button>
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || !hasKey}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors disabled:opacity-50"
                >
                  Hanya Uji Sambungan
                </button>
              </div>
            </form>
          </div>

          {/* Quick Guide Card */}
          <div className="bg-amber-50/60 rounded-2xl border border-amber-200/80 p-5 space-y-3.5 text-xs text-amber-950">
            <h4 className="font-bold flex items-center gap-1.5 text-stone-900">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              Cara Mendapatkan Anon Key:
            </h4>
            <ol className="space-y-2.5 list-decimal pl-4 leading-relaxed text-stone-700">
              <li>
                Buka dashboard proyek Anda di{' '}
                <a
                  href="https://supabase.com/dashboard/project/kiwdioyxftsixxcuryhn/settings/api"
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-semibold text-amber-900 inline-flex items-center gap-0.5"
                >
                  Supabase API Settings
                  <ExternalLink className="w-3 h-3 inline" />
                </a>
              </li>
              <li>
                Di bagian <strong>Project API keys</strong>, cari baris yang bertuliskan{' '}
                <span className="font-mono bg-white px-1 py-0.5 rounded text-[11px] border border-amber-200">
                  anon public
                </span>
                .
              </li>
              <li>
                Klik tombol <strong>Reveal</strong> dan <strong>Copy</strong> kunci tersebut.
              </li>
              <li>
                Tempelkan pada kolom <strong>Supabase Anon Key</strong> di samping, lalu klik tombol hijau{' '}
                <strong>Simpan & Uji Sambungan</strong>.
              </li>
            </ol>

            <div className="pt-2 border-t border-amber-200/60 text-[11px] text-stone-600">
              <p>
                <strong>Catatan:</strong> Jika Anda baru saja membuat proyek, pastikan Anda juga sudah menjalankan skrip dari tab{' '}
                <strong>2. Skrip SQL Supabase</strong> di menu SQL Editor Supabase.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: SQL Schema */}
      {activeTab === 'sql' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              Petunjuk Menjalankan Database di Supabase SQL Editor:
            </p>
            <p>
              1. Buka{' '}
              <a
                href="https://supabase.com/dashboard/project/kiwdioyxftsixxcuryhn/sql/new"
                target="_blank"
                rel="noreferrer"
                className="underline font-semibold"
              >
                Supabase SQL Editor (Proyek kiwdioyxftsixxcuryhn)
              </a>
              .
            </p>
            <p>2. Buat query baru (<strong>New Query</strong>).</p>
            <p>3. Klik tombol <strong>Salin Semua</strong> di bawah ini, tempelkan ke editor, lalu klik <strong>Run</strong>.</p>
            <p>
              Skrip ini otomatis membuat tabel <code>products</code>, <code>product_categories</code>,{' '}
              <code>sales</code>, <code>sale_items</code>, <code>stock_movements</code>, <code>profiles</code>,{' '}
              <code>company_profile</code>, <code>gallery</code>, <code>testimonials</code>,{' '}
              beserta data awal katalog produk Kerupuk Rambak Tisoffindo.
            </p>
          </div>

          <div className="relative rounded-2xl border border-stone-800 bg-stone-950 p-4 overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-800 text-xs text-stone-400">
              <span className="font-mono text-emerald-400">supabase_schema.sql</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSql}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs flex items-center gap-1.5 transition-colors border border-amber-500/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh .SQL</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin!' : 'Salin Semua'}</span>
                </button>
              </div>
            </div>
            <pre className="font-mono text-[11px] text-stone-300 overflow-x-auto max-h-[480px] p-2 leading-relaxed">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
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
              Unduh seluruh database (katalog produk, riwayat penjualan, log mutasi stok, akun user) ke file JSON lokal.
            </p>
            <button
              onClick={handleExportJson}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
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
              Kembalikan seluruh data ke seed awal (8 produk kerupuk rambak Tisoffindo, transaksi contoh, dan profil usaha).
            </p>
            <button
              onClick={() => {
                if (window.confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke kondisi awal?')) {
                  resetToInitialData();
                  window.location.reload();
                }
              }}
              className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-rose-50 hover:text-rose-700 text-stone-700 font-bold text-xs flex items-center gap-2 transition-colors border border-stone-300"
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
