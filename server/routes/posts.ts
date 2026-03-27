import { Router } from 'express';
import { pool } from '../db/pool';
const router = Router();
router.get('/', async (req, res) => { const c = req.query.category as string | undefined; const q = c ? 'SELECT * FROM posts WHERE post_type = $1 ORDER BY created_at DESC' : 'SELECT * FROM posts ORDER BY created_at DESC'; const params = c ? [c] : []; const { rows } = await pool.query(q, params); res.json(rows); });
router.post('/', async (req, res) => { const { title, content, post_type, tags, is_pinned } = req.body; const { rows } = await pool.query('INSERT INTO posts (title, content, post_type, tags, is_pinned) VALUES ($1, $2, $3, $4, $5) RETURNING *', [title, content, post_type, tags || [], is_pinned || false]); res.status(201).json(rows[0]); });
router.put('/:id', async (req, res) => { const { title, content, is_pinned } = req.body; const { rows } = await pool.query('UPDATE posts SET title = COALESCE($1, title), content = COALESCE($2, content), is_pinned = COALESCE($3, is_pinned) WHERE id = $4 RETURNING *', [title ?? null, content ?? null, is_pinned ?? null, req.params.id]); res.json(rows[0]); });
router.delete('/:id', async (req, res) => { await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id]); res.status(204).send(); });
export default router;
