import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://zddythsszyznsguiuiss.supabase.co';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkZHl0aHNzenl6bnNndWl1aXNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NTk1NTMsImV4cCI6MjEwMTQzNTU1M30.NCWlpWUEQKxHWtvjkpUxeGQdI6MV3rkVZ2kHZPLL2RY';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});

export interface UserProfileData {
  id: string;
  username: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch profile for a given user UUID.
 * Protected by Row Level Security (RLS) - users can only view their own profile.
 */
export async function fetchUserProfile(userId: string): Promise<{ data: UserProfileData | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email, full_name, avatar_url, role, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to fetch profile' };
  }
}

/**
 * Update the authenticated user's profile.
 * Protected by Row Level Security (RLS) - users can only update their own profile.
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfileData, 'id' | 'created_at'>>
): Promise<{ data: UserProfileData | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .maybeSingle();

    if (error) {
      return { data: null, error: error.message };
    }
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Failed to update profile' };
  }
}

/**
 * Check if a username is already taken.
 */
export async function isUsernameTaken(username: string, excludeUserId?: string): Promise<boolean> {
  try {
    let query = supabase
      .from('profiles')
      .select('id')
      .ilike('username', username.trim());

    if (excludeUserId) {
      query = query.neq('id', excludeUserId);
    }

    const { data, error } = await query;
    if (error) {
      // If error occurs, let server-side constraint handle it
      return false;
    }
    return Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
}
