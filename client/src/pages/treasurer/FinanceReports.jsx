import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../context/AuthContext';
import { FileSpreadsheet, Printer, Calendar, DollarSign, ArrowUpRight, ArrowDownRight, RefreshCw, BarChart2 } from 'lucide-react';
import Toast from '../../components/Toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import UniversalExport from '../../components/UniversalExport';

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

  // Export CSV function with UTF-8 BOM and metadata header
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      setToastType('error');
      setToastMessage('No ledger records to export.');
      return;
    }

    let csvContent = `"SHAAD-MATES PROGRAM MANAGEMENT SYSTEM - TREASURER FINANCIAL STATEMENT"\r\n`;
    csvContent += `"Statement Period:","${startDate ? new Date(startDate).toLocaleDateString() : 'Inception'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}"\r\n`;
    csvContent += `"Gross Income:","$${incomeTotal.toFixed(2)}"\r\n`;
    csvContent += `"Gross Expense:","$${expenseTotal.toFixed(2)}"\r\n`;
    csvContent += `"Net Position:","${netBalance >= 0 ? '+' : '-'}$${Math.abs(netBalance).toFixed(2)}"\r\n`;
    csvContent += `"Generated At:","${new Date().toLocaleString()}"\r\n`;
    csvContent += `"Cloud Database:","Supabase PostgreSQL Cluster"\r\n\r\n`;

    const headers = ['Posting Date', 'Type', 'Category / Reference', 'Linked Program', 'Memo / Description', 'Amount ($)'];
    csvContent += headers.map(h => `"${h}"`).join(',') + '\r\n';

    filteredTransactions.forEach(t => {
      const row = [
        new Date(t.date).toLocaleDateString(),
        t.type.toUpperCase(),
        t.category,
        t.programId?.title || 'General Fund',
        t.description || '',
        `${t.type === 'income' ? '+' : '-'}${Number(t.amount).toFixed(2)}`
      ];
      csvContent += row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',') + '\r\n';
    });

    csvContent += `\r\n"--- END OF OFFICIAL FINANCIAL LEDGER (AUDITED) ---"\r\n`;

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ShaadMates_FinanceReport_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastType('success');
    setToastMessage('Ledger exported to CSV successfully!');
  };

  // Generate Executive-Grade PDF
  const downloadPDF = () => {
    setGeneratingPDF(true);
    setToastType('info');
    setToastMessage('Generating audited financial PDF statement...');

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Top Navy Header Bar
      doc.setFillColor(15, 23, 42); // Navy Slate-900
      doc.rect(0, 0, pageWidth, 75, 'F');

      // Cyan Accent Stripe
      doc.setFillColor(6, 182, 212); // Cyan-500
      doc.rect(0, 75, pageWidth, 4, 'F');

      // Gold Accent Ribbon
      doc.setFillColor(245, 158, 11);
      doc.rect(pageWidth - 80, 0, 80, 8, 'F');

      // Header Typography
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('SHAAD-MATES PROGRAM MANAGEMENT SYSTEM', 40, 32);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(203, 213, 225);
      doc.text('TREASURER EXECUTIVE FINANCIAL STATEMENT & AUDIT LEDGER', 40, 48);

      doc.setFontSize(8.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${new Date().toLocaleString()}  |  Database: Supabase PostgreSQL  |  Ref: FIN-${Date.now().toString(36).toUpperCase()}`, 40, 63);

      // Summary Account Balance Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(40, 95, pageWidth - 80, 65, 6, 6, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('ACCOUNT BALANCE SUMMARY', 52, 112);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Period: ${startDate ? new Date(startDate).toLocaleDateString() : 'Inception'} to ${endDate ? new Date(endDate).toLocaleDateString() : 'Present'}`, 52, 126);

      // Financial Stat Numbers
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(16, 185, 129); // Green
      doc.text(`Income: +$${incomeTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 52, 146);

      doc.setTextColor(239, 68, 68); // Red
      doc.text(`Expense: -$${expenseTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 220, 146);

      if (netBalance >= 0) {
        doc.setTextColor(16, 185, 129);
        doc.text(`Net Balance: +$${Math.abs(netBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 380, 146);
      } else {
        doc.setTextColor(239, 68, 68);
        doc.text(`Net Balance: -$${Math.abs(netBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 380, 146);
      }

      // Safe AutoTable helper
      const runTable = (options) => {
        if (typeof doc.autoTable === 'function') {
          doc.autoTable(options);
        } else {
          autoTable(doc, options);
        }
      };

      // Category Breakdown Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('Aggregate Breakdown by Category', 40, 180);

      const categoryRows = Object.entries(categoryBreakdown).map(([cat, val]) => [
        cat,
        `+$${val.income.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        `-$${val.expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        `${val.income - val.expense >= 0 ? '+' : '-'}$${Math.abs(val.income - val.expense).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      ]);

      let finalY = 190;

      if (categoryRows.length > 0) {
        runTable({
          startY: finalY,
          head: [['Category Name', 'Incomes Aggregate', 'Expenses Aggregate', 'Net Impact']],
          body: categoryRows,
          theme: 'striped',
          styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 3.5 },
          headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
          margin: { left: 40, right: 40 },
          didParseCell: function(data) {
            if (data.section === 'body' && data.column.index === 3) {
              const valStr = data.cell.raw;
              if (valStr.startsWith('+')) {
                data.cell.styles.textColor = [16, 185, 129];
                data.cell.styles.fontStyle = 'bold';
              } else if (valStr.startsWith('-')) {
                data.cell.styles.textColor = [239, 68, 68];
                data.cell.styles.fontStyle = 'bold';
              }
            }
          }
        });
        finalY = doc.lastAutoTable.finalY + 25;
      } else {
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text('No ledger activity in selected interval.', 40, finalY + 12);
        finalY += 30;
      }

      // Detailed Ledger Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 41, 59);
      doc.text('Detailed Ledger Transactions', 40, finalY);

      const ledgerRows = filteredTransactions.map(t => [
        t.category,
        t.type.toUpperCase(),
        t.programId?.title || 'General Fund',
        new Date(t.date).toLocaleDateString(),
        `${t.type === 'income' ? '+' : '-'}$${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
      ]);

      if (ledgerRows.length > 0) {
        runTable({
          startY: finalY + 10,
          head: [['Reference / Category', 'Type', 'Linked Event / Fund', 'Posting Date', 'Ledger Amount']],
          body: ledgerRows,
          theme: 'grid',
          styles: { font: 'helvetica', fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
          margin: { left: 40, right: 40, bottom: 40 },
          didParseCell: function(data) {
            if (data.section === 'body' && data.column.index === 4) {
              const valStr = data.cell.raw;
              if (valStr.startsWith('+')) {
                data.cell.styles.textColor = [16, 185, 129];
                data.cell.styles.fontStyle = 'bold';
              } else if (valStr.startsWith('-')) {
                data.cell.styles.textColor = [239, 68, 68];
                data.cell.styles.fontStyle = 'bold';
              }
            }
          },
          didDrawPage: (data) => {
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text(
              `Page ${data.pageNumber} of ${pageCount}  •  Shaad-Mates Authenticated Financial Statement  •  Treasurer Desk`,
              40,
              pageHeight - 15
            );
          }
        });
      }

      // Signatory block
      const lastY = doc.lastAutoTable ? doc.lastAutoTable.finalY : finalY + 50;
      if (lastY < pageHeight - 60) {
        const sigY = Math.min(lastY + 30, pageHeight - 35);
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.5);

        doc.line(40, sigY, 150, sigY);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
        doc.text('Chief Treasurer / Signatory', 40, sigY + 10);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('Date & Signature', 40, sigY + 18);

        doc.line(pageWidth - 150, sigY, pageWidth - 40, sigY);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text('Internal Audit Committee', pageWidth - 150, sigY + 10);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('Official Stamp Endorsed', pageWidth - 150, sigY + 18);
      }

      doc.save(`ShaadMates_FinanceReport_${new Date().toISOString().split('T')[0]}.pdf`);
      setToastType('success');
      setToastMessage('Audited PDF Statement downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      setToastType('error');
      setToastMessage('Failed to generate PDF. Using CSV export.');
      exportToCSV();
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
        
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <UniversalExport
            data={filteredTransactions.map(t => ({
              Date: new Date(t.date).toLocaleDateString(),
              Type: t.type?.toUpperCase(),
              Category: t.category,
              Program: t.programId?.title || 'General Fund',
              Description: t.description || 'N/A',
              Amount: `$${Number(t.amount).toFixed(2)}`
            }))}
            filename={`Finance_Ledger_${new Date().toISOString().slice(0, 10)}`}
            label="Universal Export"
            title="Shaad-Mates Financial Ledger Statement"
            buttonClass="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-xs flex items-center transition-all shadow-md"
          />
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
            <span>{generatingPDF ? 'Generating PDF...' : 'Audited PDF Statement'}</span>
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
