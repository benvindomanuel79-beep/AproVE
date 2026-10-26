import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Check,
  Crown,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building,
  Sparkles,
  Tag,
  ArrowRight,
  Gift,
  X
} from 'lucide-react';

export const PaywallModal: React.FC = () => {
  const {
    isPaywallOpen,
    setIsPaywallOpen,
    params,
    subscribeUser,
    hasReferralDiscount,
    appliedReferralCode,
    applyReferralCode,
    removeReferralCode,
    getPlanPrice,
    triggerStripePayment,
    isProcessingStripe,
  } = useApp();

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'lifetime'>('lifetime');
  const [paymentMethod, setPaymentMethod] = useState<'express' | 'reference' | 'transfer' | 'stripe'>('stripe');
  const [phoneNumber, setPhoneNumber] = useState('+244 923 884 102');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stripeMessage, setStripeMessage] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  if (!isPaywallOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyReferralCode(couponInput);
    setCouponFeedback(res.message);
    setCouponInput('');
  };

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'stripe') {
      const result = await triggerStripePayment(selectedPlan);
      setStripeMessage(result.message);
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      subscribeUser(selectedPlan);
      setIsProcessing(false);
    }, 1200);
  };

  const priceDetails = getPlanPrice(selectedPlan);

  const monthlyPrices = getPlanPrice('monthly');
  const lifetimePrices = getPlanPrice('lifetime');

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Ativação do Acesso Premium ao {params.appName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acesso irrestrito ao gerador com IA, simulador cronometrado e à Garantia de Risco Zero.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPaywallOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-base p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* 10% Discount Banner */}
        {hasReferralDiscount ? (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300">
              <Gift className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                <strong>10% de Desconto de Afiliado Aplicado!</strong> (Código:{' '}
                <span className="font-mono font-bold text-emerald-950 dark:text-emerald-200">{appliedReferralCode}</span>). A sua comissão de afiliado mantém-se 100% intacta!
              </span>
            </div>
            <button
              onClick={removeReferralCode}
              title="Remover código"
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tem um código de convite / link de afiliado? (Ex: CAND-89412)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg uppercase font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Aplicar 10% OFF
            </button>
          </form>
        )}

        {couponFeedback && (
          <p className="text-[11px] text-emerald-700 font-medium mt-1.5">{couponFeedback}</p>
        )}

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          {/* Monthly Plan */}
          <div
            onClick={() => setSelectedPlan('monthly')}
            className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
              selectedPlan === 'monthly'
                ? 'border-blue-900 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 shadow-xs'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Passe 30 Dias
              </span>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'monthly' ? 'border-blue-900 bg-blue-900 dark:border-blue-500 dark:bg-blue-500' : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {selectedPlan === 'monthly' && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {monthlyPrices.finalPrice.toLocaleString()} Kz
              </span>
              {monthlyPrices.hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  {monthlyPrices.originalPrice.toLocaleString()} Kz
                </span>
              )}
            </div>

            {monthlyPrices.hasDiscount ? (
              <span className="inline-block text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded mt-1 border border-emerald-200 dark:border-emerald-800">
                Poupou {monthlyPrices.discountKz.toLocaleString()} Kz (10% OFF Afiliado)
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">Acesso por 30 dias corridos</span>
            )}

            <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Simuladores com cronómetro ilimitados</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Termómetro de Aprovação preditivo</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Ranking Provincial anónimo</span>
              </li>
            </ul>
          </div>

          {/* Lifetime Plan */}
          <div
            onClick={() => setSelectedPlan('lifetime')}
            className={`p-5 rounded-xl border-2 cursor-pointer relative transition-all ${
              selectedPlan === 'lifetime'
                ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/30 shadow-md ring-2 ring-amber-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
            }`}
          >
            <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-linear-to-r from-amber-500 to-amber-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
              Mais Recomendado
            </div>

            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                Vitalício até à Nomeação
              </span>
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === 'lifetime' ? 'border-amber-600 bg-amber-600' : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {selectedPlan === 'lifetime' && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>

            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
                {lifetimePrices.finalPrice.toLocaleString()} Kz
              </span>
              {lifetimePrices.hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  {lifetimePrices.originalPrice.toLocaleString()} Kz
                </span>
              )}
            </div>

            {lifetimePrices.hasDiscount ? (
              <span className="inline-block text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded mt-1 border border-emerald-200 dark:border-emerald-800">
                Poupou {lifetimePrices.discountKz.toLocaleString()} Kz (10% OFF Afiliado)
              </span>
            ) : (
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">Sem renovações ou mensalidades</span>
            )}

            <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Tudo do plano mensal incluído</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Geração ilimitada de questões com IA</span>
              </li>
              <li className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Garantia de Risco Zero 80%+ (Reembolso)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Garantia de Risco Zero Stamp */}
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-300 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="text-amber-950 font-bold block mb-0.5">
              Garantia de Risco Zero 80%+ com Protecção Integral do Afiliado:
            </strong>
            <p className="text-amber-900 leading-relaxed text-[11px]">
              Se completar os simulados com média &ge; 80% e for reprovado no concurso oficial do MININT, reembolsamos 100% do valor pago em 48h úteis via Multicaixa Express. Além disso, a comissão do seu afiliado de referência é preservada na totalidade sobre o valor nominal.
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-800 mb-2">
            Escolha o Método de Pagamento (Angola):
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('stripe')}
              className={`p-2.5 rounded-lg border text-center text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                paymentMethod === 'stripe'
                  ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-300 ring-2 ring-indigo-500/30'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Stripe (Cartão)</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('express')}
              className={`p-2.5 rounded-lg border text-center text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                paymentMethod === 'express'
                  ? 'border-blue-900 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Smartphone className="w-4 h-4 text-blue-900 dark:text-blue-400" />
              <span>Multicaixa Express</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('reference')}
              className={`p-2.5 rounded-lg border text-center text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                paymentMethod === 'reference'
                  ? 'border-blue-900 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Referência ATM</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('transfer')}
              className={`p-2.5 rounded-lg border text-center text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                paymentMethod === 'transfer'
                  ? 'border-blue-900 dark:border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Building className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>Transferência IBAN</span>
            </button>
          </div>

          {paymentMethod === 'stripe' && (
            <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Stripe API • Liberação Automática por Webhook
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-200">
                  {selectedPlan === 'lifetime' ? '$14.00 USD' : '$6.00 USD'}
                </span>
              </div>
              <p className="text-[11px] text-indigo-900/80 dark:text-indigo-300 leading-relaxed">
                Cartões Visa, Mastercard ou American Express internacionais. O webhook oficial do Stripe (<code className="font-mono bg-indigo-100 dark:bg-indigo-900/60 px-1 py-0.5 rounded">/api/stripe/webhook</code>) libera o seu acesso VIP instantaneamente após a aprovação da operadora.
              </p>
              {stripeMessage && (
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950 border border-emerald-400 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{stripeMessage}</span>
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'express' && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <label className="block font-medium text-slate-700 dark:text-slate-300">
                Número de Telemóvel para autorização Multicaixa Express:
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+244 923 884 102"
                className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          )}

          {paymentMethod === 'reference' && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Entidade:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">00192 (GPO AproVE)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Referência:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">849 102 431</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Montante Final a Pagar:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{priceDetails.finalPrice.toLocaleString()} Kz</span>
              </div>
            </div>
          )}

          {paymentMethod === 'transfer' && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Banco:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-sans">Banco BAI / BFA Angola</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">IBAN:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">AO06 0040 0000 8821 9012 3012 8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-sans">Titular:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-sans">AproVE Tecnologia Lda.</span>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400">Valor Final com Desconto:</span>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">
              {priceDetails.finalPrice.toLocaleString()} Kz
            </div>
          </div>

          <button
            onClick={handleCompletePayment}
            disabled={isProcessing || isProcessingStripe}
            className="px-6 py-2.5 rounded-xl font-bold text-white text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 hover:opacity-95 cursor-pointer"
            style={{ backgroundColor: paymentMethod === 'stripe' ? '#4f46e5' : params.secondaryColor }}
          >
            {isProcessing || isProcessingStripe ? (
              <span>A Processar com a Stripe API...</span>
            ) : paymentMethod === 'stripe' ? (
              <>
                <span>Pagar & Ativar via Stripe Webhook</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Confirmar e Activar Acesso</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
