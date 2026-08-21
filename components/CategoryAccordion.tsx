"use client";

import { Accordion, AccordionItem } from "@/components/ui/accordion";
import ScoreBadge from "@/components/ScoreBadge";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { IFeedback, IFeedbackTip } from "@/models/Resume";

interface CategoryContentProps {
  tips: IFeedbackTip[];
}

const CategoryContent: React.FC<CategoryContentProps> = ({ tips }) => {
  if (!tips || tips.length === 0) {
    return <p className="text-sm text-gray-500 italic">No specific tips available for this section.</p>;
  }

  return (
    <div className="space-y-3 pt-2">
      {tips.map((item, index) => {
        const isGood = item.type === "good";

        return (
          <div
            key={index}
            className={`rounded-xl border p-4 text-sm transition-all ${
              isGood
                ? "bg-emerald-50/50 border-emerald-200/80 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-800/60 dark:text-emerald-200"
                : "bg-amber-50/50 border-amber-200/80 text-amber-950 dark:bg-amber-950/30 dark:border-amber-800/60 dark:text-amber-200"
            }`}
          >
            <div className="flex items-center gap-2.5 font-bold mb-1">
              {isGood ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <span>{item.tip}</span>
            </div>
            {item.explanation && (
              <p className="pl-6 text-xs leading-relaxed opacity-90">{item.explanation}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function CategoryAccordion({ feedback }: { feedback: IFeedback }) {
  if (!feedback) return null;

  const categories = [
    { key: "toneAndStyle", label: "Tone & Style", data: feedback.toneAndStyle },
    { key: "content", label: "Content", data: feedback.content },
    { key: "structure", label: "Structure", data: feedback.structure },
    { key: "skills", label: "Skills", data: feedback.skills },
  ];

  return (
    <Accordion className="space-y-3">
      {categories.map((cat, idx) => {
        if (!cat.data) return null;

        return (
          <AccordionItem
            key={cat.key}
            defaultOpen={idx === 0}
            title={
              <div className="flex items-center justify-between pr-2">
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {cat.label}
                </span>
                <ScoreBadge score={cat.data.score || 0} />
              </div>
            }
          >
            <CategoryContent tips={cat.data.tips || []} />
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
