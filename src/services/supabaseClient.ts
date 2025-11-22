import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Use localStorage for persistent sessions (survives page refresh)
        storage: window.localStorage,
        // Automatically refresh tokens
        autoRefreshToken: true,
        // Persist session across browser sessions
        persistSession: true,
        // Detect when user switches tabs/windows
        detectSessionInUrl: true,
    },
});
