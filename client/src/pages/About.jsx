import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, ShieldAlert, Award, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-dark text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 md:px-12 glass-panel border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🎓</span>
          <span className="text-xl font-bold font-sans tracking-wide bg-gradient-to-r from-cyan to-royal-light bg-clip-text text-transparent">
            Shaad-Mates
          </span>
        </div>
        <Link to="/" className="text-sm font-semibold hover:text-royal transition-colors flex items-center">
          <ArrowLeft size={16} className="mr-1" /> Back to Home
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-sans text-center mb-6">
          About the{' '}
          <span className="bg-gradient-to-r from-royal-light to-cyan bg-clip-text text-transparent">
            Shaad-Mates Program
          </span>
        </h1>

        <p className="text-lg text-slate-500 dark:text-slate-400 text-center max-w-2xl mx-auto leading-relaxed mb-12">
          The Shaad-Mates Program is a structured initiative designed to cultivate extracurricular talents, collaborative technical skills, and sports leadership through wing-based activities.
        </p>

        <div className="space-y-12">
          {/* Card 1 */}
          <div className="p-8 rounded-3xl glass-card border flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-royal/10 dark:bg-royal/20 flex items-center justify-center">
              <Award className="text-royal" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Our Goal</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                We bridge the gap between academic education and practical self-growth. By hosting structured competitions, group hackathons, soccer cups, and cultural programs, we provide every student an avenue to showcase their skills, earn points, and receive formal awards.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl glass-card border flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-cyan/10 dark:bg-cyan/20 flex items-center justify-center">
              <Users className="text-cyan" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Wing Organization</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Students belong to specific Wings (e.g. Red Wing, Blue Wing). Each wing is steered by a dedicated Wing Manager who coordinates local challenges, checks student availability, and promotes active registrations. Admins approve programs and manage schedules to prevent scheduling overlaps.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl glass-card border flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 shrink-0 rounded-2xl bg-gold/10 dark:bg-gold/20 flex items-center justify-center">
              <Globe className="text-gold" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Integrity of Results</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Rules are strictly enforced: results cannot be registered unless a student or team has formally signed up before the event. Standings support multiple awards (1st, 2nd, 3rd) and reward points that roll up to the student's personal scoresheet.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link
            to="/login"
            className="inline-flex items-center px-8 py-4 font-bold text-white bg-royal hover:bg-royal-dark rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            Access the Portal Now
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
        <p>&copy; {new Date().getFullYear()} Shaad-Mates Program Management. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default About;
