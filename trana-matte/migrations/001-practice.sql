CREATE TABLE IF NOT EXISTS matte_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  nickname text NOT NULL CHECK (char_length(nickname) BETWEEN 1 AND 24),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS matte_practice_runs (
  id uuid PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES matte_players(id),
  operation text NOT NULL CHECK (operation IN ('multiplication', 'crossword')),
  activity text NOT NULL CHECK (char_length(activity) BETWEEN 1 AND 40),
  score integer NOT NULL CHECK (score >= 0),
  total integer NOT NULL CHECK (total BETWEEN 1 AND 100),
  answered integer NOT NULL CHECK (answered >= 0 AND answered <= total),
  duration_ms integer NOT NULL CHECK (duration_ms BETWEEN 0 AND 2147483647),
  passed boolean,
  finished_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  CHECK (score <= answered)
);
CREATE INDEX IF NOT EXISTS matte_practice_player_date
  ON matte_practice_runs (player_id, finished_at DESC);
