import React, { useState } from 'react';
import { CivicProvider, useCivic } from './context/CivicContext';
import { Header } from './components/Header';
import { OverviewView } from './components/OverviewView';
import { ReportsView } from './components/ReportsView';
import { PatternEngineView } from './components/PatternEngineView';
import { RootCauseView } from './components/RootCauseView';
import { EvidenceLedgerView } from './components/EvidenceLedgerView';
import { ReportModal } from './components/ReportModal';
import { Footer } from './components/Footer';

const AppContent: React.FC = () => {
  const { activeTab, addReport } = useCivic();
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F0E6] text-[#302335] flex flex-col font-sans selection:bg-[#BD4938]/20 selection:text-[#302335]">
      {/* 3-Zone Global Navigation Bar */}
      <Header onOpenNewReportModal={() => setIsNewReportModalOpen(true)} />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <OverviewView onOpenReportModal={() => setIsNewReportModalOpen(true)} />
        )}

        {activeTab === 'reports' && <ReportsView />}

        {activeTab === 'pattern_engine' && <PatternEngineView />}

        {activeTab === 'root_cause' && <RootCauseView />}

        {activeTab === 'evidence_ledger' && <EvidenceLedgerView />}
      </main>

      {/* Global Quick Add Report Modal */}
      <ReportModal
        isOpen={isNewReportModalOpen}
        onClose={() => setIsNewReportModalOpen(false)}
        onSubmit={(data) => addReport(data)}
      />

      {/* Competition & Attribution Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <CivicProvider>
      <AppContent />
    </CivicProvider>
  );
}
