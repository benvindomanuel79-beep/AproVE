import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Share2,
  Copy,
  Check,
  Coins,
  TrendingUp,
  Users,
  MousePointerClick,
  Sparkles,
  ArrowDownToLine,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const AffiliateDashboard: React.FC = () => {
  const { affiliateStats, currentUser, params, requestWithdrawal, withdrawals } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Withdrawal form
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(params.minWithdrawalKz);
  const [withdrawMethod, setWithdrawMethod] = useState<'Multicaixa Express' | 'IBAN'>('Multicaixa Express');
  const [accountDetails, setAccountDetails] = useState<string>(currentUser.whatsapp);
  const [withdrawFeedback, setWithdrawFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const referralLink = `https://aprove.ao/?ref=${currentUser.affiliateCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentUser.affiliateCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareWhatsapp = () => {
    const text = encodeURI(
      `Olá! Estou a preparar-me para o Concurso do MININT com o AproVE. Consegues consultar as listas oficiais de admitidos, o dia da tua prova e fazer simulados reais com IA. Acede pelo meu link de convidado para ganhares 10% DE DESCONTO IMEDIATO: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleSubmitWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const res = requestWithdrawal(withdrawAmount, withdrawMethod, accountDetails);
    setWithdrawFeedback(res);
    if (res.success) {
      setTimeout(() => {
        setShowWithdrawModal(false);
        setWithdrawFeedback(null);
      }, 2500);
    }
  };

  const goldProgress = Math.min(
    100,
    Math.round((affiliateStats.sales / params.affiliateGoldThreshold) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                Módulo C · Recomendação Viral & Monetização
              </span>
              <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Sistema 50/50
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-amber-600" />
              <span>Painel do Promotor & Programa de Afiliados</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Partilhe o seu link único com outros candidatos em grupos do WhatsApp e Facebook. Ganhe 40% a 50% de comissão direta em Kwanza por cada assinatura confirmada.
            </p>
          </div>

          <button
            onClick={() => setShowWithdrawModal(true)}
            className="self-start md:self-auto px-4 py-2 text-xs font-bold text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            style={{ backgroundColor: params.primaryColor }}
          >
            <ArrowDownToLine className="w-4 h-4" />
            <span>Solicitar Saque ({affiliateStats.balanceKz.toLocaleString()} Kz)</span>
          </button>
        </div>
      </div>

      {/* Share Links Card */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              O Seu Identificador Exclusivo · Com Bónus 10% OFF
            </span>
            <h4 className="text-xl font-bold">O Seu Link de Indicação e Código de Afiliado</h4>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              <strong>Bónus de Conversão Viral:</strong> Quem compra através do seu link ganha <strong className="text-amber-300">10% de desconto imediato</strong> na assinatura (4.500 Kz em vez de 5.000 Kz, ou 22.500 Kz em vez de 25.000 Kz).
            </p>
            <p className="text-xs text-emerald-300 font-semibold max-w-xl">
              ✓ A sua percentagem de comissão (40% a 50%) permanece 100% INTACTA, calculada integralmente sobre o valor cheio! Você continua a ganhar 2.000 Kz a 12.500 Kz por venda.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleShareWhatsapp}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Partilhar no WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Link and Code inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          <div className="md:col-span-2 flex items-center bg-white/10 rounded-lg p-1.5 border border-white/20">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="bg-transparent text-xs text-white px-3 w-full font-mono focus:outline-hidden"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-md flex items-center gap-1 shrink-0 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
          </div>

          <div className="flex items-center bg-white/10 rounded-lg p-1.5 border border-white/20">
            <span className="text-xs text-slate-300 px-2 font-medium">Código:</span>
            <input
              type="text"
              readOnly
              value={currentUser.affiliateCode}
              className="bg-transparent text-xs font-bold text-amber-400 w-full font-mono focus:outline-hidden"
            />
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-md flex items-center gap-1 shrink-0 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'OK' : 'Copiar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Funnel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Cliques no Link</span>
            <MousePointerClick className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{affiliateStats.clicks}</div>
          <span className="text-[11px] text-slate-400">Tráfego direcionado</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Cadastros Gratuitos</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{affiliateStats.signups}</div>
          <span className="text-[11px] text-emerald-700 font-medium">
            {((affiliateStats.signups / affiliateStats.clicks) * 100).toFixed(1)}% taxa de registo
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Vendas Convertidas</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{affiliateStats.sales}</div>
          <span className="text-[11px] text-amber-700 font-medium">
            {affiliateStats.conversionRate}% conversão em assinaturas
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Saldo Disponível</span>
            <ArrowDownToLine className="w-4 h-4 text-blue-800" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {affiliateStats.balanceKz.toLocaleString()} Kz
          </div>
          <span className="text-[11px] text-slate-400">
            Total ganho: {affiliateStats.totalEarnedKz.toLocaleString()} Kz
          </span>
        </div>
      </div>

      {/* Gamification Tier Progression Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Nível Actual de Comissão
            </span>
            <h4 className="text-base font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{affiliateStats.currentTier}</span>
            </h4>
          </div>

          <div className="text-xs text-slate-600">
            Meta Nível Ouro: <strong>{params.affiliateGoldThreshold} indicações pagas</strong> (50% de comissão directa)
          </div>
        </div>

        <div className="mt-5">
          <div className="flex justify-between text-xs font-medium text-slate-600 mb-2">
            <span>Progresso: {affiliateStats.sales} de {params.affiliateGoldThreshold} vendas</span>
            <span>{goldProgress}% Concluído</span>
          </div>

          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
              style={{ width: `${goldProgress}%` }}
            />
          </div>

          <p className="text-xs text-slate-500 mt-3">
            Faltam apenas <strong>{affiliateStats.salesToGold} indicações pagas</strong> para você ser promovido a <strong>Nível Ouro</strong> e passar a ganhar metade de todo o valor arrecadado (50% directos em todas as novas compras).
          </p>
        </div>
      </div>

      {/* Recent Withdrawals Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Histórico de Levantamentos e Transferências
          </span>
          <span className="text-xs text-slate-500">Mínimo de saque: {params.minWithdrawalKz.toLocaleString()} Kz</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Identificador</th>
                <th className="py-2.5 px-4 font-semibold">Data / Hora</th>
                <th className="py-2.5 px-4 font-semibold">Montante</th>
                <th className="py-2.5 px-4 font-semibold">Canal de Liquidação</th>
                <th className="py-2.5 px-4 font-semibold">Conta / Telefone</th>
                <th className="py-2.5 px-4 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {withdrawals.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{req.id}</td>
                  <td className="py-3 px-4 text-slate-600">{req.requestedAt}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    {req.amountKz.toLocaleString()} Kz
                  </td>
                  <td className="py-3 px-4">{req.method}</td>
                  <td className="py-3 px-4 text-slate-600 truncate max-w-xs">{req.accountDetails}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        req.status === 'Aprovado'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.status === 'Pendente'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Solicitar Levantamento de Comissão</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitWithdrawal} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Montante a Levantar (Saldo Disponível: {affiliateStats.balanceKz.toLocaleString()} Kz)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={params.minWithdrawalKz}
                    max={affiliateStats.balanceKz}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900 font-mono font-bold"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">Kz</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Mínimo obrigatório: {params.minWithdrawalKz.toLocaleString()} Kz
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Método de Liquidação
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('Multicaixa Express')}
                    className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      withdrawMethod === 'Multicaixa Express'
                        ? 'border-blue-900 bg-blue-50 text-blue-900'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    Multicaixa Express
                  </button>
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('IBAN')}
                    className={`py-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      withdrawMethod === 'IBAN'
                        ? 'border-blue-900 bg-blue-50 text-blue-900'
                        : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    IBAN Angolano
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {withdrawMethod === 'Multicaixa Express'
                    ? 'Número de Telemóvel Associado ao Express'
                    : 'IBAN Completo (Padrão AO06... 25 dígitos)'}
                </label>
                <input
                  type="text"
                  required
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder={
                    withdrawMethod === 'Multicaixa Express'
                      ? 'Ex: +244 923 884 102'
                      : 'AO06 0040 0000 1234 5678 9012 3'
                  }
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900"
                />
              </div>

              {withdrawFeedback && (
                <div
                  className={`p-3 rounded-lg text-xs leading-relaxed ${
                    withdrawFeedback.success
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {withdrawFeedback.message}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Confirmar Levantamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
