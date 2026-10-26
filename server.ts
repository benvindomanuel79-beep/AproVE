import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import Stripe from 'stripe';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Initialize Stripe (test mode fallback if STRIPE_SECRET_KEY not provided)
const stripeApiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51MockStripeAproVEAngolaKeyForDevelopment';
const stripe = new Stripe(stripeApiKey, {
  apiVersion: '2025-02-24.acacia' as any,
});
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// In-memory persistent subscription store & events log for immediate access & fallback
export const activeSubscriptions = new Map<string, {
  candidateId: string;
  plan: 'monthly' | 'lifetime';
  status: 'active' | 'cancelled';
  paidAt: string;
  amountKz: number;
  stripeSessionId?: string;
}>();

// Raw body parser exclusively for Stripe Webhook signature verification
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event: any;

  try {
    if (stripeWebhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
    } else {
      // In development or test simulation without signature
      const rawString = typeof req.body === 'string' ? req.body : req.body.toString('utf8');
      event = JSON.parse(rawString);
    }
  } catch (err: any) {
    console.error(`[Stripe Webhook Error]: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[Stripe Webhook Recebido]: Tipo do Evento = ${event.type}`);

  // Process checkout.session.completed and payment_intent.succeeded
  if (event.type === 'checkout.session.completed') {
    const session = event.data?.object;
    const candidateId = session?.client_reference_id || session?.metadata?.candidateId;
    const plan = (session?.metadata?.plan || 'monthly') as 'monthly' | 'lifetime';
    const amountKz = Number(session?.metadata?.amountKz || (plan === 'lifetime' ? 12000 : 5000));

    if (candidateId) {
      activeSubscriptions.set(candidateId, {
        candidateId,
        plan,
        status: 'active',
        paidAt: new Date().toISOString(),
        amountKz,
        stripeSessionId: session.id,
      });
      console.log(`[Stripe Webhook] ACESSO PREMIUM LIBERADO com sucesso para Candidato ${candidateId} - Plano: ${plan}`);
    }
  }

  return res.json({ received: true, eventType: event.type });
});

// JSON parser for all standard API routes
app.use(express.json());

// Endpoint to simulate webhook in development/demo mode
app.post('/api/stripe/simulate-webhook', (req, res) => {
  const { candidateId, plan = 'monthly' } = req.body;
  if (!candidateId) {
    return res.status(400).json({ success: false, error: 'candidateId é obrigatório' });
  }

  const amountKz = plan === 'lifetime' ? 12000 : 5000;
  const mockSessionId = `cs_test_mock_${Date.now()}`;

  activeSubscriptions.set(candidateId, {
    candidateId,
    plan,
    status: 'active',
    paidAt: new Date().toISOString(),
    amountKz,
    stripeSessionId: mockSessionId,
  });

  console.log(`[Stripe Webhook Simulado] Assinatura ativada para ${candidateId} (${plan})`);

  return res.json({
    success: true,
    message: `Acesso premium ${plan === 'lifetime' ? 'Vitalício' : 'Mensal (30 dias)'} liberado automaticamente via Webhook!`,
    subscription: {
      candidateId,
      plan,
      status: 'active',
      paidAt: new Date().toISOString(),
      amountKz,
      stripeSessionId: mockSessionId,
    },
  });
});

// Endpoint to check candidate subscription status
app.get('/api/stripe/subscription-status/:candidateId', (req, res) => {
  const { candidateId } = req.params;
  const sub = activeSubscriptions.get(candidateId);
  return res.json({
    hasSubscription: !!sub,
    subscription: sub || null,
  });
});

// Endpoint to create Stripe Checkout Session
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  const { plan, candidateId, candidateEmail, candidateName, returnUrl } = req.body;

  if (!candidateId || !plan) {
    return res.status(400).json({ error: 'Parâmetros incompletos (candidateId e plan obrigatórios)' });
  }

  const isLifetime = plan === 'lifetime';
  const priceUSD = isLifetime ? 1400 : 600; // $14.00 USD ou $6.00 USD (~12.000 Kz / 5.000 Kz)
  const amountKz = isLifetime ? 12000 : 5000;
  const planTitle = isLifetime
    ? 'AproVE MININT - Acesso Vitalício + Simuladores VIP'
    : 'AproVE MININT - Assinatura 30 Dias (Ciclo de Provas)';

  // If real Stripe key is available and not the placeholder, use real Stripe API
  const hasLiveKey = process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('Mock');

  if (hasLiveKey) {
    try {
      const session = await (stripe.checkout.sessions.create as any)({
        payment_method_types: ['card'],
        customer_email: candidateEmail || undefined,
        client_reference_id: candidateId,
        metadata: {
          candidateId,
          plan,
          amountKz: String(amountKz),
          candidateName: candidateName || 'Candidato MININT',
        },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: planTitle,
                description: `Preparação completa para o Concurso Público do Ministério do Interior (MININT Angola). Equivalente a ${amountKz.toLocaleString()} Kwanzas.`,
              },
              unit_amount: priceUSD,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${returnUrl || 'http://localhost:3000'}?payment_success=true&session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
        cancel_url: `${returnUrl || 'http://localhost:3000'}?payment_cancelled=true`,
      });

      return res.json({
        success: true,
        url: session.url,
        sessionId: session.id,
        mode: 'live',
      });
    } catch (err: any) {
      console.warn('[Stripe Create Session Warning]:', err.message);
      // Fallback to integrated simulated checkout if test key rejects
    }
  }

  // Instant Interactive Stripe Checkout Session for Demo / Local Test
  const mockId = `cs_test_stripe_${Date.now()}`;
  return res.json({
    success: true,
    url: null, // Client opens interactive modal
    sessionId: mockId,
    mode: 'test_instant',
    planDetails: {
      plan,
      title: planTitle,
      amountKz,
      amountUsd: priceUSD / 100,
      candidateId,
      candidateEmail,
    },
  });
});


// Initialize GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System Instruction for Angolan Civil Service Exam Question Generation
const MININT_SYSTEM_INSTRUCTION = `Você é o Coordenador Científico da Comissão Nacional de Exames de Admissão do Ministério do Interior (MININT) da República de Angola.
O seu papel é redigir questões originais, rigorosas e realistas para as provas escritas e testes psicotécnicos do Concurso de Ingresso Externo (Polícia Nacional - PNA, SIC, SME, Protecção Civil e Bombeiros, Serviços Prisionais).

Directrizes de Conteúdo:
1. Idioma: Português formal de Angola (ex: "Bilhete de Identidade", "Província", "Comarca", "Regedoria", "Kwanza", "Probidade").
2. Contextualização: Enunciados devem referenciar realidades de Angola (as 18 províncias, Luanda, Huambo, Benguela, rios Kwanza e Cunene, trânsito e segurança rodoviária, fronteiras, Constituição da República de Angola de 2010 e Regime da Função Pública).
3. As 4 alternativas (A, B, C, D) devem ser plausíveis, com apenas UMA alternativa inquestionavelmente correcta.
4. A explicação deve fundamentar claramente a resposta com o raciocínio lógico/matemático ou o artigo legal aplicável.`;

// API endpoint to generate questions
app.post('/api/gemini/generate-questions', async (req, res) => {
  const { category, count = 5, difficulty = 'médio', career = 'Geral' } = req.body;

  try {
    if (!ai) {
      return res.status(200).json({
        success: false,
        source: 'fallback',
        message: 'GEMINI_API_KEY não configurada no servidor. Retornando questões do banco de segurança.',
        questions: [],
      });
    }

    const categoryPrompt = category
      ? `Gere ${count} questões especificamente da categoria "${category}".`
      : `Gere um simulado completo com ${count} questões balanceadas entre Psicotécnico (Lógica, Verbal, Numérico, Espacial), Conhecimentos Gerais de Angola e Legislação da Função Pública.`;

    const prompt = `${categoryPrompt}
Dificuldade solicitada: ${difficulty}.
Carreira foco: ${career}.

Retorne estritamente um array JSON contendo as questões estruturadas.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: MININT_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: 'Categoria da questão (ex: Psicotécnico - Lógica, Psicotécnico - Verbal, Psicotécnico - Espacial, Psicotécnico - Numérico, Conhecimentos Gerais - Angola, Legislação e Função Pública)',
              },
              difficulty: {
                type: Type.STRING,
                description: 'fácil, médio ou difícil',
              },
              questionText: {
                type: Type.STRING,
                description: 'Enunciado completo da questão contextualizado em Angola.',
              },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: 'A, B, C ou D' },
                    text: { type: Type.STRING, description: 'Texto da opção' },
                  },
                  required: ['id', 'text'],
                },
              },
              correctAnswer: {
                type: Type.STRING,
                description: 'Letra da alternativa correcta (A, B, C ou D)',
              },
              explanation: {
                type: Type.STRING,
                description: 'Fundamentação detalhada do gabarito com explicação lógica ou citação legal.',
              },
            },
            required: ['category', 'difficulty', 'questionText', 'options', 'correctAnswer', 'explanation'],
          },
        },
      },
    });

    const text = response.text?.trim() || '[]';
    let parsedQuestions = [];
    try {
      parsedQuestions = JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing JSON from Gemini:', parseError);
    }

    // Attach unique IDs and timestamp
    const enriched = parsedQuestions.map((q: any, index: number) => ({
      ...q,
      id: `q-gemini-${Date.now()}-${index}`,
    }));

    return res.json({
      success: true,
      source: 'gemini-3.8-flash',
      count: enriched.length,
      questions: enriched,
    });
  } catch (error: any) {
    console.error('Error generating questions with Gemini:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Falha ao comunicar com a IA',
      questions: [],
    });
  }
});

// Educational Tutor AI Endpoint ("Meu Treinador AproVE")
const TUTOR_SYSTEM_INSTRUCTION = `Você é o "Meu Treinador AproVE", assistente pedagógico e mentor virtual da plataforma AproVE Angola ("Mais preparação. Mais confiança.").
A sua missão é apoiar candidatos a concursos públicos em Angola (MININT - Polícia Nacional PNA, SIC, SME, Protecção Civil e Bombeiros, Serviços Prisionais e Função Pública).

Directrizes de Comunicação:
1. Idioma: Português formal e motivador de Angola (vocabulário: "Província", "Bilhete de Identidade", "Kwanza", "Comarca", "Regedoria", "Probidade").
2. Contextualização: Referencie a realidade angolana (geografia das 18 províncias, rios Kwanza e Cunene, Constituição da República de Angola de 2010, Lei da Probidade Pública e Regime Geral da Função Pública).
3. Pedagogia: Explique raciocínio lógico passo a passo; deduza fórmulas de sequências numéricas e espaciais com didática clara; aponte onde o candidato cometeu equívocos nos simulados.
4. Independência: Lembre sempre que a AproVE é uma plataforma de treino independente e respeitosa das diretrizes das comissões oficiais de exames.
5. Formatação: Use tópicos estruturados, clareza e parágrafos curtos ideais para leitura em dispositivos móveis.`;

app.post('/api/gemini/tutor', async (req, res) => {
  const { message, context, career = 'Geral', candidateName = 'Candidato' } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mensagem obrigatória' });
  }

  try {
    if (!ai) {
      return res.status(200).json({
        success: true,
        source: 'local_mentor',
        reply: `Prezado(a) ${candidateName},\n\nO Treinador AproVE registou a sua dúvida sobre "${message}".\n\nDica pedagógica essencial: Para os exames do MININT e Função Pública em Angola, foque a sua revisão diária em:\n1. Psicotécnicos: Pratique raciocínio lógico e numérico com cronômetro.\n2. Conhecimentos de Angola: Releia a divisão político-administrativa e rios principais.\n3. Legislação: Estude os direitos e deveres dos funcionários públicos na CRA 2010.\n\nContinue focado nos simulados!`,
      });
    }

    const prompt = `Candidato: ${candidateName} (Carreira foco: ${career})
Contexto atual: ${context || 'Preparação para exames do MININT 2026'}
Pergunta do candidato: ${message}

Responda como o mentor AproVE: acolhedor, fundamentado na legislação e realidade de Angola, com orientações práticas.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: TUTOR_SYSTEM_INSTRUCTION,
      },
    });

    const reply = response.text || 'O Treinador AproVE processou a sua consulta. Continue focado na sua meta diária de estudos.';

    return res.json({
      success: true,
      source: 'gemini-3.8-flash',
      reply,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/tutor:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Falha ao comunicar com o Treinador AproVE',
      reply: `Olá ${candidateName}, o Treinador AproVE está temporariamente ocupado. Enquanto a rede estabiliza, recomendamos rever as explicações comentadas no seu painel de simulados.`,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    appName: 'AproVE Angola MININT',
    supabaseUrl: process.env.VITE_SUPABASE_URL || 'https://bpdcdljtdebckyzxmoai.supabase.co',
    timestamp: new Date().toISOString(),
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`[AproVE Server] Rodando em http://localhost:${port}`);
    console.log(`[AproVE Server] Gemini API Status: ${apiKey ? 'Configurado' : 'Aguardando Chave'}`);
  });
}

startServer();
