import { NextResponse } from 'next/server';
import { pool } from '../../../utils/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const { 
      email, name, role, location, phone, avatar, resumeUrl, resumeHeadline, keySkills,
      gender, moreInfo, maritalStatus, dob, category, 
      usWorkPermit, otherWorkPermits, address, hometown, pincode, languages, profileSummary 
    } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Get the user_id for this email from the core users table
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (userRes.rowCount === 0) {
      return NextResponse.json({ error: "User not found. Please log in again." }, { status: 404 });
    }
    const userId = userRes.rows[0].id;

    // 2. Upsert the candidate profile using job_role instead of current_role
    const query = `
      INSERT INTO candidate_profiles (
        user_id, name, job_role, location, phone, avatar_url, resume_url, resume_headline,
        key_skills, gender, more_info, marital_status, dob, category, 
        us_work_permit, other_work_permits, address, hometown, pincode, languages, profile_summary
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      ) ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        job_role = EXCLUDED.job_role,
        location = EXCLUDED.location,
        phone = EXCLUDED.phone,
        avatar_url = EXCLUDED.avatar_url,
        resume_url = EXCLUDED.resume_url,
        resume_headline = EXCLUDED.resume_headline,
        key_skills = EXCLUDED.key_skills,
        gender = EXCLUDED.gender,
        more_info = EXCLUDED.more_info,
        marital_status = EXCLUDED.marital_status,
        dob = EXCLUDED.dob,
        category = EXCLUDED.category,
        us_work_permit = EXCLUDED.us_work_permit,
        other_work_permits = EXCLUDED.other_work_permits,
        address = EXCLUDED.address,
        hometown = EXCLUDED.hometown,
        pincode = EXCLUDED.pincode,
        languages = EXCLUDED.languages,
        profile_summary = EXCLUDED.profile_summary,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const values = [
      userId, name, role || '', location || '', phone || '', avatar || '', resumeUrl || '', resumeHeadline || '', 
      JSON.stringify(keySkills || []), gender || '', JSON.stringify(moreInfo || []), 
      maritalStatus || '', JSON.stringify(dob || {}), category || '', 
      usWorkPermit || '', JSON.stringify(otherWorkPermits || []), 
      address || '', hometown || '', pincode || '', 
      JSON.stringify(languages || []), profileSummary || ''
    ];

    await pool.query(query, values);

    return NextResponse.json({ success: true, message: "Profile updated successfully" });
    
  } catch (error) {
    console.error("Profile save error:", error);
    return NextResponse.json({ error: "Failed to save profile data" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Join the users table with the candidate_profiles table to get everything at once
    const query = `
      SELECT u.email, cp.* 
      FROM users u
      LEFT JOIN candidate_profiles cp ON u.id = cp.user_id
      WHERE u.email = $1
    `;

    const result = await pool.query(query, [email]);
    const dbResult = result.rows[0];

    if (!dbResult) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Map the snake_case database columns back to camelCase frontend variables
    return NextResponse.json({
      email: dbResult.email,
      name: dbResult.name || '',
      role: dbResult.job_role || '',
      location: dbResult.location || '',
      phone: dbResult.phone || '',
      avatar: dbResult.avatar_url || '',
      resumeUrl: dbResult.resume_url || '',
      resumeHeadline: dbResult.resume_headline || '',
      profileSummary: dbResult.profile_summary || '',
      keySkills: dbResult.key_skills || [],
      gender: dbResult.gender || '',
      moreInfo: dbResult.more_info || [],
      maritalStatus: dbResult.marital_status || '',
      dob: dbResult.dob || { day: '', month: '', year: '' },
      category: dbResult.category || '',
      usWorkPermit: dbResult.us_work_permit || '',
      otherWorkPermits: dbResult.other_work_permits || [],
      address: dbResult.address || '',
      hometown: dbResult.hometown || '',
      pincode: dbResult.pincode || '',
      languages: dbResult.languages || []
    });

  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch profile data" }, { status: 500 });
  }
}