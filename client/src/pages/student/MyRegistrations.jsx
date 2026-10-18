import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, FolderKanban, Sparkles, ArrowRight, Calendar, Award } from 'lucide-react';

const MyRegistrations = () => {
  return (
    <div className="p-6 space-y-6 animate-scale">
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-r from-royal via-royal-light to-cyan text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="text-gold" />
            <span>Open Participation Policy</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
            Direct Event Participation
          </h2>
          <p className="text-sm sm:text-base text-slate-100 max-w-2xl font-light leading-relaxed">
            Individual program pre-registration has been replaced with open access! You no longer need to fill out registration forms to compete.
          </p>
        </div>
      </div>

      <div className="glass-card border rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-md">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={36} />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white font-sans">
            You Are Automatically Qualified!
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            As an enrolled Shaad-Mates student, you have immediate access to all scheduled competitions, hackathons, debates, and athletics. Simply arrive at the venue on event day with your Student ID card.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <Calendar size={20} className="text-royal mb-2" />
            <h4 className="font-bold text-xs text-slate-800 dark:text-white">View Timelines</h4>
            <p className="text-[11px] text-slate-400">Check dates, times, and venues for upcoming challenges.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
            <Award size={20} className="text-gold mb-2" />
            <h4 className="font-bold text-xs text-slate-800 dark:text-white">Earn Merit Honors</h4>
            <p className="text-[11px] text-slate-400">Adjudicators evaluate all attendees and record points directly.</p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/student/available-programs"
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-royal to-cyan hover:from-royal-dark hover:to-cyan-dark text-white font-bold rounded-2xl text-xs shadow-lg flex items-center justify-center gap-2"
          >
            <FolderKanban size={16} /> Browse Programs Directory
          </Link>
          <Link
            to="/student/my-results"
            className="w-full sm:w-auto px-8 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs transition-colors"
          >
            Review My Results & Standings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyRegistrations;
