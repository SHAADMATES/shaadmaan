import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Toast from '../components/Toast';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      if (user.role === 'super_admin') navigate('/super/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'wing_chairman') navigate('/chairman/dashboard');
      else if (user.role === 'treasurer') navigate('/treasurer/dashboard');
      else if (user.role === 'student') navigate('/student/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setToastType('error');
      setToastMessage('Please enter both username and password.');
      return;
    }

    setLoading(true);
    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      setToastType('success');
      setToastMessage('Welcome back! Logged in successfully.');
      
      // Let the toast show shortly before redirecting
      setTimeout(() => {
        if (result.user.role === 'super_admin') navigate('/super/dashboard');
        else if (result.user.role === 'admin') navigate('/admin/dashboard');
        else if (result.user.role === 'wing_chairman') navigate('/chairman/dashboard');
        else if (result.user.role === 'treasurer') navigate('/treasurer/dashboard');
        else if (result.user.role === 'student') navigate('/student/dashboard');
      }, 800);
    } else {
      setToastType('error');
      setToastMessage(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-dark px-4 relative overflow-hidden transition-colors duration-300">
      {/* Background glow effects */}
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-royal/10 dark:bg-royal/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-cyan/10 dark:bg-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full z-10">
        {/* Portal Logo & Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block text-4xl mb-3">🎓</Link>
          <h2 className="text-3xl font-extrabold tracking-tight font-sans text-slate-800 dark:text-slate-100">
            Welcome to the Portal
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Sign in to manage program registrations & results.
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card border rounded-3xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-royal/40 focus:border-royal transition-all text-sm"
                  placeholder="Enter username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-royal/40 focus:border-royal transition-all text-sm"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-4 bg-royal hover:bg-royal-dark text-white font-bold rounded-2xl transition-all shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-royal disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group glow-blue"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-xs font-medium text-slate-400 hover:text-royal transition-colors">
            &larr; Back to landing page
          </Link>
        </div>
      </div>

      {/* Toast Notification */}
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

export default Login;
