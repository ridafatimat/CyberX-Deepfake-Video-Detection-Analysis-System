interface CyberXLogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function CyberXLogo({ className = "", size = "md" }: CyberXLogoProps) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10"
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        className={sizeClasses[size]}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Rounded square background */}
        <rect
          x="2"
          y="2"
          width="36"
          height="36"
          rx="8"
          fill="#2dd4bf"
        />
        {/* C shape bracket */}
        <path
          d="M14 12C11 12 9 14.5 9 20C9 25.5 11 28 14 28"
          stroke="#0a0f1a"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Closing bracket */}
        <path
          d="M26 12C29 12 31 14.5 31 20C31 25.5 29 28 26 28"
          stroke="#0a0f1a"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Dot in center */}
        <circle cx="20" cy="20" r="3" fill="#0a0f1a" />
      </svg>
      <span className={`font-bold tracking-tight ${
        size === "sm" ? "text-lg" : size === "md" ? "text-xl" : "text-2xl"
      }`}>
        <span className="text-white">CyberX</span>
      </span>
    </div>
  )
}
