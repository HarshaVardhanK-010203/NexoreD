import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  ReportStatus,
  PriorityLevel,
  VerificationState,
} from '../types';
import {
  FolderTree,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sliders,
  UserCheck,
  History,
  Send,
  Layers,
  Award,
} from 'lucide-react';
import { formatRelativeTime } from '../utils/geo';

export const RootCauseView: React.FC = () => {
  const {
    clusters,
    reports,
    selectedClusterId,
    setSelectedClusterId,
    updateClusterStatus,
    updateClusterPriorityOverride,
    updateCandidateCauseState,
    assignClusterInspector,
    recordVerifiedFinding,
    addClusterAuditNote,
  } = useCivic();

  const [activeNoteText, setActiveNoteText] = useState('');
  const [activeInspectorInput, setActiveInspectorInput] = useState('');
  const [activeFindingInput, setActiveFindingInput] = useState('');
  const [overridePriority, setOverridePriority] = useState<PriorityLevel>('critical');
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);

  const activeCluster =
    clusters.find((c) => c.id === selectedClusterId) || clusters[0];

  if (!activeCluster) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-[#302335]/20 bg-[#FFFDF8] text-[#8D867F]">
        <FolderTree className="w-10 h-10 mx-auto text-[#8D867F] mb-3" />
        <h3 className="text-base font-serif font-bold text-[#302335]">No Active Investigation Dockets</h3>
        <p className="text-xs font-sans mt-1">Run the Pattern Engine or file new civic reports.</p>
      </div>
    );
  }

  const clusterReports = reports.filter((r) => activeCluster.reportIds.includes(r.id));
  const effectivePriority = activeCluster.humanOverridePriority || activeCluster.priorityLevel;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNoteText.trim()) return;
    addClusterAuditNote(activeCluster.id, activeNoteText.trim());
    setActiveNoteText('');
  };

  const handleAssignInspector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInspectorInput.trim()) return;
    assignClusterInspector(activeCluster.id, activeInspectorInput.trim());
    setActiveInspectorInput('');
  };

  const handleRecordFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFindingInput.trim()) return;
    recordVerifiedFinding(activeCluster.id, activeFindingInput.trim());
    setActiveFindingInput('');
  };

  const handleApplyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideReason.trim()) return;
    updateClusterPriorityOverride(activeCluster.id, overridePriority, overrideReason.trim());
    setShowOverrideModal(false);
    setOverrideReason('');
  };

  return (
    <div className="space-y-6">
      {/* Cluster Switcher Strip (Architectural Index Tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b-2 border-[#302335]">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8D867F] mr-2 shrink-0">
          Corridor Dockets:
        </span>
        {clusters.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedClusterId(c.id)}
            className={`px-3 py-1.5 text-xs font-mono whitespace-nowrap transition-colors flex items-center gap-2 border ${
              c.id === activeCluster.id
                ? 'bg-[#302335] text-[#FFFDF8] border-[#302335] font-bold shadow-xs'
                : 'bg-[#FFFDF8] text-[#302335] border-[#302335]/30 hover:bg-[#EAE4D5]'
            }`}
          >
            <span>{c.id}</span>
            <span className="text-[10px] text-[#D3AA57]">({c.reportIds.length} filings)</span>
          </button>
        ))}
      </div>

      {/* Main Cluster Overview Dossier */}
      <div className="p-5 sm:p-6 border-2 border-[#302335] bg-[#FFFDF8] space-y-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#302335]/20 pb-4">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs mb-1">
              <span className="font-bold text-[#BD4938]">{activeCluster.id}</span>
              <span className="text-[#8D867F]">/</span>
              <span className="text-[#302335] uppercase">{activeCluster.sector}</span>
              <span className="text-[#8D867F]">/</span>
              <span className="text-[#8D867F]">{clusterReports.length} Correlated Filings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#302335]">{activeCluster.title}</h2>
          </div>

          {/* Priority Score & Status Triage Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Priority Score Badge */}
            <div
              onClick={() => setShowScoreBreakdown(!showScoreBreakdown)}
              className="px-3.5 py-1.5 border border-[#302335] bg-[#FAF7F0] hover:bg-[#EAE4D5] cursor-pointer text-right transition-colors font-mono"
              title="Click to view transparent score math"
            >
              <div className="flex items-center gap-1.5 justify-end">
                <span
                  className={`w-2 h-2 rounded-full ${
                    effectivePriority === 'critical'
                      ? 'bg-[#BD4938]'
                      : effectivePriority === 'high'
                      ? 'bg-[#D3AA57]'
                      : 'bg-[#747D50]'
                  }`}
                />
                <span className="text-xs font-bold text-[#302335] uppercase">
                  {effectivePriority} {activeCluster.humanOverridePriority && '(Override)'}
                </span>
              </div>
              <span className="text-[11px] text-[#8D867F] tabular-nums">
                Score {activeCluster.priorityScore}/100 ▾
              </span>
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-2 bg-[#F4F0E6] px-3 py-1.5 border border-[#302335]/30 rounded">
              <span className="text-xs font-mono uppercase text-[#8D867F]">Status:</span>
              <select
                value={activeCluster.reviewStatus}
                onChange={(e) =>
                  updateClusterStatus(
                    activeCluster.id,
                    e.target.value as ReportStatus,
                    'Operational review status updated via triage panel.'
                  )
                }
                className="bg-transparent text-xs font-mono font-bold text-[#302335] focus:outline-none uppercase"
              >
                <option value="new">New Cluster</option>
                <option value="under_review">Under Review</option>
                <option value="requires_inspection">Requires Field Inspection</option>
                <option value="confirmed_finding">Confirmed Finding</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Override Priority Action */}
            <button
              onClick={() => setShowOverrideModal(true)}
              className="px-3 py-1.5 text-xs font-mono text-[#302335] bg-[#FAF7F0] hover:bg-[#EAE4D5] border border-[#302335]/30 rounded transition-colors"
            >
              Override Priority
            </button>
          </div>
        </div>

        {/* Priority Score Breakdown (Accordion/Panel) */}
        {showScoreBreakdown && (
          <div className="p-4 border-2 border-[#302335] bg-[#FAF7F0] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#302335]/20 pb-2">
              <div className="flex items-center gap-2 text-[#BD4938] font-bold uppercase tracking-wider">
                <Sliders className="w-4 h-4" />
                <span>Explainable Priority Calculation Breakdown</span>
              </div>
              <span className="text-[#8D867F] text-[11px]">
                Impact (20) + Recurrence (20) + Recency (20) + Evidence (20) + Completeness (20) = 100
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="p-2.5 bg-[#FFFDF8] border border-[#302335]/20">
                <span className="text-[#8D867F] block mb-1">1. Impact</span>
                <strong className="text-base text-[#BD4938]">
                  {activeCluster.priorityFactors.impact.score}/20
                </strong>
                <span className="block text-[11px] font-sans text-[#302335] mt-0.5">
                  {activeCluster.priorityFactors.impact.label}
                </span>
                <span className="block text-[10px] text-[#8D867F] mt-1">
                  {activeCluster.priorityFactors.impact.metric}
                </span>
              </div>

              <div className="p-2.5 bg-[#FFFDF8] border border-[#302335]/20">
                <span className="text-[#8D867F] block mb-1">2. Recurrence</span>
                <strong className="text-base text-[#D3AA57]">
                  {activeCluster.priorityFactors.recurrence.score}/20
                </strong>
                <span className="block text-[11px] font-sans text-[#302335] mt-0.5">
                  {activeCluster.priorityFactors.recurrence.label}
                </span>
                <span className="block text-[10px] text-[#8D867F] mt-1">
                  {activeCluster.priorityFactors.recurrence.metric}
                </span>
              </div>

              <div className="p-2.5 bg-[#FFFDF8] border border-[#302335]/20">
                <span className="text-[#8D867F] block mb-1">3. Recency</span>
                <strong className="text-base text-[#302335]">
                  {activeCluster.priorityFactors.recency.score}/20
                </strong>
                <span className="block text-[11px] font-sans text-[#302335] mt-0.5">
                  {activeCluster.priorityFactors.recency.label}
                </span>
                <span className="block text-[10px] text-[#8D867F] mt-1">
                  {activeCluster.priorityFactors.recency.metric}
                </span>
              </div>

              <div className="p-2.5 bg-[#FFFDF8] border border-[#302335]/20">
                <span className="text-[#8D867F] block mb-1">4. Evidence</span>
                <strong className="text-base text-[#747D50]">
                  {activeCluster.priorityFactors.evidenceQuality.score}/20
                </strong>
                <span className="block text-[11px] font-sans text-[#302335] mt-0.5">
                  {activeCluster.priorityFactors.evidenceQuality.label}
                </span>
                <span className="block text-[10px] text-[#8D867F] mt-1">
                  {activeCluster.priorityFactors.evidenceQuality.metric}
                </span>
              </div>

              <div className="p-2.5 bg-[#FFFDF8] border border-[#302335]/20">
                <span className="text-[#8D867F] block mb-1">5. Completeness</span>
                <strong className="text-base text-[#302335]">
                  {activeCluster.priorityFactors.dataCompleteness.score}/20
                </strong>
                <span className="block text-[11px] font-sans text-[#302335] mt-0.5">
                  {activeCluster.priorityFactors.dataCompleteness.label}
                </span>
                <span className="block text-[10px] text-[#8D867F] mt-1">
                  {activeCluster.priorityFactors.dataCompleteness.metric}
                </span>
              </div>
            </div>

            <p className="text-[11px] font-sans text-[#8D867F] italic">
              Notice: Priority score serves as an automated triage aid for public works queues, not an autonomous public safety certification.
            </p>
          </div>
        )}

        {/* Observed Pattern & Grouping Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
          <div className="p-3 border border-[#302335]/20 bg-[#FAF7F0] space-y-1">
            <span className="font-mono text-xs font-bold uppercase text-[#8D867F] block">
              Observed Surface Pattern:
            </span>
            <p className="text-[#302335] font-serif text-sm italic">{activeCluster.observedPattern}</p>
          </div>

          <div className="p-3 border border-[#302335]/20 bg-[#FAF7F0] space-y-1">
            <span className="font-mono text-xs font-bold uppercase text-[#302335] block">
              Spatial Corridor Link:
            </span>
            <p className="text-[#8D867F] leading-relaxed">{activeCluster.groupingExplanation}</p>
          </div>
        </div>
      </div>

      {/* 5-Layer Evidence-to-Decision Hierarchy (Editorial Blocks) */}
      <div className="border border-[#302335] bg-[#FFFDF8] p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#302335]/20 pb-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#302335]">
            <Layers className="w-4 h-4 text-[#BD4938]" />
            <span>5-Layer Epistemological Hierarchy</span>
          </div>
          <span className="font-mono text-xs text-[#8D867F]">CiviNexus Analytical Segregation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
          {/* Layer 1 */}
          <div className="p-3 border border-[#302335]/20 bg-[#FAF7F0] space-y-1.5">
            <div className="font-mono text-[11px] font-bold uppercase text-[#302335]">
              1. Observations
            </div>
            <p className="text-[11px] text-[#8D867F]">
              Empirical intake records filed by citizens & sensors without interpretation.
            </p>
            <div className="pt-1.5 border-t border-[#302335]/10 font-mono text-[10px] text-[#302335]">
              {clusterReports.length} records logged
            </div>
          </div>

          {/* Layer 2 */}
          <div className="p-3 border border-[#302335]/20 bg-[#FAF7F0] space-y-1.5">
            <div className="font-mono text-[11px] font-bold uppercase text-[#302335]">
              2. Spatial Links
            </div>
            <p className="text-[11px] text-[#8D867F]">
              Proximity thresholding and cross-category affinity matrices.
            </p>
            <div className="pt-1.5 border-t border-[#302335]/10 font-mono text-[10px] text-[#302335]">
              {activeCluster.spatialSpanMeters}m · {activeCluster.temporalSpanHours}h
            </div>
          </div>

          {/* Layer 3 */}
          <div className="p-3 border-2 border-[#D3AA57] bg-[#FAF7F0] space-y-1.5">
            <div className="font-mono text-[11px] font-bold uppercase text-[#D3AA57]">
              3. Hypotheses
            </div>
            <p className="text-[11px] text-[#8D867F]">
              Inferred physical failure mechanisms. Labeled UNVERIFIED.
            </p>
            <div className="pt-1.5 border-t border-[#D3AA57]/30 font-mono text-[10px] text-[#D3AA57] font-bold">
              {activeCluster.candidateCauses.length} hypotheses
            </div>
          </div>

          {/* Layer 4 */}
          <div className="p-3 border border-[#BD4938] bg-[#FAF7F0] space-y-1.5">
            <div className="font-mono text-[11px] font-bold uppercase text-[#BD4938]">
              4. Missing Tests
            </div>
            <p className="text-[11px] text-[#8D867F]">
              Contradictions and required physical tests prior to confirmation.
            </p>
            <div className="pt-1.5 border-t border-[#BD4938]/20 font-mono text-[10px] text-[#BD4938] font-bold">
              {activeCluster.missingInformation.length} diagnostics
            </div>
          </div>

          {/* Layer 5 */}
          <div className="p-3 border-2 border-[#747D50] bg-[#FAF7F0] space-y-1.5">
            <div className="font-mono text-[11px] font-bold uppercase text-[#747D50]">
              5. Ratified Action
            </div>
            <p className="text-[11px] text-[#8D867F]">
              Human engineering sign-off and official remediation order.
            </p>
            <div className="pt-1.5 border-t border-[#747D50]/30 font-mono text-[10px] text-[#747D50] font-bold">
              {activeCluster.verifiedFindings ? 'Finding ratified' : 'Review pending'}
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Root Causes & Physical Mechanisms */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#302335] pb-2">
          <h3 className="font-serif text-xl font-bold text-[#302335]">
            Candidate Root Causes & Civil Engineering Hypotheses ({activeCluster.candidateCauses.length})
          </h3>
          <span className="font-mono text-xs text-[#BD4938] font-bold uppercase flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Unverified Hypotheses — Requires Physical Field Borehole / CCTV</span>
          </span>
        </div>

        <div className="space-y-4">
          {activeCluster.candidateCauses.map((cause) => {
            const isConfirmed = cause.verificationState === 'confirmed_finding';
            const isRequested = cause.verificationState === 'field_inspection_requested';
            const isDismissed = cause.verificationState === 'dismissed';

            return (
              <div
                key={cause.id}
                className={`p-5 border-2 space-y-4 transition-all shadow-xs ${
                  isConfirmed
                    ? 'border-[#747D50] bg-[#FAF7F0]'
                    : isDismissed
                    ? 'border-[#8D867F]/40 bg-[#F4F0E6] opacity-60'
                    : 'border-[#302335] bg-[#FFFDF8]'
                }`}
              >
                {/* Hypothesis Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#302335]/15 pb-3">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-xs mb-1">
                      <span className="font-bold text-[#BD4938]">{cause.id}</span>
                      <span className="text-[#8D867F]">/</span>
                      <span className="text-[#302335] uppercase">Plausibility: {cause.plausibility}</span>
                    </div>
                    <h4 className="font-serif text-lg font-bold text-[#302335]">{cause.title}</h4>
                  </div>

                  <span
                    className={`inline-block px-2.5 py-1 text-xs font-mono font-bold uppercase border ${
                      isConfirmed
                        ? 'bg-[#747D50] text-[#FFFDF8] border-[#747D50]'
                        : isRequested
                        ? 'bg-[#D3AA57] text-[#302335] border-[#D3AA57]'
                        : isDismissed
                        ? 'bg-[#8D867F] text-[#FFFDF8] border-[#8D867F]'
                        : 'bg-[#F4F0E6] text-[#302335] border-[#302335]'
                    }`}
                  >
                    {cause.verificationState.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Physical Mechanism */}
                <div className="space-y-1">
                  <span className="font-mono text-xs font-bold uppercase text-[#8D867F] block">
                    Underlying Failure Mechanism:
                  </span>
                  <p className="text-sm font-sans text-[#302335] leading-relaxed bg-[#FAF7F0] p-3 border border-[#302335]/15">
                    {cause.physicalMechanism}
                  </p>
                </div>

                {/* Evidence Separation Columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-sans">
                  {/* Supporting */}
                  <div className="p-3 border border-[#747D50]/40 bg-[#FAF7F0] space-y-1.5">
                    <span className="font-mono text-[11px] font-bold text-[#747D50] uppercase flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Supporting Records ({cause.supportingEvidence.length})
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-[#302335] text-[11px]">
                      {cause.supportingEvidence.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Contradictory */}
                  <div className="p-3 border border-[#BD4938]/40 bg-[#FAF7F0] space-y-1.5">
                    <span className="font-mono text-[11px] font-bold text-[#BD4938] uppercase flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Contradictory Signs ({cause.contradictoryEvidence.length})
                    </span>
                    {cause.contradictoryEvidence.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1 text-[#302335] text-[11px]">
                        {cause.contradictoryEvidence.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[#8D867F] text-[11px] italic">No contradictions flagged.</p>
                    )}
                  </div>

                  {/* Missing Diagnostics */}
                  <div className="p-3 border border-[#D3AA57]/60 bg-[#FAF7F0] space-y-1.5">
                    <span className="font-mono text-[11px] font-bold text-[#D3AA57] uppercase flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> Missing Tests ({cause.missingEvidence.length})
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-[#302335] text-[11px]">
                      {cause.missingEvidence.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Suggested Action & Reviewer Verification Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#302335]/15 text-xs font-mono">
                  <div className="font-sans">
                    <span className="font-bold text-[#8D867F] mr-1">Recommended Action:</span>
                    <span className="text-[#302335] font-medium">{cause.suggestedAction}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() =>
                        updateCandidateCauseState(
                          activeCluster.id,
                          cause.id,
                          'field_inspection_requested',
                          `Field survey dispatched for: ${cause.title}`
                        )
                      }
                      className="px-2.5 py-1 text-[#302335] bg-[#EAE4D5] hover:bg-[#D8D0C0] border border-[#302335]/30 rounded transition-colors"
                    >
                      Request Inspection
                    </button>
                    <button
                      onClick={() =>
                        updateCandidateCauseState(
                          activeCluster.id,
                          cause.id,
                          'confirmed_finding',
                          `Confirmed finding validated by engineer: ${cause.title}`
                        )
                      }
                      className="px-2.5 py-1 text-[#FFFDF8] bg-[#747D50] hover:bg-[#5C643E] border border-[#747D50] rounded transition-colors font-bold"
                    >
                      Ratify Finding
                    </button>
                    <button
                      onClick={() =>
                        updateCandidateCauseState(
                          activeCluster.id,
                          cause.id,
                          'dismissed',
                          `Dismissed hypothesis after review: ${cause.title}`
                        )
                      }
                      className="px-2.5 py-1 text-[#8D867F] hover:text-[#BD4938] transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Human Operations & Engineer Ratification Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Official Ratification (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 border-2 border-[#302335] bg-[#FFFDF8] space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#302335]/20 pb-2">
              <UserCheck className="w-4 h-4 text-[#747D50]" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#302335]">
                Engineering Finding Ratification & Orders
              </h3>
            </div>

            {/* Confirmed Finding Display */}
            {activeCluster.verifiedFindings && (
              <div className="p-4 border-2 border-[#747D50] bg-[#FAF7F0] text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#747D50] uppercase tracking-wider">
                  <Award className="w-4 h-4" />
                  <span>Official Engineering Finding Ratified</span>
                </div>
                <p className="font-serif text-sm font-bold text-[#302335] leading-relaxed">
                  "{activeCluster.verifiedFindings}"
                </p>
              </div>
            )}

            {/* Record Finding Form */}
            <form onSubmit={handleRecordFinding} className="space-y-2 text-xs font-sans">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[#302335] font-bold">
                Log Authorized Engineering Finding:
              </label>
              <textarea
                rows={2}
                value={activeFindingInput}
                onChange={(e) => setActiveFindingInput(e.target.value)}
                placeholder="Enter official civil findings based on physical borehole/CCTV survey..."
                className="w-full px-3 py-2 rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] placeholder-[#8D867F] focus:outline-none focus:border-[#BD4938]"
              />
              <button
                type="submit"
                disabled={!activeFindingInput.trim()}
                className="px-3.5 py-1.5 font-mono text-xs font-bold text-[#FFFDF8] bg-[#747D50] hover:bg-[#5C643E] rounded disabled:opacity-40 transition-colors shadow-xs"
              >
                Ratify Finding into Official Municipal Register
              </button>
            </form>

            {/* Assign Inspector Form */}
            <div className="pt-3 border-t border-[#302335]/15">
              <form onSubmit={handleAssignInspector} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs font-mono">
                <div className="flex-1">
                  <label className="block text-[11px] text-[#8D867F] uppercase mb-1">
                    Assigned Field Inspector / Zonal Engineer:
                  </label>
                  <input
                    type="text"
                    value={activeInspectorInput}
                    onChange={(e) => setActiveInspectorInput(e.target.value)}
                    placeholder={activeCluster.inspectorAssigned || 'e.g. Er. K. Prasad (Tirupati Zonal Engineering)'}
                    className="w-full px-3 py-1.5 rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] placeholder-[#8D867F]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!activeInspectorInput.trim()}
                  className="sm:self-end px-3 py-1.5 rounded bg-[#302335] hover:bg-[#45334C] text-[#FFFDF8] disabled:opacity-40 font-bold"
                >
                  Assign Inspector
                </button>
              </form>
              {activeCluster.inspectorAssigned && (
                <span className="text-[11px] font-mono text-[#747D50] font-bold mt-1 block">
                  Current Inspector on Record: {activeCluster.inspectorAssigned}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Audit Trail (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 border-2 border-[#302335] bg-[#FFFDF8] space-y-4 shadow-xs">
            <div className="flex items-center gap-2 border-b border-[#302335]/20 pb-2">
              <History className="w-4 h-4 text-[#BD4938]" />
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[#302335]">
                Case Audit Trail ({activeCluster.auditLog.length})
              </h3>
            </div>

            {/* Add note */}
            <form onSubmit={handleAddNote} className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={activeNoteText}
                  onChange={(e) => setActiveNoteText(e.target.value)}
                  placeholder="Record investigation note or triage observation..."
                  className="flex-1 px-3 py-1.5 rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] placeholder-[#8D867F] text-xs font-sans"
                />
                <button
                  type="submit"
                  disabled={!activeNoteText.trim()}
                  className="p-2 rounded bg-[#302335] hover:bg-[#45334C] text-[#FFFDF8] disabled:opacity-40"
                  title="Log note"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Audit Log Timeline */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {activeCluster.auditLog.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 border border-[#302335]/20 bg-[#FAF7F0] text-xs space-y-1 font-mono"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#BD4938]">{log.author}</span>
                    <span className="text-[#8D867F]">
                      {formatRelativeTime(log.timestamp)}
                    </span>
                  </div>
                  <div className="font-bold text-[#302335]">{log.action}</div>
                  {log.details && (
                    <p className="font-sans text-[#8D867F] text-[11px] leading-relaxed">{log.details}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Priority Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#302335]/60 backdrop-blur-xs">
          <div className="w-full max-w-md border-2 border-[#302335] bg-[#FFFDF8] p-6 space-y-4 shadow-xl">
            <h3 className="font-serif text-xl font-bold text-[#302335]">Human Priority Override</h3>
            <p className="text-xs font-sans text-[#8D867F]">
              Authorized municipal engineers can override the automated triage score with mandatory written justification.
            </p>

            <form onSubmit={handleApplyOverride} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#302335] font-bold uppercase mb-1">Target Priority Level</label>
                <select
                  value={overridePriority}
                  onChange={(e) => setOverridePriority(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335]"
                >
                  <option value="critical">Critical (Immediate safety hazard / road closure)</option>
                  <option value="high">High (Corridor bottleneck / rapid deterioration)</option>
                  <option value="medium">Medium (Routine structural maintenance)</option>
                  <option value="low">Low (Non-urgent cosmetic distress)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#302335] font-bold uppercase mb-1">Mandatory Justification *</label>
                <textarea
                  rows={3}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="Explain why the automated algorithmic score was overridden..."
                  className="w-full px-3 py-2 rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] placeholder-[#8D867F] font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOverrideModal(false)}
                  className="px-3 py-1.5 text-[#8D867F] hover:text-[#302335]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!overrideReason.trim()}
                  className="px-4 py-1.5 bg-[#BD4938] hover:bg-[#A63C2D] text-[#FFFDF8] font-bold rounded disabled:opacity-40"
                >
                  Apply Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
