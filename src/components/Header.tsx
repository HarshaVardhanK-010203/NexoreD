import React from 'react';
import { useCivic } from '../context/CivicContext';
import { RefreshCw, Plus } from 'lucide-react';

interface HeaderProps {
  onOpenNewReportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewReportModal }) => {
  const { activeTab, setActiveTab, runAnalysis, isAnalyzing, clusters, reports } = useCivic();

  return (
    <header className="w-full bg-[#F4F0E6] border-b border-[#302335]/20 text-[#302335]">
      {/* Editorial Top Gazette Ticker */}
      <div className="border-b border-[#302335]/10 px-4 sm:px-8 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono tracking-wider uppercase text-[#8D867F]">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#302335]">Team NEXORA</span>
          <span>/</span>
          <span>YUKTHI 2026 Academic Innovation</span>
          <span>/</span>
          <span>Mohan Babu University, Tirupati</span>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <span>Corridor Root-Cause Intelligence</span>
          <span>·</span>
          <span>Municipal Simulation Docket</span>
        </div>
      </div>

      {/* Main Expressive Masthead */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 sm:py-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <button
                onClick={() => setActiveTab('overview')}
                className="text-left group"
              >
                <h1 className="text-3xl sm:text-5xl font-serif tracking-tight text-[#302335] group-hover:text-[#BD4938] transition-colors leading-none">
                  CiviNexus AI
                </h1>
              </button>
              <span className="font-mono text-xs text-[#BD4938] font-semibold tracking-widest uppercase">
                v2.6
              </span>
            </div>
            <p className="mt-1 text-sm sm:text-base font-serif italic text-[#8D867F]">
              Connecting Complaints. Uncovering Causes. Improving Cities.
            </p>
          </div>

          {/* Action Group */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => runAnalysis()}
              disabled={isAnalyzing}
              className="px-3.5 py-2 text-xs font-mono font-medium text-[#302335] bg-[#FFFDF8] hover:bg-[#EAE4D5] border border-[#302335]/20 rounded transition-colors flex items-center gap-2 whitespace-nowrap shadow-xs"
              title="Execute deterministic spatial-temporal correlation"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-[#BD4938]' : 'text-[#747D50]'}`} />
              <span>{isAnalyzing ? 'Synthesizing...' : 'Run Analysis Engine'}</span>
            </button>

            <button
              onClick={onOpenNewReportModal}
              className="px-4 py-2 text-xs font-mono font-medium text-[#FFFDF8] bg-[#BD4938] hover:bg-[#A63C2D] border border-[#BD4938] rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>File Civic Incident</span>
            </button>
          </div>
        </div>

        {/* Custom Editorial Navigation Bar */}
        <nav className="mt-5 pt-3 border-t-2 border-[#302335] flex items-center justify-between overflow-x-auto text-xs font-mono uppercase tracking-wider">
          <div className="flex items-center gap-6 sm:gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-1.5 transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'overview'
                  ? 'border-[#BD4938] text-[#BD4938] font-bold'
                  : 'border-transparent text-[#302335] hover:text-[#BD4938]'
              }`}
            >
              01 · Overview
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`py-1.5 transition-colors whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
                activeTab === 'reports'
                  ? 'border-[#BD4938] text-[#BD4938] font-bold'
                  : 'border-transparent text-[#302335] hover:text-[#BD4938]'
              }`}
            >
              <span>02 · Case Register</span>
              <span className="text-[11px] text-[#8D867F]">({reports.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('pattern_engine')}
              className={`py-1.5 transition-colors whitespace-nowrap border-b-2 flex items-center gap-1.5 ${
                activeTab === 'pattern_engine'
                  ? 'border-[#BD4938] text-[#BD4938] font-bold'
                  : 'border-transparent text-[#302335] hover:text-[#BD4938]'
              }`}
            >
              <span>03 · Pattern Engine</span>
              <span className="text-[11px] text-[#8D867F]">({clusters.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('root_cause')}
              className={`py-1.5 transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'root_cause'
                  ? 'border-[#BD4938] text-[#BD4938] font-bold'
                  : 'border-transparent text-[#302335] hover:text-[#BD4938]'
              }`}
            >
              04 · Root-Cause Cockpit
            </button>

            <button
              onClick={() => setActiveTab('evidence_ledger')}
              className={`py-1.5 transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'evidence_ledger'
                  ? 'border-[#BD4938] text-[#BD4938] font-bold'
                  : 'border-transparent text-[#302335] hover:text-[#BD4938]'
              }`}
            >
              05 · Evidence Ledger
            </button>
          </div>

          <div className="hidden lg:block text-[11px] text-[#8D867F] normal-case font-serif italic">
            Deterministic spatial-temporal triage
          </div>
        </nav>
      </div>
    </header>
  );
};
