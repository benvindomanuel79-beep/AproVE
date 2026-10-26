import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Award, Trophy, Medal, Filter, Shield, User } from 'lucide-react';
import { Province } from '../../types';

export const ProvincialRanking: React.FC = () => {
  const { ranking, currentUser, params } = useApp();
  const [selectedProvince, setSelectedProvince] = useState<string>('Todas');

  const filteredRanking = useMemo(() => {
    if (selectedProvince === 'Todas') return ranking;
    return ranking.filter((r) => r.province === selectedProvince);
  }, [ranking, selectedProvince]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs border border-amber-300">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs border border-slate-300">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs border border-amber-400">
          🥉
        </span>
      );
    }
    return (
      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
        {rank}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Módulo B · Gamificação & Mérito Competitivo
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Ranking Provincial Anónimo de Desempenho</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Compare o seu aproveitamento médio com os candidatos concorrentes da sua província. Todos os identificadores são ofuscados para salvaguarda de privacidade.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-900 font-medium"
            >
              <option value="Todas">Todas as Províncias (Nacional)</option>
              <option value="Luanda">Luanda</option>
              <option value="Huambo">Huambo</option>
              <option value="Benguela">Benguela</option>
              <option value="Huíla">Huíla</option>
              <option value="Cabinda">Cabinda</option>
              <option value="Cuanza Sul">Cuanza Sul</option>
              <option value="Uíge">Uíge</option>
              <option value="Malanje">Malanje</option>
              <option value="Namibe">Namibe</option>
            </select>
          </div>
        </div>
      </div>

      {/* Provincial Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Província Selecionada</span>
          <div className="text-lg font-bold text-slate-900 mt-0.5">{selectedProvince}</div>
          <span className="text-[11px] text-slate-400">Com base em provas oficiais</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Nota de Corte Estimada (Top 20%)</span>
          <div className="text-lg font-bold text-emerald-700 mt-0.5">82.0% (16.4 / 20)</div>
          <span className="text-[11px] text-slate-400">Patamar de segurança para nomeação</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">A Sua Província Registada</span>
          <div className="text-lg font-bold text-blue-900 mt-0.5">{currentUser.province}</div>
          <span className="text-[11px] text-slate-400">Carreira: {currentUser.careerTrack}</span>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Classificação Geral ({filteredRanking.length} candidatos no quadro de honra)
          </span>
          <span className="text-[11px] text-slate-500">Atualizado dinamicamente</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold w-16">Posição</th>
                <th className="py-3 px-4 font-semibold">Identificador Anónimo</th>
                <th className="py-3 px-4 font-semibold">Província</th>
                <th className="py-3 px-4 font-semibold">Média Geral</th>
                <th className="py-3 px-4 font-semibold">Escala 0-20</th>
                <th className="py-3 px-4 font-semibold">Simulados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRanking.map((entry, index) => {
                const rankNum = entry.rank || index + 1;
                return (
                  <tr
                    key={entry.anonymousId}
                    className={`transition-colors ${
                      entry.isCurrentUser
                        ? 'bg-blue-50/80 font-semibold text-blue-950 border-l-4 border-l-blue-900'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <td className="py-3 px-4">{getRankBadge(rankNum)}</td>
                    <td className="py-3 px-4 font-mono font-medium flex items-center gap-2">
                      {entry.isCurrentUser && (
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-blue-900 text-white font-sans font-bold">
                          VOCÊ
                        </span>
                      )}
                      <span>{entry.anonymousId}</span>
                    </td>
                    <td className="py-3 px-4 font-medium">{entry.province}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {entry.averageScore.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">
                      {((entry.averageScore / 100) * 20).toFixed(1)} val
                    </td>
                    <td className="py-3 px-4 text-slate-500">{entry.testsCompleted} concluídos</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
