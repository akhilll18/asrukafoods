import { createClient } from '@supabase/supabase-js';

// ============================================
// SUPABASE CLIENT CONFIGURATION
// ============================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
}

// ============================================
// MAIN SUPABASE CLIENT
// ============================================
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'asruka-auth',
  },
  db: {
    schema: 'public',
  },
});

// ============================================
// ADMIN CLIENT (Backend only)
// ============================================
export const supabaseAdmin = createClient(
  supabaseUrl,
  import.meta.env.VITE_SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ============================================
// TEST CONNECTION
// ============================================
export const testConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');
    const { data, error } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Connection failed:', error.message);
      return { success: false, error: error.message };
    }

    console.log('✅ Connected to Supabase successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Connection error:', error);
    return { success: false, error: error.message };
  }
};

export default supabase;