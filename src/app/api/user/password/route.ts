import { NextResponse } from 'next/server';
import tls from 'tls';
import crypto from 'crypto';
import {
  sql,
  safeString,
  hashPassword,
  verifyPassword,
  logAuditEvent,
} from '../../../../utils/db';

export const dynamic = 'force-dynamic';

async function ensurePasswordResetTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS password_reset_requests (
      email VARCHAR(255) PRIMARY KEY,
      code_hash TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

/**
 * Validates enterprise password complexity:
 * At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
 */
function isStrongPassword(pwd: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pwd);
}

/**
 * Native TLS SMTP sender (uses SMTP_* env vars or falls back to terminal output in dev).
 */
async function sendResetEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean; mode: 'smtp' | 'console' }> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const fromEmail = process.env.SMTP_FROM || user || 'no-reply@rolematch.com';

  if (!user || !pass) {
    return { sent: true, mode: 'console' };
  }

  return new Promise((resolve, reject) => {
    const socket = tls.connect(
      { host, port, rejectUnauthorized: false },
      () => {}
    );

    let buffer = '';
    let step = 0;

    const sendLine = (line: string) => {
      socket.write(line + '\r\n');
    };

    socket.setTimeout(12000, () => {
      socket.destroy();
      reject(new Error('SMTP connection timed out.'));
    });

    socket.on('error', (err) => {
      reject(err);
    });

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\r\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line) continue;
        if (line.length >= 4 && line[3] === '-') continue;

        const code = parseInt(line.slice(0, 3), 10);
        if (code >= 400) {
          socket.destroy();
          reject(new Error(`SMTP Error (${code}): ${line}`));
          return;
        }

        if (step === 0 && code === 220) {
          step = 1;
          sendLine('EHLO rolematch.local');
        } else if (step === 1 && code === 250) {
          step = 2;
          sendLine('AUTH LOGIN');
        } else if (step === 2 && code === 334) {
          step = 3;
          sendLine(Buffer.from(user).toString('base64'));
        } else if (step === 3 && code === 334) {
          step = 4;
          sendLine(Buffer.from(pass).toString('base64'));
        } else if (step === 4 && code === 235) {
          step = 5;
          sendLine(`MAIL FROM:<${fromEmail}>`);
        } else if (step === 5 && code === 250) {
          step = 6;
          sendLine(`RCPT TO:<${params.to}>`);
        } else if (step === 6 && code === 250) {
          step = 7;
          sendLine('DATA');
        } else if (step === 7 && code === 354) {
          step = 8;
          const message = [
            `From: "Rolematch Security" <${fromEmail}>`,
            `To: <${params.to}>`,
            `Subject: ${params.subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            '',
            params.html,
            '.',
          ].join('\r\n');
          sendLine(message);
        } else if (step === 8 && code === 250) {
          step = 9;
          sendLine('QUIT');
          socket.end();
          resolve({ sent: true, mode: 'smtp' });
        }
      }
    });
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = safeString(body?.action, 30).toLowerCase();
    const email = safeString(body?.email, 254).toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const userRows = await sql`
      SELECT id, email, role, password_hash
      FROM users
      WHERE LOWER(TRIM(email)) = ${email}
      LIMIT 1
    `;

    if (userRows.length === 0) {
      return NextResponse.json(
        { error: 'No registered account found with this email address.' },
        { status: 404 }
      );
    }

    const user = userRows[0];
    const role = String(user.role || 'CANDIDATE').toUpperCase();

    // =========================================================================
    // BRANCH 1: LOGGED-IN USER CHANGING PASSWORD (CANDIDATE OR EMPLOYER)
    // =========================================================================
    if (action === 'change') {
      const currentPassword = safeString(body?.currentPassword, 256);
      const newPassword = safeString(body?.newPassword, 256);

      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: 'Current password and new password are required.' },
          { status: 400 }
        );
      }

      if (!isStrongPassword(newPassword)) {
        return NextResponse.json(
          {
            error:
              'New password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
          },
          { status: 400 }
        );
      }

      const storedHash = String(user.password_hash || '');
      const { valid } = verifyPassword(currentPassword, storedHash);

      if (!valid) {
        await logAuditEvent({
          actorEmail: email,
          actorRole: role,
          action: 'PASSWORD_CHANGE_FAILED',
          details: 'Incorrect current password provided',
        });
        return NextResponse.json(
          { error: 'Your current password is incorrect.' },
          { status: 401 }
        );
      }

      if (currentPassword === newPassword) {
        return NextResponse.json(
          {
            error:
              'New password must be different from your current password.',
          },
          { status: 400 }
        );
      }

      const newHash = hashPassword(newPassword);
      await sql`
        UPDATE users
        SET password_hash = ${newHash}
        WHERE id = ${user.id}
      `;

      await logAuditEvent({
        actorEmail: email,
        actorRole: role,
        action: 'PASSWORD_CHANGED',
        details: `${role} changed account password from Settings`,
      });

      return NextResponse.json({
        success: true,
        message: 'Your password has been updated successfully!',
      });
    }

    // =========================================================================
    // BRANCH 2: FORGOT PASSWORD — SEND 6-DIGIT RESET CODE TO EMAIL
    // =========================================================================
    if (action === 'forgot-send') {
      await ensurePasswordResetTable();

      const resetCode = String(crypto.randomInt(100000, 999999));
      const codeHash = hashPassword(resetCode);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      await sql`
        INSERT INTO password_reset_requests (
          email, code_hash, expires_at, updated_at
        ) VALUES (
          ${email}, ${codeHash}, ${expiresAt}, CURRENT_TIMESTAMP
        )
        ON CONFLICT (email) DO UPDATE SET
          code_hash = EXCLUDED.code_hash,
          expires_at = EXCLUDED.expires_at,
          updated_at = CURRENT_TIMESTAMP
      `;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
          <h2 style="margin: 0 0 12px; color: #ffffff;">ROLEMATCH<span style="color: #ec4899;">.</span> Password Reset</h2>
          <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
            We received a request to reset the password for your <strong>${role}</strong> account (${email}). Enter the 6-digit verification code below to set a new password:
          </p>
          <div style="margin: 20px 0; padding: 16px; background: #020617; border: 1px solid #334155; border-radius: 12px; text-align: center;">
            <span style="font-size: 26px; font-weight: bold; letter-spacing: 6px; color: #38bdf8; font-family: monospace;">
              ${resetCode}
            </span>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">
            This code is valid for 15 minutes. If you did not request a password reset, you can safely ignore this email.
          </p>
        </div>
      `;

      const mailResult = await sendResetEmail({
        to: email,
        subject: 'Your Rolematch Password Reset Code',
        html: emailHtml,
      });

      if (mailResult.mode === 'console') {
        console.log('\n======================================================');
        console.log(`🔐 [ROLEMATCH PASSWORD RESET] To: ${email} (${role})`);
        console.log(`🔢 6-Digit Reset Code: ${resetCode}`);
        console.log('======================================================\n');
      }

      await logAuditEvent({
        actorEmail: email,
        actorRole: role,
        action: 'PASSWORD_RESET_REQUESTED',
        details: `Password reset code sent (${mailResult.mode})`,
      });

      return NextResponse.json({
        success: true,
        mode: mailResult.mode,
        message:
          mailResult.mode === 'smtp'
            ? `A 6-digit password reset code has been sent to ${email}.`
            : `Reset code triggered for ${email}! (Check your email inbox or VS Code terminal console).`,
      });
    }

    // =========================================================================
    // BRANCH 3: FORGOT PASSWORD — VERIFY CODE & SAVE NEW PASSWORD
    // =========================================================================
    if (action === 'forgot-reset') {
      const code = safeString(body?.code, 20).trim();
      const newPassword = safeString(body?.newPassword, 256);

      if (!code || !newPassword) {
        return NextResponse.json(
          { error: 'Reset code and new password are required.' },
          { status: 400 }
        );
      }

      if (!isStrongPassword(newPassword)) {
        return NextResponse.json(
          {
            error:
              'New password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
          },
          { status: 400 }
        );
      }

      await ensurePasswordResetTable();

      const reqRows = await sql`
        SELECT * FROM password_reset_requests
        WHERE LOWER(TRIM(email)) = ${email}
        LIMIT 1
      `;

      if (reqRows.length === 0) {
        return NextResponse.json(
          {
            error:
              'No active reset request found. Please request a new reset code.',
          },
          { status: 400 }
        );
      }

      const resetRecord = reqRows[0];
      if (new Date(resetRecord.expires_at).getTime() < Date.now()) {
        return NextResponse.json(
          {
            error:
              'Your reset code has expired. Please click "Resend Code" to get a new one.',
          },
          { status: 400 }
        );
      }

      const { valid } = verifyPassword(code, resetRecord.code_hash);
      if (!valid) {
        return NextResponse.json(
          {
            error:
              'Invalid 6-digit reset code. Please check the code sent to your email.',
          },
          { status: 401 }
        );
      }

      const newHash = hashPassword(newPassword);
      await sql`
        UPDATE users
        SET password_hash = ${newHash}
        WHERE id = ${user.id}
      `;

      await sql`
        DELETE FROM password_reset_requests WHERE LOWER(TRIM(email)) = ${email}
      `;

      await logAuditEvent({
        actorEmail: email,
        actorRole: role,
        action: 'PASSWORD_RESET_COMPLETED',
        details: `${role} reset password via email verification code`,
      });

      return NextResponse.json({
        success: true,
        message:
          'Password reset successfully! Redirecting you to Sign In...',
      });
    }

    return NextResponse.json(
      { error: 'Unsupported password action.' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('POST /api/user/password error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process password request.' },
      { status: 500 }
    );
  }
}