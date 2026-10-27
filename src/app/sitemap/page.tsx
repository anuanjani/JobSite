'use client';
import React from 'react';
import Link from 'next/link';

export default function HtmlSitemapPage() {
  const sections = [
    {
      title: 'Candidate Portal & Directories',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Active Jobs Directory', href: '/jobs' },
        { label: 'Companies Hiring', href: '/hire' },
        { label: 'Candidate Login', href: '/login' },
        { label: 'Candidate Registration', href: '/register' },
        { label: 'Candidate Dashboard', href: '/candidate/dashboard' },
        { label: 'Candidate Profile & CV', href: '/candidate/profile' },
        { label: 'Recruiter Messages & NVites', href: '/messages' },
        { label: 'Rolematch 360 / Pro Credits', href: '/credits' },
      ],
    },
    {
      title: 'Employer & Recruiter Cloud',
      links: [
        { label: 'Employer Overview', href: '/employer' },
        { label: 'Employer Registration', href: '/employer/register' },
        { label: 'Employer Console Dashboard', href: '/employer/dashboard' },
        { label: 'Post a New Job', href: '/employer/jobs/new' },
        { label: 'Manage Jobs & Responses', href: '/employer/jobs' },
        { label: 'Resdex Talent Search', href: '/employer/talent' },
        { label: 'Company Profile & KYC', href: '/employer/company-profile' },
        { label: 'Buy Online / Subscriptions', href: '/employer/buy-online' },
        { label: 'Recruitment Activity Reports', href: '/report' },
      ],
    },
    {
      title: 'Trust, Compliance & Machine Indexes',
      links: [
        { label: 'About Rolematch', href: '/about' },
        { label: 'Careers at Rolematch', href: '/careers' },
        { label: 'FAQs & Learning Center', href: '/faqs' },
        { label: 'Help & Support', href: '/help' },
        { label: 'Trust & Safety', href: '/trust' },
        { label: 'Fraud Alert', href: '/fraud-alert' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms & Conditions', href: '/terms' },
        { label: 'Grievance Redressal', href: '/grievances' },
        { label: 'Summons & Legal Notices', href: '/summons' },
        { label: 'XML Sitemap (/sitemap.xml)', href: '/sitemap.xml' },
        { label: 'AI / LLM Index (/llms.txt)', href: '/llms.txt' },
        { label: 'Crawler Rules (/robots.txt)', href: '/robots.txt' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-extrabold uppercase tracking-wider text-indigo-300">
            Platform Directory
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2">
            Rolematch Sitemap &amp; AI Discovery Index
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete overview of all candidate, employer, legal, and
            machine-readable routes (including{' '}
            <a href="/sitemap.xml" className="text-blue-400 underline">
              /sitemap.xml
            </a>{' '}
            and{' '}
            <a href="/llms.txt" className="text-blue-400 underline">
              /llms.txt
            </a>
            ).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map((sec) => (
            <div
              key={sec.title}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
            >
              <h2 className="text-sm font-extrabold text-white border-b border-slate-800 pb-3">
                {sec.title}
              </h2>
              <ul className="space-y-2.5 text-xs">
                {sec.links.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-slate-300 hover:text-blue-400 font-semibold transition flex items-center justify-between"
                    >
                      <span>{item.label}</span>
                      <span className="text-slate-600 text-[10px]">
                        {item.href}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}