'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CandidateDashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Loading...');
  const [userInitials, setUserInitials] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUserName(parsed.name);
      const initials = parsed.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
      setUserInitials(initials);
    } else {
      setUserName('Guest User');
      setUserInitials('GU');
    }

    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const recommendedJobs = [
    { title: 'Senior Frontend Engineer', company: 'TechCorp Solutions', type: 'Remote', status: 'Interview', color: 'text-emerald-400', bg: 'bg-emerald-400/10', rating: '4.2', reviews: '1.2K+ reviews', exp: '4-8 Yrs', salary: '₹ 15-25 Lacs PA', location: 'Bengaluru, Hyderabad', tags: ['React.js', 'Next.js', 'TypeScript', 'Redux'], posted: '2 Days Ago' },
    { title: 'React.js Developer', company: 'InnovateX', type: 'Hybrid', status: 'Review', color: 'text-amber-400', bg: 'bg-amber-400/10', rating: '3.9', reviews: '450 reviews', exp: '3-6 Yrs', salary: 'Not disclosed', location: 'Remote', tags: ['Node.js', 'React.js', 'MongoDB', 'AWS'], posted: 'Just Now' },
    { title: 'Product Designer', company: 'Studio AI', type: 'Remote', status: 'Applied', color: 'text-slate-400', bg: 'bg-slate-400/10', rating: '4.5', reviews: '2K+ reviews', exp: '2-5 Yrs', salary: '₹ 10-18 Lacs PA', location: 'Bengaluru', tags: ['Figma', 'Wireframing', 'Prototyping'], posted: '1 Day Ago' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-fuchsia-500/30 overflow-hidden relative pb-20">
      
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-500/15 blur-[120px] rounded-full pointer-events-none fixed"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/15 blur-[150px] rounded-full pointer-events-none fixed"></div>

      <div className="max-w-[1400px] mx-auto p-6 md:p-8 relative z-10">
        
        <nav className="flex justify-between items-center mb-10 border-b border-slate-700/50 pb-6 relative z-50">
          {/* FIXED: Logo now correctly links to Home ("/") */}
          <Link href="/" className="text-2xl font-extrabold tracking-tighter text-white">
            ROLEMATCH<span className="text-fuchsia-500">.</span>
          </Link>
          
          <div className="flex gap-4 items-center">
            <div className="hidden md:flex gap-8 text-sm font-bold tracking-wide text-slate-400 mr-8 uppercase">
              <Link href="/candidate/dashboard" className="text-white border-b-2 border-fuchsia-500 pb-1">Dashboard</Link>
              <Link href="/jobs" className="hover:text-white transition pb-1">Jobs</Link>
              <Link href="/messages" className="hover:text-white transition pb-1">Messages</Link>
            </div>
            
            <button className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition backdrop-blur-md">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </button>
            
            {/* Interactive Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center text-xs font-bold tracking-tighter hover:border-fuchsia-500 transition cursor-pointer"
              >
                {userInitials}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-800 border border-slate-600 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50">
                  
                  <div className="p-6 border-b border-slate-700 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center text-xl font-bold text-slate-300">
                      {userInitials}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{userName}</h3>
                      <Link href="/candidate/profile" className="text-xs font-bold text-fuchsia-400 hover:text-fuchsia-300 transition">View & Update Profile</Link>
                    </div>
                  </div>

                  <div className="p-6 border-b border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Profile Performance</span>
                      <span className="text-[10px] text-slate-500 font-medium">Last 90 days</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700">
                        <p className="text-xl font-bold text-white">951</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Search Apps</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700">
                        <p className="text-xl font-bold text-white">51</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Recruiter Actions</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex flex-col gap-1">
                    <Link href="/settings" className="px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 rounded-xl transition flex items-center gap-3">
                      <span>⚙️</span> Settings
                    </Link>
                    <Link href="/faqs" className="px-4 py-3 text-sm font-bold text-slate-300 hover:bg-slate-700 rounded-xl transition flex items-center gap-3">
                      <span>❓</span> FAQs
                    </Link>
                    <button onClick={handleLogout} className="px-4 py-3 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition flex items-center gap-3 text-left w-full mt-2 border-t border-slate-700 pt-4">
                      <span>🚪</span> Logout
                    </button>
                  </div>

                </div>
              )}
            </div>
          </div>
        </nav>

        {/* HERO SECTION */}
        <header className="mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter leading-[1.1] mb-4 text-white">
            Command Center<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-600">{userName}</span>
          </h1>
          <div className="flex gap-3">
            <span className="px-4 py-1 rounded-full border border-slate-700 bg-slate-800/50 backdrop-blur-md text-[10px] font-bold tracking-widest uppercase text-slate-300">Available</span>
            <span className="px-4 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 backdrop-blur-md text-[10px] font-bold tracking-widest uppercase text-fuchsia-400">Premium Member</span>
          </div>
        </header>

        {/* BENTO GRID UX */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 flex flex-col gap-6">
            
            <div className="rounded-[2rem] bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-slate-600 flex items-center justify-center text-2xl font-bold mb-4">
                {userInitials}
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">{userName}</h2>
              <p className="text-sm text-slate-400 mb-6 font-medium">Software Professional</p>
              
              <div className="w-full border-t border-slate-700/50 pt-6 text-left">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Profile Status</span>
                  <span className="text-xs font-bold text-emerald-400">85%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 mb-4 border border-slate-700">
                  <div className="bg-emerald-400 h-1.5 rounded-full w-[85%] shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                </div>
                <Link href="/candidate/profile" className="w-full flex justify-center text-xs font-bold uppercase tracking-widest text-white border border-slate-600 rounded-full py-3 hover:bg-slate-700 transition">
                  Update Resume
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Total Pipeline</p>
              <p className="text-6xl font-extrabold tracking-tighter text-white">24</p>
              <p className="text-slate-400 text-sm mt-2 font-medium">Active applications in progress</p>
            </div>

          </aside>

          <main className="lg:col-span-6 flex flex-col gap-6">
            <div className="rounded-full bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-2 flex items-center gap-3 shadow-lg focus-within:border-slate-500 transition-colors">
              <span className="text-slate-400 pl-4">🔍</span>
              <input type="text" placeholder="Search jobs, skills, companies..." className="flex-1 bg-transparent outline-none text-sm text-slate-200 font-medium placeholder-slate-500" />
              <Link href="/jobs" className="bg-white text-black px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition">
                Search
              </Link>
            </div>

            <div className="flex justify-between items-end px-2">
              <h3 className="text-lg font-bold tracking-tight text-white">Recommended Jobs</h3>
              <Link href="/jobs" className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-white transition">
                View All ↗
              </Link>
            </div>

            {recommendedJobs.map((job, idx) => (
              <div key={idx} className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-6 hover:bg-slate-800/60 hover:border-slate-600 transition cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-white tracking-tight group-hover:text-fuchsia-400 transition">{job.title}</h4>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-sm font-medium text-slate-300">{job.company}</span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">★ {job.rating}</span>
                      <span className="text-xs text-slate-500">{job.reviews}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-center text-slate-400 font-black text-xl">
                    {job.company.charAt(0)}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400 font-medium mb-5">
                  <span className="flex items-center gap-1.5">💼 {job.exp}</span>
                  <span className="text-slate-600">|</span>
                  <span className="flex items-center gap-1.5">💰 {job.salary}</span>
                  <span className="text-slate-600">|</span>
                  <span className="flex items-center gap-1.5">📍 {job.location}</span>
                </div>
                <div className="flex items-center flex-wrap gap-2 mb-6">
                  {job.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold tracking-wider uppercase text-slate-300 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-full">{tag}</span>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-5 border-t border-slate-700/50">
                  <span className="text-xs font-bold text-slate-500">{job.posted}</span>
                  <button className="text-sm text-slate-400 hover:text-white font-bold flex items-center gap-1.5 transition">☆ Save Job</button>
                </div>
              </div>
            ))}
          </main>

          <aside className="lg:col-span-3 flex flex-col gap-6">
            <div className="rounded-[2rem] bg-gradient-to-br from-indigo-500 to-fuchsia-600 p-8 relative overflow-hidden flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 cursor-pointer shadow-[0_0_40px_rgba(168,85,247,0.15)] h-64">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xl mb-4">
                <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Upcoming</p>
                <h3 className="text-2xl font-bold tracking-tight text-white leading-tight">TechCorp<br/>Interview</h3>
                <p className="text-white/80 text-sm mt-2 font-medium">Tomorrow, 10:00 AM</p>
              </div>
            </div>
            <div className="rounded-[2rem] bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-8 flex flex-col justify-between h-56">
              <div className="flex justify-between items-start">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Profile Views</p>
                <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded text-xs font-bold border border-emerald-400/20">+12%</span>
              </div>
              <div>
                <p className="text-5xl font-extrabold tracking-tighter text-white">142</p>
                <p className="text-slate-400 text-sm mt-2 font-medium">This week</p>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}