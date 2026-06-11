import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Shield, Save, CheckCircle } from 'lucide-react';
import Toast from '../../components/Toast';

const StudentProfile = () => {
  const { profileDetails, updateProfile } = useAuth();
  const [phone, setPhone] = useState(profileDetails?.phone || '');
  const [email, setEmail] = useState(profileDetails?.email || '');
  const [loading, setLoading] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateProfile({ phone, email });
    setLoading(false);

    if (res.success) {
      setToastType('success');
      setToastMessage('Contact profile updated successfully.');
    } else {
      setToastType('error');
      setToastMessage(res.error);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 animate-scale">
      <div className="glass-card border rounded-3xl p-6 shadow-xl space-y-6">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
          <User className="text-royal" />
          <h3 className="text-lg font-bold font-sans">My Account Profile</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Static details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-850/50">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Full Name</p>
              <p className="font-bold text-slate-850 dark:text-white mt-0.5">{profileDetails?.name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Student ID / Roll No</p>
              <p className="font-mono font-bold mt-0.5">{profileDetails?.studentId}</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Assigned Wing</p>
              <span className="inline-block mt-1 px-3 py-1 bg-cyan-light text-cyan dark:bg-cyan-950/20 dark:text-cyan-300 rounded-xl font-bold text-xs border border-cyan/10">
                {profileDetails?.wing}
              </span>
            </div>
          </div>

          {/* Editable Contacts */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Contact Coordinates</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 flex items-center">
                  <Phone size={12} className="mr-1" /> Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                  placeholder="e.g. 555-0102"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 flex items-center">
                  <Mail size={12} className="mr-1" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl"
                  placeholder="e.g. name@domain.com"
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
                  <Save size={16} className="mr-1.5" /> Save Contact Details
                </>
              )}
            </button>
          </div>
        </form>
      </div>

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

export default StudentProfile;
