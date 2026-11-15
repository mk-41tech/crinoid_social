import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://asllpfpftcdmwdryrrvt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_jiffC4Ec9hO2mP6M51pktA_ltoFBAH0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
