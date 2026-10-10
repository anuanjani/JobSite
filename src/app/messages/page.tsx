import React from 'react';
import Link from 'next/link';

export default function MessagesPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center relative p-6">
      <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-fuchsia-600/10 blur-[150px] rounded-full pointer-events-none"></div>
      <Link href="/candidate/dashboard" className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition mb-8">← Back to Dashboard</Link>
      <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-4xl border border-slate-700 mb-6">💬</div>
      <h1 className="text-3xl font-bold text-white mb-2">Messages Inbox</h1>
      <p className="text-slate-400 font-medium">Your recruiter conversations will appear here.</p>
    </div>
  );
}