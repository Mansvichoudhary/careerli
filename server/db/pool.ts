import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host: process.env.DB_HOST || 'mycareerlibd.cv6cuae6209x.ap-south-1.rds.amazonaws.com',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'careerli',
  password: process.env.DB_PASSWORD || '(.9[^P;S2&A&]<2h',
  ssl: { rejectUnauthorized: false },
});
