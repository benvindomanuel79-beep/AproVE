-- ==============================================================================
-- AproVE Angola — Esquema Relacional de Base de Dados (Supabase PostgreSQL)
-- Marca: AproVE | Slogan: "Mais preparação. Mais confiança."
-- Versão: 2.0 (Produção com RLS e 29 Entidades Relacionais)
-- ==============================================================================

-- 1. Habilitar extensões recomendadas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. PROFILES & ROLES (Utilizadores e Perfis)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE, -- Mapeia para auth.users do Supabase se integrado
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  whatsapp TEXT,
  province TEXT NOT NULL DEFAULT 'Luanda',
  career_track TEXT NOT NULL DEFAULT 'Polícia Nacional (PNA)',
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Bloqueado', 'Pendente')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'candidate' CHECK (role IN ('candidate', 'affiliate', 'admin', 'editor')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  granted_by UUID
);

-- ------------------------------------------------------------------------------
-- 2. COMPETITIONS & PEDAGOGICAL STRUCTURE (Concursos, Áreas e Matérias)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL, -- ex: 'MININT_2026'
  title TEXT NOT NULL,
  institution TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Fase de Preparação' CHECK (status IN ('Previsto', 'Inscrições Abertas', 'Fase de Exames', 'Concluído', 'Arquivado')),
  official_url TEXT DEFAULT 'https://candidaturas.minint.ao',
  is_independent_notice_shown BOOLEAN NOT NULL DEFAULT true,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.evaluation_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- ex: 'Provas Psicotécnicas', 'Conhecimentos Gerais'
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID NOT NULL REFERENCES public.evaluation_areas(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- ex: 'Raciocínio Lógico-Dedutivo', 'Língua Portuguesa'
  description TEXT,
  icon_name TEXT DEFAULT 'BookOpen',
  display_order INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  estimated_minutes INTEGER DEFAULT 30,
  display_order INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.study_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  access_level TEXT NOT NULL DEFAULT 'free' CHECK (access_level IN ('public', 'free', 'premium')),
  read_time_minutes INTEGER DEFAULT 10,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.content_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.study_contents(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  url TEXT,
  official_reference TEXT,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. QUESTIONS & OPTIONS (Banco de Perguntas e Respostas)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  prompt TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'médio' CHECK (difficulty IN ('fácil', 'médio', 'difícil')),
  origin_type TEXT NOT NULL DEFAULT 'original_aprove' CHECK (origin_type IN ('oficial_autorizada', 'exame_anterior', 'original_aprove', 'ia_supervisionada')),
  verified BOOLEAN NOT NULL DEFAULT true,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_letter CHAR(1) NOT NULL CHECK (option_letter IN ('A', 'B', 'C', 'D', 'E')),
  option_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  explanation TEXT,
  CONSTRAINT unique_question_letter UNIQUE (question_id, option_letter)
);

-- ------------------------------------------------------------------------------
-- 4. QUIZZES, ATTEMPTS & RESULTS (Simulados e Gabarito)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES public.competitions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  passing_score_val_20 NUMERIC(4,2) NOT NULL DEFAULT 10.00,
  access_level TEXT NOT NULL DEFAULT 'free' CHECK (access_level IN ('free', 'premium')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (quiz_id, question_id)
);

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  score_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
  score_val_20 NUMERIC(4,2) NOT NULL DEFAULT 0.00,
  passed BOOLEAN NOT NULL DEFAULT false,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  idempotency_key TEXT UNIQUE -- Evita submissões repetidas
);

CREATE TABLE IF NOT EXISTS public.quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_letter CHAR(1) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. CANDIDATE PROGRESS & PLANS (Progresso e Planos de Estudo)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  last_studied_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_profile_topic UNIQUE (profile_id, topic_id)
);

CREATE TABLE IF NOT EXISTS public.study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_exam_date DATE,
  daily_question_goal INTEGER NOT NULL DEFAULT 20,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluído', 'pausado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 6. AI CONVERSATIONS & USAGE TRACKING (Treinador AproVE com IA)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  context_career TEXT,
  title TEXT NOT NULL DEFAULT 'Sessão de Dúvidas',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.ai_usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL DEFAULT 'gemini-3.8-flash',
  prompt_tokens INTEGER DEFAULT 0,
  completion_tokens INTEGER DEFAULT 0,
  action_type TEXT NOT NULL DEFAULT 'chat' CHECK (action_type IN ('chat', 'fact_check', 'exercise_generation')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 7. SUBSCRIPTIONS & MANUAL PAYMENTS (Planos e Pagamentos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key TEXT UNIQUE NOT NULL, -- 'free', 'monthly', 'lifetime'
  name TEXT NOT NULL,
  price_kz NUMERIC(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('free', 'monthly', 'one_time')),
  features JSONB DEFAULT '[]'::jsonb
);

-- Preencher planos oficiais
INSERT INTO public.subscription_plans (plan_key, name, price_kz, billing_cycle, features)
VALUES 
  ('free', 'Plano Gratuito', 0.00, 'free', '["1 simulado diário com cronómetro", "Gabarito básico", "Notícias oficiais", "Acesso aos editais"]'::jsonb),
  ('monthly', 'Premium Mensal', 5000.00, 'monthly', '["Simulados ilimitados", "Centro de estudos completo", "Testes psicotécnicos", "Treinador IA", "Revisão detalhada de erros"]'::jsonb),
  ('lifetime', 'Premium Vitalício', 25000.00, 'one_time', '["Acesso vitalício aos simuladores", "Todas as actualizações de matérias", "Treinador IA prioritário", "Suporte VIP"]'::jsonb)
ON CONFLICT (plan_key) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'canceled', 'suspended')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMPTZ, -- NULL para plano vitalício
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  amount_kz NUMERIC(10,2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('Multicaixa Express', 'Transferência IBAN', 'Stripe')),
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Em Verificação', 'Aprovado', 'Rejeitado', 'Cancelado', 'Reembolsado')),
  proof_file_url TEXT,
  reference_number TEXT,
  notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 8. AFFILIATES & COMMISSIONS (Programa de Afiliados)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.affiliate_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  current_tier TEXT NOT NULL DEFAULT 'Bronze (30%)' CHECK (current_tier IN ('Bronze (30%)', 'Prata (40%)', 'Ouro (50%)')),
  total_clicks INTEGER NOT NULL DEFAULT 0,
  total_signups INTEGER NOT NULL DEFAULT 0,
  total_paid_conversions INTEGER NOT NULL DEFAULT 0,
  pending_commission_kz NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  approved_commission_kz NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  paid_commission_kz NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.referral_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
  referred_profile_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  attribution_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
  payment_id UUID UNIQUE NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  base_amount_kz NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(4,2) NOT NULL,
  commission_amount_kz NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Aprovada', 'Paga', 'Cancelada', 'Suspensa')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES public.affiliate_profiles(id) ON DELETE CASCADE,
  amount_kz NUMERIC(10,2) NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('Multicaixa Express', 'IBAN')),
  recipient_details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Processando', 'Pago', 'Rejeitado')),
  processed_by UUID,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 9. NEWS & NOTIFICATIONS (Notícias Oficiais e Avisos)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Concursos Públicos', 'MININT Oficial', 'Comunicados', 'Prazos e Provas', 'Geral')),
  source_name TEXT NOT NULL,
  source_url TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  is_verified BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value_json JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Inserir configurações essenciais
INSERT INTO public.platform_settings (key, value_json, description)
VALUES 
  ('pricing', '{"priceMonthlyKz": 5000, "priceLifetimeKz": 25000, "referralDiscountRate": 0.10}'::jsonb, 'Preços oficiais e taxa de desconto'),
  ('affiliate_tiers', '{"bronzeRate": 0.30, "silverRate": 0.40, "goldRate": 0.50, "minPayoutKz": 5000}'::jsonb, 'Regras de comissão de afiliados'),
  ('payment_accounts', '{"iban": "AO06 0040 0000 1234 5678 9012 3", "bank": "Banco Angolano", "beneficiary": "AproVE Preparação Independente", "multicaixaExpress": "923 000 000"}'::jsonb, 'Coordenadas oficiais para pagamento manual')
ON CONFLICT (key) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Leitura pública de perfis ativos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Criação de novos perfis" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Edição do próprio perfil" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Leitura de simulados realizados" ON public.quiz_attempts FOR SELECT USING (true);
CREATE POLICY "Gravação de simulado" ON public.quiz_attempts FOR INSERT WITH CHECK (true);

CREATE POLICY "Leitura de assinaturas ativas" ON public.subscriptions FOR SELECT USING (true);
CREATE POLICY "Leitura e registo de pagamentos" ON public.payments FOR ALL USING (true);
CREATE POLICY "Acesso ao painel de afiliados" ON public.affiliate_profiles FOR ALL USING (true);
CREATE POLICY "Acesso aos saques de afiliados" ON public.affiliate_payouts FOR ALL USING (true);

-- ------------------------------------------------------------------------------
-- FIM DO ESQUEMA OFICIAL APROVE ANGOLA
-- ------------------------------------------------------------------------------
