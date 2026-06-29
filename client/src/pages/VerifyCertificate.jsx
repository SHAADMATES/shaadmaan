import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { Search, Award, CheckCircle, XCircle, ShieldAlert, Sparkles, Printer } from 'lucide-react';
import Toast from '../components/Toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const VerifyCertificate = () => {
  const [certId, setCertId] = useState('');
  const [loading, setLoading] = useState(false);
  const [certData, setCertData] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState('');
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRes = await api.get('/results/settings');
        if (settingsRes.data && settingsRes.data.signatureUrl) {
          setSignatureUrl(settingsRes.data.signatureUrl);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certId.trim()) {
      setToastType('error');
      setToastMessage('Please enter a Certificate ID.');
      return;
    }

    setLoading(true);
    setCertData(null);

    try {
      const res = await api.get(`/results/certificate/verify/${certId.trim()}`);
      setCertData(res.data);
      setToastType('success');
      setToastMessage('Certificate verified successfully!');
    } catch (err) {
      setToastType('error');
      setToastMessage(err.response?.data?.message || 'Certificate verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    const element = document.getElementById('certificate-print-area');
    if (!element) return;

    setToastType('info');
    setToastMessage('Rendering high-quality PDF...');

    try {
      const canvas = await html2canvas(element, { scale: 2.5, useCORS: true, backgroundColor: '#ffffff', logging: false });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`certificate-${certData.certificateId}.pdf`);

      setToastType('success');
      setToastMessage('Certificate downloaded as PDF successfully!');
    } catch (error) {
      console.error(error);
      setToastType('error');
      setToastMessage('Failed to generate PDF.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-dark text-slate-800 dark:text-slate-100 transition-colors duration-300 printable-section">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-royal/10 dark:bg-royal/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan/10 dark:bg-cyan/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="no-print sticky top-0 z-30 flex items-center justify-between h-16 px-6 md:px-12 glass-panel border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🎓</span>
          <span className="text-xl font-bold font-sans tracking-wide bg-gradient-to-r from-cyan to-royal-light bg-clip-text text-transparent">
            Shaad-Mates Website
          </span>
        </div>
        <a href="/" className="text-sm font-semibold hover:text-royal transition-colors">
          Back to Home
        </a>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col items-center">
        {/* Form Container */}
        <div className="no-print w-full max-w-md text-center space-y-6 mb-8">
          <h2 className="text-3xl font-black font-sans leading-tight">
            Verify Certificate Authenticity
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter the unique Certificate ID to verify credentials and academic standings.
          </p>

          <form onSubmit={handleVerify} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="Enter Certificate ID (e.g., CERT-red-wing-...)"
                className="w-full pl-4 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-royal/40"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-royal hover:bg-royal-dark text-white font-bold rounded-2xl flex items-center transition-all shadow hover:scale-105 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Search size={16} className="mr-1.5" /> Verify
                </>
              )}
            </button>
          </form>
        </div>

        {/* Certificate Display Card */}
        {certData && (
          <div id="certificate-print-area" className="w-full max-w-2xl glass-card border rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center space-y-6 border-gold/30 glow-gold animate-scale">
            {/* Stamp / Decorative Borders */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 rounded-full blur-xl pointer-events-none"></div>
            
            {/* Verification Success Badge */}
            <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/30 text-xs font-extrabold uppercase tracking-widest shadow-sm">
              <CheckCircle size={14} /> <span>Authentic Certificate</span>
            </div>

            {/* Certificate Header */}
            <div className="text-center space-y-2">
              <span className="text-4xl">🎓</span>
              <h3 className="text-xl font-bold uppercase tracking-wider text-slate-400">Certificate of Achievement</h3>
              <p className="text-xs text-slate-400">Shaad-Mates Academic Website Registry</p>
            </div>

            {/* Body */}
            <div className="text-center space-y-4 max-w-lg">
              <p className="text-slate-500 italic text-sm">This certifies that</p>
              <p className="text-2xl font-black font-sans text-slate-800 dark:text-white border-b-2 border-slate-200 dark:border-slate-800 pb-2 px-8 inline-block">
                {certData.studentId?.name}
              </p>
              <p className="text-xs text-slate-400 font-mono mt-1">Roll ID: {certData.studentId?.studentId} | Class: {certData.studentId?.class}</p>

              <p className="text-slate-500 italic text-sm mt-6">has successfully secured the</p>
              <p className="text-xl font-extrabold text-royal dark:text-cyan uppercase tracking-wide">
                {certData.position}
              </p>
              <p className="text-slate-500 italic text-sm">in the program</p>
              <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                "{certData.programId?.title}"
              </p>

              <p className="text-xs text-slate-400 mt-2">
                Conducted on {new Date(certData.programId?.date).toLocaleDateString()} at {certData.programId?.venue}.
              </p>
            </div>

            {/* Footer Signatures */}
            <div className="w-full grid grid-cols-2 gap-8 pt-8 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs font-semibold text-slate-500 items-end">
              <div className="space-y-1 text-left">
                <p className="font-mono text-[10px] text-slate-400">Verification ID: {certData.certificateId}</p>
                <p className="text-[10px] text-slate-400">Issue Date: {new Date(certData.issueDate).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1 flex flex-col items-center justify-end h-16">
                {signatureUrl ? (
                  <img src={signatureUrl} alt="Signature" className="max-h-10 object-contain mix-blend-multiply mb-1" />
                ) : (
                  <span className="flex items-center text-gold-dark font-sans text-xs mb-1">
                    <Sparkles size={12} className="mr-1" /> Official Registry
                  </span>
                )}
                <div className="w-24 border-b border-slate-200 dark:border-slate-700"></div>
                <p className="text-[10px] text-slate-400 mt-1">Shaad-Mates Admin Board</p>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="no-print px-5 py-2.5 bg-slate-850 hover:bg-slate-700 text-white rounded-xl text-xs font-bold flex items-center transition-all shadow"
            >
              <Printer size={14} className="mr-1.5" /> Print Certificate
            </button>
          </div>
        )}
      </main>

      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage('')}
        />
      )}

      {/* Custom print styling */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          header {
            display: none !important;
          }
          .printable-section {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .glass-card {
            border: 2px solid #000 !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 40px !important;
            margin-top: 100px !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
      `}} />
    </div>
  );
};

export default VerifyCertificate;
