"use client"

import { Shield, AlertTriangle, CheckCircle, Clock, FileVideo, Trash2 } from "lucide-react"

export interface AnalysisResult {
  id: string
  fileName: string
  fileSize: string
  analyzedAt: string
  status: "clean" | "warning" | "threat"
  threatLevel: number
  findings: {
    deepfake: { detected: boolean; confidence: number }
    malware: { detected: boolean; type?: string }
    metadata: { suspicious: boolean; details?: string }
  }
}

interface AnalysisResultsProps {
  results: AnalysisResult[]
  onDelete: (id: string) => void
}

export function AnalysisResults({ results, onDelete }: AnalysisResultsProps) {
  const getStatusColor = (status: AnalysisResult["status"]) => {
    switch (status) {
      case "clean":
        return { bg: "bg-[#22c55e]/10", border: "border-[#22c55e]/30", text: "text-[#22c55e]" }
      case "warning":
        return { bg: "bg-[#f59e0b]/10", border: "border-[#f59e0b]/30", text: "text-[#f59e0b]" }
      case "threat":
        return { bg: "bg-[#ef4444]/10", border: "border-[#ef4444]/30", text: "text-[#ef4444]" }
    }
  }

  const getStatusIcon = (status: AnalysisResult["status"]) => {
    switch (status) {
      case "clean":
        return <CheckCircle className="w-5 h-5" />
      case "warning":
        return <AlertTriangle className="w-5 h-5" />
      case "threat":
        return <Shield className="w-5 h-5" />
    }
  }

  const getStatusLabel = (status: AnalysisResult["status"]) => {
    switch (status) {
      case "clean":
        return "Clean"
      case "warning":
        return "Warning"
      case "threat":
        return "Threat Detected"
    }
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1e293b] flex items-center justify-center mb-4">
          <FileVideo className="w-8 h-8 text-[#64748b]" />
        </div>
        <h3 className="text-lg font-medium text-[#94a3b8]">No analysis results yet</h3>
        <p className="text-sm text-[#64748b] mt-1">Upload a video to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {results.map((result) => {
        const colors = getStatusColor(result.status)
        return (
          <div
            key={result.id}
            className={`p-4 rounded-xl ${colors.bg} border ${colors.border} space-y-4`}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colors.bg} ${colors.text}`}>
                  {getStatusIcon(result.status)}
                </div>
                <div>
                  <h4 className="font-medium text-[#e8f1ff] truncate max-w-[200px] sm:max-w-none">
                    {result.fileName}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-[#64748b]">
                    <span>{result.fileSize}</span>
                    <span>-</span>
                    <Clock className="w-3 h-3" />
                    <span>{result.analyzedAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                  {getStatusLabel(result.status)}
                </span>
                <button
                  onClick={() => onDelete(result.id)}
                  className="p-2 text-[#64748b] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Findings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Deepfake Analysis */}
              <div className="p-3 rounded-lg bg-[#111827]/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#94a3b8]">Deepfake Analysis</span>
                  {result.findings.deepfake.detected ? (
                    <span className="text-xs text-[#ef4444]">Detected</span>
                  ) : (
                    <span className="text-xs text-[#22c55e]">Not Detected</span>
                  )}
                </div>
                <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      result.findings.deepfake.detected ? "bg-[#ef4444]" : "bg-[#22c55e]"
                    }`}
                    style={{ width: `${result.findings.deepfake.confidence}%` }}
                  />
                </div>
                <p className="text-xs text-[#64748b] mt-1">
                  Confidence: {result.findings.deepfake.confidence}%
                </p>
              </div>

              {/* Malware Scan */}
              <div className="p-3 rounded-lg bg-[#111827]/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#94a3b8]">Malware Scan</span>
                  {result.findings.malware.detected ? (
                    <span className="text-xs text-[#ef4444]">Found</span>
                  ) : (
                    <span className="text-xs text-[#22c55e]">Clean</span>
                  )}
                </div>
                <div className={`text-sm font-medium ${
                  result.findings.malware.detected ? "text-[#ef4444]" : "text-[#22c55e]"
                }`}>
                  {result.findings.malware.detected
                    ? result.findings.malware.type
                    : "No threats found"}
                </div>
              </div>

              {/* Metadata Analysis */}
              <div className="p-3 rounded-lg bg-[#111827]/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#94a3b8]">Metadata</span>
                  {result.findings.metadata.suspicious ? (
                    <span className="text-xs text-[#f59e0b]">Suspicious</span>
                  ) : (
                    <span className="text-xs text-[#22c55e]">Normal</span>
                  )}
                </div>
                <div className={`text-sm font-medium ${
                  result.findings.metadata.suspicious ? "text-[#f59e0b]" : "text-[#94a3b8]"
                }`}>
                  {result.findings.metadata.suspicious
                    ? result.findings.metadata.details
                    : "No anomalies detected"}
                </div>
              </div>
            </div>

            {/* Threat Level Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94a3b8]">Overall Threat Level</span>
                <span className={colors.text}>{result.threatLevel}%</span>
              </div>
              <div className="h-2 bg-[#111827] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    result.threatLevel > 70
                      ? "bg-[#ef4444]"
                      : result.threatLevel > 30
                      ? "bg-[#f59e0b]"
                      : "bg-[#22c55e]"
                  }`}
                  style={{ width: `${result.threatLevel}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
