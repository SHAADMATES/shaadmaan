import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Award, Download, ShieldCheck, Printer, X, Medal, Sparkles, FileText, QrCode, CheckCircle2 } from 'lucide-react';
import Toast from '../../components/Toast';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState('');
  const [downloading, setDownloading] = useState(false);

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
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('certificate-print-area');
    if (!element) return;

    setDownloading(true);
    setToastType('info');
    setToastMessage('Rendering high-resolution A4 PDF... Please wait.');

    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      // Capture at 3.0x scale for crystal-clear DPI
      const canvas = await html2canvas(element, {
        scale: 3.0,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Standard ISO A4 Landscape in millimeters: 297mm x 210mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 297
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 210

      const canvasRatio = canvas.width / canvas.height;
      const pdfRatio = pdfWidth / pdfHeight;
      
      let finalWidth = pdfWidth;
      let finalHeight = pdfHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > pdfRatio) {
        finalHeight = pdfWidth / canvasRatio;
        offsetY = (pdfHeight - finalHeight) / 2;
      } else {
        finalWidth = pdfHeight * canvasRatio;
        offsetX = (pdfWidth - finalWidth) / 2;
      }

      pdf.addImage(imgData, 'PNG', offsetX, offsetY, finalWidth, finalHeight);
      pdf.save(`ShaadMates-Certificate-${selectedCert?.certificateId || 'credential'}.pdf`);

      setToastType('success');
      setToastMessage('High-resolution Certificate PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      setToastType('error');
      setToastMessage('Failed to generate certificate PDF.');
    } finally {
      setDownloading(false);
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
    <div className="p-6 space-y-8 animate-scale">
      {/* Top Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-navy to-royal text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 w-fit px-3 py-1 rounded-full border border-amber-500/30">
            <Sparkles size={12} />
            <span>Official Academic Credentials</span>
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight font-sans">
            My Achievements & Certificates
          </h2>
          <p className="text-sm md:text-base text-slate-300 max-w-2xl font-light">
            All your official merit awards and rank certificates are permanently archived here. Download them in high-definition A4 PDF format or verify authenticity online.
          </p>
        </div>
      </div>

      {/* Grid of Certificates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.length === 0 ? (
          <div className="col-span-full p-16 text-center rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 space-y-3">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
              <Award size={32} />
            </div>
            <h3 className="text-lg font-bold">No Certificates Issued Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              As soon as your program results are published and approved by administrators, your verified certificates will appear here instantly.
            </p>
          </div>
        ) : (
          certificates.map((cert) => (
            <div
              key={cert._id}
              className="stat-badge-glow glass-card-hover rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between space-y-6 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center space-x-1">
                    <Medal size={13} className="mr-1" />
                    <span>{cert.position} Place Winner</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                    {cert.certificateId || 'VERIFIED'}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white leading-snug">
                    {cert.programId?.title || 'Program Event'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center">
                    <span className="font-bold text-royal mr-1">{cert.programId?.wing || 'Wing'}</span> • {cert.programId?.date ? new Date(cert.programId.date).toLocaleDateString() : 'Issued Academic Year'}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 flex items-center justify-between">
                <div className="flex items-center text-xs text-emerald-600 font-bold">
                  <ShieldCheck size={15} className="mr-1.5 shrink-0" />
                  <span>Verified Gold Seal</span>
                </div>
                <button
                  onClick={() => openCertificate(cert)}
                  className="px-4 py-2 bg-royal hover:bg-royal-dark text-white rounded-2xl text-xs font-bold transition-all shadow-md glow-blue flex items-center space-x-1.5"
                >
                  <FileText size={13} />
                  <span>View Certificate</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Elegant Preview & High-Res PDF Download Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto print:static print:bg-white print:p-0 print:m-0 print:block">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden print:border-none print:shadow-none print:w-full print:max-w-none my-8">
            {/* Close Button */}
            <button
              onClick={closeCertificate}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-700 transition-all print:hidden"
            >
              <X size={20} />
            </button>

            {/* Certificate Print Area Container */}
            <div className="overflow-x-auto flex justify-center p-4 bg-slate-900/10 rounded-3xl">
              <div 
                id="certificate-print-area" 
                className="relative p-12 text-center overflow-hidden bg-white text-slate-900 font-sans border-[16px] border-double border-amber-600/90 shadow-2xl shrink-0 flex flex-col justify-between"
                style={{ width: '1000px', height: '707px', margin: '0 auto' }}
              >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
                  <span className="text-9xl font-serif font-black tracking-widest text-slate-900 -rotate-12">
                    EXCELLENCE
                  </span>
                </div>

                {/* Decorative Corner Filigree */}
                <div className="absolute top-4 left-4 w-14 h-14 border-t-4 border-l-4 border-amber-600/80" />
                <div className="absolute top-4 right-4 w-14 h-14 border-t-4 border-r-4 border-amber-600/80" />
                <div className="absolute bottom-4 left-4 w-14 h-14 border-b-4 border-l-4 border-amber-600/80" />
                <div className="absolute bottom-4 right-4 w-14 h-14 border-b-4 border-r-4 border-amber-600/80" />

                {/* Institution Header & Seal */}
                <div className="relative z-10 flex flex-col items-center justify-center space-y-1">
                  <div className="flex items-center space-x-3">
                    <span className="text-4xl">🎓</span>
                    <span className="text-3xl font-black font-serif tracking-widest text-slate-900 uppercase">
                      ACADEMIC EXCELLENCE ACADEMY
                    </span>
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.3em] font-extrabold text-amber-700">
                    Official Merit & Achievement Credential
                  </p>
                </div>

                {/* Title */}
                <div className="relative z-10 space-y-2">
                  <h1 className="text-5xl font-black tracking-tight font-serif text-slate-900 uppercase">
                    Certificate of Merit
                  </h1>
                  <div className="w-56 h-1.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-2" />
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500 font-bold pt-1">
                    THIS IS TO CERTIFY WITH DISTINCTION THAT
                  </p>
                </div>

                {/* Student Name */}
                <div className="relative z-10 py-2 max-w-3xl mx-auto">
                  <p className="text-5xl font-extrabold text-slate-900 font-serif italic border-b-2 border-slate-300 pb-3 inline-block px-12 tracking-wide">
                    {selectedCert.studentId?.name || 'Authorized Member'}
                  </p>
                </div>

                {/* Citation & Program Details */}
                <div className="relative z-10 max-w-2xl mx-auto space-y-2.5 text-slate-700 text-sm leading-relaxed">
                  <p>
                    has demonstrated outstanding performance and achieved <strong className="text-amber-700 font-black text-lg underline decoration-amber-500/50">{selectedCert.position} Place Standing</strong> in the competitive event
                  </p>
                  <p className="font-black text-2xl text-slate-900 uppercase tracking-wide">
                    "{selectedCert.programId?.title || 'Program Event'}"
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    Conducted under the auspices of the <strong className="text-slate-800">{selectedCert.programId?.wing || 'Department'} Wing</strong> on {selectedCert.programId?.date ? new Date(selectedCert.programId.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Academic Session'}.
                  </p>
                </div>

                {/* Grade Classification Badge */}
                {selectedCert.grade && (
                  <div className="relative z-10 mx-auto w-fit px-6 py-1.5 rounded-full bg-slate-900 text-amber-300 font-extrabold text-xs uppercase tracking-widest shadow-lg">
                    Award Classification: Grade {selectedCert.grade}
                  </div>
                )}

                {/* Bottom Signatories & Gold Seal Box */}
                <div className="relative z-10 grid grid-cols-3 gap-6 pt-4 max-w-4xl mx-auto items-end border-t border-slate-200 w-full">
                  {/* Left: Signatory */}
                  <div className="flex flex-col items-center justify-end">
                    {signatureUrl ? (
                      <img src={signatureUrl} alt="Signature" className="max-h-12 object-contain mix-blend-multiply mb-1" />
                    ) : (
                      <div className="h-10 font-serif text-slate-800 italic text-base flex items-end justify-center mb-1 font-bold">
                        Principal Signatory
                      </div>
                    )}
                    <div className="w-full border-b border-slate-400" />
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest font-extrabold mt-1.5">Principal / Chairman</p>
                  </div>

                  {/* Center: Wax Seal Emblem */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-1 shadow-xl flex items-center justify-center text-white border-2 border-amber-300">
                      <div className="w-full h-full rounded-full border border-amber-200/40 flex flex-col items-center justify-center p-1 text-center">
                        <Sparkles size={14} className="mb-0.5" />
                        <span className="text-[7px] font-black uppercase tracking-tighter leading-tight">OFFICIAL GOLD SEAL</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Verification Serial & QR */}
                  <div className="flex flex-col items-center justify-end text-right">
                    <div className="flex items-center space-x-2 mb-1 justify-center w-full">
                      <QrCode size={24} className="text-slate-800" />
                      <div className="text-left font-mono text-[9px] text-slate-700 font-bold leading-tight">
                        <p>VERIFICATION ID:</p>
                        <p className="text-amber-700">{selectedCert.certificateId || 'VER-ACAD-2026'}</p>
                      </div>
                    </div>
                    <div className="w-full border-b border-slate-400" />
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest font-extrabold mt-1.5">Authenticity Registry</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Print & Download Actions */}
            <div className="flex items-center justify-between p-6 bg-slate-50 border-t border-slate-200 print:hidden">
              <div className="flex items-center space-x-2 text-xs text-slate-600 font-semibold">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>Verified Academic Credential Registry</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-slate-300 shadow-sm"
                >
                  <Printer size={15} />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Download size={15} className={downloading ? 'animate-bounce' : ''} />
                  <span>{downloading ? 'Generating High-Res PDF...' : 'Download A4 PDF'}</span>
                </button>
              </div>
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
