"use client";

import { useState } from "react";
import Link from "next/link";

// Componente para renderizar etiquetas HTML optimizadas para impresión
interface LabelData {
  recipient: {
    name: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  sender: {
    name: string;
    address: string;
  };
  weight: string;
  service: string;
  date: string;
  tracking: string;
}

function LabelPreview({ labelData }: { labelData: LabelData }) {
  const handlePrint = () => {
    // Crear una ventana de impresión optimizada para etiquetas
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiqueta de Envío</title>
          <style>
            @page {
              size: 4in 6in;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.2;
            }
            .label {
              width: 4in;
              height: 6in;
              padding: 8px;
              box-sizing: border-box;
              border: 1px solid #000;
              display: flex;
              flex-direction: column;
            }
            .header {
              text-align: center;
              font-weight: bold;
              font-size: 14px;
              margin-bottom: 8px;
              border-bottom: 1px solid #000;
              padding-bottom: 4px;
            }
            .section {
              margin-bottom: 6px;
            }
            .section-title {
              font-weight: bold;
              font-size: 10px;
              text-transform: uppercase;
              margin-bottom: 2px;
            }
            .address {
              font-size: 11px;
              line-height: 1.1;
            }
            .tracking {
              font-family: 'Courier New', monospace;
              font-size: 10px;
              background: #f0f0f0;
              padding: 2px 4px;
              border-radius: 2px;
            }
            .barcode {
              text-align: center;
              font-family: 'Courier New', monospace;
              font-size: 8px;
              margin: 4px 0;
            }
            .footer {
              margin-top: auto;
              text-align: center;
              font-size: 8px;
              color: #666;
            }
            @media print {
              body { margin: 0; }
              .label { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="header">ETIQUETA DE ENVÍO</div>
            
            <div class="section">
              <div class="section-title">Destinatario:</div>
              <div class="address">
                ${labelData.recipient.name}<br>
                ${labelData.recipient.address}<br>
                ${labelData.recipient.city}, ${labelData.recipient.state} ${
                  labelData.recipient.zip
                }
              </div>
            </div>

            <div class="section">
              <div class="section-title">Remitente:</div>
              <div class="address">
                ${labelData.sender.name}<br>
                ${labelData.sender.address}
              </div>
            </div>

            <div class="section">
              <div class="section-title">Información de Envío:</div>
              <div>Peso: ${labelData.weight} kg</div>
              <div>Servicio: ${labelData.service}</div>
              <div>Fecha: ${labelData.date}</div>
            </div>

            <div class="section">
              <div class="section-title">Tracking:</div>
              <div class="tracking">${labelData.tracking}</div>
            </div>

            <div class="barcode">
              ||| ${labelData.tracking} |||
            </div>

            <div class="footer">
              Generado el ${new Date().toLocaleString()}
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="h-96 flex flex-col">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">
          Vista Previa de Etiqueta
        </h3>
        <button
          onClick={handlePrint}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded font-medium"
        >
          Imprimir Etiqueta
        </button>
      </div>

      <div className="flex-1 p-4 bg-gray-100 flex items-center justify-center">
        <div className="bg-white border-2 border-dashed border-gray-300 p-4 text-center max-w-sm">
          <div className="text-sm text-gray-600 mb-2">
            Vista previa de etiqueta 4&quot;x6&quot;
          </div>
          <div className="text-xs text-gray-500">
            <div className="font-bold mb-2">ETIQUETA DE ENVÍO</div>
            <div className="text-left">
              <div>
                <strong>Destinatario:</strong>
              </div>
              <div>{labelData.recipient.name}</div>
              <div>{labelData.recipient.address}</div>
              <div>
                {labelData.recipient.city}, {labelData.recipient.state}
              </div>
              <div className="mt-2">
                <strong>Tracking:</strong>
              </div>
              <div className="font-mono bg-gray-200 px-2 py-1 rounded text-xs">
                {labelData.tracking}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HtmlPrintSolutionPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  // Datos de muestra para diferentes tipos de etiquetas
  const labelTemplates = [
    {
      id: "shipping",
      name: "Etiqueta de Envío",
      data: {
        recipient: {
          name: "Juan Pérez",
          address: "Calle Principal 123",
          city: "Madrid",
          state: "Madrid",
          zip: "28001",
        },
        sender: {
          name: "Mi Empresa S.L.",
          address: "Calle Comercial 456",
        },
        weight: "2.5",
        service: "Express",
        date: new Date().toLocaleDateString(),
        tracking: "ES123456789",
      },
    },
    {
      id: "inventory",
      name: "Etiqueta de Inventario",
      data: {
        recipient: {
          name: "Almacén Central",
          address: "Zona Industrial 789",
          city: "Barcelona",
          state: "Barcelona",
          zip: "08001",
        },
        sender: {
          name: "Proveedor ABC",
          address: "Polígono Industrial Norte",
        },
        weight: "1.2",
        service: "Estándar",
        date: new Date().toLocaleDateString(),
        tracking: "INV-2024-001",
      },
    },
    {
      id: "return",
      name: "Etiqueta de Devolución",
      data: {
        recipient: {
          name: "Centro de Devoluciones",
          address: "Calle Retorno 321",
          city: "Valencia",
          state: "Valencia",
          zip: "46001",
        },
        sender: {
          name: "Cliente: María García",
          address: "Calle Cliente 654",
        },
        weight: "0.8",
        service: "Devolución",
        date: new Date().toLocaleDateString(),
        tracking: "RET-2024-001",
      },
    },
  ];

  const selectedLabel = labelTemplates.find(t => t.id === selectedTemplate);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Propuesta 3: HTML-to-Print
              </h1>
              <p className="text-gray-600">
                Renderizado HTML optimizado para impresión térmica
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
            Seleccionar tipo de etiqueta
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {labelTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 border rounded-lg text-left hover:bg-gray-50 ${
                  selectedTemplate === template.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200"
                }`}
              >
                <div className="font-medium text-gray-900">{template.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Tracking: {template.data.tracking}
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedLabel && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <LabelPreview labelData={selectedLabel.data} />
          </div>
        )}

        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-2">
            Ventajas de esta propuesta:
          </h3>
          <ul className="text-purple-800 space-y-1">
            <li>• Optimizado para impresoras térmicas (4&quot;x6&quot;)</li>
            <li>• Control total sobre el diseño y layout</li>
            <li>• No requiere archivos PDF externos</li>
            <li>• Imprime nítido en impresoras térmicas</li>
            <li>• Fácil personalización de plantillas</li>
            <li>• Funciona perfectamente en PWAs</li>
          </ul>
        </div>

        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">
            Consideraciones:
          </h3>
          <ul className="text-yellow-800 space-y-1">
            <li>• Solo para contenido que se puede representar en HTML</li>
            <li>• Requiere diseño específico para cada tipo de etiqueta</li>
            <li>• No es adecuado para documentos complejos</li>
            <li>• Dependiente del CSS de impresión del navegador</li>
          </ul>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            Casos de uso ideales:
          </h3>
          <ul className="text-blue-800 space-y-1">
            <li>• Etiquetas de envío y paquetes</li>
            <li>• Etiquetas de inventario</li>
            <li>• Tickets y recibos</li>
            <li>• Códigos de barras y QR</li>
            <li>• Cualquier contenido que se imprima en formato pequeño</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
