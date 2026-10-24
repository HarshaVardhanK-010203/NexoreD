import React, { useState } from 'react';
import { useCivic } from '../context/CivicContext';
import { CivicReport } from '../types';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Layers,
  LayoutGrid,
  List,
  AlertCircle,
} from 'lucide-react';
import { formatRelativeTime } from '../utils/geo';
import { ReportModal } from './ReportModal';
import { ReportDetailModal } from './ReportDetailModal';

export const ReportsView: React.FC = () => {
  const {
    reports,
    clusters,
    addReport,
    updateReport,
    deleteReport,
    setSelectedClusterId,
    setActiveTab,
  } = useCivic();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'severity' | 'evidence'>('date_desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<CivicReport | null>(null);
  const [detailReport, setDetailReport] = useState<CivicReport | null>(null);

  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      searchTerm === '' ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.sector.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || r.reviewStatus === statusFilter;
    const matchesSector =
      sectorFilter === 'all' || r.sector.toLowerCase().includes(sectorFilter.toLowerCase());

    return matchesSearch && matchesCategory && matchesStatus && matchesSector;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === 'date_desc') {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
    if (sortBy === 'date_asc') {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    }
    if (sortBy === 'evidence') {
      return b.evidenceItems.length - a.evidenceItems.length;
    }
    if (sortBy === 'severity') {
      const rank: Record<string, number> = { critical: 4, high: 3, moderate: 2, low: 1 };
      return (rank[b.reportedSeverity] || 0) - (rank[a.reportedSeverity] || 0);
    }
    return 0;
  });

  const uniqueSectors = Array.from(new Set(reports.map((r) => r.sector))).filter(Boolean);

  const handleOpenCluster = (clusterId: string) => {
    setSelectedClusterId(clusterId);
    setActiveTab('root_cause');
  };

  const handleCreateSubmit = (reportData: Omit<CivicReport, 'id'>) => {
    addReport(reportData);
  };

  const handleEditSubmit = (reportData: Omit<CivicReport, 'id'>) => {
    if (editingReport) {
      updateReport(editingReport.id, reportData);
      setEditingReport(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-[#302335] pb-4">
        <div>
          <div className="font-mono text-xs text-[#BD4938] uppercase tracking-wider mb-1">
            Section 02 · Operational Ingestion
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#302335] flex items-baseline gap-3">
            <span>Civic Case Register</span>
            <span className="text-xs font-mono text-[#8D867F] font-normal">
              [{sortedReports.length} of {reports.length} records active]
            </span>
          </h2>
          <p className="text-xs font-sans text-[#8D867F] mt-1 max-w-xl">
            Archival intake ledger documenting incident dimensions, geo-coordinates, reporter sources, and attached photographic and telemetry evidence.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2 text-xs font-mono font-medium text-[#FFFDF8] bg-[#BD4938] hover:bg-[#A63C2D] border border-[#BD4938] rounded transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record New Incident</span>
        </button>
      </div>

      {/* Filter and Control Bar (Parchment Docket Filter) */}
      <div className="border border-[#302335] bg-[#FFFDF8] p-4 sm:p-5 space-y-3 shadow-xs">
        {/* Search & View Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8D867F]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID, keyword, chainage, street, or description..."
              className="w-full pl-9 pr-3 py-1.5 text-xs font-sans rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] placeholder-[#8D867F] focus:outline-none focus:border-[#BD4938]"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center p-0.5 rounded border border-[#302335]/30 bg-[#F4F0E6]">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === 'table' ? 'bg-[#302335] text-[#FFFDF8]' : 'text-[#302335] hover:bg-[#EAE4D5]'
                }`}
                title="Table view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === 'cards' ? 'bg-[#302335] text-[#FFFDF8]' : 'text-[#302335] hover:bg-[#EAE4D5]'
                }`}
                title="Cards view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#302335]/15 text-xs font-mono">
          <div>
            <label className="block text-[11px] text-[#8D867F] uppercase mb-1">Issue Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] focus:outline-none focus:border-[#BD4938]"
            >
              <option value="all">All Categories</option>
              <option value="road_damage">Road Damage</option>
              <option value="drainage_overflow">Drainage & Culverts</option>
              <option value="water_supply">Water Supply Pipe</option>
              <option value="utility_excavation">Utility Excavation</option>
              <option value="electrical_hazard">Electrical Hazard</option>
              <option value="solid_waste">Solid Waste</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-[#8D867F] uppercase mb-1">Corridor Sector</label>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] focus:outline-none focus:border-[#BD4938]"
            >
              <option value="all">All Sectors</option>
              {uniqueSectors.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-[#8D867F] uppercase mb-1">Review Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] focus:outline-none focus:border-[#BD4938]"
            >
              <option value="all">All Statuses</option>
              <option value="new">New (Unreviewed)</option>
              <option value="clustered">Clustered</option>
              <option value="under_review">Under Review</option>
              <option value="requires_inspection">Requires Field Inspection</option>
              <option value="confirmed_finding">Confirmed Finding</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-[#8D867F] uppercase mb-1">Sort Order</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-1.5 rounded bg-[#F4F0E6] border border-[#302335]/30 text-[#302335] focus:outline-none focus:border-[#BD4938]"
            >
              <option value="date_desc">Newest Date First</option>
              <option value="date_asc">Oldest Date First</option>
              <option value="severity">Highest Severity</option>
              <option value="evidence">Most Evidence Items</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Table or Cards */}
      {sortedReports.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-[#302335]/20 bg-[#FFFDF8] text-[#8D867F] space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto text-[#BD4938]" />
          <p className="font-serif text-base text-[#302335]">No reports match your active filter parameters.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setStatusFilter('all');
              setSectorFilter('all');
            }}
            className="px-3.5 py-1.5 text-xs font-mono text-[#302335] bg-[#EAE4D5] rounded hover:bg-[#D8D0C0] transition-colors"
          >
            Clear All Active Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="border border-[#302335] bg-[#FFFDF8] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#F4F0E6] border-b-2 border-[#302335] text-[#302335] font-mono uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Docket ID</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Incident Summary & Location</th>
                  <th className="py-3 px-4 font-bold">Intake Channel</th>
                  <th className="py-3 px-4 font-bold">Severity</th>
                  <th className="py-3 px-4 font-bold">Corridor Link</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#302335]/15">
                {sortedReports.map((report) => {
                  const linkedCluster = report.clusterId
                    ? clusters.find((c) => c.id === report.clusterId)
                    : clusters.find((c) => c.reportIds.includes(report.id));

                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-[#FAF7F0] transition-colors cursor-pointer"
                      onClick={() => setDetailReport(report)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-[#BD4938] whitespace-nowrap">
                        {report.id}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-[#302335] uppercase">
                        {report.category.replace('_', ' ')}
                      </td>

                      <td className="py-3 px-4 max-w-sm">
                        <div className="font-serif font-bold text-[#302335] line-clamp-1">{report.title}</div>
                        <div className="text-[#8D867F] text-[11px] line-clamp-1">{report.locationName}</div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs text-[#8D867F] uppercase">
                        {report.sourceType.replace('_', ' ')}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap font-mono text-xs">
                        <span
                          className={`font-bold uppercase ${
                            report.reportedSeverity === 'critical'
                              ? 'text-[#BD4938]'
                              : report.reportedSeverity === 'high'
                              ? 'text-[#D3AA57]'
                              : 'text-[#302335]'
                          }`}
                        >
                          {report.reportedSeverity}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        {linkedCluster ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCluster(linkedCluster.id);
                            }}
                            className="text-[#302335] font-mono text-[11px] flex items-center gap-1 hover:text-[#BD4938] font-bold"
                            title="Inspect in Root-Cause Cockpit"
                          >
                            <Layers className="w-3 h-3 text-[#BD4938]" />
                            <span>{linkedCluster.id}</span>
                          </button>
                        ) : (
                          <span className="text-[#8D867F] font-mono text-[11px] italic">Unbundled</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1 font-mono text-xs">
                          <button
                            onClick={() => setDetailReport(report)}
                            className="p-1 rounded text-[#302335] hover:bg-[#EAE4D5]"
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingReport(report)}
                            className="p-1 rounded text-[#302335] hover:bg-[#EAE4D5]"
                            title="Edit report"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete report ${report.id}?`)) {
                                deleteReport(report.id);
                              }
                            }}
                            className="p-1 rounded text-[#BD4938] hover:bg-[#EAE4D5]"
                            title="Delete report"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View styled as Archival Index Tickets */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedReports.map((report) => {
            const linkedCluster = report.clusterId
              ? clusters.find((c) => c.id === report.clusterId)
              : clusters.find((c) => c.reportIds.includes(report.id));

            return (
              <div
                key={report.id}
                onClick={() => setDetailReport(report)}
                className="p-4 border-2 border-[#302335] bg-[#FFFDF8] hover:bg-[#FAF7F0] transition-colors cursor-pointer space-y-2.5 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2 border-b border-[#302335]/15 pb-2">
                  <div className="font-mono text-xs">
                    <span className="font-bold text-[#BD4938]">{report.id}</span>
                    <span className="text-[#8D867F] mx-1">/</span>
                    <span className="text-[#302335] uppercase">{report.category.replace('_', ' ')}</span>
                  </div>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 font-bold uppercase ${
                      report.reportedSeverity === 'critical'
                        ? 'bg-[#BD4938] text-[#FFFDF8]'
                        : report.reportedSeverity === 'high'
                        ? 'bg-[#D3AA57] text-[#302335]'
                        : 'bg-[#EAE4D5] text-[#302335]'
                    }`}
                  >
                    {report.reportedSeverity}
                  </span>
                </div>

                <div>
                  <h4 className="font-serif text-base font-bold text-[#302335] line-clamp-1">{report.title}</h4>
                  <p className="text-xs font-sans text-[#8D867F] line-clamp-2 mt-1">{report.description}</p>
                </div>

                <div className="text-[11px] font-mono text-[#8D867F] pt-2 border-t border-[#302335]/10 flex items-center justify-between">
                  <span className="truncate max-w-[180px]">{report.locationName}</span>
                  <span>{formatRelativeTime(report.timestamp)}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#302335]/10 font-mono text-xs">
                  {linkedCluster ? (
                    <span className="text-[#302335] font-bold flex items-center gap-1 text-[11px]">
                      <Layers className="w-3 h-3 text-[#BD4938]" />
                      <span>{linkedCluster.id}</span>
                    </span>
                  ) : (
                    <span className="text-[#8D867F] text-[11px] italic">Unbundled</span>
                  )}
                  <span className="text-[#8D867F] text-[11px] tabular-nums">
                    {report.evidenceItems.length} Evidence
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Report Modal */}
      <ReportModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Report Modal */}
      {editingReport && (
        <ReportModal
          isOpen={true}
          initialReport={editingReport}
          onClose={() => setEditingReport(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Detail Inspection Modal */}
      {detailReport && (
        <ReportDetailModal
          report={detailReport}
          clusters={clusters}
          allReports={reports}
          onClose={() => setDetailReport(null)}
          onOpenCluster={handleOpenCluster}
          onEditReport={(rep) => {
            setDetailReport(null);
            setEditingReport(rep);
          }}
        />
      )}
    </div>
  );
};
