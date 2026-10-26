import { supabase, SUPABASE_URL } from '../lib/supabase';
import { CandidateUser, ExamAttempt, WithdrawalRequest } from '../types';

/**
 * Service to manage Supabase database persistence for AproVE Angola
 */

export interface SupabaseSyncResult {
  success: boolean;
  message: string;
  count?: number;
  error?: string;
}

/**
 * Sync or upsert a candidate profile to Supabase
 */
export async function syncCandidateToSupabase(candidate: CandidateUser): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      id: candidate.id,
      name: candidate.name,
      email: candidate.email,
      email_verified: candidate.emailVerified,
      whatsapp: candidate.whatsapp || null,
      province: candidate.province,
      career_track: candidate.careerTrack,
      is_subscribed: candidate.isSubscribed,
      subscription_plan: candidate.subscriptionPlan || null,
      subscription_expiry: candidate.subscriptionExpiry || null,
      registered_at: candidate.registeredAt,
      status: candidate.status || 'Ativo',
      affiliate_code: candidate.affiliateCode,
      referred_by: candidate.referredBy || null,
      total_simulados: candidate.totalSimulados || 0,
      average_score: candidate.averageScore || 0,
      last_login: candidate.lastLogin || new Date().toLocaleString('pt-PT'),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('candidates')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('[Supabase Sync Candidate] Nota:', error.message);
      return { success: false, error: error.message };
    }

    console.log(`[Supabase] Candidato ${candidate.name} sincronizado com sucesso no Supabase.`);
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase Exception]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Load all registered candidates from Supabase
 */
export async function loadCandidatesFromSupabase(): Promise<CandidateUser[]> {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.warn('[Supabase Load Candidates] Aviso:', error?.message);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      emailVerified: Boolean(row.email_verified),
      whatsapp: row.whatsapp || undefined,
      province: row.province || 'Luanda',
      careerTrack: row.career_track || 'Polícia Nacional (PNA)',
      isSubscribed: Boolean(row.is_subscribed),
      subscriptionPlan: row.subscription_plan || undefined,
      subscriptionExpiry: row.subscription_expiry || undefined,
      registeredAt: row.registered_at || new Date().toISOString().split('T')[0],
      status: row.status || 'Ativo',
      affiliateCode: row.affiliate_code,
      referredBy: row.referred_by || undefined,
      totalSimulados: Number(row.total_simulados || 0),
      averageScore: Number(row.average_score || 0),
      lastLogin: row.last_login || 'Recente',
    }));
  } catch (err: any) {
    console.warn('[Supabase Exception ao carregar candidatos]:', err.message);
    return [];
  }
}

/**
 * Save an exam attempt to Supabase
 */
export async function saveExamAttemptToSupabase(
  userId: string,
  candidateName: string,
  attempt: ExamAttempt
): Promise<{ success: boolean; error?: string }> {
  try {
    const scoreVal20 = Number(((attempt.correctAnswers / Math.max(1, attempt.totalQuestions)) * 20).toFixed(2));
    const payload = {
      id: attempt.id,
      user_id: userId,
      candidate_name: candidateName,
      date: attempt.date,
      total_questions: attempt.totalQuestions,
      correct_answers: attempt.correctAnswers,
      score_percentage: attempt.scorePercentage,
      score_val_20: scoreVal20,
      duration_seconds: attempt.durationSeconds,
      passed: attempt.scorePercentage >= 50,
      category_scores: attempt.categoryScores || {},
    };

    const { error } = await supabase
      .from('exam_attempts')
      .insert(payload);

    if (error) {
      console.warn('[Supabase Save Exam] Aviso:', error.message);
      return { success: false, error: error.message };
    }

    console.log(`[Supabase] Simulado ${attempt.id} guardado com sucesso na base de dados.`);
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase Exception ao guardar exame]:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Load exam attempts for a specific candidate
 */
export async function loadCandidateExamsFromSupabase(userId: string): Promise<ExamAttempt[]> {
  try {
    const { data, error } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !data) {
      console.warn('[Supabase Load Exams] Aviso:', error?.message);
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      date: row.date,
      totalQuestions: Number(row.total_questions),
      correctAnswers: Number(row.correct_answers),
      scorePercentage: Number(row.score_percentage),
      durationSeconds: Number(row.duration_seconds || 2700),
      categoryScores: row.category_scores || {},
    }));
  } catch (err: any) {
    console.warn('[Supabase Exception ao carregar exames]:', err.message);
    return [];
  }
}

/**
 * Record a subscription payment to Supabase
 */
export async function recordSubscriptionToSupabase(
  candidateId: string,
  plan: 'monthly' | 'lifetime',
  amountKz: number,
  method: string = 'Stripe'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        candidate_id: candidateId,
        plan,
        amount_kz: amountKz,
        method,
        status: 'active',
      });

    if (error) {
      console.warn('[Supabase Subscription Record] Aviso:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Record an affiliate withdrawal request to Supabase
 */
export async function recordWithdrawalToSupabase(
  withdrawal: WithdrawalRequest,
  candidateUserId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('withdrawals')
      .insert({
        id: withdrawal.id || ('wd-' + Date.now()),
        candidate_id: candidateUserId || 'usr-current',
        candidate_name: withdrawal.candidateName || 'Candidato AproVE',
        amount_kz: withdrawal.amountKz,
        method: withdrawal.method,
        details: withdrawal.accountDetails,
        status: withdrawal.status || 'pending',
        requested_at: new Date().toISOString(),
      });

    if (error) {
      console.warn('[Supabase Withdrawal Record] Aviso:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Synchronize local data (registered candidates, attempts) to Supabase in bulk
 */
export async function bulkSyncLocalDataToSupabase(
  candidates: CandidateUser[],
  attempts: ExamAttempt[],
  currentUserId: string,
  currentUserName: string
): Promise<SupabaseSyncResult> {
  let candidatesCount = 0;
  let attemptsCount = 0;

  try {
    // 1. Sync candidates
    for (const cand of candidates) {
      const res = await syncCandidateToSupabase(cand);
      if (res.success) candidatesCount++;
    }

    // 2. Sync attempts
    for (const att of attempts) {
      const res = await saveExamAttemptToSupabase(currentUserId, currentUserName, att);
      if (res.success) attemptsCount++;
    }

    return {
      success: true,
      count: candidatesCount + attemptsCount,
      message: `${candidatesCount} candidatos e ${attemptsCount} simulados sincronizados com o Supabase com sucesso!`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: 'Erro durante a sincronização em lote.',
      error: err.message,
    };
  }
}
