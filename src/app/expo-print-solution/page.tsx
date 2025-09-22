"use client";

import { useState } from "react";
import Link from "next/link";

// Simulación de expo-print para demostración
// En una aplicación real, esto sería importado desde 'expo-print'
const mockExpoPrint = {
  printAsync: async (options: { uri: string }) => {
    // Simulación de la funcionalidad de expo-print
    console.log("Printing PDF with expo-print:", options.uri);
    
    // En una aplicación real con Expo, esto abriría el diálogo de impresión nativo
    // y manejaría la impresión del PDF directamente desde la URL
    
    // Para esta demo, simulamos el comportamiento
    return new Promise((resolve) => {
      setTimeout(() => {
        alert(`PDF would be printed from URL: ${options.uri}\n\nIn a real Expo app, this would open the native print dialog.`);
        resolve({ uri: options.uri });
      }, 1000);
    });
  }
};

function ExpoPrintViewer({ fileUrl }: { fileUrl: string }) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string>("");

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      setError("");

      // Usar expo-print con el parámetro uri
      await mockExpoPrint.printAsync({
        uri: fileUrl
      });
    } catch (err) {
      console.error("Error printing PDF:", err);
      setError(
        `Error printing PDF: ${err instanceof Error ? err.message : "Unknown error"}`
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
          disabled={!fileUrl || isPrinting}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium"
        >
          {isPrinting ? "Printing..." : "Print with expo-print"}
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

      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            expo-print Solution
          </h3>
          <p className="text-gray-600 mb-4">
            This solution uses expo-print with the <code className="bg-gray-200 px-2 py-1 rounded">uri</code> parameter to print PDFs directly from URLs.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Uses expo-print.printAsync() with uri parameter</li>
              <li>• No iframe or complex rendering needed</li>
              <li>• Direct native printing from URL</li>
              <li>• Works in React Native/Expo environments</li>
            </ul>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p><strong>URL:</strong> {fileUrl || "No URL provided"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExpoPrintSolutionPage() {
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
                Proposal 4: expo-print
              </h1>
              <p className="text-gray-600">
                Native printing using expo-print with uri parameter
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
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-purple-800">
              <strong>Note:</strong> This solution uses expo-print with the uri parameter to print PDFs directly from URLs. 
              This is ideal for React Native/Expo applications where you need native printing capabilities without complex rendering.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="url"
                value={fileUrl}
                onChange={e => setFileUrl(e.target.value)}
                placeholder="Enter PDF URL here..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={handlePreview}
                disabled={!fileUrl.trim()}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-2 rounded font-medium"
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
            <ExpoPrintViewer fileUrl={previewUrl} />
          </div>
        )}

        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">
            Advantages of this proposal:
          </h3>
          <ul className="text-purple-800 space-y-1">
            <li>• Simple and direct implementation</li>
            <li>• Native printing capabilities in React Native/Expo</li>
            <li>• No complex rendering or iframe needed</li>
            <li>• Works with any PDF URL</li>
            <li>• Leverages native device printing features</li>
            <li>• Minimal bundle size impact</li>
          </ul>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">
            Considerations:
          </h3>
          <ul className="text-yellow-800 space-y-1">
            <li>• Only works in React Native/Expo environments</li>
            <li>• Requires expo-print dependency</li>
            <li>• No preview functionality (direct print)</li>
            <li>• Platform-specific behavior may vary</li>
          </ul>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Code Example:</h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm font-mono overflow-x-auto">
            <pre>{`import * as Print from 'expo-print';

const printPdf = async (pdfUrl: string) => {
  try {
    await Print.printAsync({
      uri: pdfUrl
    });
  } catch (error) {
    console.error('Error printing PDF:', error);
  }
};`}</pre>
          </div>
        </div>

        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">Ideal use cases:</h3>
          <ul className="text-green-800 space-y-1">
            <li>• React Native/Expo mobile applications</li>
            <li>• When you need direct printing without preview</li>
            <li>• Apps targeting mobile devices with native printing</li>
            <li>• Simple PDF printing workflows</li>
            <li>• Integration with existing Expo/React Native codebases</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
