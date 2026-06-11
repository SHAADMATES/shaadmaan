import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Trophy, Calendar, CheckSquare, Award, Sparkles, Activity } from 'lucide-react';
import Toast from '../../components/Toast';

const StudentDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [results, setResults] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const regRes = await api.get('/student/registrations/my');
        setRegistrations(regRes.data);

        const resRes = await api.get('/student/results/my');
        setResults(resRes.data);

        const schRes = await api.get('/student/schedules');
        setSchedules(schRes.data);
      } catch (err) {
        console.error(err);
        setToastType('error');
        setToastMessage('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
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

  // Calculate stats
  const totalPoints = results.reduce((acc, curr) => acc + (curr.points || 0), 0);
  const registeredCount = registrations.length;
  const positionsCount = results.filter(r => ['1st', '2nd', '3rd'].includes(r.position)).length;
  const completedCount = results.length;

  const cards = [
    { 
      title: 'Total Points', 
      value: totalPoints, 
      icon: Award, 
      gradient: 'from-amber-500/10 to-gold/10 text-gold-dark' 
    },
    { 
      title: 'Registered Programs', 
      value: registeredCount, 
      icon: CheckSquare, 
      gradient: 'from-blue-500/10 to-royal/10 text-royal dark:text-cyan-light' 
    },
    { 
      title: 'Completed Programs', 
      value: completedCount, 
      icon: Trophy, 
      gradient: 'from-cyan-500/10 to-cyan/10 text-cyan dark:text-cyan-light' 
    },
    { 
      title: 'Achieved Standings', 
      value: positionsCount, 
      icon: Activity, 
      gradient: 'from-emerald-500/10 to-emerald/10 text-emerald' 
    },
  ];

  return (
    <div className="p-6 space-y-8 animate-scale">
      {/* Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-royal via-royal-light to-cyan text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <span className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
            <Sparkles size={12} className="text-gold" /> <span>Student Desk</span>
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-sans">
            Your Shaad-Mates Dashboard
          </h2>
          <p className="text-sm md:text-base text-slate-200/90 max-w-2xl font-light">
            Stay active! Check out available events, coordinate group registrations with fellow members, track your calendar, and review your performance standings.
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

      {/* Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Upcoming Timelines */}
        <div className="p-6 rounded-3xl glass-card border space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold font-sans flex items-center space-x-2">
              <Calendar size={18} className="text-royal" />
              <span>Upcoming Schedules</span>
            </h3>
            <span className="text-xs text-slate-400">Personal Calendar</span>
          </div>

          <div className="space-y-4">
            {schedules.length === 0 ? (
              <p className="text-slate-400 text-center py-8 italic text-sm">
                No schedule slots compiled. Register for events to synchronize timelines.
              </p>
            ) : (
              schedules.slice(0, 4).map((sch) => (
                <div key={sch._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-850 flex items-center justify-between hover-scale">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      {sch.programId?.title}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {new Date(sch.date).toLocaleDateString()} at {sch.time}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-royal bg-royal/10 border border-royal/20 px-3 py-1 rounded-xl">
                    {sch.venue}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Personal Standings Summary */}
        <div className="p-6 rounded-3xl glass-card border space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-lg font-bold font-sans flex items-center space-x-2">
              <Trophy size={18} className="text-gold" />
              <span>My Achievement Log</span>
            </h3>
            <span className="text-xs text-slate-400">Scorecard standings</span>
          </div>

          <div className="space-y-4">
            {results.length === 0 ? (
              <p className="text-slate-400 text-center py-8 italic text-sm">
                No score standings published for your registrations yet.
              </p>
            ) : (
              results.slice(0, 4).map((res) => (
                <div key={res._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-850 flex items-center justify-between hover-scale">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                      {res.program?.title}
                    </h4>
                    <p className="text-xs text-slate-400 italic">"{res.remarks || 'Excellent effort.'}"</p>
                  </div>
                  <div className="flex items-center space-x-3 text-right">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/10 text-gold-dark border border-gold/20">
                        {res.position}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-400">Grade {res.grade}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
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

export default StudentDashboard;
