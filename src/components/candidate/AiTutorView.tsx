import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  Clock,
  BookOpen,
  Scale,
  Brain,
  ShieldCheck,
  RotateCcw,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  source?: string;
}

const quickChips = [
  {
    icon: Brain,
    label: 'Explicar Silogismos e Lógica',
    prompt: 'Podes explicar de forma simples e com exemplos de concursos em Angola como resolver questões de silogismos e raciocínio lógico dedutivo?',
  },
  {
    icon: Scale,
    label: 'Deveres na CRA 2010',
    prompt: 'Quais são os deveres fundamentais do funcionário público e das forças de ordem de acordo com a Constituição da República de Angola (CRA 2010)?',
  },
  {
    icon: BookOpen,
    label: 'Geografia de Angola',
    prompt: 'Quais são os pontos essenciais de Geografia e História de Angola que costumam sair nos exames da função pública e MININT?',
  },
  {
    icon: Clock,
    label: 'Estratégia dos 45 minutos',
    prompt: 'Como devo gerir o meu tempo durante a prova digital de 45 minutos com 50 perguntas para não ficar sem tempo?',
  },
  {
    icon: ShieldCheck,
    label: 'Dicas para o TAF (Físico)',
    prompt: 'Que rotina de preparação física semanal recomendas para passar nos testes de cooper, flexões e abdominais da PNA/MININT?',
  },
];

export const AiTutorView: React.FC = () => {
  const { currentUser, params } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: `Olá, ${currentUser.name || 'Candidato(a)'}! Sou o teu Treinador AproVE.\n\nEstou aqui para tirar dúvidas sobre matérias dos exames de admissão (Lógica, Psicotécnicos, CRA 2010, Língua Portuguesa e Conhecimentos de Angola) ou orientar a tua estratégia de estudo e preparação física para a carreira de **${currentUser.careerTrack || 'Polícia Nacional (PNA)'}**.\n\nQual é a tua dúvida hoje? Podes clicar numa das sugestões abaixo ou digitar diretamente.`,
      timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      source: 'AproVE Mentor',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsgId = 'msg-' + Date.now();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newUserMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          candidateName: currentUser.name || 'Candidato',
          career: currentUser.careerTrack || 'Polícia Nacional (PNA)',
          context: `Província: ${currentUser.province}. Carreira: ${currentUser.careerTrack}. Preparação intensiva para o exame MININT 2026.`,
        }),
      });

      const data = await response.json();
      const tutorReply = data.reply || 'Não foi possível gerar a resposta no momento. Revise os tópicos no Centro de Estudos.';

      const newTutorMsg: ChatMessage = {
        id: 'tutor-' + Date.now(),
        sender: 'tutor',
        text: tutorReply,
        timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        source: data.source || 'gemini-3.8-flash',
      };

      setMessages(prev => [...prev, newTutorMsg]);
    } catch (err: any) {
      console.error('Tutor chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: 'tutor-err-' + Date.now(),
        sender: 'tutor',
        text: `Prezado(a) ${currentUser.name}, estamos a reforçar a ligação do servidor. Enquanto isso, consulte o Centro de Estudos na aba ao lado com resumos completos da CRA 2010 e testes práticos comentados!`,
        timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        source: 'AproVE Guia Local',
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'tutor',
        text: `Olá novamente, ${currentUser.name || 'Candidato'}! Conversa reiniciada. Em que posso te orientar hoje?`,
        timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        source: 'AproVE Mentor',
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#10233F] via-[#1A365D] to-[#10233F] rounded-2xl p-6 text-white shadow-sm border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Meu Treinador AproVE</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                IA Pedagógica Especializada
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1">
              Orientador 24/7 focado no programa do concurso MININT, legislação de Angola (CRA 2010) e psicotécnicos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={resetChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
            title="Limpar e reiniciar conversa"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpar Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[650px] overflow-hidden">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-[#10233F] text-amber-400 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm transition-colors ${
                    isUser
                      ? 'bg-[#10233F] text-white rounded-tr-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 text-[11px] opacity-75">
                    <span className="font-semibold">{isUser ? 'Você' : 'Treinador AproVE'}</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                    {msg.text.split('\n\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>

                  {!isUser && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="italic text-[10px]">
                        Fonte: {msg.source || 'Base Pedagógica AproVE'}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(msg.text, msg.id)}
                        className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
                        title="Copiar resposta"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-[#10233F] text-amber-400 flex items-center justify-center shrink-0 mt-1 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-xs px-4 py-3 text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs ml-1 font-medium">O Treinador AproVE está a fundamentar a explicação...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-medium">Perguntas frequentes e tópicos-chave para o MININT:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {quickChips.map((chip, idx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSendMessage(chip.prompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-colors shadow-2xs hover:border-[#10233F]/30 disabled:opacity-50"
                >
                  <Icon className="w-3.5 h-3.5 text-amber-500" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Pergunta algo sobre legislação, raciocínio lógico, dicas de exame..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#10233F] dark:focus:ring-amber-400/40 disabled:opacity-60 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-[#10233F] hover:bg-[#1A365D] text-white font-medium text-sm flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              style={{ backgroundColor: params.primaryColor }}
            >
              <Send className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
          <div className="mt-2 text-center text-[11px] text-slate-400">
            Orientação educacional independente · O Treinador AproVE auxilia na compreensão de conteúdos oficiais.
          </div>
        </div>
      </div>
    </div>
  );
};
