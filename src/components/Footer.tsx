import React from 'react';
import { useCivic } from '../context/CivicContext';
import { RotateCcw } from 'lucide-react';

export const Footer: React.FC = () => {
  const { resetToDemoData, reports, clusters } = useCivic();

  return (
    <footer className="mt-16 border-t-2 border-[#302335] bg-[#FFFDF8] py-8 text-xs font-mono text-[#8D867F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base text-[#302335]">CiviNexus AI</span>
              <span>/</span>
              <span className="font-serif italic text-sm text-[#302335]">Connecting Complaints. Uncovering Causes. Improving Cities.</span>
            </div>
            <p className="text-[11px] font-sans text-[#8D867F]">
              Engineered by <strong className="text-[#302335]">Team NEXORA</strong> for{' '}
              <strong className="text-[#302335]">YUKTHI 2026</strong>, Mohan Babu University, Tirupati.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('Reset application state back to the pristine YUKTHI 2026 demonstration scenario?')) {
                  resetToDemoData();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-[#302335]/30 bg-[#F4F0E6] hover:bg-[#EAE4D5] text-[#302335] transition-colors shadow-xs"
              title="Reset all reports and clusters to default demonstration scenario"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#BD4938]" />
              <span className="font-bold">Reset Demo Scenario</span>
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-[#302335]/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px]">
          <div>
            Municipal Prototype Architecture · Simulated corridors (Chandragiri, MBU Campus, Alipiri) represent research test data.
          </div>
          <div>
            System State: {reports.length} records · {clusters.length} active corridors · LocalStorage persistence active
          </div>
        </div>
      </div>
    </footer>
  );
};
