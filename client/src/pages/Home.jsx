import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { 
  ArrowRight, 
  Trophy, 
  Users, 
  ShieldCheck, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Medal, 
  Award, 
  Star,
  Flame,
  TrendingUp,
  FolderKanban,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import ShaadMatesLogo from '../components/ShaadMatesLogo';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [wings, setWings] = useState([]);
  const [certId, setCertId] = useState('');
  
  // Top performers and leaderboards
  const [topPerformers, setTopPerformers] = useState([]);
  const [wingStandings, setWingStandings] = useState([]);
  const [loadingPerformers, setLoadingPerformers] = useState(true);

  // Custom brand states
  const [orgName, setOrgName] = useState(localStorage.getItem('orgName') || 'Shaad Mates');
  const [orgLogo, setOrgLogo] = useState(localStorage.getItem('orgLogo') || '🎓');

  // Verification Results
  const [verifying, setVerifying] = useState(false);
  const [verifiedCert, setVerifiedCert] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wingsRes, perfRes] = await Promise.all([
          api.get('/results/wings/list'),
          api.get('/results/top-performers').catch(() => ({ data: { topStudents: [], wingStandings: [] } }))
        ]);
        setWings(wingsRes.data || []);
        setTopPerformers(perfRes.data?.topStudents || []);
        setWingStandings(perfRes.data?.wingStandings || []);
      } catch (err) {
        console.error('Failed to load public landing data.', err);
      } finally {
        setLoadingPerformers(false);
      }
    };
    fetchData();

    // Listen to storage changes to update branding
    const handleStorageChange = () => {
      setOrgName(localStorage.getItem('orgName') || 'Shaad Mates');
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
    <div className="min-h-screen flex flex-col bg-[#050B14] text-slate-100 transition-colors duration-500 relative overflow-x-hidden font-sans">
      
      {/* --- Ultra Premium Animated Background --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-gradient-to-br from-[#0B3B8B]/20 to-[#00A3FF]/10 rounded-full blur-[120px] mix-blend-screen opacity-70 animate-blob"></div>
        <div className="absolute top-[30%] -right-[20%] w-[60vw] h-[60vw] bg-gradient-to-tl from-[#7C3AED]/20 to-[#FF0080]/10 rounded-full blur-[140px] mix-blend-screen opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] bg-gradient-to-tr from-[#00D1FF]/15 to-[#0B3B8B]/10 rounded-full blur-[150px] mix-blend-screen opacity-50 animate-blob animation-delay-4000"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* --- Glassmorphism Header --- */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-20 px-6 md:px-16 bg-[#050B14]/60 backdrop-blur-2xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-all duration-300">
        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
          <ShaadMatesLogo size="sm" variant="emblem" className="group-hover:scale-105 transition-transform" />
          <div className="flex flex-col text-left">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-200 bg-clip-text text-transparent group-hover:to-cyan-300 transition-all font-serif">
              Shaad Mates
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-400 leading-none">
              Islamic Educational Academy
            </span>
          </div>
        </div>
        <nav className="flex items-center space-x-8">
          <Link to="/about" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors tracking-wide hidden md:block">About Us</Link>
          <Link to="/verify-certificate" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors tracking-wide hidden sm:block">Verify Certificate</Link>
          {user ? (
            <Link 
              to={
                user.role === 'super_admin' ? '/super/dashboard' :
                user.role === 'admin' ? '/admin/dashboard' : 
                user.role === 'wing_chairman' ? '/chairman/dashboard' : 
                user.role === 'treasurer' ? '/treasurer/dashboard' : '/student/dashboard'
              }
              className="text-sm font-bold bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white px-6 py-2.5 rounded-full transition-all duration-300 flex items-center group"
            >
              Console Desk <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <Link 
              to="/login"
              className="text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white px-6 py-2.5 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] flex items-center group"
            >
              Sign In <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </nav>
      </header>

      {/* --- Main Content --- */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-6 md:px-12 pt-32 pb-24 text-center max-w-7xl mx-auto w-full">
        
        {/* Hero Section */}
        <div className="space-y-8 max-w-5xl mt-6 mb-20 animate-fade-in-up">
          <div className="flex flex-col items-center justify-center space-y-4">
            <ShaadMatesLogo size="hero" variant="full" className="drop-shadow-2xl hover:scale-105 transition-transform" />
            <span className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-cyan-400 rounded-full uppercase tracking-widest backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Sparkles size={14} className="text-yellow-400 animate-spin-slow" /> 
              <span>Open Campus Extramural ERP</span>
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight leading-[1.1] text-white drop-shadow-2xl">
            Elevate Academic & <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 animate-gradient-x">
              Extracurricular Glory
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-350 max-w-3xl mx-auto font-medium leading-relaxed mt-6 text-slate-400">
            A unified ecosystem for students and faculty. Experience open participation with zero registration friction, real-time standings, transparent treasury controls, and cryptographic credentials.
          </p>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center items-center pt-8">
            <Link
              to={user ? '/student/dashboard' : '/login'}
              className="w-full sm:w-auto px-10 py-4 font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] hover:-translate-y-1 flex items-center justify-center text-lg group"
            >
              Enter Portal <ArrowRight size={20} className="ml-3 group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link
              to="/about"
              className="w-full sm:w-auto px-10 py-4 font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 rounded-2xl transition-all duration-300 backdrop-blur-md hover:-translate-y-1 justify-center flex items-center text-lg"
            >
              Learn About Us
            </Link>
          </div>
        </div>

        {/* --- Top Performers / Student Hall of Fame Section --- */}
        <section className="w-full mt-12 mb-20 animate-fade-in-up">
          <div className="text-center mb-10 space-y-3">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-gold text-xs font-bold uppercase tracking-wider">
              <Flame size={14} className="text-gold" />
              <span>Hall of Fame</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Top Student Achievers</h2>
            <p className="text-sm text-slate-400 max-w-xl mx-auto">
              Celebrating our leading scholars and competitors ranked by official competition points and standings across all active wings.
            </p>
          </div>

          {loadingPerformers ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-56 rounded-3xl bg-white/5 border border-white/5 animate-pulse"></div>
              ))}
            </div>
          ) : topPerformers.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white/5 border border-white/5 text-center space-y-2">
              <Trophy size={40} className="mx-auto text-gold/40" />
              <h4 className="text-base font-bold text-slate-300">New Tournament Season Open</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                First standings of the academic year are currently being calculated. Attend upcoming challenges to earn top positions!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
              {topPerformers.slice(0, 6).map((student, idx) => {
                const isFirst = idx === 0;
                const isSecond = idx === 1;
                const isThird = idx === 2;

                const medalColor = isFirst 
                  ? 'from-yellow-400 to-amber-600 text-yellow-950 shadow-yellow-500/30' 
                  : isSecond 
                  ? 'from-slate-200 to-slate-400 text-slate-900 shadow-slate-400/20' 
                  : isThird 
                  ? 'from-amber-600 to-amber-800 text-amber-100 shadow-amber-700/20' 
                  : 'from-blue-600 to-cyan-600 text-white shadow-blue-500/20';

                return (
                  <div 
                    key={student._id || student.id || idx}
                    className={`relative p-6 rounded-[2rem] bg-gradient-to-b from-white/[0.07] to-white/[0.02] border ${
                      isFirst ? 'border-yellow-500/40 shadow-[0_0_30px_rgba(234,179,8,0.15)]' : 'border-white/10'
                    } backdrop-blur-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between`}
                  >
                    {/* Rank Badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${medalColor} flex items-center justify-center font-extrabold text-base shadow-lg`}>
                          {isFirst ? '1st' : isSecond ? '2nd' : isThird ? '3rd' : `#${idx + 1}`}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {student.name}
                          </h4>
                          <span className="text-xs text-slate-400 font-mono">
                            {student.studentId} • {student.className || 'Senior Division'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-slate-400 font-medium">Merit Points</div>
                        <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
                          {student.totalPoints}
                        </div>
                      </div>
                    </div>

                    {/* Wing Badge & Standings count */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-semibold uppercase tracking-wider text-[10px]">
                        {student.wing} Wing
                      </span>
                      
                      <div className="flex items-center space-x-2 text-slate-300 text-[11px]">
                        {student.firstPlaces > 0 && (
                          <span className="flex items-center gap-0.5 text-yellow-400 font-bold">
                            🥇 {student.firstPlaces}
                          </span>
                        )}
                        {student.secondPlaces > 0 && (
                          <span className="flex items-center gap-0.5 text-slate-300 font-bold">
                            🥈 {student.secondPlaces}
                          </span>
                        )}
                        {student.thirdPlaces > 0 && (
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                            🥉 {student.thirdPlaces}
                          </span>
                        )}
                        {student.firstPlaces === 0 && student.secondPlaces === 0 && student.thirdPlaces === 0 && (
                          <span className="text-slate-400">Enrolled Candidate</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Feature Grid & Verifier Layout */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-4 animate-fade-in-up animation-delay-300">
          
          {/* Certificate Verifier (Left Column) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden group hover:border-cyan-500/30 transition-colors duration-500 text-left">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl transition-opacity group-hover:opacity-100 opacity-50"></div>
              
              <div className="space-y-2 mb-8 relative z-10">
                <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <ShieldCheck size={24} className="text-cyan-400" />
                  </div>
                  <span>Instant Verification</span>
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed pl-[3.25rem]">
                  Cryptographically validate official student credentials immediately without logging into the system.
                </p>
              </div>

              <form onSubmit={handleVerify} className="relative z-10 flex flex-col gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Enter Certificate ID (CERT-...)"
                    value={certId}
                    onChange={(e) => setCertId(e.target.value)}
                    className="w-full pl-5 pr-12 py-4 bg-black/40 border border-white/10 rounded-2xl text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 text-white font-mono placeholder-slate-600 transition-all shadow-inner"
                  />
                  {certId && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse"></div>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full py-4 bg-white/10 hover:bg-cyan-500/20 border border-white/5 hover:border-cyan-500/50 text-white rounded-2xl text-sm font-bold transition-all duration-300 flex items-center justify-center group"
                >
                  {verifying ? (
                    <span className="flex items-center"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> Processing...</span>
                  ) : (
                    <span className="flex items-center text-cyan-50">Run Authenticity Check <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" /></span>
                  )}
                </button>
              </form>

              {/* Verification Result */}
              {verifiedCert && (
                <div className="mt-6 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 relative overflow-hidden animate-fade-in-up">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/20 rounded-full blur-2xl"></div>
                  <p className="font-bold flex items-center text-emerald-400 mb-3">
                    <CheckCircle2 size={18} className="mr-2" />
                    <span>Verified Authentic standing</span>
                  </p>
                  <p className="font-mono text-xs text-emerald-200/60 mb-2 border-b border-emerald-500/20 pb-2">ID: {verifiedCert.certificateId}</p>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Awarded to <span className="text-white font-bold">{verifiedCert.studentId?.name}</span> for securing{' '}
                    <span className="text-emerald-300 font-bold">{verifiedCert.position} Place</span> in{' '}
                    <span className="text-white font-bold">"{verifiedCert.programId?.title}"</span> on{' '}
                    {new Date(verifiedCert.programId?.date).toLocaleDateString()}.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Feature Highlight Cards (Right Column) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            <div className="p-8 rounded-[2rem] bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:bg-white/10 transition-colors duration-300 flex flex-col justify-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 border border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <Trophy size={26} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Open Merit & Standings</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Log program points, monitor global leaderboards, and issue immutable credentials to top performers without registration barriers.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:bg-white/10 transition-colors duration-300 flex flex-col justify-center">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                <Users size={26} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Segmented Wing Management</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Decentralize event administration into dedicated departments directed by authorized wing chairmen.
              </p>
            </div>

            <div className="sm:col-span-2 p-8 rounded-[2rem] bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-colors duration-300 flex flex-col sm:flex-row items-center sm:items-center justify-between group overflow-hidden relative">
              <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="flex-1 pr-6 z-10">
                <div className="flex items-center space-x-4 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Calendar size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Dynamic Ledger Posting</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed pl-16">
                  Maintain precise financial transparency. Record operational logistics, sponsor grants, and real-time budgeting balances directly into the ledger.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Wings Showreel */}
        <section className="mt-32 w-full animate-fade-in-up animation-delay-500">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">Discover Active Departments</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Collaborative nodes directing specialized student portfolios and events.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {wings.length === 0 ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 rounded-3xl bg-white/5 border border-white/5 animate-pulse flex items-center justify-center flex-col space-y-4">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl"></div>
                  <div className="w-24 h-4 bg-white/10 rounded-full"></div>
                </div>
              ))
            ) : (
              wings.map((wing) => (
                <div key={wing._id} className="relative group p-6 rounded-[2rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/5 hover:border-blue-500/30 overflow-hidden transition-all duration-500">
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="space-y-5 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10 text-white flex items-center justify-center shrink-0 overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-500">
                      {wing.logo ? (
                        <img src={wing.logo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl font-bold">{wing.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-white mb-1">{wing.name}</h4>
                      <span className="inline-block px-2.5 py-1 rounded-md bg-white/5 text-[10px] text-cyan-300 font-mono tracking-wider">@{wing.chairmanId?.userId?.username || 'access'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-5 border-t border-white/10 text-xs space-y-2 relative z-10">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Chairman</span>
                      <span className="font-bold text-slate-200 bg-white/5 px-2 py-0.5 rounded text-[11px]">{wing.chairmanId?.name || 'Unassigned'}</span>
                    </div>
                    {wing.chairmanId?.assistantName && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-medium">Assistant</span>
                        <span className="font-semibold text-slate-300">{wing.chairmanId.assistantName}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </main>

      {/* --- Footer --- */}
      <footer className="relative z-10 py-10 border-t border-white/10 px-6 md:px-12 bg-black/20 backdrop-blur-md text-center text-sm text-slate-500 mt-20">
        <p>&copy; {new Date().getFullYear()} {orgName}. Designed for academic excellence.</p>
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
