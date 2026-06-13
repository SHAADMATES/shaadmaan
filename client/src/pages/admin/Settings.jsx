import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../../context/AuthContext';
import { Settings, Shield, Save, CheckCircle2, AlertCircle, Eye, Moon, Sun, Monitor, Upload } from 'lucide-react';
import Toast from '../../components/Toast';

const SettingsPage = () => {
  const { darkMode, toggleDarkMode } = useAuth();
  
  // Organization settings
  const [orgName, setOrgName] = useState(localStorage.getItem('orgName') || 'Shaad-Mates Website');
  const [orgLogo, setOrgLogo] = useState(localStorage.getItem('orgLogo') || '🎓');
  const [orgEmail, setOrgEmail] = useState(localStorage.getItem('orgEmail') || 'admin@shaadmates.com');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [errorMsg, setErrorMsg] = useState('');

  // Load settings from backend database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        if (res.data) {
          setOrgName(res.data.orgName || 'Shaad-Mates Website');
          setOrgLogo(res.data.orgLogo || '🎓');
          setOrgEmail(res.data.orgEmail || 'admin@shaadmates.com');
          setSignatureUrl(res.data.signatureUrl || '');
          
          // Sync to localStorage
          localStorage.setItem('orgName', res.data.orgName || 'Shaad-Mates Website');
          localStorage.setItem('orgLogo', res.data.orgLogo || '🎓');
          localStorage.setItem('orgEmail', res.data.orgEmail || 'admin@shaadmates.com');
          localStorage.setItem('signatureUrl', res.data.signatureUrl || '');
        }
      } catch (err) {
        console.error('Failed to load settings from DB:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      setUploading(true);
      setErrorMsg('');
      try {
        const res = await api.post('/admin/upload', { image: reader.result });
        setSignatureUrl(res.data.url);
        setToastType('success');
        setToastMessage('Signature uploaded successfully. Save settings to apply.');
      } catch (err) {
        setErrorMsg('Failed to upload signature image.');
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Save settings to backend DB
      await api.post('/admin/settings', {
        orgName,
        orgLogo,
        orgEmail,
        signatureUrl
      });

      // 2. Save/sync to local storage for local templates compatibility
      localStorage.setItem('orgName', orgName);
      localStorage.setItem('orgLogo', orgLogo);
      localStorage.setItem('orgEmail', orgEmail);
      localStorage.setItem('signatureUrl', signatureUrl);

      // Save password if provided
      if (password) {
        if (password !== confirmPassword) {
          setErrorMsg('Passwords do not match.');
          setLoading(false);
          return;
        }
        
        // Change admin password in backend
        await api.put('/auth/change-password', { newPassword: password });
      }

      setToastType('success');
      setToastMessage('System settings and credentials successfully updated!');
      setPassword('');
      setConfirmPassword('');
      
      // Dispatch storage event to update logo/title in navbar/sidebar in real-time
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to update system settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8 animate-scale">
      <div className="glass-card border rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Settings className="text-royal animate-spin-slow" />
          <h3 className="text-lg font-bold font-sans">Advanced Website Console</h3>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center">
            <AlertCircle size={14} className="mr-2" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          {/* General Branding Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Institution Branding</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Institution Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                  placeholder="e.g. Shaad-Mates Academy"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Branding Icon / Logo Emoji</label>
                <input
                  type="text"
                  value={orgLogo}
                  onChange={(e) => setOrgLogo(e.target.value)}
                  className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                  placeholder="e.g. 🎓"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-500">Contact Email (Gmail)</label>
                <input
                  type="email"
                  value={orgEmail}
                  onChange={(e) => setOrgEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                  placeholder="admin@institution.com"
                />
              </div>

              {/* Signature Upload */}
              <div className="space-y-2 sm:col-span-2 border-t border-slate-100 dark:border-slate-850 pt-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Authorized Signature</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border dark:border-slate-800">
                  <div className="w-full sm:w-1/2 space-y-1">
                    <label className="text-xs font-semibold text-slate-500 block">Upload Signature Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-royal/10 file:text-royal dark:file:bg-cyan/10 dark:file:text-cyan hover:file:bg-royal/20"
                    />
                    <p className="text-[10px] text-slate-450 mt-1">Recommended size: 300x100px. Transparent PNG is preferred.</p>
                  </div>
                  <div className="w-full sm:w-1/2 flex flex-col items-center justify-center border-2 border-dashed dark:border-slate-800 rounded-xl p-2 min-h-[90px] bg-white dark:bg-slate-950">
                    {uploading ? (
                      <span className="text-xs text-slate-450 animate-pulse">Uploading signature...</span>
                    ) : signatureUrl ? (
                      <div className="relative group flex flex-col items-center">
                        <img src={signatureUrl} alt="Signature Preview" className="max-h-[60px] object-contain" />
                        <button
                          type="button"
                          onClick={() => setSignatureUrl('')}
                          className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 text-[8px] hover:scale-110 transition-all w-4 h-4 flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No Signature Uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Theme customizer */}
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interface Display Settings</h4>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border dark:border-slate-800">
              <div>
                <p className="font-semibold text-slate-700 dark:text-slate-200">Dark Theme Mode</p>
                <p className="text-[11px] text-slate-450 mt-0.5">Toggle light/dark layout presentation settings</p>
              </div>
              <button
                type="button"
                onClick={toggleDarkMode}
                className="p-3 bg-white dark:bg-slate-950 text-slate-800 dark:text-cyan rounded-xl border hover:scale-105 transition-all shadow-md"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>

          {/* Security Credentials */}
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-850 pt-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Shield size={14} />
              <span>Change Security Password</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                  placeholder="Leave blank to keep current"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-royal hover:bg-royal-dark text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center glow-blue"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={16} className="mr-1.5" /> Save Configuration
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card border rounded-3xl p-6 shadow-md text-xs space-y-2">
        <h4 className="font-bold text-slate-400 uppercase tracking-wider">System Information</h4>
        <div className="divide-y divide-slate-100 dark:divide-slate-850">
          <div className="py-2 flex justify-between">
            <span className="text-slate-500">System Name</span>
            <span className="font-semibold">Shaad-Mates ERP Website</span>
          </div>
          <div className="py-2 flex justify-between">
            <span className="text-slate-500">Version</span>
            <span className="font-semibold">2.1.0 (Advanced Edition)</span>
          </div>
          <div className="py-2 flex justify-between">
            <span className="text-slate-500">Database Connection</span>
            <span className="font-semibold text-emerald-500">Online</span>
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

export default SettingsPage;
