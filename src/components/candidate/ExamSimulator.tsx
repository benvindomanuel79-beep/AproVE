import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Question } from '../../types';
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Crown,
  Sparkles,
  BookOpen
} from 'lucide-react';

export const ExamSimulator: React.FC = () => {
  const {
    questions,
    recordExamAttempt,
    currentUser,
    setIsPaywallOpen,
    params,
    setCandidateTab,
    generateAiExam,
    isGeneratingAiQuestions,
  } = useApp();

  // Test state
  const [examActive, setExamActive] = useState<boolean>(false);
  const [examFinished, setExamFinished] = useState<boolean>(false);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(45 * 60); // 45 minutes
  const [examResults, setExamResults] = useState<{
    correctCount: number;
    total: number;
    percentage: number;
    categoryBreakdown: Record<string, { total: number; correct: number }>;
  } | null>(null);

  // Timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examActive && !examFinished && timeLeftSeconds > 0) {
      timer = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examActive, examFinished, timeLeftSeconds]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    setSelectedAnswers({});
    setCurrentIdx(0);
    setTimeLeftSeconds(45 * 60);
    setExamFinished(false);
    setExamResults(null);
    setExamActive(true);
  };

  const handleSelectOption = (questionId: string, optId: 'A' | 'B' | 'C' | 'D') => {
    if (examFinished) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optId,
    }));
  };

  const handleFinishExam = () => {
    setExamActive(false);
    setExamFinished(true);

    let correct = 0;
    const catMap: Record<string, { total: number; correct: number }> = {};

    questions.forEach((q) => {
      if (!catMap[q.category]) {
        catMap[q.category] = { total: 0, correct: 0 };
      }
      catMap[q.category].total += 1;

      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct += 1;
        catMap[q.category].correct += 1;
      }
    });

    const total = questions.length;
    const percentage = Number(((correct / total) * 100).toFixed(1));

    setExamResults({
      correctCount: correct,
      total,
      percentage,
      categoryBreakdown: catMap,
    });

    // Save into history
    recordExamAttempt({
      date: new Date().toISOString().split('T')[0],
      totalQuestions: total,
      correctAnswers: correct,
      scorePercentage: percentage,
      durationSeconds: 45 * 60 - timeLeftSeconds,
      categoryScores: catMap,
    });
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="space-y-6">
      {/* Simulation Banner / Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                Módulo B · Preparação de Alta Performance
              </span>
              {!currentUser.isSubscribed && (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  <span>Modo Avaliação Diagnóstica</span>
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Simulador de Provas Digitais (Padrão MININT 2026)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Ambiente de teste idêntico ao exame presencial: 45 minutos cronometrados, navegação por folha de respostas e correcção comentada com fundamentação legal angolana.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!currentUser.isSubscribed && (
              <button
                onClick={() => setIsPaywallOpen(true)}
                className="text-xs font-bold text-white px-3 py-2 rounded-lg shadow-xs flex items-center gap-1.5 transition-opacity cursor-pointer"
                style={{ backgroundColor: params.secondaryColor }}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Desbloquear 2.000 Questões</span>
              </button>
            )}

            {!examActive && (
              <>
                <button
                  disabled={isGeneratingAiQuestions}
                  onClick={async () => {
                    await generateAiExam({ count: 8 });
                    handleStartExam();
                  }}
                  className="text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>
                    {isGeneratingAiQuestions ? 'A Gerar com Gemini...' : 'Gerar Simulado com IA (Gemini)'}
                  </span>
                </button>

                <button
                  onClick={handleStartExam}
                  className="text-xs font-bold text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  style={{ backgroundColor: params.primaryColor }}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Iniciar Prova ({questions.length} Qs)</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* When Exam is NOT Active and NOT Finished */}
      {!examActive && !examFinished && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="text-sm font-bold text-slate-900">Cronómetro Regressivo Oficial</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              O exame segue rigorosamente o tempo de 45 minutos estipulado pelo Júri Nacional do MININT para testar a sua velocidade de raciocínio sob pressão.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="text-sm font-bold text-slate-900">Psicotécnico & Legislação</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Questões calibradas de Lógica, Raciocínio Verbal, Raciocínio Espacial, Numérico, Cultura Geral de Angola e Regime da Função Pública.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="text-sm font-bold text-slate-900">Garantia Risco Zero 80%+</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              As notas registadas alimentam o seu Termómetro de Aprovação. Atingindo 80%+ de média você torna-se elegível ao selo de aprovação ou reembolso integral.
            </p>
          </div>
        </div>
      )}

      {/* Active Exam Interface */}
      {examActive && currentQ && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Top Timer Bar */}
          <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-800 text-blue-100">
                Questão {currentIdx + 1} de {questions.length}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {currentQ.category}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 font-mono text-sm font-bold text-amber-400">
                <Clock className="w-4 h-4" />
                <span>{formatTimer(timeLeftSeconds)}</span>
              </div>

              <button
                onClick={handleFinishExam}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                Concluir Prova
              </button>
            </div>
          </div>

          {/* Question Body */}
          <div className="p-6">
            <div className="mb-6">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Dificuldade: {currentQ.difficulty.toUpperCase()}
              </span>
              <h3 className="text-base font-semibold text-slate-900 leading-relaxed">
                {currentQ.questionText}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQ.options.map((opt) => {
                const isSelected = selectedAnswers[currentQ.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`w-full p-4 rounded-xl text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-3 border ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50/80 text-blue-950 font-semibold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected
                          ? 'bg-blue-900 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className="leading-snug">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation & Question Grid */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                <button
                  disabled={currentIdx === questions.length - 1}
                  onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <span>Seguinte</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Answer Sheet Quick Nav */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {questions.map((q, idx) => {
                  const isAns = !!selectedAnswers[q.id];
                  const isCurr = idx === currentIdx;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-7 h-7 rounded text-xs font-bold transition-all ${
                        isCurr
                          ? 'ring-2 ring-blue-900 bg-blue-900 text-white'
                          : isAns
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exam Results & Review */}
      {examFinished && examResults && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  Avaliação Concluída com Sucesso
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  Resultado: {examResults.percentage}% de Aproveitamento
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Acertos: {examResults.correctCount} de {examResults.total} questões (Nota: {((examResults.percentage / 100) * 20).toFixed(1)} / 20 valores)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleStartExam}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-800 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Repetir Simulado</span>
                </button>

                <button
                  onClick={() => setCandidateTab('termometro')}
                  className="px-4 py-2 text-xs font-bold rounded-lg text-white shadow-xs"
                  style={{ backgroundColor: params.primaryColor }}
                >
                  Ver no Termómetro de Aprovação →
                </button>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="mt-6">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Desempenho por Módulo de Conhecimento:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(examResults.categoryBreakdown).map(([cat, data]) => {
                  const pct = Math.round((data.correct / data.total) * 100);
                  const isHigh = pct >= 80;
                  return (
                    <div key={cat} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                        <span className="truncate pr-2">{cat}</span>
                        <span className={isHigh ? 'text-emerald-700' : 'text-amber-700'}>
                          {data.correct}/{data.total} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isHigh ? 'bg-emerald-600' : 'bg-amber-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Question Review with Rationale */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Gabarito Oficial Comentado & Fundamentação Lógica</span>
            </h4>

            {questions.map((q, idx) => {
              const userAns = selectedAnswers[q.id];
              const isCorrect = userAns === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-xl border bg-white shadow-xs ${
                    isCorrect ? 'border-emerald-200' : 'border-rose-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">
                      Questão {idx + 1} · {q.category}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Acertou (+1 valor)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          <span>Errou (Sua resposta: {userAns || 'Em branco'})</span>
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-900 mb-3">{q.questionText}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-xs">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`p-2.5 rounded-lg border ${
                          opt.id === q.correctAnswer
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                            : opt.id === userAns
                            ? 'bg-rose-50 border-rose-300 text-rose-950'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="font-mono font-bold mr-1.5">{opt.id})</span>
                        <span>{opt.text}</span>
                        {opt.id === q.correctAnswer && (
                          <span className="ml-2 text-[10px] text-emerald-700 font-bold uppercase">(Correta)</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200 text-xs text-slate-700 leading-relaxed">
                    <strong className="text-blue-900 block mb-0.5">Explicação / Fundamentação:</strong>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
