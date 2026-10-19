import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, mobile, phone } = body;
    const rawPhone = mobile || phone || '';

    const sql = neon(process.env.DATABASE_URL!);

    // 1. Validate Email ID against `users` table (covers both candidates & employers)
    if (email) {
      const cleanEmail = String(email).trim().toLowerCase();
      const existingUser = await sql`
        SELECT id FROM users
        WHERE LOWER(TRIM(email)) = ${cleanEmail}
        LIMIT 1
      `;

      if (existingUser.length > 0) {
        return NextResponse.json(
          {
            exists: true,
            field: 'email',
            error: 'This Email ID is already registered. Please sign in or use a different email.',
          },
          { status: 409 }
        );
      }
    }

    // 2. Validate Mobile Number against `candidate_profiles` and `employer_profiles`
    if (rawPhone) {
      const digitsOnly = String(rawPhone).replace(/\D/g, '');
      const cleanPhone =
        digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;

      if (cleanPhone.length !== 10) {
        return NextResponse.json(
          {
            exists: false,
            field: 'mobile',
            error: 'Please enter a valid 10-digit mobile number.',
          },
          { status: 400 }
        );
      }

      // Check candidate_profiles.phone
      const existingCandidate = await sql`
        SELECT id FROM candidate_profiles
        WHERE REGEXP_REPLACE(COALESCE(phone, ''), '\\D', '', 'g') LIKE ${'%' + cleanPhone}
        LIMIT 1
      `;

      if (existingCandidate.length > 0) {
        return NextResponse.json(
          {
            exists: true,
            field: 'mobile',
            error: 'This mobile number is already registered with a candidate account.',
          },
          { status: 409 }
        );
      }

      // Check employer_profiles.phone
      try {
        const existingEmployer = await sql`
          SELECT user_id FROM employer_profiles
          WHERE REGEXP_REPLACE(COALESCE(phone, ''), '\\D', '', 'g') LIKE ${'%' + cleanPhone}
          LIMIT 1
        `;

        if (existingEmployer.length > 0) {
          return NextResponse.json(
            {
              exists: true,
              field: 'mobile',
              error: 'This mobile number is already registered with an employer account.',
            },
            { status: 409 }
          );
        }
      } catch {
        // Ignore if phone column is not yet initialized on employer_profiles
      }
    }

    return NextResponse.json({ exists: false, available: true });
  } catch (error: any) {
    console.error('POST /api/register/check error:', error);
    return NextResponse.json(
      { error: 'Failed to validate against database. Please try again.' },
      { status: 500 }
    );
  }
}