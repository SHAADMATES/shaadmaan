import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Award, Download, ShieldCheck, Printer, X, Medal, Sparkles, FileText } from 'lucide-react';
import Toast from '../../components/Toast';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const fetchCertificatesAndSettings = async () => {
      try {
        const res = await api.get('/student/certificates');
        setCertificates(res.data);

        // Fetch settings for signature image
        const settingsRes = await api.get('/results/settings');
        if (settingsRes.data && settingsRes.data.signatureUrl) {
          setSignatureUrl(settingsRes.data.signatureUrl);
        }
      } catch (err) {
        setToastType('error');
        setToastMessage('Failed to load certificates index.');
      } finally {
        setLoading(false);
      }
    };
    fetchCertificatesAndSettings();
  }, []);

  const openCertificate = (cert) => {
    setSelectedCert(cert);
  };

  const closeCertificate = () => {
    setSelectedCert(null);
  };

  const handlePrint = () => {
    handleDownloadPDF();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('certificate-print-area');
    if (!element) return;

    setToastType('info');
    setToastMessage('Rendering high-quality PDF...');

    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      // Run html2canvas to capture the certificate container
      const canvas = await html2canvas(element, {
        scale: 2.5, // High resolution scaling
        useCORS: true, // Support loading signature image on canvas
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Initialize Landscape PDF with identical aspect ratio
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`certificate-${selectedCert.certificateId}.pdf`);

      setToastType('success');
      setToastMessage('Certificate downloaded as PDF successfully!');
    } catch (error) {
      console.error(error);
      setToastType('error');
      setToastMessage('Failed to generate and download certificate PDF.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-40 rounded-3xl animate-shimmer"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-48 rounded-3xl animate-shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 animate-scale print:p-0">
      {/* Header Banner - hidden in print */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-royal via-royal-light to-cyan text-white shadow-xl relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <span className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
            <Medal size={12} className="text-gold animate-bounce" /> <span>Achievements Portal</span>
          </span>
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight font-sans">
            My Earned Certificates
          </h2>
          <p className="text-sm md:text-base text-slate-200/95 max-w-2xl font-light">
            Congratulations on your accomplishments! Access, print, or download your official merit certificates for the programs you won.
          </p>
        </div>
      </div>

      {/* Grid of Certificates - hidden in print */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
        {certificates.length === 0 ? (
          <div className="col-span-full text-center py-12 glass-card border rounded-3xl p-6 text-slate-400 italic text-sm">
            You haven't earned any certificates yet. Keep participating and win standings to achieve them!
          </div>
        ) : (
          certificates.map((cert) => (
            <div 
              key={cert._id} 
              className="p-6 rounded-3xl glass-card border hover-scale shadow flex flex-col justify-between space-y-4 cursor-pointer"
              onClick={() => openCertificate(cert)}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-gold-dark">
                    <Award size={24} />
                  </div>
                  <span className="text-[10px] font-mono text-slate-450 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full border">
                    {cert.certificateId}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-white truncate">
                    {cert.programId?.title || 'Unknown Event'}
                  </h3>
                  <p className="text-xs text-slate-450 mt-1">{cert.programId?.wing || 'Wing Event'}</p>
                </div>
                <div className="flex items-center space-x-3 pt-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/15 text-gold-dark border border-gold/25">
                    {cert.position} Place
                  </span>
                  {cert.grade && (
                    <span className="text-xs font-semibold text-slate-450">
                      Grade {cert.grade}
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/40 pt-4 flex items-center justify-between text-xs text-royal font-semibold">
                <span>View & Print Credential</span>
                <Download size={14} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Elegant Preview Certificate Overlay Modal - visible in print too if active! */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm print:static print:bg-white print:backdrop-blur-none">
          {/* Print container */}
          <div className="relative w-full max-w-3xl mx-4 bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 space-y-8 overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none">
            {/* Close Button - hidden in print */}
            <button
              onClick={closeCertificate}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all print:hidden"
            >
              <X size={20} />
            </button>

            {/* Certificate Aesthetic Layout */}
            <div 
              id="certificate-print-area" 
              className="border-[12px] border-double border-slate-900 p-8 md:p-12 text-center space-y-6 relative bg-slate-50/50 print:bg-transparent"
            >
              {/* Decorative Corner Ornaments */}
              <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-slate-900"></div>
              <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-slate-900"></div>
              <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-slate-900"></div>
              <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-slate-900"></div>

              {/* Institution Seal */}
              <div className="flex justify-center items-center space-x-2">
                <span className="text-4xl">🎓</span>
                <span className="text-xl font-bold font-sans tracking-wide text-slate-800 uppercase">
                  {localStorage.getItem('orgName') || 'Shaad-Mates Website'}
                </span>
              </div>

              {/* Certificate title */}
              <div className="space-y-1">
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight font-serif text-slate-900">
                  Certificate of Achievement
                </h1>
                <p className="text-xs uppercase tracking-widest text-slate-550 font-bold mt-2">
                  This credential certifies that
                </p>
              </div>

              {/* Student Name */}
              <div className="space-y-1 py-4 border-b border-slate-200 max-w-md mx-auto">
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900 font-serif italic">
                  {selectedCert.studentId?.name || 'Authorized Member'}
                </p>
              </div>

              {/* Achievement Content Text */}
              <div className="max-w-xl mx-auto space-y-2 text-slate-700 text-sm md:text-base leading-relaxed">
                <p>
                  has successfully achieved <strong className="text-amber-600 font-bold">{selectedCert.position} Place</strong> standing in
                </p>
                <p className="font-bold text-lg text-slate-900">
                  {selectedCert.programId?.title || 'Unknown Event'}
                </p>
                <p className="text-xs text-slate-500">
                  conducted under the auspices of the {selectedCert.programId?.wing || 'Department'} on {selectedCert.programId?.date ? new Date(selectedCert.programId.date).toLocaleDateString() : 'Date'}.
                </p>
              </div>

              {/* Grade */}
              {selectedCert.grade && (
                <div className="inline-block px-4 py-1.5 rounded-full bg-slate-900 text-white font-bold text-xs uppercase tracking-wider">
                  Award Classification: Grade {selectedCert.grade}
                </div>
              )}

              {/* Signatures & Seal */}
              <div className="grid grid-cols-2 gap-8 pt-6 max-w-xl mx-auto items-end">
                <div className="space-y-1 flex flex-col items-center justify-end h-16">
                  {signatureUrl ? (
                    <img src={signatureUrl} alt="Signature" className="max-h-12 object-contain mix-blend-multiply mb-1" />
                  ) : (
                    <div className="h-6 font-serif text-slate-400 italic text-xs flex items-end justify-center mb-1">
                      Shaad-Mates Admin
                    </div>
                  )}
                  <div className="w-full border-b border-slate-350"></div>
                  <p className="text-[10px] text-slate-550 uppercase tracking-widest font-bold mt-1.5">Authorized Signatory</p>
                </div>
                <div className="space-y-1 flex flex-col items-center justify-end h-16">
                  <div className="h-6 font-mono text-[9px] text-slate-600 flex items-end justify-center mb-1">
                    ID: {selectedCert.certificateId}
                  </div>
                  <div className="w-full border-b border-slate-350"></div>
                  <p className="text-[10px] text-slate-555 uppercase tracking-widest font-bold mt-1.5">Verification Index ID</p>
                </div>
              </div>
            </div>

            {/* Print control and options - hidden in print */}
            <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-6 print:hidden">
              <span className="text-xs text-slate-400 flex items-center mr-auto">
                <ShieldCheck size={14} className="text-emerald-500 mr-1" /> Verified Authenticity
              </span>
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
              >
                <Printer size={14} />
                <span>Print Layout</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-2xl bg-royal text-white text-xs font-bold transition-all shadow hover:shadow-lg glow-blue"
              >
                <FileText size={14} />
                <span>Download PDF</span>
              </button>
            </div>
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

export default Certificates;
