import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  FileText,
  CheckCircle,
  XCircle,
  HelpCircle,
  Award,
  ExternalLink,
} from 'lucide-react';

export const EvidenceLedgerView: React.FC = () => {
  const { clusters, setSelectedClusterId, setActiveTab } = useCivic();
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<string>('all');
  const [evidenceTypeTab, setEvidenceTypeTab] = useState<'all' | 'supporting' | 'contradictory' | 'missing' | 'verified'>('all');

  const activeClusters = selectedClusterFilter === 'all'
    ? clusters
    : clusters.filter((c) => c.id === selectedClusterFilter);

  const supportingItems: Array<{ clusterId: string; clusterTitle: string; causeTitle: string; text: string }> = [];
  const contradictoryItems: Array<{ clusterId: string; clusterTitle: string; causeTitle: string; text: string }> = [];
  const missingItems: Array<{ clusterId: string; clusterTitle: string; causeTitle: string; text: string }> = [];
  const verifiedFindings: Array<{ clusterId: string; clusterTitle: string; finding: string; inspector?: string }> = [];

  activeClusters.forEach((c) => {
    c.candidateCauses.forEach((cause) => {
      cause.supportingEvidence.forEach((text) => {
        supportingItems.push({ clusterId: c.id, clusterTitle: c.title, causeTitle: cause.title, text });
      });
      cause.contradictoryEvidence.forEach((text) => {
        contradictoryItems.push({ clusterId: c.id, clusterTitle: c.title, causeTitle: cause.title, text });
      });
      cause.missingEvidence.forEach((text) => {
        missingItems.push({ clusterId: c.id, clusterTitle: c.title, causeTitle: cause.title, text });
      });
    });

    if (c.verifiedFindings) {
      verifiedFindings.push({
        clusterId: c.id,
        clusterTitle: c.title,
        finding: c.verifiedFindings,
        inspector: c.inspectorAssigned,
      });
    }
  });

  const handleOpenCluster = (clusterId: string) => {
    setSelectedClusterId(clusterId);
    setActiveTab('root_cause');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-[#302335] pb-4">
        <div>
          <div className="font-mono text-xs text-[#BD4938] uppercase tracking-wider mb-1">
            Section 05 · Documentary Repository
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#302335]">
            Evidence Ledger & Verification Matrix
          </h2>
          <p className="text-xs font-sans text-[#8D867F] mt-1 max-w-2xl">
            Traceable cross-corridor docket cataloguing supporting observations, contradictory signs, required field tests, and ratified civil engineering findings.
          </p>
        </div>

        {/* Cluster Filter */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[#8D867F] uppercase">Corridor Filter:</span>
          <select
            value={selectedClusterFilter}
            onChange={(e) => setSelectedClusterFilter(e.target.value)}
            className="px-3 py-1.5 rounded bg-[#FFFDF8] border border-[#302335]/30 text-[#302335] focus:outline-none focus:border-[#BD4938]"
          >
            <option value="all">All Active Corridors ({clusters.length})</option>
            {clusters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.sector}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Segmented Category Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono uppercase tracking-wider">
        <button
          onClick={() => setEvidenceTypeTab('all')}
          className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap border ${
            evidenceTypeTab === 'all'
              ? 'bg-[#302335] text-[#FFFDF8] border-[#302335] font-bold'
              : 'bg-[#FFFDF8] text-[#302335] border-[#302335]/30 hover:bg-[#EAE4D5]'
          }`}
        >
          All Items ({supportingItems.length + contradictoryItems.length + missingItems.length + verifiedFindings.length})
        </button>

        <button
          onClick={() => setEvidenceTypeTab('supporting')}
          className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap border flex items-center gap-1.5 ${
            evidenceTypeTab === 'supporting'
              ? 'bg-[#747D50] text-[#FFFDF8] border-[#747D50] font-bold'
              : 'bg-[#FFFDF8] text-[#747D50] border-[#302335]/30 hover:bg-[#FAF7F0]'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Supporting Records ({supportingItems.length})</span>
        </button>

        <button
          onClick={() => setEvidenceTypeTab('contradictory')}
          className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap border flex items-center gap-1.5 ${
            evidenceTypeTab === 'contradictory'
              ? 'bg-[#BD4938] text-[#FFFDF8] border-[#BD4938] font-bold'
              : 'bg-[#FFFDF8] text-[#BD4938] border-[#302335]/30 hover:bg-[#FAF7F0]'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Contradictory Signs ({contradictoryItems.length})</span>
        </button>

        <button
          onClick={() => setEvidenceTypeTab('missing')}
          className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap border flex items-center gap-1.5 ${
            evidenceTypeTab === 'missing'
              ? 'bg-[#D3AA57] text-[#302335] border-[#D3AA57] font-bold'
              : 'bg-[#FFFDF8] text-[#302335] border-[#302335]/30 hover:bg-[#FAF7F0]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Missing Diagnostics ({missingItems.length})</span>
        </button>

        <button
          onClick={() => setEvidenceTypeTab('verified')}
          className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap border flex items-center gap-1.5 ${
            evidenceTypeTab === 'verified'
              ? 'bg-[#302335] text-[#FFFDF8] border-[#302335] font-bold'
              : 'bg-[#FFFDF8] text-[#302335] border-[#302335]/30 hover:bg-[#FAF7F0]'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-[#D3AA57]" />
          <span>Verified Findings ({verifiedFindings.length})</span>
        </button>
      </div>

      {/* 4 Dedicated Evidence Quadrants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supporting Evidence */}
        {(evidenceTypeTab === 'all' || evidenceTypeTab === 'supporting') && (
          <div className="p-5 border-2 border-[#747D50] bg-[#FFFDF8] space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#747D50]/30 pb-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-[#747D50]">
                <CheckCircle className="w-4 h-4" />
                <span>Supporting Empirical Observations ({supportingItems.length})</span>
              </div>
              <span className="text-[11px] font-mono text-[#8D867F]">Substantiates hypotheses</span>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {supportingItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 border border-[#747D50]/30 bg-[#FAF7F0] text-xs space-y-1.5 hover:border-[#747D50] transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <button
                      onClick={() => handleOpenCluster(item.clusterId)}
                      className="font-bold text-[#BD4938] hover:underline flex items-center gap-1"
                    >
                      <span>{item.clusterId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <span className="text-[#8D867F] truncate max-w-[200px]">{item.clusterTitle}</span>
                  </div>
                  <p className="font-serif font-bold text-sm text-[#302335]">{item.text}</p>
                  <div className="font-mono text-[11px] text-[#8D867F]">Context: {item.causeTitle}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contradictory Evidence */}
        {(evidenceTypeTab === 'all' || evidenceTypeTab === 'contradictory') && (
          <div className="p-5 border-2 border-[#BD4938] bg-[#FFFDF8] space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#BD4938]/30 pb-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-[#BD4938]">
                <XCircle className="w-4 h-4" />
                <span>Contradictory / Unexplained Signs ({contradictoryItems.length})</span>
              </div>
              <span className="text-[11px] font-mono text-[#8D867F]">Challenges hypotheses</span>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {contradictoryItems.length === 0 ? (
                <p className="text-xs font-sans text-[#8D867F] py-4 text-center">
                  No contradictory anomalies flagged for the active selection.
                </p>
              ) : (
                contradictoryItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 border border-[#BD4938]/30 bg-[#FAF7F0] text-xs space-y-1.5 hover:border-[#BD4938] transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <button
                        onClick={() => handleOpenCluster(item.clusterId)}
                        className="font-bold text-[#BD4938] hover:underline flex items-center gap-1"
                      >
                        <span>{item.clusterId}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <span className="text-[#8D867F] truncate max-w-[200px]">{item.clusterTitle}</span>
                    </div>
                    <p className="font-serif font-bold text-sm text-[#BD4938]">{item.text}</p>
                    <div className="font-mono text-[11px] text-[#8D867F]">Context: {item.causeTitle}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Missing Evidence Required */}
        {(evidenceTypeTab === 'all' || evidenceTypeTab === 'missing') && (
          <div className="p-5 border-2 border-[#D3AA57] bg-[#FFFDF8] space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#D3AA57]/40 pb-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-[#302335]">
                <HelpCircle className="w-4 h-4 text-[#D3AA57]" />
                <span>Missing Testing Requisites ({missingItems.length})</span>
              </div>
              <span className="text-[11px] font-mono text-[#8D867F]">Prerequisites for confirmation</span>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {missingItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 border border-[#D3AA57]/40 bg-[#FAF7F0] text-xs space-y-1.5 hover:border-[#D3AA57] transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <button
                      onClick={() => handleOpenCluster(item.clusterId)}
                      className="font-bold text-[#BD4938] hover:underline flex items-center gap-1"
                    >
                      <span>{item.clusterId}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <span className="text-[#8D867F] truncate max-w-[200px]">{item.clusterTitle}</span>
                  </div>
                  <p className="font-serif font-bold text-sm text-[#302335]">{item.text}</p>
                  <div className="font-mono text-[11px] text-[#8D867F]">Required for: {item.causeTitle}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ratified Human Findings */}
        {(evidenceTypeTab === 'all' || evidenceTypeTab === 'verified') && (
          <div className="p-5 border-2 border-[#302335] bg-[#FFFDF8] space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#302335]/20 pb-2">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-[#302335]">
                <Award className="w-4 h-4 text-[#747D50]" />
                <span>Ratified Engineering Decisions ({verifiedFindings.length})</span>
              </div>
              <span className="text-[11px] font-mono text-[#8D867F]">Authorized human orders</span>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {verifiedFindings.length === 0 ? (
                <p className="text-xs font-sans text-[#8D867F] py-4 text-center">
                  No findings officially ratified yet. Review corridor dockets to ratify engineering orders.
                </p>
              ) : (
                verifiedFindings.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 border-2 border-[#747D50] bg-[#FAF7F0] text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <button
                        onClick={() => handleOpenCluster(item.clusterId)}
                        className="font-bold text-[#BD4938] hover:underline flex items-center gap-1"
                      >
                        <span>{item.clusterId}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <span className="text-[#747D50] font-bold">Inspector: {item.inspector || 'Chief Zonal Engineer'}</span>
                    </div>
                    <p className="font-serif font-bold text-sm text-[#302335]">"{item.finding}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
