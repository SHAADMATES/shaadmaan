import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { FolderKanban, CheckCircle2, Users, User, RefreshCw } from 'lucide-react';
import Toast from '../../components/Toast';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const fetchMyRegistrations = async () => {
      try {
        const res = await api.get('/student/registrations/my');
        setRegistrations(res.data);
      } catch (err) {
        setToastType('error');
        setToastMessage('Failed to load registrations.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyRegistrations();
  }, []);

  return (
    <div className="p-6 space-y-6 animate-scale">
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="animate-spin mx-auto mb-4 text-slate-450" size={28} />
          Loading registrations...
        </div>
      ) : registrations.length === 0 ? (
        <div className="glass-card border rounded-3xl p-12 text-center text-slate-400 font-medium italic">
          You haven't signed up for any events yet. Check out "Available Programs" to register.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.map((reg) => (
            <div key={reg._id} className="p-6 rounded-3xl glass-card border flex flex-col justify-between hover-scale glow-blue space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-royal bg-royal/10 px-2.5 py-0.5 rounded-full border border-royal/20">
                    {reg.programId?.wing}
                  </span>
                  <span className="text-xs text-slate-400">
                    Registered: {new Date(reg.registrationDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-bold font-sans text-slate-800 dark:text-white pt-1">
                  {reg.programId?.title}
                </h3>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {reg.programId?.description}
                </p>
              </div>

              {/* Roster detail */}
              <div className="border-t border-slate-100 dark:border-slate-850 pt-4 text-xs">
                {reg.type === 'group' && reg.groupId ? (
                  <div className="space-y-2">
                    <div className="font-bold text-royal dark:text-cyan flex items-center space-x-1.5">
                      <Users size={14} />
                      <span>Team: {reg.groupId.name}</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-500/5 p-3 rounded-xl">
                      <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Leader: {reg.groupId.leaderId?.name || 'You'}
                      </p>
                      <p>
                        Members:{' '}
                        {reg.groupId.members?.map(m => m.name).join(', ')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center text-slate-500 space-x-1.5 bg-slate-500/5 p-3 rounded-xl font-medium">
                    <User size={14} className="text-royal" />
                    <span>Individual registration</span>
                  </div>
                )}
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

export default MyRegistrations;
