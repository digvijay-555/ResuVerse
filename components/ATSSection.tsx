"use client";

import { CheckCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Suggestion {
  type: "good" | "improve";
  tip: string;
}

interface ATSSectionProps {
  score: number;
  suggestions: Suggestion[];
}

export default function ATSSection({ score, suggestions }: ATSSectionProps) {
  const isHigh = score >= 70;
  const isMedium = score >= 50 && score < 70;

  const bgGradient = isHigh
    ? "from-emerald-50/80 via-white to-white dark:from-emerald-950/20 dark:via-gray-900 dark:to-gray-900"
    : isMedium
    ? "from-amber-50/80 via-white to-white dark:from-amber-950/20 dark:via-gray-900 dark:to-gray-900"
    : "from-red-50/80 via-white to-white dark:from-red-950/20 dark:via-gray-900 dark:to-gray-900";

  const subtitle = isHigh
    ? "Great Job!"
    : isMedium
    ? "Good Start"
    : "Needs Improvement";

  return (
    <Card className={`bg-gradient-to-b ${bgGradient} border-gray-200/80 dark:border-gray-800 shadow-md`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-5">
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
              isHigh
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
                : isMedium
                ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
            }`}
          >
            {isHigh ? (
              <CheckCircle className="h-8 w-8" />
            ) : (
              <AlertTriangle className="h-8 w-8" />
            )}
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              ATS Compatibility
            </span>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
              ATS Score: {score}/100
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{subtitle}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This score represents how well your resume is likely to perform in Applicant Tracking Systems used by automated screeners.
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {suggestions && suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 rounded-xl p-3 text-sm ${
                  suggestion.type === "good"
                    ? "bg-emerald-50/60 text-emerald-900 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900/50"
                    : "bg-amber-50/60 text-amber-900 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900/50"
                }`}
              >
                {suggestion.type === "good" ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 dark:text-amber-400" />
                )}
                <span className="font-medium">{suggestion.tip}</span>
              </div>
            ))}
          </div>

          <p className="text-xs italic text-gray-500 dark:text-gray-400 pt-2">
            Keep refining your resume content to improve your chances of passing ATS screeners into recruiter interviews.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
