import React, { useState, useRef, useEffect } from 'react';
import { Download, Check, Loader2, FileSpreadsheet, FileCode, FileText, ChevronDown, Printer } from 'lucide-react';

const UniversalExport = ({ 
  data = [], 
  filename = 'export_report', 
  headers = [], 
  label = 'Export',
  buttonClass = 'px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-xs flex items-center transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5',
  title = 'Shaad Mates Official Data Report'
}) => {
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [format, setFormat] = useState('excel');
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
    const cols = Object.keys(data[0] || {}).filter(k => 
      !k.startsWith('_') && 
      k !== 'password' && 
      k !== 'plainPassword' &&
      k !== '__v'
    );
    return { cols, headerNames: cols.map(c => c.charAt(0).toUpperCase() + c.slice(1).replace(/([A-Z])/g, ' $1')) };
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

  // Export to Excel-compatible CSV with Institutional Header, Metadata & UTF-8 BOM
  const handleExportExcel = () => {
    const { cols, headerNames } = getCleanColsAndHeaders();
    
    // Enterprise Metadata Header Block
    let csvContent = '';
    csvContent += `"SHAAD MATES PROGRAM MANAGEMENT SYSTEM - OFFICIAL DATA EXPORT"\r\n`;
    csvContent += `"Report Title:","${title.replace(/"/g, '""')}"\r\n`;
    csvContent += `"Export Timestamp:","${new Date().toLocaleString()}"\r\n`;
    csvContent += `"Database Source:","Supabase PostgreSQL Cloud Cluster (Connected)"\r\n`;
    csvContent += `"Total Records:","${data.length}"\r\n`;
    csvContent += `\r\n`; // Empty line separator

    // Column Headers
    csvContent += headerNames.map(h => `"${String(h).replace(/"/g, '""')}"`).join(',') + '\r\n';

    // Data Rows
    data.forEach(item => {
      const row = cols.map(col => `"${String(cleanVal(item[col])).replace(/"/g, '""')}"`);
      csvContent += row.join(',') + '\r\n';
    });

    // Summary calculation footer if numeric columns exist
    csvContent += `\r\n`;
    csvContent += `"--- END OF OFFICIAL EXPORT RECORD (SHAAD MATES ERP AUTHENTICATED) ---"\r\n`;

    // \uFEFF is the UTF-8 Byte Order Mark that instructs Microsoft Excel, LibreOffice, and Numbers to open cleanly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

    const exportWrapper = {
      institution: "Shaad-Mates Program Management System",
      reportTitle: title,
      generatedAt: new Date().toISOString(),
      databaseCluster: "Supabase PostgreSQL",
      recordCount: data.length,
      records: cleanData
    };

    const blob = new Blob([JSON.stringify(exportWrapper, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // High-End Executive PDF Generator
  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      const autoTable = autoTableModule.default || autoTableModule;

      const { cols, headerNames } = getCleanColsAndHeaders();
      const isWide = headerNames.length > 5;
      
      const doc = new jsPDF({ 
        orientation: isWide ? 'landscape' : 'portrait', 
        unit: 'mm', 
        format: 'a4' 
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Top Deep Navy Banner
      doc.setFillColor(15, 23, 42); // Navy Slate-900
      doc.rect(0, 0, pageWidth, 28, 'F');

      // Cyan Accent Stripe
      doc.setFillColor(6, 182, 212); // Cyan-500
      doc.rect(0, 28, pageWidth, 2, 'F');

      // Gold Accent Ribbon
      doc.setFillColor(245, 158, 11); // Amber-500
      doc.rect(pageWidth - 35, 0, 35, 4, 'F');

      // Header Typography
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text('SHAAD MATES PROGRAM MANAGEMENT SYSTEM', 14, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(203, 213, 225); // Slate-300
      doc.text(
        `${title.toUpperCase()}  |  Total Records: ${data.length}  |  Generated: ${new Date().toLocaleString()}`,
        14, 
        20
      );

      // Sub-bar watermark badge text
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Cloud Database: Supabase PostgreSQL  |  Ref ID: SM-DOC-${Date.now().toString(36).toUpperCase()}`,
        14,
        26
      );

      // Table Data
      const tableRows = data.map((item) => {
        return cols.map(col => cleanVal(item[col]));
      });

      const autoTableOptions = {
        startY: 35,
        head: [headerNames],
        body: tableRows,
        theme: 'striped',
        styles: {
          font: 'helvetica',
          fontSize: 8.5,
          cellPadding: 3,
          overflow: 'linebreak',
          lineColor: [226, 232, 240],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [30, 41, 59], // Slate-800
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'left',
          cellPadding: 3.5,
          lineColor: [6, 182, 212],
          lineWidth: 0.2
        },
        bodyStyles: {
          textColor: [51, 65, 85],
          fontSize: 8
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252] // Slate-50
        },
        margin: { top: 35, right: 14, bottom: 24, left: 14 },
        didDrawPage: (pageData) => {
          // Bottom Footer on every page
          const pageCount = doc.internal.getNumberOfPages();
          
          // Subtle footer separator
          doc.setDrawColor(226, 232, 240);
          doc.setLineWidth(0.3);
          doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

          doc.setFontSize(7.5);
          doc.setTextColor(100, 116, 139); // Slate-500
          doc.text(
            `Page ${pageData.pageNumber} of ${pageCount}  •  Shaad Mates Authenticated Enterprise Document  •  Confidential`,
            14,
            pageHeight - 7
          );
          
          doc.text(
            `Verified Digital Record • Supabase Cloud`,
            pageWidth - 62,
            pageHeight - 7
          );
        }
      };

      // Call autoTable safely
      if (typeof doc.autoTable === 'function') {
        doc.autoTable(autoTableOptions);
      } else {
        autoTable(doc, autoTableOptions);
      }

      // Add signature block on the final page
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 180;
      if (finalY < pageHeight - 45) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(51, 65, 85);

        const sigY = Math.min(finalY + 15, pageHeight - 25);
        doc.setDrawColor(148, 163, 184);
        doc.setLineWidth(0.3);
        
        // Registrar line
        doc.line(14, sigY, 65, sigY);
        doc.text('Authorized Registrar', 14, sigY + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('Signature & Date', 14, sigY + 7.5);

        // Administrator line
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.line(pageWidth - 65, sigY, pageWidth - 14, sigY);
        doc.text('Chief Administrator', pageWidth - 65, sigY + 4);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.text('Official Seal Endorsed', pageWidth - 65, sigY + 7.5);
      }

      doc.save(`${filename}.pdf`);
    } catch (err) {
      console.error('PDF export failed, falling back to Excel:', err);
      handleExportExcel();
    }
  };

  const executeExport = async (selectedFormat) => {
    if (!data || data.length === 0) return;
    setIsOpen(false);
    setExporting(true);
    setFormat(selectedFormat);

    try {
      if (selectedFormat === 'excel' || selectedFormat === 'csv') {
        handleExportExcel();
      } else if (selectedFormat === 'json') {
        handleExportJSON();
      } else if (selectedFormat === 'pdf') {
        await handleExportPDF();
      } else if (selectedFormat === 'print') {
        window.print();
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
    <div className="relative inline-block text-left print:hidden" ref={dropdownRef}>
      <div className="flex items-center space-x-1">
        <button 
          type="button"
          onClick={() => executeExport('excel')}
          disabled={exporting || data.length === 0}
          className={`${buttonClass} ${data.length === 0 ? 'opacity-50 cursor-not-allowed' : ''} rounded-r-none pr-3`}
          title={data.length === 0 ? 'No data available to export' : '1-Click Export to Excel (.csv format with UTF-8 encoding)'}
        >
          {exporting && format === 'excel' ? (
            <>
              <Loader2 size={14} className="mr-1.5 animate-spin" />
              <span>Exporting...</span>
            </>
          ) : success && format === 'excel' ? (
            <>
              <Check size={14} className="mr-1.5 text-white" />
              <span>Downloaded!</span>
            </>
          ) : (
            <>
              <Download size={14} className="mr-1.5" />
              <span>{label}</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={exporting || data.length === 0}
          className={`${buttonClass} ${data.length === 0 ? 'opacity-50 cursor-not-allowed' : ''} rounded-l-none px-2 border-l border-white/20`}
          title="Choose Export Format (Excel, PDF, Print, JSON)"
        >
          <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Format Options Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 z-50 animate-scale">
          <div className="px-2.5 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>Enterprise Export</span>
            <span className="text-[9px] text-emerald-500 font-bold">{data.length} Rows</span>
          </div>
          
          <button
            type="button"
            onClick={() => executeExport('excel')}
            className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left mt-1"
          >
            <FileSpreadsheet size={18} className="text-emerald-500 shrink-0" />
            <div>
              <p className="font-bold">Excel Spreadsheet</p>
              <p className="text-[10px] text-slate-400 font-normal">.CSV format with UTF-8 encoding</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => executeExport('pdf')}
            className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 transition-colors text-left"
          >
            <FileText size={18} className="text-rose-500 shrink-0" />
            <div>
              <p className="font-bold">Executive PDF Report</p>
              <p className="text-[10px] text-slate-400 font-normal">Header, badges, sign-off lines</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => executeExport('print')}
            className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <Printer size={18} className="text-royal shrink-0" />
            <div>
              <p className="font-bold">Print Document</p>
              <p className="text-[10px] text-slate-400 font-normal">Direct browser print dialog</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => executeExport('json')}
            className="w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left"
          >
            <FileCode size={18} className="text-blue-500 shrink-0" />
            <div>
              <p className="font-bold">JSON Data Dump</p>
              <p className="text-[10px] text-slate-400 font-normal">Structured API records</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default UniversalExport;
