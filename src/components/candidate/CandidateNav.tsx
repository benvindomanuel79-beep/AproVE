import React from 'react';
import { useApp, CandidateTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  Search,
  BookOpen,
  FileCheck2,
  Sparkles,
  TrendingUp,
  Award,
  HeartPulse,
  Share2,
  Lock
} from 'lucide-react';

interface TabItem {
  id: CandidateTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isPremium?: boolean;
}

const tabs: TabItem[] = [
  { id: 'inicio', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendario', label: 'Calendário Alfabético', icon: Calendar },
  { id: 'listas', label: 'Listas de Admitidos', icon: Search },
  { id: 'estudos', label: 'Centro de Estudos', icon: BookOpen },
  { id: 'simulador', label: 'Simulador de Provas', icon: FileCheck2, isPremium: true },
  { id: 'treinador', label: 'Treinador IA', icon: Sparkles },
  { id: 'termometro', label: 'Termómetro de Aprovação', icon: TrendingUp, isPremium: true },
  { id: 'ranking', label: 'Ranking Provincial', icon: Award, isPremium: true },
  { id: 'taf', label: 'Aptidão Física & Saúde', icon: HeartPulse, isPremium: true },
  { id: 'afiliados', label: 'Programa de Afiliados (50/50)', icon: Share2 },
];

export const CandidateNav: React.FC = () => {
  const { candidateTab, setCandidateTab, currentUser, setIsPaywallOpen, params } = useApp();

  const handleTabClick = (tab: TabItem) => {
    if (tab.isPremium && !currentUser.isSubscribed && tab.id === 'simulador' && false) {
      // Allow free trial access to sample questions, but prompt paywall if desired
      // We allow users to explore simulator test questions, but show paywall banner
    }
    setCandidateTab(tab.id);
  };

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = candidateTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl whitespace-nowrap transition-colors ${
                  isActive
                    ? 'text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                style={{
                  backgroundColor: isActive ? params.primaryColor : undefined,
                }}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.isPremium && !currentUser.isSubscribed && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Pro
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
