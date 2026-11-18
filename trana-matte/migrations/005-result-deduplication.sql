CREATE UNIQUE INDEX IF NOT EXISTS matte_practice_unique_round
  ON matte_practice_runs (player_id, operation, activity, finished_at);
