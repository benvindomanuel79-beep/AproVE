export type Province =
  | 'Bengo'
  | 'Benguela'
  | 'Bié'
  | 'Cabinda'
  | 'Cuando Cubango'
  | 'Cuanza Norte'
  | 'Cuanza Sul'
  | 'Cunene'
  | 'Huambo'
  | 'Huíla'
  | 'Luanda'
  | 'Lunda Norte'
  | 'Lunda Sul'
  | 'Malanje'
  | 'Moxico'
  | 'Namibe'
  | 'Uíge'
  | 'Zaire';

export type CareerTrack =
  | 'Polícia Nacional (PNA)'
  | 'Serviço de Investigação Criminal (SIC)'
  | 'Serviço de Migração e Estrangeiros (SME)'
  | 'Serviço de Protecção Civil e Bombeiros (SPCB)'
  | 'Serviço Penitenciário';

export interface AppParameters {
  appName: string;
  appSlogan: string;
  primaryColor: string;
  secondaryColor: string;
  priceMonthlyKz: number;
  priceLifetimeKz: number;
  referralDiscountRate: number; // e.g. 0.10 (10% discount for candidate)
  affiliateBaseRate: number; // e.g. 0.40
  affiliateGoldRate: number; // e.g. 0.50
  affiliateGoldThreshold: number; // e.g. 20 sales
  minWithdrawalKz: number; // e.g. 5000
  riskZeroThresholdPercent: number; // e.g. 80%
  activeConcurso: string;
}

export interface CandidateUser {
  id: string;
  name: string;
  email?: string;
  emailVerified?: boolean;
  whatsapp: string;
  province: Province;
  careerTrack: CareerTrack;
  isSubscribed: boolean;
  subscriptionPlan?: 'monthly' | 'lifetime';
  subscriptionExpiry?: string;
  registeredAt: string;
  affiliateCode: string;
  referredBy?: string;
  appliedDiscountCode?: string;
  hasReferralDiscount?: boolean;
  status: 'Ativo' | 'Bloqueado';
  lastLogin?: string;
  totalSimulados?: number;
  averageScore?: number;
}

export interface AffiliateLeaderboardEntry {
  affiliateId: string;
  name: string;
  whatsapp: string;
  province: Province;
  referralCode: string;
  clicks: number;
  signups: number;
  paidConversions: number;
  conversionRate: number; // e.g. 24.5%
  totalRevenueGeneratedKz: number;
  earnedCommissionKz: number;
  pendingPayoutKz: number;
  tier: 'Prata (40%)' | 'Ouro (50%)';
}

export interface MinintNotification {
  id: string;
  title: string;
  source: 'candidaturas.minint.ao' | 'Diário da República' | 'Gabinete de Comunicação MININT';
  timestamp: string;
  urgency: 'high' | 'normal' | 'critical';
  summary: string;
  linkText: string;
  fullContent?: string;
  verified: boolean;
}

export interface ScheduleSlot {
  letterGroup: string; // e.g. "A - C"
  letters: string[];
  examDate: string; // e.g. "2026-10-26"
  shift: 'Manhã (08:00)' | 'Tarde (13:30)';
  phase: string;
  instructions: string;
}

export interface AdmittedCandidate {
  id: string;
  fullName: string;
  biNumberMasked: string; // e.g. "004921***LA042"
  province: Province;
  careerTrack: CareerTrack;
  examCenter: string;
  examRoom: string;
  examDate: string;
  shift: string;
  status: 'Admitido à Prova Escrita' | 'Pendente de Documentação' | 'Admitido Condicional';
}

export type QuestionCategory =
  | 'Psicotécnico - Lógica'
  | 'Psicotécnico - Verbal'
  | 'Psicotécnico - Espacial'
  | 'Psicotécnico - Numérico'
  | 'Conhecimentos Gerais - Angola'
  | 'Legislação e Função Pública';

export interface Question {
  id: string;
  category: QuestionCategory;
  questionText: string;
  options: {
    id: 'A' | 'B' | 'C' | 'D';
    text: string;
  }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
}

export interface ExamAttempt {
  id: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  durationSeconds: number;
  categoryScores: Record<string, { total: number; correct: number }>;
}

export interface RankingEntry {
  rank: number;
  anonymousId: string;
  province: Province;
  averageScore: number;
  testsCompleted: number;
  isCurrentUser?: boolean;
}

export interface AffiliateStats {
  clicks: number;
  signups: number;
  sales: number;
  conversionRate: number;
  balanceKz: number;
  totalEarnedKz: number;
  currentTier: 'Prata (40%)' | 'Ouro (50%)';
  salesToGold: number;
}

export interface WithdrawalRequest {
  id: string;
  affiliateId: string;
  candidateName: string;
  amountKz: number;
  method: 'Multicaixa Express' | 'IBAN';
  accountDetails: string;
  requestedAt: string;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
}

export interface ScraperLog {
  id: string;
  timestamp: string;
  targetUrl: string;
  status: '200 OK' | '304 Not Modified' | 'Novo Comunicado Detectado';
  changeHash: string;
  itemsFound: number;
  details: string;
}

export interface ConcursoOption {
  id: string;
  name: string;
  ministry: string;
  status: 'Inscrições Abertas' | 'Fase de Exames' | 'Previsto 2026';
  totalVagas: number;
  iconName: string;
}

export interface DailyStudyProgress {
  dayLabel: string;
  dateStr: string;
  questionsResolved: number;
  targetQuestions: number;
  accuracyRate: number;
  studyMinutes: number;
  cronogramaTopic: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  whatsapp: string;
  province: Province;
  careerTrack: CareerTrack;
  password?: string;
  referralCode?: string;
}

export interface EmailNotificationItem {
  id: string;
  to: string;
  toName: string;
  subject: string;
  type: 'verification_code' | 'welcome';
  code?: string;
  sentAt: string;
  htmlPreview: string;
  read: boolean;
}

export interface PushNotificationItem {
  id: string;
  title: string;
  body: string;
  category: 'minint_oficial' | 'afiliado' | 'cronograma' | 'estudos';
  timestamp: string;
  read: boolean;
  linkUrl?: string;
}

