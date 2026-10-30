'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step 1 = Request Reset Code | Step 2 = Verify 6-Digit Code & Set New Password
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  const isPasswordValid = passwordRegex.test(newPassword);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendResetCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'forgot-send',
          email: cleanEmail,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not send reset code.');
        return;
      }

      setCode(['', '', '', '', '', '']);
      setStep(2);
      setCooldown(30);
      setSuccessMsg(
        data.message || `A 6-digit reset code has been sent to ${cleanEmail}.`
      );
    } catch {
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const updated = [...code];
    updated[index] = value;
    setCode(updated);
    if (value && index < 5) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const joinedCode = code.join('');
    if (joinedCode.length !== 6) {
      setError('Please enter the 6-digit reset code sent to your email.');
      return;
    }

    if (!isPasswordValid) {
      setIsPasswordFocused(true);
      setError(
        'Password must contain uppercase, lowercase, number, special character, and at least 8 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'forgot-reset',
          email: email.trim().toLowerCase(),
          code: joinedCode,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to reset password.');
        return;
      }

      setSuccessMsg(
        data.message || 'Password reset successfully! Redirecting to Sign In...'
      );
      setTimeout(() => {
        router.push('/login');
      }, 1800);
    } catch {
      setError('Network error while resetting password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-pink-500/30 flex items-center justify-center relative p-6 py-24">
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* Ambient Glow */}
      <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-fuchsia-600/15 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="group w-full max-w-5xl rounded-[2rem] bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl">
        {/* Top Right Close Button */}
        <Link
          href="/login"
          className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto absolute top-6 right-6 md:top-8 md:right-8 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center hover:bg-slate-700 hover:text-pink-400 transition-all duration-300 text-slate-400 z-50 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        >
          ✕
        </Link>

        {/* Left Panel */}
        <div className="w-full md:w-5/12 bg-slate-900/50 p-10 lg:p-12 flex flex-col border-r border-slate-700/50 justify-center">
          <div>
            <div className="inline-block px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-extrabold uppercase tracking-widest text-pink-400 mb-6">
              Account Recovery
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-white leading-[1.1] mb-6">
              Reset your{' '}
              <span className="text-pink-400">account password.</span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Works for both Candidate and Employer accounts. We&apos;ll send a
              6-digit verification code to your registered email so you can
              securely set a new password.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-7/12 p-10 lg:p-12 flex flex-col justify-center">
          <h1 className="text-3xl font-extrabold tracking-tighter text-white mb-2">
            {step === 1 ? 'Forgot Password' : 'Verify & Set New Password'}
          </h1>
          <p className="text-sm text-slate-400 font-medium mb-8">
            {step === 1
              ? 'Enter your registered email ID to receive a 6-digit reset code.'
              : `Enter the 6-digit code sent to ${email} and choose your new password.`}
          </p>

          {step === 1 ? (
            <form onSubmit={handleSendResetCode} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Registered Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`relative overflow-hidden flex h-14 w-full items-center justify-center rounded-xl font-extrabold text-xs uppercase tracking-widest transition-all duration-300 mt-6 ${
                  loading
                    ? 'cursor-wait bg-slate-800 text-slate-300 border border-slate-700'
                    : 'bg-white text-slate-950 hover:bg-slate-200 shadow-lg cursor-pointer'
                }`}
              >
                {loading && (
                  <div
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    style={{ animation: 'shimmer 1.5s infinite' }}
                  ></div>
                )}
                <span className="relative z-10">
                  {loading ? 'SENDING RESET CODE...' : 'SEND RESET CODE'}
                </span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* 6-Digit Reset Code Boxes */}
              <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    6-Digit Email Verification Code *
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={cooldown > 0 || loading}
                      onClick={() => handleSendResetCode()}
                      className="text-xs font-bold text-pink-400 hover:underline disabled:text-slate-600 cursor-pointer"
                    >
                      {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend Code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                    >
                      Change Email
                    </button>
                  </div>
                </div>

                <div className="flex gap-2.5 sm:gap-3 justify-start">
                  {code.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        codeRefs.current[idx] = el;
                      }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(e.target.value, idx)}
                      onKeyDown={(e) => handleCodeKeyDown(e, idx)}
                      className="w-11 h-12 sm:w-12 bg-slate-950 border border-slate-700 rounded-xl text-center text-base font-bold text-white outline-none focus:border-pink-500"
                    />
                  ))}
                </div>
              </div>

              {/* New Password with Vertically Centered Eye Toggle */}
              <div className="relative">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  New Password *
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Create a strong new password"
                    value={newPassword}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white outline-none focus:border-pink-500 transition-colors"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ top: '50%', transform: 'translateY(-50%)' }}
                    className="absolute right-3.5 flex items-center justify-center text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
                  >
                    {showNewPassword ? (
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

                {isPasswordFocused && (
                  <div className="absolute left-0 top-[calc(100%+6px)] w-full bg-slate-950 border border-slate-700 p-3.5 rounded-xl shadow-2xl z-50 text-xs text-slate-300 space-y-1.5">
                    <p className="font-bold text-white">
                      Password requirements:
                    </p>
                    <p
                      className={
                        /[A-Z]/.test(newPassword)
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }
                    >
                      {/[A-Z]/.test(newPassword) ? '✓' : '•'} One uppercase
                      letter (A-Z)
                    </p>
                    <p
                      className={
                        /[a-z]/.test(newPassword)
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }
                    >
                      {/[a-z]/.test(newPassword) ? '✓' : '•'} One lowercase
                      letter (a-z)
                    </p>
                    <p
                      className={
                        /\d/.test(newPassword)
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }
                    >
                      {/\d/.test(newPassword) ? '✓' : '•'} One number (0-9)
                    </p>
                    <p
                      className={
                        /[\W_]/.test(newPassword)
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }
                    >
                      {/[\W_]/.test(newPassword) ? '✓' : '•'} One special
                      character (!@#$%^&amp;*)
                    </p>
                    <p
                      className={
                        newPassword.length >= 8
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }
                    >
                      {newPassword.length >= 8 ? '✓' : '•'} Minimum 8 characters
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm New Password with Vertically Centered Eye Toggle */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white outline-none focus:border-pink-500 transition-colors"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    style={{ top: '50%', transform: 'translateY(-50%)' }}
                    className="absolute right-3.5 flex items-center justify-center text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
                  >
                    {showConfirmPassword ? (
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

              {successMsg && (
                <p className="text-emerald-300 text-xs font-bold bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/25">
                  ✓ {successMsg}
                </p>
              )}

              {error && (
                <p className="text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`relative overflow-hidden flex h-14 w-full items-center justify-center rounded-xl font-extrabold text-xs uppercase tracking-widest transition-all duration-300 mt-4 ${
                  loading
                    ? 'cursor-wait bg-slate-800 text-slate-300 border border-slate-700'
                    : 'bg-white text-slate-950 hover:bg-slate-200 shadow-lg cursor-pointer'
                }`}
              >
                {loading && (
                  <div
                    className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    style={{ animation: 'shimmer 1.5s infinite' }}
                  ></div>
                )}
                <span className="relative z-10">
                  {loading ? 'UPDATING PASSWORD...' : 'RESET PASSWORD'}
                </span>
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-800/70 text-center text-xs font-medium text-slate-400">
            Remembered your password?{' '}
            <Link
              href="/login"
              className="text-white font-bold hover:text-pink-400 hover:underline transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}