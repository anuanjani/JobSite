# ROLEMATCH. — Enterprise Talent Cloud & Job Publishing Platform

**ROLEMATCH.** is a full-stack enterprise recruitment, job publishing, and candidate discovery platform built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Neon Serverless PostgreSQL**, and **UploadThing**. It provides dedicated, role-based workflows for both **Candidates (Jobseekers)** and **Employers (Recruiters)** with real-time database persistence and cloud document management.

---

## 1. Tech Stack & Core Infrastructure

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js (App Router) + React | Server & Client Components, File-based Routing, API Routes |
| **Language** | TypeScript (`tsconfig.json`) | End-to-end type safety across UI state and API payloads |
| **Styling & Motion** | Tailwind CSS + Custom Keyframes (`globals.css`) | Dark-mode slate aesthetic, spring modal animations (`modalPopIn`), shimmer loaders |
| **Database** | Neon Serverless PostgreSQL (`@neondatabase/serverless`) | Relational storage + structured JSONB/TEXT profile metadata |
| **File Storage** | UploadThing (`uploadthing/server`, `UTApi`) | Cloud storage & automatic cleanup for resumes, profile avatars, and KYC documents |

---

## 2. Repository Directory Structure

```text
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── next-env.d.ts
├── readme.md
└── src/
    ├── components/
    │   ├── Header.tsx                             # Global context-aware header + slide-over profile drawer
    │   ├── Navbar.tsx                             # Secondary navigation helper
    │   └── Footer.tsx                             # Global enterprise footer
    ├── utils/
    │   ├── db.ts                                  # Neon PostgreSQL connection utility
    │   └── uploadthing.ts                         # UploadThing client helper
    └── app/
        ├── layout.tsx                             # Root application layout with global Header & Footer
        ├── page.tsx                               # Public landing page
        ├── globals.css                            # Global styles, modal animations, and hover close-button rules
        │
        ├── login/
        │   └── page.tsx                           # Unified Sign In (Candidate & Employer routing + password toggle)
        ├── register/
        │   └── page.tsx                           # Candidate Registration (Live email/mobile DB check + 6-digit PIN OTP)
        │
        ├── candidate/
        │   ├── dashboard/
        │   │   └── page.tsx                       # Naukri-style Candidate Dashboard (3-column layout, live job feed, MINIs)
        │   └── profile/
        │       └── page.tsx                       # Comprehensive Candidate Profile & 12 interactive modal editors
        │
        ├── jobs/
        │   ├── page.tsx                           # Real-time Active Jobs Directory with keyword, location & work-mode filters
        │   └── [job-id]/
        │       └── page.tsx                       # Individual Job Details & Candidate Application view
        ├── hire/
        │   └── page.tsx                           # Real-time Registered Companies / Employers Directory
        │
        ├── employer/
        │   ├── page.tsx                           # Employer landing & overview page
        │   ├── register/
        │   │   └── page.tsx                       # 3-Step Employer Onboarding (Mobile OTP -> Basic Details -> Company Info)
        │   ├── dashboard/
        │   │   └── page.tsx                       # Employer Console (Resdex, Job Posting, KYC banner, Webinars, FAQs)
        │   ├── company-profile/
        │   │   └── page.tsx                       # Employer Company Details & KYC Document Upload/Verification
        │   ├── jobs/
        │   │   ├── page.tsx                       # Manage Jobs and Responses (Search, Status Filters, Active/Closed/Expired/Delete)
        │   │   ├── new/
        │   │   │   └── page.tsx                   # Create Job Posting Form (Title, Mode, Experience Range, Openings, Notice Period)
        │   │   └── [job-id]/
        │   │       └── applicants/
        │   │           └── page.tsx               # Job-specific Applicant Responses & ATS pipeline view
        │   ├── talent/
        │   │   └── page.tsx                       # Resdex Candidate Search & Resume Database (Live candidate profiles)
        │   └── buy-online/
        │       └── page.tsx                       # Employer Subscription & Plan Purchase page
        │
        ├── settings/
        │   └── page.tsx                           # Account & Security Settings + Account Deletion (DB + UploadThing cleanup)
        ├── messages/
        │   └── page.tsx                           # Direct Recruiter Messages & NVite Invitations
        ├── credits/
        │   └── page.tsx                           # Rolematch 360 / Pro Membership & Boosts
        ├── report/
        │   └── page.tsx                           # Employer Activity & Usage Reports (Job Posting & Resdex)
        ├── admin/
        │   └── page.tsx                           # Platform Administration Console
        │
        ├── Informational & Trust Pages
        │   ├── about/page.tsx                     # About Rolematch & Career Blogs
        │   ├── careers/page.tsx                   # Internal Careers
        │   ├── faqs/page.tsx                      # Frequently Asked Questions & Learning Center
        │   ├── help/page.tsx                      # Help Center & Feedback
        │   ├── trust/page.tsx                     # Trust, Safety & Workplace Insights
        │   ├── fraud-alert/page.tsx               # Security & Fraud Prevention Guidelines
        │   ├── privacy/page.tsx                   # Privacy Policy
        │   ├── terms/page.tsx                     # Terms & Conditions
        │   ├── grievances/page.tsx                # Grievance Redressal
        │   ├── summons/page.tsx                   # Summons & Legal Notices
        │   └── sitemap/page.tsx                   # Platform Sitemap
        │
        └── api/
            ├── login/route.ts                     # POST: Authenticate user and return role-based session payload
            ├── register/
            │   ├── route.ts                       # POST: Create Candidate or Employer user + initial profile record
            │   └── check/route.ts                 # POST: Pre-registration uniqueness check for Email & Mobile Number
            ├── profile/route.ts                   # GET / PUT / POST: Full Candidate & Employer profile CRUD + UploadThing sync
            ├── jobs/route.ts                      # GET / POST / PATCH / DELETE: Job postings & status lifecycle management
            ├── companies/route.ts                 # GET: Live registered employers with active job counts
            ├── employer/
            │   ├── company-profile/route.ts       # GET / PUT: Employer corporate profile & KYC document upload
            │   ├── talent/route.ts                # GET: Fetch real candidate profiles for Resdex search
            │   └── check-mobile/route.ts          # POST: Verify employer mobile availability
            ├── user/
            │   └── delete/route.ts                # DELETE: Full account deletion (purges Neon DB records + UploadThing files)
            ├── uploadthing/
            │   ├── core.ts                        # UploadThing file router configuration
            │   └── route.ts                       # UploadThing Next.js API handler
            └── delete-file/route.ts               # POST: Standalone UploadThing file deletion utility