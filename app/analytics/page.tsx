'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { CyberXLogo } from '@/components/cyberx-logo';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LogOut, TrendingUp, TrendingDown, FileVideo } from 'lucide-react';

interface AnalysisRecord {
  id: string;
  fileName: string;
  date: string;
  result: 'real' | 'fake';
  confidence: number;
}

const mockAnalytics = {
  totalAnalyses: 42,
  realVideos: 28,
  fakeVideos: 14,
  recentAnalyses: [
    { id: '1', fileName: 'interview_001.mp4', date: '2024-05-02', result: 'real', confidence: 0.95 },
    { id: '2', fileName: 'viral_clip.mp4', date: '2024-05-01', result: 'fake', confidence: 0.87 },
    { id: '3', fileName: 'presentation.mp4', date: '2024-04-30', result: 'real', confidence: 0.92 },
    { id: '4', fileName: 'social_media.mp4', date: '2024-04-29', result: 'fake', confidence: 0.78 },
    { id: '5', fileName: 'news_segment.mp4', date: '2024-04-28', result: 'real', confidence: 0.98 },
  ]
};

export default function AnalyticsDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalAnalyses: 0,
    realVideos: 0,
    fakeVideos: 0,
    recentAnalyses: [] as AnalysisRecord[]
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Simulate loading data from database
    const loadAnalytics = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalytics(mockAnalytics);
      setLoading(false);
    };

    loadAnalytics();
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mb-4"></div>
          <p className="text-gray-300">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Real Videos', value: analytics.realVideos, fill: '#22c55e' },
    { name: 'Fake Videos', value: analytics.fakeVideos, fill: '#ef4444' }
  ];

  const barData = [
    { name: 'Week 1', real: 8, fake: 2 },
    { name: 'Week 2', real: 6, fake: 4 },
    { name: 'Week 3', real: 7, fake: 5 },
    { name: 'Week 4', real: 7, fake: 3 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Navigation */}
      <nav className="border-b border-cyan-900/30 bg-slate-950/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div onClick={() => router.push('/dashboard')} className="cursor-pointer hover:opacity-80">
            <CyberXLogo />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-cyan-400 font-semibold">Analytics</span>
            <Button variant="ghost" size="sm" onClick={() => router.push('/profile')} className="text-gray-300 hover:text-cyan-300">
              Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-950/20">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Analytics</h1>
          <p className="text-gray-400">Track your video analysis history and insights</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-900/50 border-cyan-900/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Analyses</p>
                <p className="text-3xl font-bold text-white mt-2">{analytics.totalAnalyses}</p>
              </div>
              <FileVideo className="w-8 h-8 text-cyan-400 opacity-50" />
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-cyan-900/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Real Videos</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{analytics.realVideos}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-cyan-900/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Fake Videos</p>
                <p className="text-3xl font-bold text-red-400 mt-2">{analytics.fakeVideos}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-400 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <Card className="bg-slate-900/50 border-cyan-900/30 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Detection Breakdown</h2>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Bar Chart */}
          <Card className="bg-slate-900/50 border-cyan-900/30 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Weekly Trend</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(45, 212, 191, 0.1)" />
                  <XAxis dataKey="name" stroke="#8b9cb3" />
                  <YAxis stroke="#8b9cb3" />
                  <Tooltip contentStyle={{ backgroundColor: '#162032', border: '1px solid #1e2d3d', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="real" fill="#22c55e" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="fake" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Recent Analyses Table */}
        <Card className="bg-slate-900/50 border-cyan-900/30 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Latest Analysis Results</h2>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-cyan-900/30 hover:bg-transparent">
                  <TableHead className="text-cyan-300">Video Name</TableHead>
                  <TableHead className="text-cyan-300">Date</TableHead>
                  <TableHead className="text-cyan-300">Result</TableHead>
                  <TableHead className="text-cyan-300">Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.recentAnalyses.map((analysis) => (
                  <TableRow key={analysis.id} className="border-cyan-900/20 hover:bg-cyan-950/10">
                    <TableCell className="text-white">{analysis.fileName}</TableCell>
                    <TableCell className="text-gray-400">{new Date(analysis.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        analysis.result === 'real'
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        {analysis.result === 'real' ? 'Real' : 'Fake'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${analysis.result === 'real' ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${analysis.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-gray-300 text-sm">{(analysis.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
