import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

interface ScoreBadgeProps {
  score: number;
  className?: string;
}

export default function ScoreBadge({ score, className }: ScoreBadgeProps) {
  const isHigh = score >= 70;
  const isMedium = score >= 50 && score < 70;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold shadow-xs",
        isHigh
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
          : isMedium
          ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
          : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800",
        className
      )}
    >
      {isHigh ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
      ) : isMedium ? (
        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
      )}
      <span>{score}/100</span>
    </div>
  );
}
