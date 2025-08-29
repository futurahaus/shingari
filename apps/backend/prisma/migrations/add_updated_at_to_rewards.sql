-- Add updated_at column to rewards table
ALTER TABLE public.rewards 
ADD COLUMN updated_at timestamp without time zone DEFAULT now();

-- Update existing records to have updated_at = created_at
UPDATE public.rewards 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Make updated_at NOT NULL after setting default values
ALTER TABLE public.rewards 
ALTER COLUMN updated_at SET NOT NULL;
