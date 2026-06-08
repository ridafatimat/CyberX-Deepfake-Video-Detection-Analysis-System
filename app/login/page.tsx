"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { CyberXLogo } from "@/components/cyberx-logo"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  Shield,
  Zap,
  Scan,
  CheckCircle,
  X,
} from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState("")

  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const result = await login(email, password)

    if (result.success) {
      window.location.href = "/dashboard"
    } else {
      setError(result.error || "Login failed")
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetError("")

    if (!resetEmail.trim()) {
      setResetError("Please enter your email.")
      return
    }

    if (!newPassword.trim()) {
      setResetError("Please enter a new password.")
      return
    }

    if (newPassword.length < 6) {
      setResetError("Password must be at least 6 characters long.")
      return
    }

    if (newPassword !== confirmNewPassword) {
      setResetError("Passwords do not match.")
      return
    }

    setResetLoading(true)

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update password.")
      }

      setResetSuccess(true)
    } catch (err: any) {
      setResetError(err.message || "Something went wrong. Please try again.")
    } finally {
      setResetLoading(false)
    }
  }

  const closeForgot = () => {
    setShowForgot(false)
    setResetEmail("")
    setNewPassword("")
    setConfirmNewPassword("")
    setResetError("")
    setResetSuccess(false)
    setShowNewPassword(false)
    setShowConfirmNewPassword(false)
  }

  return (
    <div className="min-h-screen gradient-cyber cyber-grid flex">
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-[#0f172a] border border-[#1e3a5f] rounded-2xl p-8 shadow-2xl relative">
            <button
              onClick={closeForgot}
              className="absolute top-4 right-4 text-[#64748b] hover:text-[#e8f1ff] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!resetSuccess ? (
              <>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-[#e8f1ff]">Reset Password</h3>
                  <p className="mt-1 text-sm text-[#94a3b8]">
                    Enter your email and your new password.
                  </p>
                </div>

                {resetError && (
                  <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30">
                    <AlertCircle className="w-4 h-4 text-[#ef4444] shrink-0" />
                    <p className="text-sm text-[#ef4444]">{resetError}</p>
                  </div>
                )}

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#94a3b8]">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="agent@cyberx.com"
                        required
                        className="w-full pl-12 pr-4 py-3 bg-[#1e293b] border border-[#1e3a5f] rounded-xl text-[#e8f1ff] placeholder:text-[#64748b] focus:outline-none focus:border-[#00f0ff] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#94a3b8]">
                      New password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        className="w-full pl-12 pr-12 py-3 bg-[#1e293b] border border-[#1e3a5f] rounded-xl text-[#e8f1ff] placeholder:text-[#64748b] focus:outline-none focus:border-[#00f0ff] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8]"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-[#94a3b8]">
                      Confirm new password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
                      <input
                        type={showConfirmNewPassword ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                        className="w-full pl-12 pr-12 py-3 bg-[#1e293b] border border-[#1e3a5f] rounded-xl text-[#e8f1ff] placeholder:text-[#64748b] focus:outline-none focus:border-[#00f0ff] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8]"
                      >
                        {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3 px-4 bg-[#00f0ff] text-[#0a0e17] font-semibold rounded-xl hover:bg-[#00f0ff]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {resetLoading ? "Updating..." : "Update Password"}
                  </button>

                  <button
                    type="button"
                    onClick={closeForgot}
                    className="w-full py-3 px-4 border border-[#1e3a5f] text-[#94a3b8] font-semibold rounded-xl hover:bg-[#1e293b] transition-all duration-200"
                  >
                    Cancel
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-[#22c55e]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#e8f1ff]">Password Updated!</h3>
                <p className="text-sm text-[#94a3b8]">
                  Your password has been updated successfully for{" "}
                  <span className="text-[#00f0ff]">{resetEmail}</span>.
                </p>
                <button
                  onClick={closeForgot}
                  className="w-full py-3 px-4 bg-[#00f0ff] text-[#0a0e17] font-semibold rounded-xl hover:bg-[#00f0ff]/90 transition-all duration-200"
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#00f0ff]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-20 w-80 h-80 bg-[#a855f7]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <CyberXLogo size="lg" />
        </div>

        <div className="relative z-10 space-y-8">
          <h1 className="text-4xl font-bold leading-tight text-balance">
            <span className="text-[#00f0ff]">Advanced</span> Video Security Analysis
          </h1>
          <p className="text-lg text-[#94a3b8] leading-relaxed max-w-md">
            Protect your digital assets with AI-powered threat detection. Analyze videos for
            deepfakes, malware, and security vulnerabilities.
          </p>

          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#00f0ff]/10 cyber-border flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#00f0ff]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#e8f1ff]">Threat Detection</h3>
                <p className="text-sm text-[#94a3b8]">Real-time malware scanning</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#a855f7]/10 border border-[#a855f7]/30 flex items-center justify-center">
                <Scan className="w-6 h-6 text-[#a855f7]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#e8f1ff]">Deepfake Analysis</h3>
                <p className="text-sm text-[#94a3b8]">AI-powered authenticity verification</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#22c55e]" />
              </div>
              <div>
                <h3 className="font-semibold text-[#e8f1ff]">Instant Results</h3>
                <p className="text-sm text-[#94a3b8]">Fast processing with detailed reports</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-[#64748b]">
          2024 CyberX Security. All rights reserved.
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex justify-center mb-8">
            <CyberXLogo size="lg" />
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#e8f1ff]">Welcome back</h2>
            <p className="mt-2 text-[#94a3b8]">Sign in to access your security dashboard</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30">
              <AlertCircle className="w-5 h-5 text-[#ef4444] shrink-0" />
              <p className="text-sm text-[#ef4444]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-[#94a3b8]">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@cyberx.com"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-[#1e293b] border border-[#1e3a5f] rounded-xl text-[#e8f1ff] placeholder:text-[#64748b] focus:outline-none focus:border-[#00f0ff] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-[#94a3b8]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-12 pr-12 py-3 bg-[#1e293b] border border-[#1e3a5f] rounded-xl text-[#e8f1ff] placeholder:text-[#64748b] focus:outline-none focus:border-[#00f0ff] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email)
                  setShowForgot(true)
                }}
                className="text-sm text-[#00f0ff] hover:text-[#00f0ff]/80 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-cyber w-full py-3 px-4 bg-[#00f0ff] text-[#0a0e17] font-semibold rounded-xl hover:bg-[#00f0ff]/90 focus:outline-none focus:ring-2 focus:ring-[#00f0ff] focus:ring-offset-2 focus:ring-offset-[#0a0e17] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1e3a5f]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0a0e17] text-[#64748b]">New to CyberX?</span>
            </div>
          </div>

          <Link
            href="/signup"
            className="flex items-center justify-center w-full py-3 px-4 border border-[#a855f7] text-[#a855f7] font-semibold rounded-xl hover:bg-[#a855f7]/10 focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:ring-offset-2 focus:ring-offset-[#0a0e17] transition-all duration-200"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  )
}