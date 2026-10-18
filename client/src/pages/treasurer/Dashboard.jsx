import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Landmark, 
  Activity,
  PlusCircle,
  FileSpreadsheet,
  PieChart as PieIcon,
  ShieldCheck,
  Calendar,
  X,
  CheckCircle2
} from 'lucide-react';
import Toast from '../../components/Toast';
import UniversalExport from '../../components/UniversalExport';

const TreasurerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick transaction modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().substring(0, 10),
    programId: '',
  });
  const [posting, setPosting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const fetchFinanceData = async () => {
    try {
      const [statsRes, transRes, progRes] = await Promise.all([
        api.get('/treasurer/stats'),
        api.get('/treasurer/transactions'),
        api.get('/treasurer/programs').catch(() => ({ data: [] }))
      ]);
      setStats(statsRes.data || { balance: 0, totalIncome: 0, totalExpense: 0 });
      setTransactions(transRes.data || []);
      setPrograms(progRes.data || []);
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

  const handleQuickSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.amount) {
      setToastType('error');
      setToastMessage('Please enter both Category and Amount.');
      return;
    }

    setPosting(true);
    try {
      await api.post('/treasurer/transactions', {
        ...formData,
        amount: parseFloat(formData.amount),
        programId: formData.programId || null
      });
      setToastType('success');
      setToastMessage('Transaction posted to financial ledger!');
      setIsModalOpen(false);
      setFormData({
        type: 'income',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().substring(0, 10),
        programId: '',
      });
      fetchFinanceData();
    } catch (err) {
      setToastType('error');
      setToastMessage(err.response?.data?.message || 'Failed to post transaction.');
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-36 rounded-3xl animate-shimmer"></div>
          ))}
        </div>
        <div className="h-96 rounded-3xl animate-shimmer"></div>
      </div>
    );
  }

  const balance = stats?.balance || 0;
  const income = stats?.totalIncome || 0;
  const expense = stats?.totalExpense || 0;
  const utilization = income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : 0;

  const cards = [
    {
      title: 'Current Net Balance',
      value: balance,
      subtitle: balance >= 0 ? 'Surplus Reserve Available' : 'Deficit Alert',
      icon: DollarSign,
      color: balance >= 0 ? 'text-emerald-500' : 'text-rose-500',
      gradient: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20'
    },
    {
      title: 'Cumulative Inflow (Income)',
      value: income,
      subtitle: 'Grants, donations & dues',
      icon: TrendingUp,
      color: 'text-royal',
      gradient: 'from-royal/10 to-indigo-500/10 border-royal/20'
    },
    {
      title: 'Cumulative Outflow (Expenses)',
      value: expense,
      subtitle: `${utilization}% of total revenues`,
      icon: TrendingDown,
      color: 'text-rose-500',
      gradient: 'from-rose-500/10 to-red-500/10 border-rose-500/20'
    }
  ];

  const exportData = transactions.slice(0, 50).map(t => ({
    Date: new Date(t.date).toLocaleDateString(),
    Type: t.type.toUpperCase(),
    Category: t.category,
    Program: t.programId?.title || 'General Fund',
    Amount: `$${t.amount.toFixed(2)}`,
    Description: t.description || 'N/A'
  }));

  const exportHeaders = [
    { key: 'Date', label: 'Date' },
    { key: 'Type', label: 'Type' },
    { key: 'Category', label: 'Category' },
    { key: 'Program', label: 'Linked Program' },
    { key: 'Amount', label: 'Amount ($)' },
    { key: 'Description', label: 'Memo / Description' }
  ];

  return (
    <div className="p-6 space-y-8 animate-scale">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}

      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy to-slate-800 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Audit & Treasury Desk
            </span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-sans">
            Fiscal Operations Hub
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl font-light">
            Real-time accounting, program grant disbursements, budget audits, and automated financial ledgers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2 shrink-0"
          >
            <PlusCircle size={16} /> Post Transaction
          </button>

          <button
            onClick={fetchFinanceData}
            className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all border border-white/10 flex items-center justify-center shrink-0"
            title="Refresh Ledger"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="p-6 rounded-3xl glass-card border flex items-center justify-between hover-scale shadow-sm">
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">{c.title}</span>
                <p className="text-3xl font-extrabold tracking-tight font-sans text-slate-900 dark:text-white">
                  ${c.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{c.subtitle}</p>
              </div>
              <div className={`p-4 rounded-2xl bg-gradient-to-br ${c.gradient} ${c.color} shadow-inner`}>
                <Icon size={26} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Budget Utilization Progress Bar */}
      <div className="glass-card p-6 rounded-3xl border shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-2">
            <Activity size={16} className="text-royal" />
            Budget Utilization & Expense Ratio
          </span>
          <span className={`${utilization > 85 ? 'text-rose-500 font-extrabold' : 'text-emerald-500'}`}>
            {utilization}% Utilized ({balance >= 0 ? `$${balance.toFixed(2)} Surplus` : `-$${Math.abs(balance).toFixed(2)} Deficit`})
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-700 rounded-full ${
              utilization > 85 
                ? 'bg-rose-500' 
                : utilization > 60 
                ? 'bg-amber-500' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, utilization))}%` }}
          ></div>
        </div>
      </div>

      {/* Grid: Transactions list & quick insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Postings Table */}
        <div className="lg:col-span-8 glass-card border rounded-3xl p-6 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 gap-3">
            <h3 className="text-lg font-bold font-sans flex items-center space-x-2">
              <Landmark size={20} className="text-royal" />
              <span>Recent Ledger Postings</span>
            </h3>
            
            <div className="flex items-center gap-3">
              <UniversalExport
                data={exportData}
                filename="ShaadMates_Recent_Ledger"
                headers={exportHeaders}
                label="Export Ledger"
                title="Recent Financial Postings"
              />
              <Link 
                to="/treasurer/transactions" 
                className="text-xs font-bold text-royal dark:text-cyan hover:underline"
              >
                View Complete Ledger →
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold bg-slate-500/5">
                  <th className="p-3">Posting Reference</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Linked Program</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-right">Ledger Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400 italic">No ledger postings created yet.</td>
                  </tr>
                ) : (
                  transactions.slice(0, 8).map((t) => (
                    <tr key={t._id || t.id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-white">{t.category}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{t.description || 'General allocation'}</div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          t.type === 'income' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                            : 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
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
                        {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions & Audit Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card border rounded-3xl p-6 shadow-lg space-y-4">
            <h3 className="text-base font-bold font-sans flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800/40 pb-3">
              <ShieldCheck size={18} className="text-cyan" />
              <span>Treasury Standards</span>
            </h3>
            
            <div className="space-y-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              <div className="p-3.5 rounded-2xl bg-cyan/5 border border-cyan/15">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Grant Verification</span>
                All wing event grants must specify the targeted program and expected participant headcounts.
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/15">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Reserve Baseline</span>
                Always retain a reserve fund of at least $1,500 for emergency inter-campus logistics.
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/treasurer/transactions"
                className="w-full text-center bg-royal hover:bg-royal-dark text-white py-3 rounded-2xl font-bold text-xs shadow hover:shadow-lg transition-all"
              >
                Open Full Transactions Ledger
              </Link>
              <Link
                to="/treasurer/reports"
                className="w-full text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-2xl font-bold text-xs transition-all"
              >
                Generate Audit Statements
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Transaction Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle size={18} className="text-emerald-500" /> Post Ledger Entry
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleQuickSubmit} className="space-y-4 text-xs">
              {/* Type Switch */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    formData.type === 'income' 
                      ? 'bg-emerald-500 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  + Income / Grant
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`py-2 rounded-xl font-bold transition-all ${
                    formData.type === 'expense' 
                      ? 'bg-rose-500 text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  - Expense / Payout
                </button>
              </div>

              <div>
                <label className="form-label">Category / Purpose *</label>
                <input
                  type="text"
                  placeholder="e.g. Trophy Purchases, Hall Booking, Sponsorship"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="form-input font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Linked Program (Optional)</label>
                <select
                  value={formData.programId}
                  onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                  className="form-input"
                >
                  <option value="">-- General Fund (Unlinked) --</option>
                  {programs.map(p => (
                    <option key={p._id || p.id} value={p._id || p.id}>{p.title} ({p.wing})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Memo / Description</label>
                <textarea
                  rows={2}
                  placeholder="Additional receipt details or notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md flex items-center gap-1.5"
                >
                  {posting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle2 size={14} /> Post to Ledger
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreasurerDashboard;
