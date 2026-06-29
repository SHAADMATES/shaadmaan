import React, { useState } from 'react';
import { api } from '../../context/AuthContext';
import { UploadCloud, AlertCircle, CheckCircle2, FileJson } from 'lucide-react';
import Toast from '../../components/Toast';

const BulkUpload = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const handleUpload = async () => {
    setLoading(true);
    try {
      const data = JSON.parse(jsonInput);
      if (!Array.isArray(data)) {
        throw new Error('Data must be an array of objects');
      }

      const res = await api.post('/superadmin/bulk-upload/students', { students: data });
      setToastType('success');
      setToastMessage(res.data.message || 'Students uploaded successfully!');
      setJsonInput('');
    } catch (err) {
      setToastType('error');
      setToastMessage(err.message || err.response?.data?.message || 'Invalid JSON or API error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0d1b2a] via-[#1a2d4a] to-[#0d1b2a] text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan/10 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-cyan/20 flex items-center justify-center border border-cyan/30">
                <UploadCloud size={16} className="text-cyan" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-cyan">Data Migration</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Bulk Upload Students
            </h1>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Use JSON formatting to bulk register student records directly into the platform database. Make sure all required fields are included for each record.
            </p>
          </div>
        </div>
      </div>

      {/* Editor Section */}
      <div className="glass-card border rounded-3xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center space-x-2">
          <FileJson size={18} className="text-royal" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">JSON Payload</h3>
        </div>
        
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-500">
            Paste an array of student objects (JSON format) below. Example:
          </p>
          
          <div className="relative group">
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`[\n  {\n    "username": "student1",\n    "password": "pass",\n    "name": "John Doe",\n    "studentId": "S001",\n    "admissionNumber": "A001",\n    "className": "Class 10",\n    "wing": "North Wing"\n  }\n]`}
              className="w-full h-80 p-4 font-mono text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-royal/30 resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleUpload}
              disabled={loading || !jsonInput.trim()}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-royal to-cyan-500 hover:from-royal-dark hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={18} />
                  <span>Execute Bulk Upload</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions / Validation Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-start space-x-3">
          <AlertCircle size={20} className="text-blue-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-1">JSON Format Rules</h4>
            <ul className="text-xs text-blue-600 dark:text-blue-500 space-y-1 list-disc pl-4">
              <li>Must be a valid JSON array `[]` containing objects `{}`</li>
              <li>Keys and string values must use double quotes `" "`</li>
              <li>No trailing commas at the end of objects/arrays</li>
            </ul>
          </div>
        </div>
        <div className="p-5 rounded-3xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex items-start space-x-3">
          <CheckCircle2 size={20} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-1">Required Object Fields</h4>
            <ul className="text-xs text-amber-600 dark:text-amber-500 space-y-1 list-disc pl-4">
              <li>username & password</li>
              <li>name & studentId</li>
              <li>admissionNumber, className, wing</li>
            </ul>
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

export default BulkUpload;
