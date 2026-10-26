import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LogIn,
  X,
  User,
  Shield,
  CheckCircle2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Briefcase,
  Sparkles,
  ArrowRight,
  Database,
  KeyRound,
  UserPlus,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { CandidateUser, Province, CareerTrack } from '../../types';

export const LoginModal: React.FC = () => {
  const {
    isLoginModalOpen,
    setIsLoginModalOpen,
    registeredUsers,
    currentUser,
    switchCandidateAccount,
    loginWithFirebaseEmail,
    registerWithFirebaseEmail,
    sendFirebasePasswordReset,
    isDatabaseConnected,
    isSupabaseConnected,
  } = useApp();

  type TabMode = 'login' | 'register' | 'forgot' | 'switch';
  const [tab, setTab] = useState<TabMode>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('benvindomanuel79@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regProvince, setRegProvince] = useState<Province>('Luanda');
  const [regCareer, setRegCareer] = useState<CareerTrack>('Polícia Nacional (PNA)');
  const [regReferral, setRegReferral] = useState('');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');

  // Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const angolaProvinces: Province[] = [
    'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango',
    'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla',
    'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico',
    'Namibe', 'Uíge', 'Zaire'
  ];

  const minintCareers: CareerTrack[] = [
    'Polícia Nacional (PNA)',
    'Serviço de Investigação Criminal (SIC)',
    'Serviço de Migração e Estrangeiros (SME)',
    'Serviço de Protecção Civil e Bombeiros (SPCB)',
    'Serviço Penitenciário'
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Por favor, introduza o seu e-mail e a palavra-passe.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await loginWithFirebaseEmail(loginEmail.trim(), loginPassword);
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          setIsLoginModalOpen(false);
          setSuccessMessage(null);
          setLoginPassword('');
        }, 1200);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Falha na autenticação do Firebase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Preencha o nome completo, e-mail e palavra-passe.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('A palavra-passe deve conter pelo menos 6 caracteres.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await registerWithFirebaseEmail(
        regEmail.trim(),
        regPassword,
        regName.trim(),
        regProvince,
        regCareer,
        regReferral.trim() || undefined
      );

      if (res.success) {
        setSuccessMessage('Conta de candidato criada e autenticada com sucesso!');
        setTimeout(() => {
          setIsLoginModalOpen(false);
          setSuccessMessage(null);
          setTab('login');
        }, 1200);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Falha ao criar utilizador no Firebase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMessage('Por favor, informe o seu e-mail para recuperação.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await sendFirebasePasswordReset(forgotEmail.trim());
      if (res.success) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          setTab('login');
          setSuccessMessage(null);
        }, 3000);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Falha ao enviar recuperação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectCandidate = (candidate: CandidateUser) => {
    switchCandidateAccount(candidate.id);
    setSuccessMessage(`Perfil de ${candidate.name} activado com sucesso.`);
    setTimeout(() => {
      setIsLoginModalOpen(false);
      setSuccessMessage(null);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 my-6 text-slate-900 dark:text-slate-100">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#0A2540] dark:bg-blue-800 text-white flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight">
                  Acesso AproVE MININT
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  {isSupabaseConnected ? 'PostgreSQL Ativo' : 'Supabase Ligado'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  Firebase Auth
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 gap-1.5 p-1 mt-5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setTab('login'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'login'
                ? 'bg-white dark:bg-slate-900 shadow-xs text-blue-950 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('register'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'register'
                ? 'bg-white dark:bg-slate-900 shadow-xs text-blue-950 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Registar</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('switch'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'switch'
                ? 'bg-white dark:bg-slate-900 shadow-xs text-blue-950 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Perfis ({registeredUsers.length})</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('forgot'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'forgot'
                ? 'bg-white dark:bg-slate-900 shadow-xs text-blue-950 dark:text-white font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Recuperar</span>
          </button>
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">{successMessage}</div>
          </div>
        )}

        {/* TAB 1: LOGIN WITH FIREBASE EMAIL & PASSWORD */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>E-mail do Candidato:</span>
                </label>
                {loginEmail !== 'benvindomanuel79@gmail.com' && (
                  <button
                    type="button"
                    onClick={() => setLoginEmail('benvindomanuel79@gmail.com')}
                    className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    Usar benvindomanuel79@gmail.com
                  </button>
                )}
              </div>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="benvindomanuel79@gmail.com"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-500 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Palavra-passe do Firebase:</span>
                </label>
                <button
                  type="button"
                  onClick={() => setTab('forgot')}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Introduza a sua senha do Firebase"
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-900 dark:focus:ring-blue-500 text-slate-900 dark:text-slate-100 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick First User Notice */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-[11px] text-blue-900 dark:text-blue-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <strong>Primeiro utilizador cadastrado:</strong> benvindomanuel79@gmail.com
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('benvindomanuel79@gmail.com');
                  setErrorMessage(null);
                }}
                className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold text-[10px] hover:bg-blue-200 dark:hover:bg-blue-800 shrink-0"
              >
                Preencher
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#0A2540] hover:bg-[#10233F] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>A autenticar no Firebase...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span>Iniciar Sessão no AproVE</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: REGISTER NEW FIREBASE & SUPABASE CANDIDATE */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nome Completo do Candidato:
              </label>
              <input
                type="text"
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="Ex: João Baptista Silva"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-900 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                E-mail para Acesso:
              </label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="exemplo@gmail.com"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-900 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Definir Palavra-passe (mínimo 6 caracteres):
              </label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-900 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Província de Candidatura:
                </label>
                <select
                  value={regProvince}
                  onChange={(e) => setRegProvince(e.target.value as Province)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-900 text-slate-900 dark:text-slate-100 font-medium"
                >
                  {angolaProvinces.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Órgão / Carreira MININT:
                </label>
                <select
                  value={regCareer}
                  onChange={(e) => setRegCareer(e.target.value as CareerTrack)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-900 text-slate-900 dark:text-slate-100 font-medium"
                >
                  {minintCareers.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Código de Recomendação (Opcional):
                </label>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  10% de desconto
                </span>
              </div>
              <input
                type="text"
                value={regReferral}
                onChange={(e) => setRegReferral(e.target.value)}
                placeholder="Ex: REF-MININT10"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-900 text-slate-900 dark:text-slate-100 font-medium uppercase"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#16A673] hover:bg-[#128a5e] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>A registar no Firebase & Supabase...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-white" />
                  <span>Criar Conta e Começar Preparação</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: PASSWORD RECOVERY */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="mt-6 space-y-4">
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl text-xs text-blue-900 dark:text-blue-200">
              <p className="font-bold mb-1">Redefinição Segura via Firebase Auth</p>
              <p className="text-[11px] leading-relaxed">
                Introduza o endereço de e-mail associado à sua conta AproVE. Enviaremos um link oficial emitido diretamente pelo Firebase para que possa criar uma nova palavra-passe.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                E-mail Cadastrado:
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="benvindomanuel79@gmail.com"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-900 text-slate-900 dark:text-slate-100 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#0A2540] hover:bg-[#10233F] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>A despachar link de recuperação...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Enviar Link de Recuperação</span>
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setTab('login')}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer"
              >
                Voltar para o ecrã de início de sessão
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: SWITCH ACTIVE CANDIDATE FROM LOCAL & SUPABASE POOL */}
        {tab === 'switch' && (
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold">Candidatos Registados na Base:</span>
              <span className="font-mono">{registeredUsers.length} perfis activos</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {registeredUsers.map((candidate) => {
                const isCurrent = candidate.id === currentUser.id;
                return (
                  <div
                    key={candidate.id}
                    onClick={() => handleSelectCandidate(candidate)}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isCurrent
                            ? 'bg-[#0A2540] text-amber-400'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {candidate.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>

                      <div className="min-w-0 truncate">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold truncate text-slate-900 dark:text-slate-100">
                            {candidate.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded">
                              Activo
                            </span>
                          )}
                          {candidate.isSubscribed && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 rounded border border-amber-300 dark:border-amber-700">
                              VIP
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="truncate">{candidate.email || 'Sem e-mail'}</span>
                          <span>•</span>
                          <span className="shrink-0">{candidate.province}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-bold text-blue-900 dark:text-blue-400 block font-mono">
                        {candidate.averageScore || 0}%
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Institutional Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Plataforma Acadêmica Independente</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <a
              href="https://candidaturas.minint.ao"
              target="_blank"
              rel="noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
            >
              <span>candidaturas.minint.ao</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              className="font-semibold text-slate-700 dark:text-slate-300 hover:underline cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
