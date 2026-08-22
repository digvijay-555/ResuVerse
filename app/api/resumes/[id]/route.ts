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

    // Cleanup legacy local files if they existed
    if (resume.fileUrl && resume.fileUrl.startsWith("/uploads/")) {
      try {
        const { unlink } = await import("fs/promises");
        const path = (await import("path")).default;
        const filePath = path.join(process.cwd(), "public", resume.fileUrl);
        await unlink(filePath).catch(() => {});
      } catch {}
    }

    if (
      resume.previewImageUrl &&
      resume.previewImageUrl.startsWith("/uploads/")
    ) {
      try {
        const { unlink } = await import("fs/promises");
        const path = (await import("path")).default;
        const imgPath = path.join(process.cwd(), "public", resume.previewImageUrl);
        await unlink(imgPath).catch(() => {});
      } catch {}
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
