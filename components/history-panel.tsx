'use client';

import React, { useState } from 'react';
import { Trash2, Download } from 'lucide-react';
import type { StoredAnalysis } from '@/lib/storage-service';

interface HistoryFiltersProps {
  onStatusFilterChange: (status: 'all' | 'clean' | 'warning' | 'threat') => void;
  onSortChange: (sort: 'date' | 'score') => void;
  currentStatus: 'all' | 'clean' | 'warning' | 'threat';
  currentSort: 'date' | 'score';
}

export function HistoryFilters({
  onStatusFilterChange,
  onSortChange,
  currentStatus,
  currentSort
}: HistoryFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
      {/* Status Filter */}
      <div className="flex-1">
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Filter by Status</p>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'clean', 'warning', 'threat'] as const).map(status => (
            <button
              key={status}
              onClick={() => onStatusFilterChange(status)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                currentStatus === status
                  ? status === 'clean'
                    ? 'bg-green-500/30 border border-green-400/70 text-green-300'
                    : status === 'warning'
                    ? 'bg-yellow-500/30 border border-yellow-400/70 text-yellow-300'
                    : status === 'threat'
                    ? 'bg-red-500/30 border border-red-400/70 text-red-300'
                    : 'bg-cyan-500/30 border border-cyan-400/70 text-cyan-300'
                  : 'bg-gray-700/30 border border-gray-600/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex-1">
        <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Sort By</p>
        <div className="flex gap-2">
          {(['date', 'score'] as const).map(sort => (
            <button
              key={sort}
              onClick={() => onSortChange(sort)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex-1 ${
                currentSort === sort
                  ? 'bg-cyan-500/30 border border-cyan-400/70 text-cyan-300'
                  : 'bg-gray-700/30 border border-gray-600/50 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              {sort === 'date' ? 'Recent' : 'Highest Risk'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface HistoryPanelProps {
  analyses: StoredAnalysis[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onDownloadReport: (analysis: StoredAnalysis) => void;
}

export function HistoryPanel({
  analyses,
  isLoading,
  onDelete,
  onDownloadReport
}: HistoryPanelProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'clean' | 'warning' | 'threat'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [deleting, setDeleting] = useState<string | null>(null);

  const filteredAndSorted = analyses
    .filter(a => statusFilter === 'all' || a.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
      return b.deepfakeScore - a.deepfakeScore;
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400">Loading analysis history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <HistoryFilters
        currentStatus={statusFilter}
        currentSort={sortBy}
        onStatusFilterChange={setStatusFilter}
        onSortChange={setSortBy}
      />

      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-2">No analyses found</p>
          <p className="text-sm text-gray-500">Upload a video to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSorted.map(analysis => (
            <div
              key={analysis.id}
              className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{analysis.fileName}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(analysis.uploadedAt).toLocaleString()}
                  </p>
                </div>

                {/* Status Badge */}
                <div
                  className={`ml-2 px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                    analysis.status === 'clean'
                      ? 'bg-green-500/20 text-green-300'
                      : analysis.status === 'warning'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {analysis.status.toUpperCase()}
                </div>
              </div>

              {/* Score */}
              <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Deepfake Score</p>
                  <p className="font-semibold text-cyan-400">
                    {(analysis.deepfakeScore * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Confidence</p>
                  <p className="font-semibold text-cyan-400">
                    {(analysis.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onDownloadReport(analysis)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30 transition-colors text-xs font-medium"
                >
                  <Download className="w-4 h-4" />
                  Report
                </button>
                <button
                  onClick={async () => {
                    setDeleting(analysis.id);
                    await onDelete(analysis.id);
                    setDeleting(null);
                  }}
                  disabled={deleting === analysis.id}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded bg-red-500/20 border border-red-400/50 text-red-300 hover:bg-red-500/30 transition-colors text-xs font-medium disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
