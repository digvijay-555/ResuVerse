"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Trash2, AlertTriangle, ShieldAlert, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleWipeData = async () => {
    setIsWiping(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/wipe", {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to wipe data.");
      }

      setSuccessMsg("All your resume documents and uploaded files have been permanently deleted.");
      setDialogOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while wiping data.");
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100">
            Account Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your account preferences and stored application data.
          </p>
        </div>

        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <Card className="border-gray-200/80 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">User Profile</CardTitle>
            <CardDescription>Your authenticated account credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 text-sm">
              <span className="font-semibold text-gray-500">Name</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {session?.user?.name || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 text-sm">
              <span className="font-semibold text-gray-500">Email Address</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {session?.user?.email || "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50/20 dark:border-red-900/50 dark:bg-red-950/10">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <ShieldAlert className="h-5 w-5" />
              <CardTitle className="text-lg text-red-700 dark:text-red-400">Danger Zone</CardTitle>
            </div>
            <CardDescription className="text-red-900/70 dark:text-red-300/70">
              Permanently remove all your resume records and files from ResuVerse.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              This action will delete all stored resume documents, AI ATS analysis reports, and server upload files associated with your user account from MongoDB and disk storage.
            </p>
            <Button
              variant="destructive"
              className="gap-2 font-bold shadow-md"
              onClick={() => setDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              <span>Wipe All My Resumes & Files</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Confirm Data Wipe"
        description="Are you absolutely sure you want to delete all your resume scans and uploaded files? This action cannot be undone."
      >
        <div className="space-y-4 pt-2">
          <div className="rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800">
            Warning: All database records and server files will be permanently erased.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isWiping}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleWipeData}
              disabled={isWiping}
              className="gap-2 font-bold"
            >
              {isWiping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span>Yes, Delete Everything</span>
            </Button>
          </div>
        </div>
      </Dialog>
    </main>
  );
}
