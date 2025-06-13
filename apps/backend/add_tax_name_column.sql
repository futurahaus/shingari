-- Add tax_name column to public.users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS tax_name text; 