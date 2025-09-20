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
        const res = await fetch(fileUrl, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch file");
        const blob = await res.blob(); // works for PDF/images
        url = URL.createObjectURL(blob);
        if (active) setBlobUrl(url);
      } catch (err) {
        if (active)
          setError(err instanceof Error ? err.message : "Error loading file");
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
    const i = iframeRef.current;
    if (i?.contentWindow) {
      i.contentWindow.print();
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{ padding: 8, display: "flex", gap: 8, alignItems: "center" }}
      >
        <button
          onClick={handlePrint}
          disabled={!blobUrl || loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium"
        >
          {loading ? "Cargando..." : "Imprimir"}
        </button>
        <Link
          href="/"
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium"
        >
          ← Volver
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded">
          Error: {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center flex-1">
          <div className="text-lg">Cargando archivo...</div>
        </div>
      )}

      {blobUrl && !loading && (
        <iframe
          ref={iframeRef}
          src={blobUrl}
          title="Preview"
          style={{ flex: 1, width: "100%", border: 0 }}
        />
      )}
    </div>
  );
}

export default function IframeSolutionPage() {
  const [selectedFile, setSelectedFile] = useState<string>("");

  // URLs de archivos de muestra
  const sampleFiles = [
    { name: "HTML de muestra", url: "/sample-files/sample.html" },
    { name: "Imagen SVG de muestra", url: "/sample-files/sample.svg" },
    { name: "Texto de muestra", url: "/sample-files/sample.txt" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Propuesta 1: iframe
              </h1>
              <p className="text-gray-600">
                Previsualización nativa usando iframe con blob URL
              </p>
            </div>
            <Link
              href="/"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Seleccionar archivo de muestra
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {sampleFiles.map(file => (
              <button
                key={file.url}
                onClick={() => setSelectedFile(file.url)}
                className={`p-4 border rounded-lg text-left hover:bg-gray-50 ${
                  selectedFile === file.url
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                <div className="font-medium text-gray-900">{file.name}</div>
                <div className="text-sm text-gray-500">{file.url}</div>
              </button>
            ))}
          </div>
        </div>

        {selectedFile && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">
                Previsualización: {selectedFile}
              </h3>
            </div>
            <InlinePreview fileUrl={selectedFile} />
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Ventajas de esta propuesta:
          </h3>
          <ul className="text-blue-800 space-y-1">
            <li>• Implementación simple y rápida</li>
            <li>• Funciona bien en Android/Chrome</li>
            <li>• No requiere librerías adicionales</li>
            <li>• Soporte nativo para PDFs e imágenes</li>
          </ul>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">
            Consideraciones:
          </h3>
          <ul className="text-yellow-800 space-y-1">
            <li>• En iOS/Safari PWA puede ser inconsistente</li>
            <li>
              • Algunas versiones requieren gesto del usuario para imprimir
            </li>
            <li>• Dependiente del visor nativo del navegador</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
