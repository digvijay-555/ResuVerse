import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Resume from "@/models/Resume";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ resumes });
  } catch (error: any) {
    console.error("Error fetching resumes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch resumes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const formData = await req.formData();

    const pdfFile = formData.get("file") as File | null;
    const previewImageFile = formData.get("previewImage") as File | null;
    const companyName = (formData.get("companyName") as string) || "";
    const jobTitle = (formData.get("jobTitle") as string) || "";
    const jobDescription = (formData.get("jobDescription") as string) || "";

    if (!pdfFile) {
      return NextResponse.json({ error: "PDF resume file is required" }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const fileId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    const pdfFileName = `${fileId}-${pdfFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const pdfFilePath = path.join(uploadsDir, pdfFileName);

    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
    await writeFile(pdfFilePath, pdfBuffer);

    const fileUrl = `/uploads/${pdfFileName}`;

    let previewImageUrl = "/images/pdf.png";

    if (previewImageFile) {
      const imgFileName = `${fileId}-preview.png`;
      const imgFilePath = path.join(uploadsDir, imgFileName);
      const imgBuffer = Buffer.from(await previewImageFile.arrayBuffer());
      await writeFile(imgFilePath, imgBuffer);
      previewImageUrl = `/uploads/${imgFileName}`;
    }

    await connectToDatabase();

    const resume = await Resume.create({
      userId,
      fileName: pdfFile.name,
      fileUrl,
      previewImageUrl,
      companyName,
      jobTitle,
      jobDescription,
      atsScore: 0,
      feedback: null,
    });

    return NextResponse.json({ resume }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating resume:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload resume" },
      { status: 500 }
    );
  }
}
