import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, RefreshCw, Landmark, Activity } from 'lucide-react';
import Toast from '../../components/Toast';

const TreasurerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const fetchFinanceData = async () => {
    try {
      const statsRes = await api.get('/treasurer/stats');
      setStats(statsRes.data);

      const transRes = await api.get('/treasurer/transactions');
      setTransactions(transRes.data.slice(0, 5)); // recent 5
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to load financial dashboards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-32 rounded-3xl animate-shimmer"></div>
          ))}
        </div>
        <div className="h-96 rounded-3xl animate-shimmer"></div>
      </div>
    );
  }

  const cards = [
    {
      title: 'Current Ledger Balance',
      value: stats?.balance || 0,
      icon: DollarSign,
      color: (stats?.balance || 0) >= 0 ? 'text-emerald-500' : 'text-rose-500',
      gradient: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20'
    },
    {
      title: 'Gross System Incomes',
      value: stats?.totalIncome || 0,
      icon: TrendingUp,
      color: 'text-royal',
      gradient: 'from-royal/10 to-indigo-500/10 border-royal/20'
    },
    {
      title: 'Gross Expenditures',
      value: stats?.totalExpense || 0,
      icon: TrendingDown,
      color: 'text-rose-500',
      gradient: 'from-rose-500/10 to-red-500/10 border-rose-500/20'
    }
  ];

  return (
    <div className="p-6 space-y-8 animate-scale">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-sans">
            Treasurer Desk Dashboard
          </h2>
          <p className="text-sm text-slate-350 mt-2">
            Monitor organizational finances, audit expenditures, record event costs, and balance budgets.
          </p>
        </div>
        <button
          onClick={fetchFinanceData}
          className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center shrink-0"
          title="Refresh Dashboard"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className={`p-6 rounded-3xl glass-card border flex items-center justify-between hover-scale glow-blue`}>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">{c.title}</span>
                <p className="text-3xl font-extrabold tracking-tight font-sans text-slate-800 dark:text-white">
                  ${c.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${c.gradient} ${c.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Transactions list & quick insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent postings */}
        <div className="lg:col-span-8 glass-card border rounded-3xl p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/40 pb-4">
            <h3 className="text-lg font-bold font-sans flex items-center space-x-2">
              <Landmark size={20} className="text-royal" />
              <span>Recent Postings Ledger</span>
            </h3>
            <a href="/treasurer/transactions" className="text-xs font-semibold text-royal hover:underline">
              View Complete Ledger →
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold bg-slate-500/5">
                  <th className="p-3">Posting Reference</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Linked Program</th>
                  <th className="p-3">Posting Date</th>
                  <th className="p-3 text-right">Ledger Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-6 text-center text-slate-400 italic">No ledger postings created.</td>
                  </tr>
                ) : (
                  transactions.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 dark:text-white">{t.category}</div>
                        <div className="text-[10px] text-slate-450 truncate max-w-xs">{t.description || 'No memo text'}</div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          t.type === 'income' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {t.type === 'income' ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />}
                          {t.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">
                        {t.programId?.title || <span className="text-slate-400 italic">General Fund</span>}
                      </td>
                      <td className="p-3 text-slate-400">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className={`p-3 text-right font-bold font-mono text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Policy Widget */}
        <div className="lg:col-span-4 glass-card border rounded-3xl p-6 shadow-lg space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-sans flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800/40 pb-4">
              <Activity size={20} className="text-cyan" />
              <span>Budget Controls</span>
            </h3>
            
            <div className="space-y-3 text-xs leading-relaxed text-slate-550 dark:text-slate-400">
              <div className="p-4 rounded-2xl bg-cyan/5 border border-cyan/10">
                <span className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Dual-Sign-Off Audit</span>
                All program allocations proposed by Wing Chairmen must be registered under events program expenses.
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <span className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Fiscal Responsibility</span>
                Maintain a minimal reserve threshold. Alert the Super Admin if operations balance drops below $1,000.
              </div>
            </div>
          </div>

          <a
            href="/treasurer/transactions"
            className="w-full text-center bg-royal hover:bg-royal-dark text-white py-3 rounded-2xl font-bold text-xs shadow hover:shadow-lg transition-all"
          >
            Post Transaction Ledger
          </a>
        </div>
      </div>

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

export default TreasurerDashboard;
