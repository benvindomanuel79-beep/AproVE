import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { mockScheduleSlots } from '../../data/mockData';
import { ScheduleSlot } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  FileCheck,
  BellRing
} from 'lucide-react';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const DynamicCalendar: React.FC = () => {
  const { currentUser, params } = useApp();
  const initialLetter = currentUser.name ? currentUser.name.trim().charAt(0).toUpperCase() : 'A';
  const [selectedLetter, setSelectedLetter] = useState<string>(initialLetter);
  const [activeSlot, setActiveSlot] = useState<ScheduleSlot | null>(null);
  const [reminderSaved, setReminderSaved] = useState(false);

  useEffect(() => {
    const slot = mockScheduleSlots.find((s) => s.letters.includes(selectedLetter));
    setActiveSlot(slot || mockScheduleSlots[0]);
  }, [selectedLetter]);

  return (
    <div className="space-y-6">
      {/* Header and Instruction */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Módulo A · Despacho Ministerial MININT
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Calendário Dinâmico Automatizado de Provas
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              De acordo com o edital oficial, as provas escritas e psicotécnicas são escalonadas rigorosamente pela letra inicial do primeiro nome.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs">
            <span className="text-slate-500">Candidato:</span>
            <span className="font-bold text-slate-900">{currentUser.name}</span>
            <span className="text-slate-300">·</span>
            <span className="text-blue-900 font-semibold">Letra '{currentUser.name.charAt(0).toUpperCase()}'</span>
          </div>
        </div>

        {/* Letter Selector Grid */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Selecione a primeira letra do seu nome próprio para ver o agendamento oficial:
          </label>
          <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-13 gap-1.5">
            {alphabet.map((letter) => {
              const isSelected = selectedLetter === letter;
              const isUserLetter = currentUser.name.charAt(0).toUpperCase() === letter;

              return (
                <button
                  key={letter}
                  onClick={() => {
                    setSelectedLetter(letter);
                    setReminderSaved(false);
                  }}
                  className={`h-10 text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center relative ${
                    isSelected
                      ? 'text-white shadow-sm scale-105'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                  style={{
                    backgroundColor: isSelected ? params.primaryColor : undefined,
                  }}
                >
                  <span>{letter}</span>
                  {isUserLetter && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-amber-400' : 'bg-blue-600'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Result Card */}
      {activeSlot && (
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border-2 border-blue-900/20 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-blue-900 text-white">
                  Grupo Alfabético: {activeSlot.letterGroup}
                </span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                  Agendamento Confirmado
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Dia de Prova: {activeSlot.examDate}
              </h2>
              <p className="text-sm text-slate-600 mt-1 font-medium">{activeSlot.phase}</p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Turno de Exame</span>
                  <span className="text-sm font-bold text-slate-900">{activeSlot.shift}</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-800" />
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Província</span>
                  <span className="text-sm font-bold text-slate-900">{currentUser.province}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
            <div className="p-4 rounded-lg bg-white border border-slate-200">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs mb-1">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Documentação Obrigatória</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Apresentação do Bilhete de Identidade (BI) original válido e talão de inscrição impresso do portal candidaturas.minint.ao.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white border border-slate-200">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Instruções Específicas</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{activeSlot.instructions}</p>
            </div>

            <div className="p-4 rounded-lg bg-white border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs mb-1">
                  <BellRing className="w-4 h-4 text-blue-600" />
                  <span>Lembrete no WhatsApp</span>
                </div>
                <p className="text-xs text-slate-600">
                  Notificar para {currentUser.whatsapp} 24h antes do exame.
                </p>
              </div>

              <button
                onClick={() => setReminderSaved(true)}
                className={`mt-3 w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  reminderSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {reminderSaved ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Lembrete Ativado</span>
                  </>
                ) : (
                  <span>Ativar Lembrete por WhatsApp</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chronological Full Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-blue-900" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tabela Completa de Escalonamento Oficial (MININT 2026)
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">8 Grupos Alfabéticos</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Grupo de Letras</th>
                <th className="py-2.5 px-4 font-semibold">Data da Prova</th>
                <th className="py-2.5 px-4 font-semibold">Turno Oficial</th>
                <th className="py-2.5 px-4 font-semibold">Conteúdo Programático</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockScheduleSlots.map((slot) => {
                const isCurrentActive = slot.letterGroup === activeSlot?.letterGroup;
                return (
                  <tr
                    key={slot.letterGroup}
                    className={`transition-colors ${
                      isCurrentActive ? 'bg-blue-50/70 font-semibold text-blue-950' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold flex items-center gap-2">
                      {isCurrentActive && (
                        <span className="w-2 h-2 rounded-full bg-blue-700 shrink-0" />
                      )}
                      <span>{slot.letterGroup}</span>
                    </td>
                    <td className="py-3 px-4">{slot.examDate}</td>
                    <td className="py-3 px-4">{slot.shift}</td>
                    <td className="py-3 px-4 text-slate-600">{slot.phase}</td>
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
