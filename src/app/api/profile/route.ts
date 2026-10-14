import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  try {
    // 💡 THE FIX: Use a LEFT JOIN to grab the name and mobile from the 'users' table 
    // just in case 'candidate_profiles' is empty!
    const query = `
      SELECT 
        u.name AS fallback_name, 
        u.mobile AS fallback_phone, 
        cp.* 
      FROM users u
      LEFT JOIN candidate_profiles cp ON u.email = cp.email
      WHERE u.email = $1
    `;
    
    const result = await pool.query(query, [email]);
    const row = result.rows[0];
    
    if (!row) {
      return NextResponse.json({}, { status: 200 }); // User not found in either table
    }

    // Map the data, prioritizing candidate_profiles, but falling back to the users table
    const profileData = {
      email: email,
      name: row.full_name || row.fallback_name || '',
      role: row.role || '',
      location: row.location || '',
      phone: row.phone || row.fallback_phone || '',
      avatar: row.avatar || '',
      resumeUrl: row.resume_url || '',
      resumeHeadline: row.resume_headline || '',
      keySkills: row.key_skills || []
    };
    
    return NextResponse.json(profileData);
  } catch (err) {
    console.error("DB Fetch Error:", err);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { email, name, role, location, phone, avatar, resumeUrl, resumeHeadline, keySkills } = data;

    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const nameParts = (name || '').trim().split(' ');
    const first_name = nameParts[0] || 'Unknown';
    let middle_name = '-';
    let last_name = '';

    if (nameParts.length === 2) {
      last_name = nameParts[1];
    } else if (nameParts.length >= 3) {
      middle_name = nameParts[1];
      last_name = nameParts.slice(2).join(' ');
    }

    const query = `
      INSERT INTO candidate_profiles (
        email, first_name, middle_name, last_name, full_name, 
        role, location, phone, avatar, resume_url, resume_headline, key_skills
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
      ON CONFLICT (email) 
      DO UPDATE SET 
        first_name = EXCLUDED.first_name,
        middle_name = EXCLUDED.middle_name,
        last_name = EXCLUDED.last_name,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        location = EXCLUDED.location,
        phone = EXCLUDED.phone,
        avatar = EXCLUDED.avatar,
        resume_url = EXCLUDED.resume_url,
        resume_headline = EXCLUDED.resume_headline,
        key_skills = EXCLUDED.key_skills,
        updated_at = CURRENT_TIMESTAMP;
    `;
    
    await pool.query(query, [
      email, first_name, middle_name, last_name, name,
      role || null, location || null, phone || null, avatar || null, 
      resumeUrl || null, resumeHeadline || null, JSON.stringify(keySkills || [])
    ]);
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ DB Save Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
