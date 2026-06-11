import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { FileSpreadsheet, Printer, Download, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import Toast from '../../components/Toast';

const Reports = () => {
  const [reportType, setReportType] = useState('programs');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  
  // Filters
  const [selectedWing, setSelectedWing] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Dropdown list helper states
  const [wingsList, setWingsList] = useState([]);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchReportData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      let endpoint = '';
      if (reportType === 'programs') {
        endpoint = '/admin/programs';
      } else if (reportType === 'schedules') {
        endpoint = '/admin/schedules';
      } else if (reportType === 'results') {
        endpoint = '/admin/results';
      } else if (reportType === 'wing_wise') {
        endpoint = '/admin/stats'; // stats contains wing breakdown
      } else if (reportType === 'student_wise') {
        endpoint = '/admin/students';
      }

      const res = await api.get(endpoint);
      let fetchedData = res.data;

      // Apply client-side filters based on Month/Year/Wing for programs, schedules, results
      if (reportType === 'programs') {
        fetchedData = fetchedData.filter(p => {
          const pDate = new Date(p.date);
          const matchesWing = selectedWing === '' || p.wing === selectedWing;
          const matchesMonth = pDate.getMonth() + 1 === Number(selectedMonth);
          const matchesYear = pDate.getFullYear() === Number(selectedYear);
          return matchesWing && matchesMonth && matchesYear;
        });
      } else if (reportType === 'schedules') {
        fetchedData = fetchedData.filter(s => {
          const sDate = new Date(s.date);
          const matchesMonth = sDate.getMonth() + 1 === Number(selectedMonth);
          const matchesYear = sDate.getFullYear() === Number(selectedYear);
          return matchesMonth && matchesYear;
        });
      } else if (reportType === 'results') {
        fetchedData = fetchedData.filter(r => {
          const rDate = new Date(r.publishedAt);
          const matchesMonth = rDate.getMonth() + 1 === Number(selectedMonth);
          const matchesYear = rDate.getFullYear() === Number(selectedYear);
          return matchesMonth && matchesYear;
        });
      }

      setData(fetchedData);
      
      // Seed wings selector lists on first programs load
      if (reportType === 'programs' && wingsList.length === 0) {
        const uniqueWings = [...new Set(res.data.map(p => p.wing))].filter(Boolean);
        setWingsList(uniqueWings);
      }

    } catch (err) {
      setErrorMsg('Failed to compile report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType, selectedWing, selectedMonth, selectedYear]);

  // Log report action to backend
  const logReportDownload = async (actionTitle) => {
    try {
      await api.post('/admin/reports/log', {
        title: actionTitle,
        type: reportType
      });
    } catch (e) {
      console.error('Failed to log report download audit', e);
    }
  };

  // CSV Generator Utility
  const downloadCSV = () => {
    if (data.length === 0) {
      setToastType('error');
      setToastMessage('No data available to download.');
      return;
    }

    let csvContent = '';
    let headers = [];
    let rows = [];

    if (reportType === 'programs') {
      headers = ['Title', 'Wing', 'Type', 'Date', 'Venue', 'Participants Limit', 'Status', 'Approved'];
      rows = data.map(p => [
        p.title,
        p.wing,
        p.type,
        new Date(p.date).toLocaleDateString(),
        p.venue,
        p.maxParticipants || 'Unlimited',
        p.status,
        p.approved ? 'Yes' : 'No'
      ]);
    } else if (reportType === 'schedules') {
      headers = ['Program Title', 'Wing', 'Date', 'Time', 'Venue', 'Description'];
      rows = data.map(s => [
        s.programId?.title || 'Unknown',
        s.programId?.wing || 'N/A',
        new Date(s.date).toLocaleDateString(),
        s.time,
        s.venue,
        s.description || ''
      ]);
    } else if (reportType === 'results') {
      headers = ['Program Title', 'Winner Standings (Position - Recipient - Points - Grade)'];
      rows = data.map(r => {
        const standings = r.winners.map(w => 
          `${w.position}: ${w.studentId?.name || w.groupId?.name || 'Unknown'} (${w.points} pts, Grade ${w.grade || 'N/A'})`
        ).join(' | ');
        return [
          r.programId?.title || 'Unknown',
          standings
        ];
      });
    } else if (reportType === 'wing_wise') {
      headers = ['Wing Name', 'Programs Created'];
      // if wingsData exists
      const wingBreakdown = data.wingsData || [];
      rows = wingBreakdown.map(w => [w._id, w.programsCount]);
    } else if (reportType === 'student_wise') {
      headers = ['Student Name', 'Student ID', 'Wing', 'Email', 'Phone'];
      rows = data.map(s => [s.name, s.studentId, s.wing, s.email || '', s.phone || '']);
    }

    // Combine headers and rows
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      const escapedRow = row.map(val => `"${String(val).replace(/"/g, '""')}"`);
      csvContent += escapedRow.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const fileName = `ShaadMates_${reportType}_Report_M${selectedMonth}_Y${selectedYear}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastType('success');
    setToastMessage(`CSV exported: ${fileName}`);
    logReportDownload(`Exported CSV for ${reportType}`);
  };

  const handlePrint = () => {
    logReportDownload(`Printed report sheet for ${reportType}`);
    window.print();
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  return (
    <div className="p-6 space-y-6 animate-scale printable-section">
      {/* Selection Tabs */}
      <div className="no-print flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'programs', label: 'Monthly Programs' },
          { id: 'schedules', label: 'Monthly Schedules' },
          { id: 'results', label: 'Result Reports' },
          { id: 'wing_wise', label: 'Wing Reports' },
          { id: 'student_wise', label: 'Student Sheets' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
              reportType === tab.id
                ? 'bg-royal text-white border-royal glow-blue'
                : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-850 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Panel */}
      <div className="no-print bg-white/50 dark:bg-slate-900/30 p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {/* Month Filter */}
          {['programs', 'schedules', 'results'].includes(reportType) && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border dark:border-slate-850 rounded-xl text-xs focus:outline-none"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          )}

          {/* Year Filter */}
          {['programs', 'schedules', 'results'].includes(reportType) && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border dark:border-slate-850 rounded-xl text-xs focus:outline-none"
            >
              {[2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}

          {/* Wing Selector */}
          {reportType === 'programs' && (
            <select
              value={selectedWing}
              onChange={(e) => setSelectedWing(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border dark:border-slate-850 rounded-xl text-xs focus:outline-none"
            >
              <option value="">All Wings</option>
              {wingsList.map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          )}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={downloadCSV}
            className="px-4 py-2 bg-emerald hover:bg-emerald-dark text-white font-bold rounded-xl text-xs flex items-center transition-all shadow-md"
          >
            <Download size={14} className="mr-1.5" /> Export Excel
          </button>
          
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center transition-all shadow-md"
          >
            <Printer size={14} className="mr-1.5" /> Print Sheet
          </button>
        </div>
      </div>

      {/* Error displays */}
      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center">
          <AlertCircle size={14} className="mr-2" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Document View Wrapper (Print Friendly) */}
      <div className="bg-white dark:bg-slate-900/50 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        {/* Printable Header */}
        <div className="text-center border-b pb-6 border-slate-100 dark:border-slate-800/80">
          <h2 className="text-2xl font-extrabold font-sans">Shaad-Mates Program Management</h2>
          <p className="text-sm font-semibold uppercase tracking-wider text-royal mt-1">
            {reportType.replace('_', ' ')} report sheet
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Generated on: {new Date().toLocaleDateString()} | Parameters:{' '}
            {['programs', 'schedules', 'results'].includes(reportType) ? `${months.find(m=>m.value===Number(selectedMonth))?.label} ${selectedYear}` : 'Cumulative'}
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">
            <RefreshCw size={28} className="animate-spin mx-auto mb-3 text-slate-400" />
            Compiling report fields...
          </div>
        ) : data.length === 0 ? (
          <div className="py-20 text-center text-slate-400 italic">
            No entries found matching filters for this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* 1. Monthly Programs Table */}
            {reportType === 'programs' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-800 text-slate-500 font-bold">
                    <th className="py-3">Program Title</th>
                    <th className="py-3">Wing</th>
                    <th className="py-3">Type</th>
                    <th className="py-3">Date & Time</th>
                    <th className="py-3">Venue</th>
                    <th className="py-3">Limit</th>
                    <th className="py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {data.map(p => (
                    <tr key={p._id} className="hover:bg-slate-500/5">
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{p.title}</td>
                      <td className="py-3 font-medium">{p.wing}</td>
                      <td className="py-3 uppercase">{p.type}</td>
                      <td className="py-3">
                        {new Date(p.date).toLocaleDateString()} at {p.time}
                      </td>
                      <td className="py-3">{p.venue}</td>
                      <td className="py-3">{p.maxParticipants || 'Unlimited'}</td>
                      <td className="py-3 text-royal font-semibold">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 2. Monthly Schedules Table */}
            {reportType === 'schedules' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-800 text-slate-500 font-bold">
                    <th className="py-3">Scheduled Event</th>
                    <th className="py-3">Wing</th>
                    <th className="py-3">Date</th>
                    <th className="py-3">Time</th>
                    <th className="py-3">Venue</th>
                    <th className="py-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {data.map(s => (
                    <tr key={s._id} className="hover:bg-slate-500/5">
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{s.programId?.title || 'Unknown'}</td>
                      <td className="py-3">{s.programId?.wing || 'N/A'}</td>
                      <td className="py-3">{new Date(s.date).toLocaleDateString()}</td>
                      <td className="py-3 text-royal font-semibold">{s.time}</td>
                      <td className="py-3">{s.venue}</td>
                      <td className="py-3 text-slate-400 max-w-xs truncate">{s.description || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 3. Results Standings Table */}
            {reportType === 'results' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-800 text-slate-500 font-bold">
                    <th className="py-3">Program Name</th>
                    <th className="py-3">Type</th>
                    <th className="py-3">Standings (Winner - Position - Grade - Points)</th>
                    <th className="py-3">Date Declared</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {data.map(r => (
                    <tr key={r._id} className="hover:bg-slate-500/5">
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{r.programId?.title}</td>
                      <td className="py-3 uppercase font-semibold">{r.type}</td>
                      <td className="py-3 space-y-1.5">
                        {r.winners.map((w, idx) => (
                          <div key={idx} className="flex items-center space-x-2 bg-slate-500/5 px-2.5 py-1 rounded-lg w-fit">
                            <span className="font-bold text-royal">{w.position}</span>
                            <span className="text-slate-600 dark:text-slate-300">
                              {w.studentId?.name || w.groupId?.name || 'N/A'}
                            </span>
                            <span className="font-bold text-emerald">({w.points} pts)</span>
                            <span className="text-slate-400">Grade: {w.grade}</span>
                          </div>
                        ))}
                      </td>
                      <td className="py-3 text-slate-400">{new Date(r.publishedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 4. Wing-Wise Reports */}
            {reportType === 'wing_wise' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-800 text-slate-500 font-bold">
                    <th className="py-3">Wing Name</th>
                    <th className="py-3">Total Programs Initiated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {data.wingsData?.map((w, idx) => (
                    <tr key={idx} className="hover:bg-slate-500/5">
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{w._id}</td>
                      <td className="py-3 font-bold text-royal">{w.programsCount} programs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 5. Student Sheets */}
            {reportType === 'student_wise' && (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-300 dark:border-slate-800 text-slate-500 font-bold">
                    <th className="py-3">Student Name</th>
                    <th className="py-3">Student ID</th>
                    <th className="py-3">Wing</th>
                    <th className="py-3">Email Address</th>
                    <th className="py-3">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {data.map(s => (
                    <tr key={s._id} className="hover:bg-slate-500/5">
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{s.name}</td>
                      <td className="py-3 font-mono">{s.studentId}</td>
                      <td className="py-3 font-bold text-cyan-dark">{s.wing}</td>
                      <td className="py-3">{s.email || 'N/A'}</td>
                      <td className="py-3">{s.phone || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
          .printable-section * {
            background: transparent !important;
            box-shadow: none !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
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

export default Reports;
