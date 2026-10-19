import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET() {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    // Ensure work_status column exists on candidate_profiles
    await sql`
      ALTER TABLE candidate_profiles
      ADD COLUMN IF NOT EXISTS work_status VARCHAR(50) DEFAULT 'experienced'
    `;

    const rows = await sql`
      SELECT 
        cp.*,
        u.email AS account_email
      FROM candidate_profiles cp
      LEFT JOIN users u ON cp.user_id = u.id
      ORDER BY cp.id DESC
    `;

    const candidates = rows.map((r: any) => {
      // Parse skills array safely
      let parsedSkills: string[] = [];
      const rawSkills = r.skills ?? r.key_skills ?? [];

      if (Array.isArray(rawSkills)) {
        parsedSkills = rawSkills.map((s) => String(s).trim()).filter(Boolean);
      } else if (typeof rawSkills === 'string' && rawSkills.trim() !== '') {
        try {
          const json = JSON.parse(rawSkills);
          if (Array.isArray(json)) {
            parsedSkills = json.map((s) => String(s).trim()).filter(Boolean);
          } else {
            parsedSkills = rawSkills
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
          }
        } catch {
          parsedSkills = rawSkills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }

      // Normalize workStatus ('fresher' vs 'experienced')
      const rawWorkStatus = String(
        r.work_status || r.workstatus || ''
      ).toLowerCase();

      const normalizedWorkStatus: 'fresher' | 'experienced' =
        rawWorkStatus === 'fresher' ? 'fresher' : 'experienced';

      const rawExp = r.experience ?? r.total_experience ?? r.exp_years ?? null;
      const numericExp =
        rawExp !== null && rawExp !== undefined && rawExp !== ''
          ? parseInt(String(rawExp).replace(/\D/g, ''), 10) || 0
          : 0;

      return {
        id: r.id || r.user_id,
        userId: r.user_id,
        name: r.name || r.full_name || 'Candidate',
        email: r.email || r.account_email || '',
        phone: r.phone || r.mobile || r.mobile_number || '',
        location: r.location || r.city || r.current_location || 'India',
        workStatus: normalizedWorkStatus,
        workStatusLabel:
          normalizedWorkStatus === 'fresher' ? 'Fresher' : 'Experienced',
        role:
          r.role ||
          r.headline ||
          r.designation ||
          (normalizedWorkStatus === 'fresher' ? 'Fresher' : 'Professional'),
        company: r.company || r.current_company || '',
        experience:
          r.experience ||
          r.total_experience ||
          (normalizedWorkStatus === 'fresher' ? 'Fresher (0 Yrs)' : ''),
        experienceYears: numericExp,
        education: r.education || r.degree || r.qualification || '',
        college: r.college || r.university || '',
        salary: r.salary || r.current_ctc || r.expected_ctc || '',
        noticePeriod: r.notice_period || r.availability || '',
        bio: r.bio || r.summary || r.profile_summary || r.about || '',
        avatar: r.avatar || r.avatar_url || r.profile_photo || '',
        resumeUrl: r.resume_url || r.resume || r.cv_url || '',
        linkedin: r.linkedin || r.linkedin_url || '',
        github: r.github || r.github_url || '',
        portfolio: r.portfolio || r.website || '',
        skills: parsedSkills,
        openToWork: r.open_to_work !== false,
      };
    });

    return NextResponse.json({ candidates });
  } catch (error: any) {
    console.error('GET /api/employer/talent error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch candidates from database', candidates: [] },
      { status: 500 }
    );
  }
}