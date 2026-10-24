export type CivicCategory =
  | 'road_damage'
  | 'drainage_overflow'
  | 'water_supply'
  | 'utility_excavation'
  | 'solid_waste'
  | 'electrical_hazard';

export type ReportSource =
  | 'citizen_app'
  | 'field_inspector'
  | 'municipal_helpline'
  | 'iot_telemetry';

export type ReportStatus =
  | 'new'
  | 'under_review'
  | 'clustered'
  | 'requires_inspection'
  | 'confirmed_finding'
  | 'resolved';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface EvidenceItem {
  id: string;
  label: string;
  type: 'photo' | 'rainfall_log' | 'sensor' | 'witness' | 'work_order';
  description: string;
  timestamp?: string;
  verifiedBy?: string;
}

export interface CivicReport {
  id: string;
  title: string;
  category: CivicCategory;
  description: string;
  locationName: string;
  sector: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  timestamp: string; // ISO format
  sourceType: ReportSource;
  reportedSeverity: 'low' | 'moderate' | 'high' | 'critical';
  reviewStatus: ReportStatus;
  evidenceItems: EvidenceItem[];
  clusterId?: string;
  notes?: string;
}

export type CandidatePlausibility = 'high' | 'moderate' | 'low';
export type VerificationState =
  | 'unverified_hypothesis'
  | 'field_inspection_requested'
  | 'confirmed_finding'
  | 'dismissed';

export interface PredictiveCostBreakdownItem {
  amount: number;
  label: string;
}

export interface PredictiveTimeBreakdownItem {
  hours: number;
  label: string;
}

export interface PredictiveImpactEstimate {
  impactScore: number; // 0 - 100 Index
  impactTier: 'transformative' | 'substantial' | 'moderate' | 'marginal';
  estimatedCostSavedMin: number; // in INR
  estimatedCostSavedMax: number;
  currency: string;
  timeSavedDays: number;
  crewHoursSaved: number;
  incidentRecurrenceReductionPercent: number; // e.g. 85%
  rootCauseInterventionCost: number; // estimated cost to fix the actual root cause once
  roiMultiplier: number;
  costBreakdown: PredictiveCostBreakdownItem[];
  timeBreakdown: PredictiveTimeBreakdownItem[];
  methodologyBasis: string;
}

export interface CandidateCause {
  id: string;
  title: string;
  physicalMechanism: string;
  supportingEvidence: string[];
  contradictoryEvidence: string[];
  missingEvidence: string[];
  plausibility: CandidatePlausibility;
  verificationState: VerificationState;
  suggestedAction: string;
  predictiveImpact?: PredictiveImpactEstimate;
  verifiedBy?: string;
  verifiedTimestamp?: string;
}

export interface PriorityFactorDetail {
  score: number; // 0 - 20
  label: string;
  metric: string;
}

export interface PriorityBreakdown {
  impact: PriorityFactorDetail;
  recurrence: PriorityFactorDetail;
  recency: PriorityFactorDetail;
  evidenceQuality: PriorityFactorDetail;
  dataCompleteness: PriorityFactorDetail;
  totalScore: number; // 0 - 100
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  author: string;
  action: string;
  details?: string;
}

export interface IncidentCluster {
  id: string;
  title: string;
  sector: string;
  reportIds: string[];
  categories: CivicCategory[];
  spatialSpanMeters: number;
  temporalSpanHours: number;
  centroid: {
    lat: number;
    lng: number;
  };
  observedPattern: string;
  groupingExplanation: string;
  candidateCauses: CandidateCause[];
  contradictoryObservations: string[];
  missingInformation: string[];
  priorityScore: number; // 0 - 100
  priorityLevel: PriorityLevel;
  priorityFactors: PriorityBreakdown;
  humanOverridePriority?: PriorityLevel;
  humanOverrideReason?: string;
  reviewStatus: ReportStatus;
  auditLog: AuditEntry[];
  inspectorAssigned?: string;
  verifiedFindings?: string;
}

export interface AnalysisConfig {
  spatialRadiusMeters: number;
  temporalWindowDays: number;
  requireCategoryAffinity: boolean;
  minimumReportsToCluster: number;
}

export interface DuplicateGroup {
  originalId: string;
  duplicateId: string;
  reason: string;
  distanceMeters: number;
  hoursDiff: number;
}
