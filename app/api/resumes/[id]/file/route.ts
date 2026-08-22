import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Resume from "@/models/Resume";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const resume = await Resume.findOne({ _id: params.id, userId });
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (!resume.pdfData) {
      // Fallback for legacy resumes stored on disk locally
      if (resume.fileUrl && !resume.fileUrl.startsWith("/api/")) {
        try {
          const { readFile } = await import("fs/promises");
          const path = (await import("path")).default;
          const diskPath = path.join(process.cwd(), "public", resume.fileUrl);
          const fileBuffer = await readFile(diskPath);
          return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `inline; filename="${encodeURIComponent(resume.fileName)}"`,
            },
          });
        } catch (e) {
          console.warn("Could not load legacy file from disk:", e);
        }
      }
      return NextResponse.json({ error: "Resume PDF data not available" }, { status: 404 });
    }

    const buffer = Buffer.from(resume.pdfData, "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${encodeURIComponent(resume.fileName)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("Error serving resume file:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve resume file" },
      { status: 500 }
    );
  }
}
