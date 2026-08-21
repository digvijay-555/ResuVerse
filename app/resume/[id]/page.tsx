"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Summary from "@/components/Summary";
import ATSSection from "@/components/ATSSection";
import CategoryAccordion from "@/components/CategoryAccordion";
import { IResume } from "@/models/Resume";
import { ArrowLeft, ExternalLink, Loader2, RefreshCw, AlertCircle, Building2, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

export default function ResumeReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [resume, setResume] = useState<IResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadResume();
    }
  }, [id]);

  const loadResume = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/resumes/${id}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Resume not found.");
        throw new Error("Failed to load resume details.");
      }
      const data = await res.json();
      setResume(data.resume);

      if (!data.resume.feedback) {
        runAnalysis(data.resume._id);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load resume.");
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async (resumeId: string) => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });

      if (res.ok) {
        const data = await res.json();
        setResume(data.resume);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to analyze resume.");
      }
    } catch (err: any) {
      setError(err.message || "Error running analysis.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading || analyzing) {
    return (
      <main className="flex h-[75vh] flex-col items-center justify-center space-y-4 px-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400" />
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {analyzing ? "AI is analyzing your resume..." : "Loading report..."}
          </h2>
          <p className="text-xs text-gray-500 mt-1">Evaluating ATS match and compiling feedback.</p>
        </div>
      </main>
    );
  }

  if (error || !resume) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 mx-auto mb-4 dark:bg-red-950 dark:text-red-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Report Unavailable</h2>
        <p className="text-sm text-gray-500 mt-2 mb-6">{error || "Resume details could not be found."}</p>
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Dashboard</span>
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-200/80 dark:border-gray-800">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Homepage</span>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100">
              Resume Analysis Review
            </h1>
            {resume.jobTitle && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <Briefcase className="h-3 w-3" />
                {resume.jobTitle}
              </span>
            )}
            {resume.companyName && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <Building2 className="h-3 w-3" />
                {resume.companyName}
              </span>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => runAnalysis(String(resume._id))}
          className="gap-2 shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Re-analyze</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <motion.section
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-4 sticky top-24 space-y-4"
        >
          <div className="rounded-2xl border border-gray-200/80 bg-white p-3 shadow-md dark:border-gray-800 dark:bg-gray-900">
            <div className="relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-950 aspect-[1/1.4] flex items-center justify-center group">
              {resume.previewImageUrl && !resume.previewImageUrl.includes("/images/pdf.png") ? (
                <img
                  src={resume.previewImageUrl}
                  alt={resume.fileName}
                  className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-102"
                />
              ) : (
                <iframe
                  src={`${resume.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  title={resume.fileName}
                  className="w-full h-full rounded-lg border-0 bg-white"
                />
              )}
            </div>
          </div>

          <a
            href={resume.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-3 text-xs font-bold text-gray-800 hover:bg-gray-50 hover:text-indigo-600 shadow-xs dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors w-full"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open Original PDF Resume</span>
          </a>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-8 space-y-6"
        >
          {resume.feedback ? (
            <>

              <Summary feedback={resume.feedback} />

              <ATSSection
                score={resume.feedback.ATS?.score || resume.atsScore || 0}
                suggestions={resume.feedback.ATS?.tips || []}
              />

              <div className="space-y-3 pt-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Detailed Category Feedback
                </h3>
                <CategoryAccordion feedback={resume.feedback} />
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Feedback analysis is being generated...
              </p>
            </div>
          )}
        </motion.section>
      </div>
    </main>
  );
}
