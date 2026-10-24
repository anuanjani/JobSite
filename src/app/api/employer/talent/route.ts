import { NextResponse } from 'next/server';
import { sql, escapeSqlLike } from '../../../../utils/db';

export const dynamic = 'force-dynamic';

function toSafeText(val: unknown, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val.trim() || fallback;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? fallback : val.toISOString().split('T')[0];
  }
  return fallback;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSearch =
      searchParams.get('q') ||
      searchParams.get('search') ||
      searchParams.get('skill') ||
      '';
    const escapedSearch = escapeSqlLike(rawSearch);

    const rows = escapedSearch
      ? await sql`
          SELECT
            u.id AS uid,
            u.email AS user_email,
            cp.*
          FROM users u
          LEFT JOIN candidate_profiles cp ON cp.user_id = u.id
          WHERE UPPER(TRIM(COALESCE(u.role, 'CANDIDATE'))) = 'CANDIDATE'
            AND (
              COALESCE(cp.name, '') ILIKE ${'%' + escapedSearch + '%'} ESCAPE '\\'
              OR COALESCE(cp.skills, '') ILIKE ${'%' + escapedSearch + '%'} ESCAPE '\\'
              OR COALESCE(cp.role, '') ILIKE ${'%' + escapedSearch + '%'} ESCAPE '\\'
              OR COALESCE(cp.headline, '') ILIKE ${'%' + escapedSearch + '%'} ESCAPE '\\'
              OR COALESCE(cp.location, '') ILIKE ${'%' + escapedSearch + '%'} ESCAPE '\\'
              OR COALESCE(cp.company, '') ILIKE ${'%' + escapedSearch + '%'} ESCAPE '\\'
              OR COALESCE(cp.profile_data, '') ILIKE ${'%' + escapedSearch + '%'} ESCAPE '\\'
              OR u.email ILIKE ${'%' + escapedSearch + '%'} ESCAPE '\\'
            )
          ORDER BY COALESCE(cp.id, u.id) DESC
        `
      : await sql`
          SELECT
            u.id AS uid,
            u.email AS user_email,
            cp.*
          FROM users u
          LEFT JOIN candidate_profiles cp ON cp.user_id = u.id
          WHERE UPPER(TRIM(COALESCE(u.role, 'CANDIDATE'))) = 'CANDIDATE'
          ORDER BY COALESCE(cp.id, u.id) DESC
        `;

    const candidates = rows.map((row: any) => {
      let parsedData: Record<string, any> = {};
      if (row.profile_data) {
        try {
          parsedData =
            typeof row.profile_data === 'string'
              ? JSON.parse(row.profile_data)
              : row.profile_data;
        } catch {
          parsedData = {};
        }
      }

      // Normalize skills array to plain strings
      let skillsList: string[] = [];
      if (row.skills) {
        try {
          const parsedSkills = JSON.parse(row.skills);
          if (Array.isArray(parsedSkills)) {
            skillsList = parsedSkills
              .map((s) => toSafeText(typeof s === 'object' ? s?.skill || s?.name : s))
              .filter(Boolean);
          } else {
            skillsList = String(row.skills)
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
          }
        } catch {
          skillsList = String(row.skills)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        }
      } else if (Array.isArray(parsedData.keySkills)) {
        skillsList = parsedData.keySkills
          .map((s: any) => toSafeText(typeof s === 'object' ? s?.skill || s?.name : s))
          .filter(Boolean);
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
      const projects = Array.isArray(parsedData.projects)
        ? parsedData.projects
        : [];
      const languages = Array.isArray(parsedData.languages)
        ? parsedData.languages
        : [];

      const firstEmployment = employmentList[0] || null;
      const firstEducation = educationList[0] || null;

      const rawExperience = toSafeText(
        row.experience ||
          parsedData.experience ||
          (firstEmployment?.totalExpYears
            ? `${firstEmployment.totalExpYears} Years`
            : ''),
        '0 Years'
      );
      const expMatch = rawExperience.match(/(\d+)/);
      const experienceYears = expMatch ? parseInt(expMatch[1], 10) : 0;

      const workStatus = toSafeText(
        row.work_status || parsedData.workStatus || 'experienced',
        'experienced'
      ).toLowerCase();

      const email = toSafeText(row.user_email || row.email);
      const fallbackName = email ? email.split('@')[0] : 'Candidate';

      const roleTitle = toSafeText(
        row.role ||
          parsedData.designation ||
          firstEmployment?.designation,
        'Software Professional'
      );

      const degreeTitle = toSafeText(
        row.education ||
          firstEducation?.degree ||
          [firstEducation?.course, firstEducation?.specialization]
            .filter(Boolean)
            .join(' '),
        'Not specified'
      );

      const collegeName = toSafeText(
        row.college || firstEducation?.institute,
        ''
      );

      return {
        id: Number(row.id || row.uid || 1),
        userId: Number(row.uid || row.user_id || 1),
        name: toSafeText(row.name || parsedData.name, fallbackName),
        email,
        phone: toSafeText(row.phone || parsedData.phone, 'Not provided'),
        location: toSafeText(row.location || parsedData.location, 'India'),
        workStatus,
        work_status: workStatus,
        openToWork: true,
        open_to_work: true,
        role: roleTitle,
        designation: roleTitle,
        company: toSafeText(
          row.company || parsedData.company || firstEmployment?.company,
          ''
        ),
        experience: rawExperience,
        experienceYears,
        salary: toSafeText(
          row.salary || parsedData.salary || firstEmployment?.salary,
          'Not disclosed'
        ),
        noticePeriod: toSafeText(
          row.notice_period ||
            parsedData.noticePeriod ||
            firstEmployment?.noticePeriod,
          'Immediate / 30 Days'
        ),
        notice_period: toSafeText(
          row.notice_period ||
            parsedData.noticePeriod ||
            firstEmployment?.noticePeriod,
          'Immediate / 30 Days'
        ),
        headline: toSafeText(row.headline || parsedData.headline, ''),
        bio: toSafeText(row.bio || parsedData.profileSummary, ''),
        skills: skillsList,
        education: degreeTitle,
        college: collegeName,
        avatar: toSafeText(row.avatar, ''),
        resumeUrl: toSafeText(row.resume_url, ''),
        resume_url: toSafeText(row.resume_url, ''),
        resumeName: toSafeText(row.resume_name, ''),
        resume_name: toSafeText(row.resume_name, ''),
        resumeUpdatedAt: toSafeText(row.resume_updated_at, ''),
        updatedAt: toSafeText(
          parsedData.lastUpdatedIso || row.updated_at,
          'Recently'
        ),
        employmentList,
        educationList,
        itSkills,
        projects,
        languages,
      };
    });

    return NextResponse.json({ candidates });
  } catch (error: any) {
    console.error('GET /api/employer/talent error:', error);
    return NextResponse.json(
      { error: 'Failed to load candidates', candidates: [] },
      { status: 500 }
    );
  }
}