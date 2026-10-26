import { createClient } from '@supabase/supabase-js';

// Base Supabase Project Credentials provided by user
const RAW_URL = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://bpdcdljtdebckyzxmoai.supabase.co/rest/v1/';
const RAW_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_22XKmu6ULr7S7D_q9xhl8g_V_6VzmKg';

/**
 * Standardize Supabase base URL:
 * Supabase JavaScript SDK requires the origin base URL (e.g. 'https://xyz.supabase.co'),
 * without trailing '/rest/v1/' or trailing slashes, because the client appends '/rest/v1' internally.
 */
export function sanitizeSupabaseUrl(url: string): string {
  let cleaned = (url || '').trim();
  if (!cleaned) return 'https://bpdcdljtdebckyzxmoai.supabase.co';

  // If user only provided the project reference (e.g. 'bpdcdljtdebckyzxmoai')
  if (/^[a-z0-9_-]{10,40}$/i.test(cleaned)) {
    return `https://${cleaned}.supabase.co`;
  }

  // Prepend https:// if protocol is missing
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }

  cleaned = cleaned.replace(/\/rest\/v1\/?$/i, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned || 'https://bpdcdljtdebckyzxmoai.supabase.co';
}

export const SUPABASE_URL = sanitizeSupabaseUrl(RAW_URL);
export const SUPABASE_ANON_KEY = (RAW_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGNkbGp0ZGViY2t5enhtb2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NzIwNzIsImV4cCI6MjEwODQ0ODA3Mn0.dSYAXsaq7tD0KbZafLRo_3pw6WiAFi8pPEK2_zObjms').trim();

// Create Supabase client singleton
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseHealthCheck {
  connected: boolean;
  status: 'connected' | 'offline' | 'error';
  latencyMs: number;
  url: string;
  projectRef: string;
  tablesStatus: {
    candidates: boolean | null;
    exam_attempts: boolean | null;
    subscriptions: boolean | null;
    withdrawals: boolean | null;
  };
  errorMessage?: string;
}

/**
 * Tests the live HTTP connection to Supabase REST endpoint
 */
export async function testSupabaseHealth(): Promise<SupabaseHealthCheck> {
  const startTime = Date.now();
  const projectRef = SUPABASE_URL.replace(/^https?:\/\//, '').split('.')[0] || 'bpdcdljtdebckyzxmoai';

  const result: SupabaseHealthCheck = {
    connected: false,
    status: 'offline',
    latencyMs: 0,
    url: SUPABASE_URL,
    projectRef,
    tablesStatus: {
      candidates: null,
      exam_attempts: null,
      subscriptions: null,
      withdrawals: null,
    },
  };

  try {
    // 1. Probe REST endpoint using the candidates table accessible with anon key
    const res = await fetch(`${SUPABASE_URL}/rest/v1/candidates?select=id&limit=1`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    result.latencyMs = Date.now() - startTime;

    if (res.status >= 200 && res.status < 300) {
      result.connected = true;
      result.status = 'connected';
    } else {
      result.connected = false;
      result.status = 'error';
      result.errorMessage = `HTTP ${res.status}: ${res.statusText}`;
    }

    // 2. Probe candidate table
    try {
      const { error: candErr } = await supabase.from('candidates').select('id').limit(1);
      result.tablesStatus.candidates = !candErr;
    } catch {
      result.tablesStatus.candidates = false;
    }

    // 3. Probe exam_attempts table
    try {
      const { error: examErr } = await supabase.from('exam_attempts').select('id').limit(1);
      result.tablesStatus.exam_attempts = !examErr;
    } catch {
      result.tablesStatus.exam_attempts = false;
    }

    // 4. Probe subscriptions table
    try {
      const { error: subErr } = await supabase.from('subscriptions').select('id').limit(1);
      result.tablesStatus.subscriptions = !subErr;
    } catch {
      result.tablesStatus.subscriptions = false;
    }

    // 5. Probe withdrawals table
    try {
      const { error: wdErr } = await supabase.from('withdrawals').select('id').limit(1);
      result.tablesStatus.withdrawals = !wdErr;
    } catch {
      result.tablesStatus.withdrawals = false;
    }

    return result;
  } catch (err: any) {
    result.latencyMs = Date.now() - startTime;
    result.connected = false;
    result.status = 'offline';
    result.errorMessage = err?.message || 'Falha ao contactar servidor Supabase.';
    return result;
  }
}

/**
 * Recommended PostgreSQL SQL Schema for Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- ==============================================================
-- AproVE Angola - Esquema de Tabelas para Supabase (PostgreSQL)
-- Projecto: ${SUPABASE_URL}
-- ==============================================================

-- 1. Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Candidatos / Usuários
CREATE TABLE IF NOT EXISTS public.candidates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT true,
  whatsapp TEXT,
  province TEXT NOT NULL DEFAULT 'Luanda',
  career_track TEXT NOT NULL DEFAULT 'Polícia Nacional (PNA)',
  is_subscribed BOOLEAN DEFAULT false,
  subscription_plan TEXT,
  subscription_expiry TEXT,
  registered_at DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'Ativo',
  affiliate_code TEXT UNIQUE,
  referred_by TEXT,
  total_simulados INTEGER DEFAULT 0,
  average_score NUMERIC(4, 2) DEFAULT 0,
  last_login TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Tentativas de Exame e Simulados
CREATE TABLE IF NOT EXISTS public.exam_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  candidate_name TEXT NOT NULL,
  date TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  score_percentage NUMERIC(5, 2) NOT NULL,
  score_val_20 NUMERIC(4, 2) NOT NULL,
  duration_seconds INTEGER NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  category_scores JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Assinaturas e Pagamentos
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id TEXT PRIMARY KEY DEFAULT ('sub_' || replace(uuid_generate_v4()::text, '-', '')),
  candidate_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  amount_kz NUMERIC(10, 2) NOT NULL,
  method TEXT NOT NULL DEFAULT 'Stripe',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela de Pedidos de Levantamento de Afiliados
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id TEXT PRIMARY KEY,
  candidate_id TEXT NOT NULL,
  candidate_name TEXT NOT NULL,
  amount_kz NUMERIC(10, 2) NOT NULL,
  method TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente',
  requested_at TEXT NOT NULL,
  processed_at TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Habilitar Row Level Security (RLS) com políticas de leitura/gravação pública
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso livre para a chave pública anónima (anon)
CREATE POLICY "Permitir leitura pública de candidatos" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Permitir inserção e actualização de candidatos" ON public.candidates FOR ALL USING (true);

CREATE POLICY "Permitir leitura pública de exames" ON public.exam_attempts FOR SELECT USING (true);
CREATE POLICY "Permitir inserção de exames" ON public.exam_attempts FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir inserção e leitura de assinaturas" ON public.subscriptions FOR ALL USING (true);
CREATE POLICY "Permitir pedidos de levantamento" ON public.withdrawals FOR ALL USING (true);
`;
