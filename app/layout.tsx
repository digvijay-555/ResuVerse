import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "ResuVerse | AI Resume Analyzer & ATS Checker",
  description: "Get instant AI feedback and ATS scores tailored to your dream job applications.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-gray-50/50 text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <Providers>
          <Navbar />
          <div className="flex-1">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
