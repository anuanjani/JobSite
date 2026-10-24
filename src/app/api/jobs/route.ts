import { NextResponse } from 'next/server';
import { sql, safeString, safePositiveInt } from '../../../utils/db';

export const dynamic = 'force-dynamic';

const ALLOWED_STATUSES = new Set(['ACTIVE', 'CLOSED', 'EXPIRED']);
const ALLOWED_APP_STATUSES = new Set([
  'APPLIED',
  'SHORTLISTED',
  'INTERVIEW',
  'OFFERED',
  'REJECTED',
]);

async function ensureJobsColumns() {
  await sql`
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      employer_id INTEGER,
      title VARCHAR(255) NOT NULL,
      company_name VARCHAR(255),
      location VARCHAR(255),
      work_mode VARCHAR(100),
      salary VARCHAR(100),
      experience VARCHAR(100),
      openings INTEGER DEFAULT 1,
      posted_date VARCHAR(50),
      notice_period VARCHAR(100),
      skills TEXT,
      description TEXT,
      status VARCHAR(50) DEFAULT 'ACTIVE',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await sql`
      ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_employer_id_fkey
    `;
  } catch {}

  await sql`
    ALTER TABLE jobs
      ADD COLUMN IF NOT EXISTS employer_id INTEGER,
      ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS location VARCHAR(255),
      ADD COLUMN IF NOT EXISTS work_mode VARCHAR(100),
      ADD COLUMN IF NOT EXISTS salary VARCHAR(100),
      ADD COLUMN IF NOT EXISTS experience VARCHAR(100),
      ADD COLUMN IF NOT EXISTS openings INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS posted_date VARCHAR(50),
      ADD COLUMN IF NOT EXISTS notice_period VARCHAR(100),
      ADD COLUMN IF NOT EXISTS skills TEXT,
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS employer_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE'
  `;
}

async function ensureJobApplicationsColumns() {
  await sql`
    CREATE TABLE IF NOT EXISTS job_applications (
      id SERIAL PRIMARY KEY,
      job_id INTEGER NOT NULL,
      candidate_id INTEGER,
      candidate_name VARCHAR(255),
      candidate_email VARCHAR(255),
      candidate_phone VARCHAR(50),
      experience VARCHAR(100),
      salary VARCHAR(100),
      notice_period VARCHAR(100),
      skills TEXT,
      resume_url TEXT,
      status VARCHAR(50) DEFAULT 'APPLIED',
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  try {
    await sql`
      ALTER TABLE job_applications
      DROP CONSTRAINT IF EXISTS job_applications_candidate_id_fkey
    `;
  } catch {}

  await sql`
    ALTER TABLE job_applications
      ADD COLUMN IF NOT EXISTS job_id INTEGER,
      ADD COLUMN IF NOT EXISTS candidate_id INTEGER,
      ADD COLUMN IF NOT EXISTS candidate_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS candidate_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS candidate_phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS experience VARCHAR(100),
      ADD COLUMN IF NOT EXISTS salary VARCHAR(100),
      ADD COLUMN IF NOT EXISTS notice_period VARCHAR(100),
      ADD COLUMN IF NOT EXISTS skills TEXT,
      ADD COLUMN IF NOT EXISTS resume_url TEXT,
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'APPLIED',
      ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `;
}

async function resolveEmployerEmailForJob(job: any): Promise<string> {
  if (job.employer_email && String(job.employer_email).includes('@')) {
    return String(job.employer_email).trim().toLowerCase();
  }

  if (job.employer_id) {
    try {
      const uRows = await sql`
        SELECT email FROM users WHERE id = ${job.employer_id} LIMIT 1
      `;
      if (uRows.length > 0 && uRows[0].email) {
        return String(uRows[0].email).trim().toLowerCase();
      }
    } catch {}
  }

  if (job.company_name) {
    const comp = String(job.company_name).trim();
    try {
      const empRows = await sql`
        SELECT u.email
        FROM employer_profiles ep
        INNER JOIN users u ON u.id = ep.user_id
        WHERE LOWER(TRIM(COALESCE(ep.company_name, ''))) = LOWER(${comp})
           OR LOWER(TRIM(COALESCE(ep.full_name, ''))) = LOWER(${comp})
        LIMIT 1
      `;
      if (empRows.length > 0 && empRows[0].email) {
        return String(empRows[0].email).trim().toLowerCase();
      }
    } catch {}
  }

  try {
    const fallbackEmp = await sql`
      SELECT email FROM users WHERE UPPER(TRIM(role)) = 'EMPLOYER' ORDER BY id ASC LIMIT 1
    `;
    if (fallbackEmp.length > 0 && fallbackEmp[0].email) {
      return String(fallbackEmp[0].email).trim().toLowerCase();
    }
  } catch {}

  return '';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employerEmail = safeString(searchParams.get('employerEmail'), 254);
    const candidateEmail = safeString(
      searchParams.get('candidateEmail'),
      254
    ).toLowerCase();
    const onlyActive = searchParams.get('onlyActive') === 'true';
    const includeApplicants = searchParams.get('includeApplicants') === 'true';
    const rawJobId = searchParams.get('id');

    await ensureJobsColumns();

    if (rawJobId !== null) {
      const validJobId = safePositiveInt(rawJobId);
      if (!validJobId) {
        return NextResponse.json({ error: 'Invalid Job ID' }, { status: 400 });
      }

      const rows = await sql`
        SELECT * FROM jobs WHERE id = ${validJobId} LIMIT 1
      `;
      const job = rows[0] || null;

      if (!job) {
        return NextResponse.json({ job: null }, { status: 404 });
      }

      let hasApplied = false;
      let applicationStatus: string | null = null;
      let applicants: any[] = [];

      await ensureJobApplicationsColumns();

      if (candidateEmail) {
        const existingApp = await sql`
          SELECT ja.id, ja.status
          FROM job_applications ja
          LEFT JOIN users u ON u.id = ja.candidate_id
          WHERE ja.job_id = ${validJobId}
            AND (
              LOWER(TRIM(COALESCE(ja.candidate_email, ''))) = ${candidateEmail}
              OR LOWER(TRIM(COALESCE(u.email, ''))) = ${candidateEmail}
            )
          ORDER BY ja.id DESC
          LIMIT 1
        `;
        if (existingApp.length > 0) {
          hasApplied = true;
          applicationStatus = String(
            existingApp[0].status || 'APPLIED'
          ).toUpperCase();
        }
      }

      if (includeApplicants) {
        const appRows = await sql`
          SELECT
            ja.*,
            u.email AS user_email,
            cp.name AS profile_name,
            cp.phone AS profile_phone,
            cp.role AS current_role,
            cp.company AS current_company,
            cp.location AS candidate_location,
            cp.experience AS profile_experience,
            cp.salary AS profile_salary,
            cp.notice_period AS profile_notice_period,
            cp.skills AS profile_skills,
            cp.headline AS candidate_headline,
            cp.bio AS candidate_bio,
            cp.education AS candidate_education,
            cp.college AS candidate_college,
            cp.avatar AS candidate_avatar,
            cp.resume_url AS profile_resume_url,
            cp.resume_name AS candidate_resume_name,
            cp.profile_data AS candidate_profile_data
          FROM job_applications ja
          LEFT JOIN users u ON (
            u.id = ja.candidate_id
            OR LOWER(TRIM(u.email)) = LOWER(TRIM(COALESCE(ja.candidate_email, '')))
          )
          LEFT JOIN candidate_profiles cp ON (
            cp.user_id = u.id
            OR cp.id = ja.candidate_id
          )
          WHERE ja.job_id = ${validJobId}
          ORDER BY ja.id DESC
        `;
        applicants = appRows;
      }

      return NextResponse.json({
        job,
        hasApplied,
        applicationStatus,
        applicants,
      });
    }

    if (employerEmail) {
      await ensureJobApplicationsColumns();
      const rows = await sql`
        SELECT
          j.*,
          (SELECT COUNT(*)::int FROM job_applications ja WHERE ja.job_id = j.id) AS applicant_count
        FROM jobs j
        WHERE LOWER(TRIM(COALESCE(j.employer_email, ''))) = LOWER(${employerEmail})
        ORDER BY j.id DESC
      `;
      return NextResponse.json({ jobs: rows });
    }

    if (onlyActive) {
      const rows = await sql`
        SELECT * FROM jobs
        WHERE COALESCE(UPPER(TRIM(status)), 'ACTIVE') = 'ACTIVE'
        ORDER BY id DESC
      `;
      return NextResponse.json({ jobs: rows });
    }

    await ensureJobApplicationsColumns();
    const rows = await sql`
      SELECT
        j.*,
        (SELECT COUNT(*)::int FROM job_applications ja WHERE ja.job_id = j.id) AS applicant_count
      FROM jobs j
      ORDER BY j.id DESC
    `;

    return NextResponse.json({ jobs: rows });
  } catch (error) {
    console.error('GET /api/jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to load jobs', jobs: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // =========================================================================
    // BRANCH A: CANDIDATE WITHDRAWING AN APPLICATION (body.action === 'withdraw')
    // =========================================================================
    if (body?.action === 'withdraw') {
      const jobId = safePositiveInt(body?.jobId);
      const candidateEmail = safeString(
        body?.candidateEmail,
        254
      ).toLowerCase();

      if (!jobId || !candidateEmail) {
        return NextResponse.json(
          {
            error:
              'Valid Job ID and Candidate Email are required to withdraw application.',
          },
          { status: 400 }
        );
      }

      await ensureJobApplicationsColumns();

      // Find candidate user_id & profile_id so we delete any matching application row
      let userId: number | null = null;
      let profileId: number | null = null;

      try {
        const uRows = await sql`
          SELECT id FROM users WHERE LOWER(TRIM(email)) = ${candidateEmail} LIMIT 1
        `;
        if (uRows.length > 0) {
          userId = uRows[0].id;
          const cpRows = await sql`
            SELECT id FROM candidate_profiles WHERE user_id = ${userId} LIMIT 1
          `;
          if (cpRows.length > 0) {
            profileId = cpRows[0].id;
          }
        }
      } catch {}

      await sql`
        DELETE FROM job_applications
        WHERE job_id = ${jobId}
          AND (
            LOWER(TRIM(COALESCE(candidate_email, ''))) = ${candidateEmail}
            OR (${userId}::int IS NOT NULL AND candidate_id = ${userId})
            OR (${profileId}::int IS NOT NULL AND candidate_id = ${profileId})
          )
      `;

      // Also clean up the old JOB_APPLICATION notification in messages so re-applying notifies the employer freshly
      try {
        await sql`
          DELETE FROM messages
          WHERE job_id = ${jobId}
            AND LOWER(TRIM(COALESCE(sender_email, ''))) = ${candidateEmail}
        `;
      } catch {}

      return NextResponse.json({
        success: true,
        withdrawn: true,
        message: 'Application withdrawn successfully. You can now re-apply.',
      });
    }

    // =========================================================================
    // BRANCH B: CANDIDATE APPLYING TO A JOB (body.action === 'apply')
    // =========================================================================
    if (body?.action === 'apply') {
      const jobId = safePositiveInt(body?.jobId);
      const candidateEmail = safeString(
        body?.candidateEmail,
        254
      ).toLowerCase();

      if (!jobId || !candidateEmail) {
        return NextResponse.json(
          { error: 'Valid Job ID and Candidate Email are required to apply.' },
          { status: 400 }
        );
      }

      await ensureJobsColumns();
      await ensureJobApplicationsColumns();

      const jobRows = await sql`
        SELECT * FROM jobs WHERE id = ${jobId} LIMIT 1
      `;
      if (jobRows.length === 0) {
        return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
      }
      const job = jobRows[0];

      // Check if already applied
      const existingApp = await sql`
        SELECT ja.id
        FROM job_applications ja
        LEFT JOIN users u ON u.id = ja.candidate_id
        WHERE ja.job_id = ${jobId}
          AND (
            LOWER(TRIM(COALESCE(ja.candidate_email, ''))) = ${candidateEmail}
            OR LOWER(TRIM(COALESCE(u.email, ''))) = ${candidateEmail}
          )
        LIMIT 1
      `;
      if (existingApp.length > 0) {
        return NextResponse.json({
          success: true,
          alreadyApplied: true,
          message: 'You have already applied for this role.',
        });
      }

      // Pull candidate profile details from Neon DB
      let candidateId: number | null = null;
      let candidateName = safeString(body?.candidateName, 255);
      let candidatePhone = '';
      let experience = '';
      let salary = '';
      let noticePeriod = '';
      let skills = '';
      let resumeUrl = '';

      const users = await sql`
        SELECT id FROM users WHERE LOWER(TRIM(email)) = ${candidateEmail} LIMIT 1
      `;
      if (users.length > 0) {
        candidateId = users[0].id;
        const profRows = await sql`
          SELECT * FROM candidate_profiles WHERE user_id = ${candidateId} LIMIT 1
        `;
        if (profRows.length > 0) {
          const cp = profRows[0];
          candidateName =
            cp.name || candidateName || candidateEmail.split('@')[0];
          candidatePhone = cp.phone || '';
          experience = cp.experience || '';
          salary = cp.salary || '';
          noticePeriod = cp.notice_period || '';
          skills = cp.skills || '';
          resumeUrl = cp.resume_url || '';
        }
      }

      const insertedApp = await sql`
        INSERT INTO job_applications (
          job_id,
          candidate_id,
          candidate_name,
          candidate_email,
          candidate_phone,
          experience,
          salary,
          notice_period,
          skills,
          resume_url,
          status
        ) VALUES (
          ${jobId},
          ${candidateId},
          ${candidateName || 'Candidate'},
          ${candidateEmail},
          ${candidatePhone},
          ${experience},
          ${salary},
          ${noticePeriod},
          ${skills},
          ${resumeUrl},
          'APPLIED'
        )
        RETURNING *
      `;

      // Dispatch real-time notification to the Employer's bell icon
      try {
        const employerEmail = await resolveEmployerEmailForJob(job);
        if (employerEmail) {
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
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              notif_type VARCHAR(50) DEFAULT 'MESSAGE',
              job_id INTEGER,
              application_id INTEGER
            )
          `;

          await sql`
            ALTER TABLE messages
              ADD COLUMN IF NOT EXISTS notif_type VARCHAR(50) DEFAULT 'MESSAGE',
              ADD COLUMN IF NOT EXISTS job_id INTEGER,
              ADD COLUMN IF NOT EXISTS application_id INTEGER
          `;

          const expPart = experience ? ` • Exp: ${experience}` : '';
          const npPart = noticePeriod ? ` • Notice: ${noticePeriod}` : '';
          const notifBody = `${
            candidateName || 'A candidate'
          } applied for ${job.title}${expPart}${npPart}. Click to view full candidate details, contact info, and resume.`;

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
              ${candidateEmail},
              ${candidateName || 'Candidate'},
              ${`Applied for: ${job.title}`},
              ${employerEmail},
              ${`New Job Application: ${job.title}`},
              ${notifBody},
              FALSE,
              'JOB_APPLICATION',
              ${jobId},
              ${insertedApp[0]?.id || null}
            )
          `;
        }
      } catch (notifErr) {
        console.error('Error creating employer notification:', notifErr);
      }

      return NextResponse.json(
        {
          success: true,
          applicationStatus: 'APPLIED',
          message: 'Application submitted successfully!',
        },
        { status: 201 }
      );
    }

    // =========================================================================
    // BRANCH C: EMPLOYER CREATING A NEW JOB POSTING
    // =========================================================================
    const title = safeString(body?.title, 255);
    const workMode = safeString(body?.workMode, 50) || 'Hybrid';
    const location = safeString(body?.location, 255);
    const salary = safeString(body?.salary, 100);
    const experience = safeString(body?.experience, 100);
    const openings = safePositiveInt(body?.openings) ?? 1;
    const postedDate = safeString(body?.postedDate, 50);
    const noticePeriod = safeString(body?.noticePeriod, 100);
    const skills = safeString(body?.skills, 1000);
    const description = safeString(body?.description, 10000);
    const employerEmail = safeString(body?.employerEmail, 254).toLowerCase();
    const companyName = safeString(body?.companyName, 255);

    if (!title || !experience || !noticePeriod || !description) {
      return NextResponse.json(
        {
          error:
            'Job Title, Experience, Notice Period, and Job Description are mandatory.',
        },
        { status: 400 }
      );
    }

    await ensureJobsColumns();

    let employerId: number | null = null;
    let resolvedCompany = companyName || 'Company';

    if (employerEmail) {
      const users = await sql`
        SELECT id FROM users WHERE LOWER(TRIM(email)) = ${employerEmail} LIMIT 1
      `;
      if (users.length > 0) {
        employerId = users[0].id;
        try {
          const emp = await sql`
            SELECT company_name, full_name
            FROM employer_profiles
            WHERE user_id = ${employerId}
            LIMIT 1
          `;
          if (emp.length > 0) {
            resolvedCompany =
              emp[0].company_name || emp[0].full_name || resolvedCompany;
          }
        } catch {}
      }
    }

    const inserted = await sql`
      INSERT INTO jobs (
        employer_id,
        employer_email,
        title,
        company_name,
        location,
        work_mode,
        salary,
        experience,
        openings,
        posted_date,
        notice_period,
        skills,
        description,
        status
      ) VALUES (
        ${employerId},
        ${employerEmail},
        ${title},
        ${resolvedCompany},
        ${location},
        ${workMode},
        ${salary},
        ${experience},
        ${openings},
        ${postedDate},
        ${noticePeriod},
        ${skills},
        ${description},
        'ACTIVE'
      )
      RETURNING *
    `;

    return NextResponse.json(
      { success: true, job: inserted[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to process job request' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    // Update Candidate Application ATS Status (Shortlist / Interview / Offer / Reject)
    if (body?.action === 'updateApplicationStatus') {
      const applicationId = safePositiveInt(body?.applicationId);
      const jobId = safePositiveInt(body?.jobId);
      const candidateEmail = safeString(
        body?.candidateEmail,
        254
      ).toLowerCase();
      const newStatus = safeString(body?.status, 30).toUpperCase();

      if (!ALLOWED_APP_STATUSES.has(newStatus)) {
        return NextResponse.json(
          { error: 'Invalid application status.' },
          { status: 400 }
        );
      }

      await ensureJobApplicationsColumns();

      if (applicationId) {
        await sql`
          UPDATE job_applications
          SET status = ${newStatus}
          WHERE id = ${applicationId}
        `;
      } else if (jobId && candidateEmail) {
        await sql`
          UPDATE job_applications
          SET status = ${newStatus}
          WHERE job_id = ${jobId}
            AND LOWER(TRIM(COALESCE(candidate_email, ''))) = ${candidateEmail}
        `;
      }

      // Notify the candidate of their application status update
      if (candidateEmail) {
        const jobTitle = safeString(body?.jobTitle || 'your applied role', 200);
        const companyName = safeString(
          body?.companyName || 'Hiring Team',
          200
        );
        try {
          await sql`
            INSERT INTO messages (
              sender_email,
              sender_name,
              sender_company,
              receiver_email,
              subject,
              body,
              is_read
            ) VALUES (
              ${safeString(body?.employerEmail || 'recruiter@rolematch.com', 254)},
              ${companyName},
              ${companyName},
              ${candidateEmail},
              ${`Application Status Updated: ${newStatus}`},
              ${`Your application for "${jobTitle}" has been marked as ${newStatus} by the hiring team.`},
              FALSE
            )
          `;
        } catch {}
      }

      return NextResponse.json({ success: true, status: newStatus });
    }

    // Standard Job Status Update (ACTIVE / CLOSED / EXPIRED)
    const jobId = safePositiveInt(body?.id);
    const status = safeString(body?.status, 20).toUpperCase();

    if (!jobId || !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json(
        {
          error:
            'Valid Job ID and status (ACTIVE, CLOSED, EXPIRED) are required',
        },
        { status: 400 }
      );
    }

    await ensureJobsColumns();

    await sql`
      UPDATE jobs
      SET status = ${status}
      WHERE id = ${jobId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let rawId: unknown = searchParams.get('id');

    if (!rawId) {
      try {
        const body = await request.json();
        rawId = body?.id;
      } catch {}
    }

    const jobId = safePositiveInt(rawId);
    if (!jobId) {
      return NextResponse.json(
        { error: 'Valid numeric Job ID is required to delete job posting.' },
        { status: 400 }
      );
    }

    try {
      await sql`DELETE FROM job_applications WHERE job_id = ${jobId}`;
    } catch {}
    try {
      await sql`DELETE FROM saved_jobs WHERE job_id = ${jobId}`;
    } catch {}

    await sql`DELETE FROM jobs WHERE id = ${jobId}`;

    return NextResponse.json({
      success: true,
      message: 'Job posting deleted successfully.',
    });
  } catch (error) {
    console.error('DELETE /api/jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to delete job posting' },
      { status: 500 }
    );
  }
}