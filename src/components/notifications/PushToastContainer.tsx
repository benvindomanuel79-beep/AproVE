import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, X, Shield, ArrowRight, Sparkles, Volume2 } from 'lucide-react';

export const PushToastContainer: React.FC = () => {
  const { activePushToast, dismissPushToast, setIsPushCenterOpen, params } = useApp();

  useEffect(() => {
    if (activePushToast) {
      const timer = setTimeout(() => {
        dismissPushToast();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activePushToast, dismissPushToast]);

  if (!activePushToast) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-bounce-in transition-all duration-300">
      <div className="bg-slate-900/95 dark:bg-slate-900/95 text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-start gap-3 relative overflow-hidden">
        {/* Subtle accent bar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ backgroundColor: params.secondaryColor }}
        />

        {/* Icon */}
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
          <Bell className="w-5 h-5 animate-pulse" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Notificação Push MININT
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {activePushToast.timestamp}
            </span>
          </div>

          <h5 className="text-xs font-bold text-slate-100 leading-snug">
            {activePushToast.title}
          </h5>

          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed line-clamp-2">
            {activePushToast.body}
          </p>

          <button
            onClick={() => {
              dismissPushToast();
              setIsPushCenterOpen(true);
            }}
            className="mt-2 text-[11px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            <span>Ver na Central de Notificações</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={dismissPushToast}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
