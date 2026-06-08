'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { CyberXLogo } from '@/components/cyberx-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Upload, Eye, EyeOff, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, updatePassword, logout, isAdmin } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [displayName, setDisplayName]           = useState(user?.name || '')
  const [currentPassword, setCurrentPassword]   = useState('')
  const [newPassword, setNewPassword]           = useState('')
  const [confirmPassword, setConfirmPassword]   = useState('')
  const [profilePicture, setProfilePicture]     = useState(user?.profilePicture || '')

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword]         = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [messages, setMessages] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading]   = useState(false)

  // ── Update Name ──────────────────────────────────────────────
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessages(null)
    const result = await updateProfile({ name: displayName })
    setMessages(
      result.success
        ? { type: 'success', text: 'Profile updated successfully!' }
        : { type: 'error', text: result.error || 'Failed to update profile' }
    )
    setLoading(false)
  }

  // ── Change Password ──────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessages(null)

    if (newPassword !== confirmPassword) {
      setMessages({ type: 'error', text: 'Passwords do not match' })
      setLoading(false)
      return
    }

    const result = await updatePassword(currentPassword, newPassword)
    if (result.success) {
      setMessages({ type: 'success', text: 'Password changed successfully!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setMessages({ type: 'error', text: result.error || 'Failed to change password' })
    }
    setLoading(false)
  }

  // ── Profile Picture ──────────────────────────────────────────
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const imageData = event.target?.result as string
      setProfilePicture(imageData)
      const result = await updateProfile({ profilePicture: imageData })
      setMessages(
        result.success
          ? { type: 'success', text: 'Profile picture updated!' }
          : { type: 'error', text: 'Failed to save profile picture' }
      )
    }
    reader.readAsDataURL(file)
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Nav */}
      <nav className="border-b border-cyan-900/30 bg-slate-950/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div onClick={() => router.push('/dashboard')} className="cursor-pointer hover:opacity-80">
            <CyberXLogo />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">{user.email}</span>
            {isAdmin && (
              <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/50 rounded text-xs text-purple-300">
                Admin
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-950/20"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Message */}
        {messages && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 border ${
            messages.type === 'success'
              ? 'bg-green-950/20 border-green-500/30 text-green-300'
              : 'bg-red-950/20 border-red-500/30 text-red-300'
          }`}>
            {messages.type === 'success'
              ? <CheckCircle2 className="w-5 h-5 shrink-0" />
              : <AlertCircle className="w-5 h-5 shrink-0" />
            }
            <span>{messages.text}</span>
          </div>
        )}

        {/* Profile Header */}
        <Card className="bg-slate-900/50 border-cyan-900/30 p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center overflow-hidden">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-3xl font-bold text-cyan-400">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-cyan-500/20 border border-cyan-500/50 rounded hover:bg-cyan-500/30 transition"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">{user.name}</h1>
              <div className="space-y-1 text-sm text-gray-400">
                <p>Email: {user.email}</p>
                <p>Account created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          {/* Update Name */}
          <Card className="bg-slate-900/50 border-cyan-900/30 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Update Display Name</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                type="text"
                placeholder="Display name (2-50 characters)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                minLength={2}
                maxLength={50}
                className="bg-slate-800 border-cyan-900/30 text-white placeholder-gray-500"
              />
              <Button type="submit" disabled={loading} className="bg-cyan-500 hover:bg-cyan-600 text-white w-full">
                {loading ? 'Updating...' : 'Update Name'}
              </Button>
            </form>
          </Card>

          {/* Change Password */}
          <Card className="bg-slate-900/50 border-cyan-900/30 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-slate-800 border-cyan-900/30 text-white placeholder-gray-500 pr-10"
                />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-300">
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="New password (min 8 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-slate-800 border-cyan-900/30 text-white placeholder-gray-500 pr-10"
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-300">
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-slate-800 border-cyan-900/30 text-white placeholder-gray-500 pr-10"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-300">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <Button type="submit" disabled={loading} className="bg-cyan-500 hover:bg-cyan-600 text-white w-full">
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}