import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      fullName,
      email,
      password,
      role,
      mobileNumber,
      mobile,
      phone,
      workStatus,
      hiringFor,
      companyName,
      industry,
      industryType,
      employees,
      employeeCount,
      designation,
      pincode,
      address,
      city,
      state,
    } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);
    const cleanEmail = String(email).trim().toLowerCase();
    const resolvedName = String(name || fullName || '').trim();
    const resolvedPhone = String(mobileNumber || mobile || phone || '')
      .replace(/\D/g, '')
      .slice(-10);
    const userRole =
      String(role || 'CANDIDATE').toUpperCase() === 'EMPLOYER'
        ? 'EMPLOYER'
        : 'CANDIDATE';

    // 1. Check if email already exists in `users`
    const existingUsers = await sql`
      SELECT id FROM users WHERE LOWER(TRIM(email)) = ${cleanEmail} LIMIT 1
    `;
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Account already exists with this email.' },
        { status: 409 }
      );
    }

    // 2. Detect exact password column name in `users` table (`password` vs `password_hash`)
    const userColumns = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
    `;
    const colSet = new Set(userColumns.map((c: any) => c.column_name));

    let newUsers;
    if (colSet.has('password_hash') && colSet.has('password')) {
      newUsers = await sql`
        INSERT INTO users (email, password, password_hash, role)
        VALUES (${cleanEmail}, ${password}, ${password}, ${userRole})
        RETURNING id, email, role
      `;
    } else if (colSet.has('password_hash')) {
      newUsers = await sql`
        INSERT INTO users (email, password_hash, role)
        VALUES (${cleanEmail}, ${password}, ${userRole})
        RETURNING id, email, role
      `;
    } else {
      newUsers = await sql`
        INSERT INTO users (email, password, role)
        VALUES (${cleanEmail}, ${password}, ${userRole})
        RETURNING id, email, role
      `;
    }

    const userId = newUsers[0].id;

    // 3. Create corresponding profile row in `employer_profiles` or `candidate_profiles`
    if (userRole === 'EMPLOYER') {
      await sql`
        ALTER TABLE employer_profiles
          ADD COLUMN IF NOT EXISTS full_name TEXT,
          ADD COLUMN IF NOT EXISTS phone TEXT,
          ADD COLUMN IF NOT EXISTS hiring_for TEXT DEFAULT 'company',
          ADD COLUMN IF NOT EXISTS company_name TEXT,
          ADD COLUMN IF NOT EXISTS industry_type TEXT DEFAULT 'Software Services',
          ADD COLUMN IF NOT EXISTS employee_count TEXT,
          ADD COLUMN IF NOT EXISTS designation TEXT,
          ADD COLUMN IF NOT EXISTS pincode TEXT,
          ADD COLUMN IF NOT EXISTS address TEXT,
          ADD COLUMN IF NOT EXISTS city TEXT,
          ADD COLUMN IF NOT EXISTS state TEXT,
          ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'PENDING'
      `;

      await sql`
        INSERT INTO employer_profiles (
          user_id,
          full_name,
          phone,
          hiring_for,
          company_name,
          industry_type,
          employee_count,
          designation,
          pincode,
          address,
          city,
          state,
          kyc_status
        ) VALUES (
          ${userId},
          ${resolvedName},
          ${resolvedPhone},
          ${hiringFor || 'company'},
          ${companyName || resolvedName},
          ${industry || industryType || 'Software Services'},
          ${employees || employeeCount || ''},
          ${designation || ''},
          ${pincode || ''},
          ${address || ''},
          ${city || ''},
          ${state || ''},
          'PENDING'
        )
      `;
    } else {
      await sql`
        ALTER TABLE candidate_profiles
          ADD COLUMN IF NOT EXISTS name VARCHAR(255),
          ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
          ADD COLUMN IF NOT EXISTS work_status VARCHAR(50) DEFAULT 'experienced'
      `;

      const resolvedWorkStatus =
        String(workStatus || '').toLowerCase() === 'fresher'
          ? 'fresher'
          : 'experienced';

      await sql`
        INSERT INTO candidate_profiles (
          user_id,
          name,
          phone,
          work_status
        ) VALUES (
          ${userId},
          ${resolvedName},
          ${resolvedPhone},
          ${resolvedWorkStatus}
        )
      `;
    }

    return NextResponse.json(
      {
        message: 'Registration successful',
        user: {
          id: userId,
          name: resolvedName,
          email: cleanEmail,
          role: userRole,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/register error:', error);
    return NextResponse.json(
      { error: error?.message || 'Registration failed.' },
      { status: 500 }
    );
  }
}