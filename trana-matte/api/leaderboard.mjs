import { pool } from '../lib/database.mjs';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error:'Method not allowed' });
  }
  try {
    const result = await pool.query(`
      WITH scored AS (
        SELECT r.*, row_number() OVER (
          PARTITION BY player_id, operation, activity, passed ORDER BY received_at, id
        ) AS achievement_number
        FROM matte_practice_runs r
      ), totals AS (
        SELECT player_id, count(*)::int AS rounds,
          sum(CASE
            WHEN operation='crossword' AND passed THEN
              CASE activity WHEN 'easy' THEN 5 WHEN 'medium' THEN 10 WHEN 'hard' THEN 15 ELSE 0 END
            WHEN operation IN ('division','fractions') THEN score
              + CASE WHEN passed AND achievement_number=1 THEN 10 ELSE 0 END
            WHEN operation IN ('addition','subtraction') THEN score
            WHEN operation='multiplication' THEN score
              + CASE WHEN activity='bonus' AND passed THEN 20
                WHEN activity IN ('dock','belt','vault','boss') AND passed AND achievement_number=1 THEN 10
                ELSE 0 END
            ELSE 0 END)::int AS points
        FROM scored GROUP BY player_id
      )
      SELECT dense_rank() OVER (ORDER BY t.points DESC)::int AS rank,
        p.id, p.nickname, t.points, t.rounds
      FROM totals t JOIN matte_players p ON p.id=t.player_id
      ORDER BY t.points DESC, p.created_at, p.id LIMIT 100
    `);
    return res.status(200).json({ players:result.rows });
  } catch {
    return res.status(503).json({ error:'Leaderboard unavailable' });
  }
}
