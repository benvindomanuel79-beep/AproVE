import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell
} from 'recharts';
import { mockDailyStudyProgress } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import {
  Target,
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  Info
} from 'lucide-react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isGoalAchieved = data.questionsResolved >= data.targetQuestions;
    const completionPct = Math.round((data.questionsResolved / data.targetQuestions) * 100);

    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs max-w-xs space-y-2 font-sans">
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
          <span className="font-bold text-amber-400">{data.dateStr}</span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isGoalAchieved ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-900/60 text-amber-300'
            }`}
          >
            {completionPct}% da Meta
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
            Tópico Oficial do Cronograma MININT:
          </span>
          <span className="text-xs font-semibold text-slate-200 block mt-0.5">
            {data.cronogramaTopic}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[11px] font-mono tabular-nums">
          <div>
            <span className="text-slate-400 block font-sans">Resolvidas:</span>
            <span className="text-white font-bold">{data.questionsResolved} questões</span>
          </div>
          <div>
            <span className="text-slate-400 block font-sans">Meta MININT:</span>
            <span className="text-slate-300 font-bold">{data.targetQuestions} questões</span>
          </div>
          <div>
            <span className="text-slate-400 block font-sans">Taxa de Acerto:</span>
            <span className="text-emerald-400 font-bold">{data.accuracyRate}%</span>
          </div>
          <div>
            <span className="text-slate-400 block font-sans">Tempo de Estudo:</span>
            <span className="text-amber-300 font-bold">{data.studyMinutes} min</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const StudyProgressChart: React.FC = () => {
  const { params, setCandidateTab } = useApp();
  const [metricView, setMetricView] = useState<'questions' | 'accuracy'>('questions');

  const totalResolved = mockDailyStudyProgress.reduce((acc, curr) => acc + curr.questionsResolved, 0);
  const totalTarget = mockDailyStudyProgress.reduce((acc, curr) => acc + curr.targetQuestions, 0);
  const overallRate = Math.round((totalResolved / totalTarget) * 100);
  const avgAccuracy = (
    mockDailyStudyProgress.reduce((acc, curr) => acc + curr.accuracyRate, 0) /
    mockDailyStudyProgress.length
  ).toFixed(1);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-6 transition-colors">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Dashboard do Candidato · Cronograma Oficial MININT
            </span>
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              Reta Final 2026
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-500" />
            <span>Progresso Diário nas Metas de Estudo (Cronograma MININT)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Acompanhamento diário das questões resolvidas em relação à meta preconizada para aprovação nas provas escritas do Ministério do Interior.
          </p>
        </div>

        {/* View switcher buttons adhering to zero-pill discipline */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start md:self-auto border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setMetricView('questions')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              metricView === 'questions'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Questões vs Meta
          </button>
          <button
            onClick={() => setMetricView('accuracy')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              metricView === 'accuracy'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Taxa de Acerto (%)
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Total Resolvidas</span>
          <div className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            {totalResolved}{' '}
            <span className="text-xs font-sans font-normal text-slate-400">/ {totalTarget}</span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">{overallRate}% da meta semanal</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Aproveitamento Médio</span>
          <div className="text-xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400 mt-0.5">
            {avgAccuracy}%
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Acima do corte ({params.riskZeroThresholdPercent}%)</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Sequência de Estudos</span>
          <div className="text-xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>7 Dias</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Reta final ininterrupta</span>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Meta de Hoje (24 Out)</span>
          <div className="text-xl font-bold font-mono tabular-nums text-blue-900 dark:text-blue-300 mt-0.5">
            42 / 50
          </div>
          <span className="text-[11px] text-blue-800 dark:text-blue-400 font-medium">84% concluído hoje</span>
        </div>
      </div>

      {/* Main Recharts Bar Chart */}
      <div className="pt-2">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {metricView === 'questions' ? (
              <BarChart
                data={mockDailyStudyProgress}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="dayLabel"
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tick={{ fill: '#475569', fontSize: 11 }}
                  domain={[0, 60]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '14px', fontSize: '12px' }}
                  formatter={(value) => {
                    if (value === 'questionsResolved') return 'Questões Resolvidas';
                    if (value === 'targetQuestions') return 'Meta do Cronograma MININT';
                    return value;
                  }}
                />
                <ReferenceLine
                  y={40}
                  stroke="#D97706"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Média Desejada (40 Qs)',
                    fill: '#D97706',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                {/* Projected Goal Bar (Subdued structural color) */}
                <Bar
                  dataKey="targetQuestions"
                  name="targetQuestions"
                  fill="#CBD5E1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                {/* Actual Resolved Questions Bar (Primary Institutional Blue / Highlight) */}
                <Bar
                  dataKey="questionsResolved"
                  name="questionsResolved"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                >
                  {mockDailyStudyProgress.map((entry, index) => {
                    const isGoalAchieved = entry.questionsResolved >= entry.targetQuestions;
                    const isToday = index === mockDailyStudyProgress.length - 1;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isToday ? '#D97706' : isGoalAchieved ? '#0A2540' : '#3B82F6'}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            ) : (
              <BarChart
                data={mockDailyStudyProgress}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="dayLabel"
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tick={{ fill: '#475569', fontSize: 11 }}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ paddingTop: '14px', fontSize: '12px' }}
                  formatter={() => 'Taxa de Acertos nos Simulados (%)'}
                />
                <ReferenceLine
                  y={params.riskZeroThresholdPercent}
                  stroke="#10B981"
                  strokeWidth={1.5}
                  label={{
                    value: `Ponto de Corte Risco Zero (${params.riskZeroThresholdPercent}%)`,
                    fill: '#059669',
                    fontSize: 11,
                    position: 'insideTopLeft',
                  }}
                />
                <Bar
                  dataKey="accuracyRate"
                  name="accuracyRate"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                >
                  {mockDailyStudyProgress.map((entry, index) => {
                    const isAboveCut = entry.accuracyRate >= params.riskZeroThresholdPercent;
                    return (
                      <Cell
                        key={`cell-acc-${index}`}
                        fill={isAboveCut ? '#059669' : '#F59E0B'}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Banner linking to the simulator and official schedule */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <BookOpen className="w-4 h-4 text-blue-900 shrink-0" />
          <span>
            Hoje no Cronograma MININT:{' '}
            <strong className="text-slate-900">Simulado Geral Cronometrado MININT (Reta Final)</strong>. Faltam 8 questões para cumprir a meta do dia!
          </span>
        </div>

        <button
          onClick={() => setCandidateTab('simulador')}
          className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <span>Completar Meta no Simulador</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
