# AproVE — Plataforma Especializada de Preparação para Concursos Públicos

> **Slogan:** Mais preparação. Mais confiança.  
> **Mercado:** Angola (Inicial: Concurso de Ingresso Externo do Ministério do Interior — MININT 2026).  
> **Identidade:** Plataforma independente de aprendizagem e treino digital.

---

## 1. Visão Geral do Produto

A **AproVE** é uma plataforma web unificada e progressiva (PWA) desenvolvida para transformar a forma como candidatos em todas as 18 províncias de Angola se preparam para concursos públicos e avaliações da função pública.

A aplicação combina:
1. **Website Público & Funil de Conversão:** Apresentação da proposta de valor, demonstrador ao vivo de questões, notícias e comunicados oficiais verificados, tabela de preços e programa de afiliados.
2. **Plataforma Privada do Candidato:**
   - **Simulador de Provas Digitais:** Prova de 45 minutos com 0 a 20 valores, idêntica ao modelo oficial.
   - **Centro de Estudos:** Resumos e cadernos de Legislação (Constituição da República de Angola — CRA 2010), Psicotécnicos e Conhecimentos Gerais de Angola.
   - **Meu Treinador AproVE:** Assistente pedagógico com Inteligência Artificial (Google Gemini 3.8 Flash) via backend seguro.
   - **Termómetro de Aprovação & Ranking Provincial:** Acompanhamento de probabilidade real e evolução do candidato.
   - **Guia de Aptidão Física (TAF):** Preparação física para provas da Polícia Nacional (PNA), SIC, SME, Bombeiros e Serviços Penitenciários.
   - **Programa de Afiliados (50/50):** Comissões escalonadas de 30% (Bronze), 40% (Prata) e 50% (Ouro) pagas por Multicaixa Express ou IBAN, com 10% de desconto para os indicados.
3. **Consola Administrativa:** Gestão de utilizadores, moderação de comprovativos de pagamento, aprovação de levantamentos de afiliados, simulador de scraper de editais e controlo de parâmetros de preços.
4. **Caderno Técnico & Arquitetura:** Documentação em tempo real do sistema para auditoria técnica.

---

## 2. Stack Tecnológica

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS.
- **PWA (Progressive Web App):** Web App Manifest (`/public/manifest.json`), Service Worker (`/public/sw.js`), suporte a instalação em Android e iOS Safari.
- **Backend:** Node.js, Express (`server.ts`), Vite middleware em desenvolvimento.
- **Base de Dados:** Supabase (PostgreSQL) com fallback para Google Cloud Firestore.
- **Inteligência Artificial:** Google Gemini 3.8 Flash via backend (`/api/gemini/tutor`).
- **Autenticação:** Código de verificação OTP por e-mail e persistência multi-candidato.
- **Pagamentos:** Multicaixa Express, Transferência Bancária (IBAN) e Stripe Checkout.

---

## 3. Esquema da Base de Dados (Supabase PostgreSQL)

A base de dados relacional utiliza as seguintes tabelas estruturadas:

```sql
-- 1. Candidatos Registados
CREATE TABLE IF NOT EXISTS public.candidates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT true,
  whatsapp TEXT,
  province TEXT NOT NULL,
  career_track TEXT NOT NULL,
  is_subscribed BOOLEAN DEFAULT false,
  subscription_plan TEXT,
  subscription_expiry TEXT,
  affiliate_code TEXT UNIQUE,
  referred_by TEXT,
  status TEXT DEFAULT 'Ativo',
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tentativas e Resultados dos Simulados
CREATE TABLE IF NOT EXISTS public.exam_attempts (
  id TEXT PRIMARY KEY,
  candidate_id TEXT REFERENCES public.candidates(id) ON DELETE CASCADE,
  score_percentage NUMERIC(5,2) NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  duration_seconds INTEGER NOT NULL,
  date TEXT NOT NULL,
  category_scores JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Assinaturas e Pagamentos
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id TEXT PRIMARY KEY,
  candidate_id TEXT REFERENCES public.candidates(id) ON DELETE CASCADE,
  plan TEXT NOT NULL, -- 'monthly' ou 'lifetime'
  amount_kz INTEGER NOT NULL,
  payment_method TEXT NOT NULL, -- 'Multicaixa Express', 'IBAN' ou 'Stripe'
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Pedidos de Levantamento de Afiliados
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id TEXT PRIMARY KEY,
  candidate_id TEXT REFERENCES public.candidates(id) ON DELETE CASCADE,
  amount_kz INTEGER NOT NULL,
  method TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  request_date TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Leitura pública de candidatos autorizados" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Inserção e atualização de candidato" ON public.candidates FOR ALL USING (true);
CREATE POLICY "Acesso aos exames" ON public.exam_attempts FOR ALL USING (true);
CREATE POLICY "Acesso às assinaturas" ON public.subscriptions FOR ALL USING (true);
CREATE POLICY "Acesso aos levantamentos" ON public.withdrawals FOR ALL USING (true);
```

---

## 4. Configuração de Variáveis de Ambiente

Crie um ficheiro `.env` baseado no `.env.example`:

```bash
# Servidor e Porta
PORT=3000
NODE_ENV=development

# Google Gemini API (para o Treinador AproVE)
GEMINI_API_KEY="a-sua-chave-gemini"

# Supabase (PostgreSQL)
VITE_SUPABASE_URL="https://bpdcdljtdebckyzxmoai.supabase.co"
VITE_SUPABASE_ANON_KEY="a-sua-chave-publica-anon"

# Stripe (Opcional para pagamentos internacionais com cartão)
STRIPE_SECRET_KEY="sk_test_..."
```

---

## 5. Como Executar Localmente

1. **Instalar Dependências:**
   ```bash
   npm install
   ```

2. **Iniciar Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   A aplicação ficará disponível em `http://localhost:3000`.

3. **Verificar Qualidade do Código:**
   ```bash
   npm run lint
   ```

4. **Compilar para Produção:**
   ```bash
   npm run build
   ```

5. **Iniciar em Produção:**
   ```bash
   node server.ts
   ```

---

## 6. Declaração de Independência Institucional

A **AproVE** é um serviço educacional e preparatório independente. Não possui qualquer vínculo de representação, autoridade governamental ou afiliação oficial com o Ministério do Interior (MININT), a Polícia Nacional (PNA), o Serviço de Investigação Criminal (SIC), o Serviço de Migração e Estrangeiros (SME) ou qualquer órgão do Estado angolano. Todas as informações regulamentares dependem dos editais oficiais publicados em [candidaturas.minint.ao](https://candidaturas.minint.ao) e no Diário da República de Angola.
