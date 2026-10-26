import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Mail,
  Shield,
  X,
  Check,
  Copy,
  Clock,
  User,
  Inbox,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Send,
  Calendar,
  Award
} from 'lucide-react';
import { EmailNotificationItem } from '../../types';

export const EmailInboxModal: React.FC = () => {
  const {
    isEmailViewerOpen,
    setIsEmailViewerOpen,
    inboxEmails,
    selectedEmail,
    setSelectedEmail,
    markEmailAsRead,
    params,
    currentUser,
  } = useApp();

  const [copiedCode, setCopiedCode] = useState(false);

  if (!isEmailViewerOpen) return null;

  const currentEmail: EmailNotificationItem =
    selectedEmail || (inboxEmails.length > 0 ? inboxEmails[0] : null as unknown as EmailNotificationItem);

  const handleSelect = (email: EmailNotificationItem) => {
    setSelectedEmail(email);
    markEmailAsRead(email.id);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[85vh] max-h-[750px]">
        {/* Top bar of Mailbox */}
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Caixa de Correio Eletrônico do Candidato</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {inboxEmails.length} Mensagens
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Serviço de Envio de E-mails e Notificações Oficiais MININT Angola
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEmailViewerOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master-Detail Split Screen */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Email List */}
          <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Inbox className="w-3.5 h-3.5" />
                <span>Entrada</span>
              </span>
              <span className="text-[10px] text-slate-400">candidaturas.minint.ao</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {inboxEmails.map((email) => {
                const isSelected = currentEmail?.id === email.id;
                return (
                  <button
                    key={email.id}
                    onClick={() => handleSelect(email)}
                    className={`w-full text-left p-3.5 transition-colors relative flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-amber-50/70 dark:bg-amber-950/25 border-l-4 border-amber-500'
                        : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {email.type === 'verification_code' ? 'Código de Segurança' : 'Boas-vindas MININT'}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {email.sentAt}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {email.subject}
                    </p>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      Para: {email.to}
                    </p>

                    {email.type === 'verification_code' && email.code && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/60 px-2 py-0.5 rounded w-fit border border-amber-200 dark:border-amber-800/50">
                        OTP: {email.code}
                      </span>
                    )}

                    {!email.read && (
                      <span className="absolute top-3.5 right-2 w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Email Content Viewer */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-slate-900">
            {currentEmail ? (
              <div className="p-6 space-y-6">
                {/* Email Header */}
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {currentEmail.subject}
                    </h2>
                    <span className="text-xs font-mono text-slate-400 shrink-0">
                      {currentEmail.sentAt}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-xs">
                        MI
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          Comissão de Concursos MININT &lt;concursos@aprove.minint.ao&gt;
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Para: {currentEmail.toName} &lt;{currentEmail.to}&gt;
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-600 dark:text-slate-300">
                      Certificado DKIM / TLS Seguro
                    </span>
                  </div>
                </div>

                {/* Email Body Card */}
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-6">
                  {/* Institutional Header within Email */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                        style={{ backgroundColor: params.primaryColor }}
                      >
                        <Shield className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 block">
                          República de Angola
                        </span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400">
                          Ministério do Interior · Concurso de Ingresso Externo
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      Oficial
                    </span>
                  </div>

                  {/* If Verification Code */}
                  {currentEmail.type === 'verification_code' && currentEmail.code && (
                    <div className="p-5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-center space-y-3">
                      <span className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block">
                        Seu Código de Confirmação de E-mail
                      </span>

                      <div className="flex items-center justify-center gap-3">
                        <span className="text-3xl font-black font-mono tracking-widest text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 px-6 py-2 rounded-xl border border-amber-300 dark:border-amber-800 shadow-xs">
                          {currentEmail.code}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleCopyCode(currentEmail.code!)}
                          className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                          title="Copiar Código"
                        >
                          {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span className="hidden sm:inline">
                            {copiedCode ? 'Copiado!' : 'Copiar'}
                          </span>
                        </button>
                      </div>

                      <p className="text-[11px] text-amber-800 dark:text-amber-300/80">
                        Insira este código na tela de validação do AproVE para concluir seu cadastro.
                        Válido por 10 minutos.
                      </p>
                    </div>
                  )}

                  {/* Formatted Text Content */}
                  <div className="text-xs text-slate-700 dark:text-slate-300 space-y-3 leading-relaxed whitespace-pre-line font-normal">
                    {currentEmail.htmlPreview}
                  </div>

                  {/* Email Footer Banner */}
                  <div className="border-t border-slate-200 dark:border-slate-700/80 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 gap-2">
                    <span>
                      Dúvidas? Contacte o suporte: <strong>candidaturas@minint.ao</strong>
                    </span>
                    <a
                      href="https://candidaturas.minint.ao"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      <span>Aceder Portal Oficial</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                Selecione uma mensagem para ler
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
