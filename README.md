# ResuVerse

> AI-powered resume analyzer and ATS score evaluator tailored to specific job targets.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green?logo=mongodb)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-API-orange?logo=google)](https://ai.google.dev/)

---

## 📌 Overview

**ResuVerse** is an open-source, full-stack application designed to help job seekers optimize their resumes for Applicant Tracking Systems (ATS) and hiring teams. By comparing uploaded PDF resumes directly against specific job titles, companies, and role descriptions, ResuVerse leverages the Google Gemini API to generate contextual match scores and granular, actionable feedback. It eliminates the guesswork from job applications, empowering candidates to identify and resolve weaknesses in tone, content depth, structure, and keyword alignment before submitting applications.

---

## 🔗 Live Demo

- **Live Application**: [https://resuverse.vercel.app](https://resuverse.vercel.app) *(demo placeholder)*

---

## ✨ Key Features

- **Targeted AI ATS Evaluation**: Evaluates resumes against specific target job descriptions and roles to provide an overall ATS compatibility score (0–100).
- **Multi-Dimensional Category Breakdown**: Delivers score gauges and actionable recommendations across 4 critical pillars:
  - *Tone & Style*: Professionalism, voice, and stylistic consistency.
  - *Content Quality*: Impact metrics, bullet point clarity, and relevance.
  - *Structure & Formatting*: Readability, section hierarchy, and scan-friendliness.
  - *Core Skills & Keywords*: Alignment with target qualifications and industry terminology.
- **Client-Side PDF Preview Rendering**: Generates instant first-page image previews directly in the browser via `pdfjs-dist` for immediate visual confirmation upon upload.
- **Centralized Resume Management**: Dashboard to track multiple tailored resumes, review historical feedback, and jump into detailed scorecards.
- **Secure Multi-Provider Authentication**: NextAuth.js authentication with email/password credentials (bcrypt encryption) and optional Google OAuth integration.
- **Data Privacy & One-Click Data Wipe**: Complete control over your personal data with the ability to delete individual resumes or wipe all records and files from the server with a single action.

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) | Full-stack React framework with server-side rendering & route handlers |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type safety across client components, models, and API routes |
| **Styling & UI** | [Tailwind CSS](https://tailwindcss.com/) + custom UI | Responsive styling, component primitives, and dark-mode aesthetic |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | Smooth page transitions and animated ATS score gauges |
| **Database** | [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/) | Persistent document storage for user accounts and resume records |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) | Session management, Credentials provider, and optional Google OAuth |
| **AI Analysis** | [Google Gemini API](https://ai.google.dev/) (`@google/generative-ai`) | Contextual resume analysis and structured JSON score generation |
| **PDF Processing** | `pdfjs-dist` & `pdf-parse` | In-browser canvas thumbnail rendering and server-side text extraction |
| **Deployment** | [Vercel](https://vercel.com/) | Serverless hosting and continuous deployment pipeline |

---

## 🏗️ Architecture Overview

ResuVerse follows a modular full-stack architecture built on the Next.js App Router:

```
[ Client Browser ]
       │  (Uploads PDF & Target Job Info)
       ▼
[ Next.js App Router ] ──► [ Client-Side `pdfjs-dist` ] ──► Generates Thumbnail Preview
       │
       ├─► [ NextAuth.js ] ──► Session validation & access control
       │
       ├─► [ Route Handlers: /api/resumes ] ──► Stores PDF & creates Mongo document
       │
       ├─► [ Route Handlers: /api/analyze ]
       │         │
       │         ├─► [ pdf-parse ] ──► Extracts text from uploaded PDF
       │         └─► [ Google Gemini API ] ──► Prompts AI for ATS scoring & categorized tips
       │
       └─► [ MongoDB / Mongoose ] ──► Persists User & Resume models with score schema
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed and configured before running locally:
- **Node.js**: `v18.17.0` or higher
- **npm** / **yarn** / **pnpm**
- **MongoDB**: A running local MongoDB instance (`mongodb://localhost:27017`) or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI
- **Google Gemini API Key**: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/)

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Neelesh19634/ResuVerse.git
   cd ResuVerse
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

---

### Environment Variables

| Variable | Description | Required |
| :--- | :--- | :---: |
| `MONGODB_URI` | MongoDB connection URI (e.g. `mongodb://127.0.0.1:27017/resu-verse`) | **Yes** |
| `NEXTAUTH_SECRET` | 32-byte random string used to encrypt session tokens (`openssl rand -base64 32`) | **Yes** |
| `NEXTAUTH_URL` | Canonical application URL (`http://localhost:3000` for development) | **Yes** |
| `GEMINI_API_KEY` | API key from Google AI Studio for Gemini model calls | **Yes** |
| `GEMINI_MODEL` | Specific Gemini model identifier (e.g. `gemini-1.5-flash` or `gemini-2.0-flash`) | No |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID for social sign-in | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret for social sign-in | No |

---

### Running Locally

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📡 API Routes

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user with name, email, and password |
| `GET` / `POST` | `/api/auth/[...nextauth]` | NextAuth.js authentication handler (Credentials & OAuth) |
| `GET` | `/api/resumes` | Retrieve all resumes and analysis scores for the active user |
| `POST` | `/api/resumes` | Upload a PDF resume, store thumbnail preview, and save metadata |
| `GET` | `/api/resumes/[id]` | Fetch a single resume record with full ATS breakdown feedback |
| `DELETE` | `/api/resumes/[id]` | Delete a specific resume record and its associated files from disk |
| `POST` | `/api/analyze` | Run Gemini AI ATS scoring & feedback generation for a resume |
| `DELETE` | `/api/wipe` | Wipe all uploaded files and resume records for the active user |

---

## 📂 Folder Structure

```
ResuVerse/
├── app/
│   ├── api/
│   │   ├── analyze/          # Gemini AI analysis route handler
│   │   ├── auth/             # Registration & NextAuth API handlers
│   │   ├── resumes/          # Resume CRUD routes & dynamic [id] route
│   │   └── wipe/             # User data & disk cleanup route
│   ├── auth/                 # Login and Register pages
│   ├── resume/[id]/          # Detailed ATS feedback scorecard view
│   ├── settings/             # User preferences & data wipe settings
│   ├── upload/               # Resume upload & job criteria form
│   ├── globals.css           # Tailwind base styles and CSS variables
│   ├── layout.tsx            # Root layout with SessionProvider & Navbar
│   └── page.tsx              # Application dashboard & landing view
├── components/
│   ├── ui/                   # Reusable UI primitives (buttons, dialogs, inputs)
│   ├── ATSSection.tsx        # ATS score progress display
│   ├── CategoryAccordion.tsx # Expandable feedback section component
│   ├── FileUploader.tsx      # Drag-and-drop resume upload zone
│   ├── Navbar.tsx            # Navigation header with user profile menu
│   ├── Providers.tsx         # NextAuth SessionProvider wrapper
│   ├── ScoreBadge.tsx        # Color-coded ATS score indicator badge
│   ├── ScoreGauge.tsx        # Animated circular score meter
│   └── Summary.tsx           # High-level resume assessment overview
├── lib/
│   ├── auth.ts               # NextAuth configuration and providers
│   ├── db.ts                 # Mongoose connection caching utility
│   ├── mongodb.ts            # MongoDB client promise for NextAuth adapter
│   ├── pdf2img.ts            # Client-side PDF first-page canvas renderer
│   └── utils.ts              # Class name merge utilities (clsx/tailwind-merge)
├── models/
│   ├── Resume.ts             # Mongoose schema for resumes & feedback
│   └── User.ts               # Mongoose schema for user accounts
└── public/
    ├── icons/                # UI and status SVG icons
    ├── images/               # Illustration assets and background graphics
    ├── pdf.worker.min.mjs    # pdfjs-dist worker bundle
    └── uploads/              # Local server upload directory
```

---

## 🗺️ Roadmap

- [ ] **Cloud Object Storage**: Transition file handling from local disk to AWS S3 / Cloudflare R2 for stateless production scalability.
- [ ] **Resume Version History**: Track iterative changes to a resume over time and compare score trajectories.
- [ ] **Multi-Resume Comparison**: Compare multiple resumes side-by-side against the same target job description.
- [ ] **AI-Powered Bullet Optimizer**: In-line suggestions to automatically rewrite underperforming bullet points using action-driven frameworks (STAR / XYZ).
- [ ] **Exportable Report**: Download detailed PDF analysis reports to share with career coaches or mentors.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👤 Author

- **GitHub**: [@Neelesh19634](https://github.com/Neelesh19634)
- **Project Repository**: [ResuVerse](https://github.com/Neelesh19634/ResuVerse)
