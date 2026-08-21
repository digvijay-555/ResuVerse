"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { convertPdfToImage } from "@/lib/pdf2img";

interface FileUploaderProps {
  onFileSelect: (pdfFile: File | null, previewFile: File | null) => void;
}

export default function FileUploader({ onFileSelect }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];

      if (!file) return;

      if (file.type !== "application/pdf") {
        setError("Please upload a valid PDF file.");
        return;
      }

      setSelectedFile(file);
      setIsConverting(true);

      const result = await convertPdfToImage(file);
      setIsConverting(false);

      if (result.error) {
        console.warn("PDF preview warning:", result.error);
      }

      if (result.imageUrl) {
        setPreviewUrl(result.imageUrl);
      }

      onFileSelect(file, result.file);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: false,
  });

  return (
    <div className="w-full space-y-3">
      <div
        {...getRootProps()}
        className={`relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
          isDragActive
            ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20"
            : selectedFile
            ? "border-emerald-400 bg-emerald-50/20 dark:border-emerald-800 dark:bg-emerald-950/10"
            : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50/50 dark:border-gray-700 dark:hover:border-indigo-600 dark:hover:bg-gray-900/50"
        }`}
      >
        <input {...getInputProps()} />

        {isConverting ? (
          <div className="flex flex-col items-center space-y-2 py-4">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Generating resume preview thumbnail...
            </p>
          </div>
        ) : selectedFile ? (
          <div className="flex items-center gap-4 py-2">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="h-20 w-16 rounded-lg object-cover shadow-md border border-gray-200"
              />
            ) : (
              <div className="flex h-16 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 font-bold">
                <FileText className="h-8 w-8" />
              </div>
            )}
            <div className="text-left">
              <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span className="truncate max-w-[220px]">{selectedFile.name}</span>
              </div>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB PDF
              </p>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                Click or drag another file to replace
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Click to upload <span className="font-normal text-gray-500">or drag & drop</span>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">PDF file only (Max 10MB)</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
