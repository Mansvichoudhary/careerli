import { Router } from 'express';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool';

const router = Router();

const hashPassword = (password: string) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
};
const verifyPassword = (password: string, stored: string) => {
  const [salt, hash] = stored.split(':');
  const digest = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(digest, 'hex'));
};

router.post('/register', async (req, res) => {
  const { email, password, full_name, role } = req.body;
  const user = await pool.query('INSERT INTO profiles (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email', [email, hashPassword(password), full_name, role || 'student']);
  res.status(201).json(user.rows[0]);
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT id, email, password_hash, full_name, role FROM profiles WHERE email = $1', [email]);
  const record = result.rows[0];
  if (!record || !verifyPassword(password, record.password_hash)) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ id: record.id, email: record.email }, process.env.JWT_SECRET || 'careerli_dev_secret', { expiresIn: '7d' });
  res.json({ token, user: { id: record.id, email: record.email }, profile: record });
});

export default router;
