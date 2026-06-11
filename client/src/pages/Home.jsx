import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { ArrowRight, Trophy, Users, ShieldCheck, Calendar, Search, Sparkles, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wings, setWings] = useState([]);
  const [certId, setCertId] = useState('');
  
  // Custom brand states
  const [orgName, setOrgName] = useState(localStorage.getItem('orgName') || 'Shaad-Mates WebSuite');
  const [orgLogo, setOrgLogo] = useState(localStorage.getItem('orgLogo') || '🎓');

  // Verification Results
  const [verifying, setVerifying] = useState(false);
  const [verifiedCert, setVerifiedCert] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const fetchWings = async () => {
      try {
        const res = await api.get('/results/wings/list');
        setWings(res.data);
      } catch (err) {
        console.error('Failed to load public wings data.', err);
      }
    };
    fetchWings();

    // Listen to storage changes to update branding
    const handleStorageChange = () => {
      setOrgName(localStorage.getItem('orgName') || 'Shaad-Mates WebSuite');
      setOrgLogo(localStorage.getItem('orgLogo') || '🎓');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certId.trim()) {
      setToastType('error');
      setToastMessage('Please enter a Certificate ID.');
      return;
    }
    setVerifying(true);
    setVerifiedCert(null);
    try {
      const res = await api.get(`/results/certificate/verify/${certId.trim()}`);
      setVerifiedCert(res.data);
      setToastType('success');
      setToastMessage('Certificate is AUTHENTIC and verified!');
    } catch (err) {
      setToastType('error');
      setToastMessage(err.response?.data?.message || 'Certificate verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-dark text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-royal/10 dark:bg-royal/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan/10 dark:bg-cyan/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 md:px-12 glass-panel border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{orgLogo}</span>
          <span className="text-xl font-extrabold font-sans tracking-wide bg-gradient-to-r from-cyan to-royal bg-clip-text text-transparent">
            {orgName}
          </span>
        </div>
        <nav className="flex items-center space-x-6">
          <Link to="/about" className="text-sm font-bold text-slate-600 dark:text-slate-355 hover:text-royal transition-colors">About Us</Link>
          <Link to="/verify-certificate" className="text-sm font-bold text-slate-600 dark:text-slate-355 hover:text-royal transition-colors hidden sm:inline-block">Verify Certificate</Link>
          {user ? (
            <Link 
              to={
                user.role === 'super_admin' ? '/super/dashboard' :
                user.role === 'admin' ? '/admin/dashboard' : 
                user.role === 'wing_chairman' ? '/chairman/dashboard' : 
                user.role === 'treasurer' ? '/treasurer/dashboard' : '/student/dashboard'
              }
              className="text-xs font-bold bg-royal hover:bg-royal-dark text-white px-4 py-2.5 rounded-2xl transition-all shadow hover:shadow-lg flex items-center"
            >
              Console Desk <ArrowRight size={13} className="ml-1.5" />
            </Link>
          ) : (
            <Link 
              to="/login"
              className="text-xs font-bold bg-royal hover:bg-royal-dark text-white px-5 py-2.5 rounded-2xl transition-all shadow hover:shadow-lg flex items-center"
            >
              Sign In <ArrowRight size={13} className="ml-1.5" />
            </Link>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center px-6 md:px-12 py-16 text-center max-w-7xl mx-auto w-full space-y-16">
        
        {/* Banner Title */}
        <div className="space-y-6 max-w-4xl">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold bg-royal/10 text-royal dark:bg-royal/20 dark:text-cyan border border-royal/15 rounded-full uppercase tracking-wider animate-pulse">
            <Sparkles size={12} className="text-gold" /> <span>Next-Gen Academic ERP Suite</span>
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-slate-900 dark:text-white">
            Transforming Campus Activities With{' '}
            <span className="bg-gradient-to-r from-royal to-cyan bg-clip-text text-transparent">
              Shaad-Mates WebSuite
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Provision academic wings, run program scoreboards, log treasurer ledgers, and download verified achievement certificates in a secure environment.
          </p>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center items-center pt-4">
            <Link
              to={user ? '/student/dashboard' : '/login'}
              className="px-8 py-4 font-bold text-white bg-royal hover:bg-royal-dark rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-102 flex items-center glow-blue w-full sm:w-auto justify-center"
            >
              Enter Registration Portal <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link
              to="/verify-certificate"
              className="px-8 py-4 font-bold bg-white dark:bg-slate-800 border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-2xl transition-all shadow w-full sm:w-auto justify-center flex items-center"
            >
              Verify Certificate
            </Link>
          </div>
        </div>

        {/* Certificate Verification Box on Homepage */}
        <div className="w-full max-w-2xl p-6 rounded-3xl glass-card border shadow-xl space-y-6 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-royal/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-850 dark:text-white flex items-center space-x-1.5">
              <ShieldCheck size={18} className="text-royal" />
              <span>Instant Certificate Verifier</span>
            </h3>
            <p className="text-xs text-slate-450">Validate official credentials immediately without logging in.</p>
          </div>

          <form onSubmit={handleVerify} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Certificate ID (e.g. CERT-...)"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-royal/40 text-slate-800 dark:text-white font-mono"
            />
            <button
              type="submit"
              disabled={verifying}
              className="px-6 py-2.5 bg-royal text-white rounded-xl text-xs font-bold hover:bg-royal-dark shadow transition-all shrink-0"
            >
              {verifying ? 'Checking...' : 'Verify'}
            </button>
          </form>

          {/* Verification result snippet */}
          {verifiedCert && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-350 space-y-2 animate-scale">
              <p className="font-bold flex items-center">
                <CheckCircle2 size={14} className="mr-1 text-emerald-500" />
                <span>Verified Authentic Standing Certificate</span>
              </p>
              <p className="font-mono text-[10px]">ID: {verifiedCert.certificateId}</p>
              <p className="mt-1">
                Awarded to <strong className="font-bold text-slate-800 dark:text-white">{verifiedCert.studentId?.name}</strong> for securing{' '}
                <strong className="font-bold text-slate-800 dark:text-white">{verifiedCert.position} Place</strong> in{' '}
                <strong className="font-bold text-slate-800 dark:text-white">"{verifiedCert.programId?.title}"</strong> on{' '}
                {new Date(verifiedCert.programId?.date).toLocaleDateString()}.
              </p>
            </div>
          )}
        </div>

        {/* Wings showreel section */}
        <section className="space-y-6 w-full text-left">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Active Wing Departments</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Collaborating nodes directing specialized student portfolios.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {wings.length === 0 ? (
              // Seeded fallback designs
              ['Red Wing', 'Blue Wing', 'Green Wing', 'Yellow Wing'].map((name, i) => (
                <div key={i} className="p-6 rounded-3xl glass-card border hover-scale flex flex-col justify-between h-48">
                  <div className="space-y-2">
                    <span className="text-2xl">⚡</span>
                    <h4 className="font-bold text-slate-850 dark:text-white">{name}</h4>
                  </div>
                  <span className="text-[10px] text-slate-400">Awaiting configuration settings...</span>
                </div>
              ))
            ) : (
              wings.map((wing) => (
                <div key={wing._id} className="p-6 rounded-3xl glass-card border hover-scale flex flex-col justify-between h-56 space-y-4 shadow-sm border-slate-200/50">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-2xl bg-royal/10 border text-royal flex items-center justify-center shrink-0 overflow-hidden">
                      {wing.logo ? (
                        <img src={wing.logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        wing.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-850 dark:text-white">{wing.name}</h4>
                      <p className="text-[10px] text-slate-450 italic font-mono mt-0.5">@{wing.chairmanId?.userId?.username || 'access'}</p>
                    </div>
                  </div>
                  
                  <div className="border-t dark:border-slate-850 pt-3 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Chairman:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{wing.chairmanId?.name || 'Unassigned'}</span>
                    </div>
                    {wing.chairmanId?.assistantName && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Assistant:</span>
                        <span className="font-medium text-slate-650 dark:text-slate-300">{wing.chairmanId.assistantName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Feature widgets */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full text-left">
          <div className="p-6 rounded-3xl glass-card border hover-scale shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-royal/10 flex items-center justify-center mb-4 text-royal">
              <Trophy size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Score & Position Tracking</h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Verify credentials instantly using the certificate IDs issued to top event performers.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card border hover-scale shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-cyan/10 flex items-center justify-center mb-4 text-cyan">
              <Users size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Wing Activities</h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Segmented programs run by dedicated wing chairmen promoting leadership and collaboration.
            </p>
          </div>

          <div className="p-6 rounded-3xl glass-card border hover-scale shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4 text-gold-dark">
              <Calendar size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Ledger Posting</h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Record sponsor donations, event printing, stage setups, and generate quarterly balances.
            </p>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 px-6 md:px-12 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} {orgName}. All rights reserved.</p>
      </footer>

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

export default Home;
