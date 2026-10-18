import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { 
  Landmark, 
  PlusCircle, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign,
  Printer,
  FileSpreadsheet,
  AlertCircle,
  X,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import Toast from '../../components/Toast';
import UniversalExport from '../../components/UniversalExport';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [formData, setFormData] = useState({
    type: 'income',
    category: '',
    amount: '',
    description: '',
    date: new Date().toISOString().substring(0, 10),
    programId: '',
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Deletion modal state (replaces window.confirm)
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const fetchLedger = async () => {
    try {
      const [transRes, progRes] = await Promise.all([
        api.get('/treasurer/transactions'),
        api.get('/treasurer/programs').catch(() => ({ data: [] }))
      ]);
      setTransactions(transRes.data || []);
      setPrograms(progRes.data || []);
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to load ledger records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.amount) {
      setToastType('error');
      setToastMessage('Please fill in Category and Amount.');
      return;
    }

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        programId: formData.programId || null
      };
      await api.post('/treasurer/transactions', payload);
      setToastType('success');
      setToastMessage('Transaction posted to ledger successfully!');
      setFormData({
        type: 'income',
        category: '',
        amount: '',
        description: '',
        date: new Date().toISOString().substring(0, 10),
        programId: '',
      });
      fetchLedger();
    } catch (err) {
      setToastType('error');
      setToastMessage(err.response?.data?.message || 'Failed to post transaction.');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/treasurer/transactions/${deleteId}`);
      setToastType('success');
      setToastMessage('Ledger record has been revoked.');
      setDeleteId(null);
      fetchLedger();
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to delete transaction.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.programId?.title && t.programId.title.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalFilteredIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalFilteredExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netFiltered = totalFilteredIncome - totalFilteredExpense;

  const exportData = filteredTransactions.map((t, idx) => ({
    No: idx + 1,
    Date: new Date(t.date).toLocaleDateString(),
    Type: t.type.toUpperCase(),
    Category: t.category,
    Program: t.programId?.title || 'General Fund',
    Amount: `$${t.amount.toFixed(2)}`,
    Description: t.description || 'N/A'
  }));

  const exportHeaders = [
    { key: 'No', label: '#' },
    { key: 'Date', label: 'Posting Date' },
    { key: 'Type', label: 'Type' },
    { key: 'Category', label: 'Category / Purpose' },
    { key: 'Program', label: 'Linked Program' },
    { key: 'Amount', label: 'Amount ($)' },
    { key: 'Description', label: 'Memo / Description' }
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-40 rounded-3xl animate-shimmer"></div>
        <div className="h-96 rounded-3xl animate-shimmer"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-scale">
      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}

      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              General Ledger
            </span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-sans">
            Transactions & Cashflow Records
          </h2>
          <p className="text-sm text-slate-350 mt-1 max-w-2xl font-light">
            Post program expenses, donations, or sponsorships, and view the entire system ledger table.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <UniversalExport
            data={exportData}
            filename="ShaadMates_General_Ledger"
            headers={exportHeaders}
            label="Export Ledger"
            title="Shaad-Mates Official General Ledger"
          />
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs flex items-center transition-all border border-white/15"
          >
            <Printer size={14} className="mr-1.5" /> Print Ledger
          </button>
        </div>
      </div>

      {/* Filtered Financial Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl glass-card border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Filtered Inflow</span>
            <p className="text-xl font-black text-emerald-500 font-mono">+${totalFilteredIncome.toFixed(2)}</p>
          </div>
          <ArrowUpRight size={24} className="text-emerald-500 bg-emerald-500/10 p-1 rounded-xl" />
        </div>
        <div className="p-4 rounded-2xl glass-card border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Filtered Outflow</span>
            <p className="text-xl font-black text-rose-500 font-mono">-${totalFilteredExpense.toFixed(2)}</p>
          </div>
          <ArrowDownRight size={24} className="text-rose-500 bg-rose-500/10 p-1 rounded-xl" />
        </div>
        <div className="p-4 rounded-2xl glass-card border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Filtered Net Balance</span>
            <p className={`text-xl font-black font-mono ${netFiltered >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {netFiltered >= 0 ? '+' : '-'}${Math.abs(netFiltered).toFixed(2)}
            </p>
          </div>
          <DollarSign size={24} className="text-royal bg-royal/10 p-1 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Add Transaction Form */}
        <div className="lg:col-span-4 p-6 rounded-3xl glass-card border shadow-lg space-y-6 h-fit print:hidden">
          <h3 className="text-lg font-bold font-sans flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800/40 pb-4">
            <PlusCircle size={20} className="text-royal" />
            <span>Post Transaction</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900/60">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  formData.type === 'income'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                + Income / Grant
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  formData.type === 'expense'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                - Expense / Payout
              </button>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Category / Purpose *</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                placeholder="e.g. Trophy Purchases, Hall Booking, Sponsorship"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:ring-2 focus:ring-royal"
              />
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Amount ($) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:ring-2 focus:ring-royal font-mono font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Posting Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:ring-2 focus:ring-royal"
                />
              </div>
            </div>

            {/* Linked program */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Linked Program (Optional)</label>
              <select
                name="programId"
                value={formData.programId}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:ring-2 focus:ring-royal"
              >
                <option value="">General Fund (Not Linked)</option>
                {programs.map(p => (
                  <option key={p._id || p.id} value={p._id || p.id}>
                    {p.title} ({p.wing})
                  </option>
                ))}
              </select>
            </div>

            {/* Memo */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Memo / Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Memo details..."
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:ring-2 focus:ring-royal"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-royal hover:bg-royal-dark text-white py-3 rounded-2xl font-bold text-sm shadow hover:shadow-lg transition-all"
            >
              Post to Ledger
            </button>
          </form>
        </div>

        {/* Right Column - Table ledger */}
        <div className="lg:col-span-8 p-6 rounded-3xl glass-card border shadow-lg space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/40 pb-4 print:hidden">
            <h3 className="text-lg font-bold font-sans flex items-center space-x-2">
              <Landmark size={20} className="text-cyan" />
              <span>General Ledger Logs ({filteredTransactions.length})</span>
            </h3>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search ledger..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 w-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[11px] focus:outline-none"
                />
                <Search size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[11px] focus:outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="income">Income Only</option>
                <option value="expense">Expense Only</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[550px] overflow-y-auto pr-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold bg-slate-500/5">
                  <th className="p-3">Posting Reference</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Linked Event</th>
                  <th className="p-3"><span className="flex items-center"><Calendar size={13} className="mr-1" /> Posting Date</span></th>
                  <th className="p-3 text-right">Ledger Impact</th>
                  <th className="p-3 text-center print:hidden">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-450 italic">
                      No ledger postings match your filter.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t._id || t.id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-slate-850 dark:text-white">{t.category}</div>
                        <div className="text-[10px] text-slate-450 truncate max-w-[150px]">{t.description || 'No memo text'}</div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          t.type === 'income'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-rose-50 text-rose-600 border-rose-100'
                        }`}>
                          {t.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 truncate max-w-[120px]">
                        {t.programId?.title || <span className="text-slate-400 italic">General Fund</span>}
                      </td>
                      <td className="p-3 text-slate-400 font-mono">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className={`p-3 text-right font-bold font-mono text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center print:hidden">
                        <button
                          onClick={() => setDeleteId(t._id || t.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                          title="Revoke Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal (In-App instead of window.confirm) */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-sm w-full rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Revoke Ledger Posting?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This transaction entry will be permanently removed from the ledger and recalculate balances.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md flex items-center justify-center"
              >
                {deleting ? 'Revoking...' : 'Yes, Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
