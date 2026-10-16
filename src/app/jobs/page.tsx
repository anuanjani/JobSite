'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';

export default function JobsPage() {
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);
  const [jobQuery, setJobQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  
  const [displayedJobs, setDisplayedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<number | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (jobQuery) params.append('search', jobQuery);
      if (locationQuery) params.append('location', locationQuery);
      if (selectedWorkModes.length > 0) params.append('workMode', selectedWorkModes[0]);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setDisplayedJobs(data.jobs);
      }
    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedWorkModes, jobQuery, locationQuery]);

  const toggleWorkMode = (mode: string) => {
    setSelectedWorkModes(prev => prev.includes(mode) ? prev.filter(m => m !== mode) : [mode]);
  };

  const clearFilters = () => { 
    setSelectedWorkModes([]); 
    setJobQuery('');
    setLocationQuery('');
  };

  const handleApply = async (jobId: number) => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      alert('Please log in as a candidate to apply for jobs.');
      window.location.href = '/login';
      return;
    }
    const user = JSON.parse(savedUser);
    setApplyingId(jobId);

    try {
      const res = await fetch('/api/candidate/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, jobId })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Successfully applied for this job!');
      } else {
        alert(data.error || 'Failed to apply.');
      }
    } catch (err) {
      alert('Application error.');
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans relative pb-20 selection:bg-fuchsia-500/30">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-fuchsia-500/10 blur-[120px] rounded-full pointer-events-none fixed z-0"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none fixed z-0"></div>

      {/* NAVBAR CONTAINER */}
      <div className="max-w-[1400px] mx-auto w-full px-6 py-6 md:px-8 relative z-50">
        <Navbar />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-8 relative z-10 pt-4">
        
        {/* PAGE HEADER & SEARCH */}
        <div className="mb-10 max-w-5xl mt-2">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-6">Find your next role.</h1>
          
          <div className="rounded-full bg-slate-800/60 backdrop-blur-md border border-slate-700/50 p-2 flex flex-col md:flex-row items-center gap-3 shadow-lg max-w-4xl relative z-40">
            <div className="flex-1 flex items-center w-full px-4">
              <span className="text-slate-400 mr-2">🔍</span>
              <input 
                type="text" 
                value={jobQuery}
                onChange={(e) => setJobQuery(e.target.value)}
                placeholder="Job title, skills, or company" 
                className="w-full bg-transparent outline-none text-sm text-slate-200 font-medium placeholder-slate-500 py-3" 
              />
            </div>

            <div className="w-px h-6 bg-slate-700 hidden md:block"></div>
            
            <div className="flex-1 flex items-center w-full px-4">
              <span className="text-slate-400 mr-2">📍</span>
              <input 
                type="text" 
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Location" 
                className="w-full bg-transparent outline-none text-sm text-slate-200 font-medium placeholder-slate-500 py-3" 
              />
            </div>

            <button onClick={fetchJobs} className="bg-white text-black px-10 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition w-full md:w-auto text-center shrink-0 cursor-pointer">Search</button>
          </div>
        </div>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10">
          
          {/* SIDEBAR FILTERS */}
          <aside className="xl:col-span-3 space-y-8">
            <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-[2rem] p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300 mb-6 flex justify-between">
                Filters
                <span onClick={clearFilters} className="text-fuchsia-400 cursor-pointer hover:text-fuchsia-300 transition">Clear</span>
              </h3>
              
              <div className="mb-8">
                <h4 className="text-xs font-bold text-slate-500 mb-4">WORK MODE</h4>
                <div className="space-y-3">
                  {['Remote', 'Hybrid', 'In-Office'].map(mode => (
                    <div key={mode} onClick={() => toggleWorkMode(mode)} className="flex items-center gap-3 cursor-pointer group select-none">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors duration-200 ${selectedWorkModes.includes(mode) ? 'bg-fuchsia-500 border-fuchsia-500' : 'border-slate-600 group-hover:border-fuchsia-500'}`}>
                        {selectedWorkModes.includes(mode) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={`text-sm transition ${selectedWorkModes.includes(mode) ? 'text-white font-bold' : 'text-slate-300 group-hover:text-white'}`}>{mode}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* JOB LISTINGS */}
          <main className="xl:col-span-9 flex flex-col gap-5">
            <div className="flex justify-between items-center mb-2 px-2">
              <p className="text-sm font-medium text-slate-400">Showing <strong className="text-white">{displayedJobs.length}</strong> real jobs from Neon database</p>
            </div>

            {loading ? (
               <div className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-12 text-center text-slate-400">
                 Loading live jobs...
               </div>
            ) : displayedJobs.length === 0 ? (
               <div className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-12 text-center">
                 <p className="text-4xl mb-4">📭</p>
                 <h3 className="text-xl font-bold text-white mb-2">No active jobs found</h3>
                 <p className="text-sm text-slate-400">Employers have not posted any roles matching this filter yet.</p>
               </div>
            ) : (
              displayedJobs.map((job) => (
                <div key={job.id} className="rounded-[2rem] bg-slate-800/40 backdrop-blur-md border border-slate-700/50 p-6 md:p-8 hover:bg-slate-800/80 hover:border-slate-600 transition group relative overflow-hidden">
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex gap-6 items-start">
                      <div className="w-16 h-16 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center text-slate-300 font-black text-2xl shrink-0 shadow-inner">
                        {job.logo}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-fuchsia-400 transition mb-2">{job.title}</h3>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-slate-400 font-medium">
                          <span className="text-slate-200">{job.company}</span>
                          <span className="flex items-center gap-1.5">📍 {job.location}</span>
                          <span className="flex items-center gap-1.5">💰 {job.salary}</span>
                          <span className="flex items-center gap-1.5">💼 {job.type}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleApply(job.id)}
                      disabled={applyingId === job.id}
                      className="hidden md:block bg-slate-700 hover:bg-white hover:text-black text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {applyingId === job.id ? 'Applying...' : 'Apply Now'}
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-6 pt-6 border-t border-slate-700/50 gap-4">
                    <div className="flex items-center flex-wrap gap-2">
                      {job.tags?.map((tag: string) => (
                        <span key={tag} className="text-[10px] font-bold tracking-wider uppercase text-slate-300 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-500">Active Listing</span>
                  </div>
                </div>
              ))
            )}
          </main>

        </div>
      </div>
    </div>
  );
}