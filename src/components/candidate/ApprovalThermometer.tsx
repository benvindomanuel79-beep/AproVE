import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Flame,
  ArrowUpRight,
  BookOpen
} from 'lucide-react';

export const ApprovalThermometer: React.FC = () => {
  const { attempts, params, setCandidateTab, setIsPaywallOpen, currentUser } = useApp();

  // Predictive algorithm calculation
  const metrics = useMemo(() => {
    if (attempts.length === 0) {
      return {
        probability: 45,
        avgScore: 0,
        testsCount: 0,
        status: 'low',
        categoryAverages: {} as Record<string, number>,
      };
    }

    const totalTests = attempts.length;
    // Exponential weighting favoring recent tests
    let weightedSum = 0;
    let weightSum = 0;

    attempts.forEach((att, idx) => {
      // most recent is idx 0
      const weight = Math.exp(-idx * 0.25);
      weightedSum += att.scorePercentage * weight;
      weightSum += weight;
    });

    const weightedAvg = weightedSum / weightSum;

    // Consistency penalty
    const rawScores = attempts.map((a) => a.scorePercentage);
    const mean = rawScores.reduce((a, b) => a + b, 0) / rawScores.length;
    const variance = rawScores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / rawScores.length;
    const stdDev = Math.sqrt(variance);

    // Coverage multiplier (minimum recommended 3 tests)
    const coverage = Math.min(1.0, 0.7 + (totalTests * 0.1));

    // Final predicted probability
    let prob = Math.round(weightedAvg * coverage - (stdDev * 0.2));
    prob = Math.max(10, Math.min(98, prob));

    let status: 'high' | 'medium' | 'low' = 'low';
    if (prob >= params.riskZeroThresholdPercent) {
      status = 'high';
    } else if (prob >= 65) {
      status = 'medium';
    }

    // Category aggregation
    const catTotals: Record<string, { total: number; correct: number }> = {};
    attempts.forEach((att) => {
      Object.entries(att.categoryScores).forEach(([cat, data]) => {
        if (!catTotals[cat]) catTotals[cat] = { total: 0, correct: 0 };
        catTotals[cat].total += data.total;
        catTotals[cat].correct += data.correct;
      });
    });

    const categoryAverages: Record<string, number> = {};
    Object.entries(catTotals).forEach(([cat, data]) => {
      categoryAverages[cat] = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
    });

    return {
      probability: prob,
      avgScore: Number(mean.toFixed(1)),
      testsCount: totalTests,
      status,
      categoryAverages,
    };
  }, [attempts, params.riskZeroThresholdPercent]);

  const getThermometerColor = () => {
    if (metrics.status === 'high') return 'from-emerald-500 to-emerald-600';
    if (metrics.status === 'medium') return 'from-amber-500 to-amber-600';
    return 'from-rose-500 to-rose-600';
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Módulo B · Inteligência Preditiva Ponderada
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>Termómetro de Aprovação no Concurso MININT</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              O algoritmo avalia o seu histórico de simulados, a estabilidade de acertos e o peso das disciplinas para estimar a sua probabilidade matemática de ingresso.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Média Geral:</span>
            <span className="font-bold text-slate-900">{metrics.avgScore}%</span>
            <span className="text-slate-300">·</span>
            <span className="text-slate-500">Simulados Feitos:</span>
            <span className="font-bold text-slate-900">{metrics.testsCount}</span>
          </div>
        </div>
      </div>

      {/* Main Thermometer Gauge Card */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Circular / Large Percentage Meter */}
          <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Probabilidade Calculada
            </span>
            <div className="text-5xl font-black tracking-tight text-slate-900 mt-2 font-mono">
              {metrics.probability}%
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {metrics.status === 'high' ? (
                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  <span>Zona de Ingresso</span>
                </span>
              ) : metrics.status === 'medium' ? (
                <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Zona Intermediária</span>
                </span>
              ) : (
                <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Risco Crítico de Reprovação</span>
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 mt-2">
              Meta de corte recomendada: {params.riskZeroThresholdPercent}%
            </span>
          </div>

          {/* Bar Gauge & Diagnostic Text */}
          <div className="lg:col-span-2 space-y-4">
            {/* Visual Bar with Markers */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                <span>0% Risco Extremo</span>
                <span>Nota de Corte ({params.riskZeroThresholdPercent}%)</span>
                <span>100% Certeza de Admissão</span>
              </div>
              <div className="w-full bg-slate-200 h-5 rounded-full overflow-hidden p-1 shadow-inner relative">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${getThermometerColor()} transition-all duration-700`}
                  style={{ width: `${metrics.probability}%` }}
                />
                {/* 80% Threshold Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-slate-900"
                  style={{ left: `${params.riskZeroThresholdPercent}%` }}
                  title="Ponto de corte 80%"
                />
              </div>
            </div>

            {/* Diagnostic Message */}
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed ${
                metrics.status === 'high'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : metrics.status === 'medium'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {metrics.status === 'high' ? (
                <div>
                  <strong className="block text-sm font-bold text-emerald-950 mb-1">
                    Excelente Desempenho! Você está na Faixa de Aprovação do MININT.
                  </strong>
                  O seu rendimento médio ({metrics.avgScore}%) supera os 80% exigidos. Se mantiver esta consistência na prova real, as suas chances de nomeação nas vagas da PNA/SIC/SME são expressivas. Você também é elegível à <strong>Garantia de Risco Zero</strong>.
                </div>
              ) : metrics.status === 'medium' ? (
                <div>
                  <strong className="block text-sm font-bold text-amber-950 mb-1">
                    Zona de Atenção: Probabilidade Intermediária ({metrics.probability}%).
                  </strong>
                  Você possui bom domínio básico, mas ainda está vulnerável ao ponto de corte competitivo do MININT. Recomendamos realizar mais 3 simulados completos com foco nos tópicos de raciocínio espacial e legislação da função pública.
                </div>
              ) : (
                <div>
                  <strong className="block text-sm font-bold text-rose-950 mb-1">
                    ALERTA CRÍTICO: Risco Iminente de Eliminação na Prova Escrita!
                  </strong>
                  O seu rendimento actual ({metrics.avgScore}%) está abaixo da nota de corte exigida para o concurso do MININT. Centenas de milhares de candidatos estão a concorrer pelas mesmas vagas. É urgente intensificar o treino de resolução de questões comentadas para elevar a sua pontuação acima de 80%.
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setCandidateTab('simulador')}
                className="px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                style={{ backgroundColor: params.primaryColor }}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Fazer Novo Simulado para Subir Nota</span>
              </button>

              {!currentUser.isSubscribed && (
                <button
                  onClick={() => setIsPaywallOpen(true)}
                  className="px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-xs flex items-center gap-1.5"
                  style={{ backgroundColor: params.secondaryColor }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Activar Acesso Ilimitado & Garantia de Risco Zero</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Domain Breakdown Bars */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-4">
          Análise de Competências por Área de Avaliação:
        </h4>

        <div className="space-y-3.5">
          {Object.entries(metrics.categoryAverages).length > 0 ? (
            Object.entries(metrics.categoryAverages).map(([cat, score]) => (
              <div key={cat}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">{cat}</span>
                  <span
                    className={`font-mono font-bold ${
                      score >= 80 ? 'text-emerald-700' : score >= 60 ? 'text-amber-700' : 'text-rose-700'
                    }`}
                  >
                    {score}% {score >= 80 ? '· Forte' : score >= 60 ? '· Regular' : '· Atenção Necessária'}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      score >= 80 ? 'bg-emerald-600' : score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500">
              Faça o seu primeiro simulado digital para carregar as métricas por categoria.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
