import { Router } from 'express';
import { pool } from '../db/pool';
const router = Router();
router.get('/', async (_req, res) => { const { rows } = await pool.query('SELECT * FROM profiles ORDER BY created_at DESC'); res.json(rows); });
router.get('/:id', async (req, res) => { const { rows } = await pool.query('SELECT * FROM profiles WHERE id = $1', [req.params.id]); res.json(rows[0] || null); });
router.post('/', async (req, res) => { const { full_name, role, skills } = req.body; const { rows } = await pool.query('INSERT INTO profiles (full_name, role, skills) VALUES ($1, $2, $3) RETURNING *', [full_name, role, skills || []]); res.status(201).json(rows[0]); });
router.put('/:id', async (req, res) => { const { full_name, role, skills } = req.body; const { rows } = await pool.query('UPDATE profiles SET full_name = $1, role = $2, skills = $3, updated_at = NOW() WHERE id = $4 RETURNING *', [full_name, role, skills || [], req.params.id]); res.json(rows[0]); });
export default router;
