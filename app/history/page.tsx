"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { CyberXLogo } from "@/components/cyberx-logo"
import { AnalysisResults, type AnalysisResult } from "@/components/analysis-results"
import { getHistoryFromFirebase, deleteResultFromFirebase, clearAllHistoryFromFirebase } from "@/lib/history"
import {
  LogOut,
  Shield,
  FileVideo,
  AlertTriangle,
  TrendingUp,
  Clock,
  Trash2,
  LayoutDashboard,
  Loader2,
} from "lucide-react"
import Link from "next/link"

export default function HistoryPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (user?.uid) {
      loadHistory()
    }
  }, [isAuthenticated, user?.uid])

  const loadHistory = async () => {
    setLoading(true)
    const data = await getHistoryFromFirebase(user!.uid)
    setResults(data)
    setLoading(false)
  }

  const handleDeleteResult = async (id: string) => {
    await deleteResultFromFirebase(user!.uid, id)
    setResults((prev) => prev.filter((r) => r.id !== id))
  }

  const handleClearAll = async () => {
    if (confirm("Sari history permanently delete karna chahte ho?")) {
      await clearAllHistoryFromFirebase(user!.uid)
      setResults([])
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const totalAnalyzed   = results.length
  const threatsDetected = results.filter((r) => r.status === "threat" || r.status === "warning").length
  const cleanFiles      = results.filter((r) => r.status === "clean").length
  const securityScore   = totalAnalyzed > 0 ? Math.round((cleanFiles / totalAnalyzed) * 100) : 100

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen gradient-cyber cyber-grid">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0e17]/80 border-b border-[#1e3a5f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <CyberXLogo size="md" />
            <div className="flex items-center gap-4">
              {/* Nav Links */}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-[#94a3b8] hover:text-[#00f0ff] transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e293b]">
                <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></div>
                <span className="text-sm text-[#94a3b8]">System Active</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-[#e8f1ff]">{user?.name}</p>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#e8f1ff]">
            Analysis <span className="text-[#00f0ff]">History</span>
          </h1>
          <p className="text-[#94a3b8] mt-1">
            All scans for <span className="text-[#a855f7]">{user?.email}</span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-[#111827] cyber-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00f0ff]/10 flex items-center justify-center">
                <FileVideo className="w-5 h-5 text-[#00f0ff]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#e8f1ff]">{totalAnalyzed}</p>
                <p className="text-xs text-[#64748b]">Total Scans</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111827] border border-[#22c55e]/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#22c55e]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#e8f1ff]">{cleanFiles}</p>
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
                <p className="text-2xl font-bold text-[#e8f1ff]">{threatsDetected}</p>
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
                <p className="text-2xl font-bold text-[#e8f1ff]">{securityScore}%</p>
                <p className="text-xs text-[#64748b]">Security Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="rounded-2xl bg-[#111827] cyber-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#22c55e]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#e8f1ff]">All Scan Results</h2>
                <p className="text-sm text-[#64748b]">Saved permanently to your account</p>
              </div>
            </div>

            {totalAnalyzed > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-colors border border-[#ef4444]/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-[#00f0ff] animate-spin" />
              <p className="text-sm text-[#64748b]">Loading your history...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-16 h-16 rounded-full bg-[#1e293b] flex items-center justify-center">
                <Clock className="w-8 h-8 text-[#334155]" />
              </div>
              <p className="text-[#64748b] text-sm">No scan history yet</p>
              <Link
                href="/dashboard"
                className="mt-2 px-4 py-2 rounded-lg bg-[#00f0ff]/10 text-[#00f0ff] text-sm hover:bg-[#00f0ff]/20 transition-colors border border-[#00f0ff]/30"
              >
                Go Analyze a Video
              </Link>
            </div>
          ) : (
            <AnalysisResults results={results} onDelete={handleDeleteResult} />
          )}
        </div>
      </main>

      {/* Footer */}
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