import React from 'react';
import { useCivic } from '../context/CivicContext';
import { GeospatialMap } from './GeospatialMap';
import {
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  FolderTree,
  FileText,
} from 'lucide-react';
import { formatRelativeTime } from '../utils/geo';

interface OverviewViewProps {
  onOpenReportModal: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ onOpenReportModal }) => {
  const {
    reports,
    clusters,
    selectedClusterId,
    setSelectedClusterId,
    setSelectedReportId,
    setActiveTab,
    runAnalysis,
    isAnalyzing,
  } = useCivic();

  const totalReports = reports.length;
  const activeClusters = clusters.length;
  const highPriorityCount = clusters.filter(
    (c) => (c.humanOverridePriority || c.priorityLevel) === 'critical' || (c.humanOverridePriority || c.priorityLevel) === 'high'
  ).length;
  const pendingReviewCount = clusters.filter(
    (c) => c.reviewStatus === 'new' || c.reviewStatus === 'under_review'
  ).length;
  const totalEvidenceCount = reports.reduce((acc, r) => acc + r.evidenceItems.length, 0);
  const avgSpanMeters =
    clusters.length > 0
      ? Math.round(clusters.reduce((acc, c) => acc + c.spatialSpanMeters, 0) / clusters.length)
      : 0;

  const handleSelectCluster = (clusterId: string) => {
    setSelectedClusterId(clusterId);
    setActiveTab('root_cause');
  };

  const handleSelectReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setActiveTab('reports');
  };

  return (
    <div className="space-y-8">
      {/* Editorial Principle Banner & Epigraph */}
      <div className="border-t-2 border-b-2 border-[#302335] py-5 px-4 sm:px-6 bg-[#FFFDF8]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-[#BD4938]">
              <ShieldAlert className="w-4 h-4" />
              <span>Core Operational Principle · Protocol NX-01</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#302335] leading-snug">
              A detected pattern is not proof of causation.
            </h2>
            <p className="text-sm font-sans text-[#8D867F] leading-relaxed">
              CiviNexus AI connects civic complaints across municipal corridors. Empirical observations, spatial correlations, candidate hypotheses, and confirmed engineering findings remain strictly segregated until authenticated human sign-off.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#302335]/15 font-mono text-xs">
            <div className="text-left lg:text-right">
              <span className="block font-bold text-[#302335]">TIRUPATI STUDY CORRIDOR</span>
              <span className="block text-[11px] text-[#8D867F]">Mohan Babu University · YUKTHI 2026</span>
            </div>
            <button
              onClick={() => setActiveTab('pattern_engine')}
              className="px-3.5 py-1.5 text-xs text-[#302335] bg-[#F4F0E6] hover:bg-[#EAE4D5] border border-[#302335]/30 rounded transition-colors flex items-center gap-1.5 font-medium"
            >
              <span>Examine Clustering Rules</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#BD4938]" />
            </button>
          </div>
        </div>
      </div>

      {/* Typographic Statistical Composition (NOT generic identical cards!) */}
      <div className="border border-[#302335] bg-[#FFFDF8] p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#302335]/20 pb-2 mb-4 font-mono text-xs uppercase tracking-wider text-[#8D867F]">
          <span>Operational Registry Status</span>
          <span>Automated Spatial-Temporal Intake</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-[#302335]/15">
          <div className="py-2 md:py-0 md:px-4 first:pl-0">
            <span className="block font-mono text-[11px] uppercase tracking-wider text-[#8D867F] mb-1">
              Active Filings
            </span>
            <div className="text-3xl sm:text-4xl font-serif font-bold text-[#302335] tabular-nums">
              {totalReports}
            </div>
            <span className="block text-xs font-sans text-[#8D867F] mt-1">Logged records</span>
          </div>

          <div className="py-2 md:py-0 md:px-4">
            <span className="block font-mono text-[11px] uppercase tracking-wider text-[#8D867F] mb-1">
              Corridor Clusters
            </span>
            <div className="text-3xl sm:text-4xl font-serif font-bold text-[#747D50] tabular-nums">
              {activeClusters}
            </div>
            <span className="block text-xs font-sans text-[#8D867F] mt-1">Correlations</span>
          </div>

          <div className="py-2 md:py-0 md:px-4">
            <span className="block font-mono text-[11px] uppercase tracking-wider text-[#8D867F] mb-1">
              Urgent Triage
            </span>
            <div className="text-3xl sm:text-4xl font-serif font-bold text-[#BD4938] tabular-nums">
              {highPriorityCount}
            </div>
            <span className="block text-xs font-sans text-[#8D867F] mt-1">Critical & High</span>
          </div>

          <div className="py-2 md:py-0 md:px-4">
            <span className="block font-mono text-[11px] uppercase tracking-wider text-[#8D867F] mb-1">
              Awaiting Review
            </span>
            <div className="text-3xl sm:text-4xl font-serif font-bold text-[#D3AA57] tabular-nums">
              {pendingReviewCount}
            </div>
            <span className="block text-xs font-sans text-[#8D867F] mt-1">In review queue</span>
          </div>

          <div className="py-2 md:py-0 md:px-4">
            <span className="block font-mono text-[11px] uppercase tracking-wider text-[#8D867F] mb-1">
              Evidence Items
            </span>
            <div className="text-3xl sm:text-4xl font-serif font-bold text-[#302335] tabular-nums">
              {totalEvidenceCount}
            </div>
            <span className="block text-xs font-sans text-[#8D867F] mt-1">Photos, logs & sensors</span>
          </div>

          <div className="py-2 md:py-0 md:px-4 last:pr-0">
            <span className="block font-mono text-[11px] uppercase tracking-wider text-[#8D867F] mb-1">
              Mean Corridor Span
            </span>
            <div className="text-3xl sm:text-4xl font-serif font-bold text-[#302335] tabular-nums">
              {avgSpanMeters}m
            </div>
            <span className="block text-xs font-sans text-[#8D867F] mt-1">Geographic reach</span>
          </div>
        </div>
      </div>

      {/* Asymmetric Dual Section: Spatial Cartography (Left) + Investigation Register (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Spatial Cartography (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between border-b border-[#302335] pb-1.5">
            <h3 className="font-serif text-lg font-bold text-[#302335]">
              Spatial Distribution & Road Corridors
            </h3>
            <span className="font-mono text-xs text-[#8D867F]">
              {clusters.length} active corridors linked
            </span>
          </div>

          <GeospatialMap
            reports={reports}
            clusters={clusters}
            selectedClusterId={selectedClusterId}
            onSelectCluster={handleSelectCluster}
            onSelectReport={handleSelectReport}
          />

          <div className="p-3 border border-[#302335]/20 bg-[#FFFDF8] text-xs font-sans text-[#8D867F] leading-relaxed">
            <strong className="text-[#302335]">Cartographic Note:</strong> Incidents are projected using calibrated Haversine distance, temporal thresholding, and infrastructure interaction logic. Isolated issues (e.g. Renigunta highway signs, Bhavani Nagar dumpsters) remain independent.
          </div>
        </div>

        {/* Right Column: Case Register & Priority Investigation Queue (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between border-b border-[#302335] pb-1.5">
            <h3 className="font-serif text-lg font-bold text-[#302335]">
              Prioritized Case Register
            </h3>
            <button
              onClick={() => setActiveTab('root_cause')}
              className="text-xs font-mono font-bold text-[#BD4938] hover:underline flex items-center gap-1 uppercase"
            >
              <span>Examine All Dockets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {clusters.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-[#302335]/20 bg-[#FFFDF8] text-[#8D867F]">
                <FolderTree className="w-8 h-8 mx-auto text-[#8D867F] mb-2" />
                <p className="text-sm font-serif">No active clusters in current window.</p>
                <button
                  onClick={() => runAnalysis()}
                  className="mt-3 px-3 py-1.5 text-xs font-mono text-[#FFFDF8] bg-[#302335] rounded"
                >
                  Synthesize Clusters
                </button>
              </div>
            ) : (
              clusters.map((cluster) => {
                const priority = cluster.humanOverridePriority || cluster.priorityLevel;
                const score = cluster.priorityScore;

                return (
                  <div
                    key={cluster.id}
                    onClick={() => handleSelectCluster(cluster.id)}
                    className="p-4 border-2 border-[#302335] bg-[#FFFDF8] hover:bg-[#FAF7F0] transition-colors cursor-pointer space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-[#302335]/15 pb-2">
                      <div>
                        <div className="flex items-center gap-2 font-mono text-xs mb-0.5">
                          <span className="font-bold text-[#BD4938]">{cluster.id}</span>
                          <span className="text-[#8D867F]">/</span>
                          <span className="text-[#302335] uppercase">{cluster.sector}</span>
                        </div>
                        <h4 className="font-serif text-base font-bold text-[#302335] line-clamp-1">
                          {cluster.title}
                        </h4>
                      </div>

                      {/* Priority Stamp */}
                      <div className="text-right shrink-0 font-mono">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            priority === 'critical'
                              ? 'bg-[#BD4938] text-[#FFFDF8]'
                              : priority === 'high'
                              ? 'bg-[#D3AA57] text-[#302335]'
                              : 'bg-[#747D50] text-[#FFFDF8]'
                          }`}
                        >
                          {priority}
                        </span>
                        <div className="text-[11px] text-[#8D867F] tabular-nums mt-0.5">
                          Score {score}/100
                        </div>
                      </div>
                    </div>

                    <p className="text-xs font-sans text-[#8D867F] line-clamp-2">
                      {cluster.observedPattern}
                    </p>

                    <div className="pt-2 border-t border-[#302335]/10 flex items-center justify-between font-mono text-[11px] text-[#302335]">
                      <span>{cluster.reportIds.length} correlated reports</span>
                      <span>Span: {cluster.spatialSpanMeters}m</span>
                      <span className="uppercase text-[#BD4938] font-bold">
                        {cluster.reviewStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Archival Intake Ledger: Recent Civic Reports */}
      <div className="border border-[#302335] bg-[#FFFDF8] p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b-2 border-[#302335] pb-2">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#302335]">
              Intake Docket & Field Survey Feed
            </h3>
            <p className="text-xs font-sans text-[#8D867F]">
              Sequential empirical records filed by citizens, IoT transducers, and road inspectors
            </p>
          </div>
          <button
            onClick={() => setActiveTab('reports')}
            className="text-xs font-mono font-bold text-[#BD4938] hover:underline flex items-center gap-1 uppercase"
          >
            <span>Open Case Register</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-[#302335]/15">
          {reports.slice(0, 5).map((report) => (
            <div
              key={report.id}
              onClick={() => handleSelectReport(report.id)}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF7F0] px-2 transition-colors cursor-pointer"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-[#BD4938]">{report.id}</span>
                  <span className="text-[#8D867F]">/</span>
                  <span className="text-[#302335] uppercase">{report.category.replace('_', ' ')}</span>
                  <span className="text-[#8D867F]">/</span>
                  <span className="text-[#8D867F]">{formatRelativeTime(report.timestamp)}</span>
                </div>
                <div className="font-serif text-sm font-bold text-[#302335] line-clamp-1">{report.title}</div>
                <div className="text-xs font-sans text-[#8D867F]">{report.locationName}</div>
              </div>

              <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                {report.clusterId ? (
                  <span className="text-[#302335] font-bold">Linked: {report.clusterId}</span>
                ) : (
                  <span className="text-[#8D867F] italic">Unbundled</span>
                )}
                <span className="text-[#8D867F]">·</span>
                <span className="text-[#302335] tabular-nums">{report.evidenceItems.length} Evidence</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
