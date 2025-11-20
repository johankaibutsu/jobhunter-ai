
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, FileText, Briefcase, MessageSquare, ArrowRight, TrendingUp } from 'lucide-react';
import { Page, UserProfile } from '../types';

interface Props {
  setPage: (page: Page) => void;
  userProfile: UserProfile;
}

export const Dashboard: React.FC<Props> = ({ setPage, userProfile }) => {
  
  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue, etc.
    });

    const counts = last7Days.map(day => ({ name: day, saved: 0 }));

    userProfile.savedJobs.forEach(job => {
      const jobDay = new Date(job.dateSaved).toLocaleDateString('en-US', { weekday: 'short' });
      const dayData = counts.find(c => c.name === jobDay);
      if (dayData) dayData.saved++;
    });

    return counts;
  }, [userProfile.savedJobs]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome, {userProfile.name.split(' ')[0]}!</h1>
          <p className="text-indigo-100 text-lg max-w-2xl">
            Your AI career assistant is ready. You have saved <span className="font-bold text-white">{userProfile.savedJobs.length}</span> jobs so far.
          </p>
          <button 
            onClick={() => setPage(Page.RESUME_OPTIMIZER)}
            className="mt-8 bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2"
          >
            Start Optimizing <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <Sparkles className="absolute top-12 right-12 w-64 h-64 text-white opacity-10 rotate-12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => setPage(Page.RESUME_OPTIMIZER)}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            {userProfile.lastAtsScore ? (
              <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-bold">
                Score: {userProfile.lastAtsScore}
              </div>
            ) : null}
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Resume Optimizer</h3>
          <p className="text-slate-500 text-sm">Get specific, actionable feedback to pass ATS scans.</p>
        </div>

        <div 
           onClick={() => setPage(Page.JOB_MATCHER)}
           className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
             <div className="px-2 py-1 bg-purple-50 text-purple-700 rounded-md text-xs font-bold">
                {userProfile.savedJobs.length} Saved
             </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Job Matcher</h3>
          <p className="text-slate-500 text-sm">Compare your resume against JDs to find gaps.</p>
        </div>

        <div 
           onClick={() => setPage(Page.INTERVIEW_COACH)}
           className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6 text-emerald-600" />
            </div>
             {userProfile.lastInterviewDate && (
               <div className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold">
                 Last: {new Date(userProfile.lastInterviewDate).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
               </div>
             )}
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Interview Coach</h3>
          <p className="text-slate-500 text-sm">Practice realistic mock interviews with instant feedback.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" /> Saved Jobs Activity
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} allowDecimals={false} />
                <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="saved" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
             <h3 className="text-lg font-bold mb-2">Resume Tip</h3>
             <p className="text-indigo-200 text-sm leading-relaxed">
               To increase your match score, copy exact keywords from the job description into your skills section. Don't just list tasks; list impact with numbers (e.g., "Reduced latency by 20%").
             </p>
          </div>
          <div className="relative z-10 mt-6">
            <button onClick={() => setPage(Page.JOB_MATCHER)} className="text-sm font-bold text-indigo-300 hover:text-white transition-colors flex items-center gap-1">
              Analyze a JD <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <Briefcase className="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-800 opacity-50" />
        </div>
      </div>
    </div>
  );
};
