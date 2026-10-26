import React from 'react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './pwa/PWAInstallButton';
import {
  Shield,
  Sparkles,
  CheckCircle2,
  Crown,
  Sun,
  Moon,
  Bell,
  Mail,
  UserPlus,
  UserCheck,
  Database,
  Globe,
  LogIn
} from 'lucide-react';

import { AproVELogo } from './brand/AproVELogo';

export const Header: React.FC = () => {
  const {
    params,
    viewMode,
    setViewMode,
    currentUser,
    setIsPaywallOpen,
    theme,
    toggleTheme,
    setIsRegisterModalOpen,
    setIsLoginModalOpen,
    setIsEmailViewerOpen,
    setIsPushCenterOpen,
    inboxEmails,
    pushPermission,
    pushHistory,
    isSupabaseConnected,
    setIsSupabaseModalOpen,
  } = useApp();

  const unreadEmailsCount = inboxEmails.filter(e => !e.read).length;
  const unreadPushCount = pushHistory.filter(p => !p.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-6">
        {/* Zone 1: Brand Wordmark (AproVE) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setViewMode(viewMode === 'public' ? 'candidate' : 'public')}
            className="flex items-center gap-2.5 text-left group hover:opacity-95 transition-opacity cursor-pointer"
            title="AproVE — Mais preparação. Mais confiança."
          >
            <AproVELogo size="md" />
            <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 tracking-wide uppercase">
              Independente
            </span>
          </button>
        </div>

        {/* Zone 2: Mode Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setViewMode('public')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${
              viewMode === 'public'
                ? 'text-slate-900 dark:text-white font-semibold border-b-2'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
            style={{ borderColor: viewMode === 'public' ? params.primaryColor : 'transparent' }}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Início / Apresentação</span>
          </button>
          <button
            onClick={() => setViewMode('candidate')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              viewMode === 'candidate'
                ? 'text-slate-900 dark:text-white font-semibold border-b-2'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
            style={{ borderColor: viewMode === 'candidate' ? params.primaryColor : 'transparent' }}
          >
            Área do Candidato
          </button>
          <button
            onClick={() => setViewMode('admin')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              viewMode === 'admin'
                ? 'text-slate-900 dark:text-white font-semibold border-b-2'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
            style={{ borderColor: viewMode === 'admin' ? params.primaryColor : 'transparent' }}
          >
            Consola de Administração
          </button>
          <button
            onClick={() => setViewMode('architecture')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              viewMode === 'architecture'
                ? 'text-slate-900 dark:text-white font-semibold border-b-2'
                : 'hover:text-slate-900 dark:hover:text-white'
            }`}
            style={{ borderColor: viewMode === 'architecture' ? params.primaryColor : 'transparent' }}
          >
            Caderno Técnico
          </button>
        </nav>

        {/* Zone 3: Actions - Theme Toggle, Push, Email, Register & Subscription */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
            aria-label="Alternar Modo Escuro"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Supabase Database Status Button */}
          <button
            type="button"
            onClick={() => setIsSupabaseModalOpen(true)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors group"
            title="Banco de Dados Supabase (PostgreSQL)"
            aria-label="Supabase Status"
          >
            <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform" />
            {isSupabaseConnected ? (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            ) : (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* Email Inbox Button with OTP badge */}
          <button
            type="button"
            onClick={() => setIsEmailViewerOpen(true)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Caixa de E-mail (Código de Verificação & Boas-vindas)"
            aria-label="Abrir E-mail"
          >
            <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            {unreadEmailsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center">
                {unreadEmailsCount}
              </span>
            )}
          </button>

          {/* Push Notifications Button */}
          <button
            type="button"
            onClick={() => setIsPushCenterOpen(true)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Notificações Push do MININT"
            aria-label="Notificações Push"
          >
            <Bell className="w-4 h-4 text-amber-500" />
            {pushPermission === 'granted' ? (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            ) : (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton className="hidden md:inline-flex" />

          {/* User Login Button */}
          <button
            type="button"
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            title="Iniciar Sessão do Candidato"
          >
            <LogIn className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Entrar</span>
          </button>

          {/* User Registration Button */}
          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            title="Cadastrar Novo Candidato com Verificação por Código de E-mail"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-500" />
            <span>Novo Cadastro</span>
          </button>

          {/* Subscription Action */}
          {currentUser.isSubscribed ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">
                Acesso Ativo ({currentUser.subscriptionPlan === 'lifetime' ? 'Vitalício' : '30 Dias'})
              </span>
            </div>
          ) : (
            <button
              onClick={() => setIsPaywallOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs hover:opacity-95 transition-opacity whitespace-nowrap shrink-0"
              style={{ backgroundColor: params.secondaryColor }}
            >
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">
                Ativar Simulador ({params.priceMonthlyKz.toLocaleString()} Kz)
              </span>
              <span className="sm:hidden">Ativar</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav indicator bar */}
      <div className="lg:hidden flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-2 py-1.5 overflow-x-auto text-xs font-medium">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('public')}
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${
              viewMode === 'public'
                ? 'bg-white dark:bg-slate-800 shadow-xs text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Início
          </button>
          <button
            onClick={() => setViewMode('candidate')}
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${
              viewMode === 'candidate'
                ? 'bg-white dark:bg-slate-800 shadow-xs text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Candidato
          </button>
          <button
            onClick={() => setViewMode('admin')}
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${
              viewMode === 'admin'
                ? 'bg-white dark:bg-slate-800 shadow-xs text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setViewMode('architecture')}
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap ${
              viewMode === 'architecture'
                ? 'bg-white dark:bg-slate-800 shadow-xs text-slate-900 dark:text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Caderno
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="sm:hidden text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800"
          >
            <LogIn className="w-3 h-3" />
            <span>Entrar</span>
          </button>
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="sm:hidden text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800"
          >
            <UserPlus className="w-3 h-3" />
            <span>Cadastrar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
