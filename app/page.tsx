"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ScoreBadge from "@/components/ScoreBadge";
import ScoreGauge from "@/components/ScoreGauge";
import {
  Upload,
  Plus,
  FileText,
  Trash2,
  Sparkles,
  Target,
  BarChart3,
  ArrowRight,
  Loader2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  Search,
  Briefcase,
  Award,
  Users,
  ChevronRight,
  ShieldCheck,
  Star,
  Layers,
  FileCheck,
  Cpu,
  Check,
  RefreshCw,
  Eye,
  Sliders,
  CheckCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ResumeItem {
  _id: string;
  fileName: string;
  fileUrl: string;
  previewImageUrl: string;
  companyName?: string;
  jobTitle?: string;
  atsScore?: number;
  createdAt: string;
}

const DEMO_PRESETS = [
  {
    role: "Senior Frontend Engineer",
    company: "Stripe",
    score: 88,
    matchRate: "92%",
    skillsMatched: ["React", "TypeScript", "Next.js", "Tailwind CSS", "GraphQL", "State Management"],
    missingSkills: ["Web Vitals Optimization", "Jest / Cypress CI"],
    categoryScores: { ats: 90, tone: 85, content: 86, structure: 92, skills: 88 },
    highlightTip: "Directly matches high-priority frontend keywords. Add quantifiable Core Web Vital impact metrics to reach 95+ score.",
  },
  {
    role: "Full Stack AI Engineer",
    company: "OpenAI / Scale AI",
    score: 74,
    matchRate: "78%",
    skillsMatched: ["Python", "LangChain", "FastAPI", "React", "Vector DBs", "Docker"],
    missingSkills: ["Fine-tuning LoRA", "Distributed Training (vLLM)"],
    categoryScores: { ats: 76, tone: 72, content: 70, structure: 80, skills: 74 },
    highlightTip: "Great base LLM development experience. Strengthen system design details and production model latency metrics.",
  },
  {
    role: "Product Manager",
    company: "Google",
    score: 62,
    matchRate: "65%",
    skillsMatched: ["Roadmapping", "Agile / Scrum", "Data Analytics", "Cross-functional Leadership"],
    missingSkills: ["A/B Experimentation at Scale", "SQL Querying", "P&L Ownership"],
    categoryScores: { ats: 65, tone: 68, content: 58, structure: 64, skills: 60 },
    highlightTip: "Experience descriptions are too task-focused. Reframe achievements with business impact and measurable revenue growth.",
  },
];

const FAQS = [
  {
    q: "How does the ATS Score calculation work?",
    a: "Our engine utilizes state-of-the-art AI to evaluate your resume against 4 foundational pillars: ATS Keyword Match, Tone & Professional Style, Content Impact (with metric validation), and Structural Format Readability.",
  },
  {
    q: "Can I test my resume against specific Job Descriptions?",
    a: "Yes! Simply paste the target job title, company name, and job description when uploading. The AI performs side-by-side gap analysis to highlight missing keywords and qualification matches.",
  },
  {
    q: "Is my resume data kept private and secure?",
    a: "Absolutely. Your uploaded files and analysis results are strictly private to your account and never used to train public models or shared with third parties.",
  },
  {
    q: "What file formats are supported for upload?",
    a: "We currently support standard PDF resumes. Our built-in text parser and visual OCR fallbacks ensure flawless extraction regardless of single or multi-column layouts.",
  },
  {
    q: "How quickly can I see my ATS feedback?",
    a: "Analysis takes approximately 5 to 10 seconds. You receive an instant comprehensive breakdown with categorized tips, strengths, and actionable fixes.",
  },
];

export default function Home() {
  const { data: session, status } = useSession();
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0);
  const [activeCategoryTab, setActiveCategoryTab] = useState<"ats" | "tone" | "content" | "structure" | "skills">("ats");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const [boosterState, setBoosterState] = useState({
    addMetrics: false,
    fixKeywords: false,
    standardizeFormat: false,
    actionVerbs: false,
  });

  const baseScore = 54;
  const computedBoosterScore =
    baseScore +
    (boosterState.addMetrics ? 14 : 0) +
    (boosterState.fixKeywords ? 16 : 0) +
    (boosterState.standardizeFormat ? 8 : 0) +
    (boosterState.actionVerbs ? 6 : 0);

  const activeDemo = DEMO_PRESETS[selectedDemoIndex];

  useEffect(() => {
    if (session) {
      fetchResumes();
    }
  }, [session]);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes || []);
      }
    } catch (err) {
      console.error("Failed to load resumes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!confirm("Are you sure you want to delete this resume scan?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setResumes((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error("Failed to delete resume:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (session) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-gray-200/80 dark:border-gray-800">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              My Resumes
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your uploaded resumes and review ATS performance feedback.
            </p>
          </div>
          <Link href="/upload">
            <Button className="gap-2 shadow-md">
              <Plus className="h-4 w-4" />
              <span>New ATS Analysis</span>
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-300 p-12 text-center my-12 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              No resumes analyzed yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mt-1.5 mb-6">
              Upload your PDF resume to check your ATS compatibility score and get AI tips for your target job role.
            </p>
            <Link href="/upload">
              <Button size="lg" className="gap-2 shadow-lg">
                <Upload className="h-5 w-5" />
                <span>Upload First Resume</span>
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
            {resumes.map((resume) => (
              <motion.div
                key={resume._id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Link href={`/resume/${resume._id}`}>
                  <Card className="group relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl dark:border-gray-800">
                    <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-950 overflow-hidden flex items-center justify-center">
                      {resume.previewImageUrl && !resume.previewImageUrl.includes("/images/pdf.png") ? (
                        <img
                          src={resume.previewImageUrl}
                          alt={resume.jobTitle || "Resume Preview"}
                          className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <iframe
                          src={`${resume.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                          title={resume.fileName}
                          className="h-full w-full pointer-events-none border-0 bg-white"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70 pointer-events-none" />
                      <div className="absolute top-3 right-3 z-10">
                        <ScoreBadge score={resume.atsScore || 0} />
                      </div>
                    </div>

                    <CardContent className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-extrabold text-lg text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
                            {resume.jobTitle || "Untitled Position"}
                          </h3>
                          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 truncate max-w-[200px]">
                            {resume.companyName || "Target Company"}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDelete(resume._id, e)}
                          disabled={deletingId === resume._id}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
                          title="Delete Resume"
                        >
                          {deletingId === resume._id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                        </div>
                        <span className="font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                          Review <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="relative overflow-hidden">

      <motion.div
        animate={{
          x: [0, 50, -40, 0],
          y: [0, -40, 30, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-5rem] left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-indigo-500/25 to-purple-500/20 blur-[130px] pointer-events-none"
      />
      <motion.div
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 40, -30, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[20rem] right-1/4 -z-10 h-[450px] w-[450px] rounded-full bg-gradient-to-br from-pink-500/20 to-indigo-600/20 blur-[120px] pointer-events-none"
      />

      <section className="mx-auto max-w-7xl px-4 pt-14 pb-20 sm:px-6 lg:px-8 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-6 max-w-4xl mx-auto"
        >

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 dark:border-indigo-900/60 dark:bg-indigo-950/70 px-4 py-1.5 text-xs font-extrabold text-indigo-700 dark:text-indigo-300 shadow-sm backdrop-blur-md cursor-default"
          >
            <motion.div
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            </motion.div>
            <span>Next-Gen AI Resume & ATS Optimizer</span>
          </motion.div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-900 dark:text-gray-100 leading-tight">
            Get Interview Ready with{" "}
            <span className="relative inline-block mt-2">
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent px-3 py-1 drop-shadow-sm">
                AI Intelligence
              </span>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Drop your resume, match it against target job descriptions, and unlock instant ATS scores with actionable AI tips across Tone, Content, Structure & Skills.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/auth/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 30px -10px rgba(99, 102, 241, 0.4)" }}
                whileTap={{ scale: 0.97 }}
                className="bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-8 py-3.5 rounded-full font-bold shadow-xl transition-all flex items-center gap-2 text-sm sm:text-base group"
              >
                <span>Start Free Analysis</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            <a href="#interactive-demo">
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "rgba(99, 102, 241, 0.12)" }}
                whileTap={{ scale: 0.97 }}
                className="border border-indigo-200 bg-indigo-50/70 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 px-7 py-3.5 rounded-full font-bold transition-all shadow-sm text-sm sm:text-base flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                <span>Try Interactive Demo</span>
              </motion.button>
            </a>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="pt-8 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
          >
            {[
              { label: "ATS Accuracy", value: "98.4%", icon: Target, color: "text-indigo-600" },
              { label: "Faster Callbacks", value: "10x", icon: Zap, color: "text-amber-500" },
              { label: "Resumes Optimized", value: "45,000+", icon: FileCheck, color: "text-emerald-600" },
              { label: "Candidate Rating", value: "4.9 / 5", icon: Star, color: "text-purple-600" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-md p-4 text-center dark:border-gray-800 dark:bg-gray-900/70 shadow-sm transition-all"
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    <Icon className={`h-3.5 w-3.5 ${stat.color}`} />
                    <span>{stat.label}</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100">
                    {stat.value}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        <div className="mt-32 mb-28">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Simple 3-Step Process
            </h2>
            <p className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100">
              How ResuVerse Optimizes Your Resume
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "STEP 1",
                title: "Upload & Auto-Parse",
                desc: "Drop your PDF resume and target job details. Instant text extraction, section identification, and metadata tagging.",
                icon: Upload,
                tilt: "md:-rotate-3",
              },
              {
                step: "STEP 2",
                title: "Deep AI Evaluation",
                desc: "AI scans keyword relevance, tone, quantified achievements, and ATS screener rules against live job expectations.",
                icon: Cpu,
                tilt: "md:rotate-3 md:-mt-6 shadow-xl border-indigo-300 dark:border-indigo-800",
              },
              {
                step: "STEP 3",
                title: "Score Boost & Actionable Fixes",
                desc: "Receive categorized 0-100 scores and precise, line-by-line recommendations to elevate your interview call rate.",
                icon: TrendingUp,
                tilt: "md:-rotate-2",
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  whileHover={{ rotate: 0, scale: 1.06, y: -6 }}
                  className={`relative bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 w-full md:w-1/3 shadow-md hover:shadow-2xl transition-all duration-300 ${card.tilt}`}
                >

                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-900 border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg cursor-pointer"
                  >
                    <Icon className="h-6 w-6" />
                  </motion.div>

                  <div className="pt-6 text-center">
                    <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-2 tracking-widest">
                      {card.step}
                    </div>
                    <h3 className="font-extrabold text-lg text-gray-900 dark:text-gray-100 mb-2.5">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <section id="interactive-demo" className="mt-28 mb-28 text-left scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3.5 py-1 text-xs font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <Zap className="h-3.5 w-3.5" />
              <span>Interactive Live Preview</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100">
              See How AI Evaluates Sample Candidates
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Switch between real job target presets below to explore dynamic score breakdowns and actionable AI feedback.
            </p>
          </div>

          <div className="max-w-5xl mx-auto rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-2xl p-6 sm:p-8">

            <div className="flex flex-wrap gap-2 pb-6 border-b border-gray-100 dark:border-gray-800">
              {DEMO_PRESETS.map((preset, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedDemoIndex(idx)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                    selectedDemoIndex === idx
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{preset.role}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 text-white">
                    {preset.score}/100
                  </span>
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDemoIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6"
              >

                <div className="lg:col-span-5 flex flex-col justify-center items-center bg-gray-50/70 dark:bg-gray-950/60 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Target Company: <span className="text-indigo-600 dark:text-indigo-400">{activeDemo.company}</span>
                  </span>

                  <ScoreGauge score={activeDemo.score} size={190} />

                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Match Rate: {activeDemo.matchRate}</span>
                  </motion.div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 leading-relaxed italic">
                    &ldquo;{activeDemo.highlightTip}&rdquo;
                  </p>

                  <Link href="/upload" className="w-full mt-6">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button className="w-full gap-2 font-bold shadow-md">
                        <Sparkles className="h-4 w-4" />
                        <span>Scan Your Resume Now</span>
                      </Button>
                    </motion.div>
                  </Link>
                </div>

                <div className="lg:col-span-7 space-y-5">

                  <div className="flex flex-wrap gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                    {[
                      { id: "ats", label: "ATS Match" },
                      { id: "tone", label: "Tone & Style" },
                      { id: "content", label: "Content" },
                      { id: "structure", label: "Structure" },
                      { id: "skills", label: "Skills" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveCategoryTab(tab.id as any)}
                        className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all relative ${
                          activeCategoryTab === tab.id
                            ? "bg-white text-gray-900 dark:bg-gray-900 dark:text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-xl border border-gray-200/80 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 capitalize">
                        {activeCategoryTab} Evaluation
                      </h4>
                      <ScoreBadge score={activeDemo.categoryScores[activeCategoryTab]} />
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-start gap-2 bg-emerald-50/70 dark:bg-emerald-950/40 p-3 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-emerald-900 dark:text-emerald-200">Strengths detected: </span>
                          <span className="text-emerald-800 dark:text-emerald-300">
                            Includes relevant industry terminology, reverse-chronological layout, and targeted tech credentials.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 bg-amber-50/70 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-200/60 dark:border-amber-800/60">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-amber-900 dark:text-amber-200">Suggested improvement: </span>
                          <span className="text-amber-800 dark:text-amber-300">
                            Incorporate metrics like % latency reduction or revenue contribution to boost ATS score by +12 points.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                        <Check className="h-3.5 w-3.5" />
                        Matched Keywords ({activeDemo.skillsMatched.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeDemo.skillsMatched.map((s, i) => (
                          <motion.span
                            key={i}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="text-[11px] font-semibold bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800"
                          >
                            {s}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-red-200/80 bg-red-50/40 dark:border-red-900/50 dark:bg-red-950/20">
                      <span className="text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-1.5 mb-2">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Missing Keywords ({activeDemo.missingSkills.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeDemo.missingSkills.map((s, i) => (
                          <motion.span
                            key={i}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="text-[11px] font-semibold bg-white dark:bg-gray-800 text-red-700 dark:text-red-300 px-2 py-0.5 rounded border border-red-200 dark:border-red-800"
                          >
                            {s}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        <section className="mb-32 max-w-4xl mx-auto text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-indigo-200 dark:border-indigo-900/80 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/40 p-6 sm:p-10 shadow-xl"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                  <Sliders className="h-3.5 w-3.5" />
                  <span>Interactive Score Booster</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                  See how small fixes skyrocket your interview callbacks
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Toggle the common resume optimizations below to watch the simulated ATS score jump in real-time.
                </p>

                <div className="space-y-2.5 pt-2">
                  {[
                    { id: "addMetrics", label: "Add Quantifiable Impact Metrics", pts: "+14 pts" },
                    { id: "fixKeywords", label: "Fill Missing Job Description Keywords", pts: "+16 pts" },
                    { id: "standardizeFormat", label: "Standardize ATS Headers & Structure", pts: "+8 pts" },
                    { id: "actionVerbs", label: "Replace Passive Words with Strong Verbs", pts: "+6 pts" },
                  ].map((item) => {
                    const isChecked = (boosterState as any)[item.id];
                    return (
                      <motion.button
                        key={item.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setBoosterState((prev) => ({
                            ...prev,
                            [item.id]: !(prev as any)[item.id],
                          }))
                        }
                        className={`w-full p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                          isChecked
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-indigo-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`h-4 w-4 rounded flex items-center justify-center ${
                              isChecked ? "bg-white text-indigo-600" : "border border-gray-400"
                            }`}
                          >
                            {isChecked && <CheckCheck className="h-3 w-3" />}
                          </div>
                          <span>{item.label}</span>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            isChecked ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
                          }`}
                        >
                          {item.pts}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-inner w-full md:w-64 text-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Projected ATS Score
                </span>
                <motion.div
                  key={computedBoosterScore}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className={`text-5xl sm:text-6xl font-black my-2 ${
                    computedBoosterScore >= 80
                      ? "text-emerald-600"
                      : computedBoosterScore >= 65
                      ? "text-amber-500"
                      : "text-red-500"
                  }`}
                >
                  {computedBoosterScore}
                </motion.div>
                <span className="text-xs font-bold text-gray-500">out of 100</span>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 w-full">
                  <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    {computedBoosterScore >= 85
                      ? "🔥 Top 5% Applicant Tier"
                      : computedBoosterScore >= 70
                      ? "⚡ Solid Competitive Match"
                      : "⚠️ High Filter Risk"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mb-32">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              SmartAdvance AI{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Capabilities
              </span>
            </h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Engineered with advanced algorithms to deconstruct corporate ATS screening filters and maximize recruiter interest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-5xl mx-auto">
            {[
              {
                icon: BarChart3,
                title: "Algorithmic ATS Scoring",
                desc: "Evaluates your resume against corporate tracking benchmarks, providing a calibrated 0-100 rating with category breakdowns.",
                tag: "Precision Analytics",
              },
              {
                icon: Target,
                title: "Job-Specific Gap Detector",
                desc: "Matches your resume directly against target job descriptions to identify missing technical skills and experience gaps.",
                tag: "Keyword Alignment",
              },
              {
                icon: Layers,
                title: "4-Pillar Categorized Tips",
                desc: "Actionable suggestions grouped into Tone & Style, Content Impact, Document Structure, and Core Competencies.",
                tag: "Deep Feedback",
              },
              {
                icon: FileCheck,
                title: "Visual PDF Inspection",
                desc: "Scans font compatibility, single vs multi-column formats, and layout structure to eliminate ATS parsing bugs.",
                tag: "Format Assurance",
              },
            ].map((cap, i) => {
              const Icon = cap.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className="bg-white dark:bg-gray-900 border border-gray-200/90 dark:border-gray-800 rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {cap.tag}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-xl text-gray-900 dark:text-gray-100 mb-2.5">
                    {cap.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {cap.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="mb-32">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Versatile Resume{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Modes
              </span>
            </h2>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Choose how you want to evaluate your application materials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto text-left">
            {[
              {
                title: "Job Tailored Mode",
                desc: "Compares your resume against specific job descriptions for customized keyword matching.",
                icon: Briefcase,
              },
              {
                title: "General Health Check",
                desc: "Scans general resume strength, readability, and action verb strength without a JD.",
                icon: ShieldCheck,
              },
              {
                title: "Keyword Gap Matrix",
                desc: "Pinpoints high-frequency recruiter terms missing in your bullet points.",
                icon: Search,
              },
              {
                title: "Impact & Metric Polish",
                desc: "Transforms passive bullet points into measurable, high-impact career wins.",
                icon: Award,
              },
            ].map((mode, idx) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-2">
                    {mode.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {mode.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="mb-32 max-w-4xl mx-auto text-left">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100">
              Why ResuVerse Beats Traditional Review
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              See how our instant AI analysis compares with manual reviews and generic keyword checkers.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl"
          >
            <div className="grid grid-cols-12 bg-gray-50 dark:bg-gray-950/80 p-4 border-b border-gray-200 dark:border-gray-800 text-xs font-extrabold uppercase text-gray-500 tracking-wider">
              <div className="col-span-6 sm:col-span-5">Feature</div>
              <div className="col-span-3 sm:col-span-3 text-center text-gray-400">Manual / Legacy</div>
              <div className="col-span-3 sm:col-span-4 text-center text-indigo-600 dark:text-indigo-400">ResuVerse AI</div>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800 text-xs sm:text-sm">
              {[
                { feature: "Turnaround Time", old: "2 - 5 Business Days", resuverse: "5 - 10 Seconds" },
                { feature: "Job Description Comparison", old: "Generic or Manual", resuverse: "Deep Semantic Gap Analysis" },
                { feature: "Actionable Fixing Tips", old: "Vague feedback", resuverse: "Categorized Line-by-Line Fixes" },
                { feature: "ATS Algorithm Benchmarking", old: "Not Verified", resuverse: "Calibrated 0-100 Score" },
                { feature: "PDF Visual Verification", old: "None", resuverse: "Built-in Preview & OCR Check" },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-12 p-4 items-center hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="col-span-6 sm:col-span-5 font-semibold text-gray-900 dark:text-gray-100">
                    {row.feature}
                  </div>
                  <div className="col-span-3 sm:col-span-3 text-center text-gray-400">
                    {row.old}
                  </div>
                  <div className="col-span-3 sm:col-span-4 text-center font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{row.resuverse}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="mb-32">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Success Stories
            </h2>
            <p className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100">
              Trusted by Job Seekers Worldwide
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
            {[
              {
                quote: "ResuVerse caught 4 critical missing keywords in my resume that were in the Stripe job posting. Fixed them and got an interview within a week!",
                name: "Alex Rivera",
                role: "Frontend Engineer at Stripe",
                stars: 5,
              },
              {
                quote: "The 4-pillar breakdown helped me rewrite my bullet points with real revenue impact metrics. My ATS score leaped from 58 to 89.",
                name: "Sarah Chen",
                role: "Senior PM at Tech Unicorn",
                stars: 5,
              },
              {
                quote: "Fast, accurate, and completely transformed how I tailor resumes for enterprise tech roles. Easily the best resume tool I've used.",
                name: "Marcus Johnson",
                role: "DevOps Engineer at Cloud Platform",
                stars: 5,
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="rounded-3xl border border-gray-200/90 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-amber-400 mb-3">
                    {[...Array(t.stars)].map((_, si) => (
                      <Star key={si} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{t.name}</h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-32 max-w-3xl mx-auto text-left">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Everything you need to know about ResuVerse and AI ATS scoring.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-2xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full p-5 text-left font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 text-gray-400 transition-transform duration-200 ${
                        isOpen ? "rotate-90 text-indigo-600" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="px-5 pb-5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl bg-gradient-to-tr from-gray-900 via-indigo-950 to-purple-950 text-white p-10 sm:p-16 text-center max-w-5xl mx-auto shadow-2xl overflow-hidden mb-16"
        >

          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl animate-pulse" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-indigo-300 backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-indigo-300 animate-spin" style={{ animationDuration: "8s" }} />
              <span>Ready to Beat the ATS?</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Optimize Your Resume & Land Your Next Interview
            </h2>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Join thousands of candidates who improved their ATS scores and received interview callbacks with precision AI feedback.
            </p>

            <div className="pt-2 flex flex-wrap justify-center gap-4">
              <Link href="/auth/register">
                <motion.button
                  whileHover={{ scale: 1.06, boxShadow: "0 20px 30px -10px rgba(255, 255, 255, 0.3)" }}
                  whileTap={{ scale: 0.96 }}
                  className="bg-white text-gray-950 font-extrabold px-8 py-4 rounded-full shadow-2xl hover:bg-gray-100 transition-all flex items-center gap-2 text-sm sm:text-base"
                >
                  <span>Start Free Analysis</span>
                  <ArrowRight className="h-4 w-4 text-indigo-600" />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.section>
      </section>
    </main>
  );
}
