"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { CyberXLogo } from "@/components/cyberx-logo"
import { DashboardVideoUploader } from "@/components/dashboard-video-uploader"
import { AnalysisResults, type AnalysisResult } from "@/components/analysis-results"
import {
  saveResultToFirebase,
  getHistoryFromFirebase,
} from "@/lib/history"
import {
  LogOut,
  Shield,
  Activity,
  FileVideo,
  AlertTriangle,
  TrendingUp,
  Clock,
  History,
  User,
  BarChart2,
  Settings,
} from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth()
  const router = useRouter()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  const [stats, setStats] = useState({
    totalAnalyzed: 0,
    cleanFiles: 0,
    threatsDetected: 0,
    securityScore: 100,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  const loadStatsOnly = useCallback(async () => {
    if (!user?.uid) {
      setLoadingStats(false)
      return
    }

    try {
      setLoadingStats(true)
      const history = await getHistoryFromFirebase(user.uid)

      const totalAnalyzed = history.length
      const threatsDetected = history.filter(
        (r) => r.status === "threat" || r.status === "warning"
      ).length
      const cleanFiles = history.filter((r) => r.status === "clean").length
      const securityScore =
        totalAnalyzed > 0 ? Math.round((cleanFiles / totalAnalyzed) * 100) : 100

      setStats({ totalAnalyzed, cleanFiles, threatsDetected, securityScore })
    } catch (err) {
      console.error("Error loading dashboard stats:", err)
    } finally {
      setLoadingStats(false)
    }
  }, [user?.uid])

  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      loadStatsOnly()
    }
  }, [isAuthenticated, user?.uid, loadStatsOnly])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handleAnalyze = async (file: File) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("video", file)

      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Analysis failed")

      const result     = data.result
      const isDeepfake = result.label === "FAKE"
      const confidence = Math.round(result.confidence)
      const fakePct    = Math.round(result.fake_probability * 100)
      const riskLevel  = result.risk_level

      let status: "clean" | "warning" | "threat"
      if (isDeepfake && riskLevel === "HIGH")        status = "threat"
      else if (isDeepfake && riskLevel === "MEDIUM") status = "warning"
      else if (isDeepfake)                           status = "warning"
      else                                           status = "clean"

      const newResult: AnalysisResult = {
        id:          Date.now().toString(),
        fileName:    file.name,
        fileSize:    formatFileSize(file.size),
        analyzedAt:  new Date().toLocaleString(),
        status,
        threatLevel: fakePct,
        findings: {
          deepfake: { detected: isDeepfake, confidence },
          malware:  { detected: false, type: undefined },
          metadata: { suspicious: false, details: undefined },
        },
      }

      if (user?.uid) {
        await saveResultToFirebase(user.uid, newResult)
        await loadStatsOnly()
      }

      setResults((prev) => [newResult, ...prev])
    } catch (err: any) {
      console.error("Analysis error:", err)
      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to ML server. Make sure Flask is running on port 5000."
          : err.message || "Analysis failed. Please try again."
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDeleteResult = (id: string) => {
    setResults((prev) => prev.filter((r) => r.id !== id))
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen gradient-cyber cyber-grid">
      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0e17]/80 border-b border-[#1e3a5f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <CyberXLogo size="md" />

            <div className="flex items-center gap-1">
              {/* Analytics */}
              <Link
                href="/analytics"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#94a3b8] hover:text-[#00f0ff] hover:bg-[#1e293b] rounded-lg transition-all"
              >
                <BarChart2 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </Link>

              {/* History */}
              <Link
                href="/history"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#94a3b8] hover:text-[#00f0ff] hover:bg-[#1e293b] rounded-lg transition-all"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </Link>

              {/* Profile */}
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#94a3b8] hover:text-[#00f0ff] hover:bg-[#1e293b] rounded-lg transition-all"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </Link>

              {/* Admin Link — only if isAdmin */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#a855f7] hover:text-[#c084fc] hover:bg-[#a855f7]/10 rounded-lg transition-all border border-[#a855f7]/30 ml-1"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}

              {/* Divider */}
              <div className="w-px h-6 bg-[#1e3a5f] mx-2" />

              {/* System Status */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e293b]">
                <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-sm text-[#94a3b8]">System Active</span>
              </div>

              {/* User Info + Logout */}
              <div className="flex items-center gap-3 ml-2">
                <div className="hidden sm:block text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <p className="text-sm font-medium text-[#e8f1ff]">{user?.name}</p>
                    {isAdmin && (
                      <span className="px-1.5 py-0.5 text-xs bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/40 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748b]">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#e8f1ff]">
            Welcome back, <span className="text-[#00f0ff]">{user?.name}</span>
          </h1>
          <p className="text-[#94a3b8] mt-1">Your security command center awaits</p>
        </div>

        {/* ── Admin Banner ── */}
        {isAdmin && (
          <div className="mb-6 p-4 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-[#a855f7] shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#a855f7]">Admin Access</p>
                <p className="text-xs text-[#94a3b8]">
                  You have admin privileges — manage users and view all analyses
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 text-sm bg-[#a855f7]/20 hover:bg-[#a855f7]/30 text-[#a855f7] border border-[#a855f7]/40 rounded-lg transition-all shrink-0"
            >
              Go to Admin Panel →
            </Link>
          </div>
        )}

        {/* ── Error Banner ── */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#ef4444] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#ef4444]">Analysis Error</p>
              <p className="text-xs text-[#94a3b8] mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-[#64748b] hover:text-[#e8f1ff] text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-[#111827] cyber-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00f0ff]/10 flex items-center justify-center">
                <FileVideo className="w-5 h-5 text-[#00f0ff]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#e8f1ff]">
                  {loadingStats ? "..." : stats.totalAnalyzed}
                </p>
                <p className="text-xs text-[#64748b]">Videos Analyzed</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#22c55e]/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#22c55e]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#e8f1ff]">
                  {loadingStats ? "..." : stats.cleanFiles}
                </p>
                <p className="text-xs text-[#64748b]">Clean Files</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#ef4444]/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#ef4444]/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#ef4444]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#e8f1ff]">
                  {loadingStats ? "..." : stats.threatsDetected}
                </p>
                <p className="text-xs text-[#64748b]">Threats Found</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#a855f7]/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#a855f7]/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#a855f7]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#e8f1ff]">
                  {loadingStats ? "..." : `${stats.securityScore}%`}
                </p>
                <p className="text-xs text-[#64748b]">Security Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Nav Cards ── */}
        <div className={`grid gap-4 mb-8 ${isAdmin ? "grid-cols-4" : "grid-cols-3"}`}>
          <Link
            href="/analytics"
            className="p-4 rounded-xl bg-[#111827] border border-[#00f0ff]/20 hover:border-[#00f0ff]/60 hover:bg-[#00f0ff]/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00f0ff]/10 flex items-center justify-center group-hover:bg-[#00f0ff]/20 transition-all">
                <BarChart2 className="w-5 h-5 text-[#00f0ff]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#e8f1ff]">Analytics</p>
                <p className="text-xs text-[#64748b]">View detailed stats</p>
              </div>
            </div>
          </Link>

          <Link
            href="/history"
            className="p-4 rounded-xl bg-[#111827] border border-[#22c55e]/20 hover:border-[#22c55e]/60 hover:bg-[#22c55e]/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#22c55e]/10 flex items-center justify-center group-hover:bg-[#22c55e]/20 transition-all">
                <History className="w-5 h-5 text-[#22c55e]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#e8f1ff]">History</p>
                <p className="text-xs text-[#64748b]">Past analyses</p>
              </div>
            </div>
          </Link>

          <Link
            href="/profile"
            className="p-4 rounded-xl bg-[#111827] border border-[#a855f7]/20 hover:border-[#a855f7]/60 hover:bg-[#a855f7]/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#a855f7]/10 flex items-center justify-center group-hover:bg-[#a855f7]/20 transition-all">
                <User className="w-5 h-5 text-[#a855f7]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#e8f1ff]">Profile</p>
                <p className="text-xs text-[#64748b]">Manage account</p>
              </div>
            </div>
          </Link>

          {/* Admin Card — only if isAdmin */}
          {isAdmin && (
            <Link
              href="/admin"
              className="p-4 rounded-xl bg-[#111827] border border-[#a855f7]/40 hover:border-[#a855f7] hover:bg-[#a855f7]/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#a855f7]/20 flex items-center justify-center group-hover:bg-[#a855f7]/30 transition-all">
                  <Settings className="w-5 h-5 text-[#a855f7]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#a855f7]">Admin Panel</p>
                  <p className="text-xs text-[#64748b]">Manage users</p>
                </div>
              </div>
            </Link>
          )}
        </div>

        {/* ── Upload + Results ── */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00f0ff]/10 cyber-border flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#00f0ff]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#e8f1ff]">Upload Video for Analysis</h2>
                <p className="text-sm text-[#64748b]">Scan videos for threats and deepfakes</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#111827] cyber-border">
              <DashboardVideoUploader onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
            </div>

            <div className="p-4 rounded-xl bg-[#a855f7]/5 border border-[#a855f7]/20">
              <h3 className="text-sm font-medium text-[#a855f7] mb-2">ℹ️ About This System</h3>
              <ul className="space-y-1 text-xs text-[#94a3b8]">
                <li>- Supported formats: MP4, MOV, AVI, MKV, WebM</li>
                <li>- Maximum file size: 500MB</li>
                <li>- Analysis typically takes 15-30 seconds</li>
                <li>- Trained on FaceForensics++ dataset (85% accuracy)</li>
                <li>- Optimized for face-swap deepfake detection</li>
                <li className="text-[#f59e0b]">
                  - ⚠️ Accuracy may vary for non face-swap AI generated content
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#22c55e]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#e8f1ff]">Recent Analysis Results</h2>
                  <p className="text-sm text-[#64748b]">Current session only</p>
                </div>
              </div>
              <Link
                href="/history"
                className="text-xs text-[#00f0ff] hover:underline flex items-center gap-1"
              >
                <History className="w-3.5 h-3.5" />
                View All
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-[#111827] cyber-border min-h-[400px]">
              <AnalysisResults results={results} onDelete={handleDeleteResult} />
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="mt-16 py-8 border-t border-[#1e3a5f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <CyberXLogo size="sm" />
            <p className="text-sm text-[#64748b]">
              © 2024 CyberX Security Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}