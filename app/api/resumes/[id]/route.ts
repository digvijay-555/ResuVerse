import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Resume from "@/models/Resume";
import { unlink } from "fs/promises";
import path from "path";

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

    return NextResponse.json({ resume });
  } catch (error: any) {
    console.error("Error fetching resume:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch resume" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await Resume.deleteOne({ _id: params.id, userId });

    return NextResponse.json({ message: "Resume deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting resume:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete resume" },
      { status: 500 }
    );
  }
}
