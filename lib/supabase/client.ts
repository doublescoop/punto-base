/**
 * Supabase Client Configuration
 * 
 * This file sets up the Supabase client for both client-side and server-side usage.
 * Uses the latest @supabase/supabase-js v2.76.1
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/database.types';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE;
const supabaseSecretKey = process.env.SUPABASE_SECRET;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

/**
 * Client-side Supabase client
 * Use this in React components and client-side code
 * Uses the new publishable key (sb_publishable_...) - safe to expose
 */
export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Server-side Supabase client (with secret key)
 * Use this in API routes and server-side code
 * Uses the new secret key (sb_secret_...) - provides full access, bypasses RLS
 * WARNING: Never expose this client to the browser!
 */
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseSecretKey || supabasePublishableKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

/**
 * Helper function to handle Supabase errors
 */
export function handleSupabaseError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return 'An unknown error occurred';
}

/**
 * Helper function to check if user is authenticated
 */
export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  return user;
}

/**
 * Helper function to sign in with wallet (for future implementation)
 */
export async function signInWithWallet(walletAddress: string, signature: string) {
  // This will be implemented when we add wallet authentication
  // For now, we'll use a simplified approach
  console.log('Wallet sign in:', walletAddress, signature);
  return null;
}

