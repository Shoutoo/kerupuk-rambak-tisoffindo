import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://kiwdioyxftsixxcuryhn.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtpd2Rpb3l4ZnRzaXh4Y3VyeWhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwNTkyNjgsImV4cCI6MjEwNTYzNTI2OH0.F30tM049_bN2LuJhomefvy9MnJHgn6eBXTD7CsRXoKQ';

export const getSupabaseConfig = () => {
  const url =
    localStorage.getItem('tisoffindo_sb_url') ||
    import.meta.env.VITE_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;

  const key =
    localStorage.getItem('tisoffindo_sb_key') ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  return { url, key };
};

let cachedClient: SupabaseClient | null = null;
let lastUsedKey = '';
let lastUsedUrl = '';

export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, key } = getSupabaseConfig();

  if (!url || !key) {
    return null;
  }

  if (cachedClient && lastUsedUrl === url && lastUsedKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    lastUsedUrl = url;
    lastUsedKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

export interface ConnectionTestResult {
  connected: boolean;
  message: string;
  tablesFound?: string[];
  latencyMs?: number;
}

export const testSupabaseConnection = async (): Promise<ConnectionTestResult> => {
  const { url, key } = getSupabaseConfig();

  if (!url) {
    return {
      connected: false,
      message: 'Supabase URL belum diisi.',
    };
  }

  if (!key) {
    return {
      connected: false,
      message: 'Supabase Anon Key belum diisi. Salin Anon Key dari dashboard Supabase Anda.',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      message: 'Gagal menginisialisasi Supabase client.',
    };
  }

  const startTime = Date.now();
  try {
    // Test 1: ping auth / health or select company_profile
    const { data, error } = await client.from('company_profile').select('id, business_name').limit(1);

    const latency = Date.now() - startTime;

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('does not exist') || error.message?.includes('relation "public.company_profile"')) {
        return {
          connected: true, // Kredensial benar tapi tabel belum di-run
          message: 'Kredensial valid & terhubung ke Supabase! Namun tabel database belum dibuat. Silakan jalankan script supabase_schema.sql di SQL Editor Supabase.',
          latencyMs: latency,
        };
      }

      if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('apikey')) {
        return {
          connected: false,
          message: `Kredensial ditolak oleh Supabase: ${error.message}. Pastikan Anon Key yang Anda masukkan benar.`,
          latencyMs: latency,
        };
      }

      return {
        connected: false,
        message: `Terhubung dengan pesan: ${error.message} (Kode: ${error.code || 'UNKNOWN'})`,
        latencyMs: latency,
      };
    }

    return {
      connected: true,
      message: `Berhasil terhubung ke database Supabase! (Latensi: ${latency}ms)`,
      tablesFound: data ? ['company_profile'] : [],
      latencyMs: latency,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      message: `Gagal tersambung ke host: ${errorMsg}`,
    };
  }
};
