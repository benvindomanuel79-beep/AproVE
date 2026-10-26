import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  Mail,
  Lock,
  Phone,
  MapPin,
  Briefcase,
  Gift,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';
import { Province, CareerTrack } from '../../types';

const PROVINCES: Province[] = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte',
  'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 'Luanda', 'Lunda Norte',
  'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire'
];

const CAREER_TRACKS: CareerTrack[] = [
  'Polícia Nacional (PNA)',
  'Serviço de Investigação Criminal (SIC)',
  'Serviço de Migração e Estrangeiros (SME)',
  'Serviço de Protecção Civil e Bombeiros (SPCB)'
];

export const RegisterModal: React.FC = () => {
  const {
    isRegisterModalOpen,
    setIsRegisterModalOpen,
    params,
    startEmailRegistration,
    verifyEmailCode,
    resendVerificationCode,
    cancelPendingRegistration,
    pendingRegistration,
    setIsEmailViewerOpen,
    setSelectedEmail,
    inboxEmails,
  } = useApp();

  // Step 1: form, Step 2: otp_verify, Step 3: success
  const [step, setStep] = useState<'form' | 'otp_verify' | 'success'>('form');

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '+244 ',
    province: 'Luanda' as Province,
    careerTrack: 'Polícia Nacional (PNA)' as CareerTrack,
    password: '',
    confirmPassword: '',
    referralCode: 'REF-MININT10',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(60);
  const [lastGeneratedOtp, setLastGeneratedOtp] = useState('');

  // Refs for 6 OTP boxes
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp_verify' && resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendCooldown]);

  // If modal closes, reset step
  useEffect(() => {
    if (!isRegisterModalOpen) {
      setStep('form');
      setFormError('');
      setOtpError('');
    }
  }, [isRegisterModalOpen]);

  if (!isRegisterModalOpen) return null;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Por favor insira o seu nome completo.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Por favor insira um endereço de e-mail válido.');
      return;
    }
    if (formData.password && formData.password.length < 6) {
      setFormError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      setFormError('As senhas não coincidem.');
      return;
    }

    const result = startEmailRegistration({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      whatsapp: formData.whatsapp.trim(),
      province: formData.province,
      careerTrack: formData.careerTrack,
      password: formData.password,
      referralCode: formData.referralCode.trim() || undefined,
    });

    if (result.success) {
      setLastGeneratedOtp(result.code);
      setStep('otp_verify');
      setResendCooldown(60);
      setOtpValues(['', '', '', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    } else {
      setFormError(result.message);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newValues = [...otpValues];
    // Take only the last character entered
    newValues[index] = value.slice(-1);
    setOtpValues(newValues);
    setOtpError('');

    // Advance focus
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all 6 filled
    if (newValues.every(val => val !== '') && index === 5) {
      const fullCode = newValues.join('');
      submitOtpCode(fullCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const chars = pastedData.split('');
      setOtpValues(chars);
      submitOtpCode(pastedData);
    }
  };

  const submitOtpCode = (code: string) => {
    setOtpError('');
    const result = verifyEmailCode(code);
    if (result.success) {
      setStep('success');
    } else {
      setOtpError(result.message);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    const res = resendVerificationCode();
    if (res.success && res.code) {
      setLastGeneratedOtp(res.code);
      setResendCooldown(60);
      setOtpValues(['', '', '', '', '', '']);
      setOtpError('');
      inputRefs.current[0]?.focus();
    } else {
      setOtpError(res.message);
    }
  };

  const handleQuickFillOtp = () => {
    if (lastGeneratedOtp && lastGeneratedOtp.length === 6) {
      const chars = lastGeneratedOtp.split('');
      setOtpValues(chars);
      submitOtpCode(lastGeneratedOtp);
    }
  };

  const openEmailPreview = () => {
    const matchingEmail = inboxEmails.find(em => em.type === 'verification_code');
    if (matchingEmail) {
      setSelectedEmail(matchingEmail);
      setIsEmailViewerOpen(true);
    } else if (inboxEmails.length > 0) {
      setSelectedEmail(inboxEmails[0]);
      setIsEmailViewerOpen(true);
    }
  };

  const openWelcomeEmail = () => {
    const welcome = inboxEmails.find(em => em.type === 'welcome');
    if (welcome) {
      setSelectedEmail(welcome);
      setIsEmailViewerOpen(true);
      setIsRegisterModalOpen(false);
    } else {
      setIsRegisterModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        {/* Header Ribbon */}
        <div
          className="p-6 text-white relative"
          style={{ backgroundColor: params.primaryColor }}
        >
          <button
            onClick={() => {
              cancelPendingRegistration();
              setIsRegisterModalOpen(false);
            }}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                Concurso Público de Ingresso Externo MININT
              </span>
              <h3 className="text-xl font-black tracking-tight">
                {step === 'form' && 'Cadastro de Novo Candidato'}
                {step === 'otp_verify' && 'Verificação de E-mail por Código'}
                {step === 'success' && 'Cadastro Concluído!'}
              </h3>
            </div>
          </div>

          <p className="text-xs text-white/80">
            {step === 'form' && 'Crie sua conta para acessar o cronograma alfabético oficial, simuladores e ranking.'}
            {step === 'otp_verify' && `Enviamos um código de segurança de 6 dígitos para ${pendingRegistration?.data.email}.`}
            {step === 'success' && 'O seu e-mail foi autenticado com sucesso no sistema oficial do MININT.'}
          </p>

          {/* Stepper Progress Indicator */}
          <div className="flex items-center gap-2 mt-4">
            <div className={`h-1.5 flex-1 rounded-full ${step === 'form' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step === 'otp_verify' ? 'bg-amber-400' : step === 'success' ? 'bg-emerald-400' : 'bg-white/20'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step === 'success' ? 'bg-emerald-400' : 'bg-white/20'}`} />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* STEP 1: REGISTRATION FORM */}
          {step === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome Completo (como consta no BI) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Manuel Domingos Katumbela"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Email & WhatsApp Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>E-mail para Validação *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="exemplo@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                    Receberá o código de 6 dígitos
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Contacto (WhatsApp) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+244 923 000 000"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Province & Career Track */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Província de Concurso</span>
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value as Province })}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    <span>Carreira / Órgão MININT</span>
                  </label>
                  <select
                    value={formData.careerTrack}
                    onChange={(e) => setFormData({ ...formData, careerTrack: e.target.value as CareerTrack })}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {CAREER_TRACKS.map((track) => (
                      <option key={track} value={track}>
                        {track}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Definir Senha</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-slate-500 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirmar Senha
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Affiliate Referral Code with 10% discount badge */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-600" />
                    <span>Código de Indicação / Afiliado (Opcional)</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    Garante 10% de Desconto
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Ex: REF-MININT10 ou código do amigo"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-[10px] text-amber-800 dark:text-amber-300/80 mt-1">
                  Ao usar um link ou código de afiliado, você paga 10% a menos (4.500 Kz em vez de 5.000 Kz) e a comissão do seu amigo fica 100% garantida.
                </p>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition-opacity"
                style={{ backgroundColor: params.secondaryColor }}
              >
                <span>Enviar Código de Verificação por E-mail</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* STEP 2: 6-DIGIT EMAIL CODE VERIFICATION (OTP) */}
          {step === 'otp_verify' && (
            <div className="space-y-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Mail className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Insira o Código de 6 Dígitos
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Enviamos o código de segurança para o e-mail{' '}
                  <strong className="text-slate-900 dark:text-slate-200 font-mono">
                    {pendingRegistration?.data.email}
                  </strong>
                  . Digite os dígitos abaixo para validar:
                </p>
              </div>

              {/* 6 Digit Input Blocks */}
              <div
                className="flex items-center justify-center gap-2 sm:gap-3"
                onPaste={handleOtpPaste}
              >
                {otpValues.map((val, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black font-mono rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none shadow-xs"
                  />
                ))}
              </div>

              {otpError && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Actions: Resend, Quick Fill helper, and Open Email Viewer */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    className={`flex items-center gap-1.5 font-medium ${
                      resendCooldown > 0
                        ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        : 'text-amber-600 hover:text-amber-700 dark:text-amber-400 underline'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>
                      {resendCooldown > 0
                        ? `Reenviar código em ${resendCooldown}s`
                        : 'Reenviar código agora'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={openEmailPreview}
                    className="flex items-center gap-1.5 font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>Ver E-mail na Caixa de Entrada</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {/* Instant Test helper for seamless evaluation */}
                {lastGeneratedOtp && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        Ambiente de Demonstração / Teste:
                      </span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        Código Gerado: <span className="text-amber-600 dark:text-amber-400">{lastGeneratedOtp}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleQuickFillOtp}
                      className="px-2.5 py-1 rounded bg-amber-500 text-white font-semibold text-[11px] hover:bg-amber-600 transition-colors"
                    >
                      Preencher e Validar
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  >
                    ← Voltar e alterar dados
                  </button>
                  <button
                    type="button"
                    onClick={() => submitOtpCode(otpValues.join(''))}
                    disabled={otpValues.some(v => v === '')}
                    className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-sm hover:opacity-95 transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: params.primaryColor }}
                  >
                    Confirmar Código
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS & WELCOME */}
          {step === 'success' && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                  E-mail Verificado com Sucesso!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  A sua conta no <strong>{params.appName}</strong> está oficialmente ativa. Enviamos o{' '}
                  <strong className="text-emerald-700 dark:text-emerald-300">E-mail de Boas-vindas</strong> com o roteiro de estudos e as instruções do MININT.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Candidato:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formData.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">E-mail Verificado:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{formData.email} ✓</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Carreira MININT:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{formData.careerTrack}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Província:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{formData.province}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={openWelcomeEmail}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4 text-amber-500" />
                  <span>Ver E-mail de Boas-vindas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl text-white font-bold text-xs shadow-md hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
                  style={{ backgroundColor: params.primaryColor }}
                >
                  <span>Iniciar Preparação Agora</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
