import { NextResponse } from 'next/server';
import tls from 'tls';
import crypto from 'crypto';
import {
  sql,
  safeString,
  hashPassword,
  verifyPassword,
} from '../../../../utils/db';

export const dynamic = 'force-dynamic';

async function ensureEmailPasswordTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS email_password_verifications (
      email VARCHAR(255) PRIMARY KEY,
      password_hash TEXT NOT NULL,
      verified BOOLEAN DEFAULT FALSE,
      expires_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

/**
 * Generates a strong 10-character enterprise password (e.g. Rm#8392Kx!)
 */
function generateStrongEmailPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '@#$!';

  const pick = (charset: string) =>
    charset[crypto.randomInt(0, charset.length)];

  return (
    'Rm' +
    pick(symbols) +
    pick(digits) +
    pick(digits) +
    pick(digits) +
    pick(digits) +
    pick(upper) +
    pick(lower) +
    pick(symbols)
  );
}

/**
 * Zero-dependency native TLS SMTP sender (works with Gmail App Passwords,
 * Zoho, SES, Hostinger, or any port 465 SSL/TLS SMTP server).
 */
async function sendSmtpEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ sent: boolean; mode: 'smtp' | 'console' }> {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const fromEmail = process.env.SMTP_FROM || user || 'no-reply@rolematch.com';

  // If SMTP credentials are not configured in .env yet, log clearly to terminal
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
        // Wait for final line of multi-line SMTP response (4th char is space)
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
    const action = safeString(body?.action || 'send', 20).toLowerCase();
    const email = safeString(body?.email, 254).toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid official email address.' },
        { status: 400 }
      );
    }

    await ensureEmailPasswordTable();

    // 1. REAL-TIME DUPLICATE EMAIL CHECK AGAINST NEON DATABASE
    const existingUser = await sql`
      SELECT id FROM users WHERE LOWER(TRIM(email)) = ${email} LIMIT 1
    `;
    if (existingUser.length > 0) {
      return NextResponse.json(
        {
          error:
            'This Email ID is already registered. Please sign in or use a different email address.',
        },
        { status: 409 }
      );
    }

    // =========================================================================
    // ACTION 1: GENERATE & SEND PASSWORD TO EMAIL
    // =========================================================================
    if (action === 'send') {
      const generatedPassword = generateStrongEmailPassword();
      const hashed = hashPassword(generatedPassword);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

      await sql`
        INSERT INTO email_password_verifications (
          email, password_hash, verified, expires_at, updated_at
        ) VALUES (
          ${email}, ${hashed}, FALSE, ${expiresAt}, CURRENT_TIMESTAMP
        )
        ON CONFLICT (email) DO UPDATE SET
          password_hash = EXCLUDED.password_hash,
          verified = FALSE,
          expires_at = EXCLUDED.expires_at,
          updated_at = CURRENT_TIMESTAMP
      `;

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #0f172a; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
          <h2 style="margin: 0 0 12px; color: #ffffff;">ROLEMATCH<span style="color: #ec4899;">.</span> Email Verification</h2>
          <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
            Use the password below to verify your email address and complete your account registration:
          </p>
          <div style="margin: 20px 0; padding: 16px; background: #020617; border: 1px solid #334155; border-radius: 12px; text-align: center;">
            <span style="font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #38bdf8; font-family: monospace;">
              ${generatedPassword}
            </span>
          </div>
          <p style="font-size: 12px; color: #94a3b8;">
            Enter this exact password in the Password field on the registration screen. Valid for 15 minutes.
          </p>
        </div>
      `;

      const mailResult = await sendSmtpEmail({
        to: email,
        subject: 'Your Rolematch Verification Password',
        html: emailHtml,
      });

      if (mailResult.mode === 'console') {
        console.log('\n======================================================');
        console.log(`📧 [ROLEMATCH EMAIL PASSWORD] To: ${email}`);
        console.log(`🔑 Generated Password: ${generatedPassword}`);
        console.log(
          '💡 Tip: Add SMTP_USER and SMTP_PASS in .env to send via real SMTP.'
        );
        console.log('======================================================\n');
      }

      return NextResponse.json({
        success: true,
        mode: mailResult.mode,
        message:
          mailResult.mode === 'smtp'
            ? `A verification password has been sent to ${email}. Please enter it in the password field below.`
            : `Password triggered for ${email}! (Check your email inbox or server terminal if SMTP is not set in .env).`,
      });
    }

    // =========================================================================
    // ACTION 2: VERIFY THAT USER ENTERED THE EXACT EMAILED PASSWORD
    // =========================================================================
    if (action === 'verify') {
      const inputPassword = safeString(body?.password, 256);
      if (!inputPassword) {
        return NextResponse.json(
          { error: 'Please enter the password sent to your email.' },
          { status: 400 }
        );
      }

      const rows = await sql`
        SELECT * FROM email_password_verifications
        WHERE LOWER(TRIM(email)) = ${email}
        LIMIT 1
      `;

      if (rows.length === 0) {
        return NextResponse.json(
          {
            error:
              'Please click "Get Password on Email" first to receive your verification password.',
          },
          { status: 400 }
        );
      }

      const record = rows[0];
      if (new Date(record.expires_at).getTime() < Date.now()) {
        return NextResponse.json(
          {
            error:
              'Your emailed password has expired. Please click "Resend Password" to get a new one.',
          },
          { status: 400 }
        );
      }

      const { valid } = verifyPassword(inputPassword, record.password_hash);
      if (!valid) {
        return NextResponse.json(
          {
            error:
              'The password you entered does not match the password sent to your email.',
          },
          { status: 401 }
        );
      }

      await sql`
        UPDATE email_password_verifications
        SET verified = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE LOWER(TRIM(email)) = ${email}
      `;

      return NextResponse.json({
        success: true,
        verified: true,
        message: 'Email and password verified successfully!',
      });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    console.error('POST /api/register/email-password error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process email verification.' },
      { status: 500 }
    );
  }
}