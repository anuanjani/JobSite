import { NextResponse } from 'next/server';
import { sql, safeString, safePositiveInt } from '../../../utils/db';

export const dynamic = 'force-dynamic';

/**
 * Masks an email address as: an***j***@live.in (used for Candidate view)
 */
function maskEmailString(rawEmail: string): string {
  const email = rawEmail.trim();
  if (!email.includes('@')) return email;
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;

  if (localPart.length >= 6) {
    const firstTwo = localPart.slice(0, 2);
    const midChar = localPart[Math.ceil(localPart.length / 2)];
    return `${firstTwo}***${midChar}***@${domain}`;
  }
  if (localPart.length > 2) {
    return `${localPart.slice(0, 2)}***@${domain}`;
  }
  return `${localPart.charAt(0)}***@${domain}`;
}

/**
 * Masks any email address, numeric phone number, and spelled-out phone number
 * for Candidates reading recruiter messages.
 */
export function maskSensitiveContent(text: string): string {
  if (!text) return '';

  let result = text;

  // 1. Mask email addresses inside message text
  result = result.replace(
    /\b([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
    (match) => maskEmailString(match)
  );

  // 2. Mask spelled-out number sequences
  const wordToDigit: Record<string, string> = {
    zero: '0',
    oh: '0',
    one: '1',
    two: '2',
    three: '3',
    four: '4',
    five: '5',
    six: '6',
    seven: '7',
    eight: '8',
    nine: '9',
  };

  const numberWordPattern =
    /\b(?:(?:zero|oh|one|two|three|four|five|six|seven|eight|nine|double|triple)[\s,-]*){6,15}\b/gi;

  result = result.replace(numberWordPattern, (match) => {
    const tokens = match
      .toLowerCase()
      .trim()
      .split(/[\s,-]+/);
    let digits = '';
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if ((tok === 'double' || tok === 'triple') && i + 1 < tokens.length) {
        const nextDigit = wordToDigit[tokens[i + 1]];
        if (nextDigit !== undefined) {
          digits += nextDigit.repeat(tok === 'double' ? 2 : 3);
          i++;
          continue;
        }
      }
      if (wordToDigit[tok] !== undefined) {
        digits += wordToDigit[tok];
      }
    }
    if (digits.length >= 6) {
      const lastFour = digits.slice(-4);
      return `+91-******${lastFour}`;
    }
    return match;
  });

  // 3. Mask numeric phone numbers
  result = result.replace(
    /(?:\+?91[\s.-]?)?\b([6-9]\d{5})(\d{4})\b/g,
    (_match, _firstSix, lastFour) => `+91-******${lastFour}`
  );

  result = result.replace(
    /\b(?:\d[\s-]?){6,9}(\d{4})\b/g,
    (_match, lastFour) => `+91-******${lastFour}`
  );

  return result;
}

async function ensureMessagesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      sender_email VARCHAR(255) NOT NULL,
      sender_name VARCHAR(255),
      sender_company VARCHAR(255),
      receiver_email VARCHAR(255) NOT NULL,
      subject VARCHAR(255),
      body TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    ALTER TABLE messages
      ADD COLUMN IF NOT EXISTS notif_type VARCHAR(50) DEFAULT 'MESSAGE',
      ADD COLUMN IF NOT EXISTS job_id INTEGER,
      ADD COLUMN IF NOT EXISTS application_id INTEGER
  `;
}

/**
 * Syncs any job_applications for jobs owned by this employer into the messages table
 * so existing & new job applications immediately trigger the employer's bell icon.
 */
async function syncEmployerApplicationNotifications(employerEmail: string) {
  try {
    const users = await sql`
      SELECT id, email, role FROM users WHERE LOWER(TRIM(email)) = ${employerEmail} LIMIT 1
    `;
    if (users.length === 0) return;

    const user = users[0];
    if (String(user.role || '').toUpperCase() !== 'EMPLOYER') return;

    let companyName = '';
    let fullName = '';
    try {
      const empRows = await sql`
        SELECT company_name, full_name FROM employer_profiles WHERE user_id = ${user.id} LIMIT 1
      `;
      if (empRows.length > 0) {
        companyName = String(empRows[0].company_name || '').trim();
        fullName = String(empRows[0].full_name || '').trim();
      }
    } catch {}

    // Find all applications for jobs belonging to this employer
    const apps = await sql`
      SELECT
        ja.*,
        j.title AS job_title,
        j.company_name AS job_company,
        j.employer_email AS job_employer_email,
        j.employer_id AS job_employer_id
      FROM job_applications ja
      INNER JOIN jobs j ON j.id = ja.job_id
      WHERE
        LOWER(TRIM(COALESCE(j.employer_email, ''))) = ${employerEmail}
        OR j.employer_id = ${user.id}
        OR (
          ${companyName} <> ''
          AND LOWER(TRIM(COALESCE(j.company_name, ''))) = LOWER(${companyName})
        )
        OR (
          ${fullName} <> ''
          AND LOWER(TRIM(COALESCE(j.company_name, ''))) = LOWER(${fullName})
        )
      ORDER BY ja.id DESC
    `;

    for (const app of apps) {
      const candEmail = String(app.candidate_email || '').trim().toLowerCase();
      if (!candEmail) continue;

      const existingNotif = await sql`
        SELECT id FROM messages
        WHERE LOWER(TRIM(receiver_email)) = ${employerEmail}
          AND job_id = ${app.job_id}
          AND LOWER(TRIM(sender_email)) = ${candEmail}
        LIMIT 1
      `;

      if (existingNotif.length === 0) {
        const candName = String(
          app.candidate_name || candEmail.split('@')[0] || 'Candidate'
        );
        const jobTitle = String(app.job_title || 'Open Role');
        const expText = app.experience ? ` • Exp: ${app.experience}` : '';
        const npText = app.notice_period
          ? ` • Notice: ${app.notice_period}`
          : '';
        const summaryBody = `${candName} applied for ${jobTitle}${expText}${npText}. Click to review full candidate profile, contact details, and resume.`;

        await sql`
          INSERT INTO messages (
            sender_email,
            sender_name,
            sender_company,
            receiver_email,
            subject,
            body,
            is_read,
            notif_type,
            job_id,
            application_id
          ) VALUES (
            ${candEmail},
            ${candName},
            ${`Applied for: ${jobTitle}`},
            ${employerEmail},
            ${`New Job Application: ${jobTitle}`},
            ${summaryBody},
            FALSE,
            'JOB_APPLICATION',
            ${app.job_id},
            ${app.id}
          )
        `;
      }
    }
  } catch (err) {
    console.error('syncEmployerApplicationNotifications error:', err);
  }
}

/**
 * Loads full unmasked candidate profile details for an employer reviewing an applicant.
 */
async function getCandidateDetailsForEmployer(
  candidateEmail: string,
  jobId?: number | null,
  applicationId?: number | null
) {
  try {
    const cleanEmail = candidateEmail.trim().toLowerCase();
    const userRows = await sql`
      SELECT id, email FROM users WHERE LOWER(TRIM(email)) = ${cleanEmail} LIMIT 1
    `;

    let cp: Record<string, any> = {};
    if (userRows.length > 0) {
      const profRows = await sql`
        SELECT * FROM candidate_profiles WHERE user_id = ${userRows[0].id} LIMIT 1
      `;
      if (profRows.length > 0) {
        cp = profRows[0];
      }
    }

    let appRow: Record<string, any> = {};
    if (applicationId) {
      const aRows = await sql`
        SELECT * FROM job_applications WHERE id = ${applicationId} LIMIT 1
      `;
      if (aRows.length > 0) appRow = aRows[0];
    } else if (jobId) {
      const aRows = await sql`
        SELECT * FROM job_applications
        WHERE job_id = ${jobId}
          AND LOWER(TRIM(COALESCE(candidate_email, ''))) = ${cleanEmail}
        ORDER BY id DESC
        LIMIT 1
      `;
      if (aRows.length > 0) appRow = aRows[0];
    }

    let jobRow: Record<string, any> = {};
    const targetJobId = jobId || appRow.job_id;
    if (targetJobId) {
      const jRows = await sql`
        SELECT * FROM jobs WHERE id = ${targetJobId} LIMIT 1
      `;
      if (jRows.length > 0) jobRow = jRows[0];
    }

    let parsedData: Record<string, any> = {};
    if (cp.profile_data) {
      try {
        parsedData =
          typeof cp.profile_data === 'string'
            ? JSON.parse(cp.profile_data)
            : cp.profile_data;
      } catch {
        parsedData = {};
      }
    }

    let skillsList: string[] = [];
    const rawSkills = cp.skills || appRow.skills || '';
    if (rawSkills) {
      try {
        const parsedSkills = JSON.parse(rawSkills);
        if (Array.isArray(parsedSkills)) {
          skillsList = parsedSkills.map((s) => String(s).trim()).filter(Boolean);
        } else {
          skillsList = String(rawSkills)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }
      } catch {
        skillsList = String(rawSkills)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
    } else if (Array.isArray(parsedData.keySkills)) {
      skillsList = parsedData.keySkills.map((s: any) => String(s).trim()).filter(Boolean);
    }

    const employmentList = Array.isArray(parsedData.employmentList)
      ? parsedData.employmentList
      : [];
    const educationList = Array.isArray(parsedData.educationList)
      ? parsedData.educationList
      : [];
    const itSkills = Array.isArray(parsedData.itSkills)
      ? parsedData.itSkills
      : [];

    const firstEmp = employmentList[0] || null;
    const firstEdu = educationList[0] || null;

    return {
      applicationId: appRow.id ? Number(appRow.id) : null,
      applicationStatus: String(appRow.status || 'APPLIED').toUpperCase(),
      appliedAt:
        appRow.applied_at instanceof Date
          ? appRow.applied_at.toISOString()
          : String(appRow.applied_at || ''),
      jobId: targetJobId ? Number(targetJobId) : null,
      jobTitle: String(jobRow.title || 'Open Role'),
      jobLocation: String(jobRow.location || ''),
      name: String(
        cp.name ||
          appRow.candidate_name ||
          parsedData.name ||
          cleanEmail.split('@')[0] ||
          'Candidate'
      ),
      email: cleanEmail,
      phone: String(
        cp.phone || appRow.candidate_phone || parsedData.phone || 'Not provided'
      ),
      location: String(cp.location || parsedData.location || 'India'),
      role: String(
        cp.role ||
          parsedData.designation ||
          firstEmp?.designation ||
          'Software Professional'
      ),
      company: String(
        cp.company || parsedData.company || firstEmp?.company || ''
      ),
      experience: String(
        cp.experience ||
          appRow.experience ||
          parsedData.experience ||
          'Experienced'
      ),
      salary: String(
        cp.salary || appRow.salary || parsedData.salary || 'Not disclosed'
      ),
      noticePeriod: String(
        cp.notice_period ||
          appRow.notice_period ||
          parsedData.noticePeriod ||
          'Immediate'
      ),
      headline: String(cp.headline || parsedData.headline || ''),
      bio: String(cp.bio || parsedData.profileSummary || ''),
      education: String(
        cp.education ||
          firstEdu?.degree ||
          [firstEdu?.course, firstEdu?.specialization]
            .filter(Boolean)
            .join(' ') ||
          'Graduate'
      ),
      college: String(cp.college || firstEdu?.institute || ''),
      avatar: String(cp.avatar || ''),
      resumeUrl: String(cp.resume_url || appRow.resume_url || ''),
      resumeName: String(cp.resume_name || 'Candidate_Resume.pdf'),
      skills: skillsList,
      employmentList,
      educationList,
      itSkills,
    };
  } catch (err) {
    console.error('getCandidateDetailsForEmployer error:', err);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = safeString(searchParams.get('email'), 254).toLowerCase();

    if (!email) {
      return NextResponse.json({ messages: [], unreadCount: 0 });
    }

    await ensureMessagesTable();

    // Check if requester is an EMPLOYER
    let isEmployer = false;
    try {
      const uRows = await sql`
        SELECT role FROM users WHERE LOWER(TRIM(email)) = ${email} LIMIT 1
      `;
      if (
        uRows.length > 0 &&
        String(uRows[0].role || '').toUpperCase() === 'EMPLOYER'
      ) {
        isEmployer = true;
      }
    } catch {}

    // If employer, auto-sync any job applications so bell icon is always up to date
    if (isEmployer) {
      await syncEmployerApplicationNotifications(email);
    }

    const rows = await sql`
      SELECT *
      FROM messages
      WHERE LOWER(TRIM(receiver_email)) = ${email}
      ORDER BY id DESC
      LIMIT 50
    `;

    const formatted = await Promise.all(
      rows.map(async (row: any) => {
        const notifType = String(
          row.notif_type ||
            (String(row.subject || '').startsWith('New Job Application:')
              ? 'JOB_APPLICATION'
              : 'MESSAGE')
        ).toUpperCase();

        if (isEmployer && notifType === 'JOB_APPLICATION') {
          const candidateDetails = await getCandidateDetailsForEmployer(
            String(row.sender_email || ''),
            row.job_id ? Number(row.job_id) : null,
            row.application_id ? Number(row.application_id) : null
          );

          return {
            id: Number(row.id),
            notifType: 'JOB_APPLICATION',
            jobId: row.job_id ? Number(row.job_id) : candidateDetails?.jobId || null,
            applicationId: row.application_id
              ? Number(row.application_id)
              : candidateDetails?.applicationId || null,
            senderEmail: String(row.sender_email || ''),
            senderName:
              candidateDetails?.name || String(row.sender_name || 'Candidate'),
            senderCompany: String(
              row.sender_company ||
                `Applied for: ${candidateDetails?.jobTitle || 'Role'}`
            ),
            receiverEmail: String(row.receiver_email || ''),
            subject: String(row.subject || 'New Job Application'),
            body: String(row.body || ''),
            isRead: Boolean(row.is_read),
            createdAt:
              row.created_at instanceof Date
                ? row.created_at.toISOString()
                : String(row.created_at || new Date().toISOString()),
            candidateDetails,
          };
        }

        // Default (Candidate or general message): mask contact info for candidates
        return {
          id: Number(row.id),
          notifType,
          jobId: row.job_id ? Number(row.job_id) : null,
          applicationId: row.application_id ? Number(row.application_id) : null,
          senderEmail: isEmployer
            ? String(row.sender_email || '')
            : maskEmailString(String(row.sender_email || '')),
          senderName: String(row.sender_name || 'Recruiter'),
          senderCompany: String(row.sender_company || 'Verified Employer'),
          receiverEmail: String(row.receiver_email || ''),
          subject: isEmployer
            ? String(row.subject || 'Notification')
            : maskSensitiveContent(
                String(row.subject || 'New Job Opportunity')
              ),
          body: isEmployer
            ? String(row.body || '')
            : maskSensitiveContent(String(row.body || '')),
          isRead: Boolean(row.is_read),
          createdAt:
            row.created_at instanceof Date
              ? row.created_at.toISOString()
              : String(row.created_at || new Date().toISOString()),
          candidateDetails: null,
        };
      })
    );

    const unreadCount = formatted.filter((m) => !m.isRead).length;

    return NextResponse.json({
      messages: formatted,
      unreadCount,
    });
  } catch (error) {
    console.error('GET /api/messages error:', error);
    return NextResponse.json(
      { error: 'Failed to load messages', messages: [], unreadCount: 0 },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const senderEmail = safeString(body?.senderEmail, 254).toLowerCase();
    let senderName = safeString(body?.senderName, 150);
    let senderCompany = safeString(body?.senderCompany, 150);
    const receiverEmail = safeString(body?.receiverEmail, 254).toLowerCase();
    const subject = safeString(
      body?.subject || 'Recruiter Message via Rolematch',
      255
    );
    const messageBody = safeString(body?.message || body?.body, 4000);
    const notifType = safeString(body?.notifType || 'MESSAGE', 50);

    if (!receiverEmail || !messageBody) {
      return NextResponse.json(
        { error: 'Receiver email and message text are required.' },
        { status: 400 }
      );
    }

    await ensureMessagesTable();

    if (senderEmail) {
      try {
        const users = await sql`
          SELECT id FROM users WHERE LOWER(TRIM(email)) = ${senderEmail} LIMIT 1
        `;
        if (users.length > 0) {
          const emp = await sql`
            SELECT full_name, company_name
            FROM employer_profiles
            WHERE user_id = ${users[0].id}
            LIMIT 1
          `;
          if (emp.length > 0) {
            senderName =
              senderName ||
              emp[0].full_name ||
              emp[0].company_name ||
              'Recruiter';
            senderCompany =
              senderCompany || emp[0].company_name || emp[0].full_name || '';
          }
        }
      } catch {}
    }

    const inserted = await sql`
      INSERT INTO messages (
        sender_email,
        sender_name,
        sender_company,
        receiver_email,
        subject,
        body,
        is_read,
        notif_type
      ) VALUES (
        ${senderEmail || 'recruiter@rolematch.com'},
        ${senderName || 'Recruiter'},
        ${senderCompany || 'Hiring Partner'},
        ${receiverEmail},
        ${subject},
        ${messageBody},
        FALSE,
        ${notifType}
      )
      RETURNING *
    `;

    try {
      const candUsers = await sql`
        SELECT id FROM users WHERE LOWER(TRIM(email)) = ${receiverEmail} LIMIT 1
      `;
      if (candUsers.length > 0) {
        await sql`
          UPDATE candidate_profiles
          SET recruiter_actions = COALESCE(recruiter_actions, 0) + 1
          WHERE user_id = ${candUsers[0].id}
        `;
      }
    } catch {}

    return NextResponse.json(
      {
        success: true,
        message: inserted[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/messages error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const messageId = safePositiveInt(body?.id);
    const email = safeString(body?.email, 254).toLowerCase();

    await ensureMessagesTable();

    if (messageId) {
      await sql`
        UPDATE messages
        SET is_read = TRUE
        WHERE id = ${messageId}
      `;
    } else if (email) {
      await sql`
        UPDATE messages
        SET is_read = TRUE
        WHERE LOWER(TRIM(receiver_email)) = ${email}
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/messages error:', error);
    return NextResponse.json(
      { error: 'Failed to update message status' },
      { status: 500 }
    );
  }
}