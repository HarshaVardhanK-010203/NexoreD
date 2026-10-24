import React from 'react';
import { useCivic } from '../context/CivicContext';
import {
  Sliders,
  RefreshCw,
  FolderTree,
  Copy,
  ArrowRight,
} from 'lucide-react';

export const PatternEngineView: React.FC = () => {
  const {
    reports,
    clusters,
    duplicates,
    config,
    updateConfig,
    runAnalysis,
    isAnalyzing,
    lastAnalysisTimestamp,
    setSelectedClusterId,
    setActiveTab,
  } = useCivic();

  const handleOpenCluster = (clusterId: string) => {
    setSelectedClusterId(clusterId);
    setActiveTab('root_cause');
  };

  return (
    <div className="space-y-6">
      {/* Workbench Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-[#302335] pb-4">
        <div>
          <div className="font-mono text-xs text-[#BD4938] uppercase tracking-wider mb-1">
            Section 03 · Spatial-Temporal Mechanics
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#302335]">
            Pattern Synthesis Engine
          </h2>
          <p className="text-xs font-sans text-[#8D867F] mt-1 max-w-2xl">
            Deterministic clustering engine that evaluates pairwise Haversine proximity, temporal delta windows, and cross-category civil infrastructure interactions without opaque AI black-boxes.
          </p>
        </div>

        <button
          onClick={() => runAnalysis()}
          disabled={isAnalyzing}
          className="px-4 py-2 text-xs font-mono font-medium text-[#FFFDF8] bg-[#302335] hover:bg-[#45334C] rounded transition-colors flex items-center gap-2 whitespace-nowrap shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-[#BD4938]' : 'text-[#D3AA57]'}`} />
          <span>{isAnalyzing ? 'Synthesizing...' : 'Execute Synthesis'}</span>
        </button>
      </div>

      {/* Threshold Controls Instrument */}
      <div className="border border-[#302335] bg-[#FFFDF8] p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#302335]/20 pb-2 font-mono text-xs uppercase tracking-wider text-[#302335]">
          <div className="flex items-center gap-2 font-bold">
            <Sliders className="w-4 h-4 text-[#BD4938]" />
            <span>Clustering Parameters & Sensitivity Sliders</span>
          </div>
          <span className="text-[#8D867F]">
            Last run: {new Date(lastAnalysisTimestamp).toLocaleTimeString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Spatial Radius Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[#302335] font-bold">Spatial Radius Threshold</span>
              <strong className="text-[#BD4938] tabular-nums">
                {config.spatialRadiusMeters} meters
              </strong>
            </div>
            <input
              type="range"
              min="150"
              max="1000"
              step="50"
              value={config.spatialRadiusMeters}
              onChange={(e) => updateConfig({ spatialRadiusMeters: parseInt(e.target.value) })}
              className="w-full accent-[#BD4938] cursor-pointer"
            />
            <span className="text-[11px] font-sans text-[#8D867F] block">
              Max distance between incident nodes along the municipal road network.
            </span>
          </div>

          {/* Temporal Window Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[#302335] font-bold">Temporal Window Limit</span>
              <strong className="text-[#BD4938] tabular-nums">
                {config.temporalWindowDays} days
              </strong>
            </div>
            <input
              type="range"
              min="1"
              max="14"
              step="1"
              value={config.temporalWindowDays}
              onChange={(e) => updateConfig({ temporalWindowDays: parseInt(e.target.value) })}
              className="w-full accent-[#BD4938] cursor-pointer"
            />
            <span className="text-[11px] font-sans text-[#8D867F] block">
              Max temporal span between oldest and newest reports in a single chain.
            </span>
          </div>

          {/* Category Affinity Checkbox */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[#302335] font-bold">Category Causal Matrix</span>
              <input
                type="checkbox"
                checked={config.requireCategoryAffinity}
                onChange={(e) => updateConfig({ requireCategoryAffinity: e.target.checked })}
                className="w-4 h-4 accent-[#BD4938] cursor-pointer"
              />
            </div>
            <span className="text-[11px] font-sans text-[#8D867F] block">
              When enabled, only correlates categories with documented physical interactions (e.g. Drainage + Surface Subsidence).
            </span>
          </div>
        </div>
      </div>

      {/* Near-Duplicate Intake Audit Section */}
      <div className="border border-[#302335] bg-[#FFFDF8] p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#302335]/20 pb-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-[#302335]">
            <Copy className="w-4 h-4 text-[#D3AA57]" />
            <span>Redundant Intake Audit ({duplicates.length} detected)</span>
          </div>
          <span className="text-xs font-mono text-[#8D867F]">Threshold: Same category &lt;60m and &lt;6h</span>
        </div>

        {duplicates.length === 0 ? (
          <p className="text-xs font-sans text-[#8D867F] py-1">
            No redundant duplicate citizen filings found in the active intake window.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {duplicates.map((dup, idx) => (
              <div
                key={idx}
                className="p-3 border border-[#D3AA57] bg-[#FAF7F0] text-xs font-mono space-y-1"
              >
                <div className="flex items-center justify-between font-bold text-[#302335]">
                  <span>{dup.originalId} ↔ {dup.duplicateId}</span>
                  <span className="text-[#BD4938]">{dup.distanceMeters}m · {dup.hoursDiff}h</span>
                </div>
                <p className="font-sans text-[#8D867F]">{dup.reason}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Synthesized Clusters Dossier */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#302335] pb-2">
          <h3 className="font-serif text-xl font-bold text-[#302335]">
            Correlated Corridor Clusters ({clusters.length})
          </h3>
          <span className="font-mono text-xs text-[#8D867F]">
            Deterministic Multi-Node Groupings
          </span>
        </div>

        {clusters.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-[#302335]/20 bg-[#FFFDF8] text-[#8D867F]">
            <FolderTree className="w-8 h-8 mx-auto text-[#8D867F] mb-2" />
            <p className="font-serif text-base">No multi-report clusters found with current parameters.</p>
            <p className="text-xs font-sans mt-1">Try expanding the spatial radius threshold above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clusters.map((cluster) => {
              const clusterReports = reports.filter((r) => cluster.reportIds.includes(r.id));
              const priority = cluster.humanOverridePriority || cluster.priorityLevel;

              return (
                <div
                  key={cluster.id}
                  className="p-5 border-2 border-[#302335] bg-[#FFFDF8] space-y-4 shadow-xs"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#302335]/20 pb-3">
                    <div>
                      <div className="flex items-center gap-2 font-mono text-xs mb-1">
                        <span className="font-bold text-[#BD4938]">{cluster.id}</span>
                        <span className="text-[#8D867F]">/</span>
                        <span className="text-[#302335] uppercase">{cluster.sector}</span>
                        <span className="text-[#8D867F]">/</span>
                        <span className="text-[#8D867F]">{cluster.reportIds.length} connected filings</span>
                      </div>
                      <h4 className="font-serif text-xl font-bold text-[#302335]">{cluster.title}</h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            priority === 'critical'
                              ? 'bg-[#BD4938] text-[#FFFDF8]'
                              : priority === 'high'
                              ? 'bg-[#D3AA57] text-[#302335]'
                              : 'bg-[#747D50] text-[#FFFDF8]'
                          }`}
                        >
                          {priority} Priority
                        </span>
                        <div className="text-[11px] text-[#8D867F] tabular-nums mt-0.5">
                          Triage: {cluster.priorityScore}/100
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenCluster(cluster.id)}
                        className="px-3.5 py-1.5 text-xs font-mono font-medium text-[#FFFDF8] bg-[#302335] hover:bg-[#45334C] rounded transition-colors flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <span>Investigate Dossier</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#BD4938]" />
                      </button>
                    </div>
                  </div>

                  {/* Grouping Rationale */}
                  <div className="p-3 border-l-4 border-[#302335] bg-[#FAF7F0] space-y-1">
                    <span className="font-mono text-xs font-bold uppercase text-[#302335] block">
                      Deductive Grouping Rationale:
                    </span>
                    <p className="text-xs font-sans text-[#302335] leading-relaxed">
                      {cluster.groupingExplanation}
                    </p>
                  </div>

                  {/* Observed Pattern */}
                  <div className="space-y-1">
                    <span className="font-mono text-xs font-bold uppercase text-[#8D867F] block">
                      Observed Surface Pattern:
                    </span>
                    <p className="text-xs font-serif italic text-[#302335] text-sm">
                      "{cluster.observedPattern}"
                    </p>
                  </div>

                  {/* Included Member Records */}
                  <div className="pt-2 border-t border-[#302335]/15 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[#8D867F] uppercase text-[11px]">Included Records:</span>
                      {clusterReports.map((r) => (
                        <span
                          key={r.id}
                          className="px-2 py-0.5 bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] text-[11px]"
                        >
                          {r.id}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-[#8D867F] text-[11px]">
                      <span>Span: {cluster.spatialSpanMeters}m</span>
                      <span>Window: {Math.round(cluster.temporalSpanHours / 24)} days</span>
                      <span>Status: <strong className="text-[#302335] uppercase">{cluster.reviewStatus.replace('_', ' ')}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
