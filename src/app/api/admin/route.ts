import { NextResponse } from 'next/server';
import {
  sql,
  safeString,
  safePositiveInt,
  logAuditEvent,
} from '../../../utils/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await sql`
      SELECT id, email, role, created_at FROM users ORDER BY id DESC
    `;

    const employers = await sql`
      SELECT
        ep.*,
        u.email AS user_email,
        (
          SELECT status FROM subscriptions s
          WHERE s.user_id = ep.user_id
          ORDER BY s.id DESC LIMIT 1
        ) AS subscription_status
      FROM employer_profiles ep
      LEFT JOIN users u ON u.id = ep.user_id
      ORDER BY ep.id DESC
    `;

    const jobsCountRows = await sql`
      SELECT COUNT(*)::int AS count FROM jobs
    `;
    const appsCountRows = await sql`
      SELECT COUNT(*)::int AS count FROM job_applications
    `;

    let auditLogs: any[] = [];
    try {
      auditLogs = await sql`
        SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50
      `;
    } catch {}

    return NextResponse.json({
      stats: {
        totalUsers: users.length,
        totalCandidates: users.filter(
          (u: any) => String(u.role || '').toUpperCase() === 'CANDIDATE'
        ).length,
        totalEmployers: users.filter(
          (u: any) => String(u.role || '').toUpperCase() === 'EMPLOYER'
        ).length,
        totalJobs: jobsCountRows[0]?.count || 0,
        totalApplications: appsCountRows[0]?.count || 0,
      },
      employers,
      auditLogs,
    });
  } catch (error) {
    console.error('GET /api/admin error:', error);
    return NextResponse.json(
      { error: 'Failed to load admin console data' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const action = safeString(body?.action, 50);

    if (action === 'updateKyc') {
      const employerId = safePositiveInt(body?.employerId);
      const kycStatus = safeString(body?.kycStatus, 30).toUpperCase();

      if (!employerId || !['VERIFIED', 'REJECTED', 'PENDING'].includes(kycStatus)) {
        return NextResponse.json(
          { error: 'Valid employerId and kycStatus required.' },
          { status: 400 }
        );
      }

      await sql`
        UPDATE employer_profiles
        SET kyc_status = ${kycStatus}
        WHERE id = ${employerId}
      `;

      await logAuditEvent({
        actorEmail: 'admin@rolematch.com',
        actorRole: 'ADMIN',
        action: 'KYC_STATUS_UPDATED',
        target: `Employer #${employerId}`,
        details: `KYC status set to ${kycStatus}`,
      });

      return NextResponse.json({ success: true, kycStatus });
    }

    if (action === 'toggleSubscription') {
      const userId = safePositiveInt(body?.userId);
      const status = safeString(body?.status, 30).toUpperCase();

      if (!userId || !['ACTIVE', 'INACTIVE'].includes(status)) {
        return NextResponse.json(
          { error: 'Valid userId and subscription status required.' },
          { status: 400 }
        );
      }

      await sql`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          plan_name VARCHAR(100) DEFAULT 'RESDEX_PRO',
          status VARCHAR(50) DEFAULT 'ACTIVE',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;

      if (status === 'ACTIVE') {
        await sql`
          INSERT INTO subscriptions (user_id, plan_name, status)
          VALUES (${userId}, 'ENTERPRISE_RESDEX_PRO', 'ACTIVE')
        `;
      }

      await logAuditEvent({
        actorEmail: 'admin@rolematch.com',
        actorRole: 'ADMIN',
        action: 'SUBSCRIPTION_UPDATED',
        target: `User #${userId}`,
        details: `Resdex Pro subscription set to ${status}`,
      });

      return NextResponse.json({ success: true, status });
    }

    return NextResponse.json({ error: 'Unknown admin action' }, { status: 400 });
  } catch (error) {
    console.error('PATCH /api/admin error:', error);
    return NextResponse.json(
      { error: 'Failed to execute admin action' },
      { status: 500 }
    );
  }
}