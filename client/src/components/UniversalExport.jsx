import React, { useState, useRef, useEffect } from 'react';
import { Download, Check, Loader2, FileSpreadsheet, FileCode, FileText, ChevronDown } from 'lucide-react';

const UniversalExport = ({ 
  data = [], 
  filename = 'export_report', 
  headers = [], 
  label = 'Export Data',
  buttonClass = 'px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-xs flex items-center transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 glow-emerald',
  title = 'Shaad-Mates Official Data Report'
}) => {
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [format, setFormat] = useState('csv'); // 'csv' | 'json' | 'pdf'
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCleanColsAndHeaders = () => {
    if (!data || data.length === 0) return { cols: [], headerNames: [] };
    if (headers && headers.length > 0) {
      return {
        cols: headers.map(h => typeof h === 'string' ? h : h.key),
        headerNames: headers.map(h => typeof h === 'string' ? h : h.label)
      };
    }
    const cols = Object.keys(data[0] || {}).filter(k => !k.startsWith('_') && k !== 'password' && k !== 'plainPassword');
    return { cols, headerNames: cols };
  };

  const cleanVal = (val) => {
    if (val === null || val === undefined) return 'N/A';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (typeof val === 'object') {
      if (val instanceof Date) return val.toLocaleDateString();
      if (val.name) return val.name;
      if (val.title) return val.title;
      if (val.username) return `@${val.username}`;
      return JSON.stringify(val);
    }
    return String(val);
  };

  const handleExportCSV = () => {
    const { cols, headerNames } = getCleanColsAndHeaders();
    let csvContent = headerNames.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\r\n';

    data.forEach(item => {
      const row = cols.map(col => `"${String(cleanVal(item[col])).replace(/"/g, '""')}"`);
      csvContent += row.join(',') + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const { cols, headerNames } = getCleanColsAndHeaders();
    const cleanData = data.map(item => {
      const obj = {};
      cols.forEach((col, idx) => {
        obj[headerNames[idx]] = cleanVal(item[col]);
      });
      return obj;
    });

    const blob = new Blob([JSON.stringify(cleanData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const { cols, headerNames } = getCleanColsAndHeaders();

      // Header Branding block
      doc.setFillColor(15, 23, 42); // Navy slate-900
      doc.rect(0, 0, 297, 24, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('SHAAD-MATES ENTERPRISE PORTAL', 14, 11);

      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225);
      doc.text(`${title.toUpperCase()} | Generated: ${new Date().toLocaleString()}`, 14, 18);

      // Table data
      const tableRows = data.map(item => cols.map(col => cleanVal(item[col])));

      autoTable(doc, {
        startY: 30,
        head: [headerNames],
        body: tableRows,
        theme: 'grid',
        headStyles: {
          fillColor: [16, 185, 129], // Emerald
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 65, 85]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { top: 30, right: 14, bottom: 20, left: 14 },
        didDrawPage: (data) => {
          // Footer with page number
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount} | Shaad-Mates Verified Credential Report`,
            14,
            doc.internal.pageSize.height - 10
          );
        }
      });

      doc.save(`${filename}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      throw err;
    }
  };

  const executeExport = async (selectedFormat) => {
    if (!data || data.length === 0) return;
    setIsOpen(false);
    setExporting(true);
    setFormat(selectedFormat);

    try {
      if (selectedFormat === 'csv') {
        handleExportCSV();
      } else if (selectedFormat === 'json') {
        handleExportJSON();
      } else if (selectedFormat === 'pdf') {
        await handleExportPDF();
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div className="flex items-center space-x-1">
        <button 
          onClick={() => executeExport('csv')}
          disabled={exporting || data.length === 0}
          className={`${buttonClass} ${data.length === 0 ? 'opacity-50 cursor-not-allowed' : ''} rounded-r-none pr-3`}
          title={data.length === 0 ? 'No data available to export' : '1-Click Export CSV Spreadsheet'}
        >
          {exporting && format === 'csv' ? (
            <>
              <Loader2 size={14} className="mr-1.5 animate-spin" />
              <span>CSV...</span>
            </>
          ) : success && format === 'csv' ? (
            <>
              <Check size={14} className="mr-1.5 text-white" />
              <span>Exported!</span>
            </>
          ) : (
            <>
              <Download size={14} className="mr-1.5" />
              <span>{label}</span>
            </>
          )}
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={exporting || data.length === 0}
          className={`${buttonClass} ${data.length === 0 ? 'opacity-50 cursor-not-allowed' : ''} rounded-l-none px-2 border-l border-white/20`}
          title="Pick Export Format (CSV, JSON, Branded PDF)"
        >
          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Format Options Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-scale">
          <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
            Select Export Format
          </div>
          <button
            onClick={() => executeExport('csv')}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left mt-1"
          >
            <FileSpreadsheet size={15} className="text-emerald-500" />
            <div>
              <p className="font-bold">CSV Spreadsheet</p>
              <p className="text-[10px] text-slate-400 font-normal">Excel, Google Sheets compatible</p>
            </div>
          </button>
          <button
            onClick={() => executeExport('pdf')}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors text-left"
          >
            <FileText size={15} className="text-rose-500" />
            <div>
              <p className="font-bold">Branded PDF Report</p>
              <p className="text-[10px] text-slate-400 font-normal">Multi-page printable report</p>
            </div>
          </button>
          <button
            onClick={() => executeExport('json')}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
          >
            <FileCode size={15} className="text-blue-500" />
            <div>
              <p className="font-bold">JSON Data Dump</p>
              <p className="text-[10px] text-slate-400 font-normal">Raw structured JSON format</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default UniversalExport;
