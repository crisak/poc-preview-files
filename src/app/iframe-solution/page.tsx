"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Props = { fileUrl: string; autoPrint?: boolean };

function InlinePreview({ fileUrl }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [blobUrl, setBlobUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let active = true;
    let url: string;

    const fetchFile = async () => {
      try {
        setLoading(true);
        setError("");

        // Use XMLHttpRequest to download the file as bytes (similar to current app)
        const xhr = new XMLHttpRequest();
        xhr.open("GET", fileUrl, true);
        xhr.responseType = "blob";
        xhr.withCredentials = false;

        await new Promise((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status === 200) {
              const blob = xhr.response;
              url = URL.createObjectURL(blob);
              if (active) setBlobUrl(url);
              resolve(true);
            } else {
              reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
          };

          xhr.onerror = () => {
            reject(new Error("Network error occurred"));
          };

          xhr.ontimeout = () => {
            reject(new Error("Request timeout"));
          };

          xhr.timeout = 30000; // 30 seconds timeout
          xhr.send();
        });
      } catch (err) {
        if (active) {
          // Fallback: try with fetch and no-cors mode
          try {
            const response = await fetch(fileUrl, {
              mode: "no-cors",
              credentials: "omit",
            });

            if (response.type === "opaque") {
              // For opaque responses, we can't read the content but we can use the URL directly
              if (active) setBlobUrl(fileUrl);
            } else {
              const blob = await response.blob();
              url = URL.createObjectURL(blob);
              if (active) setBlobUrl(url);
            }
          } catch (fallbackErr) {
            setError(
              "Cannot load PDF due to CORS restrictions. Please try the PDF.js solution or use a CORS-enabled URL."
            );
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchFile();

    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [fileUrl]);

  const handlePrint = () => {
    try {
      const i = iframeRef.current;
      if (!i) {
        setError("Iframe not available for printing");
        return;
      }

      // Try different printing methods for better Android compatibility
      try {
        // Method 1: Direct iframe print (works on desktop)
        if (i.contentWindow) {
          i.contentWindow.print();
          return;
        }
      } catch (crossOriginError) {
        console.log(
          "Cross-origin print blocked, trying alternative method...",
          crossOriginError
        );
      }

      // Method 2: Open PDF in new window for printing (Android compatible)
      if (blobUrl) {
        const printWindow = window.open(
          blobUrl,
          "_blank",
          "width=800,height=600"
        );
        if (printWindow) {
          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
            }, 1000); // Wait for PDF to load
          };
        } else {
          setError("Please allow popups to print this document");
        }
      } else {
        setError("PDF not loaded yet");
      }
    } catch (error) {
      console.error("Error printing PDF:", error);
      setError(
        `Error printing PDF: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-2 flex gap-2 items-center">
        <button
          onClick={handlePrint}
          disabled={!blobUrl || loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium"
        >
          {loading ? "Loading..." : "Print"}
        </button>
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
          <div className="text-lg">Loading file...</div>
        </div>
      )}

      {blobUrl && !loading && (
        <iframe
          ref={iframeRef}
          src={blobUrl}
          title="Preview"
          className="flex-1 w-full border-0"
        />
      )}
    </div>
  );
}

export default function IframeSolutionPage() {
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
                Proposal 1: iframe
              </h1>
              <p className="text-gray-600">
                Native preview using iframe with blob URL
              </p>
            </div>
            <Link
              href="/"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium text-xs"
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This solution downloads the PDF as bytes
              using XMLHttpRequest, similar to your current app. It should work
              with most URLs that work in your existing application.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="url"
                value={fileUrl}
                onChange={e => setFileUrl(e.target.value)}
                placeholder="Enter PDF URL here..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handlePreview}
                disabled={!fileUrl.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded font-medium"
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
            <InlinePreview fileUrl={previewUrl} />
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Advantages of this proposal:
          </h3>
          <ul className="text-blue-800 space-y-1">
            <li>• Simple and fast implementation</li>
            <li>• Works well on Android/Chrome</li>
            <li>• No additional libraries required</li>
            <li>• Native support for PDFs and images</li>
          </ul>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">
            Considerations:
          </h3>
          <ul className="text-yellow-800 space-y-1">
            <li>• Inconsistent on iOS/Safari PWA</li>
            <li>• Some versions require user gesture to print</li>
            <li>• Dependent on native browser viewer</li>
            {/* Algunos no es posible previsualizar el PDF cuando se instala la app */}
            <li>
              • Some browsers don't allow inline preview when the app is
              installed(PWAs)
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
