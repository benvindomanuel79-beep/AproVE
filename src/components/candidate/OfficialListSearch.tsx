import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AdmittedCandidate, Province } from '../../types';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  Printer,
  Share2,
  FileText,
  Filter
} from 'lucide-react';

export const OfficialListSearch: React.FC = () => {
  const { admittedCandidates, currentUser, params } = useApp();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [provinceFilter, setProvinceFilter] = useState<string>('Todas');
  const [selectedCandidate, setSelectedCandidate] = useState<AdmittedCandidate | null>(null);

  const filteredCandidates = useMemo(() => {
    return admittedCandidates.filter((cand) => {
      const matchSearch =
        cand.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cand.biNumberMasked.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cand.examCenter.toLowerCase().includes(searchTerm.toLowerCase());

      const matchProvince =
        provinceFilter === 'Todas' || cand.province === provinceFilter;

      return matchSearch && matchProvince;
    });
  }, [admittedCandidates, searchTerm, provinceFilter]);

  // Quick fill with current user name
  const handleUseMyName = () => {
    setSearchTerm(currentUser.name.split(' ')[0]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Módulo A · Dados Oficiais Integrados
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Motor de Busca em Listas Oficiais do MININT
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Consulte instantaneamente a base de dados sincronizada a partir das listas definitivas de admitidos (candidaturas.minint.ao).
            </p>
          </div>
          <button
            onClick={handleUseMyName}
            className="self-start md:self-auto text-xs font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors"
          >
            Pesquisar o Meu Nome ({currentUser.name.split(' ')[0]})
          </button>
        </div>

        {/* Search Bar & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o nome completo, apelido ou parte do nº do Bilhete de Identidade..."
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900 focus:bg-white transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-900 bg-white"
            >
              <option value="Todas">Todas as Províncias</option>
              <option value="Luanda">Luanda</option>
              <option value="Benguela">Benguela</option>
              <option value="Huambo">Huambo</option>
              <option value="Huíla">Huíla</option>
              <option value="Cabinda">Cabinda</option>
              <option value="Cuanza Sul">Cuanza Sul</option>
              <option value="Uíge">Uíge</option>
              <option value="Lunda Norte">Lunda Norte</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Resultados encontrados: <strong className="text-slate-900">{filteredCandidates.length}</strong></span>
            <span>Indexação: <strong className="text-emerald-700">candidaturas.minint.ao</strong></span>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">Nenhum candidato encontrado com os termos inseridos</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Verifique se o nome está grafado com a mesma acentuação do Bilhete de Identidade, ou pesquise apenas pelo primeiro nome ou província.
              </p>
            </div>
          ) : (
            filteredCandidates.map((cand) => (
              <div
                key={cand.id}
                onClick={() => setSelectedCandidate(cand)}
                className={`p-4 rounded-xl border bg-white cursor-pointer transition-all hover:shadow-sm ${
                  selectedCandidate?.id === cand.id
                    ? 'border-blue-900 ring-2 ring-blue-900/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{cand.fullName}</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        BI: {cand.biNumberMasked}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                      <span className="font-semibold text-slate-700">{cand.province}</span>
                      <span>·</span>
                      <span className="text-blue-900 font-medium">{cand.careerTrack}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{cand.examCenter}</span>
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Admitido</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Candidate Detail Card */}
        <div>
          {selectedCandidate ? (
            <div className="bg-white rounded-xl border-2 border-blue-900/30 p-5 shadow-sm sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider">
                  Ficha Oficial de Exame
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedCandidate.status}
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-base font-bold text-slate-900">{selectedCandidate.fullName}</h3>
                <p className="text-xs font-mono text-slate-500 mt-0.5">BI: {selectedCandidate.biNumberMasked}</p>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Órgão / Carreira</span>
                  <span className="font-semibold text-slate-800">{selectedCandidate.careerTrack}</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Centro de Exame</span>
                  <span className="font-semibold text-slate-800">{selectedCandidate.examCenter}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Sala Atribuída</span>
                    <span className="font-bold text-blue-900">{selectedCandidate.examRoom}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Província</span>
                    <span className="font-semibold text-slate-800">{selectedCandidate.province}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Data de Prova</span>
                    <span className="font-bold text-slate-900">{selectedCandidate.examDate}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Horário</span>
                    <span className="font-bold text-slate-900">{selectedCandidate.shift}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => alert(`Comprovativo gerado para ${selectedCandidate.fullName}. Apresente este talão no dia ${selectedCandidate.examDate}.`)}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Talão</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-medium">
                Selecione um candidato na lista à esquerda para carregar a ficha oficial com sala e horário.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
