"use client";

import ScoreGauge from "@/components/ScoreGauge";
import ScoreBadge from "@/components/ScoreBadge";
import { Progress } from "@/components/ui/progress";
import { IFeedback } from "@/models/Resume";

interface CategoryRowProps {
  title: string;
  score: number;
}

const CategoryRow = ({ title, score }: CategoryRowProps) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className="text-gray-700 dark:text-gray-300">{title}</span>
        <ScoreBadge score={score} />
      </div>
      <Progress value={score} max={100} />
    </div>
  );
};

export default function Summary({ feedback }: { feedback: IFeedback }) {
  if (!feedback) return null;

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-gray-100 dark:border-gray-800">
        <ScoreGauge score={feedback.overallScore} size={160} />
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
            Overall Resume Score
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This score is synthesized across four core resume dimensions based on AI ATS analysis.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {feedback.toneAndStyle && (
          <CategoryRow title="Tone & Style" score={feedback.toneAndStyle.score} />
        )}
        {feedback.content && (
          <CategoryRow title="Content" score={feedback.content.score} />
        )}
        {feedback.structure && (
          <CategoryRow title="Structure" score={feedback.structure.score} />
        )}
        {feedback.skills && (
          <CategoryRow title="Skills" score={feedback.skills.score} />
        )}
      </div>
    </div>
  );
}
