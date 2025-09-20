"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Import PDF.js only on client side
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjsLib: any = null;
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  pdfjsLib = require("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

// PDF loading strategies
const loadPdfDirectUrl = async (fileUrl: string) => {
  console.log("[pdfjsLib] Trying direct URL...");
  return await pdfjsLib.getDocument({
    url: fileUrl,
    withCredentials: false,
    httpHeaders: {
      Accept: "application/pdf",
    },
  }).promise;
};

const loadPdfWithFetch = async (fileUrl: string) => {
  console.log("[fetch] Trying fetch with credentials...");
  const response = await fetch(fileUrl, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return await pdfjsLib.getDocument({
    data: arrayBuffer,
  }).promise;
};

const loadPdfWithProxy = async (fileUrl: string) => {
  console.log("[proxy] Trying public CORS proxy...");
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(fileUrl)}`;
  const proxyResponse = await fetch(proxyUrl);

  if (!proxyResponse.ok) {
    throw new Error(
      `Proxy failed: ${proxyResponse.status} ${proxyResponse.statusText}`
    );
  }

  const arrayBuffer = await proxyResponse.arrayBuffer();
  return await pdfjsLib.getDocument({
    data: arrayBuffer,
  }).promise;
};

const loadPdfWithStrategies = async (fileUrl: string) => {
  const strategies = [
    { name: "Direct URL", fn: () => loadPdfDirectUrl(fileUrl) },
    { name: "Fetch", fn: () => loadPdfWithFetch(fileUrl) },
    { name: "Proxy", fn: () => loadPdfWithProxy(fileUrl) },
  ];

  for (const strategy of strategies) {
    try {
      console.log(`[${strategy.name}] Attempting to load PDF...`);
      const pdfDoc = await strategy.fn();
      debugger;
      console.log(`[${strategy.name}] PDF loaded successfully`);
      return pdfDoc;
    } catch (error) {
      debugger;
      console.error(`[${strategy.name}] Failed:`, error);
      if (strategy === strategies[strategies.length - 1]) {
        throw new Error("All loading strategies failed");
      }
    }
  }
};

function PdfJsViewer({ fileUrl }: { fileUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdf, setPdf] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPdf = async () => {
      if (!pdfjsLib) {
        setError("PDF.js is not available");
        return;
      }

      try {
        setLoading(true);
        setError("");

        // Try multiple strategies to load the PDF
        const pdfDoc = await loadPdfWithStrategies(fileUrl);

        if (cancelled) return;

        setPdf(pdfDoc);
        setTotalPages(pdfDoc.numPages);
        setError(""); // Clear any previous errors
        setCanvasReady(false);
      } catch (err) {
        if (!cancelled) {
          console.error("All PDF loading strategies failed:", err);
          setError(
            "Cannot load PDF due to CORS restrictions. Please try the iframe solution or use a CORS-enabled URL."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  // Separate useEffect to render the first page when PDF is loaded and canvas is available
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;

    const renderFirstPage = async () => {
      try {
        setCanvasReady(false);
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current;

        if (!canvas) {
          throw new Error("Canvas not available for rendering");
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Could not get 2D context from canvas");
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        setCanvasReady(true);
      } catch (error) {
        console.error("Error rendering first page:", error);
        setError(
          `Error rendering first page: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    };

    renderFirstPage();
  }, [pdf]); // This will run when pdf changes

  const renderPage = async (pageNum: number) => {
    if (!pdf) return;

    try {
      setCanvasReady(false);
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;

      if (!canvas) {
        throw new Error("Canvas not available for rendering");
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get 2D context from canvas");
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      setCurrentPage(pageNum);
      setCanvasReady(true);
    } catch (error) {
      console.error("Error rendering page:", error);
      setError(
        `Error rendering page: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const handlePrint = async () => {
    if (!pdf) return;

    setIsPrinting(true);

    try {
      // Create a new window for printing
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (!printWindow) {
        alert("Please allow popups to print this document.");
        setIsPrinting(false);
        return;
      }

      // Render all pages for printing
      const printCanvas = document.createElement("canvas");
      const printCtx = printCanvas.getContext("2d");
      if (!printCtx) {
        setIsPrinting(false);
        return;
      }

      let allPagesHTML = "";

      // Start with a loading message
      printWindow.document.write(`
        <html>
          <head>
            <title>Print PDF - ${totalPages} pages</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: Arial, sans-serif;
                text-align: center;
              }
              .loading { font-size: 18px; color: #666; }
              img { 
                max-width: 100%; 
                height: auto; 
                display: block;
                margin: 0 auto 20px auto;
                border: 1px solid #ddd;
              }
              @media print {
                body { padding: 0; }
                img { page-break-after: always; margin-bottom: 0; }
                img:last-child { page-break-after: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="loading">Preparing PDF for printing... (${totalPages} pages)</div>
          </body>
        </html>
      `);
      printWindow.document.close();

      // Render each page
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 }); // Good balance of quality and performance

        printCanvas.width = viewport.width;
        printCanvas.height = viewport.height;

        await page.render({
          canvasContext: printCtx,
          viewport: viewport,
        }).promise;

        // Convert canvas to image data URL
        const imageDataUrl = printCanvas.toDataURL("image/png");
        allPagesHTML += `<img src="${imageDataUrl}" alt="PDF Page ${pageNum}" />`;
      }

      // Update the window with all pages
      printWindow.document.write(`
        <html>
          <head>
            <title>Print PDF - ${totalPages} pages</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: Arial, sans-serif;
              }
              img { 
                max-width: 100%; 
                height: auto; 
                display: block;
                margin: 0 auto 20px auto;
                border: 1px solid #ddd;
              }
              @media print {
                body { padding: 0; }
                img { page-break-after: always; margin-bottom: 0; }
                img:last-child { page-break-after: avoid; }
              }
            </style>
          </head>
          <body>
            ${allPagesHTML}
            <script>
              // Auto-print after a short delay to ensure images are loaded
              setTimeout(function() {
                window.print();
              }, 1000);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error("Error printing PDF:", error);
      alert(
        "Error printing PDF: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-2 flex gap-2 items-center flex-wrap">
        <button
          onClick={handlePrint}
          disabled={!pdf || loading || isPrinting}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium"
        >
          {loading ? "Loading..." : isPrinting ? "Preparing print..." : "Print"}
        </button>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => renderPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-3 py-1 rounded text-sm"
            >
              ←
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => renderPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-3 py-1 rounded text-sm"
            >
              →
            </button>
          </div>
        )}

        <Link
          href="/"
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium"
        >
          ← Back
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded">
          Error: {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center flex-1">
          <div className="text-lg">Loading PDF...</div>
        </div>
      )}

      {pdf && !loading && (
        <div className="flex-1 overflow-auto flex justify-center">
          {!canvasReady && (
            <div className="flex items-center justify-center h-full">
              <div className="text-lg">Rendering PDF...</div>
            </div>
          )}
          <canvas
            ref={canvasRef}
            className={`${canvasReady ? "block" : "hidden"}`}
          />
        </div>
      )}
    </div>
  );
}

export default function PdfJsSolutionPage() {
  const [fileUrl, setFileUrl] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const defaultUrl =
    "https://pickpack-assets.s3.us-east-1.amazonaws.com/serverless/pnp/dev/printed-labels/packages/00bece1b-fa2d-4111-b9f2-e262db7064cd.pdf";

  const handlePreview = () => {
    if (fileUrl.trim()) {
      setPreviewUrl(fileUrl.trim());
    }
  };

  const handleUseDefault = () => {
    setFileUrl(defaultUrl);
    setPreviewUrl(defaultUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Proposal 2: PDF.js
              </h1>
              <p className="text-gray-600">
                Rendering with PDF.js for better control and consistency
              </p>
            </div>
            <Link
              href="/"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Enter PDF URL
          </h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-green-800">
              <strong>Note:</strong> This solution tries multiple strategies to
              load PDFs: direct URL, XMLHttpRequest download, fetch with
              no-cors, and public proxy. It should work with most URLs that work
              in your existing application.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="url"
                value={fileUrl}
                onChange={e => setFileUrl(e.target.value)}
                placeholder="Enter PDF URL here..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <button
                onClick={handlePreview}
                disabled={!fileUrl.trim()}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded font-medium"
              >
                Preview
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUseDefault}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium text-sm"
              >
                Use Sample PDF
              </button>
              <div className="text-sm text-gray-500 flex items-center">
                Sample: PickPack shipping label
              </div>
            </div>
          </div>
        </div>

        {previewUrl && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                Preview: {previewUrl}
              </h3>
            </div>
            <PdfJsViewer fileUrl={previewUrl} />
          </div>
        )}

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">
            Advantages of this proposal:
          </h3>
          <ul className="text-green-800 space-y-1">
            <li>• Works consistently in PWAs (iOS/Android)</li>
            <li>• Full control over user interface</li>
            <li>• Support for page navigation</li>
            <li>• Customizable zoom and controls</li>
            <li>• Not dependent on native browser viewer</li>
          </ul>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">
            Considerations:
          </h3>
          <ul className="text-yellow-800 space-y-1">
            <li>• Increases bundle size</li>
            <li>• Requires additional worker configuration</li>
            <li>• Only works with PDF files</li>
            <li>• Can be slower for large files</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
