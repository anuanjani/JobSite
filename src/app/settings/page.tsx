'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountSettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id?: number;
    name?: string;
    companyName?: string;
    email: string;
    role: string;
  } | null>(null);

  // Change Password Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  // Notification Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [recruiterMessages, setRecruiterMessages] = useState(true);

  // Delete Account Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('user');
      if (!saved) {
        router.push('/login');
        return;
      }
      const parsed = JSON.parse(saved);
      if (!parsed?.email) {
        router.push('/login');
        return;
      }
      setUser({
        id: parsed.id,
        name: parsed.name || parsed.fullName || '',
        companyName: parsed.companyName || '',
        email: parsed.email,
        role: String(parsed.role || 'CANDIDATE').toUpperCase(),
      });
    } catch {
      router.push('/login');
    }
  }, [router]);

  const isEmployer = user?.role === 'EMPLOYER';
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  const isNewPasswordStrong = passwordRegex.test(newPassword);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!user?.email) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError('Please fill in all password fields.');
      return;
    }

    if (!isNewPasswordStrong) {
      setPwdError(
        'New password must be at least 8 characters and include uppercase, lowercase, number, and special character.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirm password do not match.');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change',
          email: user.email,
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPwdError(data.error || 'Failed to update password.');
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPwdSuccess(
        data.message || 'Your password has been updated successfully!'
      );
    } catch {
      setPwdError('Network error while updating password. Please try again.');
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.email) return;
    setDeleting(true);
    setDeleteError('');

    try {
      const res = await fetch('/api/user/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          userId: user.id,
        }),
      });

      if (res.ok) {
        localStorage.removeItem('user');
        window.dispatchEvent(
          new CustomEvent('profile-updated', { detail: null })
        );
        router.push('/');
      } else {
        const data = await res.json();
        setDeleteError(data.error || 'Failed to delete account.');
      }
    } catch {
      setDeleteError('Network error while deleting account.');
    } finally {
      setDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
        <div className="text-xs font-bold text-slate-400">
          Loading account settings...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans py-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span
                className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                  isEmployer
                    ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                    : 'bg-pink-500/15 border-pink-500/30 text-pink-300'
                }`}
              >
                {isEmployer ? 'Employer Account' : 'Candidate Account'}
              </span>
              <span className="text-xs text-slate-400">{user.email}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Account &amp; Security Settings
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage your password, security credentials, and account
              preferences.
            </p>
          </div>

          <Link
            href={isEmployer ? '/employer/dashboard' : '/candidate/dashboard'}
            className="self-start sm:self-center px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-extrabold text-white transition shrink-0"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* =================================================================
            SECTION 1: CHANGE PASSWORD (CANDIDATE & EMPLOYER)
           ================================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 mb-6 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-extrabold text-white">
                Change Password
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Replace your emailed registration password with your own custom
                password.
              </p>
            </div>
            <Link
              href="/forgot-password"
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Forgot current password? Reset via Email →
            </Link>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5 max-w-xl">
            {/* Current Password */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Current Password *
              </label>
              <div className="relative flex items-center">
                <input
                  type={showCurrentPwd ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                  className="absolute right-3.5 flex items-center justify-center text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
                >
                  {showCurrentPwd ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                New Password *
              </label>
              <div className="relative flex items-center">
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create a strong new password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNewPwd(!showNewPwd)}
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                  className="absolute right-3.5 flex items-center justify-center text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
                >
                  {showNewPwd ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Strength Checklist */}
              {newPassword.length > 0 && (
                <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  <span
                    className={
                      /[A-Z]/.test(newPassword)
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }
                  >
                    {/[A-Z]/.test(newPassword) ? '✓' : '•'} Uppercase letter
                    (A-Z)
                  </span>
                  <span
                    className={
                      /[a-z]/.test(newPassword)
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }
                  >
                    {/[a-z]/.test(newPassword) ? '✓' : '•'} Lowercase letter
                    (a-z)
                  </span>
                  <span
                    className={
                      /\d/.test(newPassword)
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }
                  >
                    {/\d/.test(newPassword) ? '✓' : '•'} Number (0-9)
                  </span>
                  <span
                    className={
                      /[\W_]/.test(newPassword)
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }
                  >
                    {/[\W_]/.test(newPassword) ? '✓' : '•'} Special char
                    (!@#$%^&amp;*)
                  </span>
                  <span
                    className={
                      newPassword.length >= 8
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }
                  >
                    {newPassword.length >= 8 ? '✓' : '•'} Minimum 8 characters
                  </span>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Confirm New Password *
              </label>
              <div className="relative flex items-center">
                <input
                  type={showConfirmPwd ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                  className="absolute right-3.5 flex items-center justify-center text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
                >
                  {showConfirmPwd ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {pwdError && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-xs font-bold text-red-400">
                {pwdError}
              </div>
            )}

            {pwdSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300">
                ✓ {pwdSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={pwdLoading}
              className="px-7 py-3.5 rounded-xl bg-white hover:bg-slate-200 disabled:bg-slate-700 text-slate-950 font-extrabold text-xs uppercase tracking-widest transition shadow-lg cursor-pointer"
            >
              {pwdLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* =================================================================
            SECTION 2: NOTIFICATION PREFERENCES
           ================================================================= */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <h2 className="text-lg font-extrabold text-white">
            Communication &amp; Alert Preferences
          </h2>
          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <p className="font-bold text-white">
                  {isEmployer
                    ? 'Instant Job Application Alerts'
                    : 'Recommended Job Alerts'}
                </p>
                <p className="text-slate-400 mt-0.5">
                  {isEmployer
                    ? 'Receive real-time bell notifications when candidates apply to your posted roles.'
                    : 'Get notified when new roles matching your skills are published.'}
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <p className="font-bold text-white">
                  Direct Recruiter &amp; Candidate Messaging
                </p>
                <p className="text-slate-400 mt-0.5">
                  Allow verified messages and interview invitations in your
                  Rolematch inbox.
                </p>
              </div>
              <input
                type="checkbox"
                checked={recruiterMessages}
                onChange={(e) => setRecruiterMessages(e.target.checked)}
                className="w-4 h-4 accent-indigo-500 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* =================================================================
            SECTION 3: DANGER ZONE — DELETE ACCOUNT
           ================================================================= */}
        <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-red-400">
              Delete Account
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Permanently remove your {isEmployer ? 'employer' : 'candidate'}{' '}
              profile, job applications, and associated data.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="self-start sm:self-center px-5 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-600 border border-red-500/40 text-xs font-extrabold text-red-300 hover:text-white transition cursor-pointer shrink-0"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-[999999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-7 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-extrabold text-white">
              Confirm Account Deletion
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-white">{user.email}</strong>? This action
              cannot be undone.
            </p>
            {deleteError && (
              <p className="text-xs font-bold text-red-400">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteAccount}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-extrabold text-white cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}