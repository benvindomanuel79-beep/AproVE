# Documento de Requisitos de Produto (PRD) — AproVE Angola
## Especificação Técnica para Testes Automatizados, Depuração e Auditoria de Segurança

**Versão:** 2.0.0-PROD  
**Data:** 26 de Outubro de 2026  
**Produto:** AproVE ("Mais preparação. Mais confiança.")  
**Finalidade:** Guia autoritativo para automação de testes (E2E, Integração, Unidade, Carga e Penetração de Segurança).

---

## 1. Visão Geral do Sistema e Superfície de Ataque

A plataforma **AproVE** opera num modelo híbrido de alta disponibilidade com:
- **Frontend SPA / PWA:** React 19 + TypeScript com Vite e Service Worker local.
- **Backend API & Middleware:** Node.js Express com rotas de proxy seguro (`/api/gemini/tutor`, `/api/stripe/*`, `/api/health`).
- **Base de Dados Primária:** Supabase (PostgreSQL) com Row Level Security (RLS) ativado nas tabelas:
  - `candidates` (perfis de candidatos)
  - `exam_attempts` (histórico de simulados e pontuações)
  - `subscriptions` (assinaturas e comprovativos)
  - `withdrawals` (solicitações de saque de comissões)
- **Base de Dados Secundária:** Google Cloud Firestore (para contingência e regras nativas).
- **Provedor de IA:** Google Gemini 3.8 Flash isolado em ambiente de servidor (chave privada nunca exposta no cliente).

---

## 2. Matriz de Segurança e Modelo de Ameaças (STRIDE)

| Categoria STRIDE | Vector de Risco Identificado no AproVE | Mecanismo de Defesa Obrigatório | Teste Automatizado Correspondente |
| :--- | :--- | :--- | :--- |
| **Spoofing (Falsificação)** | Atacante forja o e-mail de outro candidato para acessar histórico ou saldo de afiliado. | Código OTP de 6 dígitos gerado no servidor com expiração em 10 minutos; sessões criptografadas. | `TEST-AUTH-001` (Validação de OTP e Sessão) |
| **Tampering (Adulteração)** | Candidato altera o payload de compra para assinar por 1 Kz em vez de 5.000 Kz. | Validação estrita do valor no backend e no webhook de conciliação; preços do banco de dados autoritativos. | `TEST-FIN-001` (Manipulação de Preço no Cliente) |
| **Repudiation (Repúdio)** | Afiliado nega ter recebido pagamento ou administrador altera comissões sem rastro. | Tabela `withdrawals` e logs com chaves estrangeiras imutáveis, timestamps ISO e histórico de status. | `TEST-AFF-001` (Auditoria de Saques e Transições) |
| **Information Disclosure (Vazamento)** | Visitante não autorizado extrai listas privadas de outros candidatos através da API do Supabase. | Políticas de Row Level Security (RLS) no PostgreSQL e regras restritas no `firestore.rules`. | `TEST-SEC-001` (Vazamento de Dados por RLS Bypass) |
| **Denial of Service (DoS)** | Atacante submete milhares de requisições de simulados ou chamadas ao Gemini para esgotar quotas. | Rate limiting nas rotas `/api/*`, debounce em formulários e cotas diárias de simulados gratuitos. | `TEST-PERF-001` (Rate Limit e Cota Diária) |
| **Elevation of Privilege (Privilégios)** | Candidato comum acessa rotas ou aprovações administrativas modificando estados no browser. | Validação de credenciais administrativas em nível de API de servidor; isolamento de comandos de moderação. | `TEST-AUTH-002` (Escalação de Privilégios Admin) |

---

## 3. Especificação Detalhada dos Módulos para Automação

### Módulo 1: Autenticação, OTP e Gestão de Contas

#### Critérios de Aceitação:
1. O formulário de registo exige apenas: Nome Completo, E-mail, WhatsApp (com prefixo angolano +244), Província (1 das 18 províncias) e Carreira Alvo.
2. Ao submeter, o backend gera um código OTP de 6 dígitos numéricos com validade estrita de 600 segundos (10 minutos).
3. Tentativas de inserção de código incorreto devem bloquear após 5 tentativas mal-sucedidas.
4. Códigos expirados devem retornar erro explícito: `"O código de verificação expirou"`.

---

### Módulo 2: Banco de Dados Supabase (PostgreSQL & RLS)

#### Critérios de Aceitação:
1. Chave Anônima (`anon key`) **NUNCA** pode executar `DROP`, `TRUNCATE` ou alterar tabelas do esquema `public`.
2. A consulta `SELECT * FROM public.candidates` com a chave pública deve retornar apenas campos autorizados.
3. A inserção em `exam_attempts` deve exigir `user_id` correspondente a um candidato existente.
4. Tentativa de inserção em `withdrawals` com valor inferior a `5.000 Kz` deve ser rejeitada pela regra de validação do banco ou pelo serviço.

---

### Módulo 3: Simulador Oficial de Provas (45 Minutos)

#### Critérios de Aceitação:
1. O cronômetro regressivo inicia em exatamente **2.700 segundos (45 minutos)**.
2. A resposta correta **não pode estar exposta no código HTML do DOM** antes da submissão do teste.
3. A pontuação é convertida estritamente para a escala oficial angolana de **0 a 20 Valores**:
   $$\text{Nota} = \left(\frac{\text{Acertos}}{\text{Total de Perguntas}}\right) \times 20$$
4. O utilizador no plano Gratuito tem direito a **1 simulado por dia**; ao tentar um segundo simulado no mesmo dia, o sistema deve apresentar a barreira de subscrição (`PaywallModal`).

---

### Módulo 4: Sistema de Pagamentos, Assinaturas e Webhooks

#### Critérios de Aceitação:
1. **Preços Oficiais Fixos:**
   - Mensal: **5.000 Kz** (ou **4.500 Kz** com 10% de desconto de indicação).
   - Vitalício: **25.000 Kz** (ou **22.500 Kz** com 10% de desconto de indicação).
2. Se o cliente enviar `amountKz: 100` via requisição forjada, o backend deve descartar o pedido.
3. O envio de comprovativo manual gera estado `"Pendente"`; a assinatura **NÃO É ATIVADA** automaticamente até que haja aprovação registrada.
4. Ao aprovar uma assinatura de 30 dias, `subscription_expiry` deve ser registrado exatamente para `DataAtual + 30 dias`.

---

### Módulo 5: Programa de Afiliados e Prevenção de Fraude

#### Critérios de Aceitação:
1. **Escala de Comissões:**
   - 1 a 9 indicados pagos: **Bronze (30%)** $\to$ 1.350 Kz/mensal.
   - 10 a 19 indicados pagos: **Prata (40%)** $\to$ 1.800 Kz/mensal.
   - 20+ indicados pagos: **Ouro (50%)** $\to$ 2.250 Kz/mensal.
2. **Auto-Indicação Proibida:** Se o `referredBy` for idêntico ao `affiliateCode` do próprio usuário, o desconto é rejeitado e nenhuma comissão é gerada.
3. **Limite Mínimo de Saque:** Solicitações de levantamento com valor inferior a **5.000 Kz** devem ser impedidas pelo sistema.

---

### Módulo 6: Inteligência Artificial e Verificador de Notícias Oficiais

#### Critérios de Aceitação:
1. A chave de API do Gemini **NUNCA** pode ser incluída em bundles de JavaScript servidos ao navegador.
2. A IA deve aderir estritamente à legislação vigente em Angola (Constituição da República de Angola de 2010 e Estatuto dos Funcionários Públicos).
3. **Combate a Boatos:** Ao ser questionada sobre boatos comuns (ex.: "concurso abriu 5.000 vagas em Luanda" ou "cobrança de taxas"), a IA deve classificar como boato e direcionar para `candidaturas.minint.ao`.
4. Se o servidor do Gemini estiver inacessível, o applet deve retornar orientações locais sem travar a interface.
