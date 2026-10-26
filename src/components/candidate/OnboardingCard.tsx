import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Province, CareerTrack } from '../../types';
import {
  UserCheck,
  Edit3,
  Check,
  MapPin,
  Phone,
  ShieldCheck,
  Mail,
  UserPlus,
  CheckCircle2,
  ExternalLink,
  LogIn
} from 'lucide-react';

const angolanProvinces: Province[] = [
  'Bengo',
  'Benguela',
  'Bié',
  'Cabinda',
  'Cuando Cubango',
  'Cuanza Norte',
  'Cuanza Sul',
  'Cunene',
  'Huambo',
  'Huíla',
  'Luanda',
  'Lunda Norte',
  'Lunda Sul',
  'Malanje',
  'Moxico',
  'Namibe',
  'Uíge',
  'Zaire',
];

const careerTracks: CareerTrack[] = [
  'Polícia Nacional (PNA)',
  'Serviço de Investigação Criminal (SIC)',
  'Serviço de Migração e Estrangeiros (SME)',
  'Serviço de Protecção Civil e Bombeiros (SPCB)',
];

export const OnboardingCard: React.FC = () => {
  const {
    currentUser,
    updateCurrentUser,
    params,
    setIsRegisterModalOpen,
    setIsLoginModalOpen,
    setIsEmailViewerOpen,
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || 'benvindomanuel79@gmail.com');
  const [whatsapp, setWhatsapp] = useState(currentUser.whatsapp);
  const [province, setProvince] = useState<Province>(currentUser.province);
  const [career, setCareer] = useState<CareerTrack>(currentUser.careerTrack);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUser({
      name,
      email,
      whatsapp,
      province,
      careerTrack: career,
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Módulo A · Registo Oficial do Candidato
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>E-mail Verificado por Código</span>
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            Dados de Identificação & Província de Candidatura
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            As informações alimentam o seu agendamento de exame no cronograma alfabético e a validação nas listas oficiais do MININT.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Iniciar Sessão com E-mail e Palavra-passe do Firebase"
          >
            <LogIn className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Iniciar Sessão / Perfis</span>
          </button>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-600" />
            <span>Cadastrar Outro</span>
          </button>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            {isEditing ? (
              <>Cancelar</>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Dados</span>
              </>
            )}
          </button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Manuel Domingos Katumbela"
              className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@gmail.com"
              className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">WhatsApp (+244)</label>
            <input
              type="text"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ex: +244 923 884 102"
              className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Província</label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value as Province)}
              className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              {angolanProvinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Carreira Alvo</label>
            <select
              value={career}
              onChange={(e) => setCareer(e.target.value as CareerTrack)}
              className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            >
              {careerTracks.map((trk) => (
                <option key={trk} value={trk}>
                  {trk}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white rounded-xl transition-colors shadow-xs"
              style={{ backgroundColor: params.primaryColor }}
            >
              <Check className="w-4 h-4" />
              <span>Guardar Alterações</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-4">
          {/* Candidate Name */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Candidato Registado</span>
            <div className="flex items-center gap-2 mt-1">
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {currentUser.name}
              </span>
            </div>
          </div>

          {/* Email with Verified status & Inbox button */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">E-mail Validado</span>
              <button
                type="button"
                onClick={() => setIsEmailViewerOpen(true)}
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                <span>Ver Caixa</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-xs sm:text-sm font-medium font-mono text-slate-800 dark:text-slate-200 truncate">
                {currentUser.email || 'benvindomanuel79@gmail.com'}
              </span>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">WhatsApp Oficial</span>
            <div className="flex items-center gap-2 mt-1">
              <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-medium font-mono text-slate-800 dark:text-slate-200">
                {currentUser.whatsapp}
              </span>
            </div>
          </div>

          {/* Province */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Província Selecionada</span>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                {currentUser.province}
              </span>
            </div>
          </div>

          {/* Career Track */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Carreira / Órgão Alvo</span>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                {currentUser.careerTrack}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
