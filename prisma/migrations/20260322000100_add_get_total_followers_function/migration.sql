-- CreateFunction
CREATE OR REPLACE FUNCTION get_total_followers_by_user(p_user_id TEXT)
RETURNS INTEGER
LANGUAGE SQL
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM "user_follows"
  WHERE "followed_id" = p_user_id;
$$;
