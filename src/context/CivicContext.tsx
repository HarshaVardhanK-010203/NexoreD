import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  CivicReport,
  IncidentCluster,
  AnalysisConfig,
  DuplicateGroup,
  ReportStatus,
  PriorityLevel,
  VerificationState,
} from '../types';
import { INITIAL_CIVIC_REPORTS, DEFAULT_ANALYSIS_CONFIG } from '../data/initialData';
import { analyzeReports } from '../utils/analysisEngine';

const STORAGE_KEY_REPORTS = 'civinexus_reports_v1';
const STORAGE_KEY_CLUSTERS = 'civinexus_clusters_v1';
const STORAGE_KEY_CONFIG = 'civinexus_config_v1';

interface CivicContextType {
  reports: CivicReport[];
  clusters: IncidentCluster[];
  duplicates: DuplicateGroup[];
  unclusteredReportIds: string[];
  config: AnalysisConfig;
  selectedClusterId: string | null;
  selectedReportId: string | null;
  activeTab: 'overview' | 'reports' | 'pattern_engine' | 'root_cause' | 'evidence_ledger';
  isAnalyzing: boolean;
  lastAnalysisTimestamp: string;
  setActiveTab: (tab: 'overview' | 'reports' | 'pattern_engine' | 'root_cause' | 'evidence_ledger') => void;
  setSelectedClusterId: (id: string | null) => void;
  setSelectedReportId: (id: string | null) => void;
  updateConfig: (newConfig: Partial<AnalysisConfig>) => void;
  runAnalysis: (overrideConfig?: AnalysisConfig) => void;
  addReport: (report: Omit<CivicReport, 'id'>) => string;
  updateReport: (id: string, updates: Partial<CivicReport>) => void;
  deleteReport: (id: string) => void;
  updateClusterStatus: (clusterId: string, status: ReportStatus, note?: string) => void;
  updateClusterPriorityOverride: (clusterId: string, priority: PriorityLevel, reason: string) => void;
  updateCandidateCauseState: (
    clusterId: string,
    causeId: string,
    state: VerificationState,
    note?: string
  ) => void;
  assignClusterInspector: (clusterId: string, inspectorName: string) => void;
  recordVerifiedFinding: (clusterId: string, findingText: string) => void;
  addClusterAuditNote: (clusterId: string, note: string) => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
}

const CivicContext = createContext<CivicContextType | undefined>(undefined);

export const CivicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from localStorage or fallback to demonstration dataset
  const [reports, setReports] = useState<CivicReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REPORTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_CIVIC_REPORTS;
  });

  const [config, setConfig] = useState<AnalysisConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_ANALYSIS_CONFIG;
  });

  const [clusters, setClusters] = useState<IncidentCluster[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLUSTERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    const initial = analyzeReports(INITIAL_CIVIC_REPORTS, DEFAULT_ANALYSIS_CONFIG);
    return initial.clusters;
  });

  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [unclusteredReportIds, setUnclusteredReportIds] = useState<string[]>([]);
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    'overview' | 'reports' | 'pattern_engine' | 'root_cause' | 'evidence_ledger'
  >('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysisTimestamp, setLastAnalysisTimestamp] = useState<string>(
    new Date().toISOString()
  );

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));
    } catch (e) {
      console.warn('Failed to save reports to localStorage', e);
    }
  }, [reports]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CLUSTERS, JSON.stringify(clusters));
    } catch (e) {
      console.warn('Failed to save clusters to localStorage', e);
    }
  }, [clusters]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed to save config to localStorage', e);
    }
  }, [config]);

  // Main Analysis Execution
  const runAnalysis = useCallback(
    (overrideConfig?: AnalysisConfig) => {
      setIsAnalyzing(true);
      const activeCfg = overrideConfig || config;

      setTimeout(() => {
        const result = analyzeReports(reports, activeCfg, clusters);
        setClusters(result.clusters);
        setDuplicates(result.duplicates);
        setUnclusteredReportIds(result.unclusteredReportIds);
        setLastAnalysisTimestamp(new Date().toISOString());

        // Update clusterId on reports
        setReports((prevReports) =>
          prevReports.map((r) => {
            const foundCluster = result.clusters.find((c) => c.reportIds.includes(r.id));
            return {
              ...r,
              clusterId: foundCluster ? foundCluster.id : undefined,
              reviewStatus: foundCluster ? 'clustered' : r.reviewStatus,
            };
          })
        );

        // If no cluster selected or current selection missing, pick the first
        if (result.clusters.length > 0) {
          if (!selectedClusterId || !result.clusters.some((c) => c.id === selectedClusterId)) {
            setSelectedClusterId(result.clusters[0].id);
          }
        } else {
          setSelectedClusterId(null);
        }

        setIsAnalyzing(false);
      }, 350);
    },
    [reports, config, clusters, selectedClusterId]
  );

  // Auto-run analysis when reports list initially mounts or after structural changes if clusters empty
  useEffect(() => {
    if (clusters.length === 0 && reports.length > 0) {
      runAnalysis();
    } else if (clusters.length > 0 && !selectedClusterId) {
      setSelectedClusterId(clusters[0].id);
    }
  }, [clusters.length, reports.length, runAnalysis, selectedClusterId]);

  const updateConfig = (newConfig: Partial<AnalysisConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      runAnalysis(updated);
      return updated;
    });
  };

  const addReport = (reportData: Omit<CivicReport, 'id'>): string => {
    const newId = `CNR-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const newReport: CivicReport = {
      ...reportData,
      id: newId,
    };

    setReports((prev) => [newReport, ...prev]);

    // Re-run analysis with new report
    setTimeout(() => {
      runAnalysis();
    }, 50);

    return newId;
  };

  const updateReport = (id: string, updates: Partial<CivicReport>) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    setTimeout(() => {
      runAnalysis();
    }, 50);
  };

  const deleteReport = (id: string) => {
    setReports((prev) => prev.filter((r) => r.id !== id));
    setTimeout(() => {
      runAnalysis();
    }, 50);
  };

  const updateClusterStatus = (clusterId: string, status: ReportStatus, note?: string) => {
    setClusters((prev) =>
      prev.map((c) => {
        if (c.id !== clusterId) return c;
        const newAudit = [...c.auditLog];
        newAudit.unshift({
          id: `AUD-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
          author: 'Human Reviewer (Zonal Operations Lead)',
          action: `Status transitioned to '${status.replace('_', ' ')}'`,
          details: note || 'Review status update recorded in operational queue.',
        });
        return {
          ...c,
          reviewStatus: status,
          auditLog: newAudit,
        };
      })
    );
  };

  const updateClusterPriorityOverride = (
    clusterId: string,
    priority: PriorityLevel,
    reason: string
  ) => {
    setClusters((prev) =>
      prev.map((c) => {
        if (c.id !== clusterId) return c;
        const newAudit = [...c.auditLog];
        newAudit.unshift({
          id: `AUD-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
          author: 'Human Reviewer (Triage Chief)',
          action: `Priority overridden to ${priority.toUpperCase()}`,
          details: `Reason: ${reason}`,
        });
        return {
          ...c,
          humanOverridePriority: priority,
          humanOverrideReason: reason,
          auditLog: newAudit,
        };
      })
    );
  };

  const updateCandidateCauseState = (
    clusterId: string,
    causeId: string,
    state: VerificationState,
    note?: string
  ) => {
    setClusters((prev) =>
      prev.map((c) => {
        if (c.id !== clusterId) return c;
        const updatedCauses = c.candidateCauses.map((cause) => {
          if (cause.id !== causeId) return cause;
          return {
            ...cause,
            verificationState: state,
            verifiedBy: 'Senior Civil Engineer (Municipal Audit Division)',
            verifiedTimestamp: new Date().toISOString(),
          };
        });

        const newAudit = [...c.auditLog];
        newAudit.unshift({
          id: `AUD-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
          author: 'Senior Civil Engineer (Human Verification)',
          action: `Candidate cause state updated to '${state.replace('_', ' ')}'`,
          details: note || `Evaluated hypothesis ${causeId}`,
        });

        return {
          ...c,
          candidateCauses: updatedCauses,
          auditLog: newAudit,
        };
      })
    );
  };

  const assignClusterInspector = (clusterId: string, inspectorName: string) => {
    setClusters((prev) =>
      prev.map((c) => {
        if (c.id !== clusterId) return c;
        const newAudit = [...c.auditLog];
        newAudit.unshift({
          id: `AUD-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
          author: 'Operations Dispatch',
          action: `Assigned field inspector: ${inspectorName}`,
          details: 'Dispatched for physical site verification and sub-surface acoustic checks.',
        });
        return {
          ...c,
          inspectorAssigned: inspectorName,
          reviewStatus: c.reviewStatus === 'new' ? 'under_review' : c.reviewStatus,
          auditLog: newAudit,
        };
      })
    );
  };

  const recordVerifiedFinding = (clusterId: string, findingText: string) => {
    setClusters((prev) =>
      prev.map((c) => {
        if (c.id !== clusterId) return c;
        const newAudit = [...c.auditLog];
        newAudit.unshift({
          id: `AUD-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
          author: 'Chief Municipal Engineer (Authorized Decision)',
          action: 'Official verified finding ratified',
          details: findingText,
        });
        return {
          ...c,
          verifiedFindings: findingText,
          reviewStatus: 'confirmed_finding',
          auditLog: newAudit,
        };
      })
    );
  };

  const addClusterAuditNote = (clusterId: string, note: string) => {
    setClusters((prev) =>
      prev.map((c) => {
        if (c.id !== clusterId) return c;
        const newAudit = [...c.auditLog];
        newAudit.unshift({
          id: `AUD-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: new Date().toISOString(),
          author: 'Civil Operations Reviewer',
          action: 'Investigation note logged',
          details: note,
        });
        return {
          ...c,
          auditLog: newAudit,
        };
      })
    );
  };

  const resetToDemoData = () => {
    setReports(INITIAL_CIVIC_REPORTS);
    setConfig(DEFAULT_ANALYSIS_CONFIG);
    const initial = analyzeReports(INITIAL_CIVIC_REPORTS, DEFAULT_ANALYSIS_CONFIG);
    setClusters(initial.clusters);
    setDuplicates(initial.duplicates);
    setUnclusteredReportIds(initial.unclusteredReportIds);
    if (initial.clusters.length > 0) {
      setSelectedClusterId(initial.clusters[0].id);
    }
    localStorage.removeItem(STORAGE_KEY_REPORTS);
    localStorage.removeItem(STORAGE_KEY_CLUSTERS);
    localStorage.removeItem(STORAGE_KEY_CONFIG);
  };

  const clearAllData = () => {
    setReports([]);
    setClusters([]);
    setDuplicates([]);
    setUnclusteredReportIds([]);
    setSelectedClusterId(null);
    setSelectedReportId(null);
    localStorage.removeItem(STORAGE_KEY_REPORTS);
    localStorage.removeItem(STORAGE_KEY_CLUSTERS);
  };

  return (
    <CivicContext.Provider
      value={{
        reports,
        clusters,
        duplicates,
        unclusteredReportIds,
        config,
        selectedClusterId,
        selectedReportId,
        activeTab,
        isAnalyzing,
        lastAnalysisTimestamp,
        setActiveTab,
        setSelectedClusterId,
        setSelectedReportId,
        updateConfig,
        runAnalysis,
        addReport,
        updateReport,
        deleteReport,
        updateClusterStatus,
        updateClusterPriorityOverride,
        updateCandidateCauseState,
        assignClusterInspector,
        recordVerifiedFinding,
        addClusterAuditNote,
        resetToDemoData,
        clearAllData,
      }}
    >
      {children}
    </CivicContext.Provider>
  );
};

export const useCivic = (): CivicContextType => {
  const context = useContext(CivicContext);
  if (!context) {
    throw new Error('useCivic must be used within a CivicProvider');
  }
  return context;
};
