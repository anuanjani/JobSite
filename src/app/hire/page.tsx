'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface EmployerCompany {
  id: number | string;
  userId: number | string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  companyType: string;
  industry: string;
  employeeCount: string;
  designation: string;
  location: string;
  address: string;
  pincode: string;
  websiteUrl: string;
  kycStatus: string;
  activeJobsCount: number;
  activeJobs: any[];
}

export default function CompaniesDirectoryPage() {
  const [employers, setEmployers] = useState<EmployerCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployer, setSelectedEmployer] =
    useState<EmployerCompany | null>(null);

  // Search & Filter states
  const [searchInput, setSearchInput] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('ALL');
  const [onlyVerifiedKyc, setOnlyVerifiedKyc] = useState(false);

  useEffect(() => {
    fetch('/api/companies', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.employers && Array.isArray(data.employers)) {
          setEmployers(data.employers);
        }
      })
      .catch((err) => console.error('Failed to load employers:', err))
      .finally(() => setLoading(false));
  }, []);

  const industries = Array.from(
    new Set(employers.map((e) => e.industry).filter(Boolean))
  );

  const filteredEmployers = employers.filter((emp) => {
    if (onlyVerifiedKyc && emp.kycStatus !== 'APPROVED') {
      return false;
    }

    if (selectedIndustry !== 'ALL' && emp.industry !== selectedIndustry) {
      return false;
    }

    const q = searchInput.trim().toLowerCase();
    if (!q) return true;

    const inName = emp.companyName?.toLowerCase().includes(q);
    const inIndustry = emp.industry?.toLowerCase().includes(q);
    const inLocation = emp.location?.toLowerCase().includes(q);

    return inName || inIndustry || inLocation;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-12 px-6 md:px-12 relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute top-[5%] right-[10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tighter text-white">
            Explore Companies
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-2">
            Discover real-time registered employers and active hiring teams on
            Rolematch.
          </p>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="max-w-3xl bg-slate-900/90 border border-slate-800 rounded-full p-2 pl-6 flex items-center justify-between gap-4 mb-10 shadow-2xl"
        >
          <div className="flex items-center gap-3 flex-1">
            <span className="text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search companies by name, industry, or city..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3 rounded-full bg-white hover:bg-slate-200 text-slate-950 font-extrabold text-xs uppercase tracking-widest transition cursor-pointer shrink-0"
          >
            SEARCH
          </button>
        </form>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDEBAR: COMPANY FILTERS */}
          <aside className="lg:col-span-3 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                FILTERS
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  setSelectedIndustry('ALL');
                  setOnlyVerifiedKyc(false);
                }}
                className="text-xs font-extrabold uppercase tracking-wider text-pink-500 hover:text-pink-400 cursor-pointer"
              >
                CLEAR
              </button>
            </div>

            {/* Verified KYC Filter */}
            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-3">
                VERIFICATION
              </span>
              <label className="flex items-center gap-3 cursor-pointer text-xs font-medium text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={onlyVerifiedKyc}
                  onChange={(e) => setOnlyVerifiedKyc(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 accent-indigo-500 cursor-pointer"
                />
                <span>KYC Verified Employers</span>
              </label>
            </div>

            {/* Industry Filter */}
            <div>
              <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-3">
                INDUSTRY
              </span>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Industries</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
          </aside>

          {/* RIGHT MAIN EMPLOYER CARDS */}
          <div className="lg:col-span-9">
            <p className="text-xs font-semibold text-slate-400 mb-4">
              Showing{' '}
              <strong className="text-white">{filteredEmployers.length}</strong>{' '}
              real {filteredEmployers.length === 1 ? 'employer' : 'employers'}{' '}
              from Neon database
            </p>

            {loading ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 text-center text-sm text-slate-400">
                Loading employers from Neon database...
              </div>
            ) : filteredEmployers.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl py-16 px-6 text-center shadow-xl">
                <div className="text-4xl mb-3">🏢</div>
                <h3 className="text-lg font-extrabold text-white">
                  No employers found
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  No registered companies match your current filter criteria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEmployers.map((emp) => (
                  <div
                    key={emp.id}
                    className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 sm:p-7 shadow-xl transition-all flex flex-col justify-between gap-5"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-13 h-13 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-extrabold text-lg text-white shrink-0">
                            {emp.companyName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h2 className="text-lg font-extrabold text-white truncate">
                              {emp.companyName}
                            </h2>
                            <p className="text-xs font-semibold text-slate-400 truncate mt-0.5">
                              {emp.industry} • {emp.location}
                            </p>
                          </div>
                        </div>

                        {emp.kycStatus === 'APPROVED' && (
                          <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                            ✓ Verified
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-300">
                          🏢 {emp.companyType}
                        </span>
                        {emp.employeeCount && (
                          <span className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-300">
                            👥 {emp.employeeCount} Employees
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                      <span className="text-xs font-extrabold text-indigo-400">
                        {emp.activeJobsCount}{' '}
                        {emp.activeJobsCount === 1
                          ? 'Active Job'
                          : 'Active Jobs'}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedEmployer(emp)}
                          className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-extrabold text-white transition cursor-pointer"
                        >
                          View Company
                        </button>
                        <Link
                          href={`/jobs?company=${encodeURIComponent(
                            emp.companyName
                          )}`}
                          className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-[11px] font-extrabold text-white transition shadow"
                        >
                          Open Roles &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company Details & Active Roles Modal */}
      {selectedEmployer && (
        <div
          className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedEmployer(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-7 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedEmployer(null)}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-4 pb-6 border-b border-slate-800 pr-10">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center font-extrabold text-2xl text-white shrink-0">
                {selectedEmployer.companyName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-2xl font-extrabold text-white">
                    {selectedEmployer.companyName}
                  </h2>
                  {selectedEmployer.kycStatus === 'APPROVED' && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-extrabold uppercase text-emerald-400">
                      ✓ KYC Verified
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  {selectedEmployer.industry} • {selectedEmployer.location}
                </p>
              </div>
            </div>

            <div className="py-6 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                  Organization Type
                </span>
                <span className="font-bold text-white">
                  {selectedEmployer.companyType}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                  Company Size
                </span>
                <span className="font-bold text-white">
                  {selectedEmployer.employeeCount
                    ? `${selectedEmployer.employeeCount} Employees`
                    : 'Not specified'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                  Contact Person
                </span>
                <span className="font-bold text-white">
                  {selectedEmployer.contactPerson || 'HR Team'}
                  {selectedEmployer.designation
                    ? ` (${selectedEmployer.designation})`
                    : ''}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                  Location / Address
                </span>
                <span className="font-bold text-white">
                  {selectedEmployer.address || selectedEmployer.location}
                  {selectedEmployer.pincode
                    ? ` - ${selectedEmployer.pincode}`
                    : ''}
                </span>
              </div>
            </div>

            {/* Active Jobs Posted by this Employer */}
            <div className="pt-6">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                Active Job Openings ({selectedEmployer.activeJobsCount})
              </h4>

              {selectedEmployer.activeJobs &&
              selectedEmployer.activeJobs.length > 0 ? (
                <div className="space-y-3">
                  {selectedEmployer.activeJobs.map((job: any) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between gap-4"
                    >
                      <div>
                        <h5 className="text-sm font-extrabold text-white">
                          {job.title}
                        </h5>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {job.location || 'India'} •{' '}
                          {job.work_mode || 'Hybrid'} •{' '}
                          {job.experience || 'Open'}
                        </p>
                      </div>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white transition shrink-0"
                      >
                        Apply &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  No active job postings from this employer right now.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}