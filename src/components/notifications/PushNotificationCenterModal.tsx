import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  BellRing,
  Shield,
  X,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Smartphone,
  ExternalLink,
  Volume2
} from 'lucide-react';

export const PushNotificationCenterModal: React.FC = () => {
  const {
    isPushCenterOpen,
    setIsPushCenterOpen,
    pushPermission,
    pushEnabled,
    requestPushPermission,
    sendPushNotification,
    pushHistory,
    params,
  } = useApp();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'todos' | 'minint_oficial' | 'estudos' | 'afiliado'>('todos');
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isPushCenterOpen) return null;

  const handleEnablePush = async () => {
    setIsRequesting(true);
    await requestPushPermission();
    setIsRequesting(false);
  };

  const handleTestPushNotification = () => {
    sendPushNotification(
      '🚨 Novo Comunicado Oficial do MININT Publicado!',
      'O Ministério do Interior acaba de atualizar as listas de convocatória para a inspeção médica da Província de Luanda.',
      'minint_oficial',
      'https://candidaturas.minint.ao'
    );
  };

  const handleTestStudyPush = () => {
    sendPushNotification(
      '⏱️ Lembrete do Cronograma Alfabético',
      'Atenção candidato(a): os exames para a letra inicial do seu nome começam em 48 horas. Inicie o simulador de 45 min agora.',
      'cronograma'
    );
  };

  const filteredHistory = pushHistory.filter(item => {
    if (activeCategoryFilter === 'todos') return true;
    return item.category === activeCategoryFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header */}
        <div
          className="p-6 text-white relative"
          style={{ backgroundColor: params.primaryColor }}
        >
          <button
            onClick={() => setIsPushCenterOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <BellRing className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Sistema Web Push & Alertas em Tempo Real
              </span>
              <h3 className="text-xl font-black tracking-tight">
                Notificações Push do Concurso
              </h3>
            </div>
          </div>

          <p className="text-xs text-white/80 mt-2">
            Receba comunicados do MININT, alterações de salas de prova e resultados diretamente no seu ecrã ou telemóvel.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Permission Status Box */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-500" />
                <span>Status da Permissão no Navegador:</span>
              </span>

              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  pushPermission === 'granted'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : pushPermission === 'denied'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                }`}
              >
                {pushPermission === 'granted' && '✓ Autorizado / Ativo'}
                {pushPermission === 'denied' && '✕ Bloqueado pelo Navegador'}
                {pushPermission === 'default' && 'Pendente de Ativação'}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {pushPermission === 'granted'
                ? 'As notificações push estão configuradas e ativas. O seu dispositivo receberá disparos imediatos quando novas listas forem publicadas.'
                : 'Clique no botão abaixo para autorizar as notificações do navegador e não perder nenhuma data do cronograma.'}
            </p>

            {pushPermission !== 'granted' && (
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={isRequesting}
                className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-opacity"
                style={{ backgroundColor: params.secondaryColor }}
              >
                <Bell className="w-4 h-4" />
                <span>{isRequesting ? 'Solicitando permissão...' : 'Ativar Notificações Push Agora'}</span>
              </button>
            )}
          </div>

          {/* Test Push Dispatchers */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Simulação de Disparo de Alertas:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleTestPushNotification}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors flex items-center gap-2.5"
              >
                <Play className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Alerta de Comunicado
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Disparar notícia urgente do MININT
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={handleTestStudyPush}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-left transition-colors flex items-center gap-2.5"
              >
                <Play className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Alerta de Cronograma
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Lembrete da data do exame
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Past Push History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Histórico Recente de Disparos ({filteredHistory.length})
              </h4>

              <div className="flex items-center gap-1 text-[10px]">
                <button
                  onClick={() => setActiveCategoryFilter('todos')}
                  className={`px-2 py-0.5 rounded ${
                    activeCategoryFilter === 'todos'
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('minint_oficial')}
                  className={`px-2 py-0.5 rounded ${
                    activeCategoryFilter === 'minint_oficial'
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  MININT
                </button>
                <button
                  onClick={() => setActiveCategoryFilter('estudos')}
                  className={`px-2 py-0.5 rounded ${
                    activeCategoryFilter === 'estudos'
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Estudos
                </button>
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      {item.category === 'minint_oficial' ? 'MININT Oficial' : 'Roteiro de Estudos'}
                    </span>
                    <span className="text-slate-400 font-mono">{item.timestamp}</span>
                  </div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">{item.title}</h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Close button */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsPushCenterOpen(false)}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Fechar Painel de Notificações
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
