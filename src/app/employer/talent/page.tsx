import React from 'react';
import Link from 'next/link';

export default function TalentSearchPage() {
  const talents = [
    { name: 'John Doe', role: 'Senior Frontend Engineer', location: 'Bengaluru', status: 'Open to Work', skills: ['React', 'Next.js', 'TypeScript'], match: 'High' },
    { name: 'Sarah Jones', role: 'UI/UX Designer', location: 'Remote', status: 'Employed', skills: ['Figma', 'Prototyping', 'CSS'], match: 'Medium' },
    { name: 'Mike Chen', role: 'Backend Developer', location: 'Hyderabad', status: 'Open to Work', skills: ['Node.js', 'Python', 'AWS'], match: 'High' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative pb-20">
      <div className="absolute top-[10%] left-[-5%] w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none fixed"></div>

      <div className="max-w-[1400px] mx-auto p-6 md:p-8 relative z-10">
        <nav className="flex justify-between items-center mb-10 border-b border-slate-700/50 pb-6">
          <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
            ROLEMATCH<span className="text-indigo-500">.</span>
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-bold tracking-wide text-slate-400 uppercase">
            <Link href="/employer/dashboard" className="hover:text-white transition pb-1">Dashboard</Link>
            <Link href="/employer/talent" className="text-white border-b-2 border-indigo-500 pb-1">Talent Search</Link>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center text-xs font-bold tracking-tighter">TC</div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3">
            <div className="rounded-[2rem] bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-8">
              <h2 className="text-lg font-bold text-white tracking-tight mb-8">Candidate Filters</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Availability</h3>
                  <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" defaultChecked className="accent-indigo-500" /> <span className="text-sm font-medium text-slate-300">Open to Work</span></label>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Experience</h3>
                  <input type="range" min="0" max="10" className="w-full accent-indigo-500" />
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-9 flex flex-col gap-6">
            <div className="rounded-full bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-2 flex items-center gap-3 shadow-lg">
              <span className="text-slate-400 pl-4">🔍</span>
              <input type="text" placeholder="Search talents by skill, title, or keyword..." className="flex-1 bg-transparent outline-none text-sm text-slate-200 font-medium placeholder-slate-500" />
              <button className="bg-indigo-600 text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-indigo-500 transition">Search</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {talents.map((talent, idx) => (
                <div key={idx} className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-6 hover:border-slate-500 transition group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center font-bold text-lg">{talent.name.charAt(0)}</div>
                      <div>
                        <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition">{talent.name}</h4>
                        <p className="text-xs text-slate-400 font-medium">{talent.role} • {talent.location}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-6">
                    {talent.skills.map(skill => (
                      <span key={skill} className="text-[10px] font-bold tracking-wider uppercase text-slate-300 bg-slate-900 border border-slate-700 px-3 py-1 rounded-full">{skill}</span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-700/50">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{talent.status}</span>
                    <button className="text-xs font-bold uppercase tracking-widest text-white border border-slate-600 px-4 py-2 rounded-full hover:bg-slate-700 transition">Message</button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}