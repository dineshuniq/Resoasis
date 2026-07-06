import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is missing.');
}

// Create an HTTP connection utility optimized for serverless environments
const sql = neon(process.env.DATABASE_URL);

// Initialize Drizzle with your flat schema file
export const db = drizzle(sql, { schema });