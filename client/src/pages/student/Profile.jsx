import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Shield, Save, CheckCircle, CreditCard, Sparkles, GraduationCap } from 'lucide-react';
import Toast from '../../components/Toast';
import StudentIdCard from '../../components/StudentIdCard';

const StudentProfile = () => {
  const { profileDetails, updateProfile } = useAuth();
  const [phone, setPhone] = useState(profileDetails?.phone || '');
  const [email, setEmail] = useState(profileDetails?.email || '');
  const [loading, setLoading] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);

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
      setToastMessage(res?.error || 'Failed to update profile coordinates.');
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-scale">
      {/* Top Banner with ID Card Button */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-navy to-royal text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-2xl text-slate-950 shadow-lg border-2 border-white/20">
            {profileDetails?.photo ? (
              <img src={profileDetails.photo} alt="" className="w-full h-full object-cover rounded-xl" />
            ) : (
              profileDetails?.name?.charAt(0)?.toUpperCase() || 'S'
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black font-sans tracking-tight">{profileDetails?.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active Student
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-0.5">ID: {profileDetails?.studentId} • Wing: {profileDetails?.wing}</p>
          </div>
        </div>

        <button
          onClick={() => setShowIdCard(true)}
          className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black rounded-2xl text-xs transition-all shadow-xl flex items-center space-x-2 shrink-0 group glow-amber"
        >
          <CreditCard size={16} className="group-hover:scale-110 transition-transform" />
          <span>View & Download ID Card</span>
        </button>
      </div>

      {/* Main Form Dossier */}
      <div className="stat-badge-glow glass-card border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <User className="text-royal" size={20} />
            <h3 className="text-lg font-black font-sans text-slate-900 dark:text-white">My Account Profile & Credentials</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium flex items-center space-x-1">
            <Shield size={13} className="text-emerald-500" />
            <span>256-bit AES Protected</span>
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          {/* Static details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800/80">
            <div>
              <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Full Legal Name</p>
              <p className="font-extrabold text-slate-900 dark:text-white mt-1 text-base">{profileDetails?.name || 'Loading...'}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Admission Roll No</p>
              <p className="font-mono font-black text-royal dark:text-cyan mt-1 text-base">{profileDetails?.studentId || 'ADM-N/A'}</p>
            </div>
            <div className="col-span-1 sm:col-span-2 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Assigned Wing / Cohort</p>
                <span className="inline-flex items-center space-x-1.5 mt-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-500 to-royal text-white rounded-xl font-extrabold text-xs shadow-sm">
                  <GraduationCap size={13} />
                  <span>{profileDetails?.wing || 'General Wing'}</span>
                </span>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Portal Username</p>
                <p className="font-mono font-bold text-slate-700 dark:text-slate-200 mt-1">@{profileDetails?.username || 'student'}</p>
              </div>
            </div>
          </div>

          {/* Editable Contacts */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Contact Coordinates (Editable)</span>
              <span className="text-[11px] text-royal font-semibold">Keep current for emergency SMS notices</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center">
                  <Phone size={13} className="mr-1.5 text-emerald-500" /> Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-royal/30 transition-all"
                  placeholder="+1 (555) 019-2831"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center">
                  <Mail size={13} className="mr-1.5 text-royal" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-xs focus:outline-none focus:ring-2 focus:ring-royal/30 transition-all"
                  placeholder="student@shaadmates.edu"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-royal to-cyan hover:opacity-95 text-white font-extrabold rounded-2xl transition-all shadow-lg glow-blue flex items-center justify-center text-xs"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={15} className="mr-1.5" /> Save Contact Details
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Digital ID Card Modal */}
      {showIdCard && (
        <StudentIdCard
          profileDetails={profileDetails}
          onClose={() => setShowIdCard(false)}
        />
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

export default StudentProfile;
