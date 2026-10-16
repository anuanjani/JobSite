import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mobile = searchParams.get('mobile');

  if (!mobile) {
    return NextResponse.json({ exists: false }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    
    // Explicitly query candidate_profiles first (where Anu Anjani is stored), then employer_profiles
    const result = await client.query(
      `SELECT name FROM candidate_profiles WHERE phone = $1 OR phone = $2 LIMIT 1`,
      [mobile, `+91${mobile}`]
    );

    if (result.rows.length > 0 && result.rows[0].name) {
      client.release();
      return NextResponse.json({
        exists: true,
        companyName: result.rows[0].name
      });
    }

    // Check employer profiles next
    const empResult = await client.query(
      `SELECT company_name FROM employer_profiles WHERE phone = $1 OR phone = $2 LIMIT 1`,
      [mobile, `+91${mobile}`]
    );

    client.release();

    if (empResult.rows.length > 0 && empResult.rows[0].company_name) {
      return NextResponse.json({
        exists: true,
        companyName: empResult.rows[0].company_name
      });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}