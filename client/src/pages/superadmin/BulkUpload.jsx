import React, { useState, useRef } from 'react';
import { api } from '../../context/AuthContext';
import { Upload, Download, CheckCircle2, XCircle, AlertCircle, Users, FileText, RefreshCw, Trash2 } from 'lucide-react';
import Toast from '../../components/Toast';

const SAMPLE_CSV = `username,password,name,admissionNumber,class,wing,dob,phone,email
ali.ahmad,Pass@123,Ali Ahmad,ADM-2024-001,Class XI,Cultural Wing,2007-05-12,9876543210,ali@school.edu
sara.khan,Pass@123,Sara Khan,ADM-2024-002,Class XII,Sports Wing,2006-09-20,9876543211,sara@school.edu
umar.farooq,Pass@123,Umar Farooq,ADM-2024-003,Class XI,Academic Wing,2007-03-15,9876543212,umar@school.edu`;

const BulkUpload = () => {
  const [rows, setRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const showToast = (msg, type = 'success') => { setToastMessage(msg); setToastType(type); };

  const parseCSV = (text) => {
    const lines = text.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const obj = {};
      headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
      return obj;
    });
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      showToast('Only CSV files are supported.', 'error');
      return;
    }
    setFileName(file.name);
    setResults(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseCSV(e.target.result);
      setRows(parsed);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (rows.length === 0) { showToast('No data to upload. Please import a CSV first.', 'error'); return; }
    setUploading(true);
    try {
      const res = await api.post('/admin/bulk-upload/students', { students: rows });
      setResults(res.data.results);
      showToast(res.data.message, res.data.results.failed === 0 ? 'success' : 'error');
    } catch (err) {
      showToast(err.response?.data?.message || 'Bulk upload failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ShaadMates_BulkUpload_Template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => { setRows([]); setFileName(''); setResults(null); if (fileRef.current) fileRef.current.value = ''; };

  const requiredCols = ['username', 'password', 'name', 'admissionNumber'];
  const colHeaders = rows.length > 0 ? Object.keys(rows[0]) : [];
  const missingCols = requiredCols.filter(c => !colHeaders.includes(c));

  return (
    <div className="p-6 space-y-8 animate-scale">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-violet-700 to-indigo-600 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <Users size={28} className="text-violet-200" />
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Bulk Student Upload</h2>
        </div>
        <p className="text-violet-100 text-sm">Upload multiple students at once using a CSV file. Download the template to get started.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Instructions */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-violet-500" /> Instructions
            </h3>
            <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex gap-2"><span className="font-bold text-violet-600 shrink-0">1.</span> Download the CSV template below.</li>
              <li className="flex gap-2"><span className="font-bold text-violet-600 shrink-0">2.</span> Fill in student data (one per row).</li>
              <li className="flex gap-2"><span className="font-bold text-violet-600 shrink-0">3.</span> Drag & drop or select the CSV file.</li>
              <li className="flex gap-2"><span className="font-bold text-violet-600 shrink-0">4.</span> Review the preview table.</li>
              <li className="flex gap-2"><span className="font-bold text-violet-600 shrink-0">5.</span> Click <strong>Upload Students</strong>.</li>
            </ol>
          </div>

          <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3">Required Columns</h3>
            <div className="space-y-1.5">
              {[
                { col: 'username', req: true, note: 'Unique login username' },
                { col: 'password', req: true, note: 'Initial password' },
                { col: 'name', req: true, note: 'Full name' },
                { col: 'admissionNumber', req: true, note: 'Unique admission no.' },
                { col: 'class', req: false, note: 'e.g. Class XI' },
                { col: 'wing', req: false, note: 'Wing name' },
                { col: 'dob', req: false, note: 'YYYY-MM-DD format' },
                { col: 'phone', req: false, note: 'Mobile number' },
                { col: 'email', req: false, note: 'Email address' }
              ].map(f => (
                <div key={f.col} className="flex items-start gap-2 text-xs">
                  <span className={`shrink-0 px-1.5 py-0.5 rounded font-bold ${f.req ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                    {f.req ? 'REQ' : 'OPT'}
                  </span>
                  <div>
                    <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{f.col}</span>
                    <span className="text-slate-400 ml-1">— {f.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={downloadSample} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-sm font-bold shadow-md transition-all">
            <Download size={16} />
            Download CSV Template
          </button>
        </div>

        {/* Right: Upload Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Drop zone */}
          <div
            className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer ${dragOver ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-950/10'}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            <Upload size={36} className={`mx-auto mb-3 ${dragOver ? 'text-violet-500' : 'text-slate-400'}`} />
            {fileName ? (
              <div>
                <p className="font-bold text-violet-600 dark:text-violet-400">{fileName}</p>
                <p className="text-sm text-slate-500 mt-1">{rows.length} rows detected</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-slate-600 dark:text-slate-300">Drop CSV file here or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">Only .csv files are accepted</p>
              </div>
            )}
          </div>

          {/* Validation Warnings */}
          {missingCols.length > 0 && rows.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-700 text-sm">Missing Required Columns</p>
                <p className="text-xs text-amber-600 mt-1">Your CSV is missing: <strong>{missingCols.join(', ')}</strong>. Please fix before uploading.</p>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {rows.length > 0 && (
            <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Preview — {rows.length} student{rows.length !== 1 ? 's' : ''} ready
                </h3>
                <button onClick={clearAll} className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600">
                  <Trash2 size={12} /> Clear
                </button>
              </div>
              <div className="overflow-x-auto max-h-64">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800">
                      <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase">#</th>
                      {colHeaders.map(h => (
                        <th key={h} className={`text-left px-4 py-3 font-bold uppercase whitespace-nowrap ${requiredCols.includes(h) ? 'text-violet-600' : 'text-slate-400'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {rows.slice(0, 50).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-2.5 text-slate-400 font-mono">{i + 1}</td>
                        {colHeaders.map(h => (
                          <td key={h} className="px-4 py-2.5 text-slate-700 dark:text-slate-300 whitespace-nowrap max-w-32 truncate">{row[h] || '—'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rows.length > 50 && <p className="text-center text-xs text-slate-400 py-3">Showing first 50 of {rows.length} rows</p>}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {rows.length > 0 && (
            <button
              onClick={handleUpload}
              disabled={uploading || missingCols.length > 0}
              className="w-full flex items-center justify-center gap-2 py-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-sm shadow-lg transition-all"
            >
              {uploading ? <><RefreshCw size={16} className="animate-spin" /> Uploading...</> : <><Upload size={16} /> Upload {rows.length} Student{rows.length !== 1 ? 's' : ''}</>}
            </button>
          )}

          {/* Results */}
          {results && (
            <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Upload Results</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 flex items-center gap-3">
                    <CheckCircle2 size={24} className="text-emerald-600" />
                    <div>
                      <p className="text-2xl font-black text-emerald-600">{results.success}</p>
                      <p className="text-xs text-emerald-500">Successfully Added</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 flex items-center gap-3">
                    <XCircle size={24} className="text-rose-500" />
                    <div>
                      <p className="text-2xl font-black text-rose-500">{results.failed}</p>
                      <p className="text-xs text-rose-400">Failed / Skipped</p>
                    </div>
                  </div>
                </div>
                {results.errors?.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Error Details</p>
                    {results.errors.map((e, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100">
                        <XCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                        <div className="text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{e.row}</span>
                          <span className="text-rose-500 ml-2">— {e.reason}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {toastMessage && <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />}
    </div>
  );
};

export default BulkUpload;
