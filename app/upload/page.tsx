"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import FileUploader from "@/components/FileUploader";
import { Sparkles, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const router = useRouter();

  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusStep, setStatusStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (pdf: File | null, preview: File | null) => {
    setPdfFile(pdf);
    setPreviewFile(preview);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!pdfFile) {
      setError("Please select a PDF resume file first.");
      return;
    }

    setIsAnalyzing(true);

    try {

      setStatusStep("Uploading resume and preparing metadata...");

      const formData = new FormData();
      formData.append("file", pdfFile);
      if (previewFile) {
        formData.append("previewImage", previewFile);
      }
      formData.append("companyName", companyName);
      formData.append("jobTitle", jobTitle);
      formData.append("jobDescription", jobDescription);

      const uploadRes = await fetch("/api/resumes", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const uploadData = await uploadRes.json();
        throw new Error(uploadData.error || "Failed to upload resume");
      }

      const { resume } = await uploadRes.json();

      setStatusStep("Analyzing resume against job description using AI...");

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume._id }),
      });

      if (!analyzeRes.ok) {
        const analyzeData = await analyzeRes.json();
        throw new Error(analyzeData.error || "Failed to analyze resume");
      }

      setStatusStep("Analysis complete! Redirecting to report...");
      router.push(`/resume/${resume._id}`);
    } catch (err: any) {
      console.error("Analysis process error:", err);
      setError(err.message || "Failed to process resume analysis");
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>Smart ATS Analysis</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100">
          Analyze Your Resume
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Provide your target job role and upload your resume for instant AI feedback.
        </p>
      </div>

      {isAnalyzing ? (
        <Card className="border-gray-200/80 dark:border-gray-800 p-12 text-center shadow-lg">
          <CardContent className="flex flex-col items-center justify-center space-y-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Scanning & Evaluating...
              </h2>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                {statusStep}
              </p>
            </div>
            <p className="text-xs text-gray-400 max-w-xs">
              AI is parsing skills, content tone, structure, and job alignment. This usually takes 5-10 seconds.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-200/80 dark:border-gray-800 shadow-xl">
          <CardContent className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 flex items-center gap-2.5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
                    Company Name <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Google, Stripe"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
                    Target Job Title
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Frontend Engineer, Product Manager"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
                  Job Description <span className="text-gray-400 font-normal">(Recommended for accuracy)</span>
                </label>
                <Textarea
                  rows={5}
                  placeholder="Paste the target job description or key requirements here..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-gray-700 dark:text-gray-300">
                  Upload Resume PDF
                </label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full font-bold shadow-lg text-base py-6 gap-2"
                disabled={!pdfFile}
              >
                <Sparkles className="h-5 w-5" />
                <span>Analyze Resume with AI</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
