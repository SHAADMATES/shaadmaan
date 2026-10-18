import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Award, 
  Globe, 
  Sparkles, 
  Trophy, 
  ShieldCheck, 
  BookOpen, 
  GraduationCap, 
  CheckCircle2, 
  Compass, 
  Target, 
  HeartHandshake,
  TrendingUp,
  Shield,
  Layers,
  UserCheck
} from 'lucide-react';
import { api } from '../context/AuthContext';
import ShaadMatesLogo from '../components/ShaadMatesLogo';

const About = () => {
  // Real wings state from database
  const [realWings, setRealWings] = useState([]);
  const [loadingWings, setLoadingWings] = useState(true);

  // Fallback to real wings from database in case network is delayed
  const defaultRealWings = [
    { name: 'Urdu Wing', chairmanName: 'Hasan Raza', assistantName: 'Adnan Shah', description: 'Promoting Urdu literature, poetry recitations (Bait Bazi), declamation, and creative prose.' },
    { name: 'English Wing', chairmanName: 'Faiz MD Pathan', assistantName: 'Rafi-ul Haque', description: 'Hosting elocution, debates, essay writing, public discourse, and model assemblies.' },
    { name: 'Arabic Wing', chairmanName: 'Ashhar Ali', assistantName: 'Umair Ansari', description: 'Fostering Arabic language mastery, calligraphy arts, classical rhetoric, and Islamic sciences.' },
    { name: 'Core Committee', chairmanName: 'Shaadmaan', assistantName: 'Executive Team', description: 'Central student governance, strategic event coordination, and inter-wing compliance.' },
    { name: 'IEH Wing', chairmanName: 'Kaif Khan', assistantName: 'Aftab', description: 'Islamic Education & Heritage studies, seminars, research symposiums, and moral ethics.' },
    { name: 'Media & IT Wing', chairmanName: 'Abdul Qadir', assistantName: 'Zaid', description: 'Digital media productions, technological workshops, live event broadcasts, and design.' },
    { name: 'Science & Maths Wing', chairmanName: 'Arman Khan', assistantName: 'Advisory Panel', description: 'STEM exhibitions, mathematics olympiads, scientific debates, and innovative projects.' },
    { name: 'Sports Wing', chairmanName: 'Umain Shaikh', assistantName: 'Athletic Squad', description: 'Inter-wing athletics, tournaments, fitness development, and sportsmanship excellence.' },
    { name: 'GK & Quiz Wing', chairmanName: 'Shoaib', assistantName: 'Quizmasters Team', description: 'General knowledge championships, trivia bowls, current affairs, and scholastic quizzes.' },
  ];

  useEffect(() => {
    const fetchWings = async () => {
      try {
        const res = await api.get('/results/wings');
        if (res.data && res.data.length > 0) {
          setRealWings(res.data);
        } else {
          setRealWings(defaultRealWings);
        }
      } catch (err) {
        setRealWings(defaultRealWings);
      } finally {
        setLoadingWings(false);
      }
    };
    fetchWings();
  }, []);

  const displayWings = realWings.length > 0 ? realWings : defaultRealWings;

  const formatWingTitle = (name) => {
    if (!name) return 'Academic Wing';
    const trimmed = name.trim();
    const formatted = trimmed
      .split(' ')
      .map(w => {
        if (w.toLowerCase() === '&') return '&';
        if (['IEH', 'IT', 'GK'].includes(w.toUpperCase())) return w.toUpperCase();
        return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
      })
      .join(' ');
    
    if (formatted.toLowerCase().includes('wing') || formatted.toLowerCase().includes('committee')) {
      return formatted;
    }
    return `${formatted} Wing`;
  };

  const getWingDescription = (w) => {
    if (w.description && !w.description.toLowerCase().startsWith('wing managed by')) {
      return w.description;
    }
    const cleanName = w.name?.toLowerCase() || '';
    if (cleanName.includes('urdu')) return 'Promoting Urdu literature, classical poetry, Bait Bazi, declamation, and creative prose.';
    if (cleanName.includes('english')) return 'Hosting elocution, public debates, essay writing, scholastic discourse, and model assemblies.';
    if (cleanName.includes('arabic')) return 'Fostering Arabic language mastery, calligraphy arts, classical rhetoric, and Islamic sciences.';
    if (cleanName.includes('core')) return 'Central student governance, strategic inter-wing coordination, compliance, and campus logistics.';
    if (cleanName.includes('ieh')) return 'Islamic Education & Heritage studies, research symposiums, moral ethics, and spiritual seminars.';
    if (cleanName.includes('media') || cleanName.includes('it')) return 'Digital media production, technological workshops, live event broadcasts, and creative design.';
    if (cleanName.includes('science') || cleanName.includes('math')) return 'STEM exhibitions, mathematics olympiads, scientific debates, and innovative laboratory projects.';
    if (cleanName.includes('sport')) return 'Inter-wing athletics, fitness development, campus tournaments, and sportsmanship championships.';
    if (cleanName.includes('gk') || cleanName.includes('quiz')) return 'General knowledge championships, scholastic quiz bowls, trivia tournaments, and current affairs.';
    return `Specialized institutional wing cultivating talent, leadership, and extracurricular mastery under ${w.chairmanName || 'appointed chair'}.`;
  };

  const pillars = [
    {
      icon: Award,
      title: 'Open Participation Architecture',
      desc: 'We have removed rigid registration barriers. Every enrolled student across all divisions is automatically qualified to participate, compete, and excel in any academic, literary, artistic, or sports event.',
      color: 'from-amber-500/20 to-gold/20 text-gold-dark dark:text-gold'
    },
    {
      icon: Users,
      title: 'Autonomous Wing Ecosystem',
      desc: 'Students develop deep camaraderie within their respective Wings. Wing Chairmen mentor participants, orchestrate specialized challenges, and cultivate leadership talent.',
      color: 'from-cyan/20 to-royal/20 text-royal dark:text-cyan'
    },
    {
      icon: Trophy,
      title: 'Merit-Based Standing & Honors',
      desc: 'Performances are evaluated with transparency. Students earn real points for 1st, 2nd, and 3rd place achievements, runner-up standings, and active contributions that roll up to official student transcripts.',
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400'
    },
    {
      icon: ShieldCheck,
      title: 'Cryptographic Certificate Verification',
      desc: 'Every certificate issued through the Shaad Mates platform contains a unique cryptographic identifier, enabling instant third-party authenticity verification without login requirements.',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400'
    },
    {
      icon: BookOpen,
      title: 'Holistic Student Development',
      desc: 'Bridging classroom knowledge with extramural excellence. From debating tournaments to symposiums and field tournaments, students build confidence, collaboration, and public speaking mastery.',
      color: 'from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400'
    },
    {
      icon: TrendingUp,
      title: 'Transparent Fiscal Governance',
      desc: 'The dedicated Treasurer Desk records all program grants, purchases, awards, and event ledgers in real-time, ensuring accountability and sustainable student activity funding.',
      color: 'from-rose-500/20 to-orange-500/20 text-rose-600 dark:text-rose-400'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-dark text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 md:px-16 glass-panel border-b border-slate-200/80 dark:border-slate-800/80">
        <Link to="/" className="flex items-center space-x-3 group">
          <ShaadMatesLogo size="sm" variant="emblem" className="group-hover:scale-105 transition-transform" />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight font-serif text-slate-900 dark:text-white group-hover:text-royal transition-colors">
              Shaad Mates
            </span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400">
              Islamic Educational Academy
            </span>
          </div>
        </Link>
        <Link 
          to="/" 
          className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-royal dark:hover:text-cyan transition-colors flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full space-y-20">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="flex justify-center mb-2">
            <ShaadMatesLogo size="xl" variant="full" className="hover-scale" />
          </div>
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-royal/10 dark:bg-cyan/10 border border-royal/20 dark:border-cyan/20 text-royal dark:text-cyan text-xs font-extrabold tracking-wider uppercase">
            <Sparkles size={14} />
            <span>Our Heritage & Mission</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Nurturing Excellence Across Every{' '}
            <span className="bg-gradient-to-r from-royal via-cyan to-royal-light bg-clip-text text-transparent">
              Dimension of Learning
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-light">
            Shaad Mates is an integrated academic and extracurricular management system designed to empower students, coordinate specialized wings, streamline event evaluations, and celebrate scholastic achievers.
          </p>
        </div>

        {/* Real Wings Spotlight - From Live Database */}
        <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-br from-royal/5 via-cyan/5 to-transparent border border-slate-200/80 dark:border-slate-800/80 glass-card space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
            <div className="max-w-2xl space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-royal dark:text-cyan flex items-center space-x-1.5">
                <Shield size={14} />
                <span>Real Community Structure</span>
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold">The Wing Framework</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Live organizational wings powered by the database. Each wing is led by appointed chairmen and student mentors to foster leadership, competition, and collective points standings.
              </p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold shrink-0">
              {displayWings.length} Active Operational Wings
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayWings.map((w, idx) => (
              <div 
                key={w.id || w._id || idx} 
                className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-md hover-scale flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-royal/10 dark:bg-cyan/10 border border-royal/20 dark:border-cyan/20 flex items-center justify-center text-royal dark:text-cyan font-black text-sm">
                      {w.name?.charAt(0)?.toUpperCase() || 'W'}
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      Official Wing
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-royal transition-colors">
                      {formatWingTitle(w.name)}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-3">
                      {getWingDescription(w)}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span className="text-slate-400 font-semibold flex items-center">
                      <UserCheck size={12} className="mr-1 text-royal" /> Chairman:
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {w.chairmanName || 'Appointed Chair'}
                    </span>
                  </div>
                  {w.assistantName && (
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="font-semibold text-slate-400">Assistant:</span>
                      <span className="font-medium text-slate-600 dark:text-slate-300">{w.assistantName}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Pillars Grid */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold">System Pillars & Principles</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Engineered with frictionless workflows so educators and student leaders focus on performance rather than paperwork.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <div 
                  key={i} 
                  className="p-8 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800/80 hover-scale shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center shadow-inner`}>
                      <Icon size={26} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{p.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Process Flow */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold">How Shaad Mates Works</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              A transparent, four-phase lifecycle for every campus event
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Proposal & Schedule', text: 'Wing Chairmen propose events with venue, timings, and rules. Admins review and publish conflict-free schedules.' },
              { num: '02', title: 'Open Participation', text: 'No pre-registration hurdles. All enrolled students are welcomed to attend and compete openly on event day.' },
              { num: '03', title: 'Universal Evaluation', text: 'Judges award standings (1st, 2nd, 3rd, Runner-up) with grades and points directly to any student participant.' },
              { num: '04', title: 'Merit Verification', text: 'Approved winners receive verifiable digital certificates and accumulate points towards the global Hall of Fame.' },
            ].map((step, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 relative">
                <span className="text-4xl font-extrabold text-royal/20 dark:text-cyan/20 block mb-3 font-mono">
                  {step.num}
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">{step.title}</h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="p-10 rounded-[2.5rem] bg-gradient-to-r from-royal via-royal-light to-cyan text-white shadow-2xl text-center space-y-6">
          <GraduationCap size={44} className="mx-auto text-cyan-light" />
          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-3xl font-extrabold tracking-tight">Ready to Showcase Your Potential?</h3>
            <p className="text-sm text-slate-100/90 font-light">
              Log in to review upcoming programs, check your merit points, or verify any official Shaad Mates credential.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="px-8 py-3.5 bg-white text-royal font-extrabold rounded-2xl hover:bg-slate-100 transition-all shadow-lg hover:scale-105 text-sm"
            >
              Sign In to Portal
            </Link>
            <Link
              to="/verify-certificate"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-extrabold rounded-2xl transition-all text-sm backdrop-blur-md"
            >
              Verify Certificate
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Shaad Mates. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default About;
