import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Scale,
  Brain,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowRight,
  Lock,
  Layers,
  FileText
} from 'lucide-react';

interface StudyTopic {
  id: string;
  subject: string;
  category: 'legislacao' | 'psicotecnico' | 'conhecimentos';
  title: string;
  summary: string;
  legalReference?: string;
  keyPoints: string[];
  practiceQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  isPremiumOnly?: boolean;
}

const studyTopicsData: StudyTopic[] = [
  {
    id: 'top-cra-2010',
    subject: 'Legislação e Função Pública',
    category: 'legislacao',
    title: 'Constituição da República de Angola (CRA 2010) — Princípios Fundamentais',
    legalReference: 'CRA 2010 · Artigos 1.º ao 21.º (Estado de Direito e Soberania)',
    summary: 'A República de Angola é um Estado Democrático de Direito baseado na soberania popular, na dignidade da pessoa humana e no primado da Constituição e da lei. A segurança pública é dever do Estado exercido pelos órgãos policiais com estrita observância dos direitos humanos.',
    keyPoints: [
      'A soberania é una e indivisível e pertence ao povo, que a exerce através de sufrágio universal.',
      'Os órgãos do MININT atuam subordinados à Constituição e à salvaguarda dos direitos fundamentais.',
      'A função pública assenta no princípio da legalidade, igualdade e neutralidade política.'
    ],
    practiceQuestion: {
      question: 'Segundo o artigo 2.º da Constituição da República de Angola, em que se baseia o Estado Democrático de Direito?',
      options: [
        'Apenas na hierarquia militar e policial.',
        'Na soberania popular, primado da Constituição e dignidade da pessoa humana.',
        'Exclusivamente na autoridade dos governadores provinciais.',
        'Nas decisões discricionárias do comando de divisão.'
      ],
      correctIndex: 1,
      explanation: 'Correta: B. Conforme estipulado expressamente no Artigo 2.º da CRA de 2010, o Estado Democrático de Direito fundamenta-se na soberania popular, na dignidade humana e no primado da lei.'
    }
  },
  {
    id: 'top-probidade',
    subject: 'Legislação e Função Pública',
    category: 'legislacao',
    title: 'Lei da Probidade Pública e Regime Disciplinar',
    legalReference: 'Lei n.º 3/10 (Probidade Pública) e Estatuto da Carreira Policial',
    summary: 'A probidade pública assegura a moralidade, a transparência e a lealdade institucional. É expressamente vedado ao agente público obter vantagens patrimoniais indevidas ou praticar atos lesivos ao patrimônio do Estado.',
    keyPoints: [
      'Princípio da Legalidade: atuação estrita dentro das competências outorgadas por lei.',
      'Princípio da Imparcialidade: proibição de privilégios familiares ou de compadrio.',
      'Conflito de Interesses: obrigatoriedade de comunicação de impedimento legal.'
    ],
    practiceQuestion: {
      question: 'O agente do MININT que aceitar gratificação financeira de terceiros para acelerar um expediente comete que infração?',
      options: [
        'Apenas falta de pontualidade leve.',
        'Atos de enriquecimento ilícito violadores da Lei da Probidade Pública.',
        'Prática admissível com autorização verbal do superior.',
        'Nenhuma infração se o processo for despachado no mesmo dia.'
      ],
      correctIndex: 1,
      explanation: 'Correta: B. A aceitação de qualquer vantagem patrimonial no exercício de funções públicas constitui grave violação do dever de probidade e legalidade.'
    }
  },
  {
    id: 'top-psico-logica',
    subject: 'Testes Psicotécnicos',
    category: 'psicotecnico',
    title: 'Raciocínio Lógico Dedutivo e Silogismos Policiais',
    summary: 'O teste psicotécnico de lógica avalia a capacidade do candidato de deduzir conclusões necessárias a partir de premissas dadas, sem emitir opiniões pessoais subjetivas.',
    keyPoints: [
      'Premissa Maior + Premissa Menor = Conclusão necessária.',
      'Atenção às palavras universais ("todos", "nenhum") vs particulares ("alguns").',
      'Não confunda "alguns" com "todos". Se alguns agentes utilizam rádio, não significa que todos utilizem.'
    ],
    practiceQuestion: {
      question: 'Premissa 1: Todos os motoristas operacionais da patrulha possuem carta profissional. Premissa 2: O candidato Mateus não possui carta profissional. Qual a dedução irrefutável?',
      options: [
        'Mateus pode conduzir patrulhas aos fins de semana.',
        'Mateus não é motorista operacional da patrulha.',
        'Mateus será reprovado no exame médico.',
        'Mateus trabalha na comarca provincial.'
      ],
      correctIndex: 1,
      explanation: 'Correta: B. Pelo princípio do Modus Tollens: se todos os motoristas possuem carta e Mateus não possui carta, Mateus não pode pertencer ao grupo de motoristas operacionais da patrulha.'
    }
  },
  {
    id: 'top-psico-numerico',
    subject: 'Testes Psicotécnicos',
    category: 'psicotecnico',
    title: 'Sequências Numéricas e Regularidades Aritméticas',
    summary: 'Identificação rápida da regra oculta (adição alternada, multiplicação, quadrados perfeitos ou progressão aritmética) para antecipar o próximo elemento em menos de 45 segundos.',
    keyPoints: [
      'Calcule as diferenças entre termos consecutivos: d1, d2, d3...',
      'Observe se as diferenças formam uma progressão geométrica ou dobrada (+2, +4, +8...).',
      'Cuidado com séries intercaladas com dois padrões paralelos (posições pares e ímpares).'
    ],
    practiceQuestion: {
      question: 'Qual é o número que completa logicamente a sequência: 4, 7, 13, 25, 49, ___ ?',
      options: ['85', '97', '98', '101'],
      correctIndex: 1,
      explanation: 'Correta: B (97). A regra é: (termo anterior × 2) - 1. Logo: 4×2-1=7; 7×2-1=13; 13×2-1=25; 25×2-1=49; 49×2-1 = 97.'
    }
  },
  {
    id: 'top-geografia-angola',
    subject: 'Conhecimentos Gerais de Angola',
    category: 'conhecimentos',
    title: 'Geografia Física e Divisão Político-Administrativa',
    summary: 'Conhecimento aprofundado das 18 províncias da República de Angola, principais capitais provinciais, bacias hidrográficas e reservas estratégicas de recursos.',
    keyPoints: [
      'Angola possui 18 províncias, sendo Luanda a capital política e Huambo o centro do planalto central.',
      'O Rio Kwanza é o maior rio totalmente angolano e desagua no Oceano Atlântico em Barra do Kwanza.',
      'O Rio Cunene faz a fronteira natural sul com a República da Namíbia.'
    ],
    practiceQuestion: {
      question: 'A província de Cabinda faz fronteira terrestre com que países vizinhos?',
      options: [
        'República Democrática do Congo (RDC) e República do Congo (Brazzaville).',
        'República da Zâmbia e Namíbia.',
        'República do Botswana e Zimbábue.',
        'Apenas com o Oceano Atlântico sem fronteira terrestre.'
      ],
      correctIndex: 0,
      explanation: 'Correta: A. Cabinda é um enclave de Angola delimitado a norte e leste pela República do Congo e a sul e leste pela RDC.'
    }
  }
];

export const StudyCenter: React.FC = () => {
  const { setCandidateTab, currentUser, setIsPaywallOpen } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'todos' | 'legislacao' | 'psicotecnico' | 'conhecimentos'>('todos');
  const [selectedTopic, setSelectedTopic] = useState<StudyTopic>(studyTopicsData[0]);
  const [practiceAnswer, setPracticeAnswer] = useState<number | null>(null);
  const [hasSubmittedPractice, setHasSubmittedPractice] = useState(false);

  const filteredTopics = studyTopicsData.filter(t => {
    if (selectedCategory === 'todos') return true;
    return t.category === selectedCategory;
  });

  const handleSelectTopic = (topic: StudyTopic) => {
    setSelectedTopic(topic);
    setPracticeAnswer(null);
    setHasSubmittedPractice(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-slate-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Centro de Estudos Especializado
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              MININT 2026
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">Matérias Oficiais e Resumos para Concurso</h2>
          <p className="text-xs text-slate-300">
            Conteúdos sintetizados em tópicos rápidos, preparados para revisão no telemóvel e com exercícios de fixação imediata.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCandidateTab('simulador')}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors shrink-0 shadow-xs cursor-pointer"
        >
          <Clock className="w-4 h-4" />
          <span>Fazer Simulado Completo</span>
        </button>
      </div>

      {/* Category Filter Pills (Interactive Buttons) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {[
          { id: 'todos', label: 'Todas as Matérias' },
          { id: 'legislacao', label: 'Legislação & Função Pública' },
          { id: 'psicotecnico', label: 'Psicotécnicos & Lógica' },
          { id: 'conhecimentos', label: 'Conhecimentos de Angola' },
        ].map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id as any)}
            className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main 2-Column Split: Topic List & Selected Topic Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Topics List (4 cols) */}
        <div className="lg:col-span-5 space-y-2.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block px-1">
            Módulos de Preparação ({filteredTopics.length})
          </span>

          <div className="space-y-2">
            {filteredTopics.map(t => {
              const isSelected = selectedTopic.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTopic(t)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{t.subject}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {t.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {t.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full Reading Deck & Practice Question (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            {/* Header of Reader */}
            <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {selectedTopic.subject}
              </span>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                {selectedTopic.title}
              </h3>
              {selectedTopic.legalReference && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <Scale className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>{selectedTopic.legalReference}</span>
                </div>
              )}
            </div>

            {/* Practical Summary */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Resumo Didático para Estudo
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60">
                {selectedTopic.summary}
              </p>
            </div>

            {/* Key Learning Points */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Pontos de Atenção na Prova
              </h4>
              <div className="space-y-2">
                {selectedTopic.keyPoints.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Practice Question */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Exercício de Fixação Rápida
                </span>
                <span className="text-[11px] text-slate-500 font-mono">1 Valor</span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                {selectedTopic.practiceQuestion.question}
              </p>

              <div className="space-y-2">
                {selectedTopic.practiceQuestion.options.map((opt, oIdx) => {
                  const isSelected = practiceAnswer === oIdx;
                  const isCorrect = oIdx === selectedTopic.practiceQuestion.correctIndex;
                  let style = 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80';
                  
                  if (hasSubmittedPractice) {
                    if (isCorrect) style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold';
                    else if (isSelected && !isCorrect) style = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200';
                  } else if (isSelected) {
                    style = 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20';
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => {
                        if (!hasSubmittedPractice) setPracticeAnswer(oIdx);
                      }}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-colors flex items-center justify-between gap-3 cursor-pointer ${style}`}
                    >
                      <span>{opt}</span>
                      {hasSubmittedPractice && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {!hasSubmittedPractice ? (
                <button
                  type="button"
                  disabled={practiceAnswer === null}
                  onClick={() => setHasSubmittedPractice(true)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Verificar Resposta
                </button>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Gabarito Comentado:</span>
                  <p>{selectedTopic.practiceQuestion.explanation}</p>
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCandidateTab('treinador')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pedir explicação detalhada ao Treinador IA</span>
              </button>

              <button
                type="button"
                onClick={() => setCandidateTab('simulador')}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Treinar no Simulador 45m</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
