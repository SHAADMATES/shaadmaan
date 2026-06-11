import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Search, RefreshCw, Users, User } from 'lucide-react';
import Toast from '../../components/Toast';

const RegisteredStudents = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/chairman/registrations');
      setRegistrations(res.data);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to fetch registrations.');
    } finally {
      setLoading(false);
    }
  };

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const filtered = registrations.filter(reg => {
    const query = searchQuery.toLowerCase();
    const matchesProgram = reg.programId?.title.toLowerCase().includes(query);
    const matchesStudent = reg.studentId?.name.toLowerCase().includes(query) || 
                           reg.studentId?.studentId.toLowerCase().includes(query);
    const matchesGroup = reg.groupId?.name.toLowerCase().includes(query);

    return matchesProgram || matchesStudent || matchesGroup;
  });

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Search Bar */}
      <div className="bg-white/50 dark:bg-slate-900/30 p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/50">
        <div className="relative max-w-md">
          <Search className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none mt-2.5" size={16} />
          <input
            type="text"
            placeholder="Search by program, student name or team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl text-sm w-full focus:outline-none"
          />
        </div>
      </div>

      {/* Main Table List */}
      <div className="glass-card border rounded-3xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="animate-spin mx-auto mb-4 text-slate-450" size={28} />
            Loading registered students...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-500/5 text-slate-400 font-semibold">
                  <th className="p-4">Program Title</th>
                  <th className="p-4">Registration Type</th>
                  <th className="p-4">Applicant (Leader)</th>
                  <th className="p-4">Team / Members</th>
                  <th className="p-4">Date Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-400 font-medium">
                      No registrations found matching search parameters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((reg) => (
                    <tr key={reg._id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-100">
                        {reg.programId?.title}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          reg.type === 'single'
                            ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/20'
                            : 'bg-indigo-50 text-indigo-600 border border-indigo-200 dark:bg-indigo-950/20'
                        }`}>
                          {reg.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-700 dark:text-slate-200">{reg.studentId?.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{reg.studentId?.studentId}</div>
                      </td>
                      <td className="p-4">
                        {reg.type === 'group' && reg.groupId ? (
                          <div className="space-y-1">
                            <div className="font-bold text-xs text-royal dark:text-cyan flex items-center">
                              <Users size={12} className="mr-1" /> {reg.groupId.name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              Members:{' '}
                              {reg.groupId.members?.map(m => m.name).join(', ')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic flex items-center">
                            <User size={12} className="mr-1" /> Individual entry
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-550">
                        {new Date(reg.registrationDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
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

export default RegisteredStudents;
