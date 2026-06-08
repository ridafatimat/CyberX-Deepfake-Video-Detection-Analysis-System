'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { CyberXLogo } from '@/components/cyberx-logo';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertCircle, Users, BarChart3, Activity,
  Trash2, Ban, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  collection, getDocs, doc,
  updateDoc, deleteDoc, query, orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  status: 'active' | 'suspended';
  totalAnalyses: number;
}

interface HistoryEntry {
  id: string;
  userId: string;
  userName: string;
  fileName: string;
  status: string;
  analyzedAt: string;
}

export default function AdminDashboard() {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();

  const [users, setUsers]               = useState<AdminUser[]>([])
  const [allHistory, setAllHistory]     = useState<HistoryEntry[]>([])
  const [loading, setLoading]           = useState(true)
  const [currentPage, setCurrentPage]   = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const itemsPerPage = 5

  useEffect(() => {
    if (!isAdmin) router.push('/dashboard')
  }, [isAdmin, router])

  // ── Fetch all users + their histories from Firebase ──────────
  useEffect(() => {
    if (!isAdmin) return

    const fetchData = async () => {
      setLoading(true)
      try {
        // 1. Fetch all users
        const usersSnap = await getDocs(collection(db, 'users'))
        const usersData: AdminUser[] = []
        const historyData: HistoryEntry[] = []

        for (const userDoc of usersSnap.docs) {
          const data = userDoc.data()

          // 2. Fetch each user's history
          let totalAnalyses = 0
          try {
            const historySnap = await getDocs(
              query(
                collection(db, 'users', userDoc.id, 'history'),
                orderBy('analyzedAt', 'desc')
              )
            )
            totalAnalyses = historySnap.size

            historySnap.docs.forEach((hDoc) => {
              const h = hDoc.data()
              historyData.push({
                id:         hDoc.id,
                userId:     userDoc.id,
                userName:   data.name || data.email || 'Unknown',
                fileName:   h.fileName || 'Unknown file',
                status:     h.status   || 'unknown',
                analyzedAt: h.analyzedAt || '',
              })
            })
          } catch (_) {}

          usersData.push({
            id:             userDoc.id,
            name:           data.name           || 'Unknown',
            email:          data.email          || '',
            createdAt:      data.createdAt?.toDate?.()?.toISOString() || data.createdAt || '',
            status:         data.status         || 'active',
            totalAnalyses,
          })
        }

        // Sort history by date desc
        historyData.sort((a, b) =>
          new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime()
        )

        setUsers(usersData)
        setAllHistory(historyData)
      } catch (err) {
        console.error('Admin fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isAdmin])

  // ── Suspend / Unsuspend ───────────────────────────────────────
  const handleSuspendUser = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId)
    if (!targetUser) return

    const newStatus = targetUser.status === 'suspended' ? 'active' : 'suspended'
    await updateDoc(doc(db, 'users', userId), { status: newStatus })
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u))
  }

  // ── Delete User ───────────────────────────────────────────────
  const handleDeleteUser = async (userId: string) => {
    await deleteDoc(doc(db, 'users', userId))
    setUsers(users.filter(u => u.id !== userId))
    setAllHistory(allHistory.filter(h => h.userId !== userId))
    setDeleteConfirm(null)
  }

  // ── Stats ─────────────────────────────────────────────────────
  const totalAnalyses   = allHistory.length
  const realVideos      = allHistory.filter(h => h.status === 'clean').length
  const fakeVideos      = allHistory.filter(h => h.status === 'threat' || h.status === 'warning').length
  const paginatedUsers  = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages      = Math.ceil(users.length / itemsPerPage)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!isAdmin) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-4">You do not have permission to access the admin dashboard.</p>
        <Button onClick={() => router.push('/dashboard')} className="bg-cyan-500 hover:bg-cyan-600">
          Go to Dashboard
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Nav */}
      <nav className="border-b border-cyan-900/30 bg-slate-950/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div onClick={() => router.push('/dashboard')} className="cursor-pointer hover:opacity-80">
            <CyberXLogo />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-cyan-400 font-semibold">Admin Dashboard</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-950/20">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900/50 border-cyan-900/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {loading ? '...' : users.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-cyan-900/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Analyses</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {loading ? '...' : totalAnalyses}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-cyan-900/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Real Videos</p>
                <p className="text-3xl font-bold text-green-400 mt-1">
                  {loading ? '...' : realVideos}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-cyan-900/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Fake Videos</p>
                <p className="text-3xl font-bold text-red-400 mt-1">
                  {loading ? '...' : fakeVideos}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="bg-slate-900/50 border-cyan-900/30 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">User Management</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-cyan-900/30 hover:bg-transparent">
                      <TableHead className="text-cyan-300">Name</TableHead>
                      <TableHead className="text-cyan-300">Email</TableHead>
                      <TableHead className="text-cyan-300">Registered</TableHead>
                      <TableHead className="text-cyan-300">Analyses</TableHead>
                      <TableHead className="text-cyan-300">Status</TableHead>
                      <TableHead className="text-cyan-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((u) => (
                      <TableRow key={u.id} className="border-cyan-900/20 hover:bg-cyan-950/10">
                        <TableCell className="text-white">{u.name}</TableCell>
                        <TableCell className="text-gray-300">{u.email}</TableCell>
                        <TableCell className="text-gray-400">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell className="text-white">{u.totalAnalyses}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            u.status === 'active'
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {u.status === 'active' ? 'Active' : 'Suspended'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost"
                              onClick={() => handleSuspendUser(u.id)}
                              className="text-yellow-400 hover:bg-yellow-950/20 h-8 px-2"
                              title={u.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost"
                              onClick={() => setDeleteConfirm(u.id)}
                              className="text-red-400 hover:bg-red-950/20 h-8 px-2"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="border-cyan-900/30">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage >= totalPages}
                    className="border-cyan-900/30">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* All Users History */}
        <Card className="bg-slate-900/50 border-cyan-900/30 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            All Users — Analysis History
          </h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : allHistory.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No history found</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {allHistory.map((h) => (
                <div key={`${h.userId}-${h.id}`}
                  className="flex items-start gap-3 p-3 bg-slate-800/50 rounded border border-cyan-900/20">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    h.status === 'clean'   ? 'bg-green-400' :
                    h.status === 'threat'  ? 'bg-red-400'   :
                    h.status === 'warning' ? 'bg-yellow-400' :
                    'bg-gray-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      <span className="text-cyan-400">{h.userName}</span>
                      {' — '}{h.fileName}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        h.status === 'clean'   ? 'bg-green-500/20 text-green-300'  :
                        h.status === 'threat'  ? 'bg-red-500/20 text-red-300'      :
                        h.status === 'warning' ? 'bg-yellow-500/20 text-yellow-300':
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {h.status.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {h.analyzedAt ? new Date(h.analyzedAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirm Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur flex items-center justify-center z-50">
          <Card className="bg-slate-900 border-red-900/50 p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-white mb-2">Confirm Deletion</h3>
            <p className="text-gray-300 mb-4">
              Are you sure you want to permanently delete this user? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 border-cyan-900/30"
                onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600"
                onClick={() => handleDeleteUser(deleteConfirm)}>
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}