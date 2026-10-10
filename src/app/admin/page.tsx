import React from 'react';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex">
      
      {/* ADMIN SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen p-6 fixed left-0 top-0">
        <div className="text-2xl font-bold text-white mb-2">RoleMatch</div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-8">Admin Control</div>
        
        <nav className="space-y-2 font-medium">
          <a href="#" className="block text-white bg-slate-800 px-4 py-2 rounded-lg">Overview</a>
          <a href="#" className="block px-4 py-2 hover:bg-slate-800 hover:text-white rounded-lg flex justify-between">
            Job Approvals <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">12</span>
          </a>
          <a href="#" className="block px-4 py-2 hover:bg-slate-800 hover:text-white rounded-lg">User Management</a>
          <a href="#" className="block px-4 py-2 hover:bg-slate-800 hover:text-white rounded-lg">Platform Settings</a>
          <a href="#" className="block px-4 py-2 hover:bg-slate-800 hover:text-white rounded-lg">Billing & Revenue</a>
        </nav>
      </aside>

      {/* ADMIN MAIN CONTENT */}
      <main className="ml-64 flex-1 p-8">
        <header className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className="text-gray-500">System Status: <span className="text-green-500">All Systems Operational</span></span>
            <button className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300">Admin Profile</button>
          </div>
        </header>

        {/* HIGH-LEVEL METRICS */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Users', value: '124,592', change: '+1,204' },
            { label: 'Active Jobs', value: '8,430', change: '+342' },
            { label: 'Pending Approvals', value: '12', change: '-5', urgent: true },
            { label: 'MRR (Revenue)', value: '₹4.2M', change: '+8.4%' },
          ].map((metric, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-slate-500 text-sm font-medium mb-1">{metric.label}</h3>
              <p className={`text-3xl font-bold ${metric.urgent ? 'text-red-600' : 'text-slate-900'}`}>{metric.value}</p>
              <p className="text-xs text-green-600 mt-2 font-medium">↑ {metric.change} this week</p>
            </div>
          ))}
        </div>

        {/* MODERATION QUEUE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Pending Job Approvals</h2>
            <p className="text-sm text-gray-500">Review flagged or new employer postings before they go live.</p>
          </div>
          
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-gray-200 text-sm text-slate-500">
              <tr>
                <th className="p-4 font-medium">Employer</th>
                <th className="p-4 font-medium">Job Title</th>
                <th className="p-4 font-medium">Flag Reason</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { company: 'CryptoStart', title: 'Web3 Developer', flag: 'New Employer Account' },
                { company: 'MarketingPro', title: 'Guaranteed Income Sales', flag: 'Potential Spam/MLM Keyword' },
                { company: 'GlobalTech', title: 'Data Entry (Remote)', flag: 'User Report: Unresponsive' },
              ].map((job, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition">
                  <td className="p-4 font-medium text-gray-900">{job.company}</td>
                  <td className="p-4 text-blue-600 hover:underline cursor-pointer">{job.title}</td>
                  <td className="p-4">
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">{job.flag}</span>
                  </td>
                  <td className="p-4 space-x-2">
                    <button className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-medium hover:bg-green-200">Approve</button>
                    <button className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm font-medium hover:bg-red-200">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
}