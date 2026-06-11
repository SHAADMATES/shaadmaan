import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-light/90 dark:bg-emerald-950/80',
          border: 'border-emerald/30 dark:border-emerald/20',
          text: 'text-slate-800 dark:text-emerald-300',
          icon: <CheckCircle className="text-emerald dark:text-emerald-400" size={18} />
        };
      case 'error':
        return {
          bg: 'bg-rose-50/90 dark:bg-rose-950/80',
          border: 'border-rose-200 dark:border-rose-900/40',
          text: 'text-rose-800 dark:text-rose-300',
          icon: <XCircle className="text-rose-500" size={18} />
        };
      case 'info':
      default:
        return {
          bg: 'bg-cyan-light/90 dark:bg-cyan-950/80',
          border: 'border-cyan/30 dark:border-cyan/20',
          text: 'text-slate-800 dark:text-cyan-300',
          icon: <Info className="text-cyan dark:text-cyan-400" size={18} />
        };
    }
  };

  const style = getStyle();

  return (
    <div className={`
      fixed bottom-6 right-6 z-50 flex items-center p-4 rounded-2xl border backdrop-blur-md shadow-lg transition-all duration-300 transform translate-y-0 animate-scale
      ${style.bg} ${style.border} ${style.text}
    `}>
      <div className="mr-3">{style.icon}</div>
      <div className="mr-8 text-sm font-semibold">{message}</div>
      <button 
        onClick={onClose}
        className="p-0.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
