import { NextResponse } from 'next/server';
import {
  sql,
  safeString,
  verifyPassword,
  hashPassword,
  createSessionToken,
  logAuditEvent,
} from '../../../utils/db';

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
      await logAuditEvent({
        actorEmail: email,
        action: 'LOGIN_FAILED',
        details: 'Account not found',
      });
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const user = users[0];
    const storedPassword = String(user.password_hash ?? user.password ?? '');

    const { valid, needsRehash } = verifyPassword(password, storedPassword);

    if (!valid) {
      await logAuditEvent({
        actorEmail: email,
        actorRole: String(user.role || 'CANDIDATE'),
        action: 'LOGIN_FAILED',
        details: 'Invalid password',
      });
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Automatically upgrade legacy plaintext password to scrypt hash in Neon DB
    if (needsRehash) {
      try {
        const upgradedHash = hashPassword(password);
        await sql`
          UPDATE users
          SET password_hash = ${upgradedHash}
          WHERE id = ${user.id}
        `;
        await logAuditEvent({
          actorEmail: email,
          actorRole: String(user.role || 'CANDIDATE'),
          action: 'PASSWORD_HASH_UPGRADED',
          details: 'Legacy password automatically migrated to scrypt hash',
        });
      } catch {}
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

    await logAuditEvent({
      actorEmail: user.email,
      actorRole: role,
      action: 'LOGIN_SUCCESS',
      details: `Authenticated as ${role}`,
    });

    const userPayload = {
      id: user.id,
      email: user.email,
      role,
      name,
      companyName,
      phone,
      avatar,
    };

    const token = createSessionToken({
      id: Number(user.id),
      email: String(user.email),
      role,
    });

    const response = NextResponse.json({
      success: true,
      ...userPayload,
      user: userPayload,
    });

    response.cookies.set('rm_session', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('POST /api/login error:', error);
    return NextResponse.json(
      { error: error?.message || 'Authentication failed.' },
      { status: 500 }
    );
  }
}