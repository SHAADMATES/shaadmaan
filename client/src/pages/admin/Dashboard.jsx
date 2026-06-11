import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { 
  Users, 
  UserSquare2, 
  FolderKanban, 
  CheckSquare, 
  Trophy, 
  Activity, 
  TrendingUp, 
  Sparkles,
  Award,
  BookOpen,
  Circle,
  ArrowUpRight,
  Shield
} from 'lucide-react';
import Toast from '../../components/Toast';

const StatCard = ({ title, value, icon: Icon, gradient, accent, change }) => (
  <div className={`relative p-6 rounded-3xl overflow-hidden border group hover:-translate-y-1 transition-all duration-300 cursor-default glass-card`}>
    {/* Background glow */}
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient} blur-2xl scale-150`} />
    
    <div className="relative flex items-start justify-between">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{title}</span>
        <p className="text-4xl font-extrabold tracking-tight font-sans text-slate-900 dark:text-white mt-2">{value}</p>
        {change !== undefined && (
          <div className="flex items-center space-x-1 mt-1">
            <ArrowUpRight size={12} className={`${change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
            <span className={`text-xs font-semibold ${change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {change >= 0 ? '+' : ''}{change} this month
            </span>
          </div>
        )}
      </div>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${accent}`}>
        <Icon size={26} className="text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentPrograms, setRecentPrograms] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data);
        
        const programsRes = await api.get('/admin/programs');
        setRecentPrograms(programsRes.data.slice(-6).reverse());
      } catch (err) {
        console.error(err);
        setToastType('error');
        setToastMessage('Failed to fetch dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-40 rounded-3xl animate-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-36 rounded-3xl animate-shimmer" />
          ))}
        </div>
        <div className="h-96 rounded-3xl animate-shimmer" />
      </div>
    );
  }

  const cards = [
    { 
      title: 'Total Students', 
      value: stats?.totalStudents || 0, 
      icon: Users,
      gradient: 'bg-blue-400/5',
      accent: 'bg-gradient-to-br from-blue-500 to-royal'
    },
    { 
      title: 'Wing Chairmen', 
      value: stats?.totalWingManagers || 0, 
      icon: Shield,
      gradient: 'bg-emerald-400/5',
      accent: 'bg-gradient-to-br from-emerald-500 to-teal-600'
    },
    { 
      title: 'Total Programs', 
      value: stats?.totalPrograms || 0, 
      icon: FolderKanban,
      gradient: 'bg-purple-400/5',
      accent: 'bg-gradient-to-br from-purple-500 to-violet-600'
    },
    { 
      title: 'Registrations', 
      value: stats?.totalRegistrations || 0, 
      icon: CheckSquare,
      gradient: 'bg-amber-400/5',
      accent: 'bg-gradient-to-br from-amber-500 to-orange-500'
    },
  ];

  const secondaryStats = [
    { label: 'Completed Events', value: stats?.completedPrograms || 0, icon: Trophy, color: 'text-royal' },
    { label: 'Results Published', value: stats?.resultsPublished || 0, icon: Activity, color: 'text-emerald-500' },
    { label: 'Publications', value: stats?.publicationsCount || 0, icon: BookOpen, color: 'text-purple-500' },
    { label: 'Certificates Issued', value: stats?.certificatesIssued || 0, icon: Award, color: 'text-amber-500' },
  ];

  const statusStyles = {
    'Upcoming':       'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    'Active':         'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/30',
    'Completed':      'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30',
    'Result Published':'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/20 dark:text-purple-300 dark:border-purple-900/30',
  };

  return (
    <div className="p-6 space-y-8 animate-scale">
      {/* Welcome Banner */}
      <div className="p-6 md:p-10 rounded-3xl bg-gradient-to-br from-navy via-slate-900 to-slate-800 text-white shadow-2xl relative overflow-hidden border border-slate-700/40">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-royal/20 rounded-full blur-3xl pointer-events-none -translate-y-20 translate-x-20" />
        <div className="absolute bottom-0 left-20 w-60 h-60 bg-cyan/10 rounded-full blur-3xl pointer-events-none translate-y-10" />
        <div className="absolute top-1/2 left-1/2 w-96 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2" />
        
        <div className="relative z-10 space-y-3">
          <span className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full border border-white/15 backdrop-blur-sm">
            <Sparkles size={11} className="text-amber-400" />
            <span className="text-slate-300">Admin Control Center</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight font-sans bg-gradient-to-r from-white via-slate-200 to-cyan-200 bg-clip-text text-transparent">
            Shaad-Mates Console
          </h2>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl font-light leading-relaxed">
            Manage student registrations, authorize wing programs, schedule timings, publish results, and issue certificates — all from one powerful dashboard.
          </p>
        </div>

        {/* Quick secondary stats */}
        <div className="relative z-10 mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {secondaryStats.map((s, i) => {
            const SIcon = s.icon;
            return (
              <div key={i} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3 flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center ${s.color}`}>
                  <SIcon size={16} />
                </div>
                <div>
                  <p className="text-xl font-extrabold text-white">{s.value}</p>
                  <p className="text-[10px] text-slate-400 font-medium leading-tight">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <StatCard key={idx} {...card} />
        ))}
      </div>

      {/* Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Programs */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card border space-y-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-base font-bold font-sans flex items-center space-x-2">
              <Activity size={17} className="text-royal" />
              <span>Recent Program Proposals</span>
            </h3>
            <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              Latest {recentPrograms.length}
            </span>
          </div>

          <div className="space-y-2">
            {recentPrograms.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <FolderKanban size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No programs registered yet.</p>
              </div>
            ) : (
              recentPrograms.map((p) => (
                <div key={p._id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-500/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${p.approved ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{p.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{p.wing || 'No Wing'} · {p.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0 ml-3">
                    <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                      p.approved 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30'
                        : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30'
                    }`}>
                      {p.approved ? 'Approved' : 'Pending'}
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-medium border ${statusStyles[p.status] || statusStyles['Upcoming']}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Wing Program Breakdown */}
        <div className="p-6 rounded-3xl glass-card border space-y-5 shadow-lg">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <TrendingUp size={17} className="text-emerald-500" />
            <h3 className="text-base font-bold font-sans">Wing Program Activity</h3>
          </div>

          <div className="space-y-4">
            {stats?.wingsData?.length > 0 ? (
              stats.wingsData.map((w, idx) => {
                const pct = Math.min(100, (w.programsCount / Math.max(1, stats.totalPrograms)) * 100);
                const colors = ['bg-royal', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-cyan-500'];
                const color = colors[idx % colors.length];
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{w._id || 'Unassigned'}</span>
                      <span className="font-bold text-slate-900 dark:text-white ml-2">{w.programsCount}</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`${color} h-full rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400">
                <Circle size={30} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs">No wing data yet.</p>
              </div>
            )}
          </div>

          {/* Total Programs Summary */}
          <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-royal/10 to-cyan/5 border border-royal/20">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Programs</p>
            <p className="text-3xl font-extrabold text-royal dark:text-cyan-300 mt-1">{stats?.totalPrograms || 0}</p>
            <p className="text-xs text-slate-400 mt-1">Across all wings combined</p>
          </div>
        </div>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
      )}
    </div>
  );
};

export default Dashboard;
