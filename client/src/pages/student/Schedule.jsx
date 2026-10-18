import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Calendar, Clock, MapPin, RefreshCw, Printer } from 'lucide-react';
import Toast from '../../components/Toast';
import UniversalExport from '../../components/UniversalExport';

const StudentSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await api.get('/student/schedules');
        setSchedules(res.data);
      } catch (err) {
        setToastType('error');
        setToastMessage('Failed to load schedule.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  const exportData = schedules.map(sch => ({
    Program: sch.programId?.title || 'Program Event',
    Date: new Date(sch.date).toLocaleDateString(),
    Time: sch.time || 'TBD',
    Venue: sch.venue || 'Auditorium',
    Notes: sch.description || 'N/A'
  }));

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b dark:border-slate-800 pb-4 gap-3 print:border-b-2 print:border-black">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2 text-slate-800 dark:text-white">
            <Calendar className="text-royal" />
            <span>My Event Schedule & Timetable</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Official timetable and venues for your registered programs.
          </p>
        </div>

        {schedules.length > 0 && (
          <div className="flex items-center space-x-2 print:hidden">
            <UniversalExport
              data={exportData}
              filename={`My_Schedule_${new Date().toISOString().slice(0, 10)}`}
              label="Export Timetable"
              title="Shaad-Mates Student Event Timetable"
              buttonClass="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-xs flex items-center transition-all shadow-md"
            />
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs flex items-center transition-all shadow-md"
              title="Print Timetable"
            >
              <Printer size={14} className="mr-1.5" /> Print Timetable
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="animate-spin mx-auto mb-4 text-slate-450" size={28} />
          Loading schedules...
        </div>
      ) : schedules.length === 0 ? (
        <div className="glass-card border rounded-3xl p-12 text-center text-slate-400 font-medium italic">
          No schedules drafted for your events yet. Keep an eye out for timetable updates!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedules.map((sch) => (
            <div key={sch._id} className="p-6 rounded-3xl glass-card border flex flex-col justify-between hover-scale glow-blue space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-royal bg-royal/10 px-2.5 py-0.5 rounded-full border border-royal/20">
                  {sch.programId?.title}
                </span>
                <h3 className="text-lg font-bold font-sans text-slate-800 dark:text-white mt-2">
                  Event Schedule
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {sch.description || 'No additional coordination notes provided.'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-slate-100 dark:border-slate-800/60 pt-4 text-xs">
                <div className="flex items-center text-slate-500 font-medium">
                  <Calendar size={14} className="mr-1.5 text-royal" />
                  <span>{new Date(sch.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-slate-500 font-medium">
                  <Clock size={14} className="mr-1.5 text-royal" />
                  <span>{sch.time}</span>
                </div>
                <div className="flex items-center text-slate-500 font-medium col-span-1 truncate" title={sch.venue}>
                  <MapPin size={14} className="mr-1.5 text-royal" />
                  <span className="truncate">{sch.venue}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default StudentSchedule;
