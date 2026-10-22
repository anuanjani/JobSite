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
      SELECT id, email, password, role
      FROM users
      WHERE LOWER(TRIM(email)) = ${email}
      LIMIT 1
    `;

    if (users.length === 0 || users[0].password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const user = users[0];
    const role = String(user.role || 'CANDIDATE').toUpperCase();
    let name = '';
    let avatar = '';
    let phone = '';

    if (role === 'EMPLOYER') {
      try {
        const emp = await sql`
          SELECT full_name, company_name, phone, avatar
          FROM employer_profiles
          WHERE user_id = ${user.id}
          LIMIT 1
        `;
        if (emp.length > 0) {
          name = emp[0].full_name || emp[0].company_name || '';
          phone = emp[0].phone || '';
          avatar = emp[0].avatar || '';
        }
      } catch {}
    } else {
      try {
        const cand = await sql`
          SELECT name, phone, avatar
          FROM candidate_profiles
          WHERE user_id = ${user.id}
          LIMIT 1
        `;
        if (cand.length > 0) {
          name = cand[0].name || '';
          phone = cand[0].phone || '';
          avatar = cand[0].avatar || '';
        }
      } catch {}
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role,
        name,
        phone,
        avatar,
      },
    });
  } catch (error) {
    console.error('POST /api/login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed.' },
      { status: 500 }
    );
  }
}