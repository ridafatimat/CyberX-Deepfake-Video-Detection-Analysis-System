'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface AnalysisProgressProps {
  isAnalyzing: boolean;
  progress: number; // 0-100
  fileName: string;
  currentStep: string;
}

export function AnalysisProgress({
  isAnalyzing,
  progress,
  fileName,
  currentStep
}: AnalysisProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(progress);

  useEffect(() => {
    // Smooth progress animation
    const interval = setInterval(() => {
      setDisplayProgress(prev => {
        if (prev < progress) {
          return Math.min(prev + 2, progress);
        }
        return prev;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [progress]);

  return (
    <div className="w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg p-6 border border-cyan-500/30">
      <div className="flex items-center gap-3 mb-4">
        {isAnalyzing && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />}
        <div>
          <p className="text-sm font-medium text-gray-300">Analyzing Video</p>
          <p className="text-xs text-gray-500">{fileName}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-400">{currentStep}</p>
          <p className="text-sm font-semibold text-cyan-400">{displayProgress}%</p>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden border border-cyan-500/20">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full transition-all duration-300"
            style={{ width: `${displayProgress}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
          {[
            { step: 'Extract Frames', percent: 25 },
            { step: 'Analyze Features', percent: 60 },
            { step: 'Generate Report', percent: 100 }
          ].map((item, idx) => (
            <div
              key={idx}
              className={`text-center py-2 px-2 rounded border transition-all ${
                displayProgress >= item.percent
                  ? 'border-cyan-400 bg-cyan-400/10 text-cyan-300'
                  : 'border-gray-600 bg-gray-700/30 text-gray-500'
              }`}
            >
              {item.step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
