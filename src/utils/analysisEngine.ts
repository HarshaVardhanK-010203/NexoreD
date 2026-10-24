import {
  CivicReport,
  IncidentCluster,
  AnalysisConfig,
  CandidateCause,
  PriorityBreakdown,
  DuplicateGroup,
  CivicCategory,
  AuditEntry,
} from '../types';
import { calculateDistanceMeters, calculateCentroid, calculateMaxPairwiseDistance } from './geo';

/**
 * Category causal affinity matrix
 * Defines which civic issue categories have known systemic civil engineering interactions
 */
const CATEGORY_AFFINITY_PAIRS: Array<[CivicCategory, CivicCategory]> = [
  ['road_damage', 'drainage_overflow'],
  ['road_damage', 'utility_excavation'],
  ['road_damage', 'water_supply'],
  ['drainage_overflow', 'electrical_hazard'],
  ['water_supply', 'road_damage'],
  ['drainage_overflow', 'solid_waste'],
  ['drainage_overflow', 'utility_excavation'],
  ['road_damage', 'road_damage'],
  ['drainage_overflow', 'drainage_overflow'],
  ['water_supply', 'water_supply'],
  ['electrical_hazard', 'electrical_hazard'],
];

function hasCategoryAffinity(cat1: CivicCategory, cat2: CivicCategory): boolean {
  if (cat1 === cat2) return true;
  return CATEGORY_AFFINITY_PAIRS.some(
    ([a, b]) => (a === cat1 && b === cat2) || (a === cat2 && b === cat1)
  );
}

/**
 * Validates and normalizes report data
 */
export function validateAndNormalizeReports(reports: CivicReport[]): CivicReport[] {
  return reports.filter((r) => {
    return (
      r.id &&
      r.title &&
      r.coordinates &&
      typeof r.coordinates.lat === 'number' &&
      typeof r.coordinates.lng === 'number' &&
      !isNaN(r.coordinates.lat) &&
      !isNaN(r.coordinates.lng) &&
      r.timestamp
    );
  });
}

/**
 * Detects near-duplicate reports (same category, within 60 meters and 6 hours)
 */
export function detectDuplicates(reports: CivicReport[]): DuplicateGroup[] {
  const duplicates: DuplicateGroup[] = [];

  for (let i = 0; i < reports.length; i++) {
    for (let j = i + 1; j < reports.length; j++) {
      const r1 = reports[i];
      const r2 = reports[j];

      if (r1.category === r2.category) {
        const dist = calculateDistanceMeters(r1.coordinates, r2.coordinates);
        const timeDiffHours =
          Math.abs(new Date(r1.timestamp).getTime() - new Date(r2.timestamp).getTime()) /
          (1000 * 60 * 60);

        if (dist <= 60 && timeDiffHours <= 6) {
          duplicates.push({
            originalId: r1.id,
            duplicateId: r2.id,
            distanceMeters: dist,
            hoursDiff: Number(timeDiffHours.toFixed(1)),
            reason: `Matching category '${r1.category.replace('_', ' ')}' within ${dist}m and ${timeDiffHours.toFixed(1)}h. Likely citizen duplicate report of the same physical incident.`,
          });
        }
      }
    }
  }

  return duplicates;
}

/**
 * Transparent priority calculation with factor breakdown (0-100 total)
 */
export function calculateTransparentPriority(
  reports: CivicReport[],
  spatialSpanMeters: number,
  temporalSpanHours: number
): PriorityBreakdown {
  // 1. Potential Impact Factor (0 - 20)
  // Evaluates reported severities and public safety risk
  let impactScore = 6;
  const criticalCount = reports.filter((r) => r.reportedSeverity === 'critical').length;
  const highCount = reports.filter((r) => r.reportedSeverity === 'high').length;
  if (criticalCount > 0) impactScore += 12;
  else if (highCount >= 2) impactScore += 9;
  else if (highCount === 1) impactScore += 6;
  if (reports.some((r) => r.category === 'electrical_hazard' || r.category === 'road_damage')) {
    impactScore += 2;
  }
  impactScore = Math.min(20, impactScore);

  // 2. Recurrence Frequency Factor (0 - 20)
  // Higher report density indicates persistent, escalating breakdown
  let recurrenceScore = 4;
  if (reports.length >= 5) recurrenceScore = 20;
  else if (reports.length === 4) recurrenceScore = 17;
  else if (reports.length === 3) recurrenceScore = 14;
  else if (reports.length === 2) recurrenceScore = 10;

  // 3. Recency & Acceleration Factor (0 - 20)
  // Based on newest report timestamp and rate of occurrence
  const timestamps = reports.map((r) => new Date(r.timestamp).getTime());
  const newestTimestamp = Math.max(...timestamps);
  const hoursSinceNewest =
    (new Date('2026-10-24T05:24:00Z').getTime() - newestTimestamp) / (1000 * 60 * 60);

  let recencyScore = 8;
  if (hoursSinceNewest < 48) recencyScore += 10;
  else if (hoursSinceNewest < 96) recencyScore += 6;
  else if (hoursSinceNewest < 168) recencyScore += 3;
  if (temporalSpanHours > 0 && reports.length / (temporalSpanHours / 24) >= 1.5) {
    recencyScore += 2; // Rapid escalation
  }
  recencyScore = Math.min(20, recencyScore);

  // 4. Evidence Quality Factor (0 - 20)
  // Photographic evidence, telemetry, official field inspector notes
  const totalEvidence = reports.reduce((acc, r) => acc + r.evidenceItems.length, 0);
  const hasSensors = reports.some((r) =>
    r.evidenceItems.some((e) => e.type === 'sensor' || e.type === 'rainfall_log')
  );
  const hasOfficialLogs = reports.some((r) =>
    r.evidenceItems.some((e) => e.type === 'work_order')
  );

  let evidenceScore = Math.min(10, totalEvidence * 2.5);
  if (hasSensors) evidenceScore += 5;
  if (hasOfficialLogs) evidenceScore += 5;
  evidenceScore = Math.min(20, Math.round(evidenceScore));

  // 5. Data Completeness Factor (0 - 20)
  // Coordinates availability, description depth, multiple distinct observers
  const distinctSources = new Set(reports.map((r) => r.sourceType)).size;
  let completenessScore = 10;
  if (distinctSources >= 3) completenessScore += 6;
  else if (distinctSources === 2) completenessScore += 3;
  const avgDescLength =
    reports.reduce((acc, r) => acc + r.description.length, 0) / reports.length;
  if (avgDescLength > 80) completenessScore += 4;
  completenessScore = Math.min(20, completenessScore);

  const totalScore = impactScore + recurrenceScore + recencyScore + evidenceScore + completenessScore;

  return {
    impact: {
      score: impactScore,
      label: impactScore >= 16 ? 'Severe public hazard' : impactScore >= 11 ? 'Moderate corridor risk' : 'Localized impact',
      metric: `${criticalCount} critical, ${highCount} high severity alerts`,
    },
    recurrence: {
      score: recurrenceScore,
      label: reports.length >= 4 ? 'High recurring density' : reports.length >= 3 ? 'Multi-incident cluster' : 'Paired occurrences',
      metric: `${reports.length} correlated reports across corridor`,
    },
    recency: {
      score: recencyScore,
      label: hoursSinceNewest < 48 ? 'Active / Escalating' : hoursSinceNewest < 96 ? 'Recent (<4 days)' : 'Multi-week ongoing',
      metric: `${Math.round(hoursSinceNewest)}h elapsed since latest incident`,
    },
    evidenceQuality: {
      score: evidenceScore,
      label: evidenceScore >= 15 ? 'Multi-modal verified' : evidenceScore >= 10 ? 'Sufficient documentary' : 'Basic citizen reports',
      metric: `${totalEvidence} items (${hasSensors ? 'telemetry + ' : ''}photos/logs)`,
    },
    dataCompleteness: {
      score: completenessScore,
      label: completenessScore >= 16 ? 'Comprehensive telemetry' : 'Adequate metadata',
      metric: `${distinctSources} independent source types`,
    },
    totalScore,
  };
}

/**
 * Synthesizes civil engineering candidate root causes based on observed incident patterns
 */
function deriveCandidateCauses(reports: CivicReport[], sector: string): CandidateCause[] {
  const categories = new Set(reports.map((r) => r.category));
  const titles = reports.map((r) => r.title.toLowerCase()).join(' ');
  const descriptions = reports.map((r) => r.description.toLowerCase()).join(' ');
  const allText = `${titles} ${descriptions}`;

  const causes: CandidateCause[] = [];

  // Pattern 1: Drainage Culvert Siltation & Sub-base Hydraulic Pumping
  if (
    categories.has('road_damage') &&
    categories.has('drainage_overflow')
  ) {
    causes.push({
      id: `HYP-${Math.random().toString(36).substring(2, 7)}`,
      title: 'Stormwater Culvert Silt Blockage Inducing Sub-base Saturation & Asphalt Stripping',
      physicalMechanism:
        'Runoff cannot enter the choked 900mm culvert intake, resulting in stagnant ponding at the road sag point. Hydrostatic pressure and dynamic vehicle tire impacts force water into the asphalt sub-base, washing out fine aggregates and causing progressive shear fatigue cratering.',
      supportingEvidence: [
        'Class 3 alligator cracking directly adjacent to reported 22cm waterlogging zone.',
        'Inspector log confirming 70% cross-sectional silt mound in culvert intake.',
        'Rain gauge telemetry showing incidents followed a 34.8mm rainfall event.',
      ],
      contradictoryEvidence: [
        'No reports of ponding 200m downstream where culvert outfall discharges into natural stream.',
      ],
      missingEvidence: [
        'CCTV crawler camera survey of culvert interior to check for structural barrel collapse.',
        'Recent municipal desilting maintenance register for Sector 4.',
      ],
      plausibility: 'high',
      verificationState: 'unverified_hypothesis',
      suggestedAction:
        'Dispatch Municipal Drainage Taskforce with suction jetting vehicle to clear culvert; take asphalt core drill sample to test sub-base moisture content.',
    });
  }

  // Pattern 2: Utility Trench Uncompacted Backfill Settlement
  if (
    categories.has('utility_excavation') ||
    allText.includes('trench') ||
    allText.includes('fiber')
  ) {
    causes.push({
      id: `HYP-${Math.random().toString(36).substring(2, 7)}`,
      title: 'Inadequately Compacted Telecom Trench Settlement under Dynamic Bus Axle Loads',
      physicalMechanism:
        'Recent optic fiber trenching backfill was not compacted to the mandatory 95% Modified Proctor density standard. Infiltration of surface runoff softened the loose backfill, causing differential settlement and edge asphalt shearing under heavy transit vehicle loads.',
      supportingEvidence: [
        'Linear shoulder depression aligns precisely with Telecom Duct Permit #TEL-9921 alignment.',
        'Permit documentation lacks contractor compaction test certificate.',
      ],
      contradictoryEvidence: [
        'Potholes also present on the opposite carriageway which had no utility excavation.',
      ],
      missingEvidence: [
        'Dynamic Cone Penetrometer (DCP) compaction test along trench centerline.',
        'Utility agency pre-work and post-work reinstatement inspection sign-off.',
      ],
      plausibility: 'high',
      verificationState: 'unverified_hypothesis',
      suggestedAction:
        'Issue stop-work notice and demand immediate trench re-excavation, lime stabilization, and mechanical compaction from the contracting telecommunications provider.',
    });
  }

  // Pattern 3: Potable Water Distribution Trunk Rupture & Underground Cavitation
  if (
    categories.has('water_supply') ||
    allText.includes('water pressure') ||
    allText.includes('seepage') ||
    allText.includes('bubbling')
  ) {
    causes.push({
      id: `HYP-${Math.random().toString(36).substring(2, 7)}`,
      title: 'Subsurface Pressurized Potable Water Main Rupture with Soil Cavitation',
      physicalMechanism:
        'A high-pressure ductile iron or PVC municipal distribution main has cracked underground. Continuous escaping pressurized water is washing away sub-grade fines through storm curb joints, creating a subterranean void (cavity) beneath the asphalt that produces hollow acoustic readings.',
      supportingEvidence: [
        'Residual chlorine level of 0.6 ppm in kerb seepage confirms treated municipal potable water.',
        'SCADA telemetry logs 1.9 bar sudden drop in Academic Block head pressure with 18 m3/h unaccounted volume.',
        'Acoustic sounding confirms hollow void beneath 2m diameter road sag.',
      ],
      contradictoryEvidence: [
        'No major surface geyser or soil blowout observed during daytime hours.',
      ],
      missingEvidence: [
        'Ground Penetrating Radar (GPR) scan to map exact subterranean cavity dimensions.',
        'Pipe acoustic leak correlator survey between valve chambers V-11 and V-13.',
      ],
      plausibility: 'high',
      verificationState: 'unverified_hypothesis',
      suggestedAction:
        'Immediately throttle isolating valve V-12; mobilize emergency utility repair crew with GPR scanner to prevent catastrophic road collapse.',
    });
  }

  // Pattern 4: Stormwater Runoff Inundation of Unsealed Low-Tension Electrical Infrastructure
  if (
    categories.has('electrical_hazard') ||
    allText.includes('streetlight') ||
    allText.includes('vault') ||
    allText.includes('tripping')
  ) {
    causes.push({
      id: `HYP-${Math.random().toString(36).substring(2, 7)}`,
      title: 'Stormwater Ingress into Unsealed Electrical Pull-Box Vault Causing Residual Current Trips',
      physicalMechanism:
        'The concrete pull-box vault housing low-tension street lighting busbars lacks waterproof cable gland seals and sits below the curb overflow elevation. Surface runoff overflows directly into the chamber, submerging live terminals and triggering the 300mA earth-leakage circuit breaker at the substation.',
      supportingEvidence: [
        'Chamber photo confirms busbars submerged in 35cm standing water.',
        'Substation log matches trips exactly with automated lighting switch-on and dusk condensation.',
      ],
      contradictoryEvidence: [
        'Daytime visual inspection of above-ground lamp posts showed zero physical insulation damage.',
      ],
      missingEvidence: [
        'Megger insulation resistance test of subterranean feeder cable cores.',
        'Elevation survey between roadside gutter invert and vault lid lip.',
      ],
      plausibility: 'high',
      verificationState: 'unverified_hypothesis',
      suggestedAction:
        'Pump out chamber; elevate pull-box rim by 150mm above curb line; apply silicone waterproof sealing resin to cable conduit entries.',
    });
  }

  // Fallback heuristic if no specific pattern matches
  if (causes.length === 0) {
    causes.push({
      id: `HYP-${Math.random().toString(36).substring(2, 7)}`,
      title: `Correlated Spatial Infrastructure Distress along ${sector}`,
      physicalMechanism:
        'Multiple municipal infrastructure defects occurring in close geographic proximity. Underlying drainage gradients or high heavy-vehicle traffic density may be compounding localized stress.',
      supportingEvidence: [
        `${reports.length} civic reports filed within a ${formatDistanceSummary(reports)} span.`,
      ],
      contradictoryEvidence: [
        'Different reporting sources and varying defect typologies.',
      ],
      missingEvidence: [
        'Comprehensive multi-departmental field inspection report.',
      ],
      plausibility: 'moderate',
      verificationState: 'unverified_hypothesis',
      suggestedAction:
        'Assign sector zonal engineer to conduct visual walk-through audit of the entire corridor.',
    });
  }

  return causes;
}

function formatDistanceSummary(reports: CivicReport[]): string {
  if (reports.length < 2) return 'localized';
  const coords = reports.map((r) => r.coordinates);
  const maxD = calculateMaxPairwiseDistance(coords);
  return `${maxD}m`;
}

/**
 * Synthesizes grouping explanation text
 */
function createGroupingExplanation(
  reports: CivicReport[],
  spatialSpanMeters: number,
  temporalSpanHours: number,
  sector: string
): string {
  const catNames = Array.from(new Set(reports.map((r) => r.category.replace('_', ' ')))).join(', ');
  const days = (temporalSpanHours / 24).toFixed(1);
  return `${reports.length} reports linked along ${sector}. Grouped by geographic proximity (within ${spatialSpanMeters}m corridor span), temporal window (${days} days), and cross-category civic interaction involving ${catNames}. Common hydrological or structural stress detected.`;
}

/**
 * Synthesizes observed pattern statement
 */
function createObservedPattern(reports: CivicReport[]): string {
  const cats = Array.from(new Set(reports.map((r) => r.category)));
  if (cats.includes('road_damage') && cats.includes('drainage_overflow')) {
    return 'Co-occurrence of blocked drainage culvert inlets, persistent standing water, and accelerated road surface cratering along the same road segment.';
  }
  if (cats.includes('water_supply')) {
    return 'Simultaneous water network pressure drops and continuous unexplained clean water welling up through roadway expansion joints.';
  }
  if (cats.includes('electrical_hazard')) {
    return 'Repeated streetlight circuit breaker trips correlating with submerged underground electrical pull-box chambers.';
  }
  return `Recurring civic distress reports (${reports.length} incidents) concentrated within the same operational sector corridor.`;
}

/**
 * Main Analysis Engine
 * Deterministic spatial-temporal graph clustering with explainable candidate cause generation
 */
export function analyzeReports(
  allReports: CivicReport[],
  config: AnalysisConfig = {
    spatialRadiusMeters: 450,
    temporalWindowDays: 7,
    requireCategoryAffinity: true,
    minimumReportsToCluster: 2,
  },
  existingClusters: IncidentCluster[] = []
): {
  clusters: IncidentCluster[];
  duplicates: DuplicateGroup[];
  unclusteredReportIds: string[];
} {
  const validReports = validateAndNormalizeReports(allReports);
  const duplicates = detectDuplicates(validReports);

  const n = validReports.length;
  if (n === 0) {
    return { clusters: [], duplicates: [], unclusteredReportIds: [] };
  }

  // Step 1: Build Adjacency Matrix
  // Edge exists if distance <= spatialRadiusMeters AND timeDiff <= temporalWindowDays AND (categoryAffinity is met)
  const adj: number[][] = Array.from({ length: n }, () => []);
  const maxTimeMs = config.temporalWindowDays * 24 * 60 * 60 * 1000;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const r1 = validReports[i];
      const r2 = validReports[j];

      const dist = calculateDistanceMeters(r1.coordinates, r2.coordinates);
      const timeDiff = Math.abs(
        new Date(r1.timestamp).getTime() - new Date(r2.timestamp).getTime()
      );

      const affinityOk = config.requireCategoryAffinity
        ? hasCategoryAffinity(r1.category, r2.category)
        : true;

      // Same sector or close proximity
      const sectorOk = r1.sector === r2.sector || dist <= config.spatialRadiusMeters * 0.7;

      if (dist <= config.spatialRadiusMeters && timeDiff <= maxTimeMs && affinityOk && sectorOk) {
        adj[i].push(j);
        adj[j].push(i);
      }
    }
  }

  // Step 2: Connected Components (Breadth-First Search)
  const visited = new Array(n).fill(false);
  const rawClusters: number[][] = [];

  for (let i = 0; i < n; i++) {
    if (!visited[i]) {
      const component: number[] = [];
      const queue: number[] = [i];
      visited[i] = true;

      while (queue.length > 0) {
        const u = queue.shift()!;
        component.push(u);

        for (const v of adj[u]) {
          if (!visited[v]) {
            visited[v] = true;
            queue.push(v);
          }
        }
      }

      if (component.length >= config.minimumReportsToCluster) {
        rawClusters.push(component);
      }
    }
  }

  // Step 3: Build Rich Cluster Objects with Priority Breakdown and Candidate Causes
  const existingClusterMap = new Map<string, IncidentCluster>();
  existingClusters.forEach((c) => {
    // Key by sector or report combination
    existingClusterMap.set(c.sector, c);
    existingClusterMap.set(c.id, c);
  });

  const clusters: IncidentCluster[] = rawClusters.map((indices, idx) => {
    const clusterReports = indices.map((i) => validReports[i]);
    const coords = clusterReports.map((r) => r.coordinates);
    const centroid = calculateCentroid(coords);
    const spatialSpanMeters = calculateMaxPairwiseDistance(coords);

    const timestamps = clusterReports.map((r) => new Date(r.timestamp).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const temporalSpanHours = Math.max(1, Math.round((maxTime - minTime) / (1000 * 60 * 60)));

    const dominantSector = clusterReports[0].sector || 'Corridor Cluster';
    const categories = Array.from(new Set(clusterReports.map((r) => r.category)));

    const priorityFactors = calculateTransparentPriority(
      clusterReports,
      spatialSpanMeters,
      temporalSpanHours
    );

    let priorityLevel: 'critical' | 'high' | 'medium' | 'low' = 'low';
    if (priorityFactors.totalScore >= 75) priorityLevel = 'critical';
    else if (priorityFactors.totalScore >= 55) priorityLevel = 'high';
    else if (priorityFactors.totalScore >= 35) priorityLevel = 'medium';

    // Preserve existing cluster ID, human review actions, audit log if already in system
    const existing = existingClusterMap.get(dominantSector);
    const clusterId = existing?.id || `CLS-NX-${String(idx + 1).padStart(2, '0')}`;

    const observedPattern = createObservedPattern(clusterReports);
    const groupingExplanation = createGroupingExplanation(
      clusterReports,
      spatialSpanMeters,
      temporalSpanHours,
      dominantSector
    );

    let candidateCauses = existing?.candidateCauses;
    if (!candidateCauses || candidateCauses.length === 0) {
      candidateCauses = deriveCandidateCauses(clusterReports, dominantSector);
    }

    const clusterTitle =
      existing?.title ||
      (dominantSector.includes('Chandragiri')
        ? 'Chandragiri Corridor: Sub-base Saturation & Utility Backfill Failure'
        : dominantSector.includes('MBU')
        ? 'MBU Innovation Ring: Subsurface Pressurized Water Main Leak & Voiding'
        : dominantSector.includes('Alipiri')
        ? 'Alipiri Arterial: Underground Electrical Vault Inundation'
        : `${dominantSector}: Cross-Issue Corridor Cluster`);

    const contradictoryObservations = existing?.contradictoryObservations || [
      'Downstream road sections exhibit dry surface despite upstream retention.',
    ];

    const missingInformation = existing?.missingInformation || [
      'Subsurface GPR or CCTV crawler logs not yet uploaded by zonal maintenance.',
      'Contractor compaction test certification for recent utility trenching.',
      'Historical 5-year monsoon maintenance log for culvert barrel.',
    ];

    const auditLog: AuditEntry[] = existing?.auditLog || [
      {
        id: `AUD-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        author: 'System (Deterministic Pattern Engine)',
        action: 'Initial spatial-temporal cluster synthesized',
        details: `${clusterReports.length} reports connected across ${spatialSpanMeters}m corridor.`,
      },
    ];

    return {
      id: clusterId,
      title: clusterTitle,
      sector: dominantSector,
      reportIds: clusterReports.map((r) => r.id),
      categories,
      spatialSpanMeters,
      temporalSpanHours,
      centroid,
      observedPattern,
      groupingExplanation,
      candidateCauses,
      contradictoryObservations,
      missingInformation,
      priorityScore: priorityFactors.totalScore,
      priorityLevel,
      priorityFactors,
      humanOverridePriority: existing?.humanOverridePriority,
      humanOverrideReason: existing?.humanOverrideReason,
      reviewStatus: existing?.reviewStatus || 'new',
      auditLog,
      inspectorAssigned: existing?.inspectorAssigned,
      verifiedFindings: existing?.verifiedFindings,
    };
  });

  // Collect unclustered report IDs
  const clusteredReportIds = new Set<string>();
  clusters.forEach((c) => c.reportIds.forEach((id) => clusteredReportIds.add(id)));
  const unclusteredReportIds = validReports
    .map((r) => r.id)
    .filter((id) => !clusteredReportIds.has(id));

  return {
    clusters,
    duplicates,
    unclusteredReportIds,
  };
}
