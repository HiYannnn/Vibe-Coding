import { createHash } from 'node:crypto';
import { pool } from '../lib/database.mjs';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { token, record } = req.body ?? {};
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const valid = typeof token === 'string' && /^[0-9a-f]{64}$/.test(token)
    && record && uuid.test(record.id)
    && typeof record.player === 'string' && record.player.trim().length >= 1 && record.player.length <= 24
    && ['multiplication', 'crossword', 'addition', 'subtraction', 'division'].includes(record.operation)
    && typeof record.activity === 'string' && record.activity.length >= 1 && record.activity.length <= 40
    && Number.isInteger(record.total) && record.total >= 1 && record.total <= 100
    && Number.isInteger(record.answered) && record.answered >= 0 && record.answered <= record.total
    && Number.isInteger(record.score) && record.score >= 0 && record.score <= record.answered
    && Number.isInteger(record.ms) && record.ms >= 0 && record.ms <= 2147483647
    && (record.passed === null || typeof record.passed === 'boolean')
    && typeof record.finished === 'string' && Number.isFinite(Date.parse(record.finished));
  if (!valid) return res.status(400).json({ error: 'Invalid result' });
  if (!process.env.DATABASE_URL) return res.status(503).json({ error: 'Database unavailable' });
  const hash = createHash('sha256').update(token).digest('hex');
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const player = await client.query(
        'INSERT INTO matte_players(token_hash,nickname) VALUES($1,$2) ON CONFLICT(token_hash) DO UPDATE SET nickname=EXCLUDED.nickname RETURNING id',
        [hash, record.player.trim()]
      );
      const result = await client.query(
        'INSERT INTO matte_practice_runs(id,player_id,operation,activity,score,total,answered,duration_ms,passed,finished_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING',
        [record.id, player.rows[0].id, record.operation, record.activity, record.score, record.total,
          record.answered, record.ms, record.passed, record.finished]
      );
      if (!result.rowCount) {
        const existing = await client.query(
          'SELECT 1 FROM matte_practice_runs WHERE player_id=$1 AND (id=$2 OR (operation=$3 AND activity=$4 AND finished_at=$5))',
          [player.rows[0].id, record.id, record.operation, record.activity, record.finished]
        );
        if (!existing.rowCount) {
          await client.query('ROLLBACK');
          return res.status(409).json({ error: 'Result conflict' });
        }
      }
      await client.query('COMMIT');
      return res.status(200).json({ saved: true });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch {
    return res.status(503).json({ error: 'Could not save result' });
  }
}
