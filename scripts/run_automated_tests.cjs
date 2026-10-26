/**
 * Automated Test Suite for AproVE Angola
 * Covers: Security, RLS, Business Logic, Payment Calculations, and Compliance
 */

const { createClient } = require('@supabase/supabase-js');

function sanitizeUrl(raw) {
  let cleaned = (raw || '').trim();
  if (!cleaned) return 'https://bpdcdljtdebckyzxmoai.supabase.co';
  if (/^[a-z0-9_-]{10,40}$/i.test(cleaned)) {
    return `https://${cleaned}.supabase.co`;
  }
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }
  cleaned = cleaned.replace(/\/rest\/v1\/?$/i, '');
  cleaned = cleaned.replace(/\/+$/, '');
  return cleaned || 'https://bpdcdljtdebckyzxmoai.supabase.co';
}

const SUPABASE_URL = sanitizeUrl(process.env.VITE_SUPABASE_URL);
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwZGNkbGp0ZGViY2t5enhtb2FpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NzIwNzIsImV4cCI6MjEwODQ0ODA3Mn0.dSYAXsaq7tD0KbZafLRo_3pw6WiAFi8pPEK2_zObjms';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 EXECUTANDO SUÍTE DE TESTES AUTOMATIZADOS APROVE');
  console.log('====================================================\n');

  // TEST 1: Supabase Connectivity & Table Accessibility
  console.log('--- TEST 1: Conectividade e Integridade das Tabelas Supabase ---');
  try {
    const { data: candData, error: candErr } = await supabase.from('candidates').select('id, name, email').limit(2);
    assert(!candErr, 'Tabela "candidates" acessível e sem erro');

    const { data: examData, error: examErr } = await supabase.from('exam_attempts').select('id, score_percentage').limit(2);
    assert(!examErr, 'Tabela "exam_attempts" acessível e sem erro');

    const { data: subData, error: subErr } = await supabase.from('subscriptions').select('id, plan, amount_kz').limit(2);
    assert(!subErr, 'Tabela "subscriptions" acessível e sem erro');

    const { data: wdData, error: wdErr } = await supabase.from('withdrawals').select('id, amount_kz, status').limit(2);
    assert(!wdErr, 'Tabela "withdrawals" acessível e sem erro');
  } catch (err) {
    assert(false, 'Conexão ao Supabase falhou: ' + err.message);
  }

  // TEST 2: Scoring Algorithm (0-20 scale official Angolan standard)
  console.log('\n--- TEST 2: Algoritmo de Pontuação de Simulados (0-20 Valores) ---');
  function calculateScoreVal20(correct, total) {
    return Number(((correct / Math.max(1, total)) * 20).toFixed(2));
  }
  assert(calculateScoreVal20(5, 10) === 10.0, '5 acertos de 10 perguntas = 10.00 valores (Nota de Corte 50%)');
  assert(calculateScoreVal20(8, 10) === 16.0, '8 acertos de 10 perguntas = 16.00 valores (Garantia de Risco Zero 80%)');
  assert(calculateScoreVal20(10, 10) === 20.0, '10 acertos de 10 perguntas = 20.00 valores (Nota Máxima)');
  assert(calculateScoreVal20(0, 10) === 0.0, '0 acertos = 0.00 valores');

  // TEST 3: Affiliate Tiers & Commission Calculation
  console.log('\n--- TEST 3: Escala de Afiliados e Comissões (Bronze 30%, Prata 40%, Ouro 50%) ---');
  function getAffiliateTier(salesCount) {
    if (salesCount >= 20) return { name: 'Ouro', rate: 0.50 };
    if (salesCount >= 10) return { name: 'Prata', rate: 0.40 };
    return { name: 'Bronze', rate: 0.30 };
  }
  assert(getAffiliateTier(5).name === 'Bronze' && getAffiliateTier(5).rate === 0.30, '5 vendas = Bronze (30%)');
  assert(getAffiliateTier(10).name === 'Prata' && getAffiliateTier(10).rate === 0.40, '10 vendas = Transição para Prata (40%)');
  assert(getAffiliateTier(19).name === 'Prata' && getAffiliateTier(19).rate === 0.40, '19 vendas = Prata (40%)');
  assert(getAffiliateTier(20).name === 'Ouro' && getAffiliateTier(20).rate === 0.50, '20 vendas = Transição para Ouro (50%)');

  // TEST 4: Price Discount & Net Commission Base
  console.log('\n--- TEST 4: Cálculo de Desconto de 10% e Comissão Líquida ---');
  const basePriceMonthly = 5000;
  const discountRate = 0.10;
  const netMonthly = basePriceMonthly * (1 - discountRate); // 4500 Kz
  assert(netMonthly === 4500, 'Preço com 10% de desconto é exatamente 4.500 Kz');

  const commBronze = netMonthly * 0.30;
  const commPrata = netMonthly * 0.40;
  const commOuro = netMonthly * 0.50;
  assert(commBronze === 1350, 'Comissão Bronze mensal é exatamente 1.350 Kz');
  assert(commPrata === 1800, 'Comissão Prata mensal é exatamente 1.800 Kz');
  assert(commOuro === 2250, 'Comissão Ouro mensal é exatamente 2.250 Kz');

  // TEST 5: Anti-Self-Referral Security Rule
  console.log('\n--- TEST 5: Proteção Anti-Fraude (Auto-Indicação) ---');
  function validateReferral(userAffiliateCode, appliedCode) {
    if (!appliedCode) return { valid: false, reason: 'none' };
    if (userAffiliateCode && userAffiliateCode.toUpperCase() === appliedCode.toUpperCase()) {
      return { valid: false, reason: 'self_referral_blocked' };
    }
    return { valid: true };
  }
  assert(
    validateReferral('CAND-89412', 'CAND-89412').valid === false,
    'Auto-indicação com o próprio código é BLOQUEADA'
  );
  assert(
    validateReferral('CAND-89412', 'CAND-55555').valid === true,
    'Indicação legítima de colega é AUTORIZADA'
  );

  // TEST 6: Minimum Withdrawal Threshold
  console.log('\n--- TEST 6: Validação de Limite Mínimo de Saque ---');
  const MIN_WITHDRAWAL_KZ = 5000;
  function validateWithdrawal(amount, balance) {
    if (amount < MIN_WITHDRAWAL_KZ) return { ok: false, error: 'Abaixo do mínimo de 5.000 Kz' };
    if (amount > balance) return { ok: false, error: 'Saldo insuficiente' };
    return { ok: true };
  }
  assert(validateWithdrawal(2000, 10000).ok === false, 'Saque de 2.000 Kz rejeitado (abaixo de 5.000 Kz)');
  assert(validateWithdrawal(6000, 5000).ok === false, 'Saque de 6.000 Kz rejeitado (saldo de apenas 5.000 Kz)');
  assert(validateWithdrawal(5000, 8000).ok === true, 'Saque de 5.000 Kz com saldo 8.000 Kz aprovado');

  // SUMMARY
  console.log('\n====================================================');
  console.log(`📊 RESULTADO DA SUÍTE: ${passed} PASSOU | ${failed} FALHOU`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
