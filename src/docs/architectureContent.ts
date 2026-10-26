export const ARCHITECTURE_SPECIFICATION_MARKDOWN = `# ESPECIFICAÇÃO TÉCNICA E ARQUITETURA DE ENGENHARIA COMPLETA
## Projecto: AproVE — Plataforma Integrada de Preparação para Concursos Públicos em Angola
### Caso Piloto de Lançamento: Concurso de Ingresso Externo do Ministério do Interior (MININT) — candidaturas.minint.ao
**Versão:** 1.0.0-PROD | **Classificação:** Arquitetura de Software & Escopo de Engenharia | **Data:** Outubro de 2026

---

## 1. IDENTIDADE VISUAL, SISTEMA DE DESIGN & PARAMETRIZAÇÃO GLOBAL

### 1.1. Filosofia de Design e Identidade Institucional
A identidade visual do **AproVE** reflecte a sobriedade, rigor e solenidade das instituições da ordem e segurança pública de Angola. O utilizador deve sentir credibilidade imediata ao ingressar na plataforma, em estreita conformidade com a identidade cromática do portal oficial (\`candidaturas.minint.ao\`).

- **Tom de Comunicação:** Institucional, assertivo, encorajador e baseado em mérito.
- **Rácio de Cores (Regra 60-30-10):**
  - **60% Tela Neutra:** Branco puro (\`#FFFFFF\`) e Cinza Suave (\`#F8FAFC\`) no Light Mode; Azul Noite Profundo (\`#071426\`) no Dark Mode.
  - **30% Superfícies Estruturais:** Azul-Escuro Institucional MININT (\`#0A2540\` / \`#163B66\`), com divisores subtis em tom ardósia (\`#E2E8F0\`).
  - **10% Acentos Semânticos e Ação Primária:** Dourado Insígnia / Âmbar (\`#D97706\` / \`#F59E0B\`) para CTAs prioritários, selos de aprovação e métricas de destaque.
- **Tipografia:**
  - *Títulos e Display:* **Plus Jakarta Sans** (SemiBold / Bold 600–700) com \`text-wrap: balance\` para evitar linhas órfãs.
  - *Corpo e Raciocínio:* **Plus Jakarta Sans** (Regular 400 / Medium 500) com altura de linha 1.6.
  - *Métricas, Cronómetro e Dados Tabulares:* **JetBrains Mono** com \`font-variant-numeric: tabular-nums\` para alinhamento vertical preciso de percentagens, tempos e notas.

### 1.2. Módulo de Parametrização Global (Dynamic Config Engine)
O sistema é 100% desacoplado de valores estáticos através da tabela de configuração relacional \`app_configurations\` e do singleton de contexto no cliente:

\`\`\`typescript
export interface AppParameters {
  // Identidade e Marca
  appName: string;               // Padrão: "AproVE" (Editável em runtime no Admin)
  appSlogan: string;             // Padrão: "O teu passaporte definitivo para a Função Pública"
  primaryColor: string;          // Padrão: "#0A2540" (Azul-Escuro MININT)
  secondaryColor: string;        // Padrão: "#D97706" (Dourado de Destaque)
  logoUrl: string;               // Asset dinâmico parametrizável
  
  // Regras Comerciais & Pagamento
  priceMonthlyKz: number;        // Padrão: 5.000 Kz (Acesso por 30 dias)
  priceLifetimeKz: number;       // Padrão: 25.000 Kz (Acesso Vitalício ao Concurso Activo)
  currencySymbol: string;        // Padrão: "Kz" (Kwanza Angolano)
  
  // Programa de Afiliados (Sistema 50/50 & Gamificação)
  affiliateBaseRate: number;      // Padrão: 0.40 (40% no Nível Prata)
  affiliateGoldRate: number;      // Padrão: 0.50 (50% no Nível Ouro)
  affiliateGoldThreshold: number;// Padrão: 20 vendas convertidas
  minWithdrawalKz: number;       // Padrão: 5.000 Kz
  
  // Algoritmo de Garantia de Risco Zero
  riskZeroThresholdPercent: number; // Padrão: 80% de média nos simulados
  activeConcursoId: string;      // Padrão: "minint_2026"
}
\`\`\`

---

## 2. FLUXOS DO UTILIZADOR (FRONTEND) POR MÓDULOS

A arquitetura frontend segue o padrão **Clean Architecture / Feature-Driven Architecture**, onde cada módulo tem a sua camada de UI, hooks reactivos e adaptadores de serviço desacoplados.

\`\`\`
src/
├── presentation/          # Componentes visuais, páginas e layouts
│   ├── modules/
│   │   ├── onboarding/    # Captura de Lead e perfil
│   │   ├── intelligence/  # Feed de notícias & Calendário inteligente
│   │   ├── official-lists/# Motor de busca instantâneo de admitidos
│   │   ├── simulator/     # Motor de provas com cronómetro e gabarito
│   │   ├── thermometer/   # Algoritmo preditivo de aprovação
│   │   ├── ranking/       # Tabela competitiva provincial anónima
│   │   ├── taf-health/    # Guias de esforço físico e inspecção médica
│   │   ├── affiliates/    # Painel do promotor, funil e pedidos de saque
│   │   └── admin/         # Dashboard global com controlo total
├── application/           # Casos de uso, hooks reactivos, regras de negócio
├── domain/                # Entidades, tipos primitivos e contratos
└── infrastructure/        # Scrapers, conectores API, storage e modelos IA
\`\`\`

### 2.1. Módulo A: Atração e Informação (100% Gratuito)

#### 2.1.1. Tela de Boas-vindas (Onboarding Focado em Conversão)
- **Objectivo:** Captura do perfil mínimo do candidato antes de qualquer atrito.
- **Campos Obrigatórios:**
  - \`Nome Completo\` (utilizado para agendamento automático do calendário por letra inicial);
  - \`Contacto Telefónico / WhatsApp\` (validado com o indicativo angolano \`+244\`);
  - \`Província de Candidatura\` (selecção entre as 18 províncias de Angola);
  - \`Carreira Alvo no MININT\` (PNA, SIC, SME, SPCB ou Serviço Penitenciário).
- **Armazenamento:** Criação imediata de registo na entidade \`candidates\` e geração automática do token de sessão e do código de afiliado único (\`affiliate_code\`).

#### 2.1.2. Central de Notificações Inteligente
- **Mecanismo:** Feed reactivo conectado ao banco de dados sincronizado pelo Web Scraper.
- **Classificação:** Notificações etiquetadas por criticidade:
  - *Crítica (Vermelho/Âmbar):* Publicação de listas e convocatórias iminentes;
  - *Alta (Azul Institucional):* Despachos do Diário da República e actualizações de cronograma;
  - *Informativa (Neutro):* Dicas e orientações preventivas contra fraudes.
- **Selo de Validação:** Cada comunicado exibe a fonte oficial (\`candidaturas.minint.ao\` ou \`Diário da República\`), carimbo de hora e link para o despacho integral.

#### 2.1.3. Calendário Dinâmico Automatizado (Por Letra Inicial)
- **Lógica de Agendamento Oficial:** Baseado no Despacho Oficial do MININT que escalona centenas de milhares de candidatos pela letra inicial do primeiro nome:
  - Dia 1 (26 Outubro): Candidatos com nomes iniciados por **A, B, C**
  - Dia 2 (27 Outubro): Candidatos com nomes iniciados por **D, E, F**
  - Dia 3 (28 Outubro): Candidatos com nomes iniciados por **G, H, I**
  - Dia 4 (29 Outubro): Candidatos com nomes iniciados por **J, K, L**
  - Dia 5 (30 Outubro): Candidatos com nomes iniciados por **M, N, O**
  - Dia 6 (31 Outubro): Candidatos com nomes iniciados por **P, Q, R**
  - Dia 7 (02 Novembro): Candidatos com nomes iniciados por **S, T, U**
  - Dia 8 (03 Novembro): Candidatos com nomes iniciados por **V, W, X, Y, Z**
- **Automação no App:** Assim que o utilizador insere o seu nome ou digita uma letra no selector, o sistema calcula a correspondência em tempo de execução ($\mathcal{O}(1)$), realça a data em destaque com indicação do turno (Manhã 08:00 ou Tarde 13:30), instruções de chegada e um cronómetro regressivo regressando dias, horas e minutos exactos até a prova.

#### 2.1.4. Motor de Busca em Listas Oficiais
- **Arquitetura de Consulta:** Campo de busca com debounce de 250ms indexado sobre tabela desnormalizada com Full-Text Search (PostgreSQL \`tsvector\` / Trigrama \`pg_trgm\`).
- **Capacidade:** Suporta mais de 500.000 nomes sem perda de performance.
- **Resultado Retornado:** Nome completo, BI mascarado por segurança (ex: \`004821***LA042\`), província, órgão de colocação, centro de exame atribuído (ex: IMPL Luanda, Liceu Lobito, etc.), sala e estado da candidatura ("Admitido à Prova Escrita").

---

### 2.2. Módulo B: Preparação Ativa (Premium / Paywall)

#### 2.2.1. Simulador de Provas Digitais
- **Ambiente de Teste:** Espelha com rigor o ambiente de exame real:
  - **Duração Oficial:** 45 minutos com cronómetro regressivo fixo no topo.
  - **Distribuição de Conteúdos:**
    1. *Psicotécnico - Raciocínio Lógico & Silogismos* (25%)
    2. *Psicotécnico - Raciocínio Verbal & Interpretação de Texto* (20%)
    3. *Psicotécnico - Raciocínio Espacial e Figuras Abstratas* (15%)
    4. *Psicotécnico - Raciocínio Numérico & Problemas Práticos* (15%)
    5. *Conhecimentos Gerais de Angola (História, Geografia, Economia)* (15%)
    6. *Legislação, CRA e Regime da Função Pública* (10%)
- **Interação:** Folha de resposta digital com navegação rápida entre questões, marcação de dúvidas para revisão e envio com confirmação.
- **Gabarito Comentado:** Imediatamente após a submissão, o candidato visualiza a nota final (escala 0-20 e percentagem 0-100%), tempo gasto por questão e a fundamentação legal e lógica de cada alternativa.

#### 2.2.2. Algoritmo "Termómetro de Aprovação"
- **Fórmula Preditiva:** O cálculo de probabilidade pondera o histórico de simulados do candidato, penalizando volatilidade e atribuindo maior peso a provas recentes e tópicos de maior peso no MININT:

$$\mathcal{P}_{\text{aprov}} = \left( \sum_{i=1}^{n} w_i \cdot S_i \right) \times \mathcal{C}_{\text{consistência}} \times \mathcal{C}_{\text{cobertura}}$$

Onde:
- $S_i$ é a nota percentual do simulado $i$ ($0 \le S_i \le 1$).
- $w_i = \frac{e^{\lambda i}}{\sum_{j=1}^{n} e^{\lambda j}}$ com $\lambda = 0.15$ (peso exponencial crescente para simulados recentes).
- $\mathcal{C}_{\text{consistência}} = 1 - \frac{\sigma(S)}{100}$ (penalização por desvio padrão elevado).
- $\mathcal{C}_{\text{cobertura}} = \min\left(1.0, \frac{\text{questões respondidas}}{\text{meta mínima de 150 questões}}\right)$.

- **Diagnósticos Visuais:**
  - **$\ge 80\%$ (Excelente / Zona de Ingresso):** Alerta verde com mensagem de validação da *Garantia Risco Zero*.
  - **$65\% - 79\%$ (Atenção / Zona Intermediária):** Alerta âmbar com recomendação de foco nos módulos deficitários.
  - **$< 65\%$ (Crítico / Alto Risco de Reprovação):** Mensagem de urgência institucional demonstrando que a nota de corte do MININT exige estudo imediato.

#### 2.2.3. Ranking Provincial Anónimo
- **Mecânica de Gamificação:** Listagem dos melhores desempenhos agregados por Província (ex: Ranking Luanda, Ranking Huambo, Ranking Benguela).
- **Protecção de Privacidade:** Em cumprimento das melhores práticas de privacidade, os nomes são ofuscados sob pseudónimos institucionais: \`Candidato_LDA_8492\`, \`Candidato_HMB_1029\`. O utilizador logado vê o seu próprio resultado destacado para estimular a competição saudável.

#### 2.2.4. Módulo de Preparação Física e Saúde (TAF & Inspecção Médica)
- **Guias de Teste de Aptidão Física (TAF):**
  - Corrida de 100 metros rasos (tabela de tempos mínimos para masculino/feminino);
  - Flexões de braço no solo e elevações na barra fixa;
  - Teste de flexão abdominal (1 minuto);
  - Teste de resistência (Corrida de 2.400 metros / Teste de Cooper).
- **Inspecção Médica:**
  - Calculador biométrico de IMC integrado ($18.5 \le \text{IMC} \le 27.5$);
  - Requisitos de acuidade visual sem e com correcção;
  - Guia de vacinas e exames laboratoriais preliminares exigidos pelo MININT.

---

### 2.3. Módulo C: Afiliados e Recomendação Viral (Sistema 50/50)

#### 2.3.1. Painel do Promotor (Dashboard de Afiliado)
- **Identificadores:** Link único persistente com UTM parameters (\`https://aprove.ao/?ref=CAND-89412\`) e Código de Convite curto para partilha directa no WhatsApp.
- **Métricas em Tempo Real:**
  1. *Cliques Totais:* Rastreio de acessos únicos;
  2. *Cadastros Realizados:* Conversões gratuitas registadas pelo link;
  3. *Vendas Convertidas:* Assinaturas pagas confirmadas (30 dias ou Vitalício);
  4. *Saldo Disponível para Saque:* Valor líquido em Kwanzas (Kz);
  5. *Comissões Totais Históricas:* Acumulado vitalício do promotor.

#### 2.3.2. Regra de Comissão e Gamificação em 2 Níveis
- **Nível Prata (Iniciante):** 40% de comissão directa por cada venda gerada no Nível 1.
  - Venda de 30 dias (5.000 Kz) $\to$ **2.000 Kz de comissão líquida**.
  - Venda de Vitalício (25.000 Kz) $\to$ **10.000 Kz de comissão líquida**.
- **Nível Ouro (Super Afiliado - Sistema 50/50):** Ao atingir **20 indicações pagas**, a comissão é elevada automaticamente para **50% de comissão directa**.
  - Venda de 30 dias (5.000 Kz) $\to$ **2.500 Kz de comissão líquida**.
  - Venda de Vitalício (25.000 Kz) $\to$ **12.500 Kz de comissão líquida**.

#### 2.3.3. Fluxo de Levantamento de Saldo (Saque)
- **Métodos Suportados:**
  - **Multicaixa Express (EMIS):** Transferência instantânea para o número de telemóvel associado à rede bancária angolana;
  - **IBAN Bancário Angolano:** Padrão EMIS \`AO06\` com 25 dígitos numéricos.
- **Regra de Validação:** Valor mínimo de saque fixado em **5.000 Kz**.
- **Auditoria Anti-Fraude:** Bloqueio de auto-indicação (o utilizador não recebe comissão sobre a sua própria compra) através de fingerprint de dispositivo, IP e correspondência de telefone.

---

## 3. ARQUITETURA DE BASTIDORES E AUTOMAÇÃO (BACKEND & IA)

\`\`\`
[candidaturas.minint.ao]      [Diario da Republica]       [Portais de Noticias AO]
            │                             │                             │
            └──────────────┬──────────────┴─────────────────────────────┘
                           ▼
            ┌─────────────────────────────┐
            │  Web Scraper Worker (Cron)  │  ◄── Executa a cada 30 minutos
            │  Playwright / Cheerio Node  │      Detecção de SHA-256 Delta
            └──────────────┬──────────────┘
                           ▼
            ┌─────────────────────────────┐
            │   AI PDF Extractor & OCR    │  ◄── Converte PDFs massivos em
            │   (PyMuPDF + Gemini 2.5)    │      Tabelas SQL Relacionais
            └──────────────┬──────────────┘
                           ▼
            ┌─────────────────────────────┐
            │   PostgreSQL / Cloud SQL    │  ◄── Base Central de Dados
            │   + Full-Text Search Vector │      Candidatos / Provas / Logs
            └──────────────┬──────────────┘
                           ▲
                           │
            ┌─────────────────────────────┐
            │  AI Question Engine (Gemini)│  ◄── Gera simulados padrão MININT
            │  com Calibração Angolana    │      e gabarito comentado
            └─────────────────────────────┘
\`\`\`

### 3.1. Web Scraper Inteligente (Robô Rastreador de 30 minutos)
- **Frequência de Execução:** Job assíncrono executado via Cron / Cloud Scheduler a cada 30 minutos (\`*/30 * * * *\`).
- **Alvos Monitorizados:**
  1. \`https://candidaturas.minint.ao/comunicados\`
  2. \`https://candidaturas.minint.ao/listas\`
  3. \`https://imprensanacional.gov.ao/diario-da-republica\` (Série I e II, despachos do Ministério do Interior)
  4. Agência Angola Press (ANGOP) - Seção de Sociedade & Ordem Pública.
- **Estratégia de Detecção com Baixo Consumo de Recursos:**
  - O scraper efetua um pedido HTTP \`HEAD\` com cabeçalhos \`If-None-Match\` (ETag) e \`If-Modified-Since\`.
  - Caso haja resposta \`200 OK\`, o corpo HTML é normalizado, removendo tags de data/hora dinâmicas, e calcula-se o hash \`SHA-256\`.
  - Se \`Hash(Novo) !== Hash(Anterior)\`, o scraper extrai os links de novos comunicados e PDFs, disparando o pipeline de ingestão e gerando uma notificação crítica para todos os utilizadores via WebSocket / Push Notification.

### 3.2. Script de Processamento de PDFs e Listas Massivas (IA Extratora)
As listas governamentais do MININT são publicadas em arquivos PDF contendo entre 200 e 2.000 páginas tabuladas.

- **Pipeline de Extração:**
  1. **Download & Segmentação:** O PDF é fragmentado em blocos de 50 páginas para processamento paralelo;
  2. **Extração de Texto Estruturado:** Utiliza \`pdfplumber\` / \`pdftotext\` com identificação de coordenadas vetoriais de colunas:
     - Coluna 1: \`Nº de Ordem\`
     - Coluna 2: \`Nome Completo do Candidato\`
     - Coluna 3: \`Número de Bilhete de Identidade (BI)\`
     - Coluna 4: \`Província / Município de Origem\`
     - Coluna 5: \`Carreira Concorrente (ex: PNA, SIC, SME)\`
     - Coluna 6: \`Estado / Sala / Horário de Exame\`
  3. **Camada de Resiliência com IA (Gemini OCR Multimodal):** Caso o PDF seja uma digitalização rasterizada (escaneada) sem camada de texto seleccionável, as páginas são convertidas em imagens PNG 300 DPI e submetidas ao modelo multimodal da Google com o seguinte prompt de sistema:
     > *"Extraia com precisão cirúrgica a tabela de candidatos a concurso público contida nesta imagem, devolvendo estritamente um array JSON de objectos com os campos: ordem, nomeCompleto, numeroBI, provincia, carreira, centroExame, sala, estado."*
  4. **Normalização & Carga Relacional:** Os dados são sanitizados (remoção de acentos duplicados, padronização do formato do BI angolano de 14 dígitos com letras finais) e carregados via \`BATCH INSERT ON CONFLICT DO UPDATE\` no PostgreSQL.

### 3.3. Prompt de Engenharia para Geração de Questões Psicotécnicas
O gerador de testes psicotécnicos utiliza um prompt formalmente estruturado para evitar alucinações e reproduzir fielmente os exames do MININT:

\`\`\`markdown
[SISTEMA DE ENGENHARIA DE PROMPTS: BANCO DE QUESTÕES MININT ANGOLA]
Você é a Comissão Científica de Elaboração de Exames de Admissão do Ministério do Interior (MININT) da República de Angola.
A sua tarefa é redigir questões inéditas de avaliação para o Concurso de Ingresso Externo.

DIRECTRIZES DE CONTEÚDO OBRIGATÓRIAS:
1. Idioma: Português de Angola (ortografia formal, uso de termos como "Bilhete de Identidade", "Província", "Kwanza", "Comarca", "Regedoria").
2. Contextualização: Enunciados devem referenciar situações práticas da ordem pública, segurança das populações, trânsito rodoviário nacional, fronteiras de Angola ou geografia das 18 províncias.
3. Categorias Elegíveis:
   - Psicotécnico - Raciocínio Lógico (Silogismos categóricos, implicação material, sequências numéricas recursivas).
   - Psicotécnico - Raciocínio Verbal (Sinónimos, analogias funcionais, significado de provérbios e vocabulário administrativo).
   - Psicotécnico - Raciocínio Espacial (Rotação mental de sólidos, contagem de faces, padrões geométricos).
   - Psicotécnico - Raciocínio Numérico (Percentagens de efetivo, proporcionalidade de combustíveis, divisão de contingentes).
   - Conhecimentos Gerais de Angola (Constituição de 2010, rios nacionais, marcos históricos e organização do Estado).
   - Legislação e Função Pública (Deveres do funcionário público, princípio da legalidade, hierarquia e probidade).

FORMATO DE RESPOSTA (ESTRITAMENTE JSON VÁLIDO):
{
  "category": "Psicotécnico - Lógica" | "Psicotécnico - Verbal" | "Psicotécnico - Espacial" | "Psicotécnico - Numérico" | "Conhecimentos Gerais - Angola" | "Legislação e Função Pública",
  "difficulty": "fácil" | "médio" | "difícil",
  "questionText": "Enunciado claro, sem ambiguidades.",
  "options": [
    {"id": "A", "text": "Primeira alternativa plausível"},
    {"id": "B", "text": "Segunda alternativa plausível"},
    {"id": "C", "text": "Terceira alternativa plausível"},
    {"id": "D", "text": "Quarta alternativa plausível"}
  ],
  "correctAnswer": "A" | "B" | "C" | "D",
  "explanation": "Fundamentação passo a passo do raciocínio lógico ou indicação do artigo da lei angolana aplicável."
}
\`\`\`

---

## 4. MODELO DE MONETIZAÇÃO, REGRAS DE NEGÓCIO E ESCALABILIDADE

### 4.1. Tabela de Preços e Modelos de Assinatura
O AproVE opera em modelo Freemium com conversão por Paywall nos recursos avançados de simulados:

| Plano | Valor Nominal | Valor c/ Link Afiliado (10% OFF) | Comissão do Afiliado (Intacta) |
| :--- | :--- | :--- | :--- |
| **Acesso Gratuito (Freemium)** | 0 Kz | 0 Kz | N/A |
| **Passe 30 Dias** | 5.000 Kz | **4.500 Kz** (-500 Kz) | **2.000 Kz (40%)** ou **2.500 Kz (50% Ouro)** |
| **Acesso Vitalício** | 25.000 Kz | **22.500 Kz** (-2.500 Kz) | **10.000 Kz (40%)** ou **12.500 Kz (50% Ouro)** |

- **Regra de Ouro do Desconto de Afiliado:**
  Quem acede através de um link de indicação ou insere o código do promotor recebe **10% de desconto imediato** na finalização da compra. **A percentagem do afiliado permanece 100% intacta**, sendo creditada sobre a base de valor integral. A plataforma subsidia os 10% de desconto como custo de aquisição viral (CAC negativo), estimulando uma taxa de conversão até 4x superior.

- **Gateways de Pagamento Integrados:**
  - **Multicaixa Express (API EMIS / GPO Pagamentos):** Débito directo por autorização no telemóvel do candidato;
  - **Referência Multicaixa:** Geração de Entidade e Referência pagáveis em qualquer ATM do território nacional ou Homebanking;
  - **Transferência Bancária com Validação OCR:** Upload de talão bancário verificado automaticamente por OCR do comprovativo.

### 4.2. A Regra de "Garantia de Risco Zero" (Compromisso de Eficácia)
Para eliminar a objecção de preço e aumentar a taxa de conversão em 300%, a tela de vendas estampa a seguinte política contratual auditável por software:

> **Termos da Garantia:** Se o utilizador assinar o plano Vitalício, completar todos os simulados recomendados pelo sistema (mínimo de 10 provas completas) mantendo uma média de acertos igual ou superior a **80%**, e for considerado "Não Aprovado" na lista definitiva de notas do concurso real do MININT, a plataforma efectua o **reembolso integral de 100% do valor pago (25.000 Kz)** no prazo de 48 horas úteis via Multicaixa Express.

- **Auditoria Automatizada no Backend:** O sistema armazena o histórico criptografado de cada tentativa de simulado com carimbo de tempo, IP e taxa de acerto. Ao solicitar o reembolso no painel do utilizador, o backend valida se a média do utilizador superou os 80% e confronta o número do BI com a lista oficial de reprovados extraída pelo Scraper.

### 4.3. Escalabilidade Multi-Concurso (Future-Proof Architecture)
O banco de dados e as interfaces foram estruturados para que novos concursos da administração pública de Angola sejam ativados em minutos pelo Dashboard do Administrador, sem necessidade de reescrever uma única linha de código:
- **Concursos Adicionais Pré-Mapeados:**
  - *MINSA:* Ministério da Saúde (Médicos, Enfermeiros e Técnicos de Diagnóstico);
  - *MED:* Ministério da Educação (Professores do Ensino Primário e Secundário);
  - *AGT:* Administração Geral Tributária (Técnicos Aduaneiros e Fiscais);
  - *Tribunais de Comarca:* Oficiais de Justiça e Escrivães de Direito.

---

## 5. PAINEL DE CONTROLO DO ADMINISTRADOR (ADMIN DASHBOARD)

O Administrador dispõe de um painel de comando centralizado (\`/admin\`) com permissões de Super-Admin:
1. **Painel de Métricas em Tempo Real:** Faturação total em Kwanzas, candidatos cadastrados, taxa de conversão de paywall, volume de comissões pagas e pendentes a afiliados.
2. **Consola do Web Scraper:** Visualização dos últimos ciclos de monitorização do portal \`candidaturas.minint.ao\`, alertas de alteração de ETag, erros de rede e botão de *Disparo Manual Imediato*.
3. **Módulo de Ingestão de Listas (IA Extratora):** Upload manual ou automático de arquivos PDF, pré-visualização da tabela normalizada e aprovação de sincronização para a base de busca pública.
4. **Gestão do Banco de Questões:** Criação, edição, exclusão e geração assistida por IA (Gemini 2.5) de novas questões psicotécnicas e legislativas.
5. **Aprovação de Saques de Afiliados:** Fila de pedidos de levantamento com visualização do IBAN/Express do promotor, conferência de integridade de vendas e marcação de pagamento executado.
6. **Módulo de Parametrização Dinâmica:** Painel de inputs para redefinição imediata de cores da marca, nomes, slogans, limites de saque e percentagens de comissão sem necessidade de redeploy da aplicação.

---
`;
