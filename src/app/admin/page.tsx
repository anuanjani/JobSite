'use client';
import React, { useState, useEffect } from 'react';

export default function EnterpriseAdminConsolePage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCandidates: 0,
    totalEmployers: 0,
    totalJobs: 0,
    totalApplications: 0,
  });
  const [employers, setEmployers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin', { cache: 'no-store' });
      const data = await res.json();
      if (data && !data.error) {
        setStats(data.stats || stats);
        setEmployers(Array.isArray(data.employers) ? data.employers : []);
        setAuditLogs(Array.isArray(data.auditLogs) ? data.auditLogs : []);
      }
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleKycUpdate = async (employerId: number, kycStatus: string) => {
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateKyc',
          employerId,
          kycStatus,
        }),
      });
      if (res.ok) {
        showToast(`Employer KYC marked as ${kycStatus}`);
        fetchAdminData();
      }
    } catch {}
  };

  const handleToggleSubscription = async (
    userId: number,
    currentStatus: string
  ) => {
    const nextStatus =
      String(currentStatus || '').toUpperCase() === 'ACTIVE'
        ? 'INACTIVE'
        : 'ACTIVE';
    try {
      const res = await fetch('/api/admin', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggleSubscription',
          userId,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        showToast(
          nextStatus === 'ACTIVE'
            ? 'Resdex Pro Unlocked (Unmasked Contacts Enabled)'
            : 'Resdex Pro Subscription Revoked'
        );
        fetchAdminData();
      }
    } catch {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-8 font-sans">
      {toast && (
        <div className="fixed bottom-6 right-6 z-[999999] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-extrabold">
          ✓ {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[10px] font-extrabold uppercase tracking-wider text-indigo-300">
            Enterprise Governance &amp; Security
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Rolematch Super Admin Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live KYC verification, Resdex contact-unlocking entitlements, and
            immutable security audit logs.
          </p>
        </div>

        {/* LIVE PLATFORM METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total Users', val: stats.totalUsers },
            { label: 'Candidates', val: stats.totalCandidates },
            { label: 'Employers', val: stats.totalEmployers },
            { label: 'Jobs Posted', val: stats.totalJobs },
            { label: 'Applications', val: stats.totalApplications },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl"
            >
              <span className="text-[11px] font-bold text-slate-400 block">
                {item.label}
              </span>
              <span className="text-2xl font-extrabold text-white mt-1 block">
                {loading ? '...' : item.val}
              </span>
            </div>
          ))}
        </div>

        {/* EMPLOYER KYC & SUBSCRIPTION ENTITLEMENTS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <h2 className="text-lg font-extrabold text-white">
            Employer KYC Verification &amp; Resdex Contact Entitlements
          </h2>

          {employers.length === 0 ? (
            <p className="text-xs text-slate-400">
              No employers registered yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 pr-4">Company / Recruiter</th>
                    <th className="py-3 pr-4">Email &amp; Phone</th>
                    <th className="py-3 pr-4">KYC Status</th>
                    <th className="py-3 pr-4">Resdex Plan (Unmask Contacts)</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {employers.map((emp) => {
                    const kyc = String(
                      emp.kyc_status || 'PENDING'
                    ).toUpperCase();
                    const subActive =
                      String(emp.subscription_status || '').toUpperCase() ===
                      'ACTIVE';

                    return (
                      <tr key={emp.id} className="text-slate-200">
                        <td className="py-4 pr-4">
                          <p className="font-extrabold text-white">
                            {emp.company_name || emp.full_name || 'Employer'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {emp.industry_type || 'Corporate'} •{' '}
                            {emp.city || 'India'}
                          </p>
                        </td>
                        <td className="py-4 pr-4">
                          <p>{emp.user_email}</p>
                          <p className="text-slate-400">{emp.phone}</p>
                        </td>
                        <td className="py-4 pr-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                              kyc === 'VERIFIED'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : kyc === 'REJECTED'
                                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {kyc}
                          </span>
                          {emp.kyc_doc_url && (
                            <a
                              href={emp.kyc_doc_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-[11px] text-blue-400 hover:underline mt-1"
                            >
                              View KYC Doc ↗
                            </a>
                          )}
                        </td>
                        <td className="py-4 pr-4">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleSubscription(
                                emp.user_id,
                                emp.subscription_status
                              )
                            }
                            className={`px-3.5 py-1.5 rounded-full text-[11px] font-extrabold transition cursor-pointer ${
                              subActive
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:text-white'
                            }`}
                          >
                            {subActive
                              ? '✓ Pro Active (Unmasked)'
                              : '🔒 Free Tier (Masked)'}
                          </button>
                        </td>
                        <td className="py-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              handleKycUpdate(emp.id, 'VERIFIED')
                            }
                            className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white font-extrabold transition cursor-pointer"
                          >
                            Approve KYC
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleKycUpdate(emp.id, 'REJECTED')
                            }
                            className="px-3 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600 border border-red-500/30 text-red-300 hover:text-white font-extrabold transition cursor-pointer"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* IMMUTABLE SECURITY AUDIT LOGS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
          <h2 className="text-lg font-extrabold text-white">
            Immutable Security &amp; Compliance Audit Logs
          </h2>

          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400">
              Audit events will appear here automatically as users sign in,
              upgrade password hashes, or modify records.
            </p>
          ) : (
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 pr-4">Timestamp</th>
                    <th className="py-2.5 pr-4">Actor</th>
                    <th className="py-2.5 pr-4">Role</th>
                    <th className="py-2.5 pr-4">Event</th>
                    <th className="py-2.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="text-slate-300">
                      <td className="py-2.5 pr-4 text-slate-400 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-4 font-bold text-white">
                        {log.actor_email}
                      </td>
                      <td className="py-2.5 pr-4">{log.actor_role}</td>
                      <td className="py-2.5 pr-4">
                        <span className="px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-extrabold text-indigo-300">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}