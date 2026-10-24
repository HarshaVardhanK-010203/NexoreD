import React, { useState, useEffect } from 'react';
import { CivicReport, CivicCategory, ReportSource, EvidenceItem } from '../types';
import { X, AlertCircle, Plus, Trash2, MapPin } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<CivicReport, 'id'>) => void;
  initialReport?: CivicReport | null;
}

const PRESET_LOCATIONS = [
  { name: 'Chandragiri Main Road, Km 4.3 Junction 4', sector: 'Sector 4 - Chandragiri Corridor', lat: 13.6295, lng: 79.4090 },
  { name: 'MBU Innovation Ring, Gate 2', sector: 'Sector 7 - MBU Tech Zone', lat: 13.6366, lng: 79.4220 },
  { name: 'Alipiri Arterial Underpass Approach', sector: 'Sector 2 - Alipiri Link', lat: 13.6425, lng: 79.4145 },
  { name: 'Renigunta Toll Overpass, Km 8.4', sector: 'Sector 9 - Renigunta Corridor', lat: 13.6480, lng: 79.4450 },
  { name: 'Bhavani Nagar Market Lane', sector: 'Sector 3 - Bhavani Nagar Market', lat: 13.6210, lng: 79.4130 },
  { name: 'Air Bypass Road, RTC Workshop Flyover', sector: 'Sector 5 - Air Bypass Expressway', lat: 13.6150, lng: 79.4290 },
  { name: 'Korlagunta Junction Pedestrian Crossing', sector: 'Sector 6 - Korlagunta Urban', lat: 13.6330, lng: 79.4350 },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialReport,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CivicCategory>('road_damage');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [sector, setSector] = useState('Sector 4 - Chandragiri Corridor');
  const [lat, setLat] = useState('13.6295');
  const [lng, setLng] = useState('79.4090');
  const [sourceType, setSourceType] = useState<ReportSource>('citizen_app');
  const [reportedSeverity, setReportedSeverity] = useState<'low' | 'moderate' | 'high' | 'critical'>('moderate');
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [newEvidenceLabel, setNewEvidenceLabel] = useState('');
  const [newEvidenceDesc, setNewEvidenceDesc] = useState('');
  const [newEvidenceType, setNewEvidenceType] = useState<'photo' | 'rainfall_log' | 'sensor' | 'witness' | 'work_order'>('photo');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialReport) {
      setTitle(initialReport.title);
      setCategory(initialReport.category);
      setDescription(initialReport.description);
      setLocationName(initialReport.locationName);
      setSector(initialReport.sector);
      setLat(String(initialReport.coordinates.lat));
      setLng(String(initialReport.coordinates.lng));
      setSourceType(initialReport.sourceType);
      setReportedSeverity(initialReport.reportedSeverity);
      setEvidenceList(initialReport.evidenceItems || []);
    } else {
      setTitle('');
      setCategory('road_damage');
      setDescription('');
      setLocationName('');
      setSector('Sector 4 - Chandragiri Corridor');
      setLat('13.6295');
      setLng('79.4090');
      setSourceType('citizen_app');
      setReportedSeverity('moderate');
      setEvidenceList([
        {
          id: `EVD-NEW-1`,
          label: 'Citizen Photo / Site Observation',
          type: 'photo',
          description: 'Initial site photograph submitted with civic filing.',
        },
      ]);
    }
    setErrors({});
  }, [initialReport, isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof PRESET_LOCATIONS[0]) => {
    setLocationName(preset.name);
    setSector(preset.sector);
    setLat(String(preset.lat));
    setLng(String(preset.lng));
  };

  const handleAddEvidence = () => {
    if (!newEvidenceLabel.trim() || !newEvidenceDesc.trim()) return;
    setEvidenceList([
      ...evidenceList,
      {
        id: `EVD-MAN-${Math.random().toString(36).substring(2, 6)}`,
        label: newEvidenceLabel.trim(),
        description: newEvidenceDesc.trim(),
        type: newEvidenceType,
      },
    ]);
    setNewEvidenceLabel('');
    setNewEvidenceDesc('');
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceList(evidenceList.filter((e) => e.id !== id));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!title.trim() || title.length < 5) {
      errs.title = 'Title must be at least 5 characters long.';
    }
    if (!description.trim() || description.length < 15) {
      errs.description = 'Provide a descriptive observation (at least 15 characters).';
    }
    if (!locationName.trim()) {
      errs.locationName = 'Location landmark cannot be blank.';
    }
    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);
    if (isNaN(numLat) || numLat < 13.5 || numLat > 13.8) {
      errs.lat = 'Valid Tirupati region latitude required (13.5 to 13.8).';
    }
    if (isNaN(numLng) || numLng < 79.2 || numLng > 79.6) {
      errs.lng = 'Valid Tirupati region longitude required (79.2 to 79.6).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      category,
      description: description.trim(),
      locationName: locationName.trim(),
      sector,
      coordinates: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      timestamp: initialReport?.timestamp || new Date().toISOString(),
      sourceType,
      reportedSeverity,
      reviewStatus: initialReport?.reviewStatus || 'new',
      evidenceItems: evidenceList,
      clusterId: initialReport?.clusterId,
      notes: initialReport?.notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#302335]/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 border-2 border-[#302335] bg-[#FFFDF8] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#302335] bg-[#F4F0E6]">
          <div>
            <div className="font-mono text-xs text-[#BD4938] uppercase tracking-wider mb-0.5">
              Municipal Case Ingestion Form
            </div>
            <h3 className="font-serif text-xl font-bold text-[#302335]">
              {initialReport ? 'Edit Civic Incident Docket' : 'File New Civic Incident Docket'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#302335] hover:bg-[#EAE4D5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto font-sans text-xs">
          {/* Title */}
          <div>
            <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#302335] mb-1">
              Incident Summary / Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep pothole expanding near culvert inflow"
              className="w-full px-3 py-2 rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] placeholder-[#8D867F] focus:outline-none focus:border-[#BD4938]"
            />
            {errors.title && (
              <span className="text-xs text-[#BD4938] flex items-center gap-1 mt-1 font-mono">
                <AlertCircle className="w-3 h-3" /> {errors.title}
              </span>
            )}
          </div>

          {/* Category & Severity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#302335] mb-1">
                Issue Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CivicCategory)}
                className="w-full px-3 py-2 rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] focus:outline-none focus:border-[#BD4938]"
              >
                <option value="road_damage">Road Damage & Surface Cratering</option>
                <option value="drainage_overflow">Drainage & Stormwater Culvert Blockage</option>
                <option value="water_supply">Water Supply Pipe Leak & Pressure Loss</option>
                <option value="utility_excavation">Utility Excavation & Trench Settlement</option>
                <option value="electrical_hazard">Electrical Vault / Streetlight Hazard</option>
                <option value="solid_waste">Solid Waste Blockage</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#302335] mb-1">
                Reported Severity *
              </label>
              <select
                value={reportedSeverity}
                onChange={(e) => setReportedSeverity(e.target.value as any)}
                className="w-full px-3 py-2 rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] focus:outline-none focus:border-[#BD4938]"
              >
                <option value="low">Low (Minor cosmetic issue, manageable)</option>
                <option value="moderate">Moderate (Pavement distress, slow traffic)</option>
                <option value="high">High (Severe pothole, flood hazard)</option>
                <option value="critical">Critical (Imminent cavitation / live electrical hazard)</option>
              </select>
            </div>
          </div>

          {/* Quick Preset Location Selector */}
          <div>
            <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#8D867F] mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#BD4938]" /> Quick-Fill Municipal Corridor:
            </label>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              {PRESET_LOCATIONS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectPreset(preset)}
                  className="px-2 py-0.5 rounded bg-[#F4F0E6] border border-[#302335]/20 hover:bg-[#EAE4D5] text-[#302335]"
                >
                  {preset.sector.split(' - ')[1]}
                </button>
              ))}
            </div>
          </div>

          {/* Location Name & Sector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#302335] mb-1">
                Location Landmark / Chainage *
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Chandragiri Main Road, Km 4.3 near Junction 4"
                className="w-full px-3 py-2 rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] placeholder-[#8D867F] focus:outline-none focus:border-[#BD4938]"
              />
              {errors.locationName && (
                <span className="text-xs text-[#BD4938] flex items-center gap-1 mt-1 font-mono">
                  <AlertCircle className="w-3 h-3" /> {errors.locationName}
                </span>
              )}
            </div>

            <div>
              <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#302335] mb-1">
                Operational Sector *
              </label>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="Sector 4 - Chandragiri Corridor"
                className="w-full px-3 py-2 rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] focus:outline-none focus:border-[#BD4938]"
              />
            </div>
          </div>

          {/* Coordinates & Intake Channel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#302335] mb-1">
                Latitude *
              </label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="13.6295"
                className="w-full px-3 py-2 rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] focus:outline-none focus:border-[#BD4938]"
              />
              {errors.lat && <span className="text-xs text-[#BD4938] mt-1 block">{errors.lat}</span>}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#302335] mb-1">
                Longitude *
              </label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="79.4090"
                className="w-full px-3 py-2 rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] focus:outline-none focus:border-[#BD4938]"
              />
              {errors.lng && <span className="text-xs text-[#BD4938] mt-1 block">{errors.lng}</span>}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#302335] mb-1">
                Intake Channel
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as ReportSource)}
                className="w-full px-3 py-2 rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] focus:outline-none focus:border-[#BD4938]"
              >
                <option value="citizen_app">Citizen Mobile App</option>
                <option value="field_inspector">Field Inspector</option>
                <option value="municipal_helpline">Municipal Helpline</option>
                <option value="iot_telemetry">IoT / SCADA Sensor</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#302335] mb-1">
              Field Observation Details *
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe physical dimensions, water depth, pavement shear, duration, or observed vehicle impact..."
              className="w-full px-3 py-2 rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] placeholder-[#8D867F] focus:outline-none focus:border-[#BD4938] font-sans"
            />
            {errors.description && (
              <span className="text-xs text-[#BD4938] flex items-center gap-1 mt-1 font-mono">
                <AlertCircle className="w-3 h-3" /> {errors.description}
              </span>
            )}
          </div>

          {/* Evidence Attachments */}
          <div className="pt-2 border-t border-[#302335]/15">
            <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#302335] mb-2">
              Attached Evidence ({evidenceList.length} items)
            </label>

            <div className="space-y-2 mb-3">
              {evidenceList.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded bg-[#F4F0E6] border border-[#302335]/20 font-mono text-xs"
                >
                  <div>
                    <span className="font-bold text-[#302335]">{ev.label}</span>
                    <span className="text-[#8D867F] mx-1.5">/</span>
                    <span className="text-[#BD4938] uppercase">{ev.type.replace('_', ' ')}</span>
                    <p className="font-sans text-[#8D867F] mt-0.5">{ev.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEvidence(ev.id)}
                    className="p-1 text-[#8D867F] hover:text-[#BD4938] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Evidence Inline */}
            <div className="p-3 border border-[#302335]/20 bg-[#FAF7F0] space-y-2 font-mono text-xs">
              <span className="font-bold text-[#302335] uppercase text-[11px]">Append Documentary Evidence:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Evidence Label"
                  value={newEvidenceLabel}
                  onChange={(e) => setNewEvidenceLabel(e.target.value)}
                  className="px-2.5 py-1.5 rounded bg-[#FFFDF8] border border-[#302335]/30 text-[#302335]"
                />
                <select
                  value={newEvidenceType}
                  onChange={(e) => setNewEvidenceType(e.target.value as any)}
                  className="px-2.5 py-1.5 rounded bg-[#FFFDF8] border border-[#302335]/30 text-[#302335]"
                >
                  <option value="photo">Photo / Dashcam Still</option>
                  <option value="rainfall_log">Rainfall / Weather Gauge</option>
                  <option value="sensor">SCADA / Flow Sensor</option>
                  <option value="work_order">Official Work Order / Permit</option>
                  <option value="witness">Witness Statement</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddEvidence}
                  disabled={!newEvidenceLabel.trim() || !newEvidenceDesc.trim()}
                  className="px-3 py-1.5 rounded bg-[#302335] hover:bg-[#45334C] text-[#FFFDF8] disabled:opacity-40 transition-colors font-bold uppercase text-[11px]"
                >
                  + Append Evidence
                </button>
              </div>
              <input
                type="text"
                placeholder="Description of what this evidence demonstrates..."
                value={newEvidenceDesc}
                onChange={(e) => setNewEvidenceDesc(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-[#FFFDF8] border border-[#302335]/30 text-[#302335] font-sans"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#302335]/20 font-mono">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#8D867F] hover:text-[#302335]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-[#FFFDF8] bg-[#BD4938] hover:bg-[#A63C2D] rounded shadow-xs"
            >
              {initialReport ? 'Save Changes' : 'Submit & Re-Cluster'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
