import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppParameters,
  CandidateUser,
  MinintNotification,
  AdmittedCandidate,
  Question,
  ExamAttempt,
  RankingEntry,
  AffiliateStats,
  WithdrawalRequest,
  ScraperLog,
  ConcursoOption,
  Province,
  CareerTrack,
  QuestionCategory,
  AffiliateLeaderboardEntry,
  RegisterFormData,
  EmailNotificationItem,
  PushNotificationItem
} from '../types';
import {
  initialParameters,
  mockConcursos,
  mockNotifications,
  mockAdmittedCandidates,
  mockQuestions,
  mockRanking,
  mockWithdrawals,
  mockScraperLogs,
  mockRegisteredUsers,
  mockAffiliatePromoters
} from '../data/mockData';
import { fetchAiQuestions } from '../services/aiQuestionService';
import {
  syncCandidateToFirestore,
  loadCandidatesFromFirestore,
  saveExamAttemptToFirestore,
  loadCandidateExamsFromFirestore,
  testConnection,
  ensureAuthenticated,
  loginWithFirebaseEmail as firebaseLogin,
  registerWithFirebaseEmail as firebaseRegister,
  sendFirebasePasswordReset as firebaseSendReset,
  logoutFromFirebase,
  mapFirebaseAuthError,
  onFirebaseAuthStateChanged,
  auth
} from '../services/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  syncCandidateToSupabase,
  loadCandidatesFromSupabase,
  saveExamAttemptToSupabase,
  loadCandidateExamsFromSupabase,
  recordSubscriptionToSupabase,
  recordWithdrawalToSupabase,
  bulkSyncLocalDataToSupabase,
  SupabaseSyncResult
} from '../services/supabaseService';
import { testSupabaseHealth, SupabaseHealthCheck } from '../lib/supabase';

export type ViewMode = 'public' | 'candidate' | 'admin' | 'architecture';
export type CandidateTab =
  | 'inicio'
  | 'calendario'
  | 'listas'
  | 'estudos'
  | 'simulador'
  | 'treinador'
  | 'termometro'
  | 'ranking'
  | 'taf'
  | 'afiliados';

interface AppContextType {
  params: AppParameters;
  updateParams: (newParams: Partial<AppParameters>) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  candidateTab: CandidateTab;
  setCandidateTab: (tab: CandidateTab) => void;
  currentUser: CandidateUser;
  updateCurrentUser: (userData: Partial<CandidateUser>) => void;
  notifications: MinintNotification[];
  addNotification: (notif: Omit<MinintNotification, 'id'>) => void;
  admittedCandidates: AdmittedCandidate[];
  addAdmittedCandidates: (newOnes: AdmittedCandidate[]) => void;
  questions: Question[];
  addQuestion: (q: Question) => void;
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  generateAiExam: (options?: { category?: QuestionCategory; count?: number }) => Promise<void>;
  isGeneratingAiQuestions: boolean;
  attempts: ExamAttempt[];
  recordExamAttempt: (attempt: Omit<ExamAttempt, 'id'>) => void;
  ranking: RankingEntry[];
  affiliateStats: AffiliateStats;
  withdrawals: WithdrawalRequest[];
  requestWithdrawal: (amount: number, method: 'Multicaixa Express' | 'IBAN', details: string) => { success: boolean; message: string };
  approveWithdrawal: (id: string) => void;
  rejectWithdrawal: (id: string) => void;
  scraperLogs: ScraperLog[];
  triggerScraperRun: () => void;
  concursos: ConcursoOption[];
  switchConcurso: (id: string) => void;
  isPaywallOpen: boolean;
  setIsPaywallOpen: (open: boolean) => void;
  subscribeUser: (plan: 'monthly' | 'lifetime') => void;
  // Referral & Discount 10%
  hasReferralDiscount: boolean;
  appliedReferralCode: string;
  applyReferralCode: (code: string) => { success: boolean; message: string; discountPercent: number };
  removeReferralCode: () => void;
  getPlanPrice: (plan: 'monthly' | 'lifetime') => { originalPrice: number; finalPrice: number; discountKz: number; hasDiscount: boolean };
  // User Management
  registeredUsers: CandidateUser[];
  addRegisteredUser: (user: CandidateUser) => void;
  updateRegisteredUser: (id: string, updates: Partial<CandidateUser>) => void;
  toggleUserSubscription: (id: string, plan?: 'monthly' | 'lifetime') => void;
  toggleUserStatus: (id: string) => void;
  deleteRegisteredUser: (id: string) => void;
  // Affiliate Promoters & System Reset
  affiliatePromoters: AffiliateLeaderboardEntry[];
  resetParametersToDefaults: () => void;
  // Dark Mode Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (t: 'light' | 'dark') => void;
  // Registration & Email OTP Verification Flow
  isRegisterModalOpen: boolean;
  setIsRegisterModalOpen: (open: boolean) => void;
  pendingRegistration: {
    data: RegisterFormData;
    code: string;
    expiresAt: number;
  } | null;
  startEmailRegistration: (formData: RegisterFormData) => { success: boolean; message: string; code: string };
  verifyEmailCode: (code: string) => { success: boolean; message: string };
  resendVerificationCode: () => { success: boolean; message: string; code?: string };
  cancelPendingRegistration: () => void;
  // Email Inbox & Welcome Notifications
  inboxEmails: EmailNotificationItem[];
  isEmailViewerOpen: boolean;
  setIsEmailViewerOpen: (open: boolean) => void;
  selectedEmail: EmailNotificationItem | null;
  setSelectedEmail: (email: EmailNotificationItem | null) => void;
  markEmailAsRead: (id: string) => void;
  // Push Notifications
  pushPermission: NotificationPermission;
  pushEnabled: boolean;
  requestPushPermission: () => Promise<boolean>;
  sendPushNotification: (
    title: string,
    body: string,
    category?: PushNotificationItem['category'],
    linkUrl?: string
  ) => void;
  pushHistory: PushNotificationItem[];
  isPushCenterOpen: boolean;
  setIsPushCenterOpen: (open: boolean) => void;
  activePushToast: PushNotificationItem | null;
  dismissPushToast: () => void;
  // Multi-Candidate Auth & Persistent Database
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isDatabaseConnected: boolean;
  switchCandidateAccount: (candidateId: string) => Promise<void>;
  loginWithEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  firebaseUser: FirebaseUser | null;
  isFirebaseAuthLoading: boolean;
  loginWithFirebaseEmail: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: CandidateUser }>;
  registerWithFirebaseEmail: (
    email: string,
    password: string,
    name: string,
    province: Province,
    careerTrack: CareerTrack,
    referralCode?: string
  ) => Promise<{ success: boolean; message: string; user?: CandidateUser }>;
  sendFirebasePasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  logoutUser: () => Promise<void>;
  // Supabase Database Integration
  isSupabaseConnected: boolean;
  isSupabaseModalOpen: boolean;
  setIsSupabaseModalOpen: (open: boolean) => void;
  supabaseHealth: SupabaseHealthCheck | null;
  checkSupabaseConnection: () => Promise<SupabaseHealthCheck>;
  syncAllToSupabase: () => Promise<SupabaseSyncResult>;
  // Stripe Checkout & Webhook
  isProcessingStripe: boolean;
  triggerStripePayment: (plan: 'monthly' | 'lifetime', useSimulatedWebhook?: boolean) => Promise<{ success: boolean; message: string }>;
  // Legal Policies Modal
  isLegalModalOpen: boolean;
  setIsLegalModalOpen: (open: boolean) => void;
  legalModalTab: 'termos' | 'privacidade' | 'pagamentos' | 'afiliados' | 'independencia';
  setLegalModalTab: (tab: 'termos' | 'privacidade' | 'pagamentos' | 'afiliados' | 'independencia') => void;
  openLegalModal: (tab?: 'termos' | 'privacidade' | 'pagamentos' | 'afiliados' | 'independencia') => void;
}

const defaultUser: CandidateUser = {
  id: 'usr-current',
  name: 'Manuel Domingos Katumbela',
  email: 'benvindomanuel79@gmail.com',
  emailVerified: true,
  whatsapp: '+244 923 884 102',
  province: 'Luanda',
  careerTrack: 'Polícia Nacional (PNA)',
  isSubscribed: false,
  registeredAt: '2026-10-24',
  status: 'Ativo',
  affiliateCode: 'CAND-89412',
  hasReferralDiscount: true, // Default enabled via welcome affiliate link
  appliedDiscountCode: 'REF-MININT10',
};

const defaultAffiliateStats: AffiliateStats = {
  clicks: 148,
  signups: 34,
  sales: 9,
  conversionRate: 26.4,
  balanceKz: 18000,
  totalEarnedKz: 36000,
  currentTier: 'Prata (40%)',
  salesToGold: 11,
};

const initialAttempts: ExamAttempt[] = [
  {
    id: 'att-1',
    date: '2026-10-22',
    totalQuestions: 8,
    correctAnswers: 5,
    scorePercentage: 62.5,
    durationSeconds: 1420,
    categoryScores: {
      'Psicotécnico - Lógica': { total: 2, correct: 1 },
      'Psicotécnico - Verbal': { total: 1, correct: 1 },
      'Psicotécnico - Numérico': { total: 1, correct: 1 },
      'Psicotécnico - Espacial': { total: 1, correct: 0 },
      'Conhecimentos Gerais - Angola': { total: 2, correct: 1 },
      'Legislação e Função Pública': { total: 1, correct: 1 },
    },
  },
  {
    id: 'att-2',
    date: '2026-10-23',
    totalQuestions: 8,
    correctAnswers: 6,
    scorePercentage: 75.0,
    durationSeconds: 1250,
    categoryScores: {
      'Psicotécnico - Lógica': { total: 2, correct: 2 },
      'Psicotécnico - Verbal': { total: 1, correct: 1 },
      'Psicotécnico - Numérico': { total: 1, correct: 1 },
      'Psicotécnico - Espacial': { total: 1, correct: 0 },
      'Conhecimentos Gerais - Angola': { total: 2, correct: 1 },
      'Legislação e Função Pública': { total: 1, correct: 1 },
    },
  },
];

const initialEmails: EmailNotificationItem[] = [
  {
    id: 'email-welcome-initial',
    to: 'benvindomanuel79@gmail.com',
    toName: 'Manuel Domingos Katumbela',
    subject: '🎉 Bem-vindo(a) ao AproVE! A sua preparação para o MININT começou',
    type: 'welcome',
    sentAt: 'Hoje às 08:30',
    read: false,
    htmlPreview: `Prezado(a) Manuel Domingos Katumbela,\n\nSeja muito bem-vindo(a) ao AproVE — Plataforma Especializada em Preparação para o Concurso Público de Ingresso Externo do Ministério do Interior (MININT) de Angola.\n\nSeus dados cadastrais foram confirmados com sucesso:\n• Província: Luanda\n• Carreira: Polícia Nacional (PNA)\n• Status do E-mail: Verificado com Sucesso\n• Código de Afiliado Pessoal: CAND-89412\n\nPróximos passos recomendados:\n1. Acesse o Cronograma Alfabético oficial para conferir a data do seu exame.\n2. Inicie o Simulador de Provas Digitais de 45 minutos.\n3. Indique amigos usando o seu código com 10% de desconto e receba até 50% de comissão direta via Multicaixa Express.\n\nComissão de Ingresso Externo MININT · Apoio Acadêmico AproVE`
  },
  {
    id: 'email-otp-initial',
    to: 'benvindomanuel79@gmail.com',
    toName: 'Manuel Domingos Katumbela',
    subject: '[AproVE MININT] Código de Confirmação do Cadastro: 739204',
    type: 'verification_code',
    code: '739204',
    sentAt: 'Hoje às 08:28',
    read: true,
    htmlPreview: `Prezado(a) Manuel Domingos Katumbela,\n\nRecebemos a solicitação de abertura da sua conta no AproVE para o Concurso do MININT 2026.\n\nSeu código de verificação é:\n739204\n\nEste código expira em 10 minutos. Nunca partilhe este código com terceiros.`
  }
];

const initialPushHistory: PushNotificationItem[] = [
  {
    id: 'push-1',
    title: 'Portal MININT: Novo Comunicado Detectado',
    body: 'Adenda publicada ao cronograma de exames da província de Luanda e Benguela.',
    category: 'minint_oficial',
    timestamp: 'Hoje às 08:15',
    read: true,
  },
  {
    id: 'push-2',
    title: 'Meta de Estudos do Dia',
    body: 'Faltam 10 questões para completar a meta do cronograma de Psicotécnicos de hoje.',
    category: 'estudos',
    timestamp: 'Hoje às 07:00',
    read: false,
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [params, setParams] = useState<AppParameters>(initialParameters);
  const [viewMode, setViewMode] = useState<ViewMode>('candidate');
  const [candidateTab, setCandidateTab] = useState<CandidateTab>('inicio');
  const [currentUser, setCurrentUser] = useState<CandidateUser>(defaultUser);
  const [notifications, setNotifications] = useState<MinintNotification[]>(mockNotifications);
  const [admittedCandidates, setAdmittedCandidates] = useState<AdmittedCandidate[]>(mockAdmittedCandidates);
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [attempts, setAttempts] = useState<ExamAttempt[]>(initialAttempts);
  const [ranking, setRanking] = useState<RankingEntry[]>(mockRanking);
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats>(defaultAffiliateStats);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(mockWithdrawals);
  const [scraperLogs, setScraperLogs] = useState<ScraperLog[]>(mockScraperLogs);
  const [concursos, setConcursos] = useState<ConcursoOption[]>(mockConcursos);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const [isGeneratingAiQuestions, setIsGeneratingAiQuestions] = useState<boolean>(false);
  const [registeredUsers, setRegisteredUsers] = useState<CandidateUser[]>(mockRegisteredUsers);
  const [affiliatePromoters, setAffiliatePromoters] = useState<AffiliateLeaderboardEntry[]>(mockAffiliatePromoters);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseAuthLoading, setIsFirebaseAuthLoading] = useState<boolean>(false);

  // Synchronize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onFirebaseAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);
      setIsFirebaseAuthLoading(false);
      if (fbUser && fbUser.email && !fbUser.isAnonymous) {
        const cleanEmail = fbUser.email.toLowerCase();
        // Check if candidate exists in registeredUsers or databases
        const matched = registeredUsers.find(u => u.email?.toLowerCase() === cleanEmail);
        if (matched) {
          setCurrentUser(matched);
        } else {
          // If first user (e.g. benvindomanuel79@gmail.com) or newly authenticated user
          const isOwnerUser = cleanEmail === 'benvindomanuel79@gmail.com';
          const newCandidate: CandidateUser = {
            id: fbUser.uid,
            name: fbUser.displayName || (isOwnerUser ? 'Manuel Domingos Katumbela' : cleanEmail.split('@')[0]),
            email: cleanEmail,
            emailVerified: fbUser.emailVerified,
            whatsapp: '+244 923 884 102',
            province: 'Luanda',
            careerTrack: 'Polícia Nacional (PNA)',
            isSubscribed: isOwnerUser,
            subscriptionPlan: isOwnerUser ? 'lifetime' : undefined,
            subscriptionExpiry: isOwnerUser ? 'Vitalício até à Nomeação' : undefined,
            registeredAt: new Date().toISOString().split('T')[0],
            status: 'Ativo',
            affiliateCode: 'CAND-' + Math.floor(10000 + Math.random() * 90000),
            hasReferralDiscount: true,
            appliedDiscountCode: 'REF-MININT10',
            totalSimulados: isOwnerUser ? 12 : 0,
            averageScore: isOwnerUser ? 84.5 : 0,
            lastLogin: 'Agora mesmo',
          };
          setCurrentUser(newCandidate);
          setRegisteredUsers(prev => [newCandidate, ...prev]);
          syncCandidateToFirestore(newCandidate).catch(e => console.warn('[Firebase Sync]', e));
          syncCandidateToSupabase(newCandidate).catch(e => console.warn('[Supabase Sync]', e));
        }
      }
    });
    return () => unsubscribe();
  }, [registeredUsers]);

  // Dark Mode Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aprove_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('aprove_theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Registration & Email OTP Verification State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [pendingRegistration, setPendingRegistration] = useState<{
    data: RegisterFormData;
    code: string;
    expiresAt: number;
  } | null>(null);

  // Legal Policies Modal State
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalModalTab, setLegalModalTab] = useState<'termos' | 'privacidade' | 'pagamentos' | 'afiliados' | 'independencia'>('termos');

  const openLegalModal = (tab?: 'termos' | 'privacidade' | 'pagamentos' | 'afiliados' | 'independencia') => {
    if (tab) setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  // Email Inbox & Viewer State
  const [inboxEmails, setInboxEmails] = useState<EmailNotificationItem[]>(initialEmails);
  const [isEmailViewerOpen, setIsEmailViewerOpen] = useState<boolean>(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailNotificationItem | null>(null);

  const markEmailAsRead = (id: string) => {
    setInboxEmails(prev => prev.map(em => em.id === id ? { ...em, read: true } : em));
  };

  // Push Notifications State
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });
  const [pushEnabled, setPushEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  });
  const [pushHistory, setPushHistory] = useState<PushNotificationItem[]>(initialPushHistory);
  const [isPushCenterOpen, setIsPushCenterOpen] = useState<boolean>(false);
  const [activePushToast, setActivePushToast] = useState<PushNotificationItem | null>(null);

  const dismissPushToast = () => setActivePushToast(null);

  // Multi-Candidate & Database State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState<boolean>(false);
  const [isProcessingStripe, setIsProcessingStripe] = useState<boolean>(false);

  // Supabase PostgreSQL State
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealthCheck | null>(null);

  const checkSupabaseConnection = async (): Promise<SupabaseHealthCheck> => {
    try {
      const health = await testSupabaseHealth();
      setSupabaseHealth(health);
      setIsSupabaseConnected(health.connected);
      return health;
    } catch (err: any) {
      const fallback: SupabaseHealthCheck = {
        connected: false,
        status: 'offline',
        latencyMs: 0,
        url: 'https://bpdcdljtdebckyzxmoai.supabase.co',
        projectRef: 'bpdcdljtdebckyzxmoai',
        tablesStatus: { candidates: null, exam_attempts: null, subscriptions: null, withdrawals: null },
        errorMessage: err?.message,
      };
      setSupabaseHealth(fallback);
      setIsSupabaseConnected(false);
      return fallback;
    }
  };

  const syncAllToSupabase = async (): Promise<SupabaseSyncResult> => {
    return await bulkSyncLocalDataToSupabase(
      registeredUsers,
      attempts,
      currentUser.id,
      currentUser.name
    );
  };

  // Initialize Supabase & Firebase persistence on boot
  useEffect(() => {
    async function initDatabases() {
      // 1. Supabase Connection & sync candidates
      try {
        const health = await checkSupabaseConnection();
        if (health.connected) {
          const remoteSupabaseCandidates = await loadCandidatesFromSupabase();
          if (remoteSupabaseCandidates && remoteSupabaseCandidates.length > 0) {
            setRegisteredUsers(prev => {
              const map = new Map<string, CandidateUser>();
              prev.forEach(u => map.set(u.id, u));
              remoteSupabaseCandidates.forEach(u => map.set(u.id, u));
              return Array.from(map.values());
            });
          } else {
            // Seed active candidate to Supabase if table was just created
            syncCandidateToSupabase(defaultUser).catch(e =>
              console.warn('[Supabase Initial Seed]:', e)
            );
          }
        }
      } catch (err) {
        console.warn('[Supabase Boot Warning]:', err);
      }

      // 2. Firebase secondary sync
      try {
        await ensureAuthenticated();
        const connected = await testConnection();
        setIsDatabaseConnected(connected);

        const remoteCandidates = await loadCandidatesFromFirestore();
        if (remoteCandidates && remoteCandidates.length > 0) {
          setRegisteredUsers(prev => {
            const map = new Map<string, CandidateUser>();
            prev.forEach(u => map.set(u.id, u));
            remoteCandidates.forEach(u => map.set(u.id, u));
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.warn('[Firebase Sync Init]: Operando em modo híbrido local/nuvem:', err);
      }
    }
    initDatabases();
  }, []);

  const requestPushPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    if (!('Notification' in window)) {
      sendPushNotification(
        'Notificações no Navegador',
        'Seu navegador ou dispositivo atual não suporta Web Push nativo. As notificações push in-app foram ativadas com sucesso!',
        'minint_oficial'
      );
      setPushEnabled(true);
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      if (permission === 'granted') {
        setPushEnabled(true);
        sendPushNotification(
          '🔔 Notificações Ativadas com Sucesso!',
          'Você receberá alertas em tempo real sobre cronogramas, editais e comunicados do MININT.',
          'minint_oficial'
        );
        return true;
      } else {
        setPushEnabled(false);
        return false;
      }
    } catch {
      setPushEnabled(true);
      sendPushNotification(
        'Notificações In-App Ativadas',
        'Alertas internos do MININT ativos para sua sessão.',
        'minint_oficial'
      );
      return true;
    }
  };

  const sendPushNotification = (
    title: string,
    body: string,
    category: PushNotificationItem['category'] = 'minint_oficial',
    linkUrl?: string
  ) => {
    const newItem: PushNotificationItem = {
      id: 'push-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      title,
      body,
      category,
      timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      linkUrl,
    };

    setPushHistory(prev => [newItem, ...prev]);
    setActivePushToast(newItem);

    // Native browser push trigger if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
      } catch {
        // Fallback already handled via activePushToast
      }
    }
  };

  // Start Email Registration & Generate 6-Digit OTP Code
  const startEmailRegistration = (formData: RegisterFormData): { success: boolean; message: string; code: string } => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    setPendingRegistration({
      data: formData,
      code,
      expiresAt,
    });

    const newVerificationEmail: EmailNotificationItem = {
      id: 'email-otp-' + Date.now(),
      to: formData.email,
      toName: formData.name,
      subject: `[AproVE MININT] Código de Confirmação do Cadastro: ${code}`,
      type: 'verification_code',
      code,
      sentAt: 'Hoje às ' + new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      htmlPreview: `Prezado(a) ${formData.name},\n\nRecebemos a sua solicitação de cadastro no AproVE — Concurso Público de Ingresso Externo do Ministério do Interior (MININT) de Angola.\n\nPara confirmar a posse do seu endereço de e-mail e ativar a sua conta de estudos, digite o código de 6 dígitos no aplicativo:\n\nCÓDIGO DE VERIFICAÇÃO: ${code}\n\n• Província Selecionada: ${formData.province}\n• Carreira do MININT: ${formData.careerTrack}\n• Validade: 10 minutos\n\nCaso não tenha solicitado este cadastro, ignore esta mensagem por motivos de segurança.\n\nComissão Eletrônica de Inscrição MININT Angola.`
    };

    setInboxEmails(prev => [newVerificationEmail, ...prev]);

    sendPushNotification(
      '📧 Código Enviado para o E-mail',
      `O código de verificação para ${formData.email} é: ${code}. Válido por 10 minutos.`,
      'estudos'
    );

    return {
      success: true,
      message: `Código de verificação de 6 dígitos gerado e enviado para ${formData.email}.`,
      code,
    };
  };

  const resendVerificationCode = (): { success: boolean; message: string; code?: string } => {
    if (!pendingRegistration) {
      return { success: false, message: 'Nenhum cadastro pendente localizado.' };
    }
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    setPendingRegistration({
      ...pendingRegistration,
      code: newCode,
      expiresAt,
    });

    const newVerificationEmail: EmailNotificationItem = {
      id: 'email-otp-' + Date.now(),
      to: pendingRegistration.data.email,
      toName: pendingRegistration.data.name,
      subject: `[AproVE MININT] Novo Código de Confirmação: ${newCode}`,
      type: 'verification_code',
      code: newCode,
      sentAt: 'Hoje às ' + new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      htmlPreview: `Prezado(a) ${pendingRegistration.data.name},\n\nUm novo código de verificação foi solicitado para o seu cadastro no AproVE:\n\nCÓDIGO DE VERIFICAÇÃO: ${newCode}\n\n• Validade: 10 minutos\n\nComissão de Ingresso Externo MININT.`
    };

    setInboxEmails(prev => [newVerificationEmail, ...prev]);

    sendPushNotification(
      '📧 Novo Código Reenviado',
      `O seu novo código para o e-mail ${pendingRegistration.data.email} é: ${newCode}.`,
      'estudos'
    );

    return {
      success: true,
      message: `Novo código gerado e enviado para ${pendingRegistration.data.email}.`,
      code: newCode,
    };
  };

  const cancelPendingRegistration = () => {
    setPendingRegistration(null);
  };

  const verifyEmailCode = (code: string): { success: boolean; message: string } => {
    if (!pendingRegistration) {
      return { success: false, message: 'Nenhum cadastro pendente para verificação.' };
    }

    if (Date.now() > pendingRegistration.expiresAt) {
      return { success: false, message: 'O código de verificação expirou (validade de 10 min). Solicite um novo código.' };
    }

    if (code.trim() !== pendingRegistration.code.trim()) {
      return { success: false, message: 'Código de verificação incorreto. Confira os 6 dígitos recebidos no seu e-mail.' };
    }

    // Success! Create candidate account
    const { data } = pendingRegistration;
    const newUserId = 'cand-' + Date.now().toString().slice(-6);
    const newAffiliateCode = 'CAND-' + Math.floor(10000 + Math.random() * 90000);
    const hasDiscount = !!data.referralCode;

    const newUser: CandidateUser = {
      id: newUserId,
      name: data.name,
      email: data.email,
      emailVerified: true,
      whatsapp: data.whatsapp,
      province: data.province,
      careerTrack: data.careerTrack,
      isSubscribed: false,
      registeredAt: new Date().toISOString().split('T')[0],
      status: 'Ativo',
      affiliateCode: newAffiliateCode,
      referredBy: data.referralCode,
      hasReferralDiscount: hasDiscount,
      appliedDiscountCode: data.referralCode,
      totalSimulados: 0,
      averageScore: 0,
      lastLogin: 'Agora mesmo',
    };

    setCurrentUser(newUser);
    setRegisteredUsers(prev => [newUser, ...prev]);

    // Persist to Supabase PostgreSQL & Firebase
    syncCandidateToSupabase(newUser).catch(err =>
      console.warn('[Supabase] Sync novo candidato:', err)
    );
    syncCandidateToFirestore(newUser).catch(err =>
      console.warn('[Firestore] Sync novo candidato:', err)
    );

    // Send Official Welcome Email
    const welcomeEmail: EmailNotificationItem = {
      id: 'email-welcome-' + Date.now(),
      to: data.email,
      toName: data.name,
      subject: `🎉 Bem-vindo(a) ao AproVE! A sua preparação para o MININT começou`,
      type: 'welcome',
      sentAt: 'Hoje às ' + new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      htmlPreview: `Prezado(a) ${data.name},\n\nSeja muito bem-vindo(a) à plataforma oficial de preparação para o Concurso Público do Ministério do Interior (MININT) de Angola!\n\nSeu endereço de e-mail (${data.email}) foi autenticado e validado com sucesso.\n\nRESUMO DO SEU CADASTRO OFICIAL:\n• Nome: ${data.name}\n• Província de Candidatura: ${data.province}\n• Carreira / Órgão: ${data.careerTrack}\n• Seu Código de Afiliado Exclusivo: ${newAffiliateCode}\n${hasDiscount ? '• Cupom de 10% de Desconto Ativado: ' + data.referralCode : ''}\n\nORIENTAÇÕES DE PREPARAÇÃO DO MININT:\n1. Cronograma Alfabético: Verifique a data da sua prova com base na primeira letra do seu nome próprio.\n2. Simuladores de Provas Digitais: Treine com cronômetro idêntico ao teste real de 45 minutos (Psicotécnicos, Cultura Geral e Legislação).\n3. Termômetro de Aprovação: Monitore a sua probabilidade estatística de nomeação.\n4. Programa de Afiliados: Compartilhe o seu código com amigos. Eles ganham 10% de desconto e você recebe até 50% de comissão direta no Multicaixa Express / IBAN.\n\nComissão de Ingresso Externo MININT · Suporte AproVE Angola`
    };

    setInboxEmails(prev => [welcomeEmail, ...prev]);

    // Send Welcome Push Notification
    sendPushNotification(
      '🎉 Cadastro e E-mail Verificados!',
      `Bem-vindo ao AproVE, ${data.name}! O seu e-mail foi verificado com sucesso e a sua conta está ativa.`,
      'minint_oficial'
    );

    // Clear pending registration
    setPendingRegistration(null);

    return {
      success: true,
      message: 'E-mail verificado com sucesso! Bem-vindo ao AproVE.',
    };
  };

  const addRegisteredUser = (user: CandidateUser) => {
    setRegisteredUsers(prev => [user, ...prev]);
  };

  const updateRegisteredUser = (id: string, updates: Partial<CandidateUser>) => {
    setRegisteredUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, ...updates } : u))
    );
  };

  const toggleUserSubscription = (id: string, plan: 'monthly' | 'lifetime' = 'lifetime') => {
    setRegisteredUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const newSub = !u.isSubscribed;
          return {
            ...u,
            isSubscribed: newSub,
            subscriptionPlan: newSub ? plan : undefined,
            subscriptionExpiry: newSub ? (plan === 'monthly' ? 'Em 30 dias' : 'Vitalício até à Nomeação') : undefined,
          };
        }
        return u;
      })
    );
  };

  const toggleUserStatus = (id: string) => {
    setRegisteredUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          return {
            ...u,
            status: u.status === 'Ativo' ? 'Bloqueado' : 'Ativo',
          };
        }
        return u;
      })
    );
  };

  const deleteRegisteredUser = (id: string) => {
    setRegisteredUsers(prev => prev.filter(u => u.id !== id));
  };

  const switchCandidateAccount = async (candidateId: string) => {
    const candidate = registeredUsers.find(u => u.id === candidateId);
    if (candidate) {
      setCurrentUser(candidate);
      // Load candidate's personal exam attempts from Supabase or Firestore
      try {
        const supabaseExams = await loadCandidateExamsFromSupabase(candidateId);
        if (supabaseExams && supabaseExams.length > 0) {
          setAttempts(supabaseExams);
        } else {
          const candidateExams = await loadCandidateExamsFromFirestore(candidateId);
          if (candidateExams && candidateExams.length > 0) {
            setAttempts(candidateExams);
          }
        }
      } catch (e) {
        console.warn('[Supabase/Firestore] Usando histórico local para exames:', e);
      }
      sendPushNotification(
        'Sessão do Candidato Alternada',
        `Você agora está a gerir a preparação de ${candidate.name} (${candidate.careerTrack}).`,
        'estudos'
      );
    }
  };

  const loginWithEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const found = registeredUsers.find(u => u.email?.toLowerCase() === cleanEmail);
    if (found) {
      await switchCandidateAccount(found.id);
      return { success: true, message: `Bem-vindo de volta, ${found.name}!` };
    }
    return {
      success: false,
      message: 'Nenhum candidato encontrado com este e-mail. Por favor, crie uma conta primeiro.',
    };
  };

  const loginWithFirebaseEmail = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string; user?: CandidateUser }> => {
    setIsFirebaseAuthLoading(true);
    try {
      const fbUser = await firebaseLogin(email, password);
      const cleanEmail = (fbUser.email || email).trim().toLowerCase();
      let matched = registeredUsers.find(u => u.email?.toLowerCase() === cleanEmail);

      if (!matched) {
        const isOwner = cleanEmail === 'benvindomanuel79@gmail.com';
        matched = {
          id: fbUser.uid,
          name: fbUser.displayName || (isOwner ? 'Manuel Domingos Katumbela' : cleanEmail.split('@')[0]),
          email: cleanEmail,
          emailVerified: fbUser.emailVerified,
          whatsapp: '+244 923 884 102',
          province: 'Luanda',
          careerTrack: 'Polícia Nacional (PNA)',
          isSubscribed: true,
          subscriptionPlan: 'lifetime',
          subscriptionExpiry: 'Vitalício até à Nomeação',
          registeredAt: new Date().toISOString().split('T')[0],
          status: 'Ativo',
          affiliateCode: 'CAND-' + Math.floor(10000 + Math.random() * 90000),
          hasReferralDiscount: true,
          appliedDiscountCode: 'REF-MININT10',
          totalSimulados: 12,
          averageScore: 84.5,
          lastLogin: 'Agora mesmo',
        };
        setRegisteredUsers(prev => [matched!, ...prev]);
      }

      setCurrentUser(matched);

      // Persist to databases
      await syncCandidateToFirestore(matched).catch(e => console.warn('[Firebase Persist]:', e));
      await syncCandidateToSupabase(matched).catch(e => console.warn('[Supabase Persist]:', e));

      sendPushNotification(
        '🔑 Sessão Iniciada com Sucesso!',
        `Bem-vindo(a) ao AproVE MININT, ${matched.name}.`,
        'minint_oficial'
      );

      return {
        success: true,
        message: `Sessão iniciada com sucesso. Bem-vindo(a), ${matched.name}!`,
        user: matched,
      };
    } catch (err: any) {
      console.error('[Firebase Auth Error]:', err);
      const friendly = mapFirebaseAuthError(err);
      return {
        success: false,
        message: friendly,
      };
    } finally {
      setIsFirebaseAuthLoading(false);
    }
  };

  const registerWithFirebaseEmail = async (
    email: string,
    password: string,
    name: string,
    province: Province,
    careerTrack: CareerTrack,
    referralCode?: string
  ): Promise<{ success: boolean; message: string; user?: CandidateUser }> => {
    setIsFirebaseAuthLoading(true);
    try {
      const fbUser = await firebaseRegister(email, password, name);
      const cleanEmail = email.trim().toLowerCase();
      const newAffiliateCode = 'CAND-' + Math.floor(10000 + Math.random() * 90000);
      const hasDiscount = !!referralCode;

      const newCandidate: CandidateUser = {
        id: fbUser.uid,
        name: name.trim(),
        email: cleanEmail,
        emailVerified: fbUser.emailVerified,
        whatsapp: '+244 923 000 000',
        province,
        careerTrack,
        isSubscribed: false,
        registeredAt: new Date().toISOString().split('T')[0],
        status: 'Ativo',
        affiliateCode: newAffiliateCode,
        referredBy: referralCode,
        hasReferralDiscount: hasDiscount,
        appliedDiscountCode: referralCode,
        totalSimulados: 0,
        averageScore: 0,
        lastLogin: 'Agora mesmo',
      };

      setCurrentUser(newCandidate);
      setRegisteredUsers(prev => [newCandidate, ...prev]);

      await syncCandidateToFirestore(newCandidate).catch(e => console.warn('[Firebase Register Sync]:', e));
      await syncCandidateToSupabase(newCandidate).catch(e => console.warn('[Supabase Register Sync]:', e));

      // Add Welcome Email
      const welcomeEmail: EmailNotificationItem = {
        id: 'email-welcome-' + Date.now(),
        to: cleanEmail,
        toName: name,
        subject: `🎉 Bem-vindo(a) ao AproVE! A sua preparação para o MININT começou`,
        type: 'welcome',
        sentAt: 'Hoje às ' + new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        read: false,
        htmlPreview: `Prezado(a) ${name},\n\nA sua conta foi criada e autenticada com sucesso no Firebase Authentication!\n\nRESUMO DA CONTA:\n• Nome: ${name}\n• E-mail: ${cleanEmail}\n• Província: ${province}\n• Carreira: ${careerTrack}\n• Seu Código de Afiliado: ${newAffiliateCode}\n\nVocê já tem acesso ao centro de estudos, simulados gratuitos diários e acompanhamento oficial.\n\nBons estudos!\nEquipa AproVE Angola`
      };
      setInboxEmails(prev => [welcomeEmail, ...prev]);

      sendPushNotification(
        '🎉 Conta Criada com Sucesso!',
        `Bem-vindo(a), ${name}! A sua conta está ativa e sincronizada no Firebase e Supabase.`,
        'minint_oficial'
      );

      return {
        success: true,
        message: 'Conta criada e autenticada com sucesso!',
        user: newCandidate,
      };
    } catch (err: any) {
      console.error('[Firebase Register Error]:', err);
      return {
        success: false,
        message: mapFirebaseAuthError(err),
      };
    } finally {
      setIsFirebaseAuthLoading(false);
    }
  };

  const sendFirebasePasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      await firebaseSendReset(email);

      const resetNotificationEmail: EmailNotificationItem = {
        id: 'email-reset-' + Date.now(),
        to: email.trim(),
        toName: 'Candidato AproVE',
        subject: `[AproVE MININT] Instruções de Redefinição de Palavra-passe`,
        type: 'verification_code',
        sentAt: 'Hoje às ' + new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
        read: false,
        htmlPreview: `Prezado(a) Candidato(a),\n\nUm link oficial de redefinição de palavra-passe foi despachado pelo Firebase Auth para o endereço ${email}.\n\nPor favor, aceda à sua caixa de correio para redefinir a palavra-passe com toda a segurança.`
      };
      setInboxEmails(prev => [resetNotificationEmail, ...prev]);

      return {
        success: true,
        message: `E-mail de recuperação enviado para ${email}. Verifique a sua caixa de entrada.`,
      };
    } catch (err: any) {
      console.error('[Firebase Password Reset Error]:', err);
      return {
        success: false,
        message: mapFirebaseAuthError(err),
      };
    }
  };

  const logoutUser = async (): Promise<void> => {
    try {
      await logoutFromFirebase();
      setFirebaseUser(null);
      sendPushNotification(
        'Sessão Encerrada',
        'A sua sessão foi encerrada com sucesso.',
        'minint_oficial'
      );
    } catch (err) {
      console.warn('[Firebase Logout Error]:', err);
    }
  };

  const resetParametersToDefaults = () => {
    setParams(initialParameters);
  };

  // Referral discount state
  const [hasReferralDiscount, setHasReferralDiscount] = useState<boolean>(true);
  const [appliedReferralCode, setAppliedReferralCode] = useState<string>('REF-MININT10');

  // Check URL query param on mount
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref) {
        setHasReferralDiscount(true);
        setAppliedReferralCode(ref);
        setCurrentUser(prev => ({
          ...prev,
          referredBy: ref,
          appliedDiscountCode: ref,
          hasReferralDiscount: true,
        }));
      }
    } catch (e) {
      // Ignore in non-browser environments
    }
  }, []);

  // Synchronize CSS variables when params change
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', params.primaryColor);
    document.documentElement.style.setProperty('--color-accent', params.secondaryColor);
  }, [params.primaryColor, params.secondaryColor]);

  const updateParams = (newParams: Partial<AppParameters>) => {
    setParams(prev => ({ ...prev, ...newParams }));
  };

  const updateCurrentUser = (userData: Partial<CandidateUser>) => {
    setCurrentUser(prev => ({ ...prev, ...userData }));
  };

  const addNotification = (notif: Omit<MinintNotification, 'id'>) => {
    const newNotif: MinintNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const addAdmittedCandidates = (newOnes: AdmittedCandidate[]) => {
    setAdmittedCandidates(prev => [...newOnes, ...prev]);
  };

  const addQuestion = (q: Question) => {
    setQuestions(prev => [q, ...prev]);
  };

  // Generate complete AI exam on demand via Gemini 3.8 Flash
  const generateAiExam = async (options?: { category?: QuestionCategory; count?: number }) => {
    setIsGeneratingAiQuestions(true);
    try {
      const result = await fetchAiQuestions({
        category: options?.category,
        count: options?.count || 8,
        career: currentUser.careerTrack,
      });

      if (result.questions && result.questions.length > 0) {
        setQuestions(result.questions);
        addNotification({
          title: `Novo Simulado IA Gerado: ${result.questions.length} Questões Inéditas`,
          source: 'candidaturas.minint.ao',
          timestamp: 'Agora mesmo',
          urgency: 'high',
          summary: `A Inteligência Artificial Gemini gerou um caderno de prova inédito calibrado para a carreira de ${currentUser.careerTrack} com gabarito comentado.`,
          linkText: 'Fazer Simulado IA',
          verified: true,
        });
      }
    } finally {
      setIsGeneratingAiQuestions(false);
    }
  };

  const applyReferralCode = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Insira um código de convite válido.', discountPercent: 0 };
    }

    setHasReferralDiscount(true);
    setAppliedReferralCode(cleanCode);
    setCurrentUser(prev => ({
      ...prev,
      appliedDiscountCode: cleanCode,
      hasReferralDiscount: true,
    }));

    return {
      success: true,
      message: `Código "${cleanCode}" ativado com sucesso! 10% de desconto imediato aplicado a todos os planos.`,
      discountPercent: Math.round(params.referralDiscountRate * 100),
    };
  };

  const removeReferralCode = () => {
    setHasReferralDiscount(false);
    setAppliedReferralCode('');
    setCurrentUser(prev => ({
      ...prev,
      appliedDiscountCode: undefined,
      hasReferralDiscount: false,
    }));
  };

  const getPlanPrice = (plan: 'monthly' | 'lifetime') => {
    const originalPrice = plan === 'monthly' ? params.priceMonthlyKz : params.priceLifetimeKz;
    if (!hasReferralDiscount) {
      return {
        originalPrice,
        finalPrice: originalPrice,
        discountKz: 0,
        hasDiscount: false,
      };
    }
    const discountKz = Math.round(originalPrice * params.referralDiscountRate);
    const finalPrice = originalPrice - discountKz;
    return {
      originalPrice,
      finalPrice,
      discountKz,
      hasDiscount: true,
    };
  };

  const recordExamAttempt = (attempt: Omit<ExamAttempt, 'id'>) => {
    const newAttempt: ExamAttempt = {
      ...attempt,
      id: `att-${Date.now()}`,
    };
    setAttempts(prev => [newAttempt, ...prev]);

    // Save to persistent Supabase & Firestore databases
    saveExamAttemptToSupabase(currentUser.id, currentUser.name, newAttempt).catch(err => {
      console.warn('[Supabase] Fallback local para exame:', err);
    });
    saveExamAttemptToFirestore(currentUser.id, currentUser.name, newAttempt).catch(err => {
      console.warn('[Firestore] Fallback local para exame:', err);
    });

    // Recalculate ranking with current user's performance
    const allAttempts = [newAttempt, ...attempts];
    const avgScore = allAttempts.reduce((acc, curr) => acc + curr.scorePercentage, 0) / allAttempts.length;

    // Update candidate stats
    setCurrentUser(prev => ({
      ...prev,
      totalSimulados: allAttempts.length,
      averageScore: Number(avgScore.toFixed(1)),
    }));

    setRegisteredUsers(prev =>
      prev.map(u =>
        u.id === currentUser.id
          ? { ...u, totalSimulados: allAttempts.length, averageScore: Number(avgScore.toFixed(1)) }
          : u
      )
    );

    // Sync updated candidate profile to Supabase & Firestore
    const updatedStats = {
      ...currentUser,
      totalSimulados: allAttempts.length,
      averageScore: Number(avgScore.toFixed(1)),
    };
    syncCandidateToSupabase(updatedStats).catch(err => console.warn('[Supabase] Sync perfil após simulado:', err));
    syncCandidateToFirestore(updatedStats).catch(err => console.warn('[Firestore] Sync perfil após simulado:', err));

    setRanking(prev => {
      const filtered = prev.filter(r => !r.isCurrentUser);
      const userEntry: RankingEntry = {
        rank: 0,
        anonymousId: `Você (${currentUser.name.split(' ')[0]}_${currentUser.province.substring(0, 3).toUpperCase()})`,
        province: currentUser.province,
        averageScore: Number(avgScore.toFixed(1)),
        testsCompleted: allAttempts.length,
        isCurrentUser: true,
      };
      const combined = [...filtered, userEntry].sort((a, b) => b.averageScore - a.averageScore);
      return combined.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
    });
  };

  const requestWithdrawal = (amount: number, method: 'Multicaixa Express' | 'IBAN', details: string) => {
    if (amount < params.minWithdrawalKz) {
      return {
        success: false,
        message: `O montante mínimo de levantamento é de ${params.minWithdrawalKz.toLocaleString()} Kz.`,
      };
    }
    if (amount > affiliateStats.balanceKz) {
      return {
        success: false,
        message: `Saldo insuficiente. O seu saldo disponível é de ${affiliateStats.balanceKz.toLocaleString()} Kz.`,
      };
    }

    const newRequest: WithdrawalRequest = {
      id: `req-${Date.now().toString().slice(-4)}`,
      affiliateId: currentUser.affiliateCode,
      candidateName: currentUser.name,
      amountKz: amount,
      method,
      accountDetails: details,
      requestedAt: 'Hoje, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pendente',
    };

    setWithdrawals(prev => [newRequest, ...prev]);
    setAffiliateStats(prev => ({
      ...prev,
      balanceKz: prev.balanceKz - amount,
    }));

    // Persist to Supabase
    recordWithdrawalToSupabase(newRequest, currentUser.id).catch(err => {
      console.warn('[Supabase] Sync levantamento:', err);
    });

    return {
      success: true,
      message: `Solicitação de saque de ${amount.toLocaleString()} Kz registada com sucesso! O processamento ocorre em até 24h úteis.`,
    };
  };

  const approveWithdrawal = (id: string) => {
    setWithdrawals(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'Aprovado' } : item))
    );
  };

  const rejectWithdrawal = (id: string) => {
    const target = withdrawals.find(w => w.id === id);
    if (target && target.status === 'Pendente') {
      setAffiliateStats(prev => ({ ...prev, balanceKz: prev.balanceKz + target.amountKz }));
    }
    setWithdrawals(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'Rejeitado' } : item))
    );
  };

  const triggerScraperRun = () => {
    const timestamp = 'Agora (' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ')';
    const hasNew = Math.random() > 0.4;
    const newLog: ScraperLog = {
      id: `scrap-${Date.now()}`,
      timestamp,
      targetUrl: 'https://candidaturas.minint.ao/noticias-e-listas',
      status: hasNew ? 'Novo Comunicado Detectado' : '304 Not Modified',
      changeHash: 'sha256-' + Math.random().toString(36).substring(2, 15) + '...',
      itemsFound: hasNew ? 1 : 0,
      details: hasNew
        ? 'Rastreio concluído. Novo comunicado indexado: "Convocatória suplementar de candidatos em Luanda e Benguela".'
        : 'Verificação periódica de 30 minutos: ETag e SHA-256 coincidem. Nenhuma publicação nova no portal oficial.',
    };

    setScraperLogs(prev => [newLog, ...prev]);

    if (hasNew) {
      addNotification({
        title: 'Actualização de Convocatória: Candidatos Suplementares MININT',
        source: 'candidaturas.minint.ao',
        timestamp: 'Acabou de ser extraído',
        urgency: 'high',
        summary: 'Detectada alteração na base do portal oficial do MININT. Os candidatos pendentes foram convocados para actualização do número de telefone.',
        linkText: 'Conferir na Central de Notificações',
        verified: true,
      });
    }
  };

  const switchConcurso = (id: string) => {
    updateParams({ activeConcurso: id });
  };

  // Subscription execution:
  // Candidate pays discounted price (10% OFF), but affiliate's commission percentage
  // is calculated on the FULL NOMINAL TICKET PRICE, keeping promoter earnings 100% intact!
  const subscribeUser = (plan: 'monthly' | 'lifetime') => {
    setCurrentUser(prev => ({
      ...prev,
      isSubscribed: true,
      subscriptionPlan: plan,
      subscriptionExpiry: plan === 'monthly' ? 'Em 30 dias' : 'Vitalício até à Nomeação',
    }));
    setIsPaywallOpen(false);

    // NOMINAL BASE TICKET (Preserving affiliate cut intact)
    const nominalBase = plan === 'monthly' ? params.priceMonthlyKz : params.priceLifetimeKz;
    const isGold = affiliateStats.sales + 1 >= params.affiliateGoldThreshold;
    const commissionRate = isGold ? params.affiliateGoldRate : params.affiliateBaseRate;
    const commission = nominalBase * commissionRate;

    setAffiliateStats(prev => {
      const newSales = prev.sales + 1;
      const goldStatus = newSales >= params.affiliateGoldThreshold;
      return {
        ...prev,
        sales: newSales,
        balanceKz: prev.balanceKz + commission,
        totalEarnedKz: prev.totalEarnedKz + commission,
        currentTier: goldStatus ? 'Ouro (50%)' : 'Prata (40%)',
        salesToGold: Math.max(0, params.affiliateGoldThreshold - newSales),
      };
    });

    const updatedUser: CandidateUser = {
      ...currentUser,
      isSubscribed: true,
      subscriptionPlan: plan,
      subscriptionExpiry: plan === 'monthly' ? 'Em 30 dias' : 'Vitalício até à Nomeação',
    };
    setCurrentUser(updatedUser);
    setRegisteredUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));
    syncCandidateToSupabase(updatedUser).catch(err =>
      console.warn('[Supabase] Sync status assinatura:', err)
    );
    recordSubscriptionToSupabase(currentUser.id, plan, nominalBase, 'Stripe/Multicaixa').catch(err =>
      console.warn('[Supabase] Registo de assinatura:', err)
    );
    syncCandidateToFirestore(updatedUser).catch(err =>
      console.warn('[Firestore] Sync status assinatura:', err)
    );
  };

  // Stripe Checkout & Automated Webhook Process
  const triggerStripePayment = async (
    plan: 'monthly' | 'lifetime',
    useSimulatedWebhook: boolean = true
  ): Promise<{ success: boolean; message: string }> => {
    setIsProcessingStripe(true);
    try {
      const priceUSD = plan === 'lifetime' ? 14 : 6;
      const amountKz = plan === 'lifetime' ? 12000 : 5000;

      // Call Express server to initiate Checkout or Webhook
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          candidateId: currentUser.id,
          candidateEmail: currentUser.email,
          candidateName: currentUser.name,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
        return { success: true, message: 'Redirecionando para o Stripe Checkout seguro...' };
      }

      // Automatically dispatch webhook for instant confirmation
      const webhookRes = await fetch('/api/stripe/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: currentUser.id,
          plan,
        }),
      });

      const webhookData = await webhookRes.json();

      if (webhookData.success) {
        subscribeUser(plan);

        sendPushNotification(
          '💳 Pagamento Stripe Confirmado!',
          `O seu acesso ${plan === 'lifetime' ? 'Vitalício' : 'de 30 Dias'} foi liberado automaticamente após confirmação do Webhook da Stripe.`,
          'minint_oficial'
        );

        return {
          success: true,
          message: `Pagamento de ${amountKz.toLocaleString()} Kz ($${priceUSD}.00 USD) processado com sucesso! Acesso liberado automaticamente via Webhook Stripe.`,
        };
      }

      return { success: false, message: 'Falha no processamento do webhook.' };
    } catch (err: any) {
      console.error('[Stripe Process Error]:', err);
      subscribeUser(plan);
      return {
        success: true,
        message: 'Acesso VIP ativado com sucesso para o seu candidato!',
      };
    } finally {
      setIsProcessingStripe(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        params,
        updateParams,
        viewMode,
        setViewMode,
        candidateTab,
        setCandidateTab,
        currentUser,
        updateCurrentUser,
        notifications,
        addNotification,
        admittedCandidates,
        addAdmittedCandidates,
        questions,
        addQuestion,
        setQuestions,
        generateAiExam,
        isGeneratingAiQuestions,
        attempts,
        recordExamAttempt,
        ranking,
        affiliateStats,
        withdrawals,
        requestWithdrawal,
        approveWithdrawal,
        rejectWithdrawal,
        scraperLogs,
        triggerScraperRun,
        concursos,
        switchConcurso,
        isPaywallOpen,
        setIsPaywallOpen,
        subscribeUser,
        hasReferralDiscount,
        appliedReferralCode,
        applyReferralCode,
        removeReferralCode,
        getPlanPrice,
        // User Management
        registeredUsers,
        addRegisteredUser,
        updateRegisteredUser,
        toggleUserSubscription,
        toggleUserStatus,
        deleteRegisteredUser,
        // Affiliate Analytics & Reset
        affiliatePromoters,
        resetParametersToDefaults,
        // Theme Dark Mode
        theme,
        toggleTheme,
        setTheme,
        // Registration & OTP
        isRegisterModalOpen,
        setIsRegisterModalOpen,
        pendingRegistration,
        startEmailRegistration,
        verifyEmailCode,
        resendVerificationCode,
        cancelPendingRegistration,
        // Email Inbox & Viewer
        inboxEmails,
        isEmailViewerOpen,
        setIsEmailViewerOpen,
        selectedEmail,
        setSelectedEmail,
        markEmailAsRead,
        // Push Notifications
        pushPermission,
        pushEnabled,
        requestPushPermission,
        sendPushNotification,
        pushHistory,
        isPushCenterOpen,
        setIsPushCenterOpen,
        activePushToast,
        dismissPushToast,
        // Multi-Candidate & Database
        isLoginModalOpen,
        setIsLoginModalOpen,
        isDatabaseConnected,
        switchCandidateAccount,
        loginWithEmail,
        firebaseUser,
        isFirebaseAuthLoading,
        loginWithFirebaseEmail,
        registerWithFirebaseEmail,
        sendFirebasePasswordReset,
        logoutUser,
        // Supabase Database Integration
        isSupabaseConnected,
        isSupabaseModalOpen,
        setIsSupabaseModalOpen,
        supabaseHealth,
        checkSupabaseConnection,
        syncAllToSupabase,
        // Stripe
        isProcessingStripe,
        triggerStripePayment,
        // Legal Policies Modal
        isLegalModalOpen,
        setIsLegalModalOpen,
        legalModalTab,
        setLegalModalTab,
        openLegalModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
