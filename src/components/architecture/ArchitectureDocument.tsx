import React, { useState } from 'react';
import { ARCHITECTURE_SPECIFICATION_MARKDOWN } from '../../docs/architectureContent';
import { Copy, Check, FileCode, BookOpen, Layers, Terminal, Sparkles, Download } from 'lucide-react';

export const ArchitectureDocument: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ARCHITECTURE_SPECIFICATION_MARKDOWN);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([ARCHITECTURE_SPECIFICATION_MARKDOWN], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ESPECIFICACAO_TECNICA_ARQUITETURA_APROVE_MININT.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Documento Oficial de Engenharia de Software
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-800 text-white font-mono">
              v1.0.0-PROD
            </span>
          </div>
          <h2 className="text-xl font-bold mt-1">
            Caderno de Especificação Técnica & Arquitetura de Software
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Clean Architecture, MVC Modular, DDL Relacional, Scraper Automático a cada 30 min, Pipeline IA Extratora e Prompt Engineering.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado para Área de Transferência!' : 'Copiar Markdown Completo'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descarregar .MD</span>
          </button>
        </div>
      </div>

      {/* Structured Document Content with Clean Typography */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-10 shadow-xs prose max-w-none text-slate-800">
        <div className="border-b border-slate-200 pb-6 mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-2">
            <span>PROG: APROVE_ANGOLA</span>
            <span>·</span>
            <span>TARGET: MININT_AO</span>
            <span>·</span>
            <span>FRAMEWORK: CLEAN_ARCHITECTURE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Especificação Técnica & Escopo de Engenharia de Software
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Plataforma móvel e web de preparação para concursos públicos em Angola baseada nas normas oficiais do Ministério do Interior (MININT - candidaturas.minint.ao).
          </p>
        </div>

        {/* Section 1 */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-slate-900 text-white text-xs flex items-center justify-center font-mono">1</span>
            <span>Identidade Visual, Sistema de Design & Parametrização Global</span>
          </h2>
          <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p>
              A identidade visual segue a sobriedade institucional da segurança e ordem pública da República de Angola, inspirada na cromática do portal oficial <code>candidaturas.minint.ao</code>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-xs font-bold text-slate-500 block">60% Tela Neutra</span>
                <span className="text-sm font-bold text-slate-900">#FFFFFF / #F8FAFC</span>
                <p className="text-xs text-slate-500 mt-1">Ambiente focado em leitura prolongada e resolução de testes sem fadiga ocular.</p>
              </div>
              <div className="p-3 rounded-lg border border-blue-900/30 bg-blue-950 text-white">
                <span className="text-xs font-bold text-blue-200 block">30% Superfície Estrutural</span>
                <span className="text-sm font-bold text-white font-mono">#0A2540 (Azul MININT)</span>
                <p className="text-xs text-slate-300 mt-1">Solenidade institucional, cabeçalhos, cartões de autoridade e cronogramas.</p>
              </div>
              <div className="p-3 rounded-lg border border-amber-300 bg-amber-50">
                <span className="text-xs font-bold text-amber-700 block">10% Acento & Acção Primária</span>
                <span className="text-sm font-bold text-amber-900 font-mono">#D97706 / #F59E0B</span>
                <p className="text-xs text-slate-600 mt-1">Botões de ativação de paywall, selo de risco zero e destaques cronológicos.</p>
              </div>
            </div>
            <p>
              <strong>Tipografia de Engenharia:</strong> Par de fontes <em>Plus Jakarta Sans</em> (Display & Corpo) combinado com <em>JetBrains Mono</em> com recurso obrigatório a <code>font-variant-numeric: tabular-nums</code> para que os números de Bilhete de Identidade (BI), tempos do cronómetro e notas fiquem milimetricamente alinhados na vertical.
            </p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-slate-900 text-white text-xs flex items-center justify-center font-mono">2</span>
            <span>Fluxos do Utilizador Frontend (Arquitetura por Módulos)</span>
          </h2>
          <div className="mt-4 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Módulo A: Atração e Informação (100% Gratuito)</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                <li><strong>Onboarding de Alta Conversão:</strong> Captura instantânea de Nome, WhatsApp (+244), Província (18 províncias) e Carreira Alvo (PNA, SIC, SME, SPCB, Serviços Prisionais).</li>
                <li><strong>Central de Notificações Inteligente:</strong> Feed em tempo real alimentado a cada 30 min pelo Web Scraper com despachos do Diário da República e avisos contra fraude.</li>
                <li><strong>Calendário Dinâmico por Letra:</strong> Escalonamento oficial por letra inicial do primeiro nome (ex: 26 Out = A, B, C; 27 Out = D, E, F) com turno oficial e lembrete automático no WhatsApp.</li>
                <li><strong>Motor de Busca em Listas Oficiais:</strong> Consulta sub-segundo em mais de 500.000 candidatos indexados, exibindo BI mascarado, centro de prova e sala de exame.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Módulo B: Preparação Activa (Paywall Premium)</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                <li><strong>Simulador de Provas Digitais:</strong> Cronómetro regressivo de 45 minutos idêntico ao exame presencial, questões psicotécnicas e de conhecimentos gerais/legislação angolana, folha de resposta digital e correcção comentada imediata.</li>
                <li><strong>Termómetro de Aprovação Preditivo:</strong> Algoritmo com ponderação exponencial para simulados recentes, desvio padrão de consistência e diagnóstico de risco de eliminação.</li>
                <li><strong>Ranking Provincial Anónimo:</strong> Classificação por mérito sem exposição pública de dados sensíveis (pseudónimos: <code>Candidato_LDA_4921</code>).</li>
                <li><strong>Guia de TAF & Saúde:</strong> Calculador de IMC oficial (faixa 18.5 - 27.5), tabela de tempos para os 100m, abdominais, flexões e teste de Cooper de 2.400 metros.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Módulo C: Afiliados & Recomendação Viral (Sistema 50/50)</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
                <li><strong>Painel do Promotor:</strong> Link único parametrizado, código curto para WhatsApp e funil transparente de cliques, cadastros e vendas.</li>
                <li><strong>Regra de Comissão Escalonada:</strong> 40% de comissão direta no Nível Prata; elevação automática para 50% de comissão direta (Nível Ouro) ao atingir 20 indicações pagas.</li>
                <li><strong>Fluxo de Saque:</strong> Liquidação em Kwanzas via Multicaixa Express ou IBAN angolano (AO06) com validação de limite mínimo de 5.000 Kz e auditoria anti-auto-indicação.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-slate-900 text-white text-xs flex items-center justify-center font-mono">3</span>
            <span>Arquitetura de Bastidores e Automação (Backend & IA)</span>
          </h2>
          <div className="mt-4 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto">
              <p className="text-amber-400 font-bold mb-2">// Pipeline de Ingestão e Sincronização Automática a cada 30 min</p>
              <pre className="text-[11px] leading-relaxed">
{`1. Web Scraper Worker (Cron: */30 * * * *)
   ├── Pedido HTTP HEAD com ETag / If-Modified-Since
   ├── Hash SHA-256 sobre o DOM limpo de candidaturas.minint.ao
   └── Se Delta > 0:
       ├── Dispara Notificação Crítica via WebSocket
       └── Envia URL do PDF para a fila de processamento

2. IA Extratora de Listas PDF
   ├── Segmentação em chunks de 50 páginas (PyMuPDF / pdfplumber)
   ├── Fallback Multimodal Gemini OCR 300 DPI se PDF for digitalização física
   ├── Parser Regex NER para normalização do BI Angolano e Províncias
   └── BATCH INSERT ON CONFLICT DO UPDATE na tabela 'admitted_candidates'

3. Engine de Questões com Gemini 2.5
   ├── Geração estrita em JSON estruturado
   ├── Calibração com ortografia angolana e termos jurídicos (CRA, Lei 3/10)
   └── Armazenamento relacional com explicação para o gabarito`}
              </pre>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-slate-900 text-white text-xs flex items-center justify-center font-mono">4</span>
            <span>Modelo de Monetização, Paywall & "Garantia de Risco Zero"</span>
          </h2>
          <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p>
              O sistema adota um modelo Freemium de alta conversão. O candidato acessa gratuitamente o agendamento do calendário e a consulta de listas; ao desejar treinar nos simuladores cronometrados, depara-se com o paywall.
            </p>
            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-xs text-amber-950">
              <strong className="block text-sm font-bold mb-1">Cláusula Contratual da Garantia de Risco Zero:</strong>
              "Se o candidato subscrever o plano Vitalício (25.000 Kz), completar a esteira de simulados recomendados mantendo rendimento igual ou superior a 80%, e constar na lista definitiva como Não Aprovado no concurso real do MININT, a plataforma processa o reembolso integral de 100% do montante pago via Multicaixa Express em 48 horas úteis."
            </div>
          </div>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-200 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-slate-900 text-white text-xs flex items-center justify-center font-mono">5</span>
            <span>Escalabilidade Multi-Concurso & Admin Dashboard</span>
          </h2>
          <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p>
              O esquema de banco de dados do AproVE foi projetado para operar como uma plataforma multitenant de concursos públicos em Angola. Com apenas um registo na tabela de concursos, a mesma interface é utilizada para a Saúde (MINSA), Educação (MED), AGT e Tribunais.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono">
              <span className="text-slate-500 font-bold block mb-1">Entidades Principais (PostgreSQL Relacional):</span>
              <code>
                app_configurations | concursos | candidates | admitted_candidates | questions | exam_attempts | affiliate_accounts | withdrawal_requests | scraper_audit_logs
              </code>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
