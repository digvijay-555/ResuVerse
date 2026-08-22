import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Resume from "@/models/Resume";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse";

function cleanJsonResponse(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return cleaned.trim();
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json({ error: "resumeId is required" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    await connectToDatabase();

    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    let pdfText = "";
    let pdfBuffer: Buffer | null = null;

    if (resume.pdfData) {
      pdfBuffer = Buffer.from(resume.pdfData, "base64");
    } else if (resume.fileUrl && !resume.fileUrl.startsWith("/api/")) {
      try {
        const { readFile } = await import("fs/promises");
        const path = (await import("path")).default;
        const pdfPath = path.join(process.cwd(), "public", resume.fileUrl);
        pdfBuffer = await readFile(pdfPath);
      } catch (err) {
        console.warn("Could not read legacy PDF from disk:", err);
      }
    }

    if (pdfBuffer) {
      try {
        const parsedPdf = await pdfParse(pdfBuffer);
        pdfText = parsedPdf.text || "";
      } catch (err) {
        console.warn("Could not extract text via pdf-parse:", err);
      }
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) & Resume Reviewer.
Analyze the following resume and evaluate its match for the specified job role.

JOB DETAILS:
Job Title: ${resume.jobTitle || "General Role"}
Company Name: ${resume.companyName || "N/A"}
Job Description: ${resume.jobDescription || "N/A"}

RESUME TEXT CONTENT:
${pdfText || "No readable plain text extracted; please evaluate based on overall context."}

Your task:
Evaluate the resume thoroughly and return a strict JSON object (and NOTHING else).

EXPECTED JSON SCHEMA:
{
  "overallScore": number, // 0 to 100
  "ATS": {
    "score": number, // 0 to 100
    "tips": [
      {
        "type": "good" | "improve",
        "tip": "Short actionable recommendation title"
      }
    ]
  },
  "toneAndStyle": {
    "score": number,
    "tips": [
      {
        "type": "good" | "improve",
        "tip": "Short title",
        "explanation": "Detailed explanation of what is good or needs improvement"
      }
    ]
  },
  "content": {
    "score": number,
    "tips": [
      {
        "type": "good" | "improve",
        "tip": "Short title",
        "explanation": "Detailed explanation"
      }
    ]
  },
  "structure": {
    "score": number,
    "tips": [
      {
        "type": "good" | "improve",
        "tip": "Short title",
        "explanation": "Detailed explanation"
      }
    ]
  },
  "skills": {
    "score": number,
    "tips": [
      {
        "type": "good" | "improve",
        "tip": "Short title",
        "explanation": "Detailed explanation"
      }
    ]
  }
}

Provide 3 to 4 tips per category. Be constructive, precise, and realistic with scores.
Return only valid JSON.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = process.env.GEMINI_MODEL
      ? [process.env.GEMINI_MODEL, "gemini-3.5-flash", "gemini-3.7-flash", "gemini-3.5-flash-lite"]
      : ["gemini-3.5-flash", "gemini-3.7-flash", "gemini-3.5-flash-lite"];

    let rawResponse = "";
    let lastError: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
          },
        });
        const result = await model.generateContent(prompt);
        rawResponse = result.response.text();
        if (rawResponse) break;
      } catch (err) {
        console.warn(`Attempt with model ${modelName} failed, trying next fallback:`, err);
        lastError = err;
      }
    }

    if (!rawResponse) {
      throw lastError || new Error("Failed to generate response from AI models.");
    }

    const cleanedJsonString = cleanJsonResponse(rawResponse);

    let parsedFeedback;
    try {
      parsedFeedback = JSON.parse(cleanedJsonString);
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON output:", rawResponse);
      return NextResponse.json(
        { error: "AI response parsing error. Please try again." },
        { status: 500 }
      );
    }

    const overallScore = typeof parsedFeedback.overallScore === "number" ? parsedFeedback.overallScore : 70;

    resume.atsScore = overallScore;
    resume.feedback = parsedFeedback;
    await resume.save();

    return NextResponse.json({ resume, feedback: parsedFeedback });
  } catch (error: any) {
    console.error("Error in ATS analysis route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete resume analysis" },
      { status: 500 }
    );
  }
}
