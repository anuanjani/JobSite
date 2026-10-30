'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatus('loading');

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(
          new CustomEvent('profile-updated', { detail: data.user })
        );
        setStatus('success');

        if (String(data.user.role).toUpperCase() === 'EMPLOYER') {
          router.push('/employer/dashboard');
        } else {
          router.push('/candidate/dashboard');
        }
      } else {
        setError(data.error || 'Invalid email or password.');
        setStatus('idle');
      }
    } catch {
      setError('Failed to connect to server. Please try again.');
      setStatus('idle');
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

      {/* Card with `group` so the top-right (✕) button only appears when hovering over the card */}
      <div className="group w-full max-w-5xl rounded-[2rem] bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl">
        {/* Top Right Close Button (Hides when cursor is not on the card) */}
        <Link
          href="/"
          className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto absolute top-6 right-6 md:top-8 md:right-8 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center hover:bg-slate-700 hover:text-pink-400 transition-all duration-300 text-slate-400 z-50 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        >
          ✕
        </Link>

        {/* Left Panel */}
        <div className="w-full md:w-5/12 bg-slate-900/50 p-10 lg:p-12 flex flex-col border-r border-slate-700/50 justify-center">
          <div>
            <div className="inline-block px-3.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-extrabold uppercase tracking-widest text-pink-400 mb-6">
              Welcome Back
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter text-white leading-[1.1] mb-6">
              Powering your{' '}
              <span className="text-pink-400">next move.</span>
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sign in to access your personalized dashboard, track job
              applications, or manage your enterprise talent pipeline.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-7/12 p-10 lg:p-12 flex flex-col justify-center">
          <h1 className="text-3xl font-extrabold tracking-tighter text-white mb-2">
            Sign In
          </h1>
          <p className="text-sm text-slate-400 font-medium mb-8">
            Enter your registered email and password to continue.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-sm text-white outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            {/* Password with Forgot Password Link & Vertically Centered Eye Toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Password *
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-pink-400 hover:text-pink-300 hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white outline-none focus:border-pink-500 transition-colors"
                />

                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                  className="absolute right-3.5 flex items-center justify-center text-slate-400 hover:text-white transition-colors p-1 cursor-pointer"
                >
                  {showPassword ? (
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

            {error && (
              <p className="text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className={`relative overflow-hidden flex h-14 w-full items-center justify-center rounded-xl font-extrabold text-xs uppercase tracking-widest transition-all duration-300 mt-6 ${
                status === 'loading'
                  ? 'cursor-wait bg-slate-800 text-slate-300 border border-slate-700'
                  : 'bg-white text-slate-950 hover:bg-slate-200 shadow-lg cursor-pointer'
              }`}
            >
              {status === 'loading' && (
                <div
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  style={{ animation: 'shimmer 1.5s infinite' }}
                ></div>
              )}
              <div className="relative z-10 flex items-center gap-3">
                {status === 'loading' ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin text-pink-400"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                    <span>SIGNING IN...</span>
                  </>
                ) : (
                  <span>SIGN IN</span>
                )}
              </div>
            </button>
          </form>

          {/* Bottom Registration Links (Adjacent: Register as Candidate | Register as Employer) */}
          <div className="mt-8 pt-6 border-t border-slate-800/70 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs font-medium text-slate-400">
            <span>Don&apos;t have an account?</span>
            <div className="flex items-center gap-3">
              <Link
                href="/register"
                className="text-white font-bold hover:text-pink-400 hover:underline transition-colors"
              >
                Register as Candidate
              </Link>
              <span className="text-slate-600">|</span>
              <Link
                href="/employer/register"
                className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline transition-colors"
              >
                Register as Employer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}