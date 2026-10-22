import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Fetch all registered employers from employer_profiles joined with users
    const employerRows = await sql`
      SELECT 
        ep.*,
        u.email AS account_email
      FROM employer_profiles ep
      LEFT JOIN users u ON ep.user_id = u.id
      ORDER BY ep.user_id DESC
    `;

    // Fetch active jobs to attach live open role counts per employer
    let activeJobs: any[] = [];
    try {
      activeJobs = await sql`
        SELECT * FROM jobs
        WHERE COALESCE(UPPER(TRIM(status)), 'ACTIVE') = 'ACTIVE'
        ORDER BY id DESC
      `;
    } catch {}

    const employers = employerRows.map((r: any) => {
      const companyName =
        r.company_name || r.full_name || 'Registered Employer';
      const email = (r.account_email || '').toLowerCase().trim();

      const matchingJobs = activeJobs.filter(
        (j) =>
          (j.employer_id && Number(j.employer_id) === Number(r.user_id)) ||
          (j.employer_email &&
            String(j.employer_email).toLowerCase().trim() === email) ||
          (j.company_name &&
            String(j.company_name).toLowerCase().trim() ===
              companyName.toLowerCase().trim())
      );

      const locationParts = [r.city, r.state].filter(Boolean);
      const resolvedLocation =
        locationParts.length > 0
          ? locationParts.join(', ')
          : r.address || 'India';

      return {
        id: r.id || r.user_id,
        userId: r.user_id,
        companyName,
        contactPerson: r.full_name || '',
        email: r.account_email || '',
        phone: r.phone || r.mobile_number || '',
        companyType:
          r.hiring_for === 'agency' || r.hiring_for === 'individual'
            ? 'Proprietor / Agency'
            : 'Corporate / Company',
        industry: r.industry_type || 'Software Services',
        employeeCount: r.employee_count || '11-50',
        designation: r.designation || '',
        location: resolvedLocation,
        address: r.address || '',
        pincode: r.pincode || '',
        websiteUrl: r.website_url || '',
        kycStatus: (r.kyc_status || 'PENDING').toUpperCase(),
        activeJobsCount: matchingJobs.length,
        activeJobs: matchingJobs,
      };
    });

    return NextResponse.json({ employers });
  } catch (error: any) {
    console.error('GET /api/companies error:', error);
    return NextResponse.json(
      { error: 'Failed to load employers from database', employers: [] },
      { status: 500 }
    );
  }
}