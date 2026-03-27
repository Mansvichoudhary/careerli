import { Router } from 'express';
import { pool } from '../db/pool';
const router = Router();
router.get('/', async (_req, res) => { const { rows } = await pool.query('SELECT * FROM problems ORDER BY created_at DESC'); res.json(rows); });
router.post('/', async (req, res) => { const { title, description } = req.body; const { rows } = await pool.query('INSERT INTO problems (title, description) VALUES ($1, $2) RETURNING *', [title, description]); res.status(201).json(rows[0]); });
export default router;
