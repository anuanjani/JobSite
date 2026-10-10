import React from 'react';
import Link from 'next/link';

export default function JobDetailsPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-fuchsia-500/30 overflow-hidden relative pb-20">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-500/15 blur-[120px] rounded-full pointer-events-none fixed"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/15 blur-[150px] rounded-full pointer-events-none fixed"></div>

      <div className="max-w-[1200px] mx-auto p-6 md:p-8 relative z-10">
        <nav className="flex justify-between items-center mb-10 border-b border-slate-700/50 pb-6">
          <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
            ROLEMATCH<span className="text-fuchsia-500">.</span>
          </Link>
          <Link href="/jobs" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition">
            ← Back to Jobs
          </Link>
        </nav>

        <header className="mb-10 rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center text-slate-400 font-black text-3xl">T</div>
            <div>
              <div className="flex gap-3 mb-2">
                <span className="px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-[10px] font-bold tracking-widest uppercase text-fuchsia-400">Featured</span>
                <span className="px-3 py-1 rounded-full border border-slate-700 bg-slate-800 text-[10px] font-bold tracking-widest uppercase text-slate-300">Remote</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter text-white mb-2">Senior Frontend Engineer</h1>
              <p className="text-lg text-slate-400 font-medium">TechCorp Solutions • Bengaluru, India</p>
            </div>
          </div>
          <button className="w-full md:w-auto bg-white text-black px-10 py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-slate-200 transition shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            Apply Now
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <main className="lg:col-span-8 flex flex-col gap-6">
            <div className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-10">
              <h2 className="text-xl font-bold tracking-tight text-white mb-6">Job Description</h2>
              <div className="text-slate-400 font-medium leading-relaxed space-y-4">
                <p>We are looking for an experienced Senior Frontend Engineer to lead the development of our core web platform. You will be working with Next.js, React, and Tailwind CSS to build highly scalable user interfaces.</p>
                <p>You will collaborate directly with our design and product teams to translate Figma prototypes into pixel-perfect, accessible, and performant code.</p>
                <h3 className="text-white font-bold mt-8 mb-4">Key Responsibilities</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Architect and develop responsive frontend web applications.</li>
                  <li>Mentor junior engineers and conduct code reviews.</li>
                  <li>Optimize applications for maximum speed and scalability.</li>
                </ul>
              </div>
            </div>
          </main>

          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-8">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">Job Overview</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Salary Range</p>
                  <p className="text-lg font-bold text-emerald-400">₹ 15L - ₹ 25L PA</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Experience</p>
                  <p className="text-sm font-medium text-slate-300">4-8 Years</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Required Skills</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['React.js', 'Next.js', 'TypeScript', 'Tailwind'].map(skill => (
                      <span key={skill} className="text-[10px] font-bold tracking-wider uppercase text-slate-300 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-full">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}