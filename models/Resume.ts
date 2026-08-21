import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeedbackTip {
  type: "good" | "improve";
  tip: string;
  explanation?: string;
}

export interface ICategoryFeedback {
  score: number;
  tips: IFeedbackTip[];
}

export interface IFeedback {
  overallScore: number;
  ATS: ICategoryFeedback;
  toneAndStyle: ICategoryFeedback;
  content: ICategoryFeedback;
  structure: ICategoryFeedback;
  skills: ICategoryFeedback;
}

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId | string;
  fileName: string;
  fileUrl: string;
  previewImageUrl: string;
  companyName?: string;
  jobTitle?: string;
  jobDescription?: string;
  atsScore?: number;
  feedback?: IFeedback;
  createdAt: Date;
  updatedAt: Date;
}

const TipSchema = new Schema<IFeedbackTip>(
  {
    type: { type: String, enum: ["good", "improve"], required: true },
    tip: { type: String, required: true },
    explanation: { type: String },
  },
  { _id: false }
);

const CategoryFeedbackSchema = new Schema<ICategoryFeedback>(
  {
    score: { type: Number, default: 0 },
    tips: [TipSchema],
  },
  { _id: false }
);

const FeedbackSchema = new Schema<IFeedback>(
  {
    overallScore: { type: Number, default: 0 },
    ATS: { type: CategoryFeedbackSchema },
    toneAndStyle: { type: CategoryFeedbackSchema },
    content: { type: CategoryFeedbackSchema },
    structure: { type: CategoryFeedbackSchema },
    skills: { type: CategoryFeedbackSchema },
  },
  { _id: false }
);

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    previewImageUrl: { type: String, required: true },
    companyName: { type: String, default: "" },
    jobTitle: { type: String, default: "" },
    jobDescription: { type: String, default: "" },
    atsScore: { type: Number, default: 0 },
    feedback: { type: FeedbackSchema, default: null },
  },
  { timestamps: true }
);

const Resume: Model<IResume> =
  mongoose.models.Resume || mongoose.model<IResume>("Resume", ResumeSchema);

export default Resume;
