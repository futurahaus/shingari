-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row update
CREATE TRIGGER update_rewards_updated_at 
    BEFORE UPDATE ON public.rewards 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
