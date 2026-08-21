"use client";

import { useEffect, useRef, useState } from "react";

interface ScoreGaugeProps {
  score?: number;
  size?: number;
}

export default function ScoreGauge({ score = 75, size = 180 }: ScoreGaugeProps) {
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);

  const percentage = Math.min(Math.max(score, 0), 100) / 100;

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  const getGradientColors = (score: number) => {
    if (score >= 70) return { start: "#10b981", end: "#059669" };
    if (score >= 50) return { start: "#f59e0b", end: "#d97706" };
    return { start: "#ef4444", end: "#dc2626" };
  };

  const colors = getGradientColors(score);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size / 2 + 10 }}>
        <svg viewBox="0 0 100 55" className="w-full h-full">
          <defs>
            <linearGradient id={`gaugeGradient-${score}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.start} />
              <stop offset="100%" stopColor={colors.end} />
            </linearGradient>
          </defs>

          <path
            d="M10,50 A40,40 0 0,1 90,50"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
            strokeLinecap="round"
            className="dark:stroke-gray-800"
          />

          <path
            ref={pathRef}
            d="M10,50 A40,40 0 0,1 90,50"
            fill="none"
            stroke={`url(#gaugeGradient-${score})`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={pathLength || 126}
            strokeDashoffset={pathLength ? pathLength * (1 - percentage) : 126 * (1 - percentage)}
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
          <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            {score}
          </span>
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            out of 100
          </span>
        </div>
      </div>
    </div>
  );
}
