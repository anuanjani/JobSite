import { NextResponse } from 'next/server';
import { pool } from '../../../utils/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // 1. Clean the inputs to prevent trailing space or capitalization bugs
    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    // 2. Fetch the user's core identity using case-insensitive lookup
    const result = await pool.query(
      'SELECT id, email, password_hash, role FROM users WHERE LOWER(email) = $1', 
      [cleanEmail]
    );
    
    // Safely check if the user exists
    if (!result.rows || result.rows.length === 0) {
      console.log(`Login failed: Email not found - ${cleanEmail}`);
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    const user = result.rows[0];

    // 3. Verify password
    if (user.password_hash !== cleanPassword && user.password_hash !== password) {
      console.log(`Login failed: Password mismatch for - ${cleanEmail}`);
      return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
    }

    // 4. Fetch their display name based on their role
    let displayName = "User";
    if (user.role === 'CANDIDATE') {
       const profileRes = await pool.query('SELECT name FROM candidate_profiles WHERE user_id = $1', [user.id]);
       if (profileRes.rows && profileRes.rows.length > 0) displayName = profileRes.rows[0].name;
    } else if (user.role === 'EMPLOYER') {
       const empRes = await pool.query('SELECT company_name FROM employer_profiles WHERE user_id = $1', [user.id]);
       if (empRes.rows && empRes.rows.length > 0) displayName = empRes.rows[0].company_name;
    }

    // 5. Return success and the data your frontend localStorage needs
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: displayName
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}