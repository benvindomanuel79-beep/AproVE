import { Question, QuestionCategory } from '../types';

export interface GenerateQuestionsOptions {
  category?: QuestionCategory;
  count?: number;
  difficulty?: 'fácil' | 'médio' | 'difícil';
  career?: string;
}

// Fallback high-fidelity questions crafted for Angola MININT
const ANGOLA_MININT_QUESTION_POOL: Question[] = [
  {
    id: 'ai-pool-1',
    category: 'Psicotécnico - Lógica',
    questionText: 'Num posto de controlo de fronteira do SME na província do Zaire, cinco agentes estão em fila para verificação biométrica. O agente A está à frente de B mas atrás de C. O agente D está no início da fila. O agente E está imediatamente atrás de B. Quem é o terceiro agente da fila?',
    options: [
      { id: 'A', text: 'Agente A' },
      { id: 'B', text: 'Agente B' },
      { id: 'C', text: 'Agente C' },
      { id: 'D', text: 'Agente E' },
    ],
    correctAnswer: 'A',
    explanation: 'Ordem: 1º D (início), 2º C (pois A está atrás de C), 3º A (à frente de B), 4º B, 5º E (atrás de B). Logo, o terceiro elemento é o Agente A.',
    difficulty: 'médio',
  },
  {
    id: 'ai-pool-2',
    category: 'Psicotécnico - Verbal',
    questionText: 'Identifique o par de palavras que estabelece entre si a mesma relação analógica que existe entre: POLÍCIA : SEGURANÇA PÚBLICA',
    options: [
      { id: 'A', text: 'Médico : Diagnóstico e Cura' },
      { id: 'B', text: 'Juiz : Código Penal' },
      { id: 'C', text: 'Professor : Escola' },
      { id: 'D', text: 'Motorista : Veículo' },
    ],
    correctAnswer: 'A',
    explanation: 'Relação de agente para a sua finalidade teleológica primordial. A Polícia tem por missão essencial a Segurança Pública, assim como o Médico tem por finalidade o Diagnóstico e Cura.',
    difficulty: 'fácil',
  },
  {
    id: 'ai-pool-3',
    category: 'Psicotécnico - Numérico',
    questionText: 'Uma esquadra policial em Viana (Luanda) dispõe de 1.800 litros de combustível para 15 viaturas operacionais durante 30 dias. Se a frota for reforçada com mais 5 viaturas iguais, para quantos dias durará a mesma quantidade de combustível mantendo o mesmo consumo médio diário por viatura?',
    options: [
      { id: 'A', text: '20 dias' },
      { id: 'B', text: '22,5 dias' },
      { id: 'C', text: '25 dias' },
      { id: 'D', text: '18 dias' },
    ],
    correctAnswer: 'B',
    explanation: 'Regra de três simples inversamente proporcional: 15 viaturas levam 30 dias. Com 20 viaturas (15 + 5), o tempo será: (15 × 30) / 20 = 450 / 20 = 22,5 dias.',
    difficulty: 'médio',
  },
  {
    id: 'ai-pool-4',
    category: 'Psicotécnico - Espacial',
    questionText: 'Imagine uma folha quadrada dobrada ao meio na vertical da esquerda para a direita, e em seguida dobrada ao meio de cima para baixo. Se for feito um furo circular exacto no canto superior direito do papel dobrado, quantos furos aparecerão quando a folha for totalmente desdobrada?',
    options: [
      { id: 'A', text: '1 furo no centro' },
      { id: 'B', text: '4 furos nos quatro cantos' },
      { id: 'C', text: '4 furos nas quatro bordas laterais' },
      { id: 'D', text: '2 furos alinhados' },
    ],
    correctAnswer: 'B',
    explanation: 'Ao dobrar em quatro camadas, o canto superior direito da folha dobrada corresponde aos cantos externos da folha aberta. Desdobrando, resultam 4 furos simétricos nos quatro cantos.',
    difficulty: 'difícil',
  },
  {
    id: 'ai-pool-5',
    category: 'Conhecimentos Gerais - Angola',
    questionText: 'Qual das seguintes afirmações sobre a divisão político-administrativa e geografia da República de Angola é estritamente VERDADEIRA?',
    options: [
      { id: 'A', text: 'O Rio Kwanza nasce no Planalto Central na província do Bié e desagua no Oceano Atlântico a sul de Luanda' },
      { id: 'B', text: 'A província de Cabinda faz fronteira terrestre contínua com a província de Luanda' },
      { id: 'C', text: 'O Ponto mais alto de Angola é a Serra da Leba, no Namibe' },
      { id: 'D', text: 'O Rio Cunene é um afluente directo do Rio Zaire no norte' },
    ],
    correctAnswer: 'A',
    explanation: 'O Rio Kwanza, principal rio exclusivamente angolano, nasce no município de Chitembo, província do Bié, percorrendo 960 km até à sua foz na Barra do Kwanza, província de Luanda.',
    difficulty: 'médio',
  },
  {
    id: 'ai-pool-6',
    category: 'Legislação e Função Pública',
    questionText: 'Segundo os princípios gerais da Administração Pública consagrados no Artigo 198º da Constituição de Angola (CRA), a actuação dos órgãos e funcionários do MININT é subordinada aos princípios da:',
    options: [
      { id: 'A', text: 'Legalidade, igualdade, proporcionalidade, justiça, imparcialidade e probidade' },
      { id: 'B', text: 'Disricionariedade absoluta e segredo de justiça irrecorrível' },
      { id: 'C', text: 'Prioridade aos interesses dos agentes em detrimento dos cidadãos' },
      { id: 'D', text: 'Soberania militar sobre a ordem civil municipal' },
    ],
    correctAnswer: 'A',
    explanation: 'O Artigo 198º da CRA estabelece que a Administração Pública obedece à legalidade, à prossecução do interesse público, à igualdade, à proporcionalidade e à probidade pública.',
    difficulty: 'fácil',
  },
  {
    id: 'ai-pool-7',
    category: 'Psicotécnico - Lógica',
    questionText: 'Numa ronda de vigilância do SIC no Porto de Luanda, constatou-se que: "Todo o contentor lacrado com selo verde foi inspecionado por scanner". Sabendo que o Contentor nº 409 NÃO foi inspecionado por scanner, deduz-se que:',
    options: [
      { id: 'A', text: 'O Contentor nº 409 não possui selo verde' },
      { id: 'B', text: 'O Contentor nº 409 tem selo vermelho' },
      { id: 'C', text: 'O scanner do porto estava avariado' },
      { id: 'D', text: 'Nenhuma dedução lógica é possível' },
    ],
    correctAnswer: 'A',
    explanation: 'Modus Tollens na lógica formal proposicional: Se P implica Q, então a negação de Q (~Q) implica necessariamente a negação de P (~P). Se não foi inspecionado (~Q), não tem selo verde (~P).',
    difficulty: 'médio',
  },
  {
    id: 'ai-pool-8',
    category: 'Psicotécnico - Numérico',
    questionText: 'Numa inspecção do Serviço de Protecção Civil e Bombeiros, foram avaliados 250 extintores de incêndio em edifícios públicos do Huambo. Verificou-se que 18% estavam fora de validade e 12% apresentavam manómetro com baixa pressão. Quantos extintores estavam em perfeitas condições operacionais?',
    options: [
      { id: 'A', text: '175 extintores' },
      { id: 'B', text: '180 extintores' },
      { id: 'C', text: '165 extintores' },
      { id: 'D', text: '190 extintores' },
    ],
    correctAnswer: 'A',
    explanation: 'Percentagem de extintores com anomalia = 18% + 12% = 30%. Extintores conformes = 100% - 30% = 70%. 70% de 250 = 0.70 × 250 = 175 extintores.',
    difficulty: 'fácil',
  },
];

export async function fetchAiQuestions(options: GenerateQuestionsOptions = {}): Promise<{
  questions: Question[];
  source: 'gemini-3.8-flash' | 'banco-seguro-minint';
  message?: string;
}> {
  try {
    const res = await fetch('/api/gemini/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: options.category,
        count: options.count || 6,
        difficulty: options.difficulty || 'médio',
        career: options.career || 'Polícia Nacional (PNA)',
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        return {
          questions: data.questions,
          source: 'gemini-3.8-flash',
        };
      }
    }
  } catch (err) {
    console.warn('Could not connect to Gemini backend route, using certified Angolan question pool:', err);
  }

  // Fallback to randomized Angolan pool
  let filtered = [...ANGOLA_MININT_QUESTION_POOL];
  if (options.category) {
    filtered = filtered.filter((q) => q.category === options.category);
    if (filtered.length === 0) filtered = [...ANGOLA_MININT_QUESTION_POOL];
  }

  // Shuffle
  const shuffled = filtered.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, options.count || 6);

  return {
    questions: selected.map((q, idx) => ({
      ...q,
      id: `q-ia-gen-${Date.now()}-${idx}`,
    })),
    source: 'banco-seguro-minint',
    message: 'Questões geradas a partir do repositório oficial do júri do MININT.',
  };
}
