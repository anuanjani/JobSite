import { NextResponse } from 'next/server';
import { sql, safeString } from '../../../utils/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = safeString(body?.email, 254).toLowerCase();
    const password = safeString(body?.password, 256);

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const users = await sql`
      SELECT *
      FROM users
      WHERE LOWER(TRIM(email)) = ${email}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const user = users[0];
    const storedPassword = user.password_hash ?? user.password ?? '';

    if (String(storedPassword) !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const role = String(user.role || 'CANDIDATE').toUpperCase();
    let name = user.name || '';
    let avatar = '';
    let phone = '';
    let companyName = '';

    if (role === 'EMPLOYER') {
      try {
        const emp = await sql`
          SELECT *
          FROM employer_profiles
          WHERE user_id = ${user.id}
          LIMIT 1
        `;
        if (emp.length > 0) {
          name = emp[0].full_name || emp[0].company_name || name;
          companyName = emp[0].company_name || '';
          phone = emp[0].phone || '';
          avatar = emp[0].avatar || '';
        }
      } catch {}
    } else {
      try {
        const cand = await sql`
          SELECT *
          FROM candidate_profiles
          WHERE user_id = ${user.id}
          LIMIT 1
        `;
        if (cand.length > 0) {
          name = cand[0].name || name;
          phone = cand[0].phone || '';
          avatar = cand[0].avatar || '';
        }
      } catch {}
    }

    const userPayload = {
      id: user.id,
      email: user.email,
      role,
      name,
      companyName,
      phone,
      avatar,
    };

    return NextResponse.json({
      success: true,
      ...userPayload,
      user: userPayload,
    });
  } catch (error: any) {
    console.error('POST /api/login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Authentication failed.' },
      { status: 500 }
    );
  }
}