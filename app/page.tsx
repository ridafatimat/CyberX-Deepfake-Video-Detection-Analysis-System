"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

export default function Page() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  // Loading state while redirecting
  return (
    <div className="min-h-screen gradient-cyber cyber-grid flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#00f0ff]/10 cyber-border flex items-center justify-center animate-pulse">
          <svg
            className="w-8 h-8 text-[#00f0ff]"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 2L4 10V18C4 28.5 11 36.5 20 38C29 36.5 36 28.5 36 18V10L20 2Z"
              fill="url(#shield-gradient)"
              stroke="#00f0ff"
              strokeWidth="1.5"
            />
            <path
              d="M14 14L26 26M26 14L14 26"
              stroke="#00f0ff"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="shield-gradient" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
                <stop stopColor="#111827" />
                <stop offset="1" stopColor="#1e293b" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[#e8f1ff]">
            <span className="text-[#00f0ff]">Cyber</span>
            <span className="text-[#a855f7]">X</span>
          </h2>
          <p className="text-sm text-[#64748b] mt-1">Initializing security protocols...</p>
        </div>
      </div>
    </div>
  )
}
