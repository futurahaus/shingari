import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

// Validate required environment variables
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] as const;
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: { 'Content-Type': 'application/json' },
    fetch: (url: string, options: RequestInit = {}) => {
      const timeout = 30000; // 30 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Add security headers to the request
      const secureOptions: RequestInit = {
        ...options,
        headers: {
          ...(options.headers as Record<string, string>),
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      };

      return fetch(url, secureOptions).finally(() => {
        clearTimeout(timeoutId);
      });
    },
  },
});