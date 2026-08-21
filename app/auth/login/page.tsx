"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Loader2, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error || "Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardContent className="space-y-4 pt-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
            Email Address
          </label>
          <Input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
            Password
          </label>
          <Input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full font-bold shadow-md" size="lg" disabled={loading}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In"}
        </Button>
      </form>

      <div className="text-center text-xs text-gray-500 pt-2">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="font-bold text-indigo-600 hover:underline">
          Create an account
        </Link>
      </div>
    </CardContent>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-[85vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-gray-200/80 dark:border-gray-800 shadow-xl">
        <CardHeader className="space-y-2 text-center pb-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            <FileText className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-black">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access your resume analysis dashboard
          </CardDescription>
        </CardHeader>
        <Suspense fallback={<div className="p-6 text-center text-sm text-gray-500">Loading form...</div>}>
          <LoginForm />
        </Suspense>
      </Card>
    </main>
  );
}
