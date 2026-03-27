import { Router } from 'express';
import { pool } from '../db/pool';
const router = Router();
router.get('/:postId', async (req, res) => { const { rows } = await pool.query('SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC', [req.params.postId]); res.json(rows); });
router.post('/', async (req, res) => { const { post_id, content } = req.body; const { rows } = await pool.query('INSERT INTO comments (post_id, content) VALUES ($1, $2) RETURNING *', [post_id, content]); res.status(201).json(rows[0]); });
export default router;
