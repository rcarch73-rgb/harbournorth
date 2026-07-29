import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://sztutffnyrdvesnnajqf.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_HCY_Hd1xKWy2oPiY3pj0bw_65IWZNlH';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
