import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

async function ensureJobsColumns(sql: any) {
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employerEmail = searchParams.get('employerEmail');

    const sql = neon(process.env.DATABASE_URL!);
    await ensureJobsColumns(sql);

    if (employerEmail) {
      const rows = await sql`
        SELECT * FROM jobs
        WHERE LOWER(TRIM(COALESCE(employer_email, ''))) = LOWER(TRIM(${employerEmail}))
        ORDER BY id DESC
      `;
      return NextResponse.json({ jobs: rows });
    }

    const rows = await sql`
      SELECT * FROM jobs ORDER BY id DESC
    `;

    return NextResponse.json({ jobs: rows });
  } catch (error: any) {
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
    const {
      title,
      workMode,
      location,
      salary,
      experience,
      openings,
      postedDate,
      noticePeriod,
      skills,
      description,
      employerEmail,
      companyName,
    } = body;

    if (!title || !experience || !noticePeriod || !description) {
      return NextResponse.json(
        {
          error:
            'Job Title, Experience, Notice Period, and Job Description are mandatory.',
        },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);
    await ensureJobsColumns(sql);

    let employerId: number | null = null;
    let resolvedCompany = companyName || 'Company';

    if (employerEmail) {
      const users = await sql`
        SELECT id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM(${employerEmail})) LIMIT 1
      `;
      if (users.length > 0) {
        employerId = users[0].id;
        try {
          const emp = await sql`
            SELECT company_name, full_name FROM employer_profiles WHERE user_id = ${employerId} LIMIT 1
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
        ${employerEmail || ''},
        ${title},
        ${resolvedCompany},
        ${location || ''},
        ${workMode || 'Hybrid'},
        ${salary || ''},
        ${experience},
        ${Number(openings) || 1},
        ${postedDate || ''},
        ${noticePeriod},
        ${skills || ''},
        ${description},
        'ACTIVE'
      )
      RETURNING *
    `;

    return NextResponse.json(
      { success: true, job: inserted[0] },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/jobs error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create job posting' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Job ID and status are required' },
        { status: 400 }
      );
    }

    const sql = neon(process.env.DATABASE_URL!);
    await ensureJobsColumns(sql);

    await sql`
      UPDATE jobs
      SET status = ${String(status).toUpperCase()}
      WHERE id = ${Number(id)}
    `;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('PATCH /api/jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to update job status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        if (body.id) id = String(body.id);
      } catch {}
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Job ID is required to delete job posting.' },
        { status: 400 }
      );
    }

    const jobId = Number(id);
    const sql = neon(process.env.DATABASE_URL!);

    // Clean up any dependent applications or saved jobs first
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
  } catch (error: any) {
    console.error('DELETE /api/jobs error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete job posting' },
      { status: 500 }
    );
  }
}