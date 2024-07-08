import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_KEY, SUPABASE_URL } from '@thxnetwork/api/config/secrets';

export const supabaseClient = (key?: string): SupabaseClient => createClient(SUPABASE_URL, key || SUPABASE_SERVICE_KEY);
