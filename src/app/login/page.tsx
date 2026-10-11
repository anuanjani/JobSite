'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    try {
      await new Promise((resolve) => setTimeout(resolve, 3500));
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setStatus('success');
        router.push('/candidate/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
        setStatus('idle');
      }
    } catch (err) {
      setError('Failed to connect to server.');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-fuchsia-500/30 flex items-center justify-center relative p-6">
      <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-fuchsia-600/20 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="absolute top-0 left-0 w-full p-8 flex items-center z-20">
        <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">ROLEMATCH<span className="text-fuchsia-500">.</span></Link>
      </div>

      <div className="group w-full max-w-5xl rounded-[2rem] bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl">
        <Link href="/" className="absolute top-6 right-6 md:top-8 md:right-8 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center hover:bg-slate-700 hover:text-fuchsia-400 transition-all duration-300 opacity-0 group-hover:opacity-100 text-slate-400 z-50 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
        </Link>
        
        <div className="w-full md:w-5/12 bg-slate-900/50 p-12 flex flex-col justify-center border-r border-slate-700/50">
            <p className="text-fuchsia-400 text-[10px] font-bold uppercase tracking-widest mb-4">Welcome Back</p>
            <h1 className="text-4xl font-extrabold tracking-tighter leading-[1.1] mb-6 text-white">
              Unlock your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400">next move.</span>
            </h1>
        </div>

        <div className="w-full md:w-7/12 p-12 lg:p-16">
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Sign In</h2>
          
          <form onSubmit={handleLogin} className="space-y-5 mb-8 mt-8 relative z-20">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
              <input type="email" required onChange={(e) => setCredentials({...credentials, email: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">Password</label>
              </div>
              <input type="password" required onChange={(e) => setCredentials({...credentials, password: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-500 transition-colors" />
            </div>

            {error && <p className="text-red-400 text-sm font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

            {/* Static CSS for the Shimmer Effect */}
            <style>{`
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
              }
            `}</style>

            <button 
              type="submit" 
              disabled={status === 'loading'} 
              className={`relative overflow-hidden flex h-14 w-full items-center justify-center rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 mt-6 ${
                status === 'loading' 
                  ? 'cursor-wait bg-slate-800 text-slate-400 border border-slate-700 shadow-inner' 
                  : 'bg-white text-black hover:bg-slate-200 border-transparent'
              }`}
            >
              {/* SKELETON METALLIC GLARE */}
              {status === 'loading' && (
                <div 
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                  style={{ animation: 'shimmer 1.5s infinite' }}
                ></div>
              )}

              <div className="relative z-10 flex items-center gap-3">
                {status === 'loading' ? (
                  <span className="tracking-[0.2em]">AUTHENTICATING...</span>
                ) : (
                  'SIGN IN TO DASHBOARD'
                )}
              </div>
            </button>
          </form>
          <p className="text-center text-xs font-medium text-slate-500 mt-8 relative z-20">
            Don't have an account? <Link href="/register" className="text-white font-bold hover:underline cursor-pointer transition">Sign up for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}