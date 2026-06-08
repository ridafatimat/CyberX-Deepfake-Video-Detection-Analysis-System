"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/context/auth-context"
import { CyberXLogo } from "@/components/cyberx-logo"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()
  const router = useRouter()

  const passwordRequirements = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
  ]

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    const result = await signup(name, email, password)
    
    if (result.success) {
      router.push("/dashboard")
    } else {
      setError(result.error || "Signup failed")
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen gradient-cyber cyber-grid flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <CyberXLogo size="lg" />
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-[#e8f1ff]">Create Account</h2>
            <p className="mt-2 text-[#94a3b8]">Join CyberX and secure your digital presence</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30">
              <AlertCircle className="w-5 h-5 text-[#ef4444] shrink-0" />
              <p className="text-sm text-[#ef4444]">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-[#94a3b8]">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-[#1e293b] border border-[#1e3a5f] rounded-xl text-[#e8f1ff] placeholder:text-[#64748b] focus:outline-none focus:border-[#00f0ff] transition-colors"
                />
              </div>
            </div>

            {/* Email Field */}
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

            {/* Password Field */}
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
                  placeholder="Create a strong password"
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
              
              {/* Password Requirements */}
              {password.length > 0 && (
                <div className="space-y-1 pt-2">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {req.met ? (
                        <CheckCircle className="w-3.5 h-3.5 text-[#22c55e]" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-[#64748b]" />
                      )}
                      <span className={req.met ? "text-[#22c55e]" : "text-[#64748b]"}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#94a3b8]">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  className={`w-full pl-12 pr-12 py-3 bg-[#1e293b] border rounded-xl text-[#e8f1ff] placeholder:text-[#64748b] focus:outline-none transition-colors ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? "border-[#22c55e]"
                        : "border-[#ef4444]"
                      : "border-[#1e3a5f] focus:border-[#00f0ff]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#94a3b8] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-[#ef4444]">Passwords do not match</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-cyber w-full py-3 px-4 bg-[#a855f7] text-white font-semibold rounded-xl hover:bg-[#a855f7]/90 focus:outline-none focus:ring-2 focus:ring-[#a855f7] focus:ring-offset-2 focus:ring-offset-[#0a0e17] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1e3a5f]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#0a0e17] text-[#64748b]">Already have an account?</span>
            </div>
          </div>

          {/* Sign In Link */}
          <Link
            href="/login"
            className="flex items-center justify-center w-full py-3 px-4 border border-[#00f0ff] text-[#00f0ff] font-semibold rounded-xl hover:bg-[#00f0ff]/10 focus:outline-none focus:ring-2 focus:ring-[#00f0ff] focus:ring-offset-2 focus:ring-offset-[#0a0e17] transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-40 right-20 w-64 h-64 bg-[#a855f7]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#00f0ff]/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex justify-end">
          <CyberXLogo size="lg" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <h1 className="text-4xl font-bold leading-tight text-balance text-right">
            Start Your <span className="text-[#a855f7]">Security</span> Journey
          </h1>
          <p className="text-lg text-[#94a3b8] leading-relaxed text-right">
            Get access to enterprise-grade video analysis tools. Detect threats, verify authenticity, and protect your organization.
          </p>
          
          {/* Stats */}
          <div className="flex gap-8 justify-end pt-4">
            <div className="text-right">
              <div className="text-3xl font-bold text-[#00f0ff]">99.9%</div>
              <div className="text-sm text-[#64748b]">Detection Rate</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#a855f7]">50K+</div>
              <div className="text-sm text-[#64748b]">Videos Analyzed</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#22c55e]">24/7</div>
              <div className="text-sm text-[#64748b]">Monitoring</div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-[#64748b] text-right">
          Protected by advanced encryption
        </div>
      </div>
    </div>
  )
}
