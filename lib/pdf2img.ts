export interface PdfConversionResult {
  imageUrl: string;
  file: File | null;
  error?: string;
}

let pdfjsLib: any = null;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
  if (pdfjsLib) return pdfjsLib;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {

      const lib = await import("pdfjs-dist/build/pdf.mjs");
      if (typeof window !== "undefined") {
        lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      }
      pdfjsLib = lib;
      return lib;
    } catch (err) {
      console.warn("Local PDF.js worker load error, switching to CDN worker:", err);

      const lib = await import("pdfjs-dist");
      const version = lib.version || "4.10.38";
      lib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
      pdfjsLib = lib;
      return lib;
    }
  })();

  return loadPromise;
}

export async function convertPdfToImage(file: File): Promise<PdfConversionResult> {
  try {
    const lib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = lib.getDocument({
      data: new Uint8Array(arrayBuffer),
      cMapUrl: "https://unpkg.com/pdfjs-dist@4.10.38/cmaps/",
      cMapPacked: true,
    });

    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    if (!context) {
      throw new Error("Could not create canvas 2D rendering context");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    const renderTask = page.render({
      canvasContext: context,
      viewport: viewport,
    });

    await renderTask.promise;

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const originalName = file.name.replace(/\.pdf$/i, "");
            const imageFile = new File([blob], `${originalName}-preview.png`, {
              type: "image/png",
            });

            resolve({
              imageUrl: URL.createObjectURL(blob),
              file: imageFile,
            });
          } else {
            resolve({
              imageUrl: "",
              file: null,
              error: "Failed to generate blob from canvas",
            });
          }
        },
        "image/png",
        0.95
      );
    });
  } catch (err: any) {
    console.error("PDF to Image conversion error:", err);
    return {
      imageUrl: "",
      file: null,
      error: `Failed to convert PDF: ${err?.message || String(err)}`,
    };
  }
}
