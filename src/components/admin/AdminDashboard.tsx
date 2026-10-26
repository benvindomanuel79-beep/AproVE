import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Shield,
  CreditCard,
  Bot,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Play,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Coins,
  Building,
  Sparkles,
  Sliders,
  TrendingUp,
  Share2,
  Search,
  Filter,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Download,
  RotateCcw,
  Tag,
  ArrowUpRight,
  Gift,
  ExternalLink,
  Award,
  Target,
  Database
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import {
  AdmittedCandidate,
  Question,
  QuestionCategory,
  CandidateUser,
  Province,
  CareerTrack
} from '../../types';
import { fetchAiQuestions } from '../../services/aiQuestionService';

export const AdminDashboard: React.FC = () => {
  const {
    params,
    updateParams,
    admittedCandidates,
    addAdmittedCandidates,
    questions,
    addQuestion,
    withdrawals,
    approveWithdrawal,
    rejectWithdrawal,
    scraperLogs,
    triggerScraperRun,
    concursos,
    switchConcurso,
    registeredUsers,
    addRegisteredUser,
    updateRegisteredUser,
    toggleUserSubscription,
    toggleUserStatus,
    deleteRegisteredUser,
    affiliatePromoters,
    resetParametersToDefaults,
    isSupabaseConnected,
    setIsSupabaseModalOpen,
    supabaseHealth,
  } = useApp();

  const [adminTab, setAdminTab] = useState<
    'overview' | 'users' | 'affiliates' | 'settings' | 'scraper' | 'extractor' | 'questions' | 'payouts' | 'concursos'
  >('overview');

  // ================= User Management State =================
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userPlanFilter, setUserPlanFilter] = useState<string>('todos');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('todos');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('+244 9');
  const [newUserProvince, setNewUserProvince] = useState<Province>('Luanda');
  const [newUserCareer, setNewUserCareer] = useState<CareerTrack>('Polícia Nacional (PNA)');
  const [newUserPlan, setNewUserPlan] = useState<'free' | 'monthly' | 'lifetime'>('free');

  // ================= Question Generator State =================
  const [newCategory, setNewCategory] = useState<QuestionCategory>('Psicotécnico - Lógica');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [newExplanation, setNewExplanation] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [batchAiGenerating, setBatchAiGenerating] = useState(false);

  // ================= PDF Extractor State =================
  const [pdfFileName, setPdfFileName] = useState('Lista_Admitidos_MININT_Luanda_Oficial_2026.pdf');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedCount, setExtractedCount] = useState<number | null>(null);

  // ================= Settings State =================
  const [tempParams, setTempParams] = useState(params);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return registeredUsers.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.whatsapp.includes(userSearchTerm) ||
        u.province.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        u.affiliateCode.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (u.referredBy && u.referredBy.toLowerCase().includes(userSearchTerm.toLowerCase()));

      const matchPlan =
        userPlanFilter === 'todos' ||
        (userPlanFilter === 'gratuito' && !u.isSubscribed) ||
        (userPlanFilter === 'monthly' && u.isSubscribed && u.subscriptionPlan === 'monthly') ||
        (userPlanFilter === 'lifetime' && u.isSubscribed && u.subscriptionPlan === 'lifetime');

      const matchStatus =
        userStatusFilter === 'todos' || u.status.toLowerCase() === userStatusFilter.toLowerCase();

      return matchSearch && matchPlan && matchStatus;
    });
  }, [registeredUsers, userSearchTerm, userPlanFilter, userStatusFilter]);

  // Affiliate Conversion Aggregates
  const affiliateMetrics = useMemo(() => {
    const totalClicks = affiliatePromoters.reduce((acc, p) => acc + p.clicks, 0);
    const totalSignups = affiliatePromoters.reduce((acc, p) => acc + p.signups, 0);
    const totalPaidConversions = affiliatePromoters.reduce((acc, p) => acc + p.paidConversions, 0);
    const totalRevenueKz = affiliatePromoters.reduce((acc, p) => acc + p.totalRevenueGeneratedKz, 0);
    const totalCommissionsEarnedKz = affiliatePromoters.reduce((acc, p) => acc + p.earnedCommissionKz, 0);
    const totalPendingPayoutsKz = affiliatePromoters.reduce((acc, p) => acc + p.pendingPayoutKz, 0);
    const conversionRate = totalClicks > 0 ? Number(((totalPaidConversions / totalClicks) * 100).toFixed(1)) : 0;
    const discountSalesCount = Math.round(totalPaidConversions * 0.86); // ~86% of buyers use referral links

    return {
      totalClicks,
      totalSignups,
      totalPaidConversions,
      totalRevenueKz,
      totalCommissionsEarnedKz,
      totalPendingPayoutsKz,
      conversionRate,
      discountSalesCount,
    };
  }, [affiliatePromoters]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams(tempParams);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const handleExportConfigJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tempParams, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aprove_config_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetDefaults = () => {
    if (confirm('Tem a certeza que deseja repor todos os parâmetros institucionais para o padrão oficial do MININT?')) {
      resetParametersToDefaults();
      setTempParams(params);
      alert('Parâmetros redefinidos com sucesso para os valores padrão do MININT!');
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserPhone) return;

    const newUser: CandidateUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: newUserName,
      whatsapp: newUserPhone,
      province: newUserProvince,
      careerTrack: newUserCareer,
      isSubscribed: newUserPlan !== 'free',
      subscriptionPlan: newUserPlan !== 'free' ? newUserPlan : undefined,
      subscriptionExpiry: newUserPlan === 'monthly' ? 'Em 30 dias' : newUserPlan === 'lifetime' ? 'Vitalício até à Nomeação' : undefined,
      registeredAt: new Date().toISOString().split('T')[0],
      affiliateCode: `CAND-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'Ativo',
      lastLogin: 'Agora mesmo',
      totalSimulados: 0,
      averageScore: 0,
    };

    addRegisteredUser(newUser);
    setNewUserName('');
    setNewUserPhone('+244 9');
    setIsAddUserModalOpen(false);
  };

  const handleSimulateAiQuestion = async () => {
    setIsGeneratingAi(true);
    try {
      const res = await fetchAiQuestions({
        category: newCategory,
        count: 1,
        career: 'Polícia Nacional (PNA)',
      });

      if (res.questions.length > 0) {
        const q = res.questions[0];
        setNewCategory(q.category);
        setNewQuestionText(q.questionText);
        setOptA(q.options[0]?.text || '');
        setOptB(q.options[1]?.text || '');
        setOptC(q.options[2]?.text || '');
        setOptD(q.options[3]?.text || '');
        setCorrectOpt(q.correctAnswer);
        setNewExplanation(q.explanation);
      }
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleGenerateBatchAi = async () => {
    setBatchAiGenerating(true);
    try {
      const res = await fetchAiQuestions({
        count: 6,
        career: 'MININT Geral',
      });
      res.questions.forEach((q) => addQuestion(q));
      alert(`Lote de ${res.questions.length} questões inéditas geradas pela IA Gemini e integradas com sucesso no Banco Oficial!`);
    } finally {
      setBatchAiGenerating(false);
    }
  };

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText || !optA || !optB) return;

    const newQ: Question = {
      id: `q-custom-${Date.now()}`,
      category: newCategory,
      questionText: newQuestionText,
      options: [
        { id: 'A', text: optA },
        { id: 'B', text: optB },
        { id: 'C', text: optC || 'Nenhuma das anteriores' },
        { id: 'D', text: optD || 'Todas as anteriores' },
      ],
      correctAnswer: correctOpt,
      explanation: newExplanation || 'Fundamentação oficial conforme directrizes do MININT.',
      difficulty: 'médio',
    };

    addQuestion(newQ);
    setNewQuestionText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setNewExplanation('');
    alert('Questão gravada no Banco Oficial e imediatamente disponibilizada aos candidatos no Simulador!');
  };

  const handleSimulatePdfExtraction = () => {
    setIsExtracting(true);
    setTimeout(() => {
      const generated: AdmittedCandidate[] = [
        {
          id: `cand-extracted-${Date.now()}-1`,
          fullName: 'Armando Kiala Pedro Ndongala',
          biNumberMasked: '003819***LA012',
          province: 'Luanda',
          careerTrack: 'Polícia Nacional (PNA)',
          examCenter: 'Complexo Escolar São José de Cluny - Maianga',
          examRoom: 'Sala 09',
          examDate: '26 de Outubro',
          shift: 'Manhã (08:00)',
          status: 'Admitido à Prova Escrita',
        },
        {
          id: `cand-extracted-${Date.now()}-2`,
          fullName: 'Benvinda Suzana Calei',
          biNumberMasked: '007742***HB091',
          province: 'Huambo',
          careerTrack: 'Serviço de Migração e Estrangeiros (SME)',
          examCenter: 'Instituto Politécnico da Caála',
          examRoom: 'Sala 04',
          examDate: '26 de Outubro',
          shift: 'Manhã (08:00)',
          status: 'Admitido à Prova Escrita',
        },
        {
          id: `cand-extracted-${Date.now()}-3`,
          fullName: 'Domingos Chimbundo Muanza',
          biNumberMasked: '009110***BG044',
          province: 'Benguela',
          careerTrack: 'Serviço de Investigação Criminal (SIC)',
          examCenter: 'Liceu Comandante Cassanje - Lobito',
          examRoom: 'Sala 11',
          examDate: '27 de Outubro',
          shift: 'Manhã (08:00)',
          status: 'Admitido à Prova Escrita',
        },
      ];

      addAdmittedCandidates(generated);
      setIsExtracting(false);
      setExtractedCount(generated.length);
    }, 1500);
  };

  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'Pendente');
  const pendingTotalKz = pendingWithdrawals.reduce((acc, curr) => acc + curr.amountKz, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Painel Central de Controlo
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-800 text-white">
              Super-Admin
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1">Consola de Administração Geral · {params.appName}</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Métricas de conversão de afiliados, gestão completa de usuários cadastrados e controle centralizado de configuração.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsSupabaseModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Verificar Tabelas e Script SQL no Supabase"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase PostgreSQL</span>
            {isSupabaseConnected && (
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            )}
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-300">Concurso:</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded bg-white text-slate-900">
              {concursos.find((c) => c.id === params.activeConcurso)?.name || 'MININT 2026'}
            </span>
          </div>
        </div>
      </div>

      {/* Admin Subnav */}
      <div className="flex space-x-1 sm:space-x-2 border-b border-slate-200 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'overview', label: 'Visão Geral & KPIs', icon: Sliders },
          { id: 'users', label: `Gestão de Usuários (${registeredUsers.length})`, icon: Users },
          { id: 'affiliates', label: 'Conversão de Afiliados (50/50)', icon: Share2 },
          { id: 'settings', label: 'Variáveis de Configuração', icon: Settings },
          { id: 'payouts', label: `Aprovação de Saques (${pendingWithdrawals.length})`, icon: Coins },
          { id: 'questions', label: 'Banco de Questões & IA', icon: HelpCircle },
          { id: 'scraper', label: 'Monitor Scraper MININT', icon: Bot },
          { id: 'extractor', label: 'IA Extratora PDF', icon: FileSpreadsheet },
          { id: 'concursos', label: 'Concursos Públicos', icon: Building },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB: OVERVIEW & KPIS */}
      {/* ======================================================== */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Usuários Cadastrados</span>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1">
                {registeredUsers.length}
              </div>
              <span className="text-[11px] text-emerald-700 font-medium">
                {registeredUsers.filter((u) => u.isSubscribed).length} com planos pagos ativos
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Faturação Bruta Acumulada</span>
              <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
                18.450.000 Kz
              </div>
              <span className="text-[11px] text-slate-400">Multicaixa Express & Referências ATM</span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Comissões Pagas a Afiliados</span>
              <div className="text-2xl font-bold font-mono text-blue-900 mt-1">
                {affiliateMetrics.totalCommissionsEarnedKz.toLocaleString()} Kz
              </div>
              <span className="text-[11px] text-slate-400">
                {affiliateMetrics.totalPaidConversions} vendas geradas por promotores
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500">Saques Pendentes</span>
              <div className="text-2xl font-bold font-mono text-amber-600 mt-1">
                {pendingTotalKz.toLocaleString()} Kz
              </div>
              <span className="text-[11px] text-amber-700 font-medium">
                {pendingWithdrawals.length} solicitações aguardam liquidação
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-900" />
                  <span>Resumo do Funil de Conversão de Afiliados</span>
                </h4>
                <button
                  onClick={() => setAdminTab('affiliates')}
                  className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1"
                >
                  <span>Ver Detalhes do Funil</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">1. Cliques</span>
                  <div className="text-lg font-bold font-mono text-slate-900">{affiliateMetrics.totalClicks}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">2. Cadastros</span>
                  <div className="text-lg font-bold font-mono text-blue-900">{affiliateMetrics.totalSignups}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">3. Vendas Pagas</span>
                  <div className="text-lg font-bold font-mono text-emerald-700">{affiliateMetrics.totalPaidConversions}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">4. Conversão</span>
                  <div className="text-lg font-bold font-mono text-amber-600">{affiliateMetrics.conversionRate}%</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Impacto do Cupom 10% OFF:</strong> {affiliateMetrics.discountSalesCount} de {affiliateMetrics.totalPaidConversions} vendas foram realizadas pelo link de afiliado com desconto.
                  </span>
                </div>
                <span className="font-bold text-emerald-950 font-mono">100% Comissão Intacta</span>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">Ações Rápidas de Super-Admin</h4>
                <div className="space-y-2 mt-3">
                  <button
                    onClick={() => {
                      setAdminTab('users');
                      setIsAddUserModalOpen(true);
                    }}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-blue-900 hover:bg-blue-800 text-white flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Plus className="w-3.5 h-3.5" />
                      <span>Cadastrar Novo Candidato</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setAdminTab('settings')}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5 text-slate-600" />
                      <span>Ajustar Preços e Comissões</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setAdminTab('payouts')}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Coins className="w-3.5 h-3.5 text-amber-600" />
                      <span>Fila de Saques ({pendingWithdrawals.length})</span>
                    </span>
                    <span className="text-[11px] font-mono font-bold text-amber-700">
                      {pendingTotalKz.toLocaleString()} Kz
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                Sincronização com MININT: <strong>candidaturas.minint.ao</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: GESTÃO DE USUÁRIOS CADASTRADOS */}
      {/* ======================================================== */}
      {adminTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-900" />
                <span>Gestão Centralizada de Usuários Cadastrados</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pesquisa, alteração de planos (30 dias / Vitalício), bloqueio de contas e acompanhamento de simulados.
              </p>
            </div>

            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Candidato</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nome, telefone, província ou código..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900"
              />
            </div>

            <div>
              <select
                value={userPlanFilter}
                onChange={(e) => setUserPlanFilter(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="todos">Todos os Planos</option>
                <option value="gratuito">Apenas Gratuito</option>
                <option value="monthly">Apenas Passe 30 Dias</option>
                <option value="lifetime">Apenas Vitalício (Garantia Risco Zero)</option>
              </select>
            </div>

            <div>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="todos">Todos os Estados</option>
                <option value="ativo">Apenas Ativos</option>
                <option value="bloqueado">Apenas Bloqueados</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3 font-semibold">Candidato / Identificação</th>
                  <th className="py-3 px-3 font-semibold">Província & Carreira</th>
                  <th className="py-3 px-3 font-semibold">Plano de Subscrição</th>
                  <th className="py-3 px-3 font-semibold">Afiliado / Indicação</th>
                  <th className="py-3 px-3 font-semibold">Simulados / Média</th>
                  <th className="py-3 px-3 font-semibold">Estado</th>
                  <th className="py-3 px-3 font-semibold text-right">Ações de Gestão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Nenhum usuário encontrado com os filtros actuais.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{user.whatsapp}</div>
                        <div className="text-[10px] text-slate-400">Registo: {user.registeredAt}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800">{user.province}</span>
                        <div className="text-[11px] text-blue-900 font-medium truncate max-w-xs">
                          {user.careerTrack}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        {user.isSubscribed ? (
                          <div>
                            <span
                              className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded ${
                                user.subscriptionPlan === 'lifetime'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-blue-100 text-blue-900 border border-blue-300'
                              }`}
                            >
                              {user.subscriptionPlan === 'lifetime' ? 'Vitalício (Risco Zero)' : 'Passe 30 Dias'}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">{user.subscriptionExpiry}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded">
                            Acesso Gratuito
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-mono text-[11px] text-slate-700 font-bold">
                          {user.affiliateCode}
                        </div>
                        {user.referredBy && (
                          <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            <span>Indicado por: {user.referredBy}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono tabular-nums">
                        <div>{user.totalSimulados || 0} testes</div>
                        {user.averageScore ? (
                          <span
                            className={`text-[11px] font-bold ${
                              user.averageScore >= params.riskZeroThresholdPercent
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {user.averageScore}% média
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Sem notas</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            user.status === 'Ativo'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle subscription button */}
                          <button
                            onClick={() =>
                              toggleUserSubscription(
                                user.id,
                                user.subscriptionPlan === 'monthly' ? 'lifetime' : 'monthly'
                              )
                            }
                            title="Alternar/Ativar Plano"
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold"
                          >
                            {user.isSubscribed ? 'Revogar/Mudar' : 'Ativar Pro'}
                          </button>

                          {/* Block/Unblock status */}
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            title={user.status === 'Ativo' ? 'Bloquear Usuário' : 'Ativar Usuário'}
                            className={`p-1.5 rounded-lg border ${
                              user.status === 'Ativo'
                                ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {user.status === 'Ativo' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Remover permanentemente o usuário ${user.name}?`)) {
                                deleteRegisteredUser(user.id);
                              }
                            }}
                            title="Excluir"
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add User Modal */}
          {isAddUserModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900">Cadastrar Novo Candidato Manualmente</h4>
                  <button
                    onClick={() => setIsAddUserModalOpen(false)}
                    className="text-slate-400 hover:text-slate-600 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-3.5 mt-4 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: João Baptista Chivela"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">WhatsApp (+244)</label>
                    <input
                      type="text"
                      required
                      placeholder="+244 923 112 334"
                      value={newUserPhone}
                      onChange={(e) => setNewUserPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Província</label>
                      <select
                        value={newUserProvince}
                        onChange={(e) => setNewUserProvince(e.target.value as Province)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Luanda">Luanda</option>
                        <option value="Huambo">Huambo</option>
                        <option value="Benguela">Benguela</option>
                        <option value="Huíla">Huíla</option>
                        <option value="Cabinda">Cabinda</option>
                        <option value="Cuanza Sul">Cuanza Sul</option>
                        <option value="Uíge">Uíge</option>
                        <option value="Malanje">Malanje</option>
                        <option value="Namibe">Namibe</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Carreira Alvo</label>
                      <select
                        value={newUserCareer}
                        onChange={(e) => setNewUserCareer(e.target.value as CareerTrack)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="Polícia Nacional (PNA)">Polícia Nacional (PNA)</option>
                        <option value="Serviço de Investigação Criminal (SIC)">SIC</option>
                        <option value="Serviço de Migração e Estrangeiros (SME)">SME</option>
                        <option value="Serviço de Protecção Civil e Bombeiros (SPCB)">Bombeiros</option>
                        <option value="Serviço Penitenciário">Serviço Penitenciário</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Plano Inicial</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewUserPlan('free')}
                        className={`py-2 rounded-lg border font-semibold ${
                          newUserPlan === 'free' ? 'border-blue-900 bg-blue-50 text-blue-900' : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        Gratuito
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewUserPlan('monthly')}
                        className={`py-2 rounded-lg border font-semibold ${
                          newUserPlan === 'monthly' ? 'border-blue-900 bg-blue-50 text-blue-900' : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        30 Dias
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewUserPlan('lifetime')}
                        className={`py-2 rounded-lg border font-semibold ${
                          newUserPlan === 'lifetime' ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        Vitalício
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddUserModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-900 text-white rounded-lg font-bold hover:bg-blue-800"
                    >
                      Salvar Candidato
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: MÉTRICAS DE CONVERSÃO DE AFILIADOS */}
      {/* ======================================================== */}
      {adminTab === 'affiliates' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  Métricas de Recomendação Viral
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Sistema 50/50 & Desconto 10%
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-amber-600" />
                <span>Painel de Conversão & Inteligência de Afiliados</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Funil de vendas, desempenho dos principais promotores, adesão ao cupom de 10% e comissões garantidas.
              </p>
            </div>

            <button
              onClick={() => setAdminTab('payouts')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Coins className="w-4 h-4" />
              <span>Ver Pedidos de Saque ({pendingWithdrawals.length})</span>
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Total de Cliques nos Links</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
                {affiliateMetrics.totalClicks.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-400">Tráfego orgânico via WhatsApp</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Vendas Convertidas</span>
              <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
                {affiliateMetrics.totalPaidConversions}
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold">
                {affiliateMetrics.conversionRate}% taxa de conversão global
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Faturação Gerada por Links</span>
              <div className="text-xl font-bold font-mono text-blue-900 mt-0.5">
                {affiliateMetrics.totalRevenueKz.toLocaleString()} Kz
              </div>
              <span className="text-[10px] text-slate-400">Receita bruta proveniente de indicações</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-medium text-slate-500 block">Comissões Devidas aos Promotores</span>
              <div className="text-xl font-bold font-mono text-amber-600 mt-0.5">
                {affiliateMetrics.totalCommissionsEarnedKz.toLocaleString()} Kz
              </div>
              <span className="text-[10px] text-amber-700 font-semibold">
                {affiliateMetrics.totalPendingPayoutsKz.toLocaleString()} Kz pendentes de saque
              </span>
            </div>
          </div>

          {/* Bar Chart comparing Top Promoters with Recharts */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Desempenho Comparativo dos Top Promotores (Cliques vs Vendas)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Relação de volume de tráfego direcionado e vendas pagas convertidas por afiliado.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 font-mono">
                Top 5 Afiliados Oficiais
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={affiliatePromoters}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  barGap={4}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tick={{ fill: '#475569', fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(val, name) => {
                      if (name === 'clicks') return [`${val} cliques`, 'Cliques no Link'];
                      if (name === 'paidConversions') return [`${val} assinaturas`, 'Vendas Pagas'];
                      return [val, name];
                    }}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      color: '#FFF',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                    formatter={(value) => (value === 'clicks' ? 'Cliques no Link' : 'Vendas Pagas Convertidas')}
                  />
                  <Bar dataKey="clicks" name="clicks" fill="#CBD5E1" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="paidConversions" name="paidConversions" fill="#0A2540" radius={[4, 4, 0, 0]} maxBarSize={28}>
                    {affiliatePromoters.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.tier.includes('Ouro') ? '#D97706' : '#0A2540'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leaderboard Table of Promoters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Quadro de Promotores de Destaque (Ranking & Balanços):
              </h4>
              <span className="text-xs text-slate-500 font-medium">Comissões 40% (Prata) / 50% (Ouro)</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Promotor</th>
                    <th className="py-2.5 px-3 font-semibold">Nível / Comissão</th>
                    <th className="py-2.5 px-3 font-semibold">Código Ref</th>
                    <th className="py-2.5 px-3 font-semibold">Cliques</th>
                    <th className="py-2.5 px-3 font-semibold">Vendas</th>
                    <th className="py-2.5 px-3 font-semibold">Taxa Conv.</th>
                    <th className="py-2.5 px-3 font-semibold">Receita Gerada</th>
                    <th className="py-2.5 px-3 font-semibold">Comissão Total</th>
                    <th className="py-2.5 px-3 font-semibold">Saldo a Pagar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {affiliatePromoters.map((p) => (
                    <tr key={p.affiliateId} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.whatsapp} · {p.province}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                            p.tier.includes('Ouro')
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {p.tier}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-900">{p.referralCode}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{p.clicks}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{p.paidConversions}</td>
                      <td className="py-3 px-3 font-mono text-emerald-700 font-semibold">{p.conversionRate}%</td>
                      <td className="py-3 px-3 font-mono text-slate-700">{p.totalRevenueGeneratedKz.toLocaleString()} Kz</td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-900">{p.earnedCommissionKz.toLocaleString()} Kz</td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-600">
                        {p.pendingPayoutKz > 0 ? `${p.pendingPayoutKz.toLocaleString()} Kz` : '0 Kz'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: CONTROLE CENTRALIZADO DE CONFIGURAÇÃO */}
      {/* ======================================================== */}
      {adminTab === 'settings' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  Controlo Centralizado & Dynamic Config Engine
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-800" />
                <span>Variáveis Globais do Sistema ({tempParams.appName})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Altere em tempo de execução preços, comissões, descontos, cores institucionais e critérios da Garantia de Risco Zero.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Restaurar Padrão MININT</span>
              </button>

              <button
                type="button"
                onClick={handleExportConfigJson}
                className="px-3.5 py-2 border border-blue-900 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar JSON</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Group 1: Brand & Identity */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-900" />
                <span>1. Identidade Visual e Marca Institucional</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Oficial do Aplicativo (Parametrizável)
                  </label>
                  <input
                    type="text"
                    required
                    value={tempParams.appName}
                    onChange={(e) => setTempParams({ ...tempParams, appName: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Atualiza instantaneamente o cabeçalho, rodapé e títulos.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Slogan Institucional
                  </label>
                  <input
                    type="text"
                    required
                    value={tempParams.appSlogan}
                    onChange={(e) => setTempParams({ ...tempParams, appSlogan: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cor Primária Institucional (Ex: Azul MININT #0A2540)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={tempParams.primaryColor}
                      onChange={(e) => setTempParams({ ...tempParams, primaryColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={tempParams.primaryColor}
                      onChange={(e) => setTempParams({ ...tempParams, primaryColor: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono bg-white uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cor Secundária / Acento (Ex: Dourado Insígnia #D97706)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={tempParams.secondaryColor}
                      onChange={(e) => setTempParams({ ...tempParams, secondaryColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={tempParams.secondaryColor}
                      onChange={(e) => setTempParams({ ...tempParams, secondaryColor: e.target.value })}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono bg-white uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Group 2: Pricing & Referral Discount */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>2. Políticas de Preço e Desconto Viral de Afiliados</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preço Passe 30 Dias (Kwanzas)
                  </label>
                  <input
                    type="number"
                    value={tempParams.priceMonthlyKz}
                    onChange={(e) => setTempParams({ ...tempParams, priceMonthlyKz: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Com desconto 10%: {(tempParams.priceMonthlyKz * 0.9).toLocaleString()} Kz
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preço Acesso Vitalício (Kwanzas)
                  </label>
                  <input
                    type="number"
                    value={tempParams.priceLifetimeKz}
                    onChange={(e) => setTempParams({ ...tempParams, priceLifetimeKz: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Com desconto 10%: {(tempParams.priceLifetimeKz * 0.9).toLocaleString()} Kz
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Taxa de Desconto do Link de Afiliado (0.10 = 10%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="0.5"
                    value={tempParams.referralDiscountRate}
                    onChange={(e) => setTempParams({ ...tempParams, referralDiscountRate: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold bg-white"
                  />
                  <span className="text-[10px] text-emerald-700 mt-1 block font-medium">
                    {Math.round(tempParams.referralDiscountRate * 100)}% de desconto para quem comprar pelo link
                  </span>
                </div>
              </div>
            </div>

            {/* Group 3: Affiliate Commission & Withdrawal Rules */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>3. Regras de Comissionamento e Liquidação (Sistema 50/50)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Comissão Base Prata (40% = 0.40)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={tempParams.affiliateBaseRate}
                    onChange={(e) => setTempParams({ ...tempParams, affiliateBaseRate: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Calculada sobre o valor nominal cheio
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Comissão Nível Ouro (50% = 0.50)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={tempParams.affiliateGoldRate}
                    onChange={(e) => setTempParams({ ...tempParams, affiliateGoldRate: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Metade da receita compartilhada
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Meta de Vendas para Nível Ouro
                  </label>
                  <input
                    type="number"
                    value={tempParams.affiliateGoldThreshold}
                    onChange={(e) => setTempParams({ ...tempParams, affiliateGoldThreshold: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Promoção automática ao atingir meta
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Valor Mínimo de Saque (Kz)
                  </label>
                  <input
                    type="number"
                    value={tempParams.minWithdrawalKz}
                    onChange={(e) => setTempParams({ ...tempParams, minWithdrawalKz: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Multicaixa Express / IBAN EMIS
                  </span>
                </div>
              </div>
            </div>

            {/* Group 4: Risk Zero & Academic Governance */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-600" />
                <span>4. Governança Acadêmica & Garantia de Risco Zero</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ponto de Corte para Reembolso Garantia Risco Zero (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="95"
                    value={tempParams.riskZeroThresholdPercent}
                    onChange={(e) => setTempParams({ ...tempParams, riskZeroThresholdPercent: Number(e.target.value) })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono font-bold bg-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Candidato com média &ge; {tempParams.riskZeroThresholdPercent}% que reprovar no concurso recebe 100% de volta.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Concurso Público Ativo na Plataforma
                  </label>
                  <select
                    value={tempParams.activeConcurso}
                    onChange={(e) => setTempParams({ ...tempParams, activeConcurso: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {concursos.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.ministry})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {settingsSaved && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-lg font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Todas as variáveis de configuração foram atualizadas com sucesso em tempo real!</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Salvar & Aplicar Variáveis de Configuração
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: APROVAÇÃO DE SAQUES DE AFILIADOS */}
      {/* ======================================================== */}
      {adminTab === 'payouts' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Aprovação de Levantamentos de Afiliados</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Liquidação via Multicaixa Express ou transferência bancária EMIS (mínimo de {params.minWithdrawalKz.toLocaleString()} Kz).
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
              {pendingWithdrawals.length} Pedidos Pendentes ({pendingTotalKz.toLocaleString()} Kz)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Identificador</th>
                  <th className="py-2.5 px-3 font-semibold">Afiliado / Nome</th>
                  <th className="py-2.5 px-3 font-semibold">Montante</th>
                  <th className="py-2.5 px-3 font-semibold">Método</th>
                  <th className="py-2.5 px-3 font-semibold">Coordenadas</th>
                  <th className="py-2.5 px-3 font-semibold">Ação do Administrador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">{w.id}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">
                      <div>{w.candidateName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{w.affiliateId}</div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                      {w.amountKz.toLocaleString()} Kz
                    </td>
                    <td className="py-3 px-3">{w.method}</td>
                    <td className="py-3 px-3 font-mono text-slate-600 truncate max-w-xs">{w.accountDetails}</td>
                    <td className="py-3 px-3">
                      {w.status === 'Pendente' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => approveWithdrawal(w.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Aprovar & Pagar</span>
                          </button>
                          <button
                            onClick={() => rejectWithdrawal(w.id)}
                            className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Rejeitar</span>
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            w.status === 'Aprovado'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {w.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: BANCO DE QUESTÕES & GERADOR COM IA */}
      {/* ======================================================== */}
      {adminTab === 'questions' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Gerador de Questões Psicotécnicas com Gemini IA</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Utiliza a engenharia de prompts calibrada com a legislação e os padrões de provas do MININT em Angola.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={batchAiGenerating}
                onClick={handleGenerateBatchAi}
                className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{batchAiGenerating ? 'A Gerar Lote...' : 'Gerar Lote de 6 com IA'}</span>
              </button>

              <button
                type="button"
                disabled={isGeneratingAi}
                onClick={handleSimulateAiQuestion}
                className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingAi ? 'A Preencher...' : 'Gerar 1 Questão com IA'}</span>
              </button>
            </div>
          </div>

          {/* Question Form */}
          <form onSubmit={handleCreateQuestion} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Área / Categoria</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as QuestionCategory)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Psicotécnico - Lógica">Psicotécnico - Lógica</option>
                  <option value="Psicotécnico - Verbal">Psicotécnico - Verbal</option>
                  <option value="Psicotécnico - Espacial">Psicotécnico - Espacial</option>
                  <option value="Psicotécnico - Numérico">Psicotécnico - Numérico</option>
                  <option value="Conhecimentos Gerais - Angola">Conhecimentos Gerais - Angola</option>
                  <option value="Legislação e Função Pública">Legislação e Função Pública</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Opção Correcta</label>
                <select
                  value={correctOpt}
                  onChange={(e) => setCorrectOpt(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold text-emerald-700"
                >
                  <option value="A">Opção A</option>
                  <option value="B">Opção B</option>
                  <option value="C">Opção C</option>
                  <option value="D">Opção D</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Enunciado da Questão</label>
              <textarea
                rows={3}
                required
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Insira o enunciado claro ou use o botão 'Gerar com IA' acima..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Opção A</label>
                <input
                  type="text"
                  required
                  value={optA}
                  onChange={(e) => setOptA(e.target.value)}
                  placeholder="Texto da alternativa A"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Opção B</label>
                <input
                  type="text"
                  required
                  value={optB}
                  onChange={(e) => setOptB(e.target.value)}
                  placeholder="Texto da alternativa B"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Opção C</label>
                <input
                  type="text"
                  value={optC}
                  onChange={(e) => setOptC(e.target.value)}
                  placeholder="Texto da alternativa C"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Opção D</label>
                <input
                  type="text"
                  value={optD}
                  onChange={(e) => setOptD(e.target.value)}
                  placeholder="Texto da alternativa D"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Fundamentação Lógica ou Jurídica (Gabarito Comentado)
              </label>
              <input
                type="text"
                value={newExplanation}
                onChange={(e) => setNewExplanation(e.target.value)}
                placeholder="Ex: Artigo da Lei ou resolução do silogismo passo a passo..."
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Salvar Questão no Banco Oficial</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: WEB SCRAPER MONITOR */}
      {/* ======================================================== */}
      {adminTab === 'scraper' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-900" />
                <span>Consola do Web Scraper (candidaturas.minint.ao)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Execução cronométrica a cada 30 minutos com deteção de ETag e SHA-256 delta hashing.
              </p>
            </div>

            <button
              onClick={triggerScraperRun}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Executar Ciclo de Varredura Imediato</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Data / Hora</th>
                  <th className="py-2.5 px-3 font-semibold">URL Alvo</th>
                  <th className="py-2.5 px-3 font-semibold">Estado HTTP</th>
                  <th className="py-2.5 px-3 font-semibold">Hash SHA-256</th>
                  <th className="py-2.5 px-3 font-semibold">Detalhes do Rastreio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scraperLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-medium text-slate-800">{log.timestamp}</td>
                    <td className="py-3 px-3 font-mono text-blue-900 truncate max-w-xs">{log.targetUrl}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          log.status.includes('Novo')
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">{log.changeHash}</td>
                    <td className="py-3 px-3 text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: IA EXTRATORA DE LISTAS PDF */}
      {/* ======================================================== */}
      {adminTab === 'extractor' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>IA Extratora de Listas Governamentais (PDF para Tabela Relacional)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Converte arquivos massivos com centenas de páginas publicados pelo MININT em registos estruturados pesquisáveis instantaneamente na plataforma.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700">Arquivo PDF Carregado:</label>
                <span className="font-mono text-xs text-blue-900 font-semibold">{pdfFileName}</span>
              </div>

              <button
                disabled={isExtracting}
                onClick={handleSimulatePdfExtraction}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isExtracting ? (
                  <span>A Processar com Gemini OCR e Regex...</span>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Extrair e Sincronizar com a Base de Dados</span>
                  </>
                )}
              </button>
            </div>

            {extractedCount !== null && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {extractedCount} novos candidatos foram extraídos com sucesso, sanitizados e inseridos na tabela relacional de Luanda, Huambo e Benguela!
                </span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Amostra de Candidatos na Tabela Indexada ({admittedCandidates.length} registos):
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 font-semibold">Nome Completo</th>
                    <th className="py-2 px-3 font-semibold">Nº BI</th>
                    <th className="py-2 px-3 font-semibold">Província</th>
                    <th className="py-2 px-3 font-semibold">Carreira</th>
                    <th className="py-2 px-3 font-semibold">Centro de Exame</th>
                    <th className="py-2 px-3 font-semibold">Sala</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admittedCandidates.slice(0, 5).map((cand) => (
                    <tr key={cand.id}>
                      <td className="py-2 px-3 font-medium text-slate-900">{cand.fullName}</td>
                      <td className="py-2 px-3 font-mono text-slate-600">{cand.biNumberMasked}</td>
                      <td className="py-2 px-3">{cand.province}</td>
                      <td className="py-2 px-3 text-blue-900">{cand.careerTrack}</td>
                      <td className="py-2 px-3 truncate max-w-xs">{cand.examCenter}</td>
                      <td className="py-2 px-3 font-bold">{cand.examRoom}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB: GESTOR MULTI-CONCURSO */}
      {/* ======================================================== */}
      {adminTab === 'concursos' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Gestor de Concursos Públicos de Angola</h3>
            <p className="text-xs text-slate-500 mt-1">
              Arquitetura escalável: alterne o concurso activo ou configure novas selecções da administração pública sem alterar código.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {concursos.map((c) => {
              const isSelected = c.id === params.activeConcurso;
              return (
                <div
                  key={c.id}
                  className={`p-5 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-900 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500">{c.ministry}</span>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5">{c.name}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        c.status === 'Fase de Exames'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                    <span className="text-slate-600 font-mono font-medium">Vagas Previstas: {c.totalVagas.toLocaleString()}</span>
                    <button
                      onClick={() => switchConcurso(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? 'Concurso Activo' : 'Activar na Plataforma'}
                    </button>
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
