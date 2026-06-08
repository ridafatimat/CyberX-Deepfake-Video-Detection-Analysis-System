'use client';

import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ResultCardProps {
  deepfakeScore: number; // 0-1
  confidence: number; // 0-1
  status: 'clean' | 'warning' | 'threat';
  fileName: string;
  analysisDate: string;
  frameAnalysis: Array<{ frame: number; score: number }>;
  detectedArtifacts: string[];
  onDownloadReport?: () => void;
}

export function ResultCard({
  deepfakeScore,
  confidence,
  status,
  fileName,
  analysisDate,
  frameAnalysis,
  detectedArtifacts,
  onDownloadReport
}: ResultCardProps) {
  const statusConfig = {
    clean: {
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      borderColor: 'border-green-400/30',
      icon: CheckCircle2,
      label: 'CLEAN'
    },
    warning: {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/30',
      icon: AlertTriangle,
      label: 'WARNING'
    },
    threat: {
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      borderColor: 'border-red-400/30',
      icon: AlertCircle,
      label: 'THREAT'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`w-full rounded-lg p-6 border ${config.borderColor} ${config.bgColor}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-1">{fileName}</h3>
          <p className="text-sm text-gray-400">{new Date(analysisDate).toLocaleString()}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className={`flex items-center gap-2 ${config.color}`}>
            <Icon className="w-5 h-5" />
            <span className="font-semibold text-sm">{config.label}</span>
          </div>
        </div>
      </div>

      {/* Score Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded p-4 border border-gray-700/50">
          <p className="text-xs text-gray-400 mb-2">Deepfake Score</p>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${config.color}`}>
              {(deepfakeScore * 100).toFixed(1)}%
            </span>
          </div>
          {/* Mini progress bar */}
          <div className="h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${
                status === 'clean'
                  ? 'bg-green-500'
                  : status === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${deepfakeScore * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-800/50 rounded p-4 border border-gray-700/50">
          <p className="text-xs text-gray-400 mb-2">Confidence</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-cyan-400">
              {(confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-1 bg-gray-700 rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-cyan-500"
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Detected Artifacts */}
      {detectedArtifacts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Detected Artifacts</h4>
          <div className="flex flex-wrap gap-2">
            {detectedArtifacts.map((artifact, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 border border-red-400/50 text-red-300"
              >
                {artifact}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Frame Analysis Mini Chart */}
      {frameAnalysis.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">Frame-by-Frame Analysis</h4>
          <div className="flex items-end gap-1 h-12 bg-gray-800/30 rounded p-2">
            {frameAnalysis.map((frame, idx) => (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                style={{ height: `${(frame.score / 1) * 100}%`, minHeight: '2px' }}
                title={`Frame ${frame.frame}: ${(frame.score * 100).toFixed(1)}%`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Frames analyzed: {frameAnalysis.length}</p>
        </div>
      )}

      {/* Action Button */}
      {onDownloadReport && (
        <button
          onClick={onDownloadReport}
          className="w-full py-2 px-4 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/30 transition-colors text-sm font-medium"
        >
          Download Report
        </button>
      )}
    </div>
  );
}
