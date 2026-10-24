import { CivicReport, AnalysisConfig } from '../types';

export const DEFAULT_ANALYSIS_CONFIG: AnalysisConfig = {
  spatialRadiusMeters: 450,
  temporalWindowDays: 7,
  requireCategoryAffinity: true,
  minimumReportsToCluster: 2,
};

/**
 * Fictional demonstration dataset for YUKTHI 2026, Mohan Babu University.
 * Explicitly labeled as simulated municipal research data.
 */
export const INITIAL_CIVIC_REPORTS: CivicReport[] = [
  // ==========================================
  // SCENARIO A: Chandragiri Arterial Corridor (Sub-base Hydro-Saturation & Trench Backfill Failure)
  // Coordinates span Lat 13.6290 to 13.6315, Lng 79.4080 to 79.4120 (~380m corridor)
  // ==========================================
  {
    id: 'CNR-2026-0801',
    title: 'Severe Asphalt Pothole & Longitudinal Depression',
    category: 'road_damage',
    description: 'Deep pothole (approx 18cm deep, 1.2m diameter) expanding along outer lane of Chandragiri Road near Junction 4. Sub-base gravel visible. Vehicles swerving sharply to avoid damage.',
    locationName: 'Chandragiri Main Road, Km 4.3 near Junction 4',
    sector: 'Sector 4 - Chandragiri Corridor',
    coordinates: { lat: 13.6294, lng: 79.4088 },
    timestamp: '2026-10-18T08:30:00Z',
    sourceType: 'citizen_app',
    reportedSeverity: 'high',
    reviewStatus: 'new',
    evidenceItems: [
      {
        id: 'EVD-801-1',
        label: 'Citizen Geo-tagged Photo',
        type: 'photo',
        description: 'Photo showing sharp asphalt shear edges, exposed wet WBM gravel base, and water retention at bottom.',
      },
      {
        id: 'EVD-801-2',
        label: 'Traffic Flow Telemetry',
        type: 'sensor',
        description: 'Average traffic speed drop from 42 km/h to 16 km/h during peak morning hours.',
      },
    ],
  },
  {
    id: 'CNR-2026-0802',
    title: 'Pre-cast Stormwater Culvert Clogged with Silt & Debris',
    category: 'drainage_overflow',
    description: 'Pre-cast RCC storm drainage culvert intake heavily choked with consolidated silt, mud, and uncollected plastic waste. Inflow velocity reduced to zero.',
    locationName: 'Chandragiri Main Road, Km 4.25 Culvert Inflow',
    sector: 'Sector 4 - Chandragiri Corridor',
    coordinates: { lat: 13.6291, lng: 79.4084 },
    timestamp: '2026-10-19T14:15:00Z',
    sourceType: 'field_inspector',
    reportedSeverity: 'high',
    reviewStatus: 'new',
    evidenceItems: [
      {
        id: 'EVD-802-1',
        label: 'Field Inspection Log',
        type: 'work_order',
        description: 'Inspector flagged 70% cross-sectional blockage in 900mm culvert barrel. Silt depth measured at 48cm.',
      },
      {
        id: 'EVD-802-2',
        label: 'Culvert Ingress Photo',
        type: 'photo',
        description: 'Inspection photograph displaying silt mound and trapped construction aggregates at inlet grate.',
      },
    ],
  },
  {
    id: 'CNR-2026-0804',
    title: 'Recurrent Roadway Waterlogging After 35mm Rainfall',
    category: 'drainage_overflow',
    description: 'Extensive standing water (depth 22cm) covering 2 eastbound lanes for over 180 meters. Water fails to drain 4 hours after cessation of moderate precipitation.',
    locationName: 'Chandragiri Main Road, Km 4.35 Low Sag Point',
    sector: 'Sector 4 - Chandragiri Corridor',
    coordinates: { lat: 13.6298, lng: 79.4093 },
    timestamp: '2026-10-20T09:20:00Z',
    sourceType: 'citizen_app',
    reportedSeverity: 'critical',
    reviewStatus: 'new',
    evidenceItems: [
      {
        id: 'EVD-804-1',
        label: 'Automatic Rain Gauge Data',
        type: 'rainfall_log',
        description: 'Local automated weather station recorded 34.8mm rainfall between 03:00 and 06:30.',
      },
      {
        id: 'EVD-804-2',
        label: 'Transit Bus Dashcam Stills',
        type: 'photo',
        description: 'Image showing bow-wave spray from buses and passenger two-wheelers stalling in submerged lanes.',
      },
    ],
  },
  {
    id: 'CNR-2026-0807',
    title: 'Progressive Asphalt Stripping & Alligator Cracking',
    category: 'road_damage',
    description: 'Interconnected fine alligator cracking and top bituminous layer peeling off over a 45-meter strip directly adjacent to the flooded corridor section.',
    locationName: 'Chandragiri Main Road, Km 4.4 Transition Zone',
    sector: 'Sector 4 - Chandragiri Corridor',
    coordinates: { lat: 13.6304, lng: 79.4102 },
    timestamp: '2026-10-21T16:40:00Z',
    sourceType: 'field_inspector',
    reportedSeverity: 'moderate',
    reviewStatus: 'new',
    evidenceItems: [
      {
        id: 'EVD-807-1',
        label: 'Pavement Condition Survey',
        type: 'work_order',
        description: 'Surface distress measurement: Class 3 fatigue cracking; sub-base water pumping observed under dynamic wheel loads.',
      },
    ],
  },
  {
    id: 'CNR-2026-0810',
    title: 'Uncompacted Optic Fiber Trench Settlement & Subsidence',
    category: 'utility_excavation',
    description: 'Recent telecom utility trench (excavated 14 days ago for fiber optic ducting) has slumped by 12cm along the road shoulder following rainwater infiltration.',
    locationName: 'Chandragiri Main Road, Km 4.38 Shoulder Duct',
    sector: 'Sector 4 - Chandragiri Corridor',
    coordinates: { lat: 13.6300, lng: 79.4097 },
    timestamp: '2026-10-22T11:05:00Z',
    sourceType: 'municipal_helpline',
    reportedSeverity: 'high',
    reviewStatus: 'new',
    evidenceItems: [
      {
        id: 'EVD-810-1',
        label: 'Utility Excavation Permit #TEL-9921',
        type: 'work_order',
        description: 'Permit issued for 1.2m trenching. Required 95% Modified Proctor compaction test certificate is missing from contractor submission.',
      },
      {
        id: 'EVD-810-2',
        label: 'Shoulder Subsidence Photo',
        type: 'photo',
        description: 'Photo showing deep linear longitudinal groove where asphalt patch collapsed along trench boundary.',
      },
    ],
  },

  // ==========================================
  // SCENARIO B: MBU Campus Innovation Ring / Tech Zone (Subsurface Pipeline Rupture & Cavitation)
  // Coordinates span Lat 13.6360 to 13.6375, Lng 79.4210 to 79.4235 (~220m corridor)
  // ==========================================
  {
    id: 'CNR-2026-0803',
    title: 'Abnormal Drop in Potable Water Supply Head Pressure',
    category: 'water_supply',
    description: 'Water pressure in distribution trunk line feeding Academic Block 3 and research laboratories dropped from 2.8 bar to 0.9 bar. Booster pumps running continuously.',
    locationName: 'MBU Innovation Ring, Valve Chamber V-12',
    sector: 'Sector 7 - MBU Tech Zone',
    coordinates: { lat: 13.6362, lng: 79.4214 },
    timestamp: '2026-10-20T11:00:00Z',
    sourceType: 'iot_telemetry',
    reportedSeverity: 'high',
    reviewStatus: 'new',
    evidenceItems: [
      {
        id: 'EVD-803-1',
        label: 'SCADA Pressure Transducer Log',
        type: 'sensor',
        description: 'Sudden pressure drop logged at 04:22 AM; continuous volumetric differential of 18 m3/hour unaccounted for.',
      },
    ],
  },
  {
    id: 'CNR-2026-0806',
    title: 'Persistent Water Seepage Bubbling Through Kerb Joints',
    category: 'water_supply',
    description: 'Clean treated water continuously welling up through pre-cast concrete kerb stone joints along the sidewalk even though weather has been clear and sunny for 48 hours.',
    locationName: 'MBU Innovation Ring, Near Gate 2 Footpath',
    sector: 'Sector 7 - MBU Tech Zone',
    coordinates: { lat: 13.6368, lng: 79.4222 },
    timestamp: '2026-10-21T07:45:00Z',
    sourceType: 'citizen_app',
    reportedSeverity: 'moderate',
    reviewStatus: 'new',
    evidenceItems: [
      {
        id: 'EVD-806-1',
        label: 'Water Chlorine Test Strip Photo',
        type: 'photo',
        description: 'Residual free chlorine measured at 0.6 ppm, proving source is treated municipal water rather than sewage or groundwater.',
      },
    ],
  },
  {
    id: 'CNR-2026-0809',
    title: 'Localized Road Pavement Depression & Hollow Sub-base',
    category: 'road_damage',
    description: 'Circular asphalt depression (approx 2m diameter) sagging by 9cm with hollow sound when heavy delivery trucks pass over. Risk of sudden sinkhole formation.',
    locationName: 'MBU Innovation Ring, Km 0.8 Crossway',
    sector: 'Sector 7 - MBU Tech Zone',
    coordinates: { lat: 13.6372, lng: 79.4228 },
    timestamp: '2026-10-22T14:30:00Z',
    sourceType: 'field_inspector',
    reportedSeverity: 'critical',
    reviewStatus: 'new',
    evidenceItems: [
      {
        id: 'EVD-809-1',
        label: 'Acoustic Sounding Inspection Note',
        type: 'work_order',
        description: 'Sub-surface sounding indicates empty cavity under bituminous concrete layer; fines washed away by pressurized water jetting.',
      },
    ],
  },

  // ==========================================
  // SCENARIO C: Alipiri Feeder Link (Storm Inundation of Unsealed Electrical Vault)
  // Coordinates span Lat 13.6420 to 13.6432, Lng 79.4140 to 79.4155 (~150m corridor)
  // ==========================================
  {
    id: 'CNR-2026-0805',
    title: 'Intermittent LED Streetlight Feeder Circuit Tripping',
    category: 'electrical_hazard',
    description: 'A 600m segment of LED street lights along the Alipiri Underpass feeder repeatedly trips at the distribution substation 15 minutes after automated turn-on.',
    locationName: 'Alipiri Arterial Link, Feeder Box FB-04',
    sector: 'Sector 2 - Alipiri Link',
    coordinates: { lat: 13.6422, lng: 79.4142 },
    timestamp: '2026-10-20T18:50:00Z',
    sourceType: 'municipal_helpline',
    reportedSeverity: 'moderate',
    reviewStatus: 'new',
    evidenceItems: [
      {
        id: 'EVD-805-1',
        label: 'Substation Earth-Leakage Relay Log',
        type: 'sensor',
        description: 'Earth fault relay tripped at 300mA residual current threshold repeatedly across 3 nights.',
      },
    ],
  },
  {
    id: 'CNR-2026-0808',
    title: 'Underground Low-Tension Electrical Vault Inundation',
    category: 'electrical_hazard',
    description: 'Concrete electrical pull-box vault is completely flooded with muddy stormwater due to an adjacent uncleaned curb drain inlet overflowing into the cable chamber.',
    locationName: 'Alipiri Arterial Link, Km 1.1 Underpass Approach',
    sector: 'Sector 2 - Alipiri Link',
    coordinates: { lat: 13.6429, lng: 79.4151 },
    timestamp: '2026-10-21T19:10:00Z',
    sourceType: 'field_inspector',
    reportedSeverity: 'high',
    reviewStatus: 'new',
    evidenceItems: [
      {
        id: 'EVD-808-1',
        label: 'Chamber Inspection Photograph',
        type: 'photo',
        description: 'Photo showing 415V distribution busbars submerged in 35cm of standing muddy runoff water.',
      },
    ],
  },

  // ==========================================
  // CONTROL INCIDENTS (Isolated / Unrelated across different sectors)
  // Demonstrates that CiviNexus does NOT blindly merge everything into one giant cluster.
  // ==========================================
  {
    id: 'CNR-2026-0811',
    title: 'Unauthorized Heavy Commercial Signboard Obscuring Sightline',
    category: 'road_damage', // Road safety / obstruction
    description: 'Heavy structural steel advertisement framework erected without municipal permit within 2 meters of the carriageway, blocking visibility of approaching traffic.',
    locationName: 'Renigunta Highway, Km 8.4 Toll Overpass',
    sector: 'Sector 9 - Renigunta Corridor',
    coordinates: { lat: 13.6480, lng: 79.4450 },
    timestamp: '2026-10-22T15:20:00Z',
    sourceType: 'citizen_app',
    reportedSeverity: 'low',
    reviewStatus: 'new',
    evidenceItems: [
      {
        id: 'EVD-811-1',
        label: 'Junction Sightline Photo',
        type: 'photo',
        description: 'Photographic evidence showing obstructed sightline for right-turning commercial vehicles.',
      },
    ],
  },
  {
    id: 'CNR-2026-0812',
    title: 'Secondary Commercial Solid Waste Bin Overflow & Littering',
    category: 'solid_waste',
    description: '4.5 cubic meter community dumper placer container overflowing with decomposed organic wet waste from wholesale vegetable vendors. Waste spilling into pedestrian walkway.',
    locationName: 'Bhavani Nagar Vegetable Mandi Lane',
    sector: 'Sector 3 - Bhavani Nagar Market',
    coordinates: { lat: 13.6210, lng: 79.4130 },
    timestamp: '2026-10-23T08:15:00Z',
    sourceType: 'citizen_app',
    reportedSeverity: 'moderate',
    reviewStatus: 'new',
    evidenceItems: [
      {
        id: 'EVD-812-1',
        label: 'Community Bin Photo',
        type: 'photo',
        description: 'Photo showing overflowing garbage bin and stray dogs foraging around footpath.',
      },
    ],
  },
  {
    id: 'CNR-2026-0813',
    title: 'Stray Cattle Gathering on High-Speed Median Strip',
    category: 'road_damage',
    description: 'Herd of 8 unmanaged cattle resting on the median divider and straying onto the fast lane during morning commute hours, creating high-speed braking hazard.',
    locationName: 'Air Bypass Road, Near RTC Workshop Flyover',
    sector: 'Sector 5 - Air Bypass Expressway',
    coordinates: { lat: 13.6150, lng: 79.4290 },
    timestamp: '2026-10-23T10:40:00Z',
    sourceType: 'municipal_helpline',
    reportedSeverity: 'moderate',
    reviewStatus: 'new',
    evidenceItems: [
      {
        id: 'EVD-813-1',
        label: 'CCTV Surveillance Frame',
        type: 'sensor',
        description: 'Traffic camera frame capturing cattle herd on median causing evasive maneuvers.',
      },
    ],
  },
  {
    id: 'CNR-2026-0814',
    title: 'Vehicular Collision Damaged Pedestrian Crash Barrier',
    category: 'road_damage',
    description: 'Three sections of W-beam galvanized steel crash barrier bent into the pedestrian footpath following an overnight single-vehicle collision. Sharp edges exposed.',
    locationName: 'Korlagunta Junction, Pedestrian Crossing Bay',
    sector: 'Sector 6 - Korlagunta Urban',
    coordinates: { lat: 13.6330, lng: 79.4350 },
    timestamp: '2026-10-23T17:30:00Z',
    sourceType: 'citizen_app',
    reportedSeverity: 'high',
    reviewStatus: 'new',
    evidenceItems: [
      {
        id: 'EVD-814-1',
        label: 'Crash Barrier Damage Photo',
        type: 'photo',
        description: 'Photo showing sheared anchor bolts, crushed steel beams, and exposed metal flanges.',
      },
    ],
  },
];
