# Plano Mestre de Arquitetura e Execução — AproVE (Angola)

> **Marca:** AproVE  
> **Slogan:** *Mais preparação. Mais confiança.*  
> **Mercado Inicial:** Angola (Concurso MININT e expansão para concursos da Administração Pública)  
> **Posicionamento:** Plataforma independente de preparação, aprendizagem e treino para concursos (sem vínculos formais ou insígnias governamentais).

---

## 1. Análise Técnica da Arquitetura

A plataforma **AproVE** foi desenhada para operar como uma **aplicação web única, moderna e responsiva**, estruturada em camadas bem definidas e preparada para funcionar como **PWA (Progressive Web App)** instalável no telemóvel e desktop:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        APROVE - FRONTEND UNIFICADO                     │
│  (React 19 + TypeScript + Tailwind CSS 4 + Lucide Icons + PWA Engine)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  WEBSITE PÚBLICO │       │ ÁREA CANDIDATO   │       │ PAINEL ADMIN     │
│  - Hero Oficial  │       │ - Dashboard      │       │ - Métricas Reais │
│  - Concurso MININT│      │ - Centro Estudos │       │ - Utilizadores   │
│  - Como Funciona │       │ - Simulados 45m  │       │ - Conteúdos      │
│  - Funcionalidades│      │ - Psicotécnicos  │       │ - Banco Questões │
│  - Planos 0/5k/25k│      │ - Treinador IA   │       │ - Pagamentos     │
│  - Prova de Valor│       │ - Afiliados (30-50%)│    │ - Afiliados      │
│  - Notícias & FAQ│       │ - Perfil & Plano │       │ - Configurações  │
└────────┬─────────┘       └────────┬─────────┘       └────────┬─────────┘
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌─────────────────────────────────┐       ┌───────────────────────────────────┐
│     SUPABASE (POSTGRESQL)       │       │       EXPRESS BACKEND (NODE)      │
│  29 Tabelas Relacionais:        │       │  - /api/gemini/tutor              │
│  - profiles & user_roles        │       │  - /api/payments/create-reference │
│  - competitions, subjects       │       │  - /api/payments/webhook          │
│  - questions & options          │       │  - /api/health                    │
│  - quizzes, attempts & answers  │       │  - Gestão segura de segredos      │
│  - subscriptions & payments     │       └───────────────────────────────────┘
│  - affiliate_profiles & payouts │
│  - Row Level Security (RLS)     │
└─────────────────────────────────┘
```

---

## 2. Identidade Visual & Design System Oficial AproVE

- **Paleta de Cores:**
  - **Azul Profundo:** `#10233F` — Confiança, autoridade institucional serena, foco e disciplina.
  - **Verde Principal:** `#16A673` — Progresso, aprovação, sucesso, clareza e ação afirmativa.
  - **Branco:** `#FFFFFF` — Clareza, legibilidade e respiro visual.
  - **Cinza Claro:** `#F3F5F8` — Superfícies de apoio, cartões, fundos neutros.
  - **Cinza Escuro:** `#344054` — Textos secundários, bordas estruturais e contraste sem fadiga.
  - **Dourado Discreto:** `#E6B75A` — Destaques VIP, nível Ouro nos afiliados e conquistas premium.
- **Tipografia:** `Manrope` para títulos e identidade tipográfica; `Inter` / `Plus Jakarta Sans` para corpo e interface; `JetBrains Mono` tabular para cronómetros e números de classificação.
- **Logótipo:** Identidade puramente tipográfica e geométrica com destaque na terminação **VE** e símbolo minimalista de avanço e superação, sem brasões policiais ou elementos que induzam em erro.

---

## 3. Modelo de Dados — 29 Tabelas Relacionais (Supabase PostgreSQL)

A base de dados suporta de forma nativa e normalizada todas as 29 entidades especificadas no caderno técnico:

1. `profiles` (id, full_name, email, whatsapp, province, career_track, avatar_url, created_at)
2. `user_roles` (id, user_id, role: 'candidate' | 'affiliate' | 'admin' | 'moderator')
3. `competitions` (id, code, title, institution, status, official_url, last_updated)
4. `evaluation_areas` (id, competition_id, title, description, display_order)
5. `subjects` (id, area_id, title, description, icon_name)
6. `topics` (id, subject_id, title, summary, estimated_minutes)
7. `study_contents` (id, topic_id, title, body_markdown, access_level, read_time, published)
8. `content_sources` (id, content_id, source_name, url, official_reference, verified_at)
9. `questions` (id, topic_id, prompt, category, difficulty, origin_type, verified, published)
10. `question_options` (id, question_id, option_letter, option_text, is_correct, explanation)
11. `quizzes` (id, competition_id, title, duration_minutes, passing_score, access_level)
12. `quiz_questions` (quiz_id, question_id, order_index)
13. `quiz_attempts` (id, user_id, quiz_id, started_at, completed_at, score, percentage, passed)
14. `quiz_answers` (id, attempt_id, question_id, selected_option, is_correct, time_spent_sec)
15. `study_progress` (id, user_id, topic_id, completed, last_studied_at)
16. `study_plans` (id, user_id, title, target_exam_date, daily_goal_questions, status)
17. `ai_conversations` (id, user_id, context_career, title, created_at)
18. `ai_usage_records` (id, user_id, tokens_used, model_name, cost_estimated, timestamp)
19. `subscription_plans` (id, plan_key, name, price_kz, billing_cycle, features_json)
20. `subscriptions` (id, user_id, plan_id, status, started_at, expires_at, auto_renew)
21. `payments` (id, user_id, plan_id, amount_kz, method, status, proof_url, approved_by)
22. `payment_events` (id, payment_id, event_type, payload_json, created_at)
23. `affiliate_profiles` (id, user_id, referral_code, current_tier, total_clicks, total_signups)
24. `referral_attributions` (id, affiliate_id, referred_user_id, attribution_date, source_cookie)
25. `affiliate_commissions` (id, affiliate_id, payment_id, amount_kz, tier_percentage, status)
26. `affiliate_payouts` (id, affiliate_id, amount_kz, method, recipient_details, status, paid_at)
27. `news_articles` (id, title, slug, summary, content, category, source_name, source_url, status)
28. `notifications` (id, user_id, title, body, category, read, link_url, created_at)
29. `platform_settings` (key, value_json, description, updated_at, updated_by)

---

## 4. Roteiro Executivo de Implementação por Fases

### Fase 1: Fundação, Design System e Website Público (Concluída nesta Entrega)
- [x] Estrutura organizada e modular do projeto com TypeScript rigoroso.
- [x] Design System oficial com as cores `#10233F`, `#16A673`, `#E6B75A` e tipografia Manrope/Inter.
- [x] Logótipo tipográfico próprio AproVE sem insígnias governamentais.
- [x] Website público completo de alta conversão:
  - Cabeçalho responsivo com navegação rápida e botões Entrar/Criar Conta.
  - Hero com slogan *"O teu próximo passo começa com preparação."*.
  - Concurso MININT em destaque com áreas de exame e link oficial `candidaturas.minint.ao`.
  - Como Funciona em 6 etapas claras.
  - Apresentação visual das funcionalidades reais.
  - Tabela comparativa de planos: Gratuito (0 Kz), Mensal (5.000 Kz) e Vitalício (25.000 Kz).
  - Prova de valor com simulado demonstrativo interativo e explicação detalhada.
  - Notícias oficiais com fontes credíveis e verificador de fatos.
  - FAQ completo em acordeão.
  - Rodapé com aviso legal de independência, termos e contactos.
- [x] PWA instalável com manifesto, suporte a ecrã inicial e botão nativo in-app.
- [x] Esquema relacional completo Supabase (29 tabelas) disponível para migração.

### Fase 2: Autenticação, Proteção e RLS no Supabase
- [ ] Reforço das políticas de Row Level Security (RLS).
- [ ] Bloqueio de auto-atribuição de Premium no cliente (apenas backend/admin autoriza).
- [ ] Validação server-side de sessões e perfis.

### Fase 3: Centro de Estudos & Banco de Perguntas
- [ ] Organização por Concurso $\to$ Área $\to$ Matéria $\to$ Tema $\to$ Conteúdo.
- [ ] Realização de simulados cronometrados de 45 minutos com submissão idempotente.
- [ ] Módulo dedicado de testes psicotécnicos (raciocínio lógico, sequências, analogias).

### Fase 4: Treinador de Inteligência Artificial ("Meu Treinador AproVE")
- [ ] Integração com Gemini 3.8 Flash no backend seguro Express `/api/gemini/tutor`.
- [ ] Controle de taxa e limites de utilização por plano.
- [ ] Explicações fundamentadas na legislação e conhecimentos de Angola.

### Fase 5: Pagamentos Manuais (Multicaixa Express / IBAN) & Afiliados
- [ ] Registo de intenção de compra com preço oficial (5.000 Kz / 25.000 Kz).
- [ ] Upload de comprovativo protegido.
- [ ] Consola administrativa para o proprietário verificar, aprovar ou rejeitar o pagamento.
- [ ] Ativação automática de Premium com cálculo de expiração apenas após aprovação real.
- [ ] Programa de afiliados com 3 níveis (Bronze 30%, Prata 40%, Ouro 50%) e 10% de desconto para o amigo.
- [ ] Gestão de comissões e pedidos de levantamento a partir de 5.000 Kz.

### Fase 6: Testes Automatizados & Otimização de Performance
- [ ] Suíte de testes automatizados para rotas, permissões, limites diários e fluxos financeiros.
- [ ] Otimização mobile para redes 3G/4G angolanas.
