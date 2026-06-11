import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Landmark, PlusCircle, Trash2, ArrowUpRight, ArrowDownRight, Search, Filter, Calendar, DollarSign } from 'lucide-react';
import Toast from '../../components/Toast';

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

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const fetchLedger = async () => {
    try {
      const transRes = await api.get('/treasurer/transactions');
      setTransactions(transRes.data);

      const progRes = await api.get('/treasurer/programs');
      setPrograms(progRes.data);
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this transaction record?')) return;

    try {
      await api.delete(`/treasurer/transactions/${id}`);
      setToastType('success');
      setToastMessage('Ledger record has been deleted.');
      fetchLedger();
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to delete transaction.');
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

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
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl">
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-sans">
          Transactions Ledger
        </h2>
        <p className="text-sm text-slate-350 mt-2">
          Post program expenses, donations, or sponsorships, and view the entire system ledger table.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Add Transaction Form */}
        <div className="lg:col-span-4 p-6 rounded-3xl glass-card border shadow-lg space-y-6 h-fit">
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
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-250'
                }`}
              >
                INCOME
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  formData.type === 'expense'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-250'
                }`}
              >
                EXPENSE
              </button>
            </div>

            {/* Category selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Category / Reference</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                placeholder="e.g. Program Sponsorship, Refreshments"
                className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 text-xs focus:outline-none focus:ring-2 focus:ring-royal"
              />
            </div>

            {/* Amount & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-450 uppercase tracking-wider">Amount ($)</label>
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
                  <option key={p._id} value={p._id}>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/40 pb-4">
            <h3 className="text-lg font-bold font-sans flex items-center space-x-2">
              <Landmark size={20} className="text-cyan" />
              <span>General Ledger Logs</span>
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
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto pr-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold bg-slate-500/5">
                  <th className="p-3">Posting Reference</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Linked Event</th>
                  <th className="p-3"><span className="flex items-center"><Calendar size={13} className="mr-1" /> Posting Date</span></th>
                  <th className="p-3 text-right">Ledger Impact</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-6 text-center text-slate-450 italic">
                      No ledger postings found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-500/5 transition-colors">
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
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(t._id)}
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

export default Transactions;
