"use client"

import { useState, useRef } from "react"
import { Upload, X, FileVideo, AlertCircle, Check } from "lucide-react"

interface VideoFile {
  file: File
  name: string
  size: string
  preview: string
}

interface DashboardVideoUploaderProps {
  onAnalyze: (file: File) => void
  isAnalyzing: boolean
}

const SUPPORTED_FORMATS = ["mp4", "mov", "avi", "mkv", "webm"]
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

export function DashboardVideoUploader({
  onAnalyze,
  isAnalyzing,
}: DashboardVideoUploaderProps) {
  const [video, setVideo] = useState<VideoFile | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [showAnalyzeDialog, setShowAnalyzeDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    const extension = file.name.split(".").pop()?.toLowerCase()

    if (!extension || !SUPPORTED_FORMATS.includes(extension)) {
      return `Invalid format. Supported: ${SUPPORTED_FORMATS.join(", ").toUpperCase()}`
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is 500MB. Your file is ${(
        file.size /
        1024 /
        1024
      ).toFixed(2)}MB`
    }

    return null
  }

  const handleFile = (file: File) => {
    setError("")
    setSuccess("")

    const validationError = validateFile(file)

    if (validationError) {
      setError(validationError)
      return
    }

    if (video?.preview) {
      URL.revokeObjectURL(video.preview)
    }

    const preview = URL.createObjectURL(file)

    setVideo({
      file,
      name: file.name,
      size: formatFileSize(file.size),
      preview,
    })

    setSuccess("Video uploaded successfully. You can now analyze it.")
  }

  const confirmAnalyze = () => {
    if (!video) return
    setShowAnalyzeDialog(false)
    setSuccess("")
    onAnalyze(video.file)
  }

  const confirmRemove = () => {
    if (!video) return

    if (video.preview) {
      URL.revokeObjectURL(video.preview)
    }

    setVideo(null)
    setError("")
    setSuccess("Video removed successfully.")
    setShowRemoveDialog(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-4 relative">
      {!video ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? "border-[#00f0ff] bg-[#00f0ff]/5"
              : "border-[#1e3a5f] hover:border-[#00f0ff]/50 hover:bg-[#1e293b]/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp4,.mov,.avi,.mkv,.webm"
            onChange={handleInputChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
                isDragging ? "bg-[#00f0ff]/20" : "bg-[#1e293b]"
              }`}
            >
              <Upload
                className={`w-8 h-8 ${
                  isDragging ? "text-[#00f0ff]" : "text-[#64748b]"
                }`}
              />
            </div>

            <div>
              <p className="text-[#e8f1ff] font-medium">
                {isDragging ? "Drop your video here" : "Drag and drop your video"}
              </p>
              <p className="text-sm text-[#64748b] mt-1">
                or click to browse from your computer
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              {SUPPORTED_FORMATS.map((format) => (
                <span
                  key={format}
                  className="px-2 py-1 text-xs font-mono bg-[#1e293b] text-[#94a3b8] rounded-md"
                >
                  .{format}
                </span>
              ))}
            </div>

            <p className="text-xs text-[#64748b]">Maximum file size: 500MB</p>
          </div>
        </div>
      ) : (
        <div className="bg-[#1e293b] rounded-2xl p-4 space-y-4">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
            <video
              src={video.preview}
              controls
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-[#111827] rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#00f0ff]/10 flex items-center justify-center">
                <FileVideo className="w-5 h-5 text-[#00f0ff]" />
              </div>

              <div>
                <p className="text-sm font-medium text-[#e8f1ff] truncate max-w-[200px] sm:max-w-[300px]">
                  {video.name}
                </p>
                <p className="text-xs text-[#64748b]">{video.size}</p>
              </div>
            </div>

            <button
              onClick={() => setShowRemoveDialog(true)}
              disabled={isAnalyzing}
              className="p-2 text-[#64748b] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setShowAnalyzeDialog(true)}
            disabled={isAnalyzing}
            className="btn-cyber w-full py-3 px-4 bg-[#00f0ff] text-[#0a0e17] font-semibold rounded-xl hover:bg-[#00f0ff]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Analyzing Video...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Analyze Video
              </>
            )}
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/30">
          <Check className="w-5 h-5 text-[#22c55e] shrink-0" />
          <p className="text-sm text-[#22c55e]">{success}</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30">
          <AlertCircle className="w-5 h-5 text-[#ef4444] shrink-0" />
          <p className="text-sm text-[#ef4444]">{error}</p>
        </div>
      )}

      {showAnalyzeDialog && video && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[360px] rounded-xl bg-[#111827] border border-[#1e3a5f] p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-[#00f0ff]/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-[#00f0ff]" />
              </div>
              <h3 className="text-[#e8f1ff] font-semibold text-sm">
                Analyze Video?
              </h3>
            </div>

            <p className="text-xs text-[#94a3b8] mb-3">
              Are you sure you want to analyze:
            </p>

            <div className="px-3 py-2 rounded-lg bg-[#0a0e17] border border-[#1e3a5f] text-xs text-[#e8f1ff] truncate mb-5">
              {video.name}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowAnalyzeDialog(false)}
                className="py-2 rounded-lg bg-[#1e293b] text-[#94a3b8] text-xs hover:bg-[#334155]"
              >
                Cancel
              </button>
              <button
                onClick={confirmAnalyze}
                className="py-2 rounded-lg bg-[#00f0ff] text-[#0a0e17] text-xs font-semibold hover:bg-[#00f0ff]/90"
              >
                Yes, Analyze
              </button>
            </div>
          </div>
        </div>
      )}

      {showRemoveDialog && video && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[360px] rounded-xl bg-[#111827] border border-[#7f1d1d] p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-[#ef4444]/10 flex items-center justify-center">
                <X className="w-4 h-4 text-[#ef4444]" />
              </div>
              <h3 className="text-[#e8f1ff] font-semibold text-sm">
                Remove Video?
              </h3>
            </div>

            <p className="text-xs text-[#94a3b8] mb-3">
              Are you sure you want to remove:
            </p>

            <div className="px-3 py-2 rounded-lg bg-[#0a0e17] border border-[#7f1d1d] text-xs text-[#e8f1ff] truncate mb-5">
              {video.name}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowRemoveDialog(false)}
                className="py-2 rounded-lg bg-[#1e293b] text-[#94a3b8] text-xs hover:bg-[#334155]"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="py-2 rounded-lg bg-[#ef4444] text-white text-xs font-semibold hover:bg-[#dc2626]"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}