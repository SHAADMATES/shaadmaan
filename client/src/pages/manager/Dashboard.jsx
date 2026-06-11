import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { FolderKanban, CheckSquare, Trophy, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import Toast from '../../components/Toast';

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentPrograms, setRecentPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get('/chairman/stats');
        setStats(statsRes.data);

        const programsRes = await api.get('/chairman/programs');
        setRecentPrograms(programsRes.data.slice(-5).reverse());
      } catch (err) {
        console.error(err);
        setToastType('error');
        setToastMessage('Failed to load wing statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 rounded-3xl animate-shimmer"></div>
          ))}
        </div>
        <div className="h-96 rounded-3xl animate-shimmer"></div>
      </div>
    );
  }

  const cards = [
    { 
      title: 'Wing Programs', 
      value: stats?.totalPrograms || 0, 
      icon: FolderKanban, 
      gradient: 'from-blue-500/10 to-royal/10 text-royal dark:text-cyan-light' 
    },
    { 
      title: 'Active Programs', 
      value: stats?.activePrograms || 0, 
      icon: Activity, 
      gradient: 'from-emerald-500/10 to-emerald/10 text-emerald' 
    },
    { 
      title: 'Total Registrations', 
      value: stats?.totalRegistrations || 0, 
      icon: CheckSquare, 
      gradient: 'from-gold-500/10 to-gold/10 text-gold-dark' 
    },
    { 
      title: 'Completed Programs', 
      value: stats?.completedPrograms || 0, 
      icon: Trophy, 
      gradient: 'from-cyan-500/10 to-cyan/10 text-cyan dark:text-cyan-light' 
    },
  ];

  return (
    <div className="p-6 space-y-8 animate-scale">
      {/* Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-dark via-emerald to-cyan text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <span className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
            <Sparkles size={12} className="text-gold" /> <span>{stats?.wing} Console</span>
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-sans">
            Welcome to the {stats?.wing} Portal
          </h2>
          <p className="text-sm md:text-base text-slate-200/90 max-w-2xl font-light">
            Here you can propose new program events, review registered students, coordinate program rules, and view published event results.
          </p>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className="p-6 rounded-3xl glass-card border flex items-center justify-between hover-scale glow-blue"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <p className="text-3xl font-extrabold tracking-tight font-sans text-slate-800 dark:text-white">
                  {card.value}
                </p>
              </div>
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${card.gradient}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Content */}
      <div className="p-6 rounded-3xl glass-card border space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="text-lg font-bold font-sans flex items-center space-x-2">
            <Activity size={18} className="text-emerald" />
            <span>My Wing Programs</span>
          </h3>
          <span className="text-xs text-slate-400">Proposed by me</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold">
                <th className="pb-3">Title</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Approval</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Venue</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {recentPrograms.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400">No programs proposed. Propose a new program to start.</td>
                </tr>
              ) : (
                recentPrograms.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="py-3 font-semibold text-slate-700 dark:text-slate-200">{p.title}</td>
                    <td className="py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {p.type}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        p.approved 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/20' 
                          : 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/20'
                      }`}>
                        {p.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{p.venue}</td>
                    <td className="py-3 text-slate-600 dark:text-slate-300 font-semibold text-xs">{p.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}
    </div>
  );
};

export default ManagerDashboard;
