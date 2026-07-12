import React, { useState } from 'react';
import { Download, Printer, Shield, QrCode, Sparkles, X, CheckCircle2 } from 'lucide-react';
import Toast from '../components/Toast';

const StudentIdCard = ({ profileDetails, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const handleDownload = async () => {
    const element = document.getElementById('student-id-card-print');
    if (!element) return;

    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, {
        scale: 3.0,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `ShaadMates-IDCard-${profileDetails?.studentId || 'Member'}.png`;
      link.click();

      setToastType('success');
      setToastMessage('High-DPI Digital ID Card downloaded successfully!');
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to download ID Card image.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto print:static print:bg-white print:p-0 print:m-0 print:block animate-scale">
      <div className="relative max-w-md w-full bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden print:border-none print:shadow-none my-8">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all print:hidden"
          >
            <X size={18} />
          </button>
        )}

        {/* Printable Card Area */}
        <div
          id="student-id-card-print"
          className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-navy to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border-[8px] border-double border-amber-500/70 shadow-2xl m-3"
          style={{ width: '100%', maxWidth: '380px', margin: '0 auto' }}
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-royal/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-44 h-44 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

          {/* Card Top Header */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center pb-4 border-b border-white/15 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎓</span>
              <span className="text-sm font-black tracking-widest font-serif uppercase text-amber-300">
                {localStorage.getItem('orgName') || 'SHAAD-MATES ACADEMY'}
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.25em] font-extrabold text-slate-300">
              Official Identity Card & Security Badge
            </span>
          </div>

          {/* Student Avatar & Wing Chip */}
          <div className="relative z-10 py-6 flex flex-col items-center justify-center space-y-3">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-royal to-cyan p-1 shadow-2xl border-2 border-amber-400">
                <div className="w-full h-full rounded-xl bg-slate-800 overflow-hidden flex items-center justify-center text-3xl font-black">
                  {profileDetails?.photo ? (
                    <img src={profileDetails.photo} alt={profileDetails?.name} className="w-full h-full object-cover" />
                  ) : (
                    profileDetails?.name?.charAt(0)?.toUpperCase() || 'S'
                  )}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shadow border border-amber-300 flex items-center space-x-1">
                <Sparkles size={9} />
                <span>VERIFIED</span>
              </div>
            </div>

            <div className="text-center pt-1">
              <h3 className="text-xl font-black font-serif text-white tracking-tight">{profileDetails?.name || 'Student Name'}</h3>
              <div className="inline-flex items-center space-x-1.5 mt-1 px-3 py-0.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-amber-300">
                <Shield size={12} />
                <span>{profileDetails?.wing || 'General Wing'}</span>
              </div>
            </div>
          </div>

          {/* Identity Matrix Details */}
          <div className="relative z-10 bg-black/30 rounded-2xl p-4 border border-white/10 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Admission ID:</span>
              <span className="font-mono font-black text-amber-400">{profileDetails?.studentId || 'ADM-2026-001'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Portal Username:</span>
              <span className="font-mono font-bold text-white">@{profileDetails?.username || 'user_portal'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Contact Email:</span>
              <span className="text-slate-300 truncate max-w-[160px]">{profileDetails?.email || 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-semibold">Valid Thru:</span>
              <span className="font-bold text-emerald-400">MAY 2028</span>
            </div>
          </div>

          {/* Barcode & Signature Footer */}
          <div className="relative z-10 pt-5 mt-4 border-t border-white/15 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <QrCode size={34} className="text-white p-1 bg-white/10 rounded-lg" />
              <div className="text-[8px] font-mono text-slate-400 leading-tight">
                <p className="font-bold text-white">CRYPTO-SIGNATURE</p>
                <p>SM-SEC-9982-A1</p>
              </div>
            </div>

            <div className="text-right">
              <div className="font-serif italic text-xs text-amber-300 font-bold">Dr. F. Rahman</div>
              <p className="text-[7px] text-slate-400 uppercase tracking-widest font-extrabold mt-0.5">Chairman Signatory</p>
            </div>
          </div>
        </div>

        {/* Action Controls Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
            <CheckCircle2 size={14} />
            <span>Active Digital Badge</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg"
            >
              <Download size={13} className={downloading ? 'animate-bounce' : ''} />
              <span>{downloading ? 'Saving...' : 'Save PNG'}</span>
            </button>
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

export default StudentIdCard;
