"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Importar PDF.js solo en el cliente
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjsLib: any = null;
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  pdfjsLib = require("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
}

function PdfJsViewer({ fileUrl }: { fileUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdf, setPdf] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPdf = async () => {
      if (!pdfjsLib) {
        setError("PDF.js no está disponible");
        return;
      }

      try {
        setLoading(true);
        setError("");
        const pdfDoc = await pdfjsLib.getDocument({
          url: fileUrl,
          withCredentials: true,
        }).promise;

        if (cancelled) return;

        setPdf(pdfDoc);
        setTotalPages(pdfDoc.numPages);

        // Renderizar primera página
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error loading PDF");
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

  const renderPage = async (pageNum: number) => {
    if (!pdf) return;

    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: ctx, viewport, canvas }).promise;
      setCurrentPage(pageNum);
    } catch {
      setError("Error rendering page");
    }
  };

  const handlePrint = async () => {
    // Crear una ventana de impresión con el canvas
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir PDF</title>
          <style>
            body { margin: 0; padding: 20px; }
            img { max-width: 100%; height: auto; }
          </style>
        </head>
        <body>
          <img src="${canvas.toDataURL()}" alt="PDF Page" />
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: 8,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={handlePrint}
          disabled={!pdf || loading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium"
        >
          {loading ? "Cargando..." : "Imprimir"}
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
              Página {currentPage} de {totalPages}
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
          <div className="text-lg">Cargando PDF...</div>
        </div>
      )}

      {pdf && !loading && (
        <div
          style={{
            flex: 1,
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <canvas ref={canvasRef} />
        </div>
      )}
    </div>
  );
}

export default function PdfJsSolutionPage() {
  const [selectedFile, setSelectedFile] = useState<string>("");

  // URLs de archivos de muestra
  const sampleFiles = [
    { name: "HTML de muestra (como PDF)", url: "/sample-files/sample.html" },
    { name: "Texto de muestra (como PDF)", url: "/sample-files/sample.txt" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Propuesta 2: PDF.js
              </h1>
              <p className="text-gray-600">
                Renderizado con PDF.js para mayor control y consistencia
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
            Seleccionar archivo PDF
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {sampleFiles.map(file => (
              <button
                key={file.url}
                onClick={() => setSelectedFile(file.url)}
                className={`p-4 border rounded-lg text-left hover:bg-gray-50 ${
                  selectedFile === file.url
                    ? "border-green-500 bg-green-50"
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
            <PdfJsViewer fileUrl={selectedFile} />
          </div>
        )}

        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2">
            Ventajas de esta propuesta:
          </h3>
          <ul className="text-green-800 space-y-1">
            <li>• Funciona consistentemente en PWAs (iOS/Android)</li>
            <li>• Control total sobre la interfaz de usuario</li>
            <li>• Soporte para navegación entre páginas</li>
            <li>• Zoom y controles personalizables</li>
            <li>• No depende del visor nativo del navegador</li>
          </ul>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">
            Consideraciones:
          </h3>
          <ul className="text-yellow-800 space-y-1">
            <li>• Aumenta el tamaño del bundle</li>
            <li>• Requiere configuración adicional del worker</li>
            <li>• Solo funciona con archivos PDF</li>
            <li>• Puede ser más lento para archivos grandes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
