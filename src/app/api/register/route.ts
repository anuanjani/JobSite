import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Safety check: Does the database exist?
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Missing DATABASE_URL in .env file." }, { status: 500 });
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Insert into PostgreSQL
    const query = `
      INSERT INTO users (name, email, password, mobile, work_status) 
      VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email;
    `;
    const values = [body.name, body.email, body.password, body.mobile, body.workStatus];
    
    const result = await pool.query(query, values);
    return NextResponse.json({ success: true, user: result.rows[0] });

  } catch (error: any) {
    // If Email already exists, Postgres throws code '23505'
    if (error.code === '23505') {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Database error. Did you create the 'users' table?" }, { status: 500 });
  }
}