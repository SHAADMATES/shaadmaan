import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Calendar, Clock, MapPin, RefreshCw } from 'lucide-react';
import Toast from '../../components/Toast';

const ManagerSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await api.get('/chairman/schedules');
        setSchedules(res.data);
      } catch (err) {
        setToastType('error');
        setToastMessage('Failed to load wing schedules.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, []);

  return (
    <div className="p-6 space-y-6 animate-scale">
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="animate-spin mx-auto mb-4 text-slate-450" size={28} />
          Loading schedules...
        </div>
      ) : schedules.length === 0 ? (
        <div className="glass-card border rounded-3xl p-12 text-center text-slate-400 font-medium italic">
          No schedules drafted for your wing by the Admin yet.
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
                  Scheduled Timeline
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {sch.description || 'No additional instructions provided.'}
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

export default ManagerSchedule;
