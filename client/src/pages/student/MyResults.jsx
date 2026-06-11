import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Trophy, Award, Printer, RefreshCw } from 'lucide-react';
import Toast from '../../components/Toast';

const MyResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const fetchMyResults = async () => {
      try {
        const res = await api.get('/student/results/my');
        setResults(res.data);
      } catch (err) {
        setToastType('error');
        setToastMessage('Failed to load results scorecard.');
      } finally {
        setLoading(false);
      }
    };
    fetchMyResults();
  }, []);

  const totalPoints = results.reduce((acc, curr) => acc + (curr.points || 0), 0);
  const firstPositions = results.filter(r => r.position === '1st').length;

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 animate-scale printable-section">
      {/* Overview Cards */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-gradient-to-tr from-amber-500/10 to-gold/15 border border-gold/20 flex items-center justify-between shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Points</span>
            <p className="text-3xl font-extrabold text-gold-dark">{totalPoints} Points</p>
          </div>
          <div className="p-4 rounded-2xl bg-gold/10 text-gold-dark">
            <Award size={24} />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-gradient-to-tr from-royal/10 to-cyan/15 border border-royal/20 flex items-center justify-between shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">First Places</span>
            <p className="text-3xl font-extrabold text-royal">{firstPositions} Wins</p>
          </div>
          <div className="p-4 rounded-2xl bg-royal/10 text-royal">
            <Trophy size={24} />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white/50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between shadow">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Export Results</span>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Download Transcript</p>
          </div>
          <button
            onClick={handlePrintReport}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center shadow transition-all"
          >
            <Printer size={14} className="mr-1.5" /> Print Report
          </button>
        </div>
      </div>

      {/* Main Scorecard Sheet */}
      <div className="glass-card border rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        {/* Printable Header */}
        <div className="text-center border-b pb-6 border-slate-100 dark:border-slate-850">
          <h2 className="text-xl font-extrabold font-sans">Shaad-Mates Student Performance Card</h2>
          <p className="text-xs font-semibold uppercase tracking-wider text-royal mt-1">Official Student Transcript</p>
          <p className="text-[10px] text-slate-400 mt-1">Date Printed: {new Date().toLocaleDateString()}</p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw className="animate-spin mx-auto mb-4 text-slate-455" size={28} />
            Compiling grades...
          </div>
        ) : results.length === 0 ? (
          <div className="py-12 text-center text-slate-400 italic">
            No score standings published for your registrations yet.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-350 dark:border-slate-800 text-slate-500 font-bold">
                    <th className="py-3">Program Title</th>
                    <th className="py-3">Event Type</th>
                    <th className="py-3">Standing Position</th>
                    <th className="py-3 text-center">Marks</th>
                    <th className="py-3 text-center">Grade</th>
                    <th className="py-3 text-center">Points Earned</th>
                    <th className="py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {results.map((res) => (
                    <tr key={res._id} className="hover:bg-slate-500/5">
                      <td className="py-4 font-semibold text-slate-850 dark:text-slate-200">{res.program?.title}</td>
                      <td className="py-4 uppercase">{res.type}</td>
                      <td className="py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg font-bold border ${
                          res.position === '1st'
                            ? 'bg-amber-100/60 border-amber-300 text-amber-700'
                            : res.position === '2nd'
                            ? 'bg-slate-200 border-slate-300 text-slate-700'
                            : 'bg-orange-100/50 border-orange-200 text-orange-700'
                        }`}>
                          {res.position}
                        </span>
                      </td>
                      <td className="py-4 text-center font-semibold">{res.marks}/100</td>
                      <td className="py-4 text-center font-bold text-royal dark:text-cyan">{res.grade}</td>
                      <td className="py-4 text-center font-bold text-emerald text-sm">+{res.points}</td>
                      <td className="py-4 text-slate-500 dark:text-slate-400 italic">"{res.remarks || 'Keep it up!'}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Footer */}
            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="text-right space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cumulative Score</span>
                <p className="text-2xl font-black text-emerald">{totalPoints} Points</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          header, sidebar, aside {
            display: none !important;
          }
          .printable-section {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #ddd !important;
            padding: 8px !important;
          }
        }
      `}} />

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

export default MyResults;
