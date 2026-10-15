import { NextResponse } from 'next/server';
import { pool } from '../../../utils/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Extract the role, defaulting to CANDIDATE if none is provided
    const { name, email, password, mobileNumber, workStatus, role } = body;
    const userRole = role === 'EMPLOYER' ? 'EMPLOYER' : 'CANDIDATE';

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Clean the inputs before saving to the database
    const cleanEmail = email.toLowerCase().trim();
    const cleanPassword = password.trim();

    // 2. Check if the user already exists safely
    const userCheck = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (userCheck.rows && userCheck.rows.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    // 3. Insert into the core `users` table with dynamic role
    const userInsert = await pool.query(
      `INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id`,
      [cleanEmail, cleanPassword, userRole]
    );
    
    const userId = userInsert.rows[0].id;

    // 4. Route data to the correct profile table based on role
    if (userRole === 'CANDIDATE') {
      await pool.query(
        `INSERT INTO candidate_profiles (user_id, name, phone) VALUES ($1, $2, $3)`,
        [userId, name.trim(), mobileNumber ? mobileNumber.trim() : '']
      );
    } else {
      // Future-proofing for Employer Registration
      await pool.query(
        `INSERT INTO employer_profiles (user_id, company_name) VALUES ($1, $2)`,
        [userId, name.trim()]
      );
    }

    return NextResponse.json({ success: true, message: "Account created successfully" });

  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.code === '23505') {
       return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    return NextResponse.json({ error: "Database error. Failed to create account." }, { status: 500 });
  }
}