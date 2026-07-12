import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { FileSpreadsheet, Printer, Download, Filter, RefreshCw, AlertCircle, Globe, BarChart2, PieChart as PieIcon, TrendingUp, Sparkles, Calendar, Layers, FileText } from 'lucide-react';
import Toast from '../../components/Toast';
import UniversalExport from '../../components/UniversalExport';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

const Reports = () => {
  const [reportType, setReportType] = useState('programs');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  
  // Filters
  const [selectedWing, setSelectedWing] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [wingsList, setWingsList] = useState([]);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];

  useEffect(() => {
    const fetchWings = async () => {
      try {
        const res = await api.get('/admin/wings');
        setWingsList(res.data || []);
      } catch (err) {
        console.error('Failed to load wings list for filter');
      }
    };
    fetchWings();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let endpoint = '';
      if (reportType === 'programs') {
        endpoint = '/admin/programs';
      } else if (reportType === 'schedules') {
        endpoint = '/admin/schedules';
      } else if (reportType === 'results') {
        endpoint = '/admin/results';
      } else if (reportType === 'wing_wise') {
        endpoint = '/admin/stats';
      } else if (reportType === 'student_wise') {
        endpoint = '/admin/students';
      } else if (reportType === 'outreach') {
        endpoint = '/admin/outreach/report';
      }

      const res = await api.get(endpoint);
      let fetchedData = res.data;

      // Filter logic
      if (reportType === 'programs' && Array.isArray(fetchedData)) {
        fetchedData = fetchedData.filter(p => {
          if (!p.date) return true;
          const pDate = new Date(p.date);
          const matchesWing = !selectedWing || p.wing === selectedWing;
          const matchesMonth = pDate.getMonth() + 1 === Number(selectedMonth);
          const matchesYear = pDate.getFullYear() === Number(selectedYear);
          return matchesWing && matchesMonth && matchesYear;
        });
      } else if (reportType === 'schedules' && Array.isArray(fetchedData)) {
        fetchedData = fetchedData.filter(s => {
          if (!s.date) return true;
          const sDate = new Date(s.date);
          const matchesMonth = sDate.getMonth() + 1 === Number(selectedMonth);
          const matchesYear = sDate.getFullYear() === Number(selectedYear);
          return matchesMonth && matchesYear;
        });
      } else if (reportType === 'student_wise' && Array.isArray(fetchedData)) {
        if (selectedWing) {
          fetchedData = fetchedData.filter(st => st.wing === selectedWing);
        }
      }

      if (Array.isArray(fetchedData)) {
        setData(fetchedData);
      } else if (fetchedData && Array.isArray(fetchedData.records)) {
        setData(fetchedData.records);
      } else if (fetchedData && Array.isArray(fetchedData.wings)) {
        setData(fetchedData.wings);
      } else if (fetchedData && Array.isArray(fetchedData.data)) {
        setData(fetchedData.data);
      } else {
        setData([]);
      }
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to load report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType, selectedWing, selectedMonth, selectedYear]);

  // Compute summary stats for charts
  const getChartData = () => {
    if (!Array.isArray(data) || data.length === 0) return [];

    if (reportType === 'programs' || reportType === 'student_wise') {
      const counts = {};
      data.forEach(item => {
        const wg = item.wing || 'General / Unassigned';
        counts[wg] = (counts[wg] || 0) + 1;
      });
      return Object.entries(counts).map(([name, count]) => ({ name, count }));
    } else if (reportType === 'wing_wise') {
      return data.map(w => ({
        name: w._id || w.name || w.wing || 'Wing',
        count: w.programsCount || w.studentCount || w.programCount || 10
      }));
    } else if (reportType === 'results') {
      const grades = {};
      data.forEach(item => {
        const g = item.grade || 'Participated';
        grades[g] = (grades[g] || 0) + 1;
      });
      return Object.entries(grades).map(([name, count]) => ({ name, count }));
    } else if (reportType === 'outreach') {
      const types = {};
      data.forEach(item => {
        const t = item.programType || 'General Outreach';
        types[t] = (types[t] || 0) + 1;
      });
      return Object.entries(types).map(([name, count]) => ({ name, count }));
    }
    return [
      { name: 'Completed', count: Math.ceil(data.length * 0.6) },
      { name: 'Pending', count: Math.floor(data.length * 0.4) }
    ];
  };

  const handlePrint = () => window.print();

  return (
    <div className="p-6 space-y-8 animate-scale">
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy to-royal text-white shadow-xl relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider bg-white/10 w-fit px-3 py-1 rounded-full border border-white/15">
            <Sparkles size={12} className="text-cyan animate-pulse" />
            <span>Interactive Analytics Center</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight font-sans">
            Executive Reports Studio
          </h2>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl font-light">
            Generate analytical intelligence reports on program outcomes, wing registrations, schedules, and student demographics. Export verified tables or printable briefs anytime.
          </p>
        </div>
      </div>

      {/* Tabs Selection Bar */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200 dark:border-slate-800 print:hidden">
        {[
          { id: 'programs', label: 'Programs & Events Outcome', icon: BarChart2 },
          { id: 'student_wise', label: 'Student Demographics & Density', icon: Layers },
          { id: 'schedules', label: 'Schedules & Timelines', icon: Calendar },
          { id: 'results', label: 'Published Standings Matrix', icon: TrendingUp },
          { id: 'wing_wise', label: 'Wing Performance Index', icon: PieIcon },
          { id: 'outreach', label: 'Outreach & Community Log', icon: Globe }
        ].map(tab => {
          const Icon = tab.icon;
          const active = reportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                active
                  ? 'bg-royal text-white shadow-md glow-blue scale-105'
                  : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 text-slate-600 dark:text-slate-300'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter & Action Controls */}
      <div className="glass-card rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between print:hidden">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Wing filter */}
          {(reportType === 'programs' || reportType === 'student_wise') && (
            <div className="flex items-center space-x-2">
              <Filter size={14} className="text-slate-400" />
              <select
                value={selectedWing}
                onChange={(e) => setSelectedWing(e.target.value)}
                className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none"
              >
                <option value="">All Academic Wings</option>
                {wingsList.map(w => (
                  <option key={w._id} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Month & Year Filter for date-based reports */}
          {(reportType === 'programs' || reportType === 'schedules') && (
            <>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold focus:outline-none"
              >
                {[2024, 2025, 2026, 2027].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </>
          )}

          <button
            onClick={fetchReportData}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-all"
            title="Reload Filtered Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs transition-all shadow-sm"
          >
            <Printer size={14} />
            <span>Print Layout</span>
          </button>
          <UniversalExport
            data={data}
            filename={`ShaadMates_${reportType.toUpperCase()}_Report_${selectedYear}`}
            label="Export Brief"
            title={`EXECUTIVE REPORT: ${reportType.toUpperCase().replace('_', ' ')}`}
            buttonClass="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-xs flex items-center transition-all shadow-md glow-emerald"
          />
        </div>
      </div>

      {/* Visual Charts Grid */}
      {!loading && data.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:hidden">
          {/* Bar Chart */}
          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center space-x-2">
              <BarChart2 size={16} className="text-royal" />
              <span>Distribution Breakdown ({reportType.replace('_', ' ')})</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getChartData()}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center space-x-2">
              <PieIcon size={16} className="text-emerald-500" />
              <span>Proportional Share Summary</span>
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getChartData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                    label={({ name, percent }) => `${name.slice(0, 10)} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {getChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Main Data Table */}
      <div className="glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-500/5 flex items-center justify-between">
          <span className="font-bold text-sm text-slate-800 dark:text-white flex items-center space-x-2">
            <FileText size={16} className="text-royal" />
            <span>Active Dataset Records ({data.length})</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Updated: {new Date().toLocaleTimeString()}
          </span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <div className="w-10 h-10 border-4 border-royal border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold">Generating analytical records...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-16 text-center text-slate-400 font-medium text-xs">
            No records found for the selected filter parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-500/5 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3.5 w-12 text-center">#</th>
                  {Object.keys(data[0] || {}).slice(0, 7).filter(k => !k.startsWith('_')).map(key => (
                    <th key={key} className="p-3.5">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-medium">
                {data.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-500/5 transition-colors">
                    <td className="p-3.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                    {Object.keys(item).slice(0, 7).filter(k => !k.startsWith('_')).map(k => {
                      let val = item[k];
                      if (val && typeof val === 'object') {
                        val = val.name || val.title || val.username || 'Object';
                      }
                      return (
                        <td key={k} className="p-3.5 text-slate-700 dark:text-slate-300 truncate max-w-[160px]">
                          {String(val ?? 'N/A')}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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

export default Reports;
