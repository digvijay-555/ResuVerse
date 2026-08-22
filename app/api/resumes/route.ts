import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Resume from "@/models/Resume";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const resumes = await Resume.find({ userId })
      .select("-pdfData")
      .sort({ createdAt: -1 });

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

    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
    const pdfBase64 = pdfBuffer.toString("base64");

    let previewImageUrl = "/images/pdf.png";

    if (previewImageFile) {
      const imgBuffer = Buffer.from(await previewImageFile.arrayBuffer());
      const mimeType = previewImageFile.type || "image/png";
      previewImageUrl = `data:${mimeType};base64,${imgBuffer.toString("base64")}`;
    }

    await connectToDatabase();

    const resume = await Resume.create({
      userId,
      fileName: pdfFile.name,
      fileUrl: "/api/resumes/pending",
      pdfData: pdfBase64,
      previewImageUrl,
      companyName,
      jobTitle,
      jobDescription,
      atsScore: 0,
      feedback: null,
    });

    resume.fileUrl = `/api/resumes/${resume._id}/file`;
    await resume.save();

    // Do not return heavy pdfData in JSON response
    const resumeObj = resume.toObject();
    delete resumeObj.pdfData;

    return NextResponse.json({ resume: resumeObj }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating resume:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload resume" },
      { status: 500 }
    );
  }
}
