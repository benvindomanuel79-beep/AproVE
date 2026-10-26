import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SQL_SCHEMA } from '../../lib/supabase';
import {
  Database,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Table,
  UploadCloud,
  ShieldCheck,
  Zap,
  Info,
  X
} from 'lucide-react';

export const SupabaseStatusModal: React.FC = () => {
  const {
    isSupabaseModalOpen,
    setIsSupabaseModalOpen,
    isSupabaseConnected,
    supabaseHealth,
    checkSupabaseConnection,
    syncAllToSupabase,
    registeredUsers,
    attempts,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'status' | 'sql' | 'sync'>('status');
  const [copied, setCopied] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  if (!isSupabaseModalOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      await checkSupabaseConnection();
    } finally {
      setIsTesting(false);
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncAllToSupabase();
      setSyncFeedback(res.message);
    } catch (err: any) {
      setSyncFeedback('Erro ao sincronizar: ' + (err?.message || 'Falha desconhecida'));
    } finally {
      setIsSyncing(false);
    }
  };

  const projectRef = SUPABASE_URL.replace(/^https?:\/\//, '').split('.')[0] || 'bpdcdljtdebckyzxmoai';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                  Integração Banco de Dados Supabase
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  PostgreSQL
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Projecto Oficial: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{projectRef}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSupabaseModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 gap-4">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'status'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            Estado da Conexão
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'sql'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Table className="w-4 h-4" />
            Script SQL Supabase
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'sync'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            Sincronização em Massa
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Endpoint Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Conexão ao Supabase API REST
                  </span>
                  <div className="flex items-center gap-2">
                    {isSupabaseConnected ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Online & Autenticado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        <Info className="w-3.5 h-3.5 text-amber-600" />
                        Aguardando Teste
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">SUPABASE_URL</span>
                    <div className="font-mono text-xs sm:text-sm bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 select-all overflow-x-auto">
                      {SUPABASE_URL}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">SUPABASE_ANONKEY (Public Client Key)</span>
                    <div className="font-mono text-xs bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 select-all overflow-x-auto truncate">
                      {SUPABASE_ANON_KEY}
                    </div>
                  </div>
                </div>

                {supabaseHealth && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>Latência de Resposta: <strong>{supabaseHealth.latencyMs} ms</strong></span>
                    <span>Modo: <strong>Tempo Real / REST v1</strong></span>
                  </div>
                )}
              </div>

              {/* Tables probe */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Tabelas Relacionais do PostgreSQL (Supabase)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">candidates</div>
                      <div className="text-[11px] text-slate-500">Perfis de Candidatos e Usuários</div>
                    </div>
                    {supabaseHealth?.tablesStatus.candidates ? (
                      <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Ativa
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">Aguardando SQL</span>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">exam_attempts</div>
                      <div className="text-[11px] text-slate-500">Histórico de Simulados e Notas</div>
                    </div>
                    {supabaseHealth?.tablesStatus.exam_attempts ? (
                      <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Ativa
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">Aguardando SQL</span>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">subscriptions</div>
                      <div className="text-[11px] text-slate-500">Assinaturas e Pagamentos Stripe</div>
                    </div>
                    {supabaseHealth?.tablesStatus.subscriptions ? (
                      <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Ativa
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">Aguardando SQL</span>
                    )}
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">withdrawals</div>
                      <div className="text-[11px] text-slate-500">Comissões de Afiliados Multicaixa</div>
                    </div>
                    {supabaseHealth?.tablesStatus.withdrawals ? (
                      <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Ativa
                      </span>
                    ) : (
                      <span className="text-slate-500 text-xs">Aguardando SQL</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? 'Testando Conexão...' : 'Testar Conexão em Tempo Real'}
                </button>

                <a
                  href={`https://supabase.com/dashboard/project/${projectRef}/editor`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir Supabase SQL Editor
                </a>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Esquema SQL Oficial para o Supabase
                  </h4>
                  <p className="text-xs text-slate-500">
                    Copie e cole este script no painel <strong>SQL Editor</strong> do seu Supabase para criar as tabelas com RLS.
                  </p>
                </div>
                <button
                  onClick={handleCopySql}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar SQL
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="font-mono text-xs bg-slate-950 text-emerald-400 p-4 rounded-xl overflow-x-auto max-h-[340px] leading-relaxed border border-slate-800 selection:bg-emerald-800 selection:text-white">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                <span>
                  O script inclui <strong>Row Level Security (RLS)</strong> configurado para permitir que o cliente do aplicativo (com a chave <code className="font-mono">sb_publishable_...</code>) execute inserções, leituras e atualizações sem erros de permissão.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-emerald-500" />
                  Sincronizar Estado Local para o Supabase
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Transfira todos os candidatos registados ({registeredUsers.length} usuários) e tentativas de simulados ({attempts.length} provas) armazenados na sessão para as tabelas do seu Supabase PostgreSQL.
                </p>
              </div>

              {syncFeedback && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{syncFeedback}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 transition-colors disabled:opacity-50 shadow-xs"
                >
                  <UploadCloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                  {isSyncing ? 'Sincronizando com Supabase...' : 'Iniciar Sincronização Agora'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500">
          <span>AproVE Angola &bull; Supabase PostgreSQL v1</span>
          <button
            onClick={() => setIsSupabaseModalOpen(false)}
            className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
