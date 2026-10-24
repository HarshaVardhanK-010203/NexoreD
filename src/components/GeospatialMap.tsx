import React, { useState } from 'react';
import { CivicReport, IncidentCluster } from '../types';
import { Compass, Filter, Eye } from 'lucide-react';

interface GeospatialMapProps {
  reports: CivicReport[];
  clusters: IncidentCluster[];
  selectedClusterId: string | null;
  onSelectCluster: (clusterId: string) => void;
  onSelectReport: (reportId: string) => void;
}

export const GeospatialMap: React.FC<GeospatialMapProps> = ({
  reports,
  clusters,
  selectedClusterId,
  onSelectCluster,
  onSelectReport,
}) => {
  const [activeSectorFilter, setActiveSectorFilter] = useState<string>('all');
  const [hoveredReport, setHoveredReport] = useState<CivicReport | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<IncidentCluster | null>(null);

  // Map boundary projection (Tirupati Municipal Study Corridors)
  const minLat = 13.612;
  const maxLat = 13.652;
  const minLng = 79.405;
  const maxLng = 79.448;

  const project = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 740 + 30;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 430 + 35;
    return { x: Math.max(20, Math.min(780, x)), y: Math.max(20, Math.min(480, y)) };
  };

  const filteredReports = activeSectorFilter === 'all'
    ? reports
    : reports.filter((r) => r.sector.toLowerCase().includes(activeSectorFilter.toLowerCase()));

  const highlightedCluster =
    hoveredCluster || clusters.find((c) => c.id === selectedClusterId);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'road_damage':
        return '#BD4938'; // Oxide red
      case 'drainage_overflow':
        return '#D3AA57'; // Muted ochre
      case 'water_supply':
        return '#302335'; // Aubergine ink
      case 'utility_excavation':
        return '#8D867F'; // Warm grey
      case 'electrical_hazard':
        return '#7E5288'; // Deep lilac
      case 'solid_waste':
        return '#747D50'; // Botanical olive
      default:
        return '#8D867F';
    }
  };

  return (
    <div className="relative w-full rounded-none border-2 border-[#302335] bg-[#FFFDF8] overflow-hidden flex flex-col shadow-xs">
      {/* Architectural Map Header & Cartographic Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-[#302335]/20 bg-[#F4F0E6] text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold tracking-wider uppercase text-[#302335]">
            PLATE I · SPATIAL INCIDENT CARTOGRAPHY
          </span>
          <span className="text-[#8D867F]">/</span>
          <span className="text-[#8D867F] font-serif italic">Tirupati Municipal Study Corridors</span>
        </div>

        {/* Sector quick selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <span className="text-[#8D867F] mr-1 hidden sm:inline flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter Sector:
          </span>
          {[
            { id: 'all', label: 'All Corridors' },
            { id: 'chandragiri', label: 'Chandragiri' },
            { id: 'mbu', label: 'MBU Ring' },
            { id: 'alipiri', label: 'Alipiri' },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSectorFilter(sec.id)}
              className={`px-2 py-0.5 rounded transition-colors whitespace-nowrap ${
                activeSectorFilter === sec.id
                  ? 'bg-[#302335] text-[#FFFDF8] font-bold'
                  : 'text-[#302335] hover:bg-[#EAE4D5]'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full h-[400px] sm:h-[460px] bg-[#FAF7F0] overflow-hidden select-none">
        <svg
          viewBox="0 0 800 500"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Cartographic Coordinate Grid */}
          <defs>
            <pattern id="archGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E6DFC8" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="800" height="500" fill="url(#archGrid)" />

          {/* Elevation Contours */}
          <path
            d="M 20,120 Q 240,160 420,110 T 780,180"
            fill="none"
            stroke="#D8D0C0"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <path
            d="M 30,280 Q 260,320 510,270 T 780,340"
            fill="none"
            stroke="#D8D0C0"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <text x="730" y="175" fill="#8D867F" fontSize="9" fontFamily="monospace">CONTOUR +184m</text>
          <text x="730" y="335" fill="#8D867F" fontSize="9" fontFamily="monospace">CONTOUR +162m</text>

          {/* Roadway Arterials (Architectural Ink Style) */}
          {/* 1. Chandragiri Arterial */}
          <path
            d="M 60,370 C 140,320 220,290 320,275 C 440,250 560,260 720,290"
            fill="none"
            stroke="#C8BEAC"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 60,370 C 140,320 220,290 320,275 C 440,250 560,260 720,290"
            fill="none"
            stroke="#FFFDF8"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 60,370 C 140,320 220,290 320,275 C 440,250 560,260 720,290"
            fill="none"
            stroke="#302335"
            strokeWidth="1"
            strokeDasharray="6 6"
          />
          <text x="80" y="338" fill="#302335" fontSize="10" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.05em">
            CHANDRAGIRI ARTERIAL (SEC 4)
          </text>

          {/* 2. MBU Campus Innovation Ring */}
          <ellipse
            cx="440"
            cy="150"
            rx="120"
            ry="65"
            fill="none"
            stroke="#C8BEAC"
            strokeWidth="12"
          />
          <ellipse
            cx="440"
            cy="150"
            rx="120"
            ry="65"
            fill="none"
            stroke="#FFFDF8"
            strokeWidth="8"
          />
          <ellipse
            cx="440"
            cy="150"
            rx="120"
            ry="65"
            fill="none"
            stroke="#302335"
            strokeWidth="1"
            strokeDasharray="5 5"
          />
          <text x="365" y="152" fill="#302335" fontSize="10" fontFamily="sans-serif" fontWeight="700" letterSpacing="0.05em">
            MBU TECH RING (SEC 7)
          </text>

          {/* 3. Alipiri Arterial Link */}
          <path
            d="M 230,50 L 300,160 L 320,275"
            fill="none"
            stroke="#C8BEAC"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 230,50 L 300,160 L 320,275"
            fill="none"
            stroke="#FFFDF8"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <text x="205" y="75" fill="#302335" fontSize="9" fontFamily="sans-serif" fontWeight="700">
            ALIPIRI FEEDER (SEC 2)
          </text>

          {/* 4. Renigunta Highway */}
          <path
            d="M 560,260 L 740,110"
            fill="none"
            stroke="#C8BEAC"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 560,260 L 740,110"
            fill="none"
            stroke="#FFFDF8"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <text x="635" y="165" fill="#302335" fontSize="9" fontFamily="sans-serif" fontWeight="700">
            RENIGUNTA CORRIDOR (SEC 9)
          </text>

          {/* Pre-cast Stormwater Conduit */}
          <path
            d="M 120,310 L 195,300 L 270,295 L 340,315"
            fill="none"
            stroke="#D3AA57"
            strokeWidth="3"
            strokeDasharray="4 4"
          />
          <text x="140" y="295" fill="#A88235" fontSize="8" fontFamily="monospace" fontWeight="600">
            ▼ PRE-CAST CULVERT BARREL 900MM (CHOKED INLET)
          </text>

          {/* Cluster Spatial Corridors / Bounding Zones */}
          {clusters.map((cluster) => {
            const clusterReports = reports.filter((r) => cluster.reportIds.includes(r.id));
            if (clusterReports.length < 2) return null;

            const coords = clusterReports.map((r) => project(r.coordinates.lat, r.coordinates.lng));
            const xs = coords.map((c) => c.x);
            const ys = coords.map((c) => c.y);
            const minX = Math.min(...xs) - 24;
            const maxX = Math.max(...xs) + 24;
            const minY = Math.min(...ys) - 24;
            const maxY = Math.max(...ys) + 24;
            const width = maxX - minX;
            const height = maxY - minY;

            const isSelected = cluster.id === selectedClusterId;
            const isHovered = hoveredCluster?.id === cluster.id;

            return (
              <g
                key={cluster.id}
                className="cursor-pointer transition-all duration-200"
                onClick={() => onSelectCluster(cluster.id)}
                onMouseEnter={() => setHoveredCluster(cluster)}
                onMouseLeave={() => setHoveredCluster(null)}
              >
                {/* Cluster boundary */}
                <rect
                  x={minX}
                  y={minY}
                  width={width}
                  height={height}
                  fill={isSelected ? '#B8A9C5' : '#D3AA57'}
                  fillOpacity={isSelected ? 0.22 : isHovered ? 0.15 : 0.08}
                  stroke={isSelected ? '#302335' : '#8D867F'}
                  strokeWidth={isSelected ? 2 : 1}
                  strokeDasharray={isSelected ? 'none' : '4 3'}
                />

                {/* Cluster Label Stamp */}
                <rect
                  x={(minX + maxX) / 2 - 40}
                  y={minY - 10}
                  width="80"
                  height="16"
                  fill="#302335"
                  rx="1"
                />
                <text
                  x={(minX + maxX) / 2}
                  y={minY + 2}
                  fill="#FFFDF8"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {cluster.id} ({clusterReports.length})
                </text>
              </g>
            );
          })}

          {/* Incident Report Pins (Architectural Stamp Style) */}
          {filteredReports.map((report) => {
            const pos = project(report.coordinates.lat, report.coordinates.lng);
            const isInHighlightedCluster = highlightedCluster?.reportIds.includes(report.id);
            const isHovered = hoveredReport?.id === report.id;
            const pinColor = getCategoryColor(report.category);

            return (
              <g
                key={report.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer group"
                onClick={() => onSelectReport(report.id)}
                onMouseEnter={() => setHoveredReport(report)}
                onMouseLeave={() => setHoveredReport(null)}
              >
                {/* Highlight ring if linked or hovered */}
                {(isInHighlightedCluster || isHovered) && (
                  <circle
                    r="12"
                    fill="none"
                    stroke={pinColor}
                    strokeWidth="1.5"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Outer square architectural marker */}
                <rect
                  x="-5"
                  y="-5"
                  width="10"
                  height="10"
                  fill={pinColor}
                  stroke="#302335"
                  strokeWidth="1"
                  className="transition-transform duration-150 group-hover:scale-125"
                />

                {/* Inner white dot */}
                <circle r="1.5" fill="#FFFDF8" />

                {/* Report ID label */}
                <text
                  x="8"
                  y="3"
                  fill="#302335"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="600"
                  className="pointer-events-none select-none opacity-80 group-hover:opacity-100"
                >
                  {report.id.replace('CNR-2026-', '')}
                </text>
              </g>
            );
          })}

          {/* Compass Rose (North Arrow) */}
          <g transform="translate(745, 45)">
            <circle r="18" fill="#FFFDF8" stroke="#302335" strokeWidth="1" />
            <polygon points="0,-14 4,-2 0,0 -4,-2" fill="#302335" />
            <polygon points="0,14 4,2 0,0 -4,2" fill="#8D867F" />
            <text x="0" y="-17" textAnchor="middle" fontSize="8" fontFamily="monospace" fontWeight="bold" fill="#302335">N</text>
          </g>

          {/* Graphic Scale Bar */}
          <g transform="translate(680, 475)">
            <rect x="0" y="0" width="80" height="4" fill="#302335" />
            <rect x="40" y="0" width="40" height="4" fill="#8D867F" />
            <text x="0" y="-3" fontSize="7" fontFamily="monospace" fill="#302335">0</text>
            <text x="40" y="-3" fontSize="7" fontFamily="monospace" fill="#302335">200m</text>
            <text x="80" y="-3" fontSize="7" fontFamily="monospace" fill="#302335">400m</text>
          </g>
        </svg>

        {/* Live Hover Tooltip styled as an Architectural Inspection Ticket */}
        {hoveredReport && (
          <div
            className="absolute z-20 pointer-events-none p-3 border-2 border-[#302335] bg-[#FFFDF8] shadow-lg max-w-xs text-xs font-sans"
            style={{
              left: `${Math.min(520, Math.max(20, project(hoveredReport.coordinates.lat, hoveredReport.coordinates.lng).x))}px`,
              top: `${Math.min(320, project(hoveredReport.coordinates.lat, hoveredReport.coordinates.lng).y + 16)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-[#302335]/20 pb-1 mb-1 font-mono text-[11px]">
              <span className="font-bold text-[#BD4938]">{hoveredReport.id}</span>
              <span className="text-[#302335] uppercase">{hoveredReport.category.replace('_', ' ')}</span>
            </div>
            <div className="text-[#302335] font-serif font-bold text-sm mb-1 leading-snug">{hoveredReport.title}</div>
            <div className="text-[#8D867F] text-[11px] mb-2">{hoveredReport.locationName}</div>
            <div className="flex items-center justify-between pt-1 border-t border-[#302335]/10 text-[11px] font-mono text-[#302335]">
              <span>Severity: <strong>{hoveredReport.reportedSeverity.toUpperCase()}</strong></span>
              <span>{hoveredReport.evidenceItems.length} Evidence</span>
            </div>
          </div>
        )}
      </div>

      {/* Cartographic Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-t border-[#302335]/20 bg-[#F4F0E6] text-[11px] font-mono text-[#302335]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold uppercase tracking-wider text-[#302335]">Legend:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#BD4938] border border-[#302335] inline-block" /> Road Cratering
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#D3AA57] border border-[#302335] inline-block" /> Culvert Drainage
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#302335] border border-[#302335] inline-block" /> Potable Water Main
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#8D867F] border border-[#302335] inline-block" /> Utility Trench
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#7E5288] border border-[#302335] inline-block" /> Electrical Vault
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#747D50] border border-[#302335] inline-block" /> Solid Waste
          </span>
        </div>

        <div className="text-[#8D867F]">
          Click pin or cluster perimeter to inspect case
        </div>
      </div>
    </div>
  );
};
