import { NextResponse } from 'next/server';
import { sql, safeString } from '../../../../utils/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = safeString(body?.email, 254).toLowerCase();
    const rawMobile = safeString(body?.mobile, 20);
    const mobile = rawMobile.replace(/\D/g, '');

    if (email) {
      const existingEmail = await sql`
        SELECT id FROM users WHERE LOWER(TRIM(email)) = ${email} LIMIT 1
      `;
      if (existingEmail.length > 0) {
        return NextResponse.json(
          {
            exists: true,
            error: 'This Email ID is already registered. Please sign in.',
          },
          { status: 409 }
        );
      }
    }

    if (mobile) {
      if (mobile.length !== 10) {
        return NextResponse.json(
          { exists: false, error: 'Invalid 10-digit mobile number.' },
          { status: 400 }
        );
      }

      let mobileExists = false;

      try {
        const candRows = await sql`
          SELECT id FROM candidate_profiles
          WHERE REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g') = ${mobile}
          LIMIT 1
        `;
        if (candRows.length > 0) mobileExists = true;
      } catch {}

      if (!mobileExists) {
        try {
          const empRows = await sql`
            SELECT id FROM employer_profiles
            WHERE REGEXP_REPLACE(COALESCE(phone, ''), '[^0-9]', '', 'g') = ${mobile}
            LIMIT 1
          `;
          if (empRows.length > 0) mobileExists = true;
        } catch {}
      }

      if (mobileExists) {
        return NextResponse.json(
          {
            exists: true,
            error: 'This mobile number is already registered.',
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error('POST /api/register/check error:', error);
    return NextResponse.json(
      { error: 'Validation check failed.' },
      { status: 500 }
    );
  }
}