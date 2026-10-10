import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Missing DATABASE_URL" }, { status: 500 });

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Find user in PostgreSQL
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = result.rows[0];

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: { name: user.name, email: user.email } });
  } catch (error) {
    return NextResponse.json({ error: "Server/Database error." }, { status: 500 });
  }
}