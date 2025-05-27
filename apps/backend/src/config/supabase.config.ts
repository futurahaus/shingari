import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aws-0-sa-east-1.pooler.supabase.com';
const supabaseKey = 'NDvfLU2V8e86CQA!';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
});

export const supabaseConfig = {
  host: 'aws-0-sa-east-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.kurswpuvjyhgojdkpxkn',
  password: 'NDvfLU2V8e86CQA!',
  poolMode: 'transaction',
};