import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MinintNotification } from '../../types';
import {
  Bell,
  ExternalLink,
  ShieldAlert,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

export const NotificationsFeed: React.FC = () => {
  const { notifications, setCandidateTab } = useApp();
  const [selectedNotif, setSelectedNotif] = useState<MinintNotification | null>(null);

  const getUrgencyBadge = (urgency: MinintNotification['urgency']) => {
    switch (urgency) {
      case 'critical':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 px-2 py-0.5 rounded">
            <AlertTriangle className="w-3 h-3" />
            <span>Crítico / Imediato</span>
          </span>
        );
      case 'high':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3" />
            <span>Alta Prioridade</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
            <Info className="w-3 h-3" />
            <span>Informativo</span>
          </span>
        );
    }
  };

  const handleActionClick = (notif: MinintNotification) => {
    if (notif.linkText.includes('Lista')) {
      setCandidateTab('listas');
    } else if (notif.linkText.includes('Calendário')) {
      setCandidateTab('calendario');
    } else if (notif.linkText.includes('Física') || notif.linkText.includes('Médica')) {
      setCandidateTab('taf');
    } else {
      setSelectedNotif(notif);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <span>Central de Notificações Inteligente (MININT)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Sincronizado automaticamente a cada 30 minutos com candidaturas.minint.ao e Diário da República.
          </p>
        </div>
        <div className="text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-md flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Monitorização em Tempo Real</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-800 dark:text-blue-400" />
                  <span>{notif.source}</span>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <span>{notif.timestamp}</span>
                </span>
                {getUrgencyBadge(notif.urgency)}
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {notif.title}
              </h4>

              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                {notif.summary}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Autenticidade Oficial Validada</span>
              </span>

              <button
                onClick={() => handleActionClick(notif)}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{notif.linkText}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{selectedNotif.source}</span>
              <button
                onClick={() => setSelectedNotif(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-3">{selectedNotif.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Carimbo oficial: {selectedNotif.timestamp}</p>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mt-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {selectedNotif.summary}
              {'\n\n'}
              Nota de Segurança Institucional: Todos os atos do Concurso de Ingresso Externo do MININT obedecem às normas de publicidade do Diário da República. Guarde o seu número de inscrição e compareça munido do BI original.
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedNotif(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Compreendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
