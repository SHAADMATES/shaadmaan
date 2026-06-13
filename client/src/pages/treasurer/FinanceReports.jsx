import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../context/AuthContext';
import { FileSpreadsheet, Printer, Calendar, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, BarChart2 } from 'lucide-react';
import Toast from '../../components/Toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const FinanceReports = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const reportRef = useRef(null);
  
  // Date range filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const fetchLedger = async () => {
    try {
      const transRes = await api.get('/treasurer/transactions');
      setTransactions(transRes.data);
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

  // Filter transactions by date range
  const filteredTransactions = transactions.filter(t => {
    if (!t.date) return true;
    const tDate = new Date(t.date).getTime();
    const start = startDate ? new Date(startDate).getTime() : -Infinity;
    const end = endDate ? new Date(endDate).getTime() : Infinity;
    return tDate >= start && tDate <= end;
  });

  // Calculations
  let incomeTotal = 0;
  let expenseTotal = 0;
  
  filteredTransactions.forEach(t => {
    if (t.type === 'income') {
      incomeTotal += t.amount;
    } else {
      expenseTotal += t.amount;
    }
  });

  const netBalance = incomeTotal - expenseTotal;

  // Category breakdown
  const categoryBreakdown = {};
  filteredTransactions.forEach(t => {
    if (!categoryBreakdown[t.category]) {
      categoryBreakdown[t.category] = { income: 0, expense: 0 };
    }
    if (t.type === 'income') {
      categoryBreakdown[t.category].income += t.amount;
    } else {
      categoryBreakdown[t.category].expense += t.amount;
    }
  });

  // Export CSV function
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      setToastType('error');
      setToastMessage('No ledger records to export.');
      return;
    }

    const headers = ['Posting Date', 'Type', 'Category / Reference', 'Linked Program', 'Memo / Description', 'Amount ($)'];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.type.toUpperCase(),
      t.category,
      t.programId?.title || 'General Fund',
      t.description || '',
      t.amount
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ShaadMates_FinanceReport_${startDate || 'start'}_to_${endDate || 'end'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastType('success');
    setToastMessage('Ledger exported to CSV successfully!');
  };

  // Generate Beautiful PDF
  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setGeneratingPDF(true);
    setToastType('success');
    setToastMessage('Generating high-quality PDF report...');
    
    try {
      const element = reportRef.current;
      // Force element to be fully visible for canvas
      const originalStyle = element.style.cssText;
      element.style.padding = '40px';
      element.style.background = '#ffffff';
      element.style.color = '#000000';
      
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      element.style.cssText = originalStyle;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ShaadMates_FinanceReport_${new Date().toISOString().split('T')[0]}.pdf`);
      
      setToastMessage('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setToastType('error');
      setToastMessage('Failed to generate PDF.');
    } finally {
      setGeneratingPDF(false);
    }
  };

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
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-sans">
            Financial Statements & Audits
          </h2>
          <p className="text-sm text-slate-350 mt-2">
            Configure reporting intervals, evaluate budget category metrics, and export compiled balance sheets.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md"
          >
            <FileSpreadsheet size={16} />
            <span>Export CSV Sheet</span>
          </button>
          <button
            onClick={downloadPDF}
            disabled={generatingPDF}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl ${generatingPDF ? 'bg-royal/50 cursor-not-allowed' : 'bg-royal hover:bg-royal-dark'} text-white text-xs font-bold transition-all shadow-md`}
          >
            {generatingPDF ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Printer size={16} />
            )}
            <span>{generatingPDF ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* Date Interval filter */}
      <div className="p-6 rounded-3xl glass-card border shadow-lg space-y-4">
        <h3 className="text-sm font-bold font-sans flex items-center space-x-2 text-slate-800 dark:text-white">
          <Calendar size={16} className="text-royal" />
          <span>Select Statements Date Interval</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-450 uppercase">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-450 uppercase">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="w-full py-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-300 dark:hover:bg-slate-750 text-xs font-bold rounded-xl transition-all"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Branded Statement Sheet - Ref added for PDF generation */}
      <div 
        ref={reportRef} 
        className="p-8 rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 shadow-xl space-y-8 text-black dark:text-white"
      >
        
        {/* PDF Document Header */}
        <div className="flex justify-between items-center border-b pb-6 border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">🎓 Shaad-Mates Website ERP</h1>
            <p className="text-xs text-slate-500 mt-1">Official Financial Ledger Statement</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Generated: {new Date().toLocaleDateString()}</div>
            <div>Auditor Console: Treasurer Desk</div>
          </div>
        </div>

        {/* Statement Metadata */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-4 gap-2">
          <div>
            <h3 className="text-lg font-bold">Summary Account Balance</h3>
            <p className="text-xs text-slate-500 mt-1">
              Statement Period: {startDate ? new Date(startDate).toLocaleDateString() : 'Inception'} to {endDate ? new Date(endDate).toLocaleDateString() : 'Present'}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-100 text-blue-800 rounded border border-blue-200">
              Active ledger account
            </span>
          </div>
        </div>

        {/* Aggregate Totals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Gross Period Incomes</span>
            <div className="text-xl font-bold text-emerald-600 font-mono">
              +${incomeTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Gross Period Expenses</span>
            <div className="text-xl font-bold text-red-600 font-mono">
              -${expenseTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Net Balance</span>
            <div className={`text-xl font-bold font-mono ${netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {netBalance >= 0 ? '+' : '-'}${Math.abs(netBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold flex items-center space-x-2">
            <BarChart2 size={16} className="text-blue-600" />
            <span>Aggregate breakdown by Category</span>
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-600 font-bold bg-slate-100 dark:bg-slate-800">
                  <th className="p-3">Category Name</th>
                  <th className="p-3 text-right">Incomes Aggregate</th>
                  <th className="p-3 text-right">Expenses Aggregate</th>
                  <th className="p-3 text-right">Net Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {Object.keys(categoryBreakdown).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-slate-500 italic">No ledger activity in selected interval.</td>
                  </tr>
                ) : (
                  Object.entries(categoryBreakdown).map(([cat, val]) => (
                    <tr key={cat} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="p-3 font-semibold">{cat}</td>
                      <td className="p-3 text-right font-mono text-emerald-600">+${val.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="p-3 text-right font-mono text-red-600">-${val.expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className={`p-3 text-right font-mono font-bold ${(val.income - val.expense) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        ${(val.income - val.expense).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ledger logs breakdown */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-sm font-bold flex items-center space-x-2">
            <span>Detailed Ledger Postings</span>
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-600 font-bold bg-slate-100 dark:bg-slate-800">
                  <th className="p-3">Posting Reference</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Program</th>
                  <th className="p-3">Posting Date</th>
                  <th className="p-3 text-right">Ledger Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-slate-500 italic">No ledger activity in selected interval.</td>
                  </tr>
                ) : (
                  filteredTransactions.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="p-3">
                        <div className="font-semibold">{t.category}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-xs">{t.description || 'No memo text'}</div>
                      </td>
                      <td className="p-3 font-semibold uppercase font-mono text-[10px]">
                        {t.type}
                      </td>
                      <td className="p-3 text-slate-600">
                        {t.programId?.title || <span className="italic">General Fund</span>}
                      </td>
                      <td className="p-3 text-slate-500 font-mono">
                        {new Date(t.date).toLocaleDateString()}
                      </td>
                      <td className={`p-3 text-right font-mono font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

export default FinanceReports;
