import React, { useState } from 'react';
import {
  Shield,
  X,
  FileText,
  Lock,
  CreditCard,
  Share2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export type LegalTabType = 'termos' | 'privacidade' | 'pagamentos' | 'afiliados' | 'independencia';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: LegalTabType;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'termos',
}) => {
  const [activeTab, setActiveTab] = useState<LegalTabType>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#10233F] text-amber-400 flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Termos, Políticas & Conformidade Legal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AproVE · Mais preparação. Mais confiança. (República de Angola)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('independencia')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'independencia'
                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Independência Institucional</span>
          </button>

          <button
            onClick={() => setActiveTab('termos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'termos'
                ? 'bg-[#10233F] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Termos de Uso</span>
          </button>

          <button
            onClick={() => setActiveTab('privacidade')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'privacidade'
                ? 'bg-[#10233F] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacidade & Dados</span>
          </button>

          <button
            onClick={() => setActiveTab('pagamentos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'pagamentos'
                ? 'bg-[#10233F] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pagamentos & Reembolsos</span>
          </button>

          <button
            onClick={() => setActiveTab('afiliados')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'afiliados'
                ? 'bg-[#10233F] text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Regulamento de Afiliados</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
          {activeTab === 'independencia' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Declaração Obrigatória de Independência Institucional</span>
                </div>
                <p>
                  A plataforma <strong>AproVE</strong> é uma solução tecnológica e pedagógica estritamente privada e independente. <strong>Não é</strong> uma entidade governamental, nem actua em representação do <strong>Ministério do Interior (MININT)</strong>, do <strong>Comando Geral da Polícia Nacional (PNA)</strong>, do <strong>Serviço de Investigação Criminal (SIC)</strong>, do <strong>Serviço de Migração e Estrangeiros (SME)</strong> ou do <strong>Serviço de Protecção Civil e Bombeiros (SPCB)</strong> da República de Angola.
                </p>
              </div>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. Finalidade Educacional</h4>
              <p>
                A AproVE tem como único objectivo apoiar candidatos em preparação para exames através de simulados digitais, testes psicotécnicos, exercícios de lógica e resumos de matérias com base em fontes públicas (como a Constituição da República de Angola de 2010 e o Diário da República).
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. Fontes Oficiais e Responsabilidade</h4>
              <p>
                As informações oficiais sobre editais, prazos de candidaturas, cronogramas alfabéticos de provas e listas de admitidos dependem exclusivamente das comissões oficiais de cada concurso. Os candidatos devem sempre validar qualquer dado no portal governamental oficial:{' '}
                <a
                  href="https://candidaturas.minint.ao"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                >
                  candidaturas.minint.ao <ExternalLink className="w-3 h-3" />
                </a>.
              </p>
            </div>
          )}

          {activeTab === 'termos' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. Aceitação dos Termos</h4>
              <p>
                Ao criar uma conta ou aceder à plataforma AproVE, o utilizador concorda com os presentes Termos de Serviço. A utilização destina-se exclusivamente a preparação pessoal e não comercial.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. Uso da Conta e Segurança</h4>
              <p>
                Cada conta é individual e intransmissível. A partilha de credenciais ou a realização de simulados por terceiros com recurso à mesma conta constitui violação destes termos e pode resultar na suspensão do acesso.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">3. Direitos de Propriedade Intelectual</h4>
              <p>
                Todo o código, software, organização de conteúdos, algoritmos de correcção e interfaces da AproVE são propriedade exclusiva da plataforma. As normas legais citadas (CRA 2010, Leis da Função Pública) pertencem ao domínio público angolano e são referenciadas com fins pedagógicos.
              </p>
            </div>
          )}

          {activeTab === 'privacidade' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. Dados Recolhidos</h4>
              <p>
                A AproVE recolhe apenas as informações estritamente necessárias para a gestão do percurso de estudos do candidato: nome, endereço de e-mail (validado via código OTP), número de telefone para suporte/afiliados e província de residência em Angola.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. Segurança e Não Partilha de Dados</h4>
              <p>
                Os seus dados são protegidos por encriptação em trânsito (HTTPS/TLS) e regras estritas de Row Level Security (RLS) na base de dados PostgreSQL/Supabase. Os seus dados <strong>nunca são vendidos</strong> nem partilhados com entidades terceiras com intuitos publicitários.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">3. Direito de Eliminação de Conta</h4>
              <p>
                O utilizador tem o direito de solicitar a qualquer momento a eliminação integral da sua conta e do histórico de simulados associados, bastando enviar pedido para suporte@aprove.ao.
              </p>
            </div>
          )}

          {activeTab === 'pagamentos' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. Planos e Preços Transparentes</h4>
              <p>
                A plataforma oferece o Plano Gratuito (0 Kz com 1 simulado diário), o Plano Mensal (5.000 Kz/mês com acesso total) e o Plano Vitalício (25.000 Kz, pagamento único).
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. Pagamentos por Multicaixa Express e IBAN</h4>
              <p>
                Os pagamentos manuais por Multicaixa Express e IBAN são verificados e aprovados pela equipa de suporte em até 24 horas úteis. O envio de comprovativo fraudulento ou falso anula imediatamente o pedido e bloqueia o utilizador.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">3. Definição do Acesso Vitalício</h4>
              <p>
                O Plano Vitalício confere direito a todas as actualizações e cadernos de preparação da plataforma enquanto o serviço estiver operacional, sem cobranças adicionais futuras. Não representa garantia de fornecimento por terceiros fora do controlo da plataforma.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">4. Política de Reembolso</h4>
              <p>
                Caso o candidato verifique qualquer falha técnica substancial comprovada que impossibilite o acesso aos simuladores e esta não seja resolvida em até 48 horas, assiste-lhe o direito ao reembolso integral do montante pago.
              </p>
            </div>
          )}

          {activeTab === 'afiliados' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">1. Estrutura de Comissões e Desconto</h4>
              <p>
                Cada afiliado recebe um código/link que atribui <strong>10% de desconto imediato</strong> aos candidatos convidados. As comissões são escalonadas sobre o valor efectivamente recebido:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Nível Bronze (1 a 9 compras confirmadas):</strong> 30% de comissão.</li>
                <li><strong>Nível Prata (10 a 19 compras confirmadas):</strong> 40% de comissão.</li>
                <li><strong>Nível Ouro (20 ou mais compras confirmadas):</strong> 50% de comissão.</li>
              </ul>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">2. Condições de Pagamento</h4>
              <p>
                O levantamento mínimo é de <strong>5.000 Kz</strong>. O pagamento é efectuado via Multicaixa Express ou transferência bancária para o titular da conta registada.
              </p>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm">3. Política Rigorosa Antifraude</h4>
              <p>
                É expressamente proibida a auto-referência (criar contas fictícias para receber comissão sobre a própria compra), publicidade enganosa com promessas de "vagas garantidas no MININT", ou envio de spam. A violação implica anulação de comissões e exclusão imediata do programa.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            AproVE Angola · Luanda · suporte@aprove.ao
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#10233F] hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
          >
            Compreendi e Aceito
          </button>
        </div>
      </div>
    </div>
  );
};
