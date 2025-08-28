-- Create view for user points balance
CREATE OR REPLACE VIEW user_points_balance AS
SELECT 
    user_id,
    COALESCE(SUM(points), 0) as total_points
FROM points_ledger
WHERE user_id IS NOT NULL
GROUP BY user_id;

-- Add comment to the view
COMMENT ON VIEW user_points_balance IS 'View that shows the total points balance for each user based on points_ledger transactions';
