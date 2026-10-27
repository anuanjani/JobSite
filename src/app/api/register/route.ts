import { NextResponse } from 'next/server';
import {
  sql,
  safeString,
  hashPassword,
  createSessionToken,
  logAuditEvent,
} from '../../../utils/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = safeString(body?.email, 254).toLowerCase();
    const password = safeString(body?.password, 256);
    const role = safeString(body?.role || 'CANDIDATE', 30).toUpperCase();
    const phone = safeString(body?.phone || body?.mobile, 30);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const existing = await sql`
      SELECT id FROM users WHERE LOWER(TRIM(email)) = ${email} LIMIT 1
    `;
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'This Email ID is already registered. Please sign in.' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);

    const insertedUser = await sql`
      INSERT INTO users (email, password_hash, role)
      VALUES (${email}, ${passwordHash}, ${role})
      RETURNING id, email, role
    `;
    const user = insertedUser[0];

    let displayName = '';

    if (role === 'EMPLOYER') {
      const fullName = safeString(
        body?.fullName || body?.name || body?.companyName,
        255
      );
      const companyName = safeString(
        body?.companyName || body?.fullName || 'Company',
        255
      );
      displayName = fullName || companyName;

      await sql`
        CREATE TABLE IF NOT EXISTS employer_profiles (
          id SERIAL PRIMARY KEY,
          user_id INTEGER UNIQUE,
          full_name VARCHAR(255),
          company_name VARCHAR(255),
          phone VARCHAR(50),
          hiring_for VARCHAR(100),
          industry_type VARCHAR(150),
          employee_count VARCHAR(100),
          designation VARCHAR(150),
          pincode VARCHAR(20),
          city VARCHAR(100),
          state VARCHAR(100),
          address TEXT,
          kyc_status VARCHAR(50) DEFAULT 'PENDING',
          kyc_doc_url TEXT,
          avatar TEXT
        )
      `;

      await sql`
        INSERT INTO employer_profiles (
          user_id, full_name, company_name, phone, hiring_for,
          industry_type, employee_count, designation, pincode, city, state, address, kyc_status
        ) VALUES (
          ${user.id},
          ${fullName},
          ${companyName},
          ${phone},
          ${safeString(body?.hiringFor || body?.accountType, 100)},
          ${safeString(body?.industryType, 150)},
          ${safeString(body?.employeeCount, 100)},
          ${safeString(body?.designation, 150)},
          ${safeString(body?.pincode, 20)},
          ${safeString(body?.city, 100)},
          ${safeString(body?.state, 100)},
          ${safeString(body?.address, 500)},
          'PENDING'
        )
      `;
    } else {
      const name = safeString(
        body?.name || body?.fullName || email.split('@')[0],
        255
      );
      displayName = name;

      await sql`
        INSERT INTO candidate_profiles (
          user_id, name, phone, location, work_status, updated_at
        ) VALUES (
          ${user.id},
          ${name},
          ${phone},
          ${safeString(body?.location, 255)},
          ${safeString(body?.workStatus || 'experienced', 50)},
          ${new Date().toISOString()}
        )
      `;
    }

    await logAuditEvent({
      actorEmail: email,
      actorRole: role,
      action: 'USER_REGISTERED',
      details: `New ${role} account registered`,
    });

    const userPayload = {
      id: user.id,
      email: user.email,
      role,
      name: displayName,
      phone,
    };

    const token = createSessionToken({
      id: Number(user.id),
      email: String(user.email),
      role,
    });

    const response = NextResponse.json(
      {
        success: true,
        ...userPayload,
        user: userPayload,
      },
      { status: 201 }
    );

    response.cookies.set('rm_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('POST /api/register error:', error);
    return NextResponse.json(
      { error: error?.message || 'Registration failed.' },
      { status: 500 }
    );
  }
}