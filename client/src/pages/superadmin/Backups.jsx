import React, { useState } from 'react';
import { api } from '../../context/AuthContext';
import { Database, Download, Upload, AlertTriangle, CheckCircle, RefreshCw, FileText } from 'lucide-react';
import Toast from '../../components/Toast';

const Backups = () => {
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const handleBackup = async () => {
    setLoading(true);
    try {
      const res = await api.post('/superadmin/backup');
      setToastType('success');
      setToastMessage(res.data.message || 'System backup created successfully!');
      setLastAction({ type: 'backup', time: new Date() });
    } catch (err) {
      setToastType('error');
      setToastMessage(err.response?.data?.message || 'System backup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!window.confirm("WARNING: Restoring the database will OVERWRITE all current data (users, students, chairmen, and audit logs) with the backup file data. Are you sure you want to proceed?")) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await api.post('/superadmin/restore');
      setToastType('success');
      setToastMessage(res.data.message || 'Database state successfully restored!');
      setLastAction({ type: 'restore', time: new Date() });
    } catch (err) {
      setToastType('error');
      setToastMessage(err.response?.data?.message || 'Database restore failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-8 animate-scale">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl">
        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-sans">
          System Backups & Recovery
        </h2>
        <p className="text-sm text-slate-350 mt-2">
          Create snapshots of the application database or revert state using previous local JSON backup instances.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Backup Card */}
        <div className="p-6 rounded-3xl glass-card border shadow-lg space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-royal">
              <Download size={24} />
              <h3 className="text-lg font-bold font-sans">Database Backup</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Export all system collections into a structured JSON backup snapshot. The snapshot is securely archived in the server local directory: <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-950 font-mono text-[10px]">./backups/database_backup.json</code>.
            </p>
            <div className="p-4 rounded-2xl bg-royal/5 border border-royal/10 flex items-start space-x-2 text-xs text-royal">
              <CheckCircle size={16} className="mt-0.5 shrink-0" />
              <span>Includes: Users directory, Student profiles, Chairmen profiles, Wing metrics, and Audit records.</span>
            </div>
          </div>
          
          <button
            onClick={handleBackup}
            disabled={loading}
            className="w-full bg-royal hover:bg-royal-dark text-white py-3 rounded-2xl font-bold text-sm shadow hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 mt-6"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Download size={16} />}
            <span>Generate Backup Snapshot</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="p-6 rounded-3xl glass-card border shadow-lg space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-amber-500">
              <Upload size={24} />
              <h3 className="text-lg font-bold font-sans">Database Recovery</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Restore the state of the database from the local backup snapshot file. This will rebuild all collections and clear out any current entries that are newer than the snapshot.
            </p>
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start space-x-2 text-xs text-amber-600">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>CAUTION: Performing a system restore will overwrite all accounts, student data, and transactions added since the last backup.</span>
            </div>
          </div>
          
          <button
            onClick={handleRestore}
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-2xl font-bold text-sm shadow hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 mt-6"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} />}
            <span>Restore From Local Backup</span>
          </button>
        </div>
      </div>

      {/* Activity Log / Status */}
      {lastAction && (
        <div className="p-6 rounded-3xl glass-card border shadow-lg space-y-4 animate-scale">
          <h4 className="text-sm font-bold font-sans flex items-center space-x-2 text-slate-800 dark:text-white">
            <FileText size={16} className="text-cyan" />
            <span>Console Action Summary</span>
          </h4>
          <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-500/5">
            <span className="font-semibold text-slate-600 dark:text-slate-400 uppercase">
              Action: {lastAction.type.toUpperCase()}
            </span>
            <span className="text-slate-450 font-mono">
              Timestamp: {lastAction.time.toLocaleTimeString()} ({lastAction.time.toLocaleDateString()})
            </span>
          </div>
        </div>
      )}

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

export default Backups;
