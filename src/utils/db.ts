import { Pool } from '@neondatabase/serverless';

// This creates a highly efficient connection pool using your Neon URL
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });