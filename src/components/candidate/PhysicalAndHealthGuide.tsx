import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HeartPulse,
  Activity,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Eye,
  FileCheck,
  PlayCircle
} from 'lucide-react';

export const PhysicalAndHealthGuide: React.FC = () => {
  const { currentUser, params } = useApp();

  // BMI Calculator State
  const [weightKg, setWeightKg] = useState<number>(70);
  const [heightCm, setHeightCm] = useState<number>(175);

  const imc = Number((weightKg / Math.pow(heightCm / 100, 2)).toFixed(1));

  const getImcStatus = (val: number) => {
    if (val < 18.5) {
      return { label: 'Abaixo do Peso (Risco de Inaptidão)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    }
    if (val <= 27.5) {
      return { label: 'Apto para o MININT (Faixa Ideal 18.5 - 27.5)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }
    return { label: 'Sobrepeso Elevado (Risco de Inaptidão)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const imcStatus = getImcStatus(imc);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div>
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
            Módulo B · Fases Posteriores à Prova Escrita
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-600" />
            <span>Guia Oficial de Preparação Física (TAF) & Inspecção Médica</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Manual preparatório estruturado com base nas directrizes da Direcção de Saúde e da Direcção de Instrução e Ensino da Polícia Nacional e MININT.
          </p>
        </div>
      </div>

      {/* IMC Interactive Calculator */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Calculator className="w-5 h-5 text-blue-900" />
          <h4 className="text-sm font-bold text-slate-900">
            Calculadora Biométrica de Aptidão (Índice de Massa Corporal - IMC)
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mt-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                O seu Peso Actual: <strong>{weightKg} kg</strong>
              </label>
              <input
                type="range"
                min="45"
                max="130"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full accent-blue-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                A sua Altura: <strong>{heightCm} cm ({(heightCm / 100).toFixed(2)}m)</strong>
              </label>
              <input
                type="range"
                min="150"
                max="210"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full accent-blue-900"
              />
            </div>
          </div>

          {/* IMC Result Card */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              O Seu Índice IMC
            </span>
            <div className="text-4xl font-black text-slate-900 font-mono mt-1">
              {imc} kg/m²
            </div>
            <div className={`mt-2 text-xs font-bold px-2.5 py-1 rounded-md border ${imcStatus.color}`}>
              {imcStatus.label}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Altura mínima exigida pelo MININT: <strong>1.65m (Masculino)</strong> / <strong>1.60m (Feminino)</strong>.
            </p>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed bg-blue-50/60 p-4 rounded-xl border border-blue-200">
            <strong className="text-blue-950 block mb-1">Critério Oficial da Junta Médica:</strong>
            Candidatos com IMC inferior a 18.5 ou superior a 27.5 são eliminados preventivamente na fase de biometria. Mantenha hidratação e controlo calórico 30 dias antes da convocatória provincial.
          </div>
        </div>
      </div>

      {/* TAF Drills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Drill 1 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase">Prova 1 · Velocidade</span>
            <span className="text-[11px] font-medium text-slate-500">Eliminatória</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Corrida de 100 Metros Rasos</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Avalia a potência anaeróbica e aceleração instantânea em pista aberta ou terra batida.
          </p>
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-600">Masculino:</span>
              <span className="font-bold text-slate-900">&le; 13.8 segundos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Feminino:</span>
              <span className="font-bold text-slate-900">&le; 16.0 segundos</span>
            </div>
          </div>
        </div>

        {/* Drill 2 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase">Prova 2 · Força Muscular</span>
            <span className="text-[11px] font-medium text-slate-500">Eliminatória</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Flexões de Braço no Solo & Barra Fixa</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Execução contínua com tronco alinhado e flexão completa dos cotovelos a 90 graus.
          </p>
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-600">Masculino:</span>
              <span className="font-bold text-slate-900">&ge; 30 repetições / 4 na barra</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Feminino:</span>
              <span className="font-bold text-slate-900">&ge; 20 repetições (apoio de joelho)</span>
            </div>
          </div>
        </div>

        {/* Drill 3 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase">Prova 3 · Resistência Localizada</span>
            <span className="text-[11px] font-medium text-slate-500">Eliminatória</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Flexões Abdominais em 60 Segundos</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Posição decúbito dorsal com joelhos flexionados e mãos fixadas na nuca.
          </p>
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-600">Masculino:</span>
              <span className="font-bold text-slate-900">&ge; 35 repetições em 1 min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Feminino:</span>
              <span className="font-bold text-slate-900">&ge; 28 repetições em 1 min</span>
            </div>
          </div>
        </div>

        {/* Drill 4 */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase">Prova 4 · Fôlego e Resistência Geral</span>
            <span className="text-[11px] font-medium text-slate-500">Eliminatória</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">Corrida de 2.400 Metros (Teste de Cooper)</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Medição do consumo máximo de oxigénio (VO2 Max) em 12 minutos ininterruptos.
          </p>
          <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-600">Masculino:</span>
              <span className="font-bold text-slate-900">Em menos de 12 minutos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Feminino:</span>
              <span className="font-bold text-slate-900">Em menos de 14 minutos e 30 seg</span>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Inspection Checklist */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Eye className="w-5 h-5 text-blue-900" />
          <h4 className="text-sm font-bold text-slate-900">
            Protocolo da Inspecção Médica e Exames Clínicos
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <strong className="text-slate-900 block mb-1">1. Acuidade Visual & Daltonismo</strong>
            Exige-se visão 20/20 em pelo menos um dos olhos com ou sem lentes. O Teste de Ishihara é aplicado para verificar distinção de luzes vermelhas/verdes de trânsito.
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <strong className="text-slate-900 block mb-1">2. Audiometria e Tensão Arterial</strong>
            Pressão arterial em repouso deve situar-se entre $110/70$ mmHg e $135/85$ mmHg. Candidatos hipertensos crónicos são retidos para avaliação secundária.
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <strong className="text-slate-900 block mb-1">3. Toxicologia e Hemograma</strong>
            Triagem toxicológica obrigatória e raio-X ao tórax para exclusão de patologias respiratórias incompatíveis com fardamento operacional.
          </div>
        </div>
      </div>
    </div>
  );
};
