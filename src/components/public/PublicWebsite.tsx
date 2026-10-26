import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { AproVELogo } from '../brand/AproVELogo';
import {
  Shield,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Brain,
  HelpCircle,
  Users,
  Compass,
  FileText,
  Lock,
  Layers,
  Check,
  Smartphone,
  Newspaper,
  Share2,
  Calculator,
  AlertTriangle,
  LogIn,
  UserPlus
} from 'lucide-react';

export const PublicWebsite: React.FC = () => {
  const {
    params,
    setViewMode,
    setCandidateTab,
    setIsRegisterModalOpen,
    setIsLoginModalOpen,
    setIsPaywallOpen,
    currentUser,
    notifications,
    hasReferralDiscount,
    getPlanPrice,
    openLegalModal,
  } = useApp();

  // Interactive Question Sample State
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // News Category Filter State
  const [newsFilter, setNewsFilter] = useState<'todos' | 'comunicados' | 'cronogramas' | 'editais'>('todos');

  // Affiliate Calculator State
  const [calcReferrals, setCalcReferrals] = useState<number>(10);
  const [selectedNewsDetail, setSelectedNewsDetail] = useState<any | null>(null);

  // AI News Fact-Checker State
  const [factCheckQuery, setFactCheckQuery] = useState('');
  const [isFactChecking, setIsFactChecking] = useState(false);
  const [factCheckResult, setFactCheckResult] = useState<{
    verdict: 'oficial' | 'boato' | 'alerta';
    title: string;
    analysis: string;
    source: string;
  } | null>(null);

  const handleVerifyRumor = async (queryText?: string) => {
    const q = (queryText || factCheckQuery).trim();
    if (!q || isFactChecking) return;
    setIsFactChecking(true);
    setFactCheckResult(null);

    try {
      const res = await fetch('/api/gemini/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `VERIFICAÇÃO DE FATO OFICIAL DO CONCURSO MININT ANGOLA: "${q}". Analise criticamente com base no portal oficial candidaturas.minint.ao, na Constituição da República de Angola (CRA 2010) e no Diário da República. Informe claramente: 1. Se é VERDADEIRO, BOATO/NÃO CONFIRMADO ou TENTATIVA DE BURLA. 2. A explicação jurídica/institucional. 3. O alerta para proteger os candidatos de falsas promessas de vagas ou cobranças ilegais.`,
          candidateName: 'Candidato Verificador',
          career: 'Concurso Geral MININT',
          context: 'Verificador de Notícias e Combate a Desinformação da AproVE',
        }),
      });

      const data = await res.json();
      const reply = data.reply || '';

      const isScam = q.toLowerCase().includes('cobr') || q.toLowerCase().includes('pagar') || q.toLowerCase().includes('dinheiro') || reply.toLowerCase().includes('burla') || reply.toLowerCase().includes('fraude');
      const isRumor = q.toLowerCase().includes('5000') || q.toLowerCase().includes('5.000') || reply.toLowerCase().includes('não confirmado') || reply.toLowerCase().includes('boato');

      setFactCheckResult({
        verdict: isScam ? 'alerta' : (isRumor ? 'boato' : 'oficial'),
        title: isScam ? 'Alerta de Risco / Possível Fraude' : (isRumor ? 'Informação Não Confirmada / Boato' : 'Análise Oficial e Fundamentada'),
        analysis: reply || 'O MININT informa que qualquer ato de cobrança para admissão é estritamente ilegal. Todas as vagas e cronogramas oficiais são publicados exclusivamente em candidaturas.minint.ao e no Diário da República.',
        source: 'Gabinete de Apoio e Legislação da República de Angola',
      });
    } catch (e) {
      setFactCheckResult({
        verdict: 'boato',
        title: 'Verificação Local de Contingência',
        analysis: 'Informação Importante: O número de vagas do concurso do MININT não é fixado em 5.000 vagas preliminares e qualquer exigência de pagamento para agilização de vagas constitui crime. Consulte sempre candidaturas.minint.ao.',
        source: 'Portal Oficial candidaturas.minint.ao',
      });
    } finally {
      setIsFactChecking(false);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(prev => (prev === index ? null : index));
  };

  const sampleQuestion = {
    category: 'Psicotécnico - Raciocínio Lógico',
    questionText: 'Se todos os oficiais da PNA cumprem o regulamento de trânsito em Luanda, e alguns motoristas de transporte público também o cumprem, o que se pode concluir necessariamente com rigor lógico?',
    options: [
      { id: 'A', text: 'Todos os motoristas de transporte público são oficiais da PNA.' },
      { id: 'B', text: 'Pelo menos uma pessoa que cumpre o regulamento é motorista de transporte público.' },
      { id: 'C', text: 'Nenhum oficial da PNA conduz transporte público em Angola.' },
      { id: 'D', text: 'Todos os oficiais da PNA conduzem viaturas particulares.' },
    ],
    correctAnswer: 'B',
    explanation: 'Correta: B. Trata-se de uma dedução silogística imediata: se alguns motoristas cumprem o regulamento, então o conjunto de pessoas que cumprem o regulamento contém pelo menos esses motoristas.'
  };

  const monthlyPrice = getPlanPrice('monthly');
  const lifetimePrice = getPlanPrice('lifetime');

  // Affiliate Calculations
  const getAffiliateTier = (count: number) => {
    if (count >= 20) return { name: 'Ouro', rate: 0.50, badge: '50% Comissão' };
    if (count >= 10) return { name: 'Prata', rate: 0.40, badge: '40% Comissão' };
    return { name: 'Bronze', rate: 0.30, badge: '30% Comissão' };
  };

  const currentTier = getAffiliateTier(calcReferrals);
  const netMonthlyPrice = 4500; // 5.000 Kz menos 10% de desconto
  const netLifetimePrice = 22500; // 25.000 Kz menos 10% de desconto
  const earnedMonthlyKz = Math.round(calcReferrals * netMonthlyPrice * currentTier.rate);
  const earnedLifetimeKz = Math.round(calcReferrals * netLifetimePrice * currentTier.rate);

  // Filtered News
  const filteredNotifications = notifications.filter(notif => {
    if (newsFilter === 'todos') return true;
    if (newsFilter === 'comunicados') return notif.title.toLowerCase().includes('comunicado') || notif.source.includes('Gabinete');
    if (newsFilter === 'cronogramas') return notif.title.toLowerCase().includes('cronograma') || notif.title.toLowerCase().includes('alfab');
    if (newsFilter === 'editais') return notif.title.toLowerCase().includes('edital') || notif.title.toLowerCase().includes('lista');
    return true;
  });

  const faqs = [
    {
      q: 'O que é a plataforma AproVE?',
      a: 'A AproVE é uma plataforma digital independente e especializada na preparação estruturada de candidatos para concursos públicos em Angola. Oferecemos cadernos de simulados cronometrados de 45 minutos, matérias de estudo, testes psicotécnicos e tutoria com Inteligência Artificial para elevar a confiança dos candidatos.'
    },
    {
      q: 'A AproVE é uma plataforma oficial do MININT ou do Governo de Angola?',
      a: 'Não. A AproVE é uma plataforma de preparação, aprendizagem e treino estritamente independente. Não possuímos vínculo formal nem representamos o Ministério do Interior (MININT), a Polícia Nacional (PNA) ou qualquer instituição governamental. Todas as informações institucionais referenciam as fontes oficiais públicas (como candidaturas.minint.ao e o Diário da República).'
    },
    {
      q: 'O que está incluído no Plano Gratuito (0 Kz)?',
      a: 'Qualquer candidato pode criar uma conta gratuita e realizar 1 simulado oficial gratuito por dia, com cronômetro real de 45 minutos e gabarito básico, além de consultar editais públicos, cronogramas alfabéticos e notícias verificadas.'
    },
    {
      q: 'Quais os métodos de pagamento aceites em Angola?',
      a: 'Aceitamos pagamentos manuais convenientes para a realidade angolana via Multicaixa Express (comprovativo verificado em até 24h) e transferência bancária por IBAN, além de cartão de crédito internacional via Stripe.'
    },
    {
      q: 'Como funciona o Programa de Afiliados da AproVE?',
      a: 'Cada candidato recebe um link de indicação exclusivo que concede 10% de desconto imediato aos amigos. O afiliado recebe comissões escalonadas: Bronze (1-9 vendas = 30%), Prata (10-19 vendas = 40%) e Ouro (20+ vendas = 50%), pagas por Multicaixa Express ou IBAN a partir de 5.000 Kz de saldo aprovado.'
    },
    {
      q: 'O que acontece ao histórico se a assinatura mensal expirar?',
      a: 'A sua conta permanece ativa e todo o seu histórico de simulados, notas e estatísticas de evolução continua preservado. Apenas o acesso ilimitado aos simuladores VIP e ao Treinador IA é pausado até à reativação.'
    }
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white transition-colors">
      
      {/* ======================================================== */}
      {/* SUB-NAVBAR PÚBLICA (ÂNCORAS RÁPIDAS & LOGIN) */}
      {/* ======================================================== */}
      <nav className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold whitespace-nowrap text-slate-600 dark:text-slate-300">
            <button
              onClick={() => scrollToSection('hero')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 py-1 transition-colors cursor-pointer"
            >
              Início
            </button>
            <button
              onClick={() => scrollToSection('como-funciona')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 py-1 transition-colors cursor-pointer"
            >
              Como Funciona
            </button>
            <button
              onClick={() => scrollToSection('demonstracao')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 py-1 transition-colors cursor-pointer"
            >
              Questão Amostra
            </button>
            <button
              onClick={() => scrollToSection('noticias')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 py-1 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Newspaper className="w-3.5 h-3.5 text-blue-500" />
              <span>Notícias Oficiais</span>
            </button>
            <button
              onClick={() => scrollToSection('planos')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 py-1 transition-colors cursor-pointer"
            >
              Planos & Preços
            </button>
            <button
              onClick={() => scrollToSection('afiliados')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 py-1 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Programa de Afiliados</span>
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 py-1 transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Entrar</span>
            </button>
            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-300" />
              <span>Criar Conta</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* 1. HERO SECTION */}
      {/* ======================================================== */}
      <section id="hero" className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 dark:border-slate-800 bg-linear-to-b from-slate-100/80 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Proposition & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Independence Notice Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Plataforma Independente de Treino para Concursos em Angola</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                O teu próximo passo começa com <span className="text-emerald-600 dark:text-emerald-400">preparação</span>.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                A AproVE ajuda candidatos em toda Angola a estudar com método, realizar simulados cronometrados de 45 minutos com o rigor das provas do MININT, identificar dificuldades e treinar com o suporte do Treinador Inteligente.
              </p>

              {/* Actions & Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Começar a preparar-me</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection('como-funciona')}
                  className="px-5 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm sm:text-base transition-colors cursor-pointer"
                >
                  Conhecer a plataforma
                </button>

                <PWAInstallButton />
              </div>

              {/* Micro Proof Stats */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>1 Simulado gratuito diário (0 Kz)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Cadernos de Psicotécnico & Legislação</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>App PWA Instalável no Telemóvel</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Simulator Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-5 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      45m
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Simulador Digital MININT</h4>
                      <p className="text-[11px] text-slate-500">Cronômetro Idêntico à Prova Oficial</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    0 a 20 Valores
                  </span>
                </div>

                {/* Progress bar mock */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                    <span>Questão 01 de 10</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">42:15 restantes</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[25%]" />
                  </div>
                </div>

                {/* Micro Question Card */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Conhecimentos Gerais · Geografia de Angola
                  </span>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                    Qual é o rio mais extenso que corre integralmente dentro do território da República de Angola?
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-xs">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center justify-between">
                      <span>A) Rio Kwanza</span>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                      <span>B) Rio Cunene</span>
                    </div>
                  </div>
                </div>

                {/* Action in Card */}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('candidate');
                    setCandidateTab('simulador');
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Experimentar Simulado Gratuito Agora</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. CONCURSO EM DESTAQUE */}
      {/* ======================================================== */}
      <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-2xl bg-linear-to-r from-slate-900 to-slate-800 text-white shadow-lg space-y-4 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Concurso em Destaque 2026
                </span>
                <h2 className="text-xl sm:text-2xl font-bold mt-0.5">
                  Concurso de Ingresso Externo do Ministério do Interior (MININT)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Fase de Preparação e Simulados
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400">Quotas e Vagas Oficiais</span>
                <div className="text-sm sm:text-base font-bold text-amber-300 mt-0.5">Despacho Oficial</div>
                <span className="text-[11px] text-slate-400">Fixadas em Diário da República</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400">Carreiras Abrangidas</span>
                <div className="text-sm font-bold text-white mt-0.5">PNA · SIC · SME · Bombeiros</div>
                <span className="text-[11px] text-slate-400">Protecção Civil e Penitenciário</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400">Formato da Avaliação</span>
                <div className="text-sm font-bold text-white mt-0.5">Prova Digital 45 Minutos</div>
                <span className="text-[11px] text-slate-400">Psicotécnico e Cultura Geral</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <span className="text-slate-400">Fonte Oficial do Governo</span>
                <a
                  href="https://candidaturas.minint.ao"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-0.5"
                >
                  <span>candidaturas.minint.ao</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-[11px] text-slate-400">Portal de candidaturas</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-start gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Aviso de Rigor e Independência:</strong> O número oficial de vagas e a distribuição por província são fixados exclusivamente por Despacho Ministerial conjunto nos termos da lei. A AproVE não inventa estimativas nem divulga vagas não confirmadas. Para informações oficiais de admissão, consulte sempre <a href="https://candidaturas.minint.ao" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline font-semibold">candidaturas.minint.ao</a>.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. COMO FUNCIONA (PERCURSO DE 6 PASSOS) */}
      {/* ======================================================== */}
      <section id="como-funciona" className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
          <div className="max-w-2xl">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Metodologia de Estudos
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              Como a AproVE acelera a tua preparação
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
              Um caminho direto, organizado e adaptado à rotina dos candidatos angolanos para transformar esforço em resultado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Criar Conta com Validação OTP',
                desc: 'Registo rápido com o teu e-mail e código de segurança de 6 dígitos. Sem burocracia.',
                icon: Shield,
              },
              {
                step: '02',
                title: 'Escolher a Carreira Alvo',
                desc: 'Selecione a tua área: Polícia Nacional (PNA), SIC, SME, Bombeiros ou Serviços Penitenciários.',
                icon: Compass,
              },
              {
                step: '03',
                title: 'Estudar Matérias no Centro de Estudos',
                desc: 'Resumos claros e objetivos de Legislação de Angola (CRA 2010), Psicotécnicos e Conhecimentos Gerais.',
                icon: BookOpen,
              },
              {
                step: '04',
                title: 'Resolver Simulados de 45 Minutos',
                desc: 'Treine a gestão do tempo com cronômetro real idêntico ao teste digital da comissão oficial.',
                icon: Clock,
              },
              {
                step: '05',
                title: 'Analisar Gabarito e Nota (0-20)',
                desc: 'Descubra exatamente onde errou com fundamentação jurídica e lógica passo a passo.',
                icon: Award,
              },
              {
                step: '06',
                title: 'Tirar Dúvidas com o Treinador IA',
                desc: 'Use o Meu Treinador AproVE para clarificar conceitos complexos e receber exercícios de reforço.',
                icon: Brain,
              },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {item.step}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. DEMONSTRAÇÃO INTERATIVA DE QUESTÃO REAL */}
      {/* ======================================================== */}
      <section id="demonstracao" className="py-16 sm:py-20 bg-slate-100/60 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Demonstração ao Vivo
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Teste o rigor de uma questão oficial AproVE
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              Experimente a interface interativa de resposta comentada antes mesmo de criar a sua conta.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5">
            <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{sampleQuestion.category}</span>
              <span>Dificuldade: Média</span>
            </div>

            <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
              {sampleQuestion.questionText}
            </p>

            <div className="space-y-2">
              {sampleQuestion.options.map(opt => {
                const isSelected = selectedAnswer === opt.id;
                const isCorrect = opt.id === sampleQuestion.correctAnswer;
                let btnStyle = 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80';
                
                if (hasCheckedAnswer) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200';
                  }
                } else if (isSelected) {
                  btnStyle = 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20';
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      if (!hasCheckedAnswer) setSelectedAnswer(opt.id);
                    }}
                    className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm font-medium flex items-center justify-between gap-3 transition-colors cursor-pointer ${btnStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {opt.id}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                    {hasCheckedAnswer && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {!hasCheckedAnswer ? (
              <button
                type="button"
                disabled={!selectedAnswer}
                onClick={() => setHasCheckedAnswer(true)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Confirmar Resposta
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">Gabarito Comentado AproVE</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {sampleQuestion.explanation}
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedAnswer(null);
                      setHasCheckedAnswer(false);
                    }}
                    className="text-xs font-semibold text-emerald-600 hover:underline"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. SECÇÃO DE NOTÍCIAS & COMUNICADOS OFICIAIS */}
      {/* ======================================================== */}
      <section id="noticias" className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Atualizações Verificadas
              </span>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                Notícias & Comunicados Oficiais do Concurso
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Avisos rigorosamente cruzados com o portal governamental e o Diário da República de Angola.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 self-start md:self-auto text-xs font-semibold">
              <button
                onClick={() => setNewsFilter('todos')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${newsFilter === 'todos' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setNewsFilter('comunicados')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${newsFilter === 'comunicados' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Comunicados
              </button>
              <button
                onClick={() => setNewsFilter('cronogramas')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${newsFilter === 'cronogramas' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Cronogramas
              </button>
              <button
                onClick={() => setNewsFilter('editais')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${newsFilter === 'editais' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                Editais
              </button>
            </div>
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {notif.source}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {notif.timestamp}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                    {notif.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {notif.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verificado</span>
                  </div>

                  <a
                    href="https://candidaturas.minint.ao"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <span>Fonte Oficial</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* ======================================================== */}
          {/* VERIFICADOR DE NOTÍCIAS & FATO-CHECAGEM COM IA */}
          {/* ======================================================== */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-[#10233F] to-slate-900 border border-slate-700/80 text-white shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Verificador Oficial de Notícias & Fatos com IA
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Gabinete Anti-Desinformação
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Cruze qualquer mensagem de WhatsApp ou rumor com os Editais e Despachos Oficiais do MININT.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Rumor Chips */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Exemplos de rumores em circulação para checar:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFactCheckQuery('É verdade que o MININT abriu 5.000 vagas fixas para este concurso?');
                    handleVerifyRumor('É verdade que o MININT abriu 5.000 vagas fixas para este concurso?');
                  }}
                  className="px-3 py-1.5 rounded-full text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  "Boato das 5.000 Vagas preliminares"
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFactCheckQuery('Cobram valores em dinheiro para garantir vaga na PNA ou entrar nas listas?');
                    handleVerifyRumor('Cobram valores em dinheiro para garantir vaga na PNA ou entrar nas listas?');
                  }}
                  className="px-3 py-1.5 rounded-full text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  "Cobrança de taxa de admissão por intermediários"
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFactCheckQuery('Como é organizado o calendário de exames por ordem alfabética?');
                    handleVerifyRumor('Como é organizado o calendário de exames por ordem alfabética?');
                  }}
                  className="px-3 py-1.5 rounded-full text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  "Calendário por escala alfabética é oficial?"
                </button>
              </div>
            </div>

            {/* Query Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyRumor();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="text"
                value={factCheckQuery}
                onChange={(e) => setFactCheckQuery(e.target.value)}
                placeholder="Cole aqui um boato, mensagem ou dúvida sobre o concurso do MININT..."
                className="flex-1 px-4 py-3 rounded-xl text-xs sm:text-sm bg-slate-800/90 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-400/50"
              />
              <button
                type="submit"
                disabled={!factCheckQuery.trim() || isFactChecking}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
              >
                {isFactChecking ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>A verificar nos Editais...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>Verificar Fato com IA</span>
                  </>
                )}
              </button>
            </form>

            {/* Fact Check Result Card */}
            {factCheckResult && (
              <div className="p-5 rounded-xl bg-slate-800/90 border border-slate-700 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-2">
                  <div className="flex items-center gap-2">
                    {factCheckResult.verdict === 'alerta' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        {factCheckResult.title}
                      </span>
                    ) : factCheckResult.verdict === 'boato' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        {factCheckResult.title}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {factCheckResult.title}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Fonte: {factCheckResult.source}
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {factCheckResult.analysis}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-700/60 text-slate-400">
                  <span>Proteja-se de golpes: nunca entregue valores monetários a intermediários.</span>
                  <a
                    href="https://candidaturas.minint.ao"
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Portal Oficial MININT</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. TABELA DE PLANOS & PREÇOS (0 KZ, 5.000 KZ, 25.000 KZ) */}
      {/* ======================================================== */}
      <section id="planos" className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Investimento Transparente
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Escolha o plano ideal para a sua aprovação
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Comece gratuitamente hoje mesmo ou garanta acesso total aos simuladores VIP e ao Treinador IA.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* PLANO 1: GRATUITO */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Plano Gratuito
                </span>
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">0</span>
                    <span className="font-semibold text-slate-500">Kz</span>
                  </div>
                  <p className="text-xs text-slate-500">Para sempre gratuito, sem necessidade de cartão</p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>1 Simulado oficial de 45 min por dia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Correção básica de respostas e gabarito</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Consulta de notícias e comunicados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Cronograma alfabético de exames</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setViewMode('candidate');
                  setCandidateTab('inicio');
                }}
                className="w-full py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                Acessar Gratuitamente
              </button>
            </div>

            {/* PLANO 2: MENSAL (DESTAQUE) */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-xl relative flex flex-col justify-between space-y-6">
              <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-[11px] uppercase tracking-wider shadow-sm">
                Mais Popular
              </div>

              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  Assinatura 30 Dias (Ciclo de Exames)
                </span>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      {monthlyPrice.finalPrice.toLocaleString()}
                    </span>
                    <span className="font-semibold text-slate-500">Kz / mês</span>
                  </div>
                  {monthlyPrice.hasDiscount && (
                    <p className="text-xs text-emerald-600 font-semibold">
                      10% OFF aplicado (Preço normal: {monthlyPrice.originalPrice.toLocaleString()} Kz)
                    </p>
                  )}
                  <p className="text-xs text-slate-500">Multicaixa Express, IBAN ou Stripe</p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Simulados ilimitados</strong> sem restrição diária</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Acesso ao <strong>Treinador IA</strong> 24h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Centro de Estudos Completo com resumos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Gabarito comentado com fundamentação legal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Revisão personalizada de cadernos de erro</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPaywallOpen(true)}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                Subscrever 30 Dias VIP
              </button>
            </div>

            {/* PLANO 3: VITALÍCIO */}
            <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Acesso Total Vitalício
                </span>

                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      {lifetimePrice.finalPrice.toLocaleString()}
                    </span>
                    <span className="font-semibold text-slate-500">Kz</span>
                  </div>
                  {lifetimePrice.hasDiscount && (
                    <p className="text-xs text-emerald-600 font-semibold">
                      10% OFF aplicado (Normal: {lifetimePrice.originalPrice.toLocaleString()} Kz)
                    </p>
                  )}
                  <p className="text-xs text-slate-500">Pagamento único até à nomeação definitiva</p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Tudo incluído no plano mensal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Sem renovações mensais ou custos adicionais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Acesso a todos os cadernos futuros do MININT</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Suporte prioritário via WhatsApp</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPaywallOpen(true)}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                Garantir Acesso Vitalício
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. PROGRAMA DE AFILIADOS & CALCULADORA INTERATIVA */}
      {/* ======================================================== */}
      <section id="afiliados" className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800 bg-linear-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-left">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Parceria com Candidatos
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Programa de Afiliados AproVE (Até 50% de Comissão)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Recomende a plataforma a amigos e colegas de concurso. Eles recebem 10% de desconto imediato e você recebe até 50% direto no seu Multicaixa Express.
            </p>
          </div>

          {/* 3 Commission Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-700 dark:text-amber-300 text-sm">Nível Bronze</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  1 a 9 indicados
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">30%</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Receba <strong>1.350 Kz</strong> por cada assinatura mensal e <strong>6.750 Kz</strong> por plano vitalício.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-400 dark:border-slate-600 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">Nível Prata</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                  10 a 19 indicados
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">40%</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Receba <strong>1.800 Kz</strong> por cada assinatura mensal e <strong>9.000 Kz</strong> por plano vitalício.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-500 shadow-lg relative space-y-3">
              <div className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] uppercase">
                Mais Rentável
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">Nível Ouro</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  20+ indicados
                </span>
              </div>
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">50%</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Receba <strong>2.250 Kz</strong> por cada assinatura mensal e <strong>11.250 Kz</strong> por plano vitalício.
              </p>
            </div>
          </div>

          {/* Interactive Earnings Calculator */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Simulador de Ganhos de Afiliado
                </h3>
                <p className="text-xs text-slate-500">
                  Calcule a sua receita potencial ao recomendar a AproVE no seu grupo de estudos.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span>Número estimado de colegas indicados:</span>
                <span className="text-lg font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {calcReferrals} pessoas
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="50"
                value={calcReferrals}
                onChange={(e) => setCalcReferrals(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-400">Seu Nível Estimado</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {currentTier.name} ({currentTier.badge})
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] text-slate-400">Comissões (Mensal)</span>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {earnedMonthlyKz.toLocaleString()} Kz
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-400">Comissões (Vitalício)</span>
                  <div className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                    {earnedLifetimeKz.toLocaleString()} Kz
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Regra de Pagamento:</strong> O saldo mínimo para levantamento é de 5.000 Kz. Os pagamentos são efetuados via Multicaixa Express ou IBAN em até 24h úteis após verificação antifraude.
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setViewMode('candidate');
                setCandidateTab('afiliados');
              }}
              className="w-full py-3 rounded-xl bg-[#10233F] hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span>Aceder ao Meu Painel de Afiliado</span>
            </button>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. PERGUNTAS FREQUENTES (FAQ) */}
      {/* ======================================================== */}
      <section id="faq" className="py-16 sm:py-24 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Esclarecimentos Oficiais
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Perguntas Frequentes sobre a AproVE
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Transparência total sobre o funcionamento dos simulados, pagamentos e termos de serviço.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full p-4 sm:p-5 text-left text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 9. RODAPÉ INSTITUCIONAL */}
      {/* ======================================================== */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-12 border-t border-slate-800 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <AproVELogo size="sm" inverted={true} />
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Mais preparação. Mais confiança. Plataforma independente de preparação para o Concurso Público do Ministério do Interior (MININT) e Função Pública de Angola.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Plataforma</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => { setViewMode('candidate'); setCandidateTab('simulador'); }} className="hover:text-white">Simulador de 45m</button></li>
                <li><button onClick={() => { setViewMode('candidate'); setCandidateTab('estudos'); }} className="hover:text-white">Centro de Estudos</button></li>
                <li><button onClick={() => { setViewMode('candidate'); setCandidateTab('ranking'); }} className="hover:text-white">Ranking Provincial</button></li>
                <li><button onClick={() => { setViewMode('candidate'); setCandidateTab('afiliados'); }} className="hover:text-white">Programa de Afiliados</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Concurso MININT</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="https://candidaturas.minint.ao" target="_blank" rel="noreferrer" className="hover:text-white flex items-center gap-1">Portal Oficial MININT <ExternalLink className="w-3 h-3" /></a></li>
                <li><a href="https://imprensanacional.gov.ao" target="_blank" rel="noreferrer" className="hover:text-white">Diário da República</a></li>
                <li><button onClick={() => { setViewMode('architecture'); }} className="hover:text-white">Caderno Técnico da Plataforma</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Transparência & Apoio</h4>
              <p className="text-[11px] leading-relaxed text-slate-400">
                A AproVE é uma entidade privada independente. Não nos responsabilizamos por alterações de cronogramas decretadas pelas comissões oficiais de exames.
              </p>
              <div className="pt-2 text-xs text-emerald-400 font-semibold">
                Suporte: suporte@aprove.ao
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>© 2026 AproVE Angola. Todos os direitos reservados.</div>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => openLegalModal('termos')} className="hover:text-slate-300">Termos de Uso</button>
              <span>·</span>
              <button onClick={() => openLegalModal('privacidade')} className="hover:text-slate-300">Política de Privacidade</button>
              <span>·</span>
              <button onClick={() => openLegalModal('pagamentos')} className="hover:text-slate-300">Política de Pagamentos e Reembolsos</button>
              <span>·</span>
              <button onClick={() => openLegalModal('afiliados')} className="hover:text-slate-300">Condições de Afiliados</button>
              <span>·</span>
              <button onClick={() => openLegalModal('independencia')} className="text-amber-400 hover:text-amber-300">Aviso de Independência</button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
