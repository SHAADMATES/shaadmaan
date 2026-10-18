import React from 'react';
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
  TrendingUp
} from 'lucide-react';

const About = () => {
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
      desc: 'Students develop deep camaraderie within their respective Wings (e.g. Urdu Wing, Arabic Wing, English Wing). Wing Chairmen mentor participants, orchestrate specialized challenges, and cultivate leadership talent.',
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
      desc: 'Every certificate issued through the Shaad-Mates platform contains a unique cryptographic identifier, enabling instant third-party authenticity verification without login requirements.',
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

  const wings = [
    { name: 'Urdu Wing', tag: 'Adab & Bayan', desc: 'Promoting Urdu literature, poetry recitations (Bait Bazi), declamation, and creative prose.' },
    { name: 'Arabic Wing', tag: 'Lisan & Balaghah', desc: 'Fostering Arabic language mastery, calligraphy arts, classical rhetoric, and Islamic sciences.' },
    { name: 'English Wing', tag: 'Elocution & Model UN', desc: 'Hosting parliamentary debates, essay writing, public discourse, and international diplomacy forums.' },
    { name: 'Arts & Cultural Wing', tag: 'Creativity & Heritage', desc: 'Curating theatre, stage productions, documentary screenings, and cultural exhibitions.' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-dark text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-6 md:px-16 glass-panel border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-royal to-cyan flex items-center justify-center text-xl shadow-md text-white">
            🎓
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-royal via-royal-light to-cyan bg-clip-text text-transparent">
              Shaad-Mates
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              WebSuite
            </span>
          </div>
        </div>
        <Link 
          to="/" 
          className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-royal dark:hover:text-cyan transition-colors flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full space-y-20">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
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
            The Shaad-Mates Program Management System is a centralized academic and extracurricular ERP designed to empower students, coordinate specialized wings, streamline event evaluations, and celebrate top scholastic achievers.
          </p>
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

        {/* Wings Spotlight */}
        <div className="p-8 sm:p-12 rounded-[2.5rem] bg-gradient-to-br from-royal/5 via-cyan/5 to-transparent border border-slate-200/80 dark:border-slate-800/80 glass-card">
          <div className="max-w-2xl mb-10 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-royal dark:text-cyan">
              Community Structure
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold">The Wing Framework</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Each student belongs to a collaborative wing. Wings foster healthy intellectual rivalry, mentorship, and collective points standings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {wings.map((w, idx) => (
              <div 
                key={idx} 
                className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/80 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">{w.name}</h4>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-royal/10 dark:bg-cyan/10 text-royal dark:text-cyan">
                    {w.tag}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {w.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Process Flow */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold">How Shaad-Mates Works</h2>
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
              Log in to review upcoming programs, check your merit points, or verify any official Shaad-Mates credential.
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
        <p>&copy; {new Date().getFullYear()} Shaad-Mates Program Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default About;
