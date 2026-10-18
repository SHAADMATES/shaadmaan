import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import { Award, CheckCircle, XCircle, Search, RefreshCw, Eye, Sparkles, Filter, Download, Printer, X, QrCode, FileText } from 'lucide-react';
import Toast from '../../components/Toast';
import UniversalExport from '../../components/UniversalExport';

const ManageCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'approved', 'pending'
  const [selectedCert, setSelectedCert] = useState(null);
  const [signatureUrl, setSignatureUrl] = useState('');
  const [downloading, setDownloading] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchCertificatesAndSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/certificates');
      setCertificates(res.data);

      const settingsRes = await api.get('/results/settings');
      if (settingsRes.data && settingsRes.data.signatureUrl) {
        setSignatureUrl(settingsRes.data.signatureUrl);
      }
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to load certificates registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificatesAndSettings();
  }, []);

  const handleToggleApproval = async (certId, currentStatus) => {
    setActionLoadingId(certId);
    try {
      const newStatus = !currentStatus;
      await api.put(`/admin/certificates/${certId}/approve`, { approved: newStatus });
      
      setCertificates(prev => prev.map(c => c._id === certId ? { ...c, approved: newStatus } : c));
      
      setToastType('success');
      setToastMessage(newStatus ? 'Certificate approved successfully!' : 'Certificate approval revoked.');
    } catch (err) {
      setToastType('error');
      setToastMessage('Failed to update certificate approval.');
    } finally {
      setActionLoadingId(null);
    }
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

      const canvas = await html2canvas(element, {
        scale: 3.0,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

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
      setToastMessage('Certificate PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF Generation Error:', error);
      setToastType('error');
      setToastMessage('Failed to generate certificate PDF.');
    } finally {
      setDownloading(false);
    }
  };

  // Filters
  const filteredCerts = certificates.filter(c => {
    const matchesSearch = 
      c.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.programId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.certificateId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'approved' && c.approved) ||
      (statusFilter === 'pending' && !c.approved);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 animate-scale">
      {/* Header banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-royal via-indigo-600 to-cyan text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <span className="flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider bg-white/10 w-fit px-3 py-1 rounded-full border border-white/10">
            <Sparkles size={12} className="text-amber-300 animate-pulse" /> <span>Registry Control</span>
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-sans">
            Certificate Release Moderation & PDF Studio
          </h2>
          <p className="text-xs md:text-sm text-slate-200/90 max-w-2xl font-light">
            Authorize or hold academic merit certificates generated from program results. Preview exact vector/high-DPI layouts and download official verified PDFs directly from the admin panel.
          </p>
        </div>
      </div>

      {/* Control bar */}
      <div className="glass-card border rounded-2xl p-4 shadow-md flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-3.5 text-slate-450" />
          <input
            type="text"
            placeholder="Search by student, program, or cert ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-sm focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="flex items-center space-x-2">
            <Filter size={14} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-xs focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved Only</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>

          <UniversalExport
            data={filteredCerts.map(c => ({
              CertID: c.certificateId,
              Student: c.studentId?.name || 'Student',
              AdmissionNo: c.studentId?.admissionNumber || '',
              Program: c.programId?.title || 'Program',
              Wing: c.programId?.wing || 'Wing',
              Position: c.position,
              Status: c.approved ? 'Approved' : 'Pending',
              IssueDate: c.issueDate ? new Date(c.issueDate).toLocaleDateString() : 'N/A'
            }))}
            filename={`ShaadMates_Certificates_${new Date().toISOString().slice(0, 10)}`}
            label="Export Registry"
            title="Shaad Mates Certificate Moderation Registry"
            buttonClass="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs flex items-center transition-all shadow-sm"
          />

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center space-x-1"
            title="Print Certificates Registry"
          >
            <Printer size={13} />
            <span>Print</span>
          </button>

          <button
            onClick={fetchCertificatesAndSettings}
            className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 rounded-xl transition-all"
            title="Refresh registry"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Table grid */}
      <div className="glass-card border rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-royal" />
            Loading certificate records...
          </div>
        ) : filteredCerts.length === 0 ? (
          <div className="p-16 text-center text-slate-450 italic">
            No certificates match the filters. Publish program standings to generate certificates first.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-500/5 text-slate-400 font-bold border-b dark:border-slate-850">
                  <th className="p-4">Certificate ID</th>
                  <th className="p-4">Recipient Student</th>
                  <th className="p-4">Program & Wing</th>
                  <th className="p-4">Standing</th>
                  <th className="p-4">Date Issued</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {filteredCerts.map((cert) => (
                  <tr key={cert._id} className="hover:bg-slate-500/5 transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-slate-800 dark:text-slate-300">
                      {cert.certificateId}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-white">{cert.studentId?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-450 mt-0.5">{cert.studentId?.admissionNumber || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold">{cert.programId?.title || 'Unknown Event'}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{cert.programId?.wing || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        {cert.position} ({cert.grade || 'A'})
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      {cert.approved ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/15">
                          <CheckCircle size={10} className="mr-1" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/15">
                          <XCircle size={10} className="mr-1" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all"
                          title="Preview & Download PDF"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handleToggleApproval(cert._id, cert.approved)}
                          disabled={actionLoadingId === cert._id}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                            cert.approved 
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500' 
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600'
                          }`}
                        >
                          {actionLoadingId === cert._id ? (
                            <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto"></div>
                          ) : cert.approved ? (
                            'Revoke'
                          ) : (
                            'Approve'
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Elegant Preview & High-Res PDF Download Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto print:static print:bg-white print:p-0 print:m-0 print:block">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden print:border-none print:shadow-none print:w-full print:max-w-none my-8">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/10 hover:bg-slate-900/20 text-slate-700 transition-all print:hidden"
            >
              <X size={20} />
            </button>
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

                <div className="absolute top-4 left-4 w-14 h-14 border-t-4 border-l-4 border-amber-600/80" />
                <div className="absolute top-4 right-4 w-14 h-14 border-t-4 border-r-4 border-amber-600/80" />
                <div className="absolute bottom-4 left-4 w-14 h-14 border-b-4 border-l-4 border-amber-600/80" />
                <div className="absolute bottom-4 right-4 w-14 h-14 border-b-4 border-r-4 border-amber-600/80" />

                {/* Top Header */}
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
                    {selectedCert.studentId?.name || 'Student Name'}
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

                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-1 shadow-xl flex items-center justify-center text-white border-2 border-amber-300">
                      <div className="w-full h-full rounded-full border border-amber-200/40 flex flex-col items-center justify-center p-1 text-center">
                        <Sparkles size={14} className="mb-0.5" />
                        <span className="text-[7px] font-black uppercase tracking-tighter leading-tight">OFFICIAL GOLD SEAL</span>
                      </div>
                    </div>
                  </div>

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

            <div className="flex items-center justify-between p-6 bg-slate-50 border-t border-slate-200 print:hidden">
              <span className="text-xs text-slate-600 font-semibold">
                Verified Academic Layout (Exact A4 Landscape)
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-slate-300 shadow-sm"
                >
                  <Printer size={15} />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white text-xs font-bold transition-all shadow-lg hover:shadow-xl"
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

export default ManageCertificates;
