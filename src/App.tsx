/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { CandidateNav } from './components/candidate/CandidateNav';
import { OnboardingCard } from './components/candidate/OnboardingCard';
import { NotificationsFeed } from './components/candidate/NotificationsFeed';
import { StudyProgressChart } from './components/candidate/StudyProgressChart';
import { DynamicCalendar } from './components/candidate/DynamicCalendar';
import { OfficialListSearch } from './components/candidate/OfficialListSearch';
import { ExamSimulator } from './components/candidate/ExamSimulator';
import { ApprovalThermometer } from './components/candidate/ApprovalThermometer';
import { ProvincialRanking } from './components/candidate/ProvincialRanking';
import { PhysicalAndHealthGuide } from './components/candidate/PhysicalAndHealthGuide';
import { AffiliateDashboard } from './components/candidate/AffiliateDashboard';
import { PaywallModal } from './components/candidate/PaywallModal';
import { RegisterModal } from './components/auth/RegisterModal';
import { LoginModal } from './components/candidate/LoginModal';
import { LegalModal } from './components/legal/LegalModal';
import { EmailInboxModal } from './components/email/EmailInboxModal';
import { PushToastContainer } from './components/notifications/PushToastContainer';
import { PushNotificationCenterModal } from './components/notifications/PushNotificationCenterModal';
import { SupabaseStatusModal } from './components/supabase/SupabaseStatusModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ArchitectureDocument } from './components/architecture/ArchitectureDocument';
import { PublicWebsite } from './components/public/PublicWebsite';
import { StudyCenter } from './components/candidate/StudyCenter';
import { AiTutorView } from './components/candidate/AiTutorView';
import { Shield, Sparkles, ExternalLink } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { viewMode, candidateTab, params, isLegalModalOpen, setIsLegalModalOpen, legalModalTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* 3-Zone Top Bar with Dark Mode & Notifications */}
      <Header />

      {/* Floating Instant Push Toast */}
      <PushToastContainer />

      {/* Main Workspace */}
      <main className="flex-1">
        {/* Public Website Landing & Conversion Funnel */}
        {viewMode === 'public' && <PublicWebsite />}

        {/* Candidate Preparation Portal */}
        {viewMode === 'candidate' && (
          <div>
            {/* Candidate Subnav Tabs */}
            <CandidateNav />

            {/* Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
              {/* Onboarding Candidate Profile Bar */}
              <OnboardingCard />

              {/* Active Sub-Module */}
              {candidateTab === 'inicio' && (
                <div className="space-y-6">
                  <StudyProgressChart />
                  <NotificationsFeed />
                </div>
              )}
              {candidateTab === 'calendario' && <DynamicCalendar />}
              {candidateTab === 'listas' && <OfficialListSearch />}
              {candidateTab === 'estudos' && <StudyCenter />}
              {candidateTab === 'simulador' && <ExamSimulator />}
              {candidateTab === 'treinador' && <AiTutorView />}
              {candidateTab === 'termometro' && <ApprovalThermometer />}
              {candidateTab === 'ranking' && <ProvincialRanking />}
              {candidateTab === 'taf' && <PhysicalAndHealthGuide />}
              {candidateTab === 'afiliados' && <AffiliateDashboard />}
            </div>
          </div>
        )}

        {viewMode === 'admin' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <AdminDashboard />
          </div>
        )}

        {viewMode === 'architecture' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <ArchitectureDocument />
          </div>
        )}
      </main>

      {/* Modals & Dialogs */}
      <PaywallModal />
      <RegisterModal />
      <LoginModal />
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialTab={legalModalTab}
      />
      <EmailInboxModal />
      <PushNotificationCenterModal />
      <SupabaseStatusModal />

      {/* Institutional footer (shown in internal views; public website has its own landing footer) */}
      {viewMode !== 'public' && (
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 text-xs text-slate-500 dark:text-slate-400 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">{params.appName} Angola</span>
              <span>·</span>
              <span>Concurso de Ingresso Externo do MININT (candidaturas.minint.ao)</span>
            </div>

            <div className="flex items-center gap-6">
              <a
                href="https://candidaturas.minint.ao"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
              >
                <span>Portal Oficial MININT</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://imprensanacional.gov.ao"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Diário da República
              </a>
              <span>© 2026 Todos os direitos reservados.</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
