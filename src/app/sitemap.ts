import { MetadataRoute } from 'next';
import { sql } from '../utils/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const now = new Date();

  const staticRoutes = [
    '',
    '/jobs',
    '/hire',
    '/login',
    '/register',
    '/employer',
    '/employer/register',
    '/employer/buy-online',
    '/credits',
    '/about',
    '/careers',
    '/faqs',
    '/help',
    '/trust',
    '/fraud-alert',
    '/privacy',
    '/terms',
    '/grievances',
    '/summons',
    '/sitemap',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: route === '' || route === '/jobs' ? 1.0 : 0.8,
  }));

  let dynamicJobRoutes: MetadataRoute.Sitemap = [];
  try {
    const activeJobs = await sql`
      SELECT id, created_at
      FROM jobs
      WHERE COALESCE(UPPER(TRIM(status)), 'ACTIVE') = 'ACTIVE'
      ORDER BY id DESC
      LIMIT 500
    `;
    dynamicJobRoutes = activeJobs.map((job: any) => ({
      url: `${baseUrl}/jobs/${job.id}`,
      lastModified: job.created_at ? new Date(job.created_at) : now,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    }));
  } catch {}

  return [...staticRoutes, ...dynamicJobRoutes];
}