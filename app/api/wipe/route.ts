import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Resume from "@/models/Resume";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const userResumes = await Resume.find({ userId });

    for (const resume of userResumes) {
      if (resume.fileUrl && resume.fileUrl.startsWith("/uploads/")) {
        const filePath = path.join(process.cwd(), "public", resume.fileUrl);
        await unlink(filePath).catch(() => {});
      }
      if (
        resume.previewImageUrl &&
        resume.previewImageUrl.startsWith("/uploads/")
      ) {
        const imgPath = path.join(process.cwd(), "public", resume.previewImageUrl);
        await unlink(imgPath).catch(() => {});
      }
    }

    const result = await Resume.deleteMany({ userId });

    return NextResponse.json({
      message: "All resume data wiped successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error: any) {
    console.error("Error wiping user resumes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to wipe user data" },
      { status: 500 }
    );
  }
}
