import React from 'react';
import { CivicReport, IncidentCluster } from '../types';
import { X, Layers, ArrowRight } from 'lucide-react';
import { formatRelativeTime } from '../utils/geo';

interface ReportDetailModalProps {
  report: CivicReport | null;
  clusters: IncidentCluster[];
  allReports: CivicReport[];
  onClose: () => void;
  onOpenCluster: (clusterId: string) => void;
  onEditReport: (report: CivicReport) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  clusters,
  allReports,
  onClose,
  onOpenCluster,
  onEditReport,
}) => {
  if (!report) return null;

  const linkedCluster = report.clusterId
    ? clusters.find((c) => c.id === report.clusterId)
    : clusters.find((c) => c.reportIds.includes(report.id));

  const siblingReports = linkedCluster
    ? allReports.filter((r) => linkedCluster.reportIds.includes(r.id) && r.id !== report.id)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#302335]/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 border-2 border-[#302335] bg-[#FFFDF8] shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b-2 border-[#302335] bg-[#F4F0E6]">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs mb-1">
              <span className="font-bold text-[#BD4938]">{report.id}</span>
              <span className="text-[#8D867F]">/</span>
              <span className="text-[#302335] uppercase">{report.category.replace('_', ' ')}</span>
              <span className="text-[#8D867F]">/</span>
              <span className="text-[#8D867F]">{formatRelativeTime(report.timestamp)}</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#302335] leading-snug">{report.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#302335] hover:bg-[#EAE4D5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-sm">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 border border-[#302335]/20 bg-[#FAF7F0] font-mono text-xs">
            <div>
              <span className="text-[#8D867F] block mb-0.5 uppercase text-[10px]">Location</span>
              <strong className="text-[#302335] font-sans">{report.locationName}</strong>
            </div>
            <div>
              <span className="text-[#8D867F] block mb-0.5 uppercase text-[10px]">Coordinates</span>
              <strong className="text-[#302335]">
                {report.coordinates.lat.toFixed(4)}, {report.coordinates.lng.toFixed(4)}
              </strong>
            </div>
            <div>
              <span className="text-[#8D867F] block mb-0.5 uppercase text-[10px]">Severity</span>
              <strong className="text-[#BD4938] uppercase font-bold">{report.reportedSeverity}</strong>
            </div>
            <div>
              <span className="text-[#8D867F] block mb-0.5 uppercase text-[10px]">Intake Channel</span>
              <strong className="text-[#302335] uppercase">{report.sourceType.replace('_', ' ')}</strong>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#8D867F] mb-1">
              Field Observation Details
            </h4>
            <p className="text-[#302335] leading-relaxed bg-[#FAF7F0] p-3 border border-[#302335]/15 text-sm">
              {report.description}
            </p>
          </div>

          {/* Linked Cluster Status */}
          <div className="p-4 border-2 border-[#302335] bg-[#F4F0E6] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase text-[#302335]">
                <Layers className="w-4 h-4 text-[#BD4938]" />
                <span>Corridor Clustering Relationship</span>
              </div>
              {linkedCluster && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCluster(linkedCluster.id);
                  }}
                  className="font-mono text-xs text-[#BD4938] hover:underline font-bold flex items-center gap-1 uppercase"
                >
                  <span>Open Investigation Docket</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {linkedCluster ? (
              <div className="font-mono text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#BD4938] font-bold">{linkedCluster.id}</span>
                  <span className="text-[#8D867F]">/</span>
                  <span className="text-[#302335] font-bold">{linkedCluster.title}</span>
                </div>
                <p className="text-[#8D867F] font-sans text-xs">
                  {linkedCluster.groupingExplanation}
                </p>
              </div>
            ) : (
              <p className="font-sans text-xs text-[#8D867F]">
                This incident is currently unbundled. No neighboring reports meet the spatial proximity or causal interaction criteria.
              </p>
            )}
          </div>

          {/* Evidence Ledger */}
          <div>
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#8D867F] mb-2">
              Attached Documentary Records ({report.evidenceItems.length})
            </h4>
            <div className="space-y-2">
              {report.evidenceItems.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 border border-[#302335]/20 bg-[#FAF7F0] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-[#302335]">{ev.label}</span>
                    <span className="text-[#BD4938] uppercase">{ev.type.replace('_', ' ')}</span>
                  </div>
                  <p className="text-[#8D867F]">{ev.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Sibling Reports in Same Cluster */}
          {siblingReports.length > 0 && (
            <div>
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#8D867F] mb-2">
                Correlated Sibling Filings in Same Corridor ({siblingReports.length})
              </h4>
              <div className="divide-y divide-[#302335]/15 border border-[#302335]/20 bg-[#FAF7F0]">
                {siblingReports.map((sib) => (
                  <div
                    key={sib.id}
                    className="p-2.5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-[#BD4938]">{sib.id}</span>
                      <span className="text-[#8D867F] mx-1.5">/</span>
                      <span className="font-serif font-bold text-[#302335]">{sib.title}</span>
                    </div>
                    <span className="font-mono text-[#8D867F] uppercase text-[11px]">{sib.category.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t-2 border-[#302335] bg-[#F4F0E6] font-mono text-xs">
          <span className="text-[#8D867F]">DOCKET REF: {report.id}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditReport(report)}
              className="px-3 py-1.5 border border-[#302335]/30 rounded bg-[#FFFDF8] hover:bg-[#EAE4D5] text-[#302335] transition-colors"
            >
              Edit Docket Fields
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-[#302335] hover:bg-[#45334C] text-[#FFFDF8] font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
