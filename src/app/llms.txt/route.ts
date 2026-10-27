import { NextResponse } from 'next/server';
import { sql } from '../../utils/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  let activeJobsSection = '';
  try {
    const jobs = await sql`
      SELECT id, title, company_name, location, work_mode, experience, salary
      FROM jobs
      WHERE COALESCE(UPPER(TRIM(status)), 'ACTIVE') = 'ACTIVE'
      ORDER BY id DESC
      LIMIT 50
    `;

    if (jobs.length > 0) {
      activeJobsSection = jobs
        .map(
          (j: any) =>
            `- [${j.title} at ${j.company_name || 'Hiring Partner'}](${origin}/jobs/${j.id}): Location: ${j.location || 'India'} (${j.work_mode || 'On-site'}), Experience: ${j.experience || 'Experienced'}, Compensation: ${j.salary || 'Competitive'}`
        )
        .join('\n');
    } else {
      activeJobsSection = '- No active jobs posted at this moment.';
    }
  } catch {
    activeJobsSection = '- Live job feed available at /jobs';
  }

  const llmsContent = `# ROLEMATCH. — Enterprise Talent Cloud & Job Publishing Platform

> ROLEMATCH. is a full-stack enterprise recruitment, job publishing, and candidate discovery platform connecting verified employers with software, engineering, and business talent across India and globally.

## Core Platform Directories
- [Active Jobs Directory](${origin}/jobs): Browse and apply to real-time verified job openings filtered by role, skill, location, and work mode (Remote, Hybrid, On-site).
- [Hiring Companies Directory](${origin}/hire): Explore KYC-verified employers and technology companies actively hiring on Rolematch.
- [Rolematch 360 & Pro Membership](${origin}/credits): Candidate profile boosting, AI resume insights, and priority recruiter visibility.
- [Platform HTML Sitemap](${origin}/sitemap): Complete human-readable navigation index.
- [XML Sitemap](${origin}/sitemap.xml): Search engine crawler index.

## Candidate (Jobseeker) Workflows
- [Candidate Registration](${origin}/register): Create a candidate profile with skill tags, employment history, education, and resume upload.
- [Candidate Login](${origin}/login): Access the candidate dashboard, job recommendations, application status tracker, and recruiter NVite messages.
- [Candidate Dashboard](${origin}/candidate/dashboard): Track search appearances, recruiter actions, and applied roles.
- [Candidate Profile Management](${origin}/candidate/profile): 12-module profile builder (Resume, Headline, Key Skills, Employment, Education, IT Skills, Projects, Summary, Accomplishments, Career Profile, Personal Details, Diversity).

## Employer (Recruiter) Workflows
- [Employer Onboarding & Registration](${origin}/employer/register): 3-step corporate recruiter registration.
- [Employer Talent Cloud Console](${origin}/employer/dashboard): Manage job postings, Resdex resume database access, and corporate KYC verification.
- [Resdex Candidate Search](${origin}/employer/talent): Search verified candidate resumes by skill, experience, and availability with privacy-preserving contact masking.
- [Employer Subscriptions](${origin}/employer/buy-online): Enterprise plans for Resdex contact unlocking and hot job postings.

## Trust, Legal & Compliance
- [About Rolematch](${origin}/about)
- [Trust & Safety Guidelines](${origin}/trust)
- [Recruitment Fraud Alert](${origin}/fraud-alert)
- [Privacy Policy](${origin}/privacy)
- [Terms & Conditions](${origin}/terms)
- [Grievance Redressal](${origin}/grievances)
- [FAQs & Learning Center](${origin}/faqs)

## Live Active Job Openings
${activeJobsSection}
`;

  return new NextResponse(llmsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}